// Google Apps Script cloud sync layer.
// 行為：
//   1) 啟動時從雲端讀最新 → 覆蓋 localStorage → 重渲染
//   2) 每次 store.commit() 之後 debounce 1.2s 上傳
//   3) 透過 window.SyncStatus.set(...) 廣播狀態,讓 UI 顯示
//   4) 視窗 focus 或恢復連線時自動拉一次
//   5) 「待上傳」旗標存入 localStorage，App 重開時先 push 再 pull，防止記錄消失

(function () {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby-TYIyBNFa51N4NzYGhkO5YUpRw0eVmzgRzEaDdLYO2S-px5tW3QscX36XU7K5e8dA0A/exec";
  const KEY = "vyc.v1";
  const DIRTY_KEY = "vyc.dirty";       // 跨 App 重啟的待上傳旗標
  const LAST_PUSH_KEY = "vyc.lastPush"; // 最後成功 push 的時間戳記（跨重啟）
  const DEBOUNCE_MS = 1200;
  const POLL_MS = 30000;   // 每 30 秒輪詢一次
  const PUSH_GUARD_MS = 60000; // push 完成後 60 秒內不 pull，讓 cloud 有時間處理

  // --- Status broadcaster ---
  const statusListeners = new Set();
  const status = { state: "idle", message: "", lastSync: null };
  function setStatus(state, message) {
    status.state = state;
    status.message = message || "";
    if (state === "synced") status.lastSync = new Date();
    statusListeners.forEach(fn => { try { fn(status); } catch (e) {} });
  }
  window.SyncStatus = {
    get: () => status,
    subscribe(fn) { statusListeners.add(fn); fn(status); return () => statusListeners.delete(fn); },
    forcePush: () => schedulePush(0),
    forcePull: () => pullNow(true),
  };

  // --- Network ---
  async function pullNow(force) {
    // 本地有待上傳的變更時，或 push 剛完成不久，不以雲端舊資料覆蓋
    if (hasPendingChanges || pushing) return;
    if (!force && Date.now() - lastPushTime < PUSH_GUARD_MS) return;
    setStatus("syncing", "下載最新資料…");
    try {
      const res = await fetch(ENDPOINT + "?t=" + Date.now(), { method: "GET", redirect: "follow", cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.students || !data.records) {
        // 雲端是空的 — 把目前本機資料推上去當第一份
        setStatus("syncing", "首次同步,上傳本機資料…");
        await pushNow();
        setStatus("synced", "已同步");
        return;
      }
      // fetch 期間若產生新的本地變更，同樣不覆蓋
      if (hasPendingChanges || pushing) {
        setStatus("synced", "已同步");
        return;
      }
      // 寫入 localStorage 並讓 store 重新載入
      localStorage.setItem(KEY, JSON.stringify(data));
      if (window.Store && window.Store._reload) window.Store._reload();
      setStatus("synced", "已同步");
    } catch (err) {
      console.warn("[sync] pull failed", err);
      setStatus("offline", "離線(用本機資料)");
    }
  }

  let pushTimer = null;
  let pushing = false;
  let hasPendingChanges = false;
  // 從 localStorage 恢復，讓 push guard 跨 App 重啟仍然有效
  let lastPushTime = parseInt(localStorage.getItem(LAST_PUSH_KEY) || "0");

  function schedulePush(delay) {
    clearTimeout(pushTimer);
    hasPendingChanges = true;
    // 將待上傳旗標持久化，確保 App 重啟後也能偵測到
    try { localStorage.setItem(DIRTY_KEY, "1"); } catch (e) {}
    setStatus("pending", "等待上傳…");
    pushTimer = setTimeout(pushNow, delay == null ? DEBOUNCE_MS : delay);
  }

  async function pushNow() {
    if (pushing) { schedulePush(500); return; }
    pushing = true;
    hasPendingChanges = false;
    setStatus("syncing", "上傳中…");
    try {
      const raw = localStorage.getItem(KEY) || "{}";
      // Apps Script doPost 用 text/plain 比較不會被 CORS preflight 擋
      await fetch(ENDPOINT, {
        method: "POST",
        body: raw,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        redirect: "follow",
      });
      lastPushTime = Date.now();
      try { localStorage.setItem(LAST_PUSH_KEY, String(lastPushTime)); } catch (e) {}
      try { localStorage.removeItem(DIRTY_KEY); } catch (e) {}
      setStatus("synced", "已同步");
    } catch (err) {
      console.warn("[sync] push failed", err);
      hasPendingChanges = true;
      setStatus("offline", "上傳失敗,稍後重試");
      // 5 秒後重試
      setTimeout(() => schedulePush(0), 5000);
    } finally {
      pushing = false;
    }
  }

  // --- Hook into Store ---
  function attach() {
    if (!window.Store) { setTimeout(attach, 50); return; }

    // 每次 store commit 後觸發 push（pull 觸發的 _reload 已由 __syncSilent 過濾）
    window.Store.subscribe(() => {
      if (window.__syncSilent) return;
      schedulePush();
    });

    // App 切到背景時立刻 push，防止 debounce 還沒到就被系統中止
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && hasPendingChanges) {
        clearTimeout(pushTimer);
        pushNow();
      }
    });

    // 啟動時：若上次有未完成的 push，先推再拉
    const wasDirty = localStorage.getItem(DIRTY_KEY);
    if (wasDirty) {
      hasPendingChanges = true;
      pushNow().then(() => pullNow());
    } else {
      pullNow();
    }

    // 視窗 focus / 連線恢復:再拉一次
    window.addEventListener("focus", () => { pullNow(); });
    window.addEventListener("online", () => { pullNow(); });

    // 輪詢
    setInterval(() => {
      if (document.visibilityState === "visible") pullNow();
    }, POLL_MS);
  }
  attach();
})();
