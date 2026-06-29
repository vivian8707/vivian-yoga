#!/usr/bin/env python3
"""
BookFast 瑜珈課程查課腳本
每週二自動查詢「松江｜正念基礎瑜珈 10:30-11:30」的報名狀況
並傳送 Telegram 通知
"""

import asyncio
import os
import json
import re
from datetime import datetime, timedelta
from playwright.async_api import async_playwright

# 設定
BOOKFAST_URL = "https://new.console.bookfastpos.com/console/login"
EMAIL = os.environ.get("BOOKFAST_EMAIL", "workingler401@gmail.com")
PASSWORD = os.environ.get("BOOKFAST_PASSWORD", "songjiangnanjing")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8418483775:AAFaS8XgxQpfXleatFBIJ4Stnp6oI0Rh5HY")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "1322290989")
TARGET_CLASS = "松江｜正念基礎瑜珈 10:30-11:30"


def get_next_tuesday():
    """取得下週二的日期"""
    today = datetime.today()
    days_until_tuesday = (1 - today.weekday()) % 7
    if days_until_tuesday == 0:
        days_until_tuesday = 7
    next_tuesday = today + timedelta(days=days_until_tuesday)
    return next_tuesday.strftime("%Y-%m-%d")


async def send_telegram(message: str):
    """透過 Telegram Bot 傳送訊息"""
    import urllib.request
    import urllib.parse

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }).encode()

    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            print(f"Telegram sent: {result.get('ok')}")
            return result.get("ok", False)
    except Exception as e:
        print(f"Telegram error: {e}")
        return False


async def main():
    target_date = get_next_tuesday()
    print(f"查詢日期：{target_date}")
    print(f"目標課程：{TARGET_CLASS}")

    report = {
        "date": target_date,
        "class_name": TARGET_CLASS,
        "enrollment_count": 0,
        "status": "未知",
        "students": []
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="zh-TW"
        )
        page = await context.new_page()

        try:
            # ── 步驟 1：登入 ──
            print("=== 步驟 1：登入 ===")
            await page.goto(BOOKFAST_URL, wait_until="networkidle", timeout=30000)
            await page.screenshot(path="/tmp/01_login_page.png")
            print(f"頁面標題：{await page.title()}")

            # 填寫 Email
            email_selectors = [
                'input[type="email"]',
                'input[name="email"]',
                'input[placeholder*="Email"]',
                'input[placeholder*="email"]',
                'input[placeholder*="帳號"]',
            ]
            for sel in email_selectors:
                try:
                    await page.fill(sel, EMAIL, timeout=3000)
                    print(f"Email 欄位：{sel}")
                    break
                except:
                    continue

            # 填寫密碼
            password_selectors = [
                'input[type="password"]',
                'input[name="password"]',
                'input[placeholder*="密碼"]',
                'input[placeholder*="Password"]',
            ]
            for sel in password_selectors:
                try:
                    await page.fill(sel, PASSWORD, timeout=3000)
                    print(f"密碼欄位：{sel}")
                    break
                except:
                    continue

            await page.screenshot(path="/tmp/02_filled_login.png")

            # 按登入鈕
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("登入")',
                'button:has-text("Login")',
                'input[type="submit"]',
            ]
            for sel in submit_selectors:
                try:
                    await page.click(sel, timeout=3000)
                    print(f"登入按鈕：{sel}")
                    break
                except:
                    continue

            await page.wait_for_load_state("networkidle", timeout=20000)
            await page.screenshot(path="/tmp/03_after_login.png")
            print(f"登入後 URL：{page.url}")

            # ── 步驟 2：前往預約管理 ──
            print("=== 步驟 2：前往預約管理 ===")
            nav_selectors = [
                'a:has-text("預約管理")',
                'a:has-text("預約")',
                '[href*="booking"]',
                '[href*="reservation"]',
                '[href*="schedule"]',
            ]
            for sel in nav_selectors:
                try:
                    await page.click(sel, timeout=3000)
                    print(f"導覽：{sel}")
                    await page.wait_for_load_state("networkidle", timeout=10000)
                    break
                except:
                    continue

            await page.screenshot(path="/tmp/04_booking_management.png")
            print(f"預約管理 URL：{page.url}")

            # 印出頁面內容以便 debug
            content = await page.content()
            print("=== 頁面 HTML（前 3000 字）===")
            print(content[:3000])

            # ── 步驟 3：設定日期 ──
            print(f"=== 步驟 3：設定日期 {target_date} ===")
            date_selectors = [
                'input[type="date"]',
                'input[placeholder*="日期"]',
                'input[placeholder*="date"]',
                '.date-picker input',
                '[class*="date"] input',
            ]
            for sel in date_selectors:
                try:
                    await page.fill(sel, target_date, timeout=3000)
                    print(f"日期欄位：{sel}")
                    await page.keyboard.press("Enter")
                    await page.wait_for_load_state("networkidle", timeout=10000)
                    break
                except:
                    continue

            await page.screenshot(path="/tmp/05_date_set.png")

            # 印出設定日期後的內容
            content = await page.content()
            print("=== 日期設定後 HTML（前 5000 字）===")
            print(content[:5000])

            # ── 步驟 4：找到目標課程 ──
            print(f"=== 步驟 4：尋找 {TARGET_CLASS} ===")
            await page.screenshot(path="/tmp/06_class_list.png")

            # 搜尋包含課程名稱的元素
            class_elements = await page.query_selector_all(f'text="{TARGET_CLASS}"')
            if not class_elements:
                # 嘗試部分匹配
                class_elements = await page.query_selector_all('text="正念基礎瑜珈"')

            print(f"找到 {len(class_elements)} 個課程元素")

            # 取得報名人數
            # 方法：找到課程所在的列/卡片，並取得人數資訊
            enrollment_count = 0
            student_names = []

            if class_elements:
                # 點擊課程
                await class_elements[0].click()
                await page.wait_for_load_state("networkidle", timeout=10000)
                await page.screenshot(path="/tmp/07_class_detail.png")

                detail_content = await page.content()
                print("=== 課程詳情 HTML（前 5000 字）===")
                print(detail_content[:5000])

                # 嘗試取得學員名單
                name_selectors = [
                    '.student-name',
                    '.member-name',
                    '[class*="name"]',
                    'td:nth-child(2)',  # 表格第二欄通常是姓名
                ]
                for sel in name_selectors:
                    elements = await page.query_selector_all(sel)
                    if elements:
                        names = []
                        for el in elements:
                            text = (await el.text_content() or "").strip()
                            if text and len(text) > 1:
                                names.append(text)
                        if names:
                            student_names = names
                            enrollment_count = len(names)
                            print(f"學員名單（{sel}）：{names}")
                            break

            # 根據人數決定課程狀態
            if enrollment_count >= 2:
                report["status"] = "開課"
                report["enrollment_count"] = enrollment_count

                print(f"=== 步驟 5：查詢各學員上課記錄 ===")
                for name in student_names:
                    print(f"查詢學員：{name}")
                    # 點擊學員進入個人頁面
                    try:
                        student_link = await page.query_selector(f'text="{name}"')
                        if student_link:
                            await student_link.click()
                            await page.wait_for_load_state("networkidle", timeout=10000)
                            await page.screenshot(path=f"/tmp/student_{name}.png")

                            # 取得上課記錄
                            attendance_records = []
                            record_rows = await page.query_selector_all("tr, .record-row, .attendance-row")
                            for row in record_rows[:15]:
                                cells = await row.query_selector_all("td")
                                if len(cells) >= 3:
                                    row_data = []
                                    for cell in cells:
                                        text = (await cell.text_content() or "").strip()
                                        row_data.append(text)
                                    if any(row_data):
                                        attendance_records.append(row_data)

                            report["students"].append({
                                "name": name,
                                "attendance_records": attendance_records[:10]
                            })
                            await page.go_back()
                            await page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception as e:
                        print(f"查詢學員 {name} 失敗：{e}")
                        report["students"].append({
                            "name": name,
                            "attendance_records": [],
                            "error": str(e)
                        })
            else:
                report["status"] = "取消"
                report["enrollment_count"] = enrollment_count

        except Exception as e:
            print(f"執行錯誤：{e}")
            import traceback
            traceback.print_exc()
            report["error"] = str(e)
        finally:
            await browser.close()

    # ── 步驟 6：產生報告 ──
    print("=== 步驟 6：產生報告 ===")
    report_text = generate_report(report)
    print(report_text)

    # 儲存報告
    with open("report.md", "w", encoding="utf-8") as f:
        f.write(report_text)
    print("報告已儲存至 report.md")

    # ── 步驟 7：傳送 Telegram 通知 ──
    print("=== 步驟 7：傳送 Telegram 通知 ===")
    telegram_text = generate_telegram_message(report)
    await send_telegram(telegram_text)

    return report


