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

const D_LOC_M = {
  "園頂": { bg: "#e1e5dc", fg: "#5b6650" },
  "到府": { bg: "#ecdfdf", fg: "#7c5e5e" },
  "天空": { bg: "#dee2e8", fg: "#5d6776" },
  "台中": { bg: "#ece2d7", fg: "#7a624e" },
  "其他": { bg: "#e6e2db", fg: "#6e6a62" },
};

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
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((r, i) => (
          <div key={i} style={{
            background: T.surface, borderRadius: 18, padding: "12px 14px",
            border: `1px solid ${T.borderSoft}`,
            display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: T.inkSoft }}>{r.date}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999,
                  background: (D_LOC_M[r.loc] || D_LOC_M["園頂"]).bg,
                  color: (D_LOC_M[r.loc] || D_LOC_M["園頂"]).fg, fontWeight: 600
                }}>{r.loc}</span>
                <span style={{ fontSize: 12 }}>{r.who}</span>
              </div>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: T.accent,
              fontFamily: "'Cormorant Garamond', serif"
            }}>{r.amt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== Bottom sheet 殼 ======
function BottomSheet({ title, children, primaryLabel = "儲存修改", showDelete = false, sheetHeight = "82%", backdrop = "list", embedded = false, onClose, onSubmit, onDelete }) {
  // 手勢往下關閉
  const [dragY, setDragY] = (window.React || React).useState(0);
  const startYRef = (window.React || React).useRef(null);
  const draggingRef = (window.React || React).useRef(false);
  const onTouchStart = (e) => {
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    draggingRef.current = true;
  };
  const onTouchMove = (e) => {
    if (startYRef.current == null) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dy = y - startYRef.current;
    if (dy > 0) {
      if (e.cancelable && e.preventDefault) e.preventDefault();
      setDragY(dy);
    }
  };
  const onTouchEnd = () => {
    if (dragY > 100) { onClose && onClose(); }
    setDragY(0);
    startYRef.current = null;
    draggingRef.current = false;
  };
  const grabberRef = (window.React || React).useRef(null);
  (window.React || React).useEffect(() => {
    const el = grabberRef.current;
    if (!el) return;
    const ts = (e) => onTouchStart(e);
    const tm = (e) => onTouchMove(e);
    const te = () => onTouchEnd();
    el.addEventListener("touchstart", ts, { passive: false });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te, { passive: false });
    el.addEventListener("touchcancel", te, { passive: false });
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
      el.removeEventListener("touchcancel", te);
    };
  });
  const grabberHandlers = {
    ref: grabberRef,
    onMouseDown: (e) => { onTouchStart(e); const mv = (ev) => onTouchMove(ev); const up = () => { onTouchEnd(); window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up); }
  };
  const dragStyle = dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: "none" } : { transform: "translateY(0)", transition: "transform 220ms ease" };

  if (embedded) {
    // 用於 VariantD 內部:已經有外層 overlay,本體就是 sheet 內容
    return (
      <div style={{
        width: "100%", background: T.surface,
        display: "flex", flexDirection: "column",
        maxHeight: "92vh", ...dragStyle
      }}>
        <div {...grabberHandlers} style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", cursor: "grab", touchAction: "none" }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: T.border }} />
        </div>
        <div style={{ padding: "8px 22px 4px", fontSize: 17, fontWeight: 600, letterSpacing: 0.5 }}>
          {title}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 22px 18px", maxHeight: 480 }}>
          {children}
        </div>
        <div style={{
          padding: "12px 22px 22px", borderTop: `1px solid ${T.borderSoft}`,
          display: "flex", gap: 10, background: T.surface
        }}>
          {showDelete &&
            <button onClick={() => {
              if (window.confirm("確定刪除這筆紀錄?")) {
                onDelete && onDelete();
              }
            }} style={{
              padding: "13px 14px", borderRadius: 12,
              border: `1px solid ${T.blushSoft}`, background: "transparent",
              color: T.danger, fontSize: 13, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer"
            }}>刪除</button>
          }
          <button onClick={onClose} style={{
            flex: 1, padding: "13px 0", borderRadius: 12,
            border: `1px solid ${T.border}`, background: T.surface,
            color: T.ink, fontSize: 14, fontWeight: 500,
            fontFamily: "inherit", cursor: "pointer"
          }}>取消</button>
          <button onClick={onSubmit || onClose} style={{
            flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
            background: T.primaryDeep, color: T.surface,
            fontSize: 14, fontWeight: 600, letterSpacing: 1,
            fontFamily: "inherit", cursor: "pointer"
          }}>{primaryLabel}</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      fontFamily: "'Noto Sans TC', 'Helvetica Neue', sans-serif",
      background: T.bg, overflow: "hidden", color: T.ink
    }}>
      {/* 背景層 */}
      <div style={{ position: "absolute", inset: 0 }}>
        {backdrop === "list" ? <BackdropList /> : <div style={{ background: T.bg, width: "100%", height: "100%" }} />}
      </div>
      {/* dim overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,18,0.18)" }} />

      {/* sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: sheetHeight, background: T.surface,
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        boxShadow: "0 -10px 30px rgba(0,0,0,0.10)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        ...dragStyle
      }}>
        {/* grabber */}
        <div {...grabberHandlers} style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", cursor: "grab", touchAction: "none" }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: T.border }} />
        </div>

        <div style={{ padding: "8px 22px 4px", fontSize: 17, fontWeight: 600, letterSpacing: 0.5 }}>
          {title}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 22px 18px" }}>
          {children}
        </div>

        <div style={{
          padding: "12px 22px 22px", borderTop: `1px solid ${T.borderSoft}`,
          display: "flex", gap: 10, background: T.surface
        }}>
          {showDelete &&
            <button style={{
              padding: "13px 14px", borderRadius: 12,
              border: `1px solid ${T.blushSoft}`, background: "transparent",
              color: T.danger, fontSize: 13, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer"
            }}>刪除</button>
          }
          <button style={{
            flex: 1, padding: "13px 0", borderRadius: 12,
            border: `1px solid ${T.border}`, background: T.surface,
            color: T.ink, fontSize: 14, fontWeight: 500,
            fontFamily: "inherit", cursor: "pointer"
          }}>取消</button>
          <button style={{
            flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
            background: T.primaryDeep, color: T.surface,
            fontSize: 14, fontWeight: 600, letterSpacing: 1,
            fontFamily: "inherit", cursor: "pointer"
          }}>{primaryLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ====== 共用小元件 ======
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 12, color: T.ink, fontWeight: 500, marginBottom: 8 }}>{children}</div>
  );
}

