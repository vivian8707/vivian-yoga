// Variant D: A 結構 + C 色系 + 地點 badge 底色 + 綠色 FAB + 展開/收合
const { useState: useStateD } = React;

const D_TOKENS = {
  bg: "#f6f3ee",
  surface: "#ffffff",
  card: "#fbf9f5",
  ink: "#1f1d1a",
  inkSoft: "#a39e96",
  primary: "#8b9587",
  primarySoft: "#e1e5dc",
  accent: "#b89e8b",
  accentSoft: "#ece2d7",
  blush: "#c2a5a5",
  blushSoft: "#ecdfdf",
  haze: "#a8b1bd",
  hazeSoft: "#dee2e8",
  border: "#ebe6dc",
  borderSoft: "#f2eee5",
  danger: "#a87878"
};

// Palette for up to 8 venues, indexed by colorIndex
const VENUE_PALETTE = [
  { bg: "#e1e5dc", fg: "#5b6650" },
  { bg: "#ecdfdf", fg: "#7c5e5e" },
  { bg: "#dee2e8", fg: "#5d6776" },
  { bg: "#ece2d7", fg: "#7a624e" },
  { bg: "#e8e0ec", fg: "#6e5e7a" },
  { bg: "#dce8e4", fg: "#4d6e66" },
  { bg: "#ece8dc", fg: "#7a6e4e" },
  { bg: "#e8dce0", fg: "#7a5e66" },
];
window.VENUE_PALETTE = VENUE_PALETTE;

function getVenueColor(name) {
  const venues = window.Store ? (window.Store.getState().settings || {}).venues : null;
  const list = venues || window.DEFAULT_VENUES || [];
  const v = list.find(v => v.name === name);
  if (v) return VENUE_PALETTE[v.colorIndex % VENUE_PALETTE.length] || VENUE_PALETTE[0];
  return { bg: "#ebe6dc", fg: "#7a756d" };
}
window.getVenueColor = getVenueColor;

// Legacy alias
const D_LOC = new Proxy({}, { get(_, name) { return getVenueColor(name); } });

// 月份 → 季節字
const SEASON_CHAR = (m) => {
  if (m >= 3 && m <= 5) return "春";
  if (m >= 6 && m <= 8) return "夏";
  if (m >= 9 && m <= 11) return "秋";
  return "冬";
};

