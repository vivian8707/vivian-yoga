// Google Apps Script cloud sync layer.
// 行為：
//   1) 啟動時從雲端讀最新 → 覆蓋 localStorage → 重渲染
//   2) 每次 store.commit() 之後 debounce 1.2s 上傳
//   3) 透過 window.SyncStatus.set(...) 廣播狀態,讓 UI 顯示
//   4) 視窗 focus 或恢復連線時自動拉一次

(function () {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby-TYIyBNFa51N4NzYGhkO5YUpRw0eVmzgRzEaDdLYO2S-px5tW3QscX36XU7K5e8dA0A/exec";
  const KEY = "vyc.v1";
  const DEBOUNCE_MS = 1200;
  const POLL_MS = 30000; // 每 30 秒輪詢一次

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
    forcePull: () => pullNow(),
  };

  // --- Network ---
  async function pullNow() {
    // 本地有待上傳的變更時，不以雲端舊資料覆蓋，避免新增記錄瞬間消失
    if (hasPendingChanges || pushing) return;
    setStatus("syncing", "下載最新資料…");
    try {
      const res = await fetch(ENDPOINT, { method: "GET", redirect: "follow" });
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
  function schedulePush(delay) {
    clearTimeout(pushTimer);
    hasPendingChanges = true;
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

    // 包裝 commit:在原本 commit() 之後 schedulePush
    // store.js 沒 export commit,所以走 subscribe 方式
    let firstChange = true;
    window.Store.subscribe(() => {
      // pullNow 觸發的 reload 也會 emit,但那次不該 push
      if (window.__syncSilent) return;
      if (firstChange) { firstChange = false; }
      schedulePush();
    });

    // 啟動時拉一次
    pullNow();

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