function DateInput({ value }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 10,
      border: `1px solid ${T.border}`, padding: "11px 14px",
      fontSize: 14, color: T.ink,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <span>{value}</span>
      <span style={{ fontSize: 14, color: T.inkSoft }}>📅</span>
    </div>
  );
}

function LocChip({ label, active, onClick }) {
  const tone = D_LOC_M[label] || D_LOC_M["園頂"];
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 999,
      border: active ? "none" : `1px solid ${T.border}`,
      background: active ? tone.bg : "transparent",
      color: active ? tone.fg : T.inkSoft,
      fontSize: 13, fontWeight: active ? 600 : 500,
      fontFamily: "inherit", cursor: "pointer",
      transition: "background 0.15s"
    }}>{label}</button>
  );
}

function PriceChip({ label, sub, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 999,
      border: active ? "none" : `1px solid ${T.border}`,
      background: active ? T.primarySoft : "transparent",
      color: active ? T.primaryDeep : T.inkSoft,
      fontSize: 11.5, fontWeight: active ? 600 : 500,
      fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
      transition: "background 0.15s"
    }}>
      {label}{sub && <span style={{ marginLeft: 4, opacity: 0.85 }}>{sub}</span>}
    </button>
  );
}

function Stepper({ value, onChange, suffix = "人" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(Math.max(1, value - 1))} style={{
        width: 24, height: 24, borderRadius: 12, padding: 0,
        border: `1px solid ${T.border}`, background: T.surface,
        color: T.ink, fontSize: 13, cursor: "pointer", lineHeight: 1
      }}>−</button>
      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 14, textAlign: "center" }}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={{
        width: 24, height: 24, borderRadius: 12, padding: 0,
        border: `1px solid ${T.border}`, background: T.surface,
        color: T.ink, fontSize: 13, cursor: "pointer", lineHeight: 1
      }}>+</button>
      <span style={{ fontSize: 12, color: T.inkSoft, marginLeft: 2 }}>{suffix}</span>
    </div>
  );
}