function MonthCard({ T, year, monthNum, income, lessons, variant = "split" }) {
  const SerifMonth = ({ size = 30, yearSize = 20 }) => (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 6,
      color: T.primary, fontFamily: "'Cormorant Garamond', serif"
    }}>
      <span style={{ fontSize: yearSize, fontWeight: 500, letterSpacing: 0.5, opacity: 0.85 }}>{year}</span>
      <span style={{ fontSize: yearSize * 0.8, opacity: 0.4 }}>/</span>
      <span style={{ fontSize: size, fontWeight: 700 }}>{monthNum}</span>
      <span style={{ fontSize: Math.round(size * 0.45), fontWeight: 500, opacity: 0.75, marginLeft: -2 }}>月</span>
    </div>
  );
  const Money = ({ size = 32, color = T.ink }) => (
    <span style={{
      fontSize: size, fontWeight: 700, letterSpacing: 0.3,
      fontFamily: "'Cormorant Garamond', 'Noto Sans TC', serif", lineHeight: 1, color
    }}>{'$'}{income.toLocaleString()}</span>
  );

  if (variant === "split" || variant === "split-3col" || variant === "split-stack" || variant === "split-bottom-date" ||
      variant === "split-rule" || variant === "split-tiles" || variant === "split-monogram" ||
      variant === "split-receipt" || variant === "split-stamp") {
    // 共用容器
    const Wrap = ({ children }) => (
      <div style={{
        background: T.surface, borderRadius: 24,
        padding: "26px 26px 28px", border: `1px solid ${T.borderSoft}`,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 4, background: T.primary, opacity: 0.5
        }} />
        {children}
      </div>
    );
    const Label = ({ children, align = "left" }) => (
      <div style={{
        fontSize: 10, color: T.inkSoft, letterSpacing: 1, marginBottom: 4, textAlign: align
      }}>{children}</div>
    );
    const BigLessons = ({ size = 56 }) => (
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{
          fontSize: size, fontWeight: 700, color: T.accent,
          fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
        }}>{lessons}</span>
        <span style={{ fontSize: Math.round(size * 0.25), color: T.inkSoft }}>堂</span>
      </div>
    );

    // ── split: 月在左、$收入(斜線左上) + 堂數(斜線右下) ──
    if (variant === "split") {
      return (
        <Wrap>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <SerifMonth size={34} yearSize={22} />
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              gridTemplateRows: "auto auto",
              alignItems: "center"
            }}>
              {/* $6,880 在左上 */}
              <div style={{ gridColumn: 1, gridRow: 1, paddingRight: 4, paddingBottom: 2 }}>
                <Money size={32} color={T.primary} />
              </div>
              {/* 大斜線跨 2x2 */}
              <div style={{
                gridColumn: 2, gridRow: "1 / 3",
                fontSize: 64, color: T.borderSoft, fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 200, lineHeight: 1, padding: "0 4px"
              }}>/</div>
              {/* 14堂 在右下 */}
              <div style={{ gridColumn: 3, gridRow: 2, paddingLeft: 4, paddingTop: 2 }}>
                <BigLessons size={28} />
              </div>
            </div>
          </div>
        </Wrap>
      );
    }

    // ── split-3col: 收入(左) · 堂數(中) · 月份(右) ──
    if (variant === "split-3col") {
      return (
        <Wrap>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center", gap: 16
          }}>
            <div>
              <Money size={24} color={T.primary} />
            </div>
            <div style={{ textAlign: "center" }}>
              <BigLessons size={48} />
            </div>
            <div style={{ textAlign: "right" }}>
              <SerifMonth size={24} yearSize={14} />
            </div>
          </div>
        </Wrap>
      );
    }

    // ── split-stack: 月份(頂)+ 收入 / 堂數 兩欄 ──
    if (variant === "split-stack") {
      return (
        <Wrap>
          <SerifMonth />
          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${T.borderSoft}`,
            display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 16, alignItems: "center"
          }}>
            <Money size={24} color={T.primary} />
            <div style={{ background: T.borderSoft, height: 36 }} />
            <div style={{ textAlign: "right" }}>
              <BigLessons size={36} />
            </div>
          </div>
        </Wrap>
      );
    }

    // ── split-bottom-date: 堂數左、收入右、月份(底) ──
    if (variant === "split-bottom-date") {
      return (
        <Wrap>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <BigLessons size={48} />
            <Money size={24} color={T.primary} />
          </div>
          <div style={{
            marginTop: 14, paddingTop: 10, borderTop: `1px dashed ${T.borderSoft}`,
            display: "flex", justifyContent: "flex-end"
          }}>
            <SerifMonth size={20} yearSize={12} />
          </div>
        </Wrap>
      );
    }

    // ── split-rule: 月在頂行 / 數字大 + 細線分隔(類似帳單) ──
    if (variant === "split-rule") {
      return (
        <Wrap>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            paddingBottom: 12, borderBottom: `1px solid ${T.border}`
          }}>
            <SerifMonth size={26} yearSize={16} />
            <span style={{
              fontSize: 9.5, color: T.inkSoft, letterSpacing: 3, fontWeight: 500
            }}>MAY · 2026</span>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Money size={40} color={T.primary} />
            <BigLessons size={28} />
          </div>
        </Wrap>
      );
    }

    // ── split-tiles: 兩個方塊並排,中間月份標籤 ──
    if (variant === "split-tiles") {
      const Tile = ({ children, sub, accent }) => (
        <div style={{
          flex: 1, padding: "14px 12px", background: T.bg, borderRadius: 14,
          border: `1px solid ${T.borderSoft}`, textAlign: "center"
        }}>
          <div style={{
            fontSize: 26, fontWeight: 700, color: accent,
            fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
          }}>{children}</div>
          <div style={{ fontSize: 9.5, color: T.inkSoft, letterSpacing: 2, marginTop: 6 }}>{sub}</div>
        </div>
      );
      return (
        <Wrap>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <SerifMonth size={28} yearSize={16} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Tile sub="收入 NT$" accent={T.primary}>{income.toLocaleString()}</Tile>
            <Tile sub="本月堂數" accent={T.accent}>{lessons}</Tile>
          </div>
        </Wrap>
      );
    }

    // ── split-monogram: 大月份字當主視覺,左上 2026 · MAY + 大水印「5」+ 右側收入堂數 ──
    if (variant === "split-monogram") {
      return (
        <Wrap>
          {/* 左半邊大「5」水印 — 撐滿卡片高度,基線稍微下沉 */}
          <div style={{
            position: "absolute", left: 22, top: -14, bottom: -8,
            width: "45%",
            display: "flex", alignItems: "center", justifyContent: "flex-start",
            pointerEvents: "none",
            opacity: 0.14,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 175, fontWeight: 700,
            color: T.primary, lineHeight: 0.9,
            letterSpacing: -4
          }}>{monthNum}</div>

          {/* 左上 2026 · MAY */}
          <div style={{
            position: "absolute", left: 18, top: 22,
            fontSize: 10, color: T.inkSoft, letterSpacing: 2.5, fontWeight: 500
          }}>{year} · MAY</div>

          {/* 右側資料 — 收入垂直置中為主視覺,堂數隨後,整組下移 24px */}
          <div style={{
            position: "relative",
            height: "100%",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "flex-end",
            gap: 8,
            paddingTop: 16 // 讓 center 計算後等同往下偏移 8
          }}>
            <Money size={48} color={T.primary} />
            <BigLessons size={26} />
          </div>
        </Wrap>
      );
    }

    // ── split-receipt: 收據式,單行對齊 ──
    if (variant === "split-receipt") {
      const Row = ({ label, value, accent }) => (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          padding: "8px 0", borderBottom: `1px dashed ${T.borderSoft}`
        }}>
          <span style={{ fontSize: 11, color: T.inkSoft, letterSpacing: 1 }}>{label}</span>
          <span style={{
            fontSize: 18, fontWeight: 600, color: accent,
            fontFamily: "'Cormorant Garamond', serif"
          }}>{value}</span>
        </div>
      );
      return (
        <Wrap>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <SerifMonth size={26} yearSize={16} />
          </div>
          <div style={{ marginTop: 6 }}>
            <Row label="本月收入" value={'$' + income.toLocaleString()} accent={T.primary} />
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              padding: "8px 0"
            }}>
              <span style={{ fontSize: 11, color: T.inkSoft, letterSpacing: 1 }}>本月堂數</span>
              <span style={{
                fontSize: 18, fontWeight: 600, color: T.accent,
                fontFamily: "'Cormorant Garamond', serif"
              }}>{lessons} 堂</span>
            </div>
          </div>
        </Wrap>
      );
    }

    // ── split-stamp: 月份在右側方形圖章,左側資料 ──
    if (variant === "split-stamp") {
      return (
        <Wrap>
          <div style={{ display: "flex", alignItems: "stretch", gap: 20 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
              <Money size={32} color={T.primary} />
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 11, color: T.inkSoft
              }}>
                <BigLessons size={20} />
              </div>
            </div>
            <div style={{
              width: 92, padding: "14px 0",
              border: `1.5px solid ${T.primary}`, borderRadius: 14,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              color: T.primary, fontFamily: "'Cormorant Garamond', serif"
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.75 }}>{year}</div>
              <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, margin: "2px 0" }}>{monthNum}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.75 }}>MONTH</div>
            </div>
          </div>
        </Wrap>
      );
    }
  }

  if (variant === "receipt") {
    return (
      <div style={{
        background: T.surface, borderRadius: 22,
        padding: "20px 22px 22px", border: `1px solid ${T.borderSoft}`
      }}>
        <div style={{
          fontSize: 10, letterSpacing: 3, color: T.inkSoft, fontWeight: 500
        }}>{year} · {String(monthNum).padStart(2, "0")} · INCOME</div>
        <div style={{ marginTop: 10 }}>
          <Money size={42} color={T.primary} />
        </div>
        <div style={{
          marginTop: 12, display: "flex", gap: 18, fontSize: 11, color: T.inkSoft, alignItems: "center"
        }}>
          <span>共上 <span style={{
            color: T.ink, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", fontSize: 14
          }}>{lessons}</span> 堂</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: T.borderSoft }} />
          <span>單堂均價 <span style={{
            color: T.ink, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", fontSize: 14
          }}>{'$'}{Math.round(income / lessons).toLocaleString()}</span></span>
        </div>
      </div>
    );
  }

  if (variant === "ribbon") {
    return (
      <div style={{
        background: `linear-gradient(135deg, ${T.primarySoft} 0%, ${T.surface} 70%)`,
        borderRadius: 22, padding: "18px 22px 20px",
        border: `1px solid ${T.borderSoft}`
      }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 16 }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "10px 14px", background: T.surface, borderRadius: 12,
            border: `1px solid ${T.border}`, color: T.primaryDeep, minWidth: 64
          }}>
            <div style={{ fontSize: 9.5, letterSpacing: 1.5, opacity: 0.7, fontWeight: 500 }}>{year}</div>
            <div style={{
              fontSize: 32, fontWeight: 700, lineHeight: 1, marginTop: 2,
              fontFamily: "'Cormorant Garamond', serif"
            }}>{monthNum}</div>
            <div style={{ fontSize: 9.5, marginTop: 2, opacity: 0.7, letterSpacing: 1 }}>MONTH</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 10, color: T.inkSoft, letterSpacing: 1, fontWeight: 500 }}>本月收入</div>
            <div style={{ marginTop: 4 }}><Money size={30} /></div>
            <div style={{
              marginTop: 6, fontSize: 11, color: T.inkSoft, display: "flex", gap: 4, alignItems: "baseline"
            }}>
              共 <span style={{
                color: T.accent, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", fontSize: 16
              }}>{lessons}</span> 堂
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div style={{
        padding: "10px 6px 14px",
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <SerifMonth size={26} yearSize={16} />
          <span style={{
            fontSize: 9.5, color: T.inkSoft, letterSpacing: 2, fontWeight: 500
          }}>{lessons} CLASSES</span>
        </div>
        <div style={{
          marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "space-between"
        }}>
          <span style={{ fontSize: 10, color: T.inkSoft, letterSpacing: 1 }}>本月收入</span>
          <Money size={36} color={T.primary} />
        </div>
      </div>
    );
  }
  return null;
}

function VariantD({ chartStyle = "area", initialTab = 0, monthCardVariant = "split" }) {
  window.useStore(); // re-render on store change
  const [tab, setTab] = useStateD(initialTab);
  const [activeModal, setActiveModal] = useStateD(null); // 'class' | 'pay' | 'addStudent' | 'history' | 'settings'
  const [historyStudent, setHistoryStudent] = useStateD(null);
  const [editClassRecord, setEditClassRecord] = useStateD(null);
  const [editPaymentRecord, setEditPaymentRecord] = useStateD(null);
  const T = D_TOKENS;
  const openFab = () => {
    if (tab === 0) { setEditClassRecord(null); setActiveModal("class"); }
    else if (tab === 1) { setEditPaymentRecord(null); setActiveModal("pay"); }
    else if (tab === 2) setActiveModal("addStudent");
  };
  const openEditClass = (record) => {
    setEditClassRecord(record);
    setActiveModal("class");
  };
  const openEditPayment = (record) => {
    setEditPaymentRecord(record);
    setActiveModal("pay");
  };
  const openHistory = (student) => {
    setHistoryStudent(student);
    setActiveModal("history");
  };
  const closeModal = () => setActiveModal(null);
  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const yearNum = now.getFullYear();
  const monthKey = `${yearNum}-${String(monthNum).padStart(2, "0")}`;

  // 從 store 即時計算本月收入與堂數
  const records = window.SAMPLE_RECORDS;
  const _idx = window.Store ? window.Store.derived.buildLessonRevenueIndex() : {};
  let monthIncome = 0, monthLessons = 0;
  records.forEach((r) => {
    if ((r.date || "").slice(0, 7) !== monthKey) return;
    if (r.type === "class") {
      monthIncome += window.Store ? window.Store.derived.classDisplayTotal(r, _idx) : (r.totalAmount || 0);
      monthLessons += 1;
    }
  });

  return (
    <div style={{
      fontFamily: "'Noto Sans TC', 'Helvetica Neue', sans-serif",
      background: T.bg, width: "100%", height: "100%",
      color: T.ink, display: "flex", flexDirection: "column", overflow: "hidden",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{ background: T.bg, padding: "8px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 0.5 }}>
            Hi, {(window.Store && window.Store.getState().settings && window.Store.getState().settings.displayName) || "您好"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {window.SyncBadge && <window.SyncBadge T={T} />}
            <button onClick={() => setActiveModal("settings")} style={{
              width: 42, height: 42, borderRadius: 21, border: `1px solid ${T.border}`,
              background: `linear-gradient(135deg, ${T.primarySoft}, ${T.accentSoft})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 9, background: T.primary, opacity: 0.6 }} />
            </button>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <MonthCard
            T={T}
            year={yearNum}
            monthNum={monthNum}
            income={monthIncome}
            lessons={monthLessons}
            variant={monthCardVariant}
          />
        </div>
      </div>

      {/* Tabs — pill style, primary green */}
      <div style={{ padding: "10px 16px 12px", display: "flex", gap: 6 }}>
        {window.TABS.map((t, i) =>
        <button key={t} onClick={() => setTab(i)} style={{
          flex: 1, padding: "9px 0", borderRadius: 999, border: "none",
          background: tab === i ? T.primary : "transparent",
          color: tab === i ? T.surface : T.inkSoft,
          fontSize: 12, fontWeight: tab === i ? 600 : 500,
          fontFamily: "inherit", cursor: "pointer", letterSpacing: 0.5
        }}>{t}</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px" }}>
        {tab === 0 && <D_ClassList T={T} onEdit={openEditClass} />}
        {tab === 1 && <D_PayList T={T} onEdit={openEditPayment} />}
        {tab === 2 && <D_Students T={T} onSelect={openHistory} />}
        {tab === 3 && <D_Income T={T} chartStyle={chartStyle} />}
      </div>

      {/* FAB — 收入記錄 tab 不顯示 */}
      {tab !== 3 &&
      <button onClick={openFab} style={{
        position: "absolute", right: 22, bottom: 28,
        width: 52, height: 52, borderRadius: 26, border: "none",
        background: T.primary, color: T.surface,
        fontSize: 24, fontWeight: 300, cursor: "pointer",
        boxShadow: `0 6px 18px ${T.primary}55`, fontFamily: "inherit",
        transition: "transform .15s ease"
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.92)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >+</button>
      }

      {/* Bottom-sheet modal overlay */}
      {activeModal && activeModal !== "history" &&
      <div onClick={closeModal} style={{
        position: "absolute", inset: 0, background: "rgba(20,18,15,0.42)",
        zIndex: 20, display: "flex", alignItems: "flex-end",
        overflow: "hidden",
        animation: "dOverlayIn .2s ease"
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: "100%", background: T.bg,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: "92%", overflow: "hidden",
          display: "flex", flexDirection: "column",
          animation: "dSheetIn .28s cubic-bezier(.2,.8,.3,1)"
        }}>
          {activeModal === "class" && <window.D_Modal_Class onClose={closeModal} embedded editRecord={editClassRecord} />}
          {activeModal === "pay" && <window.D_Modal_Payment onClose={closeModal} embedded editRecord={editPaymentRecord} />}
          {activeModal === "addStudent" && <window.D_Modal_AddStudent onClose={closeModal} embedded />}
          {activeModal === "settings" && <window.D_Modal_Settings onClose={closeModal} embedded />}
        </div>
      </div>
      }

      {/* History (full page) */}
      {activeModal === "history" && historyStudent &&
      <div style={{
        position: "absolute", inset: 0, background: T.bg,
        zIndex: 20, overflowY: "auto",
        animation: "dPageIn .26s ease"
      }}>
        <window.D_Modal_History onClose={closeModal} student={historyStudent} embedded
          onEditRecord={(record) => {
            setActiveModal(null);
            if (record.type === "payment") openEditPayment(record);
            else openEditClass(record);
          }} />
      </div>
      }

      <style>{`
        @keyframes dOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dSheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes dPageIn { from { transform: translateX(8%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>);

}

function D_EmptyIcon({ kind, color }) {
  const stroke = color || "#9ba293";
  const sw = 1.4;
  if (kind === "lotus") {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 36 C 14 32, 10 24, 12 18 C 18 20, 22 26, 24 32" />
        <path d="M24 36 C 34 32, 38 24, 36 18 C 30 20, 26 26, 24 32" />
        <path d="M24 36 C 24 26, 24 18, 24 12 C 28 16, 28 24, 24 32" />
        <path d="M24 36 C 24 26, 24 18, 24 12 C 20 16, 20 24, 24 32" />
        <path d="M10 38 Q 24 42, 38 38" opacity="0.55" />
      </svg>
    );
  }
  if (kind === "wallet") {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 18 Q 10 12, 16 12 L 32 12 Q 38 12, 38 18 L 38 34 Q 38 38, 33 38 L 15 38 Q 10 38, 10 34 Z" />
        <path d="M10 20 L 30 20 Q 34 20, 34 24 Q 34 28, 30 28 L 10 28" />
        <circle cx="30" cy="24" r="1.5" fill={stroke} stroke="none" />
      </svg>
    );
  }
  if (kind === "person") {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="17" r="5" />
        <path d="M13 38 Q 13 28, 24 28 Q 35 28, 35 38" />
        <path d="M36 14 Q 40 12, 42 14 Q 40 18, 36 16 Z" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "sprout") {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 38 L 24 22" />
        <path d="M24 24 Q 14 22, 12 14 Q 22 14, 24 24 Z" />
        <path d="M24 26 Q 34 24, 36 16 Q 26 16, 24 26 Z" />
        <path d="M16 38 Q 24 36, 32 38" opacity="0.55" />
      </svg>
    );
  }
  return null;
}

function D_EmptyState({ T, iconKind, title, hint }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "120px 24px 40px", textAlign: "center",
      color: T.muted,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 28,
        background: T.primarySoft || "#e6e1d6",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16, opacity: 0.9,
        width: 72, height: 72,
      }}><D_EmptyIcon kind={iconKind} color={T.primary || "#7a8a72"} /></div>
      <div style={{ fontSize: 15, fontWeight: 500, color: T.muted, marginBottom: 6, opacity: 0.85 }}>{title}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.65, maxWidth: 240, color: T.muted, opacity: 0.65 }}>{hint}</div>
    </div>
  );
}

function D_ClassList({ T, onEdit }) {
  const [expanded, setExpanded] = useStateD({});
  const records = window.SAMPLE_RECORDS.filter((r) => r.type === "class");
  const lessonIdx = window.Store ? window.Store.derived.buildLessonRevenueIndex() : {};
  const displayTotal = (r) => window.Store ? window.Store.derived.classDisplayTotal(r, lessonIdx) : (r.totalAmount || 0);
  if (records.length === 0) {
    return <D_EmptyState T={T} iconKind="lotus" title="還沒有上課記錄" hint={<>點右下角 <b>+</b> 來記錄一堂課。所有上課都會依日期排序顯示在這裡。</>} />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {records.map((r, i) => {
        const tone = D_LOC[r.location] || D_LOC["園頂"];
        const names = r.attendees ? r.attendees.map((a) => a.studentName).join("、") : `${r.headcount} 人`;
        const date = new Date(r.date);
        const isOpen = expanded[r.id];
        const monthKey = (r.date || "").slice(0, 7);
        const prevMonthKey = i > 0 ? (records[i - 1].date || "").slice(0, 7) : null;
        const showMonthHeader = monthKey !== prevMonthKey;
        const [yy, mm] = monthKey.split("-");
        return (
          <React.Fragment key={r.id}>
            {showMonthHeader && (
              <div style={{
                fontSize: 11, color: T.inkSoft, letterSpacing: 2,
                fontFamily: "'Cormorant Garamond', serif",
                padding: "8px 4px 2px",
                marginTop: i === 0 ? 0 : 8,
                display: "flex", alignItems: "baseline", gap: 8
              }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: T.ink, letterSpacing: 1 }}>{yy} / {parseInt(mm, 10)}月</span>
                <span style={{ flex: 1, height: 1, background: T.borderSoft }} />
              </div>
            )}
          <div style={{
            background: T.surface, borderRadius: 20, padding: "14px 16px",
            border: `1px solid ${T.borderSoft}`
          }}>
            <div onClick={() => onEdit && onEdit(r)} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <div style={{
                width: 42, textAlign: "center", flexShrink: 0,
                borderRight: `1px solid ${T.borderSoft}`, paddingRight: 10
              }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1,
                  fontFamily: "'Cormorant Garamond', serif" }}>{date.getDate()}</div>
                <div style={{ fontSize: 9, color: T.inkSoft, letterSpacing: 1, marginTop: 4 }}>
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()]}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, color: tone.fg, fontWeight: 600,
                    padding: "2px 9px", background: tone.bg, borderRadius: 999,
                    letterSpacing: 0.5,
                  }}>{r.location}</span>
                  <span style={{ fontSize: 10.5, color: T.inkSoft }}>{r.headcount} 人</span>
                </div>
                <div style={{
                  fontSize: 13, color: T.ink,
                  display: "flex", alignItems: "baseline", gap: 6, minWidth: 0,
                  overflow: "hidden"
                }}>
                  <span style={{ flexShrink: 0 }}>{names}</span>
                  {r.note && !isOpen &&
                  <span style={{
                    fontSize: 10.5, color: T.inkSoft,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    minWidth: 0, flex: 1
                  }}>· {r.note}</span>}
                </div>
              </div>
              <div style={{ alignSelf: "center", textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: T.accent,
                  fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
                  {displayTotal(r).toLocaleString()}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [r.id]: !p[r.id] })); }}
                style={{
                  marginLeft: 4, padding: "6px 8px", background: "transparent",
                  border: "none", color: T.inkSoft, fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit"
                }}
                aria-label={isOpen ? "收合" : "展開"}
              >{isOpen ? "▲" : "▼"}</button>
            </div>
            {isOpen &&
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
              {r.attendees && r.attendees.map((a, i) =>
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 0", fontSize: 12
                }}>
                  <span style={{ minWidth: 56, fontWeight: 500 }}>{a.studentName}</span>
                  <span style={{ color: T.inkSoft, fontSize: 11 }}>
                    {a.usedPackage
                      ? `${a.classType || "扣堂數"} x${a.count || 1}`
                      : `${a.classType || ""}${(a.count || 1) > 1 ? ` x${a.count}` : ""}`}
                  </span>
                  <span style={{
                    marginLeft: "auto", fontWeight: 400, color: T.primary,
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 13
                  }}>
                    {(() => {
                      if (!a.usedPackage) return a.amount > 0 ? '$' + a.amount.toLocaleString() : "—";
                      const rev = lessonIdx[r.id + ":" + a.studentId];
                      const amt = rev ? rev.amount : 0;
                      return amt > 0 ? '$' + amt.toLocaleString() : "—";
                    })()}
                  </span>
                </div>
              )}
              {!r.attendees &&
                <div style={{ fontSize: 12, color: T.inkSoft, padding: "4px 0" }}>
                  {r.location} · {r.headcount} 人
                </div>
              }
              {r.note &&
                <div style={{
                  marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.borderSoft}`,
                  fontSize: 11, color: T.inkSoft, fontStyle: "italic"
                }}>「{r.note}」</div>
              }
            </div>
            }
          </div>
          </React.Fragment>);

      })}
    </div>);

}

