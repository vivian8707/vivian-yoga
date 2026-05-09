(function () {
  const KEY = "vyc.v1";
  const listeners = new Set();

  const DEFAULT_HOME_PLANS = [
    { id: "hp1", label: "一對一", price: 1800 },
    { id: "hp2", label: "一對二", price: 2000 },
    { id: "hp3", label: "一對三", price: 1500 },
  ];
  const DEFAULT_SKY_RATES = [
    [2,600],[3,800],[4,900],[5,1000],[6,1200],[7,1400],[8,1600],[9,1800],
    [10,2200],[11,2500],[12,2800],[13,3100],[14,3400],[15,3700],[16,4000]
  ];
  const DEFAULT_VENUES = [
    { id: "v1", name: "園頂",  mode: "community", colorIndex: 0 },
    { id: "v2", name: "到府",  mode: "home",      colorIndex: 1,
      homePlans: DEFAULT_HOME_PLANS.map(p => ({...p})),
    },
    { id: "v3", name: "天空",  mode: "sky",       colorIndex: 2,
      skyRates: DEFAULT_SKY_RATES.map(r => [...r]),
    },
    { id: "v4", name: "台中",  mode: "manual",    colorIndex: 3 },
    { id: "v5", name: "其他",  mode: "manual",    colorIndex: 4 },
  ];
  window.DEFAULT_VENUES      = DEFAULT_VENUES;
  window.DEFAULT_HOME_PLANS  = DEFAULT_HOME_PLANS;
  window.DEFAULT_SKY_RATES   = DEFAULT_SKY_RATES;

  function defaultVenues() {
    return DEFAULT_VENUES.map(v => JSON.parse(JSON.stringify(v)));
  }

  function seed() {
    return {
      students: window.SEED_STUDENTS.slice(),
      records: window.SEED_RECORDS.slice(),
      customPlans: [],
      settings: { displayName: "", venues: defaultVenues() },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const obj = JSON.parse(raw);
      if (!obj.students || !obj.records) return seed();
      if (!obj.customPlans) obj.customPlans = [];
      if (!obj.settings) obj.settings = { displayName: "", venues: defaultVenues() };
      if (!obj.settings.venues) obj.settings.venues = defaultVenues();
      return obj;
    } catch (e) {
      return seed();
    }
  }

  let state = load();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function emit() {
    listeners.forEach(fn => { try { fn(); } catch (e) {} });
  }
  function commit() { persist(); emit(); }

  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // ===== FIFO 扣堂折算: 對每位學生時序模擬，回傳每筆 class attendee 的折算金額 =====
  // 結果結構: { [recordId+":"+studentId]: { perPrice, amount, count } }
  function buildLessonRevenueIndex() {
    const idx = {};
    // group events by student
    const byStu = {};
    state.records.forEach(r => {
      if (r.type === "payment") {
        if (!byStu[r.studentId]) byStu[r.studentId] = [];
        byStu[r.studentId].push({ kind: "pay", date: r.date, classes: r.classes || 0, amount: r.amount || 0, recId: r.id });
      } else if (r.type === "class" && r.attendees) {
        r.attendees.forEach(a => {
          if (!a.usedPackage) return;
          if (!byStu[a.studentId]) byStu[a.studentId] = [];
          byStu[a.studentId].push({ kind: "use", date: r.date, count: a.count || 1, recId: r.id, attName: a.studentName });
        });
      }
    });
    Object.keys(byStu).forEach(stuId => {
      const events = byStu[stuId].slice().sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        // pay before use on same date
        return (a.kind === "pay" ? 0 : 1) - (b.kind === "pay" ? 0 : 1);
      });
      const lots = []; // { remaining, perPrice }
      events.forEach(ev => {
        if (ev.kind === "pay") {
          const pp = ev.classes > 0 ? Math.round(ev.amount / ev.classes) : 0;
          lots.push({ remaining: ev.classes, perPrice: pp });
        } else {
          let need = ev.count, gross = 0, used = 0, lastPrice = 360;
          while (need > 0 && lots.length > 0) {
            const lot = lots[0];
            const take = Math.min(lot.remaining, need);
            gross += take * lot.perPrice;
            used += take;
            lastPrice = lot.perPrice;
            lot.remaining -= take;
            need -= take;
            if (lot.remaining <= 0) lots.shift();
          }
          // if still need (儲值不夠)，剩下用 lastPrice 估
          if (need > 0) {
            gross += need * lastPrice;
            used += need;
          }
          idx[ev.recId + ":" + stuId] = { perPrice: lastPrice, amount: gross, count: ev.count };
        }
      });
    });
    return idx;
  }
  function lessonRevenueFor(record, attendee, _cache) {
    const idx = _cache || buildLessonRevenueIndex();
    const key = record.id + ":" + attendee.studentId;
    if (idx[key]) return idx[key].amount;
    // fallback
    return (attendee.perClassPrice || 360) * (attendee.count || 1);
  }

  // 對單筆上課紀錄計算「顯示用總金額」(含扣堂折算)
  function classDisplayTotal(record, _cache) {
    if (!record || record.type !== "class") return 0;
    if (record.location === "天空" || record.location === "台中" || record.location === "其他") {
      return record.totalAmount || 0;
    }
    if (record.location === "到府") {
      return record.totalAmount || 0;
    }
    if (!record.attendees) return record.totalAmount || 0;
    const idx = _cache || buildLessonRevenueIndex();
    let sum = 0;
    record.attendees.forEach(a => {
      if (a.usedPackage) sum += lessonRevenueFor(record, a, idx);
      else sum += (a.amount || 0);
    });
    return sum;
  }

  // ===== derived =====
  function months() {
    // 月收入 = 該月所有上課的「實收金額」總和 (含天空/台中/其他/到府)
    const idx = buildLessonRevenueIndex();
    const map = {};
    state.records.forEach(r => {
      const key = (r.date || "").slice(0, 7);
      if (!key) return;
      if (r.type === "class") {
        map[key] = (map[key] || 0) + classDisplayTotal(r, idx);
      }
    });
    // Ensure last 12 months keys exist
    const today = new Date();
    const keys = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      keys.push(k);
    }
    return keys.map(k => ({ key: k, value: map[k] || 0 }));
  }

  function lastClassByStudent() {
    const m = {};
    state.records.filter(r => r.type === "class" && r.attendees).forEach(r => {
      r.attendees.forEach(a => {
        if (!m[a.studentId] || r.date > m[a.studentId]) m[a.studentId] = r.date;
      });
    });
    return m;
  }

  function studentHistory(studentId) {
    const idx = buildLessonRevenueIndex();
    const items = [];
    state.records.forEach(r => {
      if (r.type === "class" && r.attendees) {
        const a = r.attendees.find(x => x.studentId === studentId);
        if (a) {
          const cnt = a.count || 1;
          items.push({
            id: r.id + ":" + studentId,
            date: r.date, type: "class",
            location: r.location,
            usedPackage: !!a.usedPackage,
            count: cnt,
            amount: a.usedPackage ? lessonRevenueFor(r, a, idx) : a.amount,
            label: a.classType || (a.usedPackage ? "扣堂數" : "上課"),
          });
        }
      } else if (r.type === "payment" && r.studentId === studentId) {
        items.push({
          id: r.id, date: r.date, type: "payment",
          plan: r.plan, amount: r.amount, classes: r.classes,
        });
      }
    });
    items.sort((a, b) => b.date.localeCompare(a.date));
    return items;
  }

  function studentStats(studentId) {
    let lessons = 0, paid = 0, cashReceived = 0, paidLessons = 0, classCount = 0;
    state.records.forEach(r => {
      if (r.type === "class" && r.attendees) {
        const a = r.attendees.find(x => x.studentId === studentId);
        if (!a) return;
        classCount += 1;
        if (a.usedPackage) lessons += (a.count || 1);
        else cashReceived += (a.amount || 0);
      } else if (r.type === "payment" && r.studentId === studentId) {
        paid += r.amount || 0;
        paidLessons += r.classes || 0;
      }
    });
    const remaining = Math.max(0, paidLessons - lessons);
    return { lessons, paid, cashReceived, paidLessons, remaining, classCount, totalRevenue: paid + cashReceived };
  }

  // ===== mutations =====
  const actions = {
    addClass(rec) {
      const r = Object.assign({ id: uid("r"), type: "class" }, rec);
      state.records.push(r);
      // decrement remaining for attendees that used package
      if (r.attendees) {
        r.attendees.forEach(a => {
          if (a.usedPackage) {
            const s = state.students.find(s => s.id === a.studentId);
            if (s) s.remaining = Math.max(0, (s.remaining || 0) - (a.count || 1));
          }
        });
      }
      commit();
      return r.id;
    },
    updateClass(id, patch) {
      const old = state.records.find(x => x.id === id);
      if (!old || old.type !== "class") return;
      // revert package decrements from old
      if (old.attendees) {
        old.attendees.forEach(a => {
          if (a.usedPackage) {
            const s = state.students.find(s => s.id === a.studentId);
            if (s) s.remaining = (s.remaining || 0) + (a.count || 1);
          }
        });
      }
      // apply patch (preserve id/type)
      Object.assign(old, patch, { id, type: "class" });
      // re-apply package decrements
      if (old.attendees) {
        old.attendees.forEach(a => {
          if (a.usedPackage) {
            const s = state.students.find(s => s.id === a.studentId);
            if (s) s.remaining = Math.max(0, (s.remaining || 0) - (a.count || 1));
          }
        });
      }
      commit();
    },
    deleteRecord(id) {
      const r = state.records.find(x => x.id === id);
      if (!r) return;
      // revert remaining
      if (r.type === "class" && r.attendees) {
        r.attendees.forEach(a => {
          if (a.usedPackage) {
            const s = state.students.find(s => s.id === a.studentId);
            if (s) s.remaining = (s.remaining || 0) + (a.count || 1);
          }
        });
      } else if (r.type === "payment") {
        const s = state.students.find(s => s.id === r.studentId);
        if (s) s.remaining = Math.max(0, (s.remaining || 0) - (r.classes || 0));
      }
      state.records = state.records.filter(x => x.id !== id);
      commit();
    },
    addPayment(p) {
      const rec = Object.assign({ id: uid("p"), type: "payment" }, p);
      state.records.push(rec);
      const s = state.students.find(s => s.id === rec.studentId);
      if (s) s.remaining = (s.remaining || 0) + (rec.classes || 0);
      commit();
      return rec.id;
    },
    updatePayment(id, patch) {
      const old = state.records.find(x => x.id === id);
      if (!old || old.type !== "payment") return;
      // revert old remaining
      const oldStu = state.students.find(s => s.id === old.studentId);
      if (oldStu) oldStu.remaining = Math.max(0, (oldStu.remaining || 0) - (old.classes || 0));
      Object.assign(old, patch, { id, type: "payment" });
      // re-apply
      const newStu = state.students.find(s => s.id === old.studentId);
      if (newStu) newStu.remaining = (newStu.remaining || 0) + (old.classes || 0);
      commit();
    },
    addStudent(s) {
      const rec = Object.assign({ id: uid("s"), remaining: 0 }, s);
      state.students.push(rec);
      commit();
      return rec.id;
    },
    updateStudent(id, patch) {
      const s = state.students.find(s => s.id === id);
      if (s) { Object.assign(s, patch); commit(); }
    },
    deleteStudent(id) {
      state.students = state.students.filter(s => s.id !== id);
      commit();
    },
    reset() { state = seed(); commit(); },
    updateSettings(patch) {
      state.settings = Object.assign({}, state.settings || {}, patch);
      commit();
    },
    addCustomPlan(plan) {
      // dedupe by name+classes+price
      const exists = (state.customPlans || []).some(p =>
        p.name === plan.name && p.classes === plan.classes && p.price === plan.price);
      if (exists) return;
      if (!state.customPlans) state.customPlans = [];
      state.customPlans.push(Object.assign({ id: uid("cp") }, plan));
      commit();
    },
    removeCustomPlan(id) {
      state.customPlans = (state.customPlans || []).filter(p => p.id !== id);
      commit();
    },
    updateVenue(id, patch) {
      const v = (state.settings.venues || []).find(v => v.id === id);
      if (v) { Object.assign(v, patch); commit(); }
    },
    addVenue(venue) {
      if (!state.settings.venues) state.settings.venues = [];
      state.settings.venues.push(Object.assign({ id: uid("v") }, venue));
      commit();
    },
    removeVenue(id) {
      state.settings.venues = (state.settings.venues || []).filter(v => v.id !== id);
      commit();
    },
    importJSON(json) {
      try {
        const obj = JSON.parse(json);
        if (obj.students && obj.records) { state = obj; commit(); return true; }
      } catch (e) {}
      return false;
    },
    exportJSON() { return JSON.stringify(state, null, 2); },
  };

  window.Store = {
    getState: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    actions,
    derived: { months, lastClassByStudent, studentHistory, studentStats, classDisplayTotal, buildLessonRevenueIndex },
    // Sync hook: reload state from localStorage (after cloud pull writes it),
    // emit silently so the sync layer doesn't loop into another push.
    _reload() {
      window.__syncSilent = true;
      try {
        state = load();
        emit();
      } finally {
        window.__syncSilent = false;
      }
    },
  };
})();