// ====== 學生卡 (扣堂/單堂/體驗/自訂) ======
function StudentCard({ student, state, onChange }) {
  const checked = state.checked;
  const count = state.count;
  const pricing = state.pricing;
  const customPrice = state.customPrice || 0;
  const set = (patch) => onChange({ ...state, ...patch });

  const sub =
    pricing === "package" ? `扣 ${count} 堂` :
    pricing === "single"  ? `$${400 * count}` :
    pricing === "trial"   ? `$${200 * count}` :
                            `自訂 $${customPrice}`;

  return (
    <div style={{
      background: T.surface, borderRadius: 14,
      border: `1px solid ${checked ? T.primary : T.borderSoft}`,
      padding: "12px 14px", marginBottom: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => set({ checked: !checked })} style={{
          width: 20, height: 20, borderRadius: 5, padding: 0,
          border: `1.5px solid ${checked ? T.primaryDeep : T.border}`,
          background: checked ? T.primaryDeep : T.surface,
          color: T.surface, fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>{checked ? "✓" : ""}</button>
        <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{student.name}</div>
        <Stepper value={count} onChange={(v) => set({ count: v })} />
        <div style={{
          fontSize: 11, color: T.inkSoft, marginLeft: 6,
          minWidth: 44, textAlign: "right"
        }}>{(() => {
          const stats = window.Store ? window.Store.derived.studentStats(student.id) : null;
          if (!stats || !stats.paidLessons) return null;
          return `剩 ${stats.remaining} 堂`;
        })()}</div>
      </div>

      {checked &&
        <>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12
          }}>
            <PriceChip label="扣堂數" active={pricing === "package"} onClick={() => set({ pricing: "package" })} />
            <PriceChip label="社區單堂" sub="$400" active={pricing === "single"} onClick={() => set({ pricing: "single" })} />
            <PriceChip label="社區體驗" sub="$200" active={pricing === "trial"} onClick={() => set({ pricing: "trial" })} />
            <PriceChip label="自訂金額" active={pricing === "custom"} onClick={() => set({ pricing: "custom" })} />
          </div>
          {pricing === "custom" &&
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6,
              background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px" }}>
              <span style={{ color: T.inkSoft, fontSize: 12 }}>$</span>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={customPrice || ""}
                onChange={(e) => set({ customPrice: parseInt(e.target.value.replace(/\D/g, "") || "0", 10) })}
                style={{
                  flex: 1, minWidth: 0, border: "none", outline: "none",
                  background: "transparent", fontSize: 14, fontWeight: 600,
                  color: T.ink, fontFamily: "'Cormorant Garamond', serif",
                  WebkitAppearance: "none"
                }} />
            </div>
          }
          <div style={{ fontSize: 11, color: T.primaryDeep, marginTop: 8, fontWeight: 500 }}>
            {sub}
          </div>
        </>
      }
    </div>
  );
}

// ====== 1. 編輯上課紀錄 ======
function D_Modal_Class({ initialLoc = "園頂", embedded, onClose, editRecord }) {
  const isEdit = !!editRecord;
  const [loc, setLoc] = useStateMod(editRecord ? editRecord.location : initialLoc);
  const today = new Date();
  const [date, setDate] = useStateMod(
    editRecord ? editRecord.date :
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const [note, setNote] = useStateMod(editRecord ? (editRecord.note || "") : "");

  // ===== 學生 state by id (lift up) =====
  // { [studentId]: { checked, count, pricing, customPrice } }
  const initStudentState = () => {
    if (!editRecord || !editRecord.attendees) return {};
    const m = {};
    editRecord.attendees.forEach(a => {
      let pricing = "package";
      if (a.classType === "社區單堂") pricing = "single";
      else if (a.classType === "社區體驗") pricing = "trial";
      else if (a.classType === "自訂金額") pricing = "custom";
      m[a.studentId] = {
        checked: true, count: a.count || 1, pricing,
        customPrice: pricing === "custom" ? Math.round((a.amount || 0) / (a.count || 1)) : 0
      };
    });
    return m;
  };
  const [studentState, setStudentState] = useStateMod(initStudentState());
  const onStudentChange = (id, next) => setStudentState(prev => ({ ...prev, [id]: next }));

  // 到府: 單一學生 + 方案
  const initHomePlan = () => {
    if (!editRecord || editRecord.location !== "到府") return "1on1";
    const ct = editRecord.attendees && editRecord.attendees[0] && editRecord.attendees[0].classType;
    if (ct === "一對二") return "1on2";
    if (ct === "一對三") return "1on3";
    if (ct === "一對一") return "1on1";
    return "custom";
  };
  const [homeStudentId, setHomeStudentId] = useStateMod(
    editRecord && editRecord.location === "到府" && editRecord.attendees && editRecord.attendees[0]
      ? editRecord.attendees[0].studentId : null
  );
  const [homePlan, setHomePlan] = useStateMod(initHomePlan());
  const initHomeCustomLabel = () => {
    if (!editRecord || editRecord.location !== "到府") return "";
    const ct = editRecord.attendees && editRecord.attendees[0] && editRecord.attendees[0].classType;
    if (["一對一", "一對二", "一對三"].includes(ct)) return "";
    return ct || "";
  };
  const initHomeCustomPrice = () => {
    if (!editRecord || editRecord.location !== "到府") return 1600;
    const ct = editRecord.attendees && editRecord.attendees[0] && editRecord.attendees[0].classType;
    if (["一對一", "一對二", "一對三"].includes(ct)) return 1600;
    return editRecord.totalAmount || 1600;
  };
  const [homeCustomLabel, setHomeCustomLabel] = useStateMod(initHomeCustomLabel());
  const [homeCustomPrice, setHomeCustomPrice] = useStateMod(initHomeCustomPrice());

  // 天空 / 台中 / 其他
  const [headcount, setHeadcount] = useStateMod(
    editRecord && (editRecord.location === "天空" || editRecord.mode === "manual") ? (editRecord.headcount || 8) : 8
  );
  const [manualAmount, setManualAmount] = useStateMod(
    editRecord && editRecord.mode === "manual" ? (editRecord.totalAmount || 0) : 2400
  );

  const allStudents = window.Store ? window.Store.getState().students : window.SAMPLE_STUDENTS;
  const lastClassMap = window.Store ? window.Store.derived.lastClassByStudent() : {};
  const studentsHere = allStudents.filter(s =>
    !s.archived && (
      loc === "園頂" ? (s.location === "園頂") :
      loc === "到府" ? (s.location === "到府") :
      false
    )
  ).sort((a, b) => {
    const da = lastClassMap[a.id] || "";
    const db = lastClassMap[b.id] || "";
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
  // 確保進場時每個學生都有 default state
  React.useEffect(() => {
    if (loc === "園頂") {
      setStudentState(prev => {
        const next = { ...prev };
        studentsHere.forEach(s => {
          if (!next[s.id]) next[s.id] = { checked: false, count: 1, pricing: "package", customPrice: 0 };
        });
        return next;
      });
    } else if (loc === "到府") {
      if (!homeStudentId && studentsHere[0]) setHomeStudentId(studentsHere[0].id);
    }
  }, [loc, studentsHere.length]);

  const buildRecord = () => {
    if (loc === "園頂") {
      const attendees = studentsHere
        .filter(s => studentState[s.id] && studentState[s.id].checked)
        .map(s => {
          const st = studentState[s.id];
          const cnt = st.count || 1;
          if (st.pricing === "package") return {
            studentId: s.id, studentName: s.name, classType: "扣堂數",
            usedPackage: true, perClassPrice: 360, count: cnt, amount: 0
          };
          if (st.pricing === "single") return {
            studentId: s.id, studentName: s.name, classType: "社區單堂",
            usedPackage: false, perClassPrice: 0, count: cnt, amount: 400 * cnt
          };
          if (st.pricing === "trial") return {
            studentId: s.id, studentName: s.name, classType: "社區體驗",
            usedPackage: false, perClassPrice: 0, count: cnt, amount: 200 * cnt
          };
          return {
            studentId: s.id, studentName: s.name, classType: "自訂金額",
            usedPackage: false, perClassPrice: 0, count: cnt,
            amount: (st.customPrice || 0) * cnt
          };
        });
      if (!attendees.length) return null;
      const totalAmount = attendees.reduce((sum, a) => sum + (a.amount || a.perClassPrice * a.count || 0), 0);
      const totalHeadcount = attendees.reduce((sum, a) => sum + (a.count || 1), 0);
      return {
        date, location: loc, mode: "normal",
        headcount: totalHeadcount, totalAmount, attendees, note
      };
    }
    if (loc === "到府") {
      const stu = allStudents.find(s => s.id === homeStudentId);
      if (!stu) return null;
      const planMap = {
        "1on1": { label: "一對一", price: 1800, people: 1 },
        "1on2": { label: "一對二", price: 2000, people: 2 },
        "1on3": { label: "一對三", price: 1500, people: 3 }
      };
      let p;
      if (homePlan === "custom") {
        const trimmed = (homeCustomLabel || "").trim() || "到府自訂";
        const price = Math.max(0, parseInt(homeCustomPrice, 10) || 0);
        p = { label: trimmed, price, people: 1 };
      } else {
        p = planMap[homePlan] || planMap["1on1"];
      }
      return {
        date, location: loc, mode: "home",
        headcount: p.people, totalAmount: p.price,
        attendees: [{ studentId: stu.id, studentName: stu.name, classType: p.label, amount: p.price, usedPackage: false, perClassPrice: 0, count: 1 }],
        note
      };
    }
    if (loc === "天空") {
      const amount = SKY_RATE_TABLE[headcount] ?? 0;
      return { date, location: loc, mode: "sky",
        headcount, totalAmount: amount, attendees: null, note };
    }
    // 台中 / 其他
    return { date, location: loc, mode: "manual",
      headcount, totalAmount: manualAmount, attendees: null, note };
  };

  const submit = () => {
    const rec = buildRecord();
    if (!rec) return;
    if (isEdit) {
      window.Store.actions.updateClass(editRecord.id, rec);
    } else {
      window.Store.actions.addClass(rec);
    }
    onClose && onClose();
  };

  const handleDelete = () => {
    if (!isEdit) return;
    window.Store.actions.deleteRecord(editRecord.id);
    onClose && onClose();
  };

  return (
    <BottomSheet title={isEdit ? "編輯上課紀錄" : "新增上課紀錄"} primaryLabel={isEdit ? "儲存修改" : "儲存"} showDelete={isEdit} embedded={embedded} onClose={onClose} onSubmit={submit} onDelete={handleDelete}>
      <FieldLabel>日期</FieldLabel>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
        width: "100%", boxSizing: "border-box", display: "block", minWidth: 0,
        background: T.surface, borderRadius: 10, appearance: "none", WebkitAppearance: "none",
        border: `1px solid ${T.border}`, padding: "11px 14px",
        fontSize: 14, color: T.ink, fontFamily: "inherit", outline: "none"
      }} />

      <div style={{ height: 16 }} />
      <FieldLabel>場地</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.keys(D_LOC_M).map(l => (
          <LocChip key={l} label={l} active={loc === l} onClick={() => setLoc(l)} />
        ))}
      </div>

      {/* ===== 園頂 ===== */}
      {loc === "園頂" &&
        <>
          <div style={{ height: 18 }} />
          <FieldLabel>選擇學生 &amp; 收費方式</FieldLabel>
          {studentsHere.length === 0 &&
            <div style={{ fontSize: 12, color: T.inkSoft, padding: "8px 4px" }}>
              此場地沒有學生 — 請先到「學生」頁新增。
            </div>
          }
          {studentsHere.map((s) => {
            const st = studentState[s.id] || { checked: false, count: 1, pricing: "package", customPrice: 0 };
            return <StudentCard key={s.id} student={s} state={st} onChange={(next) => onStudentChange(s.id, next)} />;
          })}
        </>
      }

      {/* ===== 到府 · 單一學生選方案 ===== */}
      {loc === "到府" &&
        <>
          <div style={{ height: 18 }} />
          <FieldLabel>選擇學生 &amp; 方案</FieldLabel>
          {studentsHere.length === 0 ?
            <div style={{ fontSize: 12, color: T.inkSoft, padding: "8px 4px" }}>
              此場地沒有學生 — 請先到「學生」頁新增。
            </div>
            :
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {studentsHere.map(s =>
                  <button key={s.id} onClick={() => setHomeStudentId(s.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 999,
                      border: homeStudentId === s.id ? "none" : `1px solid ${T.border}`,
                      background: homeStudentId === s.id ? T.primarySoft : "transparent",
                      color: homeStudentId === s.id ? T.primaryDeep : T.inkSoft,
                      fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer"
                    }}>{s.name}</button>
                )}
              </div>
              {homeStudentId &&
                <HomeStudentCard
                  student={allStudents.find(s => s.id === homeStudentId)}
                  plan={homePlan}
                  onChangePlan={setHomePlan}
                  customLabel={homeCustomLabel}
                  setCustomLabel={setHomeCustomLabel}
                  customPrice={homeCustomPrice}
                  setCustomPrice={setHomeCustomPrice}
                />
              }
            </>
          }
        </>
      }

      {/* ===== 天空 · 公共課人頭費 ===== */}
      {loc === "天空" && <SkySection count={headcount} setCount={setHeadcount} />}

      {/* ===== 台中 / 其他 · 手動輸入金額 ===== */}
      {(loc === "台中" || loc === "其他") &&
        <>
          <div style={{ height: 18 }} />
          <FieldLabel>到場人數</FieldLabel>
          <div style={{
            background: T.surface, borderRadius: 10,
            border: `1px solid ${T.border}`, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 13, color: T.inkSoft }}>人數</span>
            <Stepper value={headcount} onChange={setHeadcount} suffix="人" />
          </div>

          <div style={{ height: 16 }} />
          <FieldLabel>總金額</FieldLabel>
          <div style={{
            background: T.surface, borderRadius: 10,
            border: `1px solid ${T.border}`, padding: "11px 14px",
            display: "flex", alignItems: "center", gap: 4
          }}>
            <span style={{ color: T.inkSoft, fontSize: 14 }}>$</span>
            <input type="text" inputMode="numeric" pattern="[0-9]*"
              value={manualAmount || ""}
              onChange={(e) => setManualAmount(parseInt(e.target.value.replace(/\D/g, "") || "0", 10))}
              style={{
                flex: 1, minWidth: 0, border: "none", outline: "none",
                background: "transparent", fontSize: 18, fontWeight: 700,
                color: T.ink, fontFamily: "'Cormorant Garamond', serif",
                WebkitAppearance: "none"
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 6 }}>
            包班 / 公司活動,直接輸入收到的金額
          </div>
        </>
      }

      <div style={{ height: 6 }} />
      <FieldLabel>備註</FieldLabel>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="選填"
        style={{
          width: "100%", boxSizing: "border-box",
          background: T.surface, borderRadius: 10,
          border: `1px solid ${T.border}`, padding: "11px 14px",
          fontSize: 14, color: T.ink, fontFamily: "inherit", outline: "none"
        }}
      />
    </BottomSheet>
  );
}

// ====== 天空場地 · 老師分潤表 ======
const SKY_RATE_TABLE = {
  2: 600,
  3: 800, 4: 900, 5: 1000, 6: 1200, 7: 1400, 8: 1600, 9: 1800,
  10: 2200, 11: 2500, 12: 2800, 13: 3100, 14: 3400, 15: 3700, 16: 4000,
};

function SkySection({ count, setCount }) {
  const amount = SKY_RATE_TABLE[count] ?? 0;
  return (
    <>
      <div style={{ height: 18 }} />
      <FieldLabel>上課人數</FieldLabel>
      <div style={{
        background: T.surface, borderRadius: 10,
        border: `1px solid ${T.border}`, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>到場人數</span>
        <Stepper
          value={count}
          onChange={(v) => setCount(Math.max(2, Math.min(16, v)))}
          suffix="人"
        />
      </div>

      <div style={{ height: 12 }} />
      <div style={{
        background: T.primarySoft, borderRadius: 12, padding: "12px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "baseline"
      }}>
        <div>
          <div style={{ fontSize: 12, color: T.primaryDeep, fontWeight: 600 }}>老師分潤</div>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 700, color: T.primaryDeep,
          fontFamily: "'Cormorant Garamond', serif"
        }}>${amount.toLocaleString()}</span>
      </div>
    </>
  );
}

// ====== 到府學生卡 (一對一/二/三方案) ======
function HomeStudentCard({ student, plan, onChangePlan, customLabel, setCustomLabel, customPrice, setCustomPrice }) {
  if (!student) return null;
  const plans = [
    { id: "1on1", label: "一對一", price: 1800 },
    { id: "1on2", label: "一對二", price: 2000 },
    { id: "1on3", label: "一對三", price: 1500 },
    { id: "custom", label: "自訂", price: null },
  ];
  return (
    <div style={{
      background: T.surface, borderRadius: 14,
      border: `1px solid ${T.primary}`,
      padding: "12px 14px", marginBottom: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{student.name}</div>
        <span style={{ fontSize: 11, color: T.inkSoft }}>{student.location}</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {plans.map(p => {
          const active = plan === p.id;
          return (
            <button key={p.id} onClick={() => onChangePlan(p.id)} style={{
              padding: "6px 12px", borderRadius: 999,
              border: active ? "none" : `1px solid ${T.border}`,
              background: active ? T.primarySoft : "transparent",
              color: active ? T.primaryDeep : T.inkSoft,
              fontSize: 11.5, fontWeight: active ? 600 : 500,
              fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap"
            }}>
              {p.id === "custom" ? p.label : `${p.label} $${p.price.toLocaleString()}`}
            </button>
          );
        })}
      </div>
      {plan === "custom" && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="名稱 (例: 到府體驗)"
            style={{
              flex: 1, minWidth: 0, boxSizing: "border-box",
              background: T.bg, borderRadius: 8,
              border: `1px solid ${T.border}`, padding: "8px 10px",
              fontSize: 12, color: T.ink, outline: "none", fontFamily: "inherit"
            }}
          />
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: T.bg, borderRadius: 8,
            border: `1px solid ${T.border}`, padding: "0 10px",
            width: 110
          }}>
            <span style={{ color: T.inkSoft, fontSize: 12 }}>$</span>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={customPrice || ""}
              onChange={(e) => setCustomPrice(parseInt(e.target.value.replace(/\D/g, "") || "0", 10))}
              style={{
                flex: 1, minWidth: 0, border: "none", outline: "none",
                background: "transparent", fontSize: 14, fontWeight: 600,
                color: T.ink, fontFamily: "'Cormorant Garamond', serif",
                padding: "8px 0", WebkitAppearance: "none"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ====== 2. 堂數儲值 ======
function D_Modal_Payment({ initialPlan = 1, customOpen = false, customClasses = 8, customPrice = 2800, customName = "", embedded, onClose, editRecord }) {
  const isEdit = !!editRecord;
  const studentsAll = window.Store ? window.Store.getState().students : window.SAMPLE_STUDENTS;
  const lastClassMap2 = window.Store ? window.Store.derived.lastClassByStudent() : {};
  const students = studentsAll.filter(s => !s.archived).sort((a, b) => {
    const da = lastClassMap2[a.id] || "";
    const db = lastClassMap2[b.id] || "";
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
  const customPlans = (window.Store && window.Store.getState().customPlans) || [];
  const [studentId, setStudentId] = useStateMod(editRecord ? (editRecord.studentId || "") : "");
  const [pickerOpen, setPickerOpen] = useStateMod(!editRecord);
  const builtInPlans = [
    { id: "p0", name: "社區 5 堂",  classes: 5,  price: 1800 },
    { id: "p1", name: "社區 10 堂", classes: 10, price: 3500 },
  ];
  const allPlans = [...builtInPlans, ...customPlans];
  // detect if editRecord plan matches a known plan
  const matchedPlan = editRecord ? allPlans.find(p => p.name === editRecord.plan && p.classes === editRecord.classes && p.price === editRecord.amount) : null;
  const initialKey = editRecord
    ? (matchedPlan ? matchedPlan.id : "__custom__")
    : (allPlans[initialPlan] ? allPlans[initialPlan].id : builtInPlans[0].id);
  const [planId, setPlanId] = useStateMod(initialKey);
  const [showCustom, setShowCustom] = useStateMod(customOpen || (editRecord && !matchedPlan));
  const [cClasses, setCClasses] = useStateMod(editRecord && !matchedPlan ? (editRecord.classes || customClasses) : customClasses);
  const [cPrice, setCPrice] = useStateMod(editRecord && !matchedPlan ? (editRecord.amount || customPrice) : customPrice);
  const [cName, setCName] = useStateMod(editRecord && !matchedPlan ? (editRecord.plan || "") : customName);
  const [saveAsPlan, setSaveAsPlan] = useStateMod(false);
  const [note, setNote] = useStateMod(editRecord ? (editRecord.note || "") : "");
  const today = new Date();
  const [date, setDate] = useStateMod(
    editRecord ? editRecord.date :
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const isCustom = planId === "__custom__";
  const selectedPlan = allPlans.find(p => p.id === planId);
  const sel = isCustom
    ? { name: cName.trim() || "自訂方案", classes: cClasses, price: cPrice }
    : (selectedPlan || builtInPlans[0]);
  const student = students.find(s => s.id === studentId);
  const submit = () => {
    if (!student) return;
    if (isCustom && saveAsPlan && cName.trim()) {
      window.Store.actions.addCustomPlan({
        name: cName.trim(),
        classes: cClasses,
        price: cPrice,
      });
    }
    const payload = {
      studentId: student.id,
      studentName: student.name,
      date,
      plan: sel.name,
      amount: sel.price,
      classes: sel.classes,
      note,
    };
    if (isEdit) {
      window.Store.actions.updatePayment(editRecord.id, payload);
    } else {
      window.Store.actions.addPayment(payload);
    }
    onClose && onClose();
  };
  const handleDelete = () => {
    if (!isEdit) return;
    window.Store.actions.deleteRecord(editRecord.id);
    onClose && onClose();
  };
  const Avatar = window.StudentAvatar;
  const LOC = window.D_LOC || {};
  return (
    <BottomSheet title={isEdit ? "編輯儲值紀錄" : "新增儲值紀錄"} primaryLabel={isEdit ? "儲存修改" : "完成儲值"} sheetHeight="78%" showDelete={isEdit} embedded={embedded} onClose={onClose} onSubmit={submit} onDelete={handleDelete}>
      <FieldLabel>學生</FieldLabel>
      <div onClick={() => setPickerOpen(o => !o)} style={{
        background: T.surface, borderRadius: 10,
        border: `1px solid ${T.border}`, padding: "11px 14px",
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer"
      }}>
        {student ? (
          <>
            <Avatar id={student.id} tone={LOC[student.location || "園頂"] || LOC["園頂"]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{student.name}</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>
                {student.location || "園頂"} · 剩 {window.Store ? window.Store.derived.studentStats(student.id).remaining : (student.remaining || 0)} 堂
              </div>
            </div>
            <span style={{ color: T.inkSoft, fontSize: 12 }}>{pickerOpen ? "收合 ▴" : "更換 ›"}</span>
          </>
        ) : (
          <>
            <div style={{
              width: 36, height: 36, borderRadius: 18, flexShrink: 0,
              border: `1.5px dashed ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.inkSoft, fontSize: 16
            }}>＋</div>
            <div style={{ flex: 1, fontSize: 14, color: T.inkSoft }}>請選擇學生</div>
            <span style={{ color: T.inkSoft, fontSize: 12 }}>{pickerOpen ? "收合 ▴" : "選擇 ›"}</span>
          </>
        )}
      </div>
      {pickerOpen &&
        <div style={{
          marginTop: 8, background: T.surface, borderRadius: 10,
          border: `1px solid ${T.border}`, maxHeight: 220, overflowY: "auto"
        }}>
          {students.map(s => {
            const stTone = LOC[s.location || "園頂"] || LOC["園頂"];
            return (
              <div key={s.id} onClick={() => { setStudentId(s.id); setPickerOpen(false); }}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  borderBottom: `1px solid ${T.borderSoft}`,
                  background: s.id === studentId ? T.primarySoft : "transparent"
                }}>
                <Avatar id={s.id} tone={stTone} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>
                    {s.location} · 剩 {window.Store ? window.Store.derived.studentStats(s.id).remaining : s.remaining} 堂
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }

      <div style={{ height: 16 }} />
      <FieldLabel>日期</FieldLabel>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
        width: "100%", boxSizing: "border-box", display: "block", minWidth: 0,
        background: T.surface, borderRadius: 10, appearance: "none", WebkitAppearance: "none",
        border: `1px solid ${T.border}`, padding: "11px 14px",
        fontSize: 14, color: T.ink, fontFamily: "inherit", outline: "none"
      }} />

      <div style={{ height: 16 }} />
      <FieldLabel>方案</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {allPlans.map((p) => {
          const active = planId === p.id && !isCustom;
          const isCustomSaved = p.id.startsWith("cp");
          return (
            <div key={p.id} onClick={() => { setPlanId(p.id); setShowCustom(false); }} style={{
              background: active ? T.primarySoft : T.surface,
              borderRadius: 12, padding: "12px 14px", cursor: "pointer",
              border: active ? `1.5px solid ${T.primaryDeep}` : `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                border: `2px solid ${active ? T.primaryDeep : T.border}`,
                background: active ? T.primaryDeep : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {active && <div style={{ width: 6, height: 6, borderRadius: 3, background: T.surface }} />}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {p.name}
                {isCustomSaved && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 999,
                    background: T.primarySoft, color: T.primaryDeep, fontWeight: 500
                  }}>常用</span>
                )}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700, color: T.ink,
                fontFamily: "'Cormorant Garamond', serif"
              }}>${p.price.toLocaleString()}</div>
              {isCustomSaved && (
                <button onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`刪除常用方案「${p.name}」?`)) {
                    window.Store.actions.removeCustomPlan(p.id);
                    if (planId === p.id) setPlanId(builtInPlans[0].id);
                  }
                }} style={{
                  background: "transparent", border: "none", color: T.inkSoft,
                  fontSize: 14, cursor: "pointer", padding: "0 0 0 4px", lineHeight: 1
                }}>×</button>
              )}
            </div>
          );
        })}

        {/* 自訂方案 — 點擊後展開 */}
        {!showCustom ?
          <button onClick={() => { setShowCustom(true); setPlanId("__custom__"); }} style={{
            padding: "10px 0", borderRadius: 12,
            border: `1px dashed ${T.border}`, background: "transparent",
            color: T.inkSoft, fontSize: 12, fontFamily: "inherit", cursor: "pointer"
          }}>＋ 自訂方案</button>
          :
          <div style={{
            background: isCustom ? T.primarySoft : T.surface,
            borderRadius: 12, padding: "14px 14px",
            border: isCustom ? `1.5px solid ${T.primaryDeep}` : `1px solid ${T.border}`,
          }}>
            <div onClick={() => setPlanId("__custom__")} style={{
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 12
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                border: `2px solid ${isCustom ? T.primaryDeep : T.border}`,
                background: isCustom ? T.primaryDeep : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {isCustom && <div style={{ width: 6, height: 6, borderRadius: 3, background: T.surface }} />}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>自訂方案</div>
              <button onClick={(e) => { e.stopPropagation(); setShowCustom(false); if (isCustom) setPlanId(builtInPlans[0].id); }} style={{
                background: "transparent", border: "none", color: T.inkSoft,
                fontSize: 13, cursor: "pointer", padding: "2px 6px"
              }}>收合</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 4 }}>方案名稱(選填)</div>
                <input
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="例:私人 8 堂、體驗組合 …"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: T.surface, borderRadius: 10,
                    border: `1px solid ${T.border}`, padding: "10px 12px",
                    fontSize: 13, color: T.ink, fontFamily: "inherit", outline: "none"
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 4 }}>堂數</div>
                  <div style={{
                    background: T.surface, borderRadius: 10,
                    border: `1px solid ${T.border}`, padding: "8px 12px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    overflow: "hidden"
                  }}>
                    <Stepper value={cClasses} onChange={setCClasses} suffix="堂" />
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 4 }}>金額</div>
                  <div style={{
                    background: T.surface, borderRadius: 10,
                    border: `1px solid ${T.border}`, padding: "8px 12px",
                    display: "flex", alignItems: "center", gap: 4
                  }}>
                    <span style={{ color: T.inkSoft, fontWeight: 400 }}>$</span>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      value={cPrice || ""}
                      onChange={(e) => setCPrice(parseInt(e.target.value.replace(/\D/g, "") || "0", 10))}
                      style={{
                        flex: 1, minWidth: 0,
                        border: "none", outline: "none", background: "transparent",
                        fontSize: 14, fontWeight: 600, color: T.ink,
                        fontFamily: "'Cormorant Garamond', serif",
                        WebkitAppearance: "none"
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: T.primaryDeep, fontWeight: 500,
                paddingTop: 4
              }}>
                <span>平均一堂 ${cClasses ? Math.round(cPrice / cClasses) : 0}</span>
                <label onClick={() => setSaveAsPlan(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3,
                    border: `1.5px solid ${saveAsPlan ? T.primaryDeep : T.border}`,
                    background: saveAsPlan ? T.primaryDeep : T.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.surface, fontSize: 10, lineHeight: 1
                  }}>{saveAsPlan ? "✓" : ""}</span>
                  <span style={{ color: T.inkSoft }}>儲存為常用方案</span>
                </label>
              </div>
            </div>
          </div>
        }
      </div>

      <div style={{ height: 16 }} />
      <FieldLabel>備註</FieldLabel>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="選填(現金 / 匯款)"
        style={{
          width: "100%", boxSizing: "border-box",
          background: T.surface, borderRadius: 10,
          border: `1px solid ${T.border}`, padding: "11px 14px",
          fontSize: 13, color: T.ink, fontFamily: "inherit", outline: "none"
        }}
      />

      <div style={{ height: 12 }} />
      <div style={{
        background: T.primarySoft, borderRadius: 12,
        padding: "12px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "baseline"
      }}>
        <span style={{ fontSize: 12, color: T.primaryDeep, fontWeight: 600 }}>
          儲值後 · {student ? student.name : "—"}
        </span>
        <span style={{
          fontSize: 18, fontWeight: 700, color: T.primaryDeep,
          fontFamily: "'Cormorant Garamond', serif"
        }}>{student && window.Store ? window.Store.derived.studentStats(student.id).remaining : 0} → {(student && window.Store ? window.Store.derived.studentStats(student.id).remaining : 0) + sel.classes} 堂</span>
      </div>
    </BottomSheet>
  );
}

