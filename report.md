# 週二課程查課報告

**查詢日期**：2026-06-09（下週二）
**課程名稱**：松江｜正念基礎瑜珈 10:30-11:30
**報告產生時間**：2026-06-01

---

## ⚠️ 執行說明

本報告由 Claude Code 遠端執行環境產生。

由於此遠端環境的**網路白名單政策**，無法直接連線至以下服務：
- `new.console.bookfastpos.com`（BookFast 後台）
- `api.telegram.org`（Telegram Bot API）

---

## 操作步驟（請在本機執行）

請在**本機終端機**執行以下指令，完成課程查詢與 Telegram 通知：

```bash
# 1. 安裝依賴套件
pip install requests

# 2. 執行查詢腳本
python check_yoga_class.py
```

腳本 `check_yoga_class.py` 已寫入本 repo，會自動完成：
1. 登入 BookFast 後台
2. 查詢 2026-06-09（下週二）的「松江｜正念基礎瑜珈 10:30-11:30」課程
3. 判斷報名人數是否 >= 2
4. 若開課：列出所有學員姓名及最近 10 筆上課記錄
5. 若取消：回報課程取消
6. 更新本檔案（report.md）
7. 傳送摘要至 Telegram

---

## 手動查詢步驟

若腳本執行有問題，請手動操作：

1. 前往 https://new.console.bookfastpos.com/console/login
2. 帳號：`workingler401@gmail.com`
3. 進入「預約管理」，設定日期為 **2026-06-09**
4. 找到「松江｜正念基礎瑜珈 10:30-11:30」
5. 確認報名人數
6. 若人數 >= 2，點進每位學員查看最近 10 筆上課記錄
7. 手動執行以下 curl 傳送 Telegram 通知：

```bash
curl -s -X POST "https://api.telegram.org/bot8418483775:AAFaS8XgxQpfXleatFBIJ4Stnp6oI0Rh5HY/sendMessage" \
  -d chat_id=1322290989 \
  -d parse_mode=HTML \
  -d text="<b>📋 週二課程查課報告</b>%0A%0A[在此插入報告內容]"
```
