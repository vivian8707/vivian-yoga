// Demo scenes — faithful recreation of Vivian Yoga Class actual UI for 30s video.

const TOK = {
  bg: "#f6f3ee", surface: "#ffffff", card: "#fbf9f5",
  ink: "#1f1d1a", inkSoft: "#a39e96",
  primary: "#8b9587", primarySoft: "#e1e5dc",
  accent: "#b89e8b", accentSoft: "#ece2d7",
  border: "#ebe6dc", borderSoft: "#f2eee5"
};

const LOC = {
  "社區小班": { bg: "#e1e5dc", fg: "#5b6650" },
  "到府":     { bg: "#ecdfdf", fg: "#7c5e5e" },
  "天空":     { bg: "#dee2e8", fg: "#5d6776" },
  "台中":     { bg: "#ece2d7", fg: "#7a624e" }
};

const FONT = "'Noto Sans TC', system-ui, sans-serif";
const SERIF = "'Cormorant Garamond', serif";

// Fake data
const STUDENTS = [
  { id:"s1", name:"Emma",    loc:"社區小班", remaining: 9 },
  { id:"s2", name:"Sarah",   loc:"社區小班", remaining: 4 },
  { id:"s3", name:"Mia",     loc:"到府",     remaining: 6 },
];
const RECORDS_MAY = [
  { d: 8, dow:"FRI", loc:"社區小班", n:2, names:"Emma、Sarah", amt: 1060 },
  { d: 5, dow:"TUE", loc:"社區小班", n:3, names:"Emma、Sarah、Mia", amt: 1590 },
];
const RECORDS_APR = [
  { d:28, dow:"TUE", loc:"社區小班", n:3, names:"Emma、Sarah、Mia", amt: 1590 },
  { d:24, dow:"FRI", loc:"到府",     n:1, names:"Mia", amt: 600,  note:"忠孝敦化" },
  { d:21, dow:"TUE", loc:"社區小班", n:2, names:"Emma、Sarah", amt: 1060 },
];

// — Phone shell — full app chrome (Hi, Vivian + hero + tabs)
function PhoneShell({ tab = 0, monthIncome = 1250, monthLessons = 1, hideHero = false, children, onlyContent = false }) {
  const tabs = ["上課記錄", "儲值記錄", "學生管理", "收入記錄"];
  return (
    <div style={{
      width: 375, height: 812, background: TOK.bg,
      fontFamily: FONT, color: TOK.ink, position: "relative", overflow: "hidden"
    }}>
      {/* iOS Status bar */}
      <div style={{
        height: 44, padding: "0 22px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        fontSize: 13, fontWeight: 600
      }}>
        <span>9:41</span>
        <span style={{ width: 16, height: 10, border: "1.2px solid #1f1d1a", borderRadius: 2 }} />
      </div>

      {/* Header: Hi, Vivian + sync badge + avatar */}
      <div style={{
        padding: "8px 22px 14px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 0.5 }}>Hi, Vivian</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: TOK.surface, border: `1px solid ${TOK.borderSoft}`,
            fontSize: 10.5, color: TOK.inkSoft
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: TOK.primary }} />
            同步中
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 19,
            background: `linear-gradient(135deg, ${TOK.primarySoft}, ${TOK.accentSoft})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${TOK.border}`
          }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: TOK.primary, opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Hero card */}
      {!hideHero && <div style={{ margin: "0 22px 14px" }}>
        <div style={{
          background: TOK.surface, borderRadius: 24, padding: "20px 22px",
          border: `1px solid ${TOK.borderSoft}`, position: "relative", overflow: "hidden",
          height: 140
        }}>
          <div style={{
            fontSize: 10, color: TOK.inkSoft, letterSpacing: 3, fontWeight: 500
          }}>2026 · MAY</div>
          {/* big serif 5 */}
          <div style={{
            position: "absolute", left: 18, top: 24,
            fontFamily: SERIF, fontSize: 130, fontWeight: 700,
            color: TOK.primary, opacity: 0.18, lineHeight: 0.9, letterSpacing: -3
          }}>5</div>
          {/* income top-right */}
          <div style={{
            position: "absolute", right: 22, top: 36,
            fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: TOK.primary,
            letterSpacing: 0.3
          }}>${monthIncome.toLocaleString()}</div>
          {/* lessons */}
          <div style={{
            position: "absolute", right: 22, bottom: 20,
            display: "flex", alignItems: "baseline", gap: 4
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: TOK.accent }}>{monthLessons}</span>
            <span style={{ fontSize: 11, color: TOK.inkSoft }}>堂</span>
          </div>
        </div>
      </div>}

      {/* Tabs */}
      <div style={{
        margin: "0 22px 14px", display: "flex", gap: 4
      }}>
        {tabs.map((t, i) =>
          <div key={t} style={{
            flex: 1, padding: "9px 0", borderRadius: 999, textAlign: "center",
            background: tab === i ? TOK.primary : "transparent",
            color: tab === i ? TOK.surface : TOK.inkSoft,
            fontSize: 12, fontWeight: tab === i ? 600 : 500
          }}>{t}</div>
        )}
      </div>

      {/* Body */}
      <div style={{
        padding: "0 22px",
        height: 812 - 44 - 56 - (hideHero ? 0 : 154) - 50,
        overflow: "hidden"
      }}>
        {children}
      </div>
    </div>
  );
}

