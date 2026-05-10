// Bottom-sheet style modals for Variant D
// 對齊原始 UI: 底部彈出 + 5 場地 + 4 種收費 chip + 每位學生人數
const { useState: useStateMod } = React;

const T = {
  bg: "#f6f3ee", surface: "#ffffff", primary: "#8b9587",
  primaryDeep: "#6e7a68",
  primarySoft: "#e1e5dc", accent: "#b89e8b", accentSoft: "#ece2d7",
  border: "#ebe6dc", borderSoft: "#f2eee5", inkSoft: "#a39e96",
  ink: "#1f1d1a", danger: "#a87878", blushSoft: "#ecdfdf",
};

// Use dynamic venue colors from settings-variant-d.jsx
function getVenueColorM(name) {
  return window.getVenueColor ? window.getVenueColor(name) : { bg: "#ebe6dc", fg: "#7a756d" };
}

// ====== 背景: 縮略主畫面 (用來襯托 bottom sheet) ======
function BackdropList() {
  const items = [
    { date: "2026/05/05", loc: "園頂", who: "樹慧、Claire (4人)", amt: "$1,420" },
    { date: "2026/05/04", loc: "到府", who: "Krystal (2人)", amt: "$2,000" },
    { date: "2026/05/04", loc: "包班", who: "3 人", amt: "$2,000" },
    { date: "2026/05/04", loc: "到府", who: "Krystal (1人)", amt: "$1,500" },
  ];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: T.bg, color: T.ink, opacity: 0.55,
      fontFamily: "'Noto Sans TC', sans-serif", overflow: "hidden",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ background: T.bg, padding: "8px 22px 14px" }}>
        <div style={{ fontSize: 11, color: T.inkSoft, letterSpacing: 2 }}>MAY · 2026</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginTop: 2 }}>Hi, Vivian</div>
      </div>
      <div style={{ padding: "10px 16px", display: "flex", gap: 6 }}>
        {["上課記錄", "儲值記錄", "學生管理", "收入記錄"].map((t, i) => (
          <div key={i} style={{
            flex: 1, padding: "9px 0", borderRadius: 999, textAlign: "center",
            background: i === 0 ? T.primary : "transparent",
            color: i === 0 ? T.surface : T.inkSoft,
            fontSize: 12, fontWeight: i === 0 ? 600 : 500
          }}>{t}</div>
        ))}
      </div>