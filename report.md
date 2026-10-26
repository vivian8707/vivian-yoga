# 週二課程查課報告

執行時間：2026-10-26 10:14 UTC

## 狀態：未能執行

雲端執行環境的出站網路代理拒絕連線（HTTP 403 `CONNECT tunnel failed`）：

- `new.console.bookfastpos.com`：無法登入 BookFast 後台，沒有取得報名資料
- `api.telegram.org`：無法送出 Telegram 通知

因此無法確認「松江｜正念基礎瑜珈 10:30-11:30」的報名人數，也沒有學員上課記錄。

## 建議

到此 routine 的環境設定（Network policy），把 `new.console.bookfastpos.com` 與 `api.telegram.org` 加入允許清單，或改用 Full 網路存取後重跑。