function MonthDivider({ y, m }) {
  return (
    <div style={{
      fontSize: 11, color: TOK.inkSoft, letterSpacing: 2,
      fontFamily: SERIF, padding: "8px 4px 2px", marginTop: 6, marginBottom: 6,
      display: "flex", alignItems: "baseline", gap: 8
    }}>
      <span style={{ fontSize: 16, fontWeight: 500, color: TOK.ink, letterSpacing: 1 }}>{y} / {m}月</span>
      <span style={{ flex: 1, height: 1, background: TOK.borderSoft }} />
    </div>
  );
}

function ClassRow({ r }) {
  const tone = LOC[r.loc] || LOC["社區小班"];
  return (
    <div style={{
      background: TOK.surface, borderRadius: 20, padding: "12px 14px",
      border: `1px solid ${TOK.borderSoft}`, marginBottom: 8,
      display: "flex", alignItems: "center", gap: 12
    }}>
      <div style={{
        width: 44, textAlign: "center",
        borderRight: `1px solid ${TOK.borderSoft}`, paddingRight: 10
      }}>
        <div style={{
          fontSize: 22, fontWeight: 600, color: TOK.ink, lineHeight: 1,
          fontFamily: SERIF
        }}>{r.d}</div>
        <div style={{ fontSize: 9, color: TOK.inkSoft, letterSpacing: 1, marginTop: 4 }}>{r.dow}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 10, color: tone.fg, fontWeight: 600,
            padding: "2px 9px", background: tone.bg, borderRadius: 999, letterSpacing: 0.5
          }}>{r.loc}</span>
          <span style={{ fontSize: 10.5, color: TOK.inkSoft }}>{r.n} 人</span>
        </div>
        <div style={{
          fontSize: 13, color: TOK.ink,
          display: "flex", alignItems: "baseline", gap: 6,
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"
        }}>
          <span>{r.names}</span>
          {r.note && <span style={{
            fontSize: 10.5, color: TOK.inkSoft,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>· {r.note}</span>}
        </div>
      </div>
      <div style={{
        fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: TOK.accent
      }}>${r.amt.toLocaleString()}</div>
      <div style={{ fontSize: 10, color: TOK.inkSoft }}>▼</div>
    </div>
  );
}

// — Modal sliding up
function ModalSheet({ progress, children, height = 540 }) {
  const ty = (1 - progress) * height;
  return (
    <>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(31,29,26,0.35)",
        opacity: progress, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: TOK.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "20px 22px 28px", height,
        transform: `translateY(${ty}px)`,
        boxShadow: "0 -10px 30px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          width: 40, height: 4, background: TOK.border, borderRadius: 4, margin: "0 auto 16px"
        }} />
        {children}
      </div>
    </>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: TOK.inkSoft, marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
      {children}
    </div>
  );
}

function TapDot({ x, y }) {
  return (
    <div style={{
      position: "absolute", left: x - 18, top: y - 18,
      width: 36, height: 36, borderRadius: 18,
      background: "rgba(139,149,135,0.4)",
      border: "2px solid #8b9587",
      animation: "tapPulse 0.6s ease-out",
      pointerEvents: "none", zIndex: 50
    }} />
  );
}