def generate_report(report: dict) -> str:
    """產生 Markdown 報告"""
    lines = [
        f"# 📋 週二課程查課報告",
        f"",
        f"**日期：** {report['date']}",
        f"**課程：** {report['class_name']}",
        f"**報名人數：** {report['enrollment_count']} 人",
        f"**開課狀態：** {'✅ 開課' if report['status'] == '開課' else '❌ 取消'}",
        f"",
    ]

    if report["status"] == "開課":
        lines.append("## 📝 報名學員名單")
        lines.append("")
        for i, student in enumerate(report["students"], 1):
            lines.append(f"### {i}. {student['name']}")
            lines.append("")
            if student.get("attendance_records"):
                lines.append("| 日期 | 時間 | 課程名稱 | 老師 | 狀態 |")
                lines.append("|------|------|----------|------|------|")
                for record in student["attendance_records"]:
                    if isinstance(record, list):
                        # 補齊欄位至 5 個
                        while len(record) < 5:
                            record.append("")
                        lines.append(f"| {' | '.join(record[:5])} |")
                    else:
                        lines.append(f"| {record} ||||")
            else:
                lines.append("*（無法取得上課記錄）*")
            lines.append("")
    else:
        lines.append("## ❌ 課程取消")
        lines.append("")
        lines.append("本週課程人數不足（少於 2 人），課程取消。")

    lines.append("")
    lines.append(f"---")
    lines.append(f"*報告產生時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")

    return "\n".join(lines)


def generate_telegram_message(report: dict) -> str:
    """產生 Telegram 訊息"""
    status_emoji = "✅" if report["status"] == "開課" else "❌"
    lines = [
        f"<b>📋 週二課程查課報告</b>",
        f"",
        f"📅 日期：{report['date']}",
        f"📚 課程：{report['class_name']}",
        f"👥 報名人數：{report['enrollment_count']} 人",
        f"狀態：{status_emoji} {report['status']}",
        f"",
    ]

    if report["status"] == "開課":
        lines.append("<b>報名學員：</b>")
        for i, student in enumerate(report["students"], 1):
            lines.append(f"{i}. {student['name']}")
            if student.get("attendance_records"):
                recent = student["attendance_records"][:3]
                lines.append(f"   最近上課：{', '.join([str(r[0]) if isinstance(r, list) else str(r) for r in recent])}")
    else:
        lines.append("❌ 本週課程人數不足，課程取消。")

    if report.get("error"):
        lines.append(f"")
        lines.append(f"⚠️ 執行警告：{report['error']}")

    return "\n".join(lines)


if __name__ == "__main__":
    asyncio.run(main())