function D_PayList({ T, onEdit }) {
  const records = window.SAMPLE_RECORDS.filter((r) => r.type === "payment");
  if (records.length === 0) {
    return <D_EmptyState T={T} iconKind="wallet" title="還沒有儲值記錄" hint={<>學生買課程包時，點右下角 <b>+</b> 、選「儲值」來記上。</>} />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {records.map((r) => {
        const date = new Date(r.date);
        return (
          <div key={r.id} onClick={() => onEdit && onEdit(r)} style={{
            background: T.surface, borderRadius: 20, padding: "14px 16px",
            border: `1px solid ${T.borderSoft}`, cursor: "pointer",
            display: "flex", gap: 12, alignItems: "center"
          }}>
            <div style={{
              width: 42, textAlign: "center", flexShrink: 0,
              borderRight: `1px solid ${T.borderSoft}`, paddingRight: 10
            }}>
              <div style={{
                fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif"
              }}>{date.getDate()}</div>
              <div style={{ fontSize: 9, color: T.inkSoft, letterSpacing: 1, marginTop: 4 }}>
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()]}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, color: T.accent, fontWeight: 600,
                  padding: "2px 9px", background: T.accentSoft, borderRadius: 999,
                  letterSpacing: 0.5
                }}>儲值</span>
                <span style={{ fontSize: 10.5, color: T.inkSoft }}>+{r.classes} 堂</span>
              </div>
              <div style={{
                fontSize: 13, color: T.ink,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>{r.studentName} · {r.plan}</div>
            </div>
            <div style={{ alignSelf: "center", textAlign: "right" }}>
              <div style={{
                fontSize: 18, fontWeight: 600, color: T.accent,
                fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
              }}>{'$'}{r.amount.toLocaleString()}</div>
            </div>
          </div>);
      })}
    </div>);
}