// ─── SCENE 1: Title ───
function Scene_Title({ progress }) {
  const fade = Math.min(1, progress * 3);
  const exit = progress > 0.85 ? (progress - 0.85) * 6.7 : 0;
  return (
    <div style={{
      width: 375, height: 812, background: TOK.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, color: TOK.ink, opacity: 1 - exit
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: 72, fontWeight: 600, color: TOK.primary,
        opacity: fade, transform: `translateY(${(1 - fade) * 20}px)`
      }}>Vivian</div>
      <div style={{
        fontFamily: SERIF, fontSize: 36, color: TOK.accent, marginTop: -6, opacity: fade
      }}>Yoga Class</div>
      <div style={{
        marginTop: 32, fontSize: 22, fontWeight: 500, lineHeight: 1.6,
        textAlign: "center", opacity: progress > 0.3 ? 1 : 0,
        transform: `translateY(${progress > 0.3 ? 0 : 16}px)`,
        transition: "opacity .4s, transform .4s"
      }}>
        再也不用<br/>整理記錄了
      </div>
    </div>
  );
}

// ─── SCENE 2: Add student (學生管理 tab + new student modal) ───
function Scene_AddStudent({ progress }) {
  const tapFab = progress > 0.05 && progress < 0.15;
  const modalP = Math.max(0, Math.min(1, (progress - 0.1) / 0.12));
  const modalOut = progress > 0.85 ? Math.min(1, (progress - 0.85) / 0.1) : 0;
  const modalShow = modalP - modalOut;

  const nameTyped = progress > 0.3 ? Math.min(4, Math.floor((progress - 0.3) * 25)) : 0;
  const locPick = progress > 0.55;
  const tapSave = progress > 0.78 && progress < 0.86;
  const showCard = progress > 0.86;

  const name = "Emma".slice(0, nameTyped);

  return (
    <PhoneShell tab={2} hideHero monthIncome={0} monthLessons={0}>
      {!showCard ? (
        <div style={{
          marginTop: 100, textAlign: "center", color: TOK.inkSoft, fontSize: 14
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: TOK.primarySoft, margin: "0 auto 16px", opacity: 0.6
          }} />
          還沒有學生
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: 10, color: LOC["社區小班"].fg, fontWeight: 600,
            padding: "2px 9px", background: LOC["社區小班"].bg, borderRadius: 999,
            display: "inline-block", marginBottom: 8, letterSpacing: 0.5
          }}>社區小班　1 位</div>
          <StudentRowFull name="Emma" remaining={0} note="尚無紀錄" />
        </div>
      )}

      <div style={{
        position: "absolute", right: 22, bottom: 28,
        width: 52, height: 52, borderRadius: 26,
        background: TOK.primary, color: "#fff",
        fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 6px 18px ${TOK.primary}55`,
        transform: tapFab ? "scale(0.92)" : "scale(1)",
        transition: "transform .15s",
        opacity: modalShow > 0.5 ? 0 : 1
      }}>+</div>
      {tapFab && <TapDot x={353} y={702} />}

      {modalShow > 0.01 && <ModalSheet progress={modalShow} height={500}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>新增學生</div>
        <FormRow label="學生姓名">
          <div style={{
            padding: "12px 14px", background: TOK.surface,
            borderRadius: 12, border: `1px solid ${TOK.border}`,
            fontSize: 15, minHeight: 22
          }}>{name}<span style={{
            display: "inline-block", width: 1.5, height: 18, background: TOK.primary,
            verticalAlign: "middle", marginLeft: 1,
            opacity: nameTyped > 0 && nameTyped < 4 ? 1 : 0
          }} /></div>
        </FormRow>
        <FormRow label="上課地點">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(LOC).map((k) => {
              const sel = locPick && k === "社區小班";
              return (
                <div key={k} style={{
                  padding: "8px 14px", borderRadius: 999,
                  background: sel ? LOC[k].bg : TOK.surface,
                  color: sel ? LOC[k].fg : TOK.inkSoft,
                  border: `1px solid ${sel ? LOC[k].fg + "55" : TOK.border}`,
                  fontSize: 13, fontWeight: sel ? 600 : 500
                }}>{k}</div>
              );
            })}
          </div>
        </FormRow>

        <div style={{
          position: "absolute", left: 22, right: 22, bottom: 28
        }}>
          <div style={{
            padding: "14px 0", borderRadius: 14,
            background: TOK.primary, color: "#fff",
            textAlign: "center", fontSize: 15, fontWeight: 600,
            transform: tapSave ? "scale(0.96)" : "scale(1)",
            transition: "transform .15s"
          }}>儲存</div>
        </div>
        {tapSave && <TapDot x={187} y={460} />}
      </ModalSheet>}
    </PhoneShell>
  );
}

function StudentRowFull({ name, remaining, note, lastDate }) {
  return (
    <div style={{
      background: TOK.surface, borderRadius: 18, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 12,
      border: `1px solid ${TOK.borderSoft}`, marginBottom: 8
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: `linear-gradient(135deg, ${TOK.primarySoft}, ${TOK.accentSoft})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: TOK.primary, fontWeight: 600, fontSize: 13
      }}>{name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 11, color: TOK.inkSoft, marginTop: 1 }}>
          {lastDate ? `最近上課 · ${lastDate}` : note}
        </div>
      </div>
      {remaining > 0 && <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: TOK.primary,
          fontFamily: SERIF, lineHeight: 1
        }}>{remaining}</div>
        <div style={{ fontSize: 9, color: TOK.inkSoft, letterSpacing: 1, marginTop: 2 }}>剩餘堂數</div>
      </div>}
    </div>
  );
}

