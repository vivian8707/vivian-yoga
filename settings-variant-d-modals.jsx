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
      <div style={{ flex: 1, overflow: "auto", padding: "10px 16px" }}>
        {items.map((item, i) => {
          const c = getVenueColorM(item.loc);
          return (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: "1px solid " + T.borderSoft,
              fontSize: 13
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: T.inkSoft, fontSize: 12, marginBottom: 4 }}>{item.date}</div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{item.who}</div>
                <div style={{
                  display: "inline-block", padding: "4px 8px", borderRadius: 6,
                  background: c.bg, color: c.fg, fontSize: 11, fontWeight: 500
                }}>{item.loc}</div>
              </div>
              <div style={{ textAlign: "right", fontWeight: 600, color: T.primary }}>{item.amt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====== 新增上課 Modal ======
function AddClassModal({ show, onClose }) {
  const [venue, setVenue] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [studentCount, setStudentCount] = useState(1);
  const venues = [
    { name: "園頂", id: "v1" },
    { name: "到府", id: "v2" },
    { name: "包班", id: "v3" },
    { name: "線上", id: "v4" },
    { name: "其他", id: "v5" },
  ];
  const pricings = [
    { label: "$500/hr", id: "p1" },
    { label: "$800/hr", id: "p2" },
    { label: "$1000/hr", id: "p3" },
    { label: "$1200/hr", id: "p4" },
  ];

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
      zIndex: 1000
    }}>
      <div style={{
        width: "100%", maxWidth: "100vw",
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "24px 20px 32px", animation: "slideUp 0.3s ease-out",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>新增上課</div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 24,
            cursor: "pointer", color: T.inkSoft, padding: 0, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.ink }}>場地</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {venues.map(v => {
              const c = getVenueColorM(v.name);
              const isSelected = venue?.id === v.id;
              return (
                <button key={v.id} onClick={() => setVenue(v)} style={{
                  padding: "12px 8px", borderRadius: 8,
                  background: isSelected ? c.bg : T.borderSoft,
                  color: isSelected ? c.fg : T.inkSoft,
                  border: isSelected ? "2px solid " + c.fg : "1px solid " + T.border,
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s"
                }}>{v.name}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.ink }}>收費</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {pricings.map(p => {
              const isSelected = pricing?.id === p.id;
              return (
                <button key={p.id} onClick={() => setPricing(p)} style={{
                  padding: "12px", borderRadius: 8,
                  background: isSelected ? T.primary : T.borderSoft,
                  color: isSelected ? T.surface : T.ink,
                  border: "1px solid " + (isSelected ? T.primary : T.border),
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s"
                }}>{p.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.ink }}>學生人數</label>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: T.borderSoft, padding: "10px 12px", borderRadius: 8
          }}>
            <button onClick={() => setStudentCount(Math.max(1, studentCount - 1))} style={{
              background: T.primary, color: T.surface, border: "none",
              width: 36, height: 36, borderRadius: 6, fontSize: 16,
              fontWeight: 600, cursor: "pointer"
            }}>−</button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600, color: T.ink }}>{studentCount}</div>
            <button onClick={() => setStudentCount(studentCount + 1)} style={{
              background: T.primary, color: T.surface, border: "none",
              width: 36, height: 36, borderRadius: 6, fontSize: 16,
              fontWeight: 600, cursor: "pointer"
            }}>+</button>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px", borderRadius: 8,
          background: T.primary, color: T.surface, border: "none",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s"
        }}>新增</button>
      </div>
    </div>
  );
}

