// 雲端同步狀態小膠囊 — 顯示在手機 header 右上角
function SyncBadge({ T }) {
  const [s, setS] = React.useState(window.SyncStatus ? window.SyncStatus.get() : { state: "idle" });
  React.useEffect(() => {
    if (!window.SyncStatus) return;
    return window.SyncStatus.subscribe((st) => setS({ ...st }));
  }, []);

  const palette = {
    idle:    { dot: "#cfcab6", text: T.muted, label: "未連線" },
    syncing: { dot: "#c8a96a", text: T.muted, label: "同步中" },
    pending: { dot: "#c8a96a", text: T.muted, label: "等待上傳" },
    synced:  { dot: "#7a9b6e", text: T.muted, label: "已同步" },
    offline: { dot: "#c08071", text: T.muted, label: "離線" },
  };
  const p = palette[s.state] || palette.idle;

  const onTap = () => {
    if (window.SyncStatus) window.SyncStatus.forcePull();
  };

  return (
    <button
      onClick={onTap}
      title={s.message || p.label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px 5px 8px",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid rgba(58,46,38,0.08)",
        borderRadius: 999,
        font: "500 11px/1 'Noto Sans TC', sans-serif",
        color: p.text, cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: p.dot,
        animation: (s.state === "syncing" || s.state === "pending") ? "syncPulse 1.2s ease-in-out infinite" : "none",
      }} />
      <span>{p.label}</span>
      <style>{`@keyframes syncPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
    </button>
  );
}

window.SyncBadge = SyncBadge;