// ─── SCENE 3: Add class — full home with hero + records list + modal ───
function Scene_AddClass({ progress }) {
  const tapFab = progress > 0.05 && progress < 0.15;
  const modalP = Math.max(0, Math.min(1, (progress - 0.1) / 0.12));
  const modalOut = progress > 0.88 ? Math.min(1, (progress - 0.88) / 0.1) : 0;
  const modalShow = modalP - modalOut;

  const datePicked = progress > 0.3;
  const locPicked = progress > 0.42;
  const emmaAdd = progress > 0.55;
  const sarahAdd = progress > 0.62;
  const planPicked = progress > 0.78;
  const tapSave = progress > 0.85 && progress < 0.92;

  return (
    <PhoneShell tab={0} monthIncome={1250} monthLessons={1}>
      <MonthDivider y="2026" m={5} />
      <ClassRow r={RECORDS_MAY[1]} />

      <div style={{
        position: "absolute", right: 22, bottom: 28,
        width: 52, height: 52, borderRadius: 26,
        background: TOK.primary, color: "#fff",
        fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 6px 18px ${TOK.primary}55`,
        transform: tapFab ? "scale(0.92)" : "scale(1)",
        transition: "transform .15s",
        opacity: modalShow > 0.5 ? 0 : 1
      }}>+</div>
      {tapFab && <TapDot x={353} y={702} />}

      {modalShow > 0.01 && <ModalSheet progress={modalShow} height={620}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>新增上課紀錄</div>

        <FormRow label="日期">
          <div style={{
            padding: "10px 14px", background: TOK.surface,
            borderRadius: 12, border: `1px solid ${TOK.border}`,
            fontSize: 14, fontFamily: SERIF
          }}>{datePicked ? "2026 / 5 / 8 (Fri)" : "—"}</div>
        </FormRow>

        <FormRow label="上課地點">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.keys(LOC).map((k) => {
              const sel = locPicked && k === "社區小班";
              return (
                <div key={k} style={{
                  padding: "7px 12px", borderRadius: 999,
                  background: sel ? LOC[k].bg : TOK.surface,
                  color: sel ? LOC[k].fg : TOK.inkSoft,
                  border: `1px solid ${sel ? LOC[k].fg + "55" : TOK.border}`,
                  fontSize: 12, fontWeight: sel ? 600 : 500
                }}>{k}</div>
              );
            })}
          </div>
        </FormRow>

        <FormRow label="出席學生">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip name="Emma" sel={emmaAdd} />
            <Chip name="Sarah" sel={sarahAdd} />
            <Chip name="Mia" sel={false} />
          </div>
        </FormRow>

        <FormRow label="方案 / 計費">
          <div style={{
            padding: "12px 14px",
            background: planPicked ? TOK.primarySoft : TOK.surface,
            borderRadius: 12, border: `1px solid ${planPicked ? TOK.primary + "55" : TOK.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: 14, fontWeight: planPicked ? 600 : 500 }}>
              {planPicked ? "10 堂方案 · 扣 1 堂 / 人" : "選擇方案"}
            </span>
            {planPicked && <span style={{ fontSize: 13, color: TOK.primary, fontFamily: SERIF }}>$1,060</span>}
          </div>
        </FormRow>

        <div style={{ position: "absolute", left: 22, right: 22, bottom: 28 }}>
          <div style={{
            padding: "14px 0", borderRadius: 14,
            background: TOK.primary, color: "#fff",
            textAlign: "center", fontSize: 15, fontWeight: 600,
            transform: tapSave ? "scale(0.96)" : "scale(1)",
            transition: "transform .15s"
          }}>儲存</div>
        </div>
        {tapSave && <TapDot x={187} y={580} />}
      </ModalSheet>}
    </PhoneShell>
  );
}