// ====== 儲值 Modal ======
function RechargeModal({ show, onClose, currentBalance = 15000 }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const rechargeOptions = [
    { amount: 5000, discount: 0, label: "5,000 元" },
    { amount: 10000, discount: 500, label: "10,000 元 - 省 500" },
    { amount: 20000, discount: 1500, label: "20,000 元 - 省 1,500" },
    { amount: 50000, discount: 5000, label: "50,000 元 - 省 5,000" },
  ];

  if (!show) return null;

  const displayAmount = useCustom ? customAmount : (selectedPlan?.amount || 0);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
      zIndex: 1000
    }}>
      <div style={{
        width: "100%", maxWidth: "100vw",
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "24px 20px 32px", animation: "slideUp 0.3s ease-out",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>儲值</div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 24,
            cursor: "pointer", color: T.inkSoft, padding: 0, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        <div style={{ marginBottom: 16, padding: "12px 16px", background: T.borderSoft, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 4 }}>現有餘額</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.primary }}>NT$ {currentBalance.toLocaleString()}</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.ink }}>選擇儲值方案</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rechargeOptions.map((opt, i) => (
              <label key={i} style={{
                display: "flex", alignItems: "center", padding: "12px", borderRadius: 8,
                background: selectedPlan?.amount === opt.amount && !useCustom ? T.primarySoft : T.borderSoft,
                cursor: "pointer", border: selectedPlan?.amount === opt.amount && !useCustom ? "2px solid " + T.primary : "1px solid " + T.border,
                transition: "all 0.2s"
              }}>
                <input type="radio" name="plan" value={opt.amount}
                  checked={selectedPlan?.amount === opt.amount && !useCustom}
                  onChange={() => { setSelectedPlan(opt); setUseCustom(false); }}
                  style={{ marginRight: 12, cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: T.ink }}>{opt.label}</div>
                  {opt.discount > 0 && (
                    <div style={{ fontSize: 12, color: T.primary, marginTop: 2 }}>省 {opt.discount} 元</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 10 }}>自訂金額</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: useCustom ? T.primarySoft : T.borderSoft,
            padding: "10px 12px", borderRadius: 8, border: useCustom ? "2px solid " + T.primary : "1px solid " + T.border,
            transition: "all 0.2s"
          }}>
            <span style={{ color: T.inkSoft, fontWeight: 500 }}>NT$</span>
            <input type="number" placeholder="輸入金額" value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setUseCustom(true); }}
              style={{
                flex: 1, border: "none", background: "transparent", fontSize: 16,
                fontWeight: 600, color: T.ink, outline: "none", padding: "4px 0"
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20, padding: "12px", background: T.accentSoft, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 4 }}>儲值後餘額</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.accent }}>NT$ {(currentBalance + (displayAmount ? parseInt(displayAmount) || 0 : 0)).toLocaleString()}</div>
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px", borderRadius: 8,
          background: T.primary, color: T.surface, border: "none",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s"
        }}>確認儲值</button>
      </div>
    </div>
  );
}

// ====== 學生管理 Modal ======
function StudentManagementModal({ show, onClose }) {
  const [students, setStudents] = useState([
    { id: "s1", name: "樹慧", classes: 12, balance: 5600 },
    { id: "s2", name: "Claire", classes: 8, balance: 3200 },
    { id: "s3", name: "Krystal", classes: 15, balance: 8000 },
  ]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editName, setEditName] = useState("");

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditName(student.name);
  };

  const handleSaveStudent = () => {
    if (selectedStudent && editName) {
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, name: editName } : s));
      setSelectedStudent(null);
      setEditName("");
    }
  };

  if (!show) return null;

  if (selectedStudent) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
        zIndex: 1000
      }}>
        <div style={{
          width: "100%", maxWidth: "100vw",
          background: T.surface, borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px", animation: "slideUp 0.3s ease-out",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>編輯學生</div>
            <button onClick={() => { setSelectedStudent(null); setEditName(""); }} style={{
              background: "none", border: "none", fontSize: 24,
              cursor: "pointer", color: T.inkSoft, padding: 0, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.ink }}>學生名稱</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                border: "1px solid " + T.border, fontSize: 15,
                fontFamily: "inherit", outline: "none",
                background: T.borderSoft, color: T.ink
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 10 }}>課程數</div>
            <div style={{ padding: "12px", background: T.borderSoft, borderRadius: 8, color: T.ink, fontWeight: 600 }}>{selectedStudent.classes} 堂</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 10 }}>餘額</div>
            <div style={{ padding: "12px", background: T.borderSoft, borderRadius: 8, color: T.primary, fontWeight: 700 }}>NT$ {selectedStudent.balance.toLocaleString()}</div>
          </div>

          <button onClick={handleSaveStudent} style={{
            width: "100%", padding: "14px", borderRadius: 8,
            background: T.primary, color: T.surface, border: "none",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            marginBottom: 8
          }}>保存</button>
          <button onClick={() => { setSelectedStudent(null); setEditName(""); }} style={{
            width: "100%", padding: "14px", borderRadius: 8,
            background: T.borderSoft, color: T.ink, border: "1px solid " + T.border,
            fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}>取消</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
      zIndex: 1000
    }}>
      <div style={{
        width: "100%", maxWidth: "100vw",
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "24px 20px 32px", animation: "slideUp 0.3s ease-out",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>學生管理</div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 24,
            cursor: "pointer", color: T.inkSoft, padding: 0, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "60vh", overflow: "auto" }}>
          {students.map(student => (
            <div key={student.id} style={{
              padding: "12px", background: T.borderSoft, borderRadius: 8,
              border: "1px solid " + T.border,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", transition: "all 0.2s"
            }} onClick={() => handleEditStudent(student)}>
              <div>
                <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>{student.name}</div>
                <div style={{ fontSize: 12, color: T.inkSoft }}>課程: {student.classes} 堂 | 餘額: NT$ {student.balance.toLocaleString()}</div>
              </div>
              <div style={{ color: T.primary, fontSize: 18 }}>→</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px", borderRadius: 8,
          background: T.borderSoft, color: T.ink, border: "1px solid " + T.border,
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          marginTop: 16
        }}>關閉</button>
      </div>
    </div>
  );
}

