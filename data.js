// Sample data + shared constants for previews

const SAMPLE_STUDENTS = [];

const SAMPLE_RECORDS = [];

// Monthly income for chart (chronological)
const SAMPLE_MONTHS = [
  { key: "2025-12", value: 18400 },
  { key: "2026-01", value: 22600 },
  { key: "2026-02", value: 19800 },
  { key: "2026-03", value: 26200 },
  { key: "2026-04", value: 28400 },
  { key: "2026-05", value: 6880 },
];

const TABS = ["上課記錄", "儲值記錄", "學生管理", "收入記錄"];

// Seed data — store reads these on first load, then persists in localStorage.
window.SEED_STUDENTS = SAMPLE_STUDENTS;
window.SEED_RECORDS = SAMPLE_RECORDS;
window.TABS = TABS;

// Legacy globals kept as live getters from Store, so existing reads keep working.
Object.defineProperty(window, "SAMPLE_STUDENTS", {
  get() { return window.Store ? window.Store.getState().students : SAMPLE_STUDENTS; }
});
Object.defineProperty(window, "SAMPLE_RECORDS", {
  get() {
    const list = window.Store ? window.Store.getState().records : SAMPLE_RECORDS;
    // 以「原始陣列中的位置」記住輸入順序——越後面 = 越新
    const order = new Map();
    list.forEach((r, i) => order.set(r, i));
    // 永遠以日期新→舊輸出;同日期時,以原始順序中越後面的越新
    return list.slice().sort((a, b) => {
      const da = a.date || "", db = b.date || "";
      if (da !== db) return db.localeCompare(da);
      return (order.get(b) || 0) - (order.get(a) || 0);
    });
  }
});
Object.defineProperty(window, "SAMPLE_MONTHS", {
  get() { return window.Store ? window.Store.derived.months() : SAMPLE_MONTHS; }
});