// ====== 3. 新增學生 ======
function D_Modal_AddStudent({ embedded, onClose, editStudent }) {
  const isEdit = !!editStudent;
  const [loc, setLoc] = useStateMod(isEdit ? (editStudent.location || "園頂") : "園頂");
  const [name, setName] = useStateMod(isEdit ? (editStudent.name || "") : "");
  const [note, setNote] = useStateMod(isEdit ? (editStudent.note || "") : "");
  const [archived, setArchived] = useStateMod(isEdit ? !!editStudent.archived : false);
  const [remaining, setRemaining] = useStateMod(isEdit ? String(editStudent.remaining || 0) : "0");
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEdit) {
      window.Store.actions.updateStudent(editStudent.id, { name: trimmed, location: loc, note, archived });
    } else {
      window.Store.actions.addStudent({ name: trimmed, location: loc, note, remaining: 0 });
    }
    onClose && onClose();
  };
  const remove = () => {
    if (!isEdit) return;
    if (!window.confirm(`確定要刪除學生「${editStudent.name}」嗎?\n\n相關上課與儲值記錄將保留,但會失去學生連結。`)) return;
    if (window.Store.actions.deleteStudent) {
      window.Store.actions.deleteStudent(editStudent.id);
    } else {
      // Fallback: mark hidden via location flag (shouldn't happen)
    }
    onClose && onClose();
  };
  return (
    <BottomSheet
      title={isEdit ? "編輯學生" : "新增學生"}
      primaryLabel={isEdit ? "儲存" : "新增"}
      sheetHeight="62%"
      backdrop="list"
      embedded={embedded}
      onClose={onClose}
      onSubmit={submit}
      showDelete={isEdit}
      onDelete={isEdit ? remove : null}
    >
      <FieldLabel>姓名</FieldLabel>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="輸入姓名 …"
        style={{
          width: "100%", boxSizing: "border-box",
          background: T.surface, borderRadius: 10,
          border: `1px solid ${T.border}`, padding: "11px 14px",
          fontSize: 14, color: T.ink, outline: "none",
          fontFamily: "inherit"
        }}
      />

      <div style={{ height: 16 }} />
      <FieldLabel>主要場地</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.keys(D_LOC_M).map(l => (
          <LocChip key={l} label={l} active={loc === l} onClick={() => setLoc(l)} />
        ))}
      </div>

      {isEdit && (
        <>
          <div style={{ height: 16 }} />
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", background: T.surface, borderRadius: 10,
            border: `1px solid ${T.border}`, cursor: "pointer"
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 5,
              border: `1.5px solid ${archived ? T.primaryDeep : T.border}`,
              background: archived ? T.primaryDeep : T.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.surface, fontSize: 13, lineHeight: 1, flexShrink: 0
            }}>{archived ? "✓" : ""}</span>
            <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} style={{ display: "none" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>封存學生</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>不再出現於上課/儲值選單,歷程紀錄會保留</div>
            </div>
          </label>
        </>
      )}

      <div style={{ height: 16 }} />
      <FieldLabel>備註</FieldLabel>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="選填"
        style={{
          width: "100%", boxSizing: "border-box",
          background: T.surface, borderRadius: 10,
          border: `1px solid ${T.border}`, padding: "11px 14px",
          fontSize: 14, color: T.ink, outline: "none",
          fontFamily: "inherit"
        }}
      />
    </BottomSheet>
  );
}