function Chip({ name, sel }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 11px 5px 5px", borderRadius: 999,
      background: sel ? TOK.primarySoft : TOK.surface,
      border: `1px solid ${sel ? TOK.primary + "55" : TOK.border}`,
      fontSize: 12, fontWeight: sel ? 600 : 500,
      color: sel ? TOK.primary : TOK.ink
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 11,
        background: `linear-gradient(135deg, ${TOK.primarySoft}, ${TOK.accentSoft})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 600, color: TOK.primary
      }}>{name[0]}</span>
      {name}
    </div>
  );
}

// ─── SCENE 4: Topup ───
function Scene_Topup({ progress }) {
  const modalP = Math.max(0, Math.min(1, progress / 0.12));
  const modalOut = progress > 0.88 ? Math.min(1, (progress - 0.88) / 0.1) : 0;
  const modalShow = modalP - modalOut;

  const stuPicked = progress > 0.25;
  const planPicked = progress > 0.55;
  const tapSave = progress > 0.75 && progress < 0.83;

  return (
    <PhoneShell tab={1} monthIncome={1250} monthLessons={1}>
      <MonthDivider y="2026" m={5} />
      <PaymentRow name="Emma" plan="10 堂方案" amount={5300} fade={progress < 0.85 ? 0.4 : 1} />

      {modalShow > 0.01 && <ModalSheet progress={modalShow} height={560}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>新增儲值紀錄</div>

        <FormRow label="學生">
          <div style={{
            padding: "10px 14px",
            background: stuPicked ? TOK.primarySoft : TOK.surface,
            borderRadius: 12, border: `1px solid ${stuPicked ? TOK.primary + "55" : TOK.border}`,
            display: "flex", alignItems: "center", gap: 10
          }}>
            {stuPicked && <span style={{
              width: 26, height: 26, borderRadius: 13,
              background: `linear-gradient(135deg, ${TOK.primarySoft}, ${TOK.accentSoft})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: TOK.primary
            }}>E</span>}
            <span style={{ fontSize: 14, fontWeight: stuPicked ? 600 : 500 }}>
              {stuPicked ? "Emma" : "選擇學生"}
            </span>
          </div>
        </FormRow>

        <FormRow label="方案">
          {[
            { n:"10 堂方案", p:5300, l:10, sel: planPicked },
            { n:"20 堂方案", p:10000, l:20, sel: false },
            { n:"單堂",      p:600, l:1, sel: false }
          ].map((p) =>
            <div key={p.n} style={{
              padding: "11px 14px", marginBottom: 7,
              background: p.sel ? TOK.primarySoft : TOK.surface,
              borderRadius: 12,
              border: `1px solid ${p.sel ? TOK.primary + "55" : TOK.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: 13, fontWeight: p.sel ? 600 : 500 }}>{p.n}</span>
              <span style={{ fontSize: 14, color: p.sel ? TOK.primary : TOK.inkSoft, fontFamily: SERIF }}>
                ${p.p.toLocaleString()}
              </span>
            </div>
          )}
        </FormRow>

        <div style={{ position: "absolute", left: 22, right: 22, bottom: 28 }}>
          <div style={{
            padding: "14px 0", borderRadius: 14,
            background: TOK.primary, color: "#fff",
            textAlign: "center", fontSize: 15, fontWeight: 600,
            transform: tapSave ? "scale(0.96)" : "scale(1)",
            transition: "transform .15s"
          }}>儲存</div>
        </div>
        {tapSave && <TapDot x={187} y={520} />}
      </ModalSheet>}
    </PhoneShell>
  );
}

function PaymentRow({ name, plan, amount, fade = 1 }) {
  return (
    <div style={{
      background: TOK.surface, borderRadius: 18, padding: "14px 16px",
      border: `1px solid ${TOK.borderSoft}`,
      display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
      opacity: fade
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: `linear-gradient(135deg, ${TOK.primarySoft}, ${TOK.accentSoft})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: TOK.primary, fontWeight: 600, fontSize: 13
      }}>{name[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 11, color: TOK.inkSoft, marginTop: 1 }}>{plan}</div>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 600, color: TOK.accent, fontFamily: SERIF
      }}>${amount.toLocaleString()}</div>
    </div>
  );
}

