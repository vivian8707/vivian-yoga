# 瑜珈課程報名查詢報告

**查詢日期：** 2026-06-09（下週二）  
**課程名稱：** 松江｜正念基礎瑜珈 10:30–11:30  
**報告產生時間：** 2026-06-01  

---

## 執行摘要

本次自動化查詢嘗試登入 BookFast 後台系統（https://new.console.bookfastpos.com/console/login），並查詢 2026-06-09 當日「松江｜正念基礎瑜珈 10:30–11:30」課程的報名狀況。

---

## 執行結果

**狀態：無法取得資料**

### 原因說明

執行環境（沙箱）的出口流量受到 allowlist 管控。所有對 `new.console.bookfastpos.com` 的 HTTP/HTTPS 請求，均被網路層以 `403 Host not in allowlist` 拒絕。

嘗試的請求包含：
- `GET https://new.console.bookfastpos.com/console/login`（取得登入表單）
- `POST https://new.console.bookfastpos.com/api/auth/login`（嘗試 API 登入）
- `GET https://console.bookfastpos.com`（備用網域）

所有請求均回傳相同錯誤：`Host not in allowlist`

此為沙箱基礎設施限制，無法透過更換請求標頭、路徑或方法繞過。

---

## 建議後續行動

若需確認課程報名人數，請手動執行以下步驟：

1. 前往 https://new.console.bookfastpos.com/console/login
2. 使用帳號 `workingler401@gmail.com` 登入
3. 進入「預約管理」→ 選擇日期 **2026-06-09**
4. 找到「松江｜正念基礎瑜珈 10:30–11:30」課程
5. 確認報名人數是否 ≥ 2 人

---

## 課程判定

因無法連線至後台系統，**無法自動判定課程是否開成**。  
請人工確認後，依以下標準處理：

- **人數 ≥ 2 人** → 課程正常開課，請通知學員
- **人數 < 2 人** → 本週課程人數不足，課程取消，請通知學員

---

*本報告由自動化助理產生。如有疑問，請聯繫系統管理員。*
