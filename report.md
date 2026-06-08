# 週二課程查課報告

**日期：** 2026-06-08  
**查詢目標日期（下週二）：** 2026-06-16  
**課程：** 松江｜正念基礎瑜珈 10:30-11:30

---

## ⚠️ 無法執行查課

**原因：** BookFast 後台系統（new.console.bookfastpos.com）設有 **IP 白名單（allowlist）**，僅允許特定 IP 位址存取。

本次執行環境為 Anthropic 雲端伺服器，其 IP 位址不在 BookFast 系統的白名單內，因此所有 HTTP 請求均收到 **403 Forbidden** 回應，錯誤訊息為：

```
Host not in allowlist
```

---

## 解決方案建議

1. **本機執行：** 請在您的本機電腦或已被 BookFast 授權的 IP 位址上執行此查課腳本。
2. **VPN/固定 IP：** 若 BookFast 系統需要固定 IP，請確認您的執行環境 IP 已加入白名單。
3. **BookFast API Token：** 若 BookFast 提供 API Token 方式存取，可以不受 IP 限制地查詢資料。

---

## 執行記錄

- 嘗試登入網址：`https://new.console.bookfastpos.com/console/login`
- HTTP 狀態碼：403
- 伺服器回應：`Host not in allowlist`
- 使用帳號：`workingler401@gmail.com`
- 嘗試方法：Playwright（headless browser）+ curl

---

*報告產生時間：2026-06-08*