// ─── SCENE 5: Student remaining (countdown 10 → 0) ───
function Scene_Student({ progress }) {
  const countP = Math.min(1, Math.max(0, (progress - 0.2) / 0.7));
  const num = Math.max(0, 10 - Math.round(10 * countP));
  return (
    <PhoneShell tab={2} hideHero>
      <div>
        <div style={{
          fontSize: 10, color: LOC["社區小班"].fg, fontWeight: 600,
          padding: "2px 9px", background: LOC["社區小班"].bg, borderRadius: 999,
          display: "inline-block", marginBottom: 8, letterSpacing: 0.5
        }}>社區小班　2 位</div>

        <div style={{
          borderRadius: 20, padding: 2,
          background: progress > 0.1 ? `linear-gradient(135deg, ${TOK.primary}, ${TOK.accent})` : "transparent",
          marginBottom: 8, transition: "background .4s"
        }}>
          <div style={{ background: TOK.bg, borderRadius: 18 }}>
            <StudentRowFull name="Emma" remaining={num} lastDate="2026/05/08" />
          </div>
        </div>
        <StudentRowFull name="Sarah" remaining={4} lastDate="2026/05/08" />

        <div style={{
          fontSize: 10, color: LOC["到府"].fg, fontWeight: 600,
          padding: "2px 9px", background: LOC["到府"].bg, borderRadius: 999,
          display: "inline-block", marginTop: 8, marginBottom: 8, letterSpacing: 0.5
        }}>到府　1 位</div>
        <StudentRowFull name="Mia" remaining={6} lastDate="2026/04/24" />
      </div>
    </PhoneShell>
  );
}

// ─── SCENE 6: Income ───
function Scene_Income({ progress }) {
  const target = 28400;
  const num = Math.round(target * Math.min(1, progress / 0.5));
  return (
    <PhoneShell tab={3} monthIncome={1250} monthLessons={1}>
      <div style={{
        background: TOK.surface, borderRadius: 22, padding: "20px 22px",
        border: `1px solid ${TOK.borderSoft}`
      }}>
        <div style={{ fontSize: 11, color: TOK.inkSoft, letterSpacing: 1, marginBottom: 10 }}>近 6 個月</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
          {[0.55, 0.7, 0.6, 0.85, 0.95, 0.92].map((v, i) => {
            const grow = Math.min(1, Math.max(0, (progress - 0.15 - i * 0.05) * 4));
            return (
              <div key={i} style={{
                flex: 1, height: `${v * 100 * grow}%`,
                background: i === 5 ? TOK.primary : TOK.primarySoft,
                borderRadius: "6px 6px 2px 2px", alignSelf: "flex-end"
              }} />
            );
          })}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 9, color: TOK.inkSoft, marginTop: 6, fontFamily: SERIF
        }}>
          <span>12月</span><span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <Tile sub="總收入" big={`$${num.toLocaleString()}`} />
        <Tile sub="共上堂數" big="23" />
      </div>
    </PhoneShell>
  );
}

function Tile({ sub, big }) {
  return (
    <div style={{
      flex: 1, background: TOK.surface, borderRadius: 14,
      padding: "14px 12px", textAlign: "center",
      border: `1px solid ${TOK.borderSoft}`
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: TOK.primary,
        fontFamily: SERIF, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 9.5, color: TOK.inkSoft, letterSpacing: 2, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ─── SCENE 7: Outro ───
function Scene_Outro({ progress }) {
  const fade = Math.min(1, progress * 3);
  return (
    <div style={{
      width: 375, height: 812, background: TOK.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, color: TOK.ink, opacity: fade
    }}>
      <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 600, color: TOK.primary }}>Bye</div>
      <div style={{ fontFamily: SERIF, fontSize: 36, color: TOK.accent, marginTop: -4, fontStyle: "italic" }}>spreadsheets</div>
      <div style={{ marginTop: 32, fontSize: 18, color: TOK.inkSoft, letterSpacing: 2 }}>VIVIAN YOGA CLASS</div>
    </div>
  );
}

Object.assign(window, {
  Scene_Title, Scene_AddStudent, Scene_AddClass, Scene_Topup,
  Scene_Student, Scene_Income, Scene_Outro,
  DemoCaption: null
});