// 6 種可愛簡單的圖示 — 24x24 viewBox
const STUDENT_ICONS = [
  // 葉
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M5 19C5 11 11 5 19 5C19 13 13 19 5 19Z" fill={color} opacity="0.85"/>
    <path d="M5 19L12 12" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>,
  // 月亮
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M16 4C10 4 6 8 6 13s4 9 10 9c-3-2-5-5-5-9s2-7 5-9z" fill={color} opacity="0.85"/>
  </svg>,
  // 花朵
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <circle cx="12" cy="6" r="3" fill={color} opacity="0.85"/>
    <circle cx="6" cy="13" r="3" fill={color} opacity="0.85"/>
    <circle cx="18" cy="13" r="3" fill={color} opacity="0.85"/>
    <circle cx="12" cy="18" r="3" fill={color} opacity="0.85"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>,
  // 雲
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M7 16C4.5 16 3 14.5 3 12.5S4.5 9 7 9c0.5-2 2.5-3.5 5-3.5s4.5 1.5 5 3.5c2 0.2 3.5 1.7 3.5 3.7S19 16 17 16H7z" fill={color} opacity="0.85"/>
  </svg>,
  // 果實/球
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <circle cx="12" cy="14" r="6" fill={color} opacity="0.85"/>
    <path d="M12 8C12 6 13 4 15 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="14.5" cy="5" rx="2" ry="1" fill={color} opacity="0.7" transform="rotate(-30 14.5 5)"/>
  </svg>,
  // 山/三角
  (color) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M3 19L9 8L13 14L17 10L21 19H3Z" fill={color} opacity="0.85"/>
    <circle cx="17" cy="6" r="2" fill={color} opacity="0.6"/>
  </svg>,
];