// ====== 4. 學生紀錄(全頁) ======
function D_Modal_History({ embedded, onClose, student, onEditRecord }) {
  const stu = student || { id: "_none", name: "—", remaining: 0, location: "—" };
  const history = window.Store && stu.id !== "_none" ? window.Store.derived.studentHistory(stu.id) : [];
  const stats = window.Store && stu.id !== "_none" ? window.Store.derived.studentStats(stu.id) : { lessons: 0, paid: 0 };
  const [editOpen, setEditOpen] = useStateMod(false);
  const fmtMD = (iso) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`;
  };
  const fmtDay = (iso) => ["週日","週一","週二","週三","週四","週五","週六"][new Date(iso).getDay()];
  return (
    <div style={{
      fontFamily: "'Noto Sans TC', 'Helvetica Neue', sans-serif",
      background: T.bg, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden"
    }}>
      <div style={{
        padding: "10px 16px 16px", display: "flex", alignItems: "center", gap: 12,
        background: T.bg
      }}>
        <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: 0.3 }}>學生紀錄</div>
        {stu.id !== "_none" && (
          <button onClick={() => setEditOpen(true)} aria-label="編輯" style={{
            height: 36, borderRadius: 18, border: `1px solid ${T.border}`,
            background: T.surface, color: T.ink, fontSize: 12, cursor: "pointer", padding: "0 14px",
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit"
          }}>編輯</button>
        )}
        <button onClick={onClose} aria-label="關閉" style={{
          width: 36, height: 36, borderRadius: 18, border: `1px solid ${T.border}`,
          background: T.surface, color: T.ink, fontSize: 14, cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>✕</button>
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDeep} 100%)`,
          borderRadius: 22, padding: "20px 22px", color: T.surface,
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", right: -20, bottom: -20,
            width: 110, height: 110, borderRadius: 55,
            background: "rgba(255,255,255,0.07)"
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontSize: 24, fontWeight: 600, letterSpacing: 0.5
              }}>{stu.name}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>
                {stu.location || "園頂"} · 加入 2025/08
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 36, fontWeight: 600,
                fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
              }}>{stats.remaining != null ? stats.remaining : stu.remaining}</div>
              <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1, marginTop: 6 }}>剩餘堂數</div>
            </div>
          </div>
          <div style={{
            display: "flex", gap: 22, marginTop: 16,
            paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.18)",
            fontSize: 11, opacity: 0.9
          }}>
            <div><div style={{ opacity: 0.7 }}>累積上課</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{stats.classCount} 堂</div></div>
            <div><div style={{ opacity: 0.7 }}>累積儲值</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>${stats.paid.toLocaleString()}</div></div>
            <div><div style={{ opacity: 0.7 }}>累積金額</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>${stats.totalRevenue.toLocaleString()}</div></div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        <div style={{ fontSize: 11, color: T.inkSoft, letterSpacing: 1, padding: "8px 4px 10px", fontWeight: 500 }}>
          歷程紀錄 · 共 {history.length} 筆
        </div>
        {history.length === 0 &&
          <div style={{ fontSize: 12, color: T.inkSoft, textAlign: "center", padding: "32px 0" }}>
            尚無紀錄
          </div>
        }
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {history.map((r) => {
            const isTopUp = r.type === "payment";
            const lookupRecord = () => {
              if (!window.Store) return null;
              const recId = isTopUp ? r.id : r.id.split(":")[0];
              return window.Store.getState().records.find(x => x.id === recId);
            };
            const handleClick = () => {
              const rec = lookupRecord();
              if (rec && onEditRecord) onEditRecord(rec);
            };
            return (
              <div key={r.id} onClick={handleClick} style={{
                background: T.surface, borderRadius: 14, padding: "12px 14px",
                border: `1px solid ${T.borderSoft}`,
                display: "flex", alignItems: "center", gap: 12,
                cursor: onEditRecord ? "pointer" : "default"
              }}>
                <div style={{
                  width: 38, textAlign: "center", flexShrink: 0,
                  borderRight: `1px solid ${T.borderSoft}`, paddingRight: 8
                }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: T.ink,
                    fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
                  }}>{fmtMD(r.date)}</div>
                  <div style={{ fontSize: 9, color: T.inkSoft, letterSpacing: 1, marginTop: 3 }}>
                    {fmtDay(r.date)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, padding: "2px 9px", borderRadius: 999, fontWeight: 600,
                      letterSpacing: 0.5,
                      background: isTopUp ? T.accentSoft : T.primarySoft,
                      color: isTopUp ? T.accent : T.primaryDeep
                    }}>{isTopUp ? "儲值" : "上課"}</span>
                    {!isTopUp &&
                      <span style={{ fontSize: 11, color: T.inkSoft }}>{r.location}</span>
                    }
                  </div>
                  <div style={{ fontSize: 12, color: T.ink }}>
                    {isTopUp
                      ? r.plan
                      : r.usedPackage
                        ? "扣堂上課"
                        : (r.label || "現場收費")
                    }
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {isTopUp ?
                    <>
                      <div style={{
                        fontSize: 16, fontWeight: 600, color: T.accent,
                        fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
                      }}>+${r.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 4 }}>
                        +{r.classes} 堂
                      </div>
                    </>
                  :
                    <>
                      <div style={{
                        fontSize: 16, fontWeight: 600,
                        color: r.usedPackage ? T.inkSoft : T.primary,
                        fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
                      }}>{r.usedPackage
                        ? `$${(r.amount || 0).toLocaleString()}`
                        : `+$${(r.amount || 0).toLocaleString()}`
                      }</div>
                      {r.usedPackage && (
                        <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 4 }}>
                          −{r.count || 1} 堂
                        </div>
                      )}
                    </>
                  }
                </div>
              </div>);
          })}
        </div>
      </div>
      {editOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
          <D_Modal_AddStudent embedded onClose={() => setEditOpen(false)} editStudent={stu} />
        </div>
      )}
    </div>
  );
}

window.D_Modal_Class = D_Modal_Class;
window.D_Modal_Payment = D_Modal_Payment;
window.D_Modal_AddStudent = D_Modal_AddStudent;
window.D_Modal_History = D_Modal_History;
