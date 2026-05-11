# 瑜珈課程報告

**報告日期：** 2026-05-11  
**查詢日期（下週二）：** 2026-05-19  
**目標課程：** 松江｜正念基礎瑜珈 10:30-11:30

---

## ⚠️ 執行狀況說明

本次自動化查詢於 Claude Code 雲端執行環境中進行，但該環境的**網路代理設有外部域名白名單**，僅允許存取特定服務（如 GitHub API、npm registry 等），導致以下外部服務無法連線：

| 嘗試方式 | 目標 | 結果 |
|----------|------|------|
| Python urllib | `https://new.console.bookfastpos.com/` | `403 Host not in allowlist` |
| Playwright (Chromium) | `https://new.console.bookfastpos.com/` | `Host not in allowlist` |
| Telegram Bot API | `https://api.telegram.org/` | `403 Host not in allowlist` |
| curl | `https://new.console.bookfastpos.com/` | `Host not in allowlist` |

**結論：** BookFast 後台系統及 Telegram Bot API 皆被環境網路白名單封鎖，無法在此雲端環境中自動完成查詢。

---

## 解決方案

已在 repo 中建立完整的自動化腳本 [`bookfast_report.py`](./bookfast_report.py)，可在**本機環境**執行：

### 執行步驟

```bash
# 1. 安裝依賴
pip install playwright requests
playwright install chromium

# 2. 執行腳本
python3 bookfast_report.py
```

### 腳本功能

1. 自動登入 BookFast 後台（workingler401@gmail.com）
2. 前往預約管理，設定日期為下週二（2026-05-19）
3. 找到「松江｜正念基礎瑜珈 10:30-11:30」課程
4. 確認報名人數：
   - **≥ 2 人**：列出所有報名學員，並查詢每位學員最近 10 筆上課記錄
   - **< 2 人**：回報課程取消
5. 更新本檔案（report.md）為最終報告
6. 透過 Telegram Bot 傳送摘要通知

### Telegram 通知設定

- **Bot Token：** `8418483775:AAFaS8XgxQpfXleatFBIJ4Stnp6oI0Rh5HY`
- **Chat ID：** `1322290989`

---

## 手動查詢流程（備案）

若無法執行腳本，請依以下步驟手動操作：

1. 開啟 [https://new.console.bookfastpos.com/console/login](https://new.console.bookfastpos.com/console/login)
2. 登入：`workingler401@gmail.com` / `songjiangnanjing`
3. 點選左側選單「預約管理」
4. 將日期設為 **2026-05-19（下週二）**
5. 找到「松江｜正念基礎瑜珈 10:30-11:30」課程
6. 確認報名人數是否 ≥ 2 人
7. 若開成，點進每位學員查看上課記錄（最近 10 筆）
8. 執行以下 curl 指令發送 Telegram 通知：

```bash
curl -s -X POST "https://api.telegram.org/bot8418483775:AAFaS8XgxQpfXleatFBIJ4Stnp6oI0Rh5HY/sendMessage" \
  -d chat_id=1322290989 \
  -d parse_mode=HTML \
  -d text="<b>瑜珈課程通知</b>%0A%0A日期：2026-05-19%0A課程：松江｜正念基礎瑜珈 10:30-11:30%0A[報告內容]"
```

---

*此報告由 Claude Code 自動生成。如需重新執行，請在本機環境執行 `bookfast_report.py`。*