function StudentAvatar({ id, tone }) {
  // 從 id 取數字 hash 決定圖示
  const hash = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const Icon = STUDENT_ICONS[hash % STUDENT_ICONS.length];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 18,
      background: tone.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      {Icon(tone.fg)}
    </div>
  );
}

function D_Students({ T, onSelect }) {
  if (window.SAMPLE_STUDENTS.length === 0) {
    return <D_EmptyState T={T} iconKind="person" title="還沒有學生" hint={<>點右下角 <b>+</b> 、選「新增學生」來建立名單。之後記錄上課、儲值都會以這裡為主。</>} />;
  }
  const groups = {};
  window.SAMPLE_STUDENTS.forEach((s) => {
    const k = s.location || "園頂";
    if (!groups[k]) groups[k] = [];
    groups[k].push(s);
  });
  // 反查每位學生最近一次上課日期
  const lastByStudent = {};
  window.SAMPLE_RECORDS.filter((r) => r.type === "class" && r.attendees).forEach((r) => {
    r.attendees.forEach((a) => {
      const prev = lastByStudent[a.studentId];
      if (!prev || r.date > prev) lastByStudent[a.studentId] = r.date;
    });
  });
  // 每組學生依「最近上課日期」由近到遠排序;沒上過的排最後;封存(archived)放最最後
  Object.keys(groups).forEach((k) => {
    groups[k].sort((a, b) => {
      if (!!a.archived !== !!b.archived) return a.archived ? 1 : -1;
      const la = lastByStudent[a.id] || "";
      const lb = lastByStudent[b.id] || "";
      if (la && lb) return lb.localeCompare(la);
      if (la) return -1;
      if (lb) return 1;
      return 0;
    });
  });
  const fmtDate = (iso) => {
    if (!iso) return "尚無紀錄";
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(groups).map(([loc, list]) => {
        const tone = D_LOC[loc] || D_LOC["園頂"];
        return (
          <div key={loc}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 8px" }}>
              <span style={{
                fontSize: 10, color: tone.fg, fontWeight: 600,
                padding: "2px 9px", background: tone.bg, borderRadius: 999,
                letterSpacing: 0.5
              }}>{loc}</span>
              <span style={{ fontSize: 11, color: T.inkSoft }}>{list.length} 位</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((s) =>
              <div key={s.id} onClick={() => onSelect && onSelect(s)} style={{
                background: T.surface, borderRadius: 18, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                border: `1px solid ${T.borderSoft}`,
                cursor: "pointer", transition: "transform .12s ease, border-color .12s ease",
                opacity: s.archived ? 0.45 : 1
              }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.985)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                  <StudentAvatar id={s.id} tone={tone} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
                      {s.archived && <span style={{
                        fontSize: 9, padding: "1px 6px", borderRadius: 999,
                        background: T.borderSoft, color: T.inkSoft, fontWeight: 500, letterSpacing: 0.5,
                        flexShrink: 0
                      }}>已封存</span>}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, marginTop: 1
                    }}>
                      <span style={{ fontSize: 11, color: T.inkSoft, flexShrink: 0 }}>最近上課 · {fmtDate(lastByStudent[s.id])}</span>
                      {s.note && <span style={{
                        fontSize: 11, color: T.inkSoft,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        minWidth: 0, flex: 1
                      }}>· {s.note}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {(() => {
                      const stats = window.Store ? window.Store.derived.studentStats(s.id) : { remaining: s.remaining || 0, paidLessons: s.remaining || 0 };
                      if (!stats.paidLessons) return null;
                      return <>
                        <div style={{
                          fontSize: 20, fontWeight: 700,
                          color: stats.remaining > 0 ? T.primary : T.inkSoft,
                          fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
                        }}>{stats.remaining}</div>
                        <div style={{ fontSize: 9, color: T.inkSoft, letterSpacing: 1, marginTop: 2 }}>剩餘堂數</div>
                      </>;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>);

      })}
    </div>);

}

function D_Income({ T, chartStyle }) {
  const months = window.SAMPLE_MONTHS;
  const [selIdx, setSelIdx] = useStateD(months.length - 1);
  const currentYear = new Date().getFullYear().toString();
  const yearTotal = months
    .filter((m) => m.key.startsWith(currentYear))
    .reduce((s, m) => s + m.value, 0);
  const max = Math.max(1, ...months.map((m) => m.value));
  const hasAnyIncome = months.some((m) => m.value > 0);
  if (!hasAnyIncome) {
    return <D_EmptyState T={T} iconKind="sprout" title="還沒有收入資料" hint={<>新增上課或儲值記錄之後,這裡會出現月度趨勢圖與年度總覽。</>} />;
  }
  const COL_W = 36; // px per month
  const W = Math.max(320, COL_W * months.length + 20);
  const H = 140, padL = 10, padR = 10, padT = 16, padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const pts = months.map((m, i) => ({
    x: padL + i / (months.length - 1) * innerW,
    y: padT + innerH - m.value / max * innerH,
    v: m.value, k: m.key
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${padT + innerH} L${pts[0].x},${padT + innerH} Z`;

  // 每月實際上課堂數 (一筆紀錄 = 一堂)
  const monthLessonCount = {};
  window.SAMPLE_RECORDS.forEach((r) => {
    if (r.type !== "class") return;
    const k = (r.date || "").slice(0, 7);
    if (!k) return;
    monthLessonCount[k] = (monthLessonCount[k] || 0) + 1;
  });
  const mLessons = (key) => monthLessonCount[key] || 0;
  const sel = months[selIdx];
  const prev = selIdx > 0 ? months[selIdx - 1] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: `linear-gradient(135deg, #b89e8b 0%, #c2a5a5 60%, #a8b1bd 100%)`,
        borderRadius: 24, padding: "20px 22px", color: T.surface,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", right: -30, bottom: -30,
          width: 140, height: 140, borderRadius: 70,
          background: "rgba(255,255,255,0.12)"
        }} />
        <div style={{
          position: "absolute", left: -20, top: -25,
          width: 90, height: 90, borderRadius: 45,
          background: "rgba(255,255,255,0.08)"
        }} />
        <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: 2, fontWeight: 500 }}>
          {currentYear} 年度總收入
        </div>
        <div style={{
          fontSize: 32, fontWeight: 600, marginTop: 6,
          fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1
        }}>{'$'}{yearTotal.toLocaleString()}</div>
        <div style={{ display: "flex", gap: 24, marginTop: 14, fontSize: 11, opacity: 0.95 }}>
          <div>
            <div style={{ opacity: 0.75 }}>{sel.key.slice(5)}月</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{'$'}{sel.value.toLocaleString()}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>/ {mLessons(sel.key)} 堂</span>
            </div>
          </div>
          {prev &&
          <div>
            <div style={{ opacity: 0.75 }}>{prev.key.slice(5)}月</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{'$'}{prev.value.toLocaleString()}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>/ {mLessons(prev.key)} 堂</span>
            </div>
          </div>
          }
        </div>
      </div>

      <div style={{
        background: T.surface, borderRadius: 20,
        padding: "14px 12px 8px", border: `1px solid ${T.borderSoft}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          padding: "0 6px 8px", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>近 12 個月趨勢</span>
          <span style={{ fontSize: 10, color: T.inkSoft, letterSpacing: 1 }}>
            {chartStyle === "bar" ? "BAR" : chartStyle === "line" ? "LINE" : "AREA"}
          </span>
        </div>
        <div ref={(el) => { if (el && !el.__init) { el.__init = true; el.scrollLeft = el.scrollWidth; } }}
          style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: 140, display: "block" }}>
          <defs>
            <linearGradient id="dFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={T.accent} stopOpacity="0.5" />
              <stop offset="100%" stopColor={T.blush} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="dStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={T.accent} />
              <stop offset="100%" stopColor={T.blush} />
            </linearGradient>
            <linearGradient id="dBar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={T.accent} />
              <stop offset="100%" stopColor={T.blush} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((r) =>
          <line key={r} x1={padL} x2={W - padR}
          y1={padT + innerH - r * innerH} y2={padT + innerH - r * innerH}
          stroke={T.borderSoft} strokeDasharray="2 4" strokeWidth="1" />
          )}
          {chartStyle === "bar" ?
          <g>
              {pts.map((p, i) => {
              const bw = innerW / months.length * 0.5;
              return (
                <rect key={i} x={p.x - bw / 2} y={p.y}
                width={bw} height={padT + innerH - p.y}
                rx={bw / 2} fill="url(#dBar)"
                opacity={i === selIdx ? 1 : 0.45}
                style={{ cursor: "pointer", transition: "opacity .15s" }}
                onClick={() => setSelIdx(i)} />);

            })}
              {pts.map((p, i) => p.v > 0 &&
                <text key={"v" + i} x={p.x} y={Math.max(p.y - 3, 8)} textAnchor="middle"
                  fontSize="8" fontWeight={i === selIdx ? 700 : 500}
                  fill={i === selIdx ? T.ink : T.inkSoft}
                  fontFamily="'Cormorant Garamond', serif">
                  {p.v >= 1000 ? `${(p.v / 1000).toFixed(p.v >= 10000 ? 0 : 1)}k` : p.v}
                </text>
              )}
            </g> :

          <g>
              {chartStyle !== "line" && <path d={areaPath} fill="url(#dFill)" />}
              <path d={linePath} fill="none" stroke="url(#dStroke)"
            strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) =>
            <circle key={i} cx={p.x} cy={p.y} r={i === selIdx ? 5.5 : 2.8}
            fill={i === selIdx ? T.accent : T.surface}
            stroke={T.accent} strokeWidth={i === selIdx ? 0 : 1.5}
            style={{ cursor: "pointer", transition: "r .15s" }}
            onClick={() => setSelIdx(i)} />
            )}
            </g>
          }
          {/* 透明點擊熱區 — 確保在 line 模式上也好點 */}
          {pts.map((p, i) =>
          <rect key={"hit" + i}
            x={p.x - innerW / months.length / 2} y={padT}
            width={innerW / months.length} height={innerH}
            fill="transparent" style={{ cursor: "pointer" }}
            onClick={() => setSelIdx(i)} />
          )}
          {pts.map((p, i) =>
          <text key={"x" + i} x={p.x} y={H - 8} textAnchor="middle"
          fontSize="9" fill={i === selIdx ? T.ink : T.inkSoft}
          fontWeight={i === selIdx ? 700 : 400}
          letterSpacing="0.5">{p.k.slice(5)}月</text>
          )}
        </svg>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...months].reverse().map((m, i, arr) => {
          const prev = arr[i + 1];
          const diff = prev ? m.value - prev.value : null;
          const pct = prev && prev.value ? Math.round(diff / prev.value * 100) : null;
          return (
            <div key={m.key} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", background: T.surface,
              borderRadius: 14, border: `1px solid ${T.borderSoft}`
            }}>
              <div style={{ fontSize: 11, color: T.inkSoft, width: 56, fontWeight: 500 }}>{m.key}</div>
              <div style={{
                fontSize: 16, fontWeight: 600,
                fontFamily: "'Cormorant Garamond', serif", color: T.ink, flex: 1
              }}>{'$'}{m.value.toLocaleString()}</div>
              {diff != null &&
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: diff >= 0 ? T.primary : T.danger,
                display: "flex", alignItems: "center", gap: 3
              }}>
                  <span>{diff >= 0 ? "↗" : "↘"}</span>
                  <span>{pct >= 0 ? "+" : ""}{pct}%</span>
                </div>
              }
            </div>);

        })}
      </div>
    </div>);

}

window.VariantD = VariantD;
window.StudentAvatar = StudentAvatar;
window.D_LOC = D_LOC;