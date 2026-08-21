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
  const PUSH_GUARD_MS = 10000; // push 完成後 10 秒內不 pull，讓 cloud 有時間處理

  // --- 診斷資訊（點同步膠囊可顯示）---
  const dbg = { ver: "33", pull: null, push: null };
  window.__SYNC_DEBUG = dbg;
  function now() { return new Date().toTimeString().slice(0, 8); }

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
    if (hasPendingChanges || pushing) { dbg.pull = { at: now(), skip: "pending/pushing" }; return; }
    if (!force && Date.now() - lastPushTime < PUSH_GUARD_MS) { dbg.pull = { at: now(), skip: "push-guard" }; return; }
    setStatus("syncing", "下載最新資料…");
    try {
      const res = await fetch(ENDPOINT + "?t=" + Date.now(), { method: "GET", redirect: "follow", cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.students || !data.records) {
        // 雲端是空的 — 把目前本機資料推上去當第一份
        dbg.pull = { at: now(), cloud: "empty", willPush: true };
        setStatus("syncing", "首次同步,上傳本機資料…");
        await pushNow();
        setStatus("synced", "已同步");
        return;
      }
      // fetch 期間若產生新的本地變更，同樣不覆蓋
      if (hasPendingChanges || pushing) {
        dbg.pull = { at: now(), skip: "changed-during-fetch" };
        setStatus("synced", "已同步");
        return;
      }
      // 合併：取本機與雲端的聯集（以 id 為鍵），確保本機新增記錄不被舊雲端資料覆蓋
      try {
        const local = JSON.parse(localStorage.getItem(KEY) || "{}");
        function mergeById(localArr, cloudArr) {
          const cloudIds = new Set((cloudArr || []).map(x => x.id));
          return [...(cloudArr || []), ...(localArr || []).filter(x => !cloudIds.has(x.id))];
        }
        const mergedRecords  = mergeById(local.records,     data.records);
        const mergedStudents = mergeById(local.students,     data.students);
        const mergedPlans    = mergeById(local.customPlans,  data.customPlans  || []);
        const mergedGroups   = mergeById(local.classGroups,  data.classGroups  || []);
        const hadLocalOnly   = mergedRecords.length  > (data.records  || []).length ||
                               mergedStudents.length > (data.students || []).length;
        const merged = { ...data, records: mergedRecords, students: mergedStudents,
                         customPlans: mergedPlans, classGroups: mergedGroups };
        dbg.pull = { at: now(), cloudRecs: (data.records || []).length, localRecs: (local.records || []).length,
                     mergedRecs: mergedRecords.length, localOnly: mergedRecords.length - (data.records || []).length,
                     force: !!force, willPush: !force && hadLocalOnly };
        localStorage.setItem(KEY, JSON.stringify(merged));
        if (window.Store && window.Store._reload) window.Store._reload();
        if (!force && hadLocalOnly) { schedulePush(0); return; } // 把本機多出的資料推回雲端
      } catch (e) {
        // merge 失敗：保留本機資料不動（不可用雲端舊資料覆蓋本機）
        dbg.pull = { at: now(), mergeError: String(e).slice(0, 180) };
      }
      setStatus("synced", "已同步");
    } catch (err) {
      console.warn("[sync] pull failed", err);
      dbg.pull = { at: now(), error: String(err).slice(0, 180) };
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
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: raw,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        redirect: "follow",
      });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}
      // doPost 應回傳 { ok: true, savedAt: ... }；若拿到別的內容（例如被導向 doGet
      // 回傳的資料本身），代表 POST 實際上沒有寫入，視為失敗，避免顯示假的「已同步」
      if (!res.ok || !json || json.ok !== true) {
        throw new Error("push 未被伺服器確認: HTTP " + res.status + " body=" + text.slice(0, 200));
      }
      dbg.push = { at: now(), ok: true, bytes: raw.length, savedAt: json.savedAt || null };
      lastPushTime = Date.now();
      try { localStorage.setItem(LAST_PUSH_KEY, String(lastPushTime)); } catch (e) {}
      try { localStorage.removeItem(DIRTY_KEY); } catch (e) {}
      setStatus("synced", "已同步");
    } catch (err) {
      console.warn("[sync] push failed", err);
      dbg.push = { at: now(), ok: false, error: String(err && err.message || err).slice(0, 220) };
      hasPendingChanges = true;
      setStatus("offline", "上傳失敗: " + (err && err.message ? err.message : "稍後重試"));
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