// ====== 課程不足提示 Modal ======
function InsufficientClassesModal({ show, onClose, currentClasses = 2 }) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1001
    }}>
      <div style={{
        background: T.surface, borderRadius: 16, padding: "32px 24px",
        maxWidth: 320, boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        textAlign: "center", animation: "scaleIn 0.3s ease-out"
      }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto 16px",
          background: T.blushSoft, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32
        }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>課程不足</div>
        <div style={{ fontSize: 14, color: T.inkSoft, marginBottom: 16 }}>
          您現有 {currentClasses} 堂課程，該上課需要 4 堂。請先購買課程包。
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", borderRadius: 8,
          background: T.danger, color: T.surface, border: "none",
          fontSize: 15, fontWeight: 600, cursor: "pointer"
        }}>我知道了</button>
      </div>
    </div>
  );
}

// ====== 儲值不足提示 Modal ======
function InsufficientBalanceModal({ show, onClose, currentBalance = 3000, requiredAmount = 5000 }) {
  if (!show) return null;

  const shortfall = requiredAmount - currentBalance;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1001
    }}>
      <div style={{
        background: T.surface, borderRadius: 16, padding: "32px 24px",
        maxWidth: 320, boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        textAlign: "center", animation: "scaleIn 0.3s ease-out"
      }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto 16px",
          background: T.blushSoft, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32
        }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>餘額不足</div>
        <div style={{ fontSize: 14, color: T.inkSoft, marginBottom: 4 }}>
          您現有 NT$ {currentBalance.toLocaleString()}，
        </div>
        <div style={{ fontSize: 14, color: T.inkSoft, marginBottom: 16 }}>
          該上課需要 NT$ {requiredAmount.toLocaleString()}。
        </div>
        <div style={{
          padding: "12px", background: T.blushSoft, borderRadius: 8,
          fontSize: 14, fontWeight: 600, color: T.danger, marginBottom: 16
        }}>還需要 NT$ {shortfall.toLocaleString()}</div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", borderRadius: 8,
          background: T.primary, color: T.surface, border: "none",
          fontSize: 15, fontWeight: 600, cursor: "pointer"
        }}>去儲值</button>
      </div>
    </div>
  );
}

// ====== Demo Container ======
function ModalsDemo() {
  const [showAdd, setShowAdd] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showInsufficientClasses, setShowInsufficientClasses] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: T.bg, position: "relative", overflow: "hidden",
      fontFamily: "'Noto Sans TC', sans-serif"
    }}>
      <BackdropList />

      {/* 底部 FAB 按鈕 */}
      <div style={{
        position: "fixed", bottom: 20, right: 20,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 100
      }}>
        <button onClick={() => setShowAdd(true)} style={{
          width: 56, height: 56, borderRadius: "50%",
          background: T.primary, color: T.surface, border: "none",
          fontSize: 24, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(139, 149, 135, 0.3)"
        }}>+</button>
        <button onClick={() => setShowRecharge(true)} style={{
          width: 56, height: 56, borderRadius: "50%",
          background: T.accent, color: T.surface, border: "none",
          fontSize: 18, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(184, 158, 139, 0.3)"
        }}>💳</button>
        <button onClick={() => setShowStudents(true)} style={{
          width: 56, height: 56, borderRadius: "50%",
          background: T.primary, color: T.surface, border: "none",
          fontSize: 18, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(139, 149, 135, 0.3)"
        }}>👥</button>
      </div>

      {/* 警告訊息 按鈕 */}
      <div style={{
        position: "fixed", bottom: 20, left: 20,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 100
      }}>
        <button onClick={() => setShowInsufficientClasses(true)} style={{
          padding: "10px 16px", borderRadius: 8,
          background: T.danger, color: T.surface, border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>課程不足</button>
        <button onClick={() => setShowInsufficientBalance(true)} style={{
          padding: "10px 16px", borderRadius: 8,
          background: T.danger, color: T.surface, border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>餘額不足</button>
      </div>

      <AddClassModal show={showAdd} onClose={() => setShowAdd(false)} />
      <RechargeModal show={showRecharge} onClose={() => setShowRecharge(false)} currentBalance={15000} />
      <StudentManagementModal show={showStudents} onClose={() => setShowStudents(false)} />
      <InsufficientClassesModal show={showInsufficientClasses} onClose={() => setShowInsufficientClasses(false)} currentClasses={2} />
      <InsufficientBalanceModal show={showInsufficientBalance} onClose={() => setShowInsufficientBalance(false)} currentBalance={3000} requiredAmount={5000} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = ModalsDemo;
}
