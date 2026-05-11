#!/usr/bin/env python3
"""
BookFast 瑜珈課程報告自動化腳本
用途：查詢下週二「松江｜正念基礎瑜珈 10:30-11:30」報名狀況，並發送 Telegram 通知

執行方式：
    pip install playwright requests
    playwright install chromium
    python3 bookfast_report.py

注意：此腳本需在有網路存取權限的環境中執行
"""

import asyncio
import json
import re
import requests
from datetime import date, timedelta
from playwright.async_api import async_playwright

# ── 設定 ────────────────────────────────────────────
LOGIN_URL   = "https://new.console.bookfastpos.com/console/login"
EMAIL       = "workingler401@gmail.com"
PASSWORD    = "songjiangnanjing"

BOT_TOKEN   = "8418483775:AAFaS8XgxQpfXleatFBIJ4Stnp6oI0Rh5HY"
CHAT_ID     = "1322290989"
TELEGRAM_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

# 目標課程
TARGET_CLASS = "松江｜正念基礎瑜珈 10:30-11:30"


def get_next_tuesday() -> str:
    """計算下週二的日期（格式：YYYY-MM-DD）"""
    today = date.today()
    days_until_tuesday = (1 - today.weekday()) % 7  # 週二 = weekday 1
    if days_until_tuesday == 0:
        days_until_tuesday = 7
    next_tuesday = today + timedelta(days=days_until_tuesday + 7)
    return next_tuesday.strftime("%Y-%m-%d")


def send_telegram(message: str):
    """發送 Telegram 訊息"""
    try:
        resp = requests.post(TELEGRAM_URL, data={
            "chat_id": CHAT_ID,
            "parse_mode": "HTML",
            "text": message
        }, timeout=15)
        if resp.ok:
            print("✅ Telegram 通知發送成功")
        else:
            print(f"❌ Telegram 發送失敗: {resp.text}")
    except Exception as e:
        print(f"❌ Telegram 發送錯誤: {e}")


async def main():
    next_tuesday = get_next_tuesday()
    print(f"目標日期（下週二）：{next_tuesday}")
    print(f"目標課程：{TARGET_CLASS}")
    print("=" * 60)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        # ── Step 1: 登入 ─────────────────────────────────
        print("Step 1: 登入 BookFast 後台...")
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        await page.fill('input[type="email"], input[name="email"]', EMAIL)
        await page.fill('input[type="password"], input[name="password"]', PASSWORD)
        await page.click('button[type="submit"], button:has-text("登入"), button:has-text("Login")')
        await page.wait_for_load_state("networkidle")
        print(f"登入後 URL：{page.url}")

        # ── Step 2: 前往預約管理，設定日期 ─────────────────
        print(f"\nStep 2: 前往預約管理，設定日期為 {next_tuesday}...")
        # 尋找預約管理選單
        await page.click('a:has-text("預約管理"), a:has-text("Booking"), nav a[href*="booking"], nav a[href*="reservation"]')
        await page.wait_for_load_state("networkidle")

        # 設定日期
        date_input = page.locator('input[type="date"], input[placeholder*="日期"]').first
        await date_input.fill(next_tuesday)
        await page.keyboard.press("Enter")
        await page.wait_for_load_state("networkidle")

        # ── Step 3: 找到目標課程 ──────────────────────────
        print(f"\nStep 3: 尋找課程「{TARGET_CLASS}」...")
        await page.wait_for_timeout(2000)  # 等待資料載入

        page_content = await page.content()
        print("頁面內容片段：", page_content[:500])

        # 嘗試找到課程列表
        class_rows = await page.locator(f'tr:has-text("{TARGET_CLASS}"), div:has-text("{TARGET_CLASS}")').all()
        if not class_rows:
            print(f"⚠️  未找到課程「{TARGET_CLASS}」，列出所有可見課程：")
            all_text = await page.locator("body").inner_text()
            print(all_text[:2000])
            await browser.close()
            return

        target_row = class_rows[0]
        class_text = await target_row.inner_text()
        print(f"找到課程行：{class_text[:200]}")

        # 解析人數 - 尋找數字模式如 "X/Y" 或 "報名：X"
        numbers = re.findall(r'\d+', class_text)
        enrolled_count = int(numbers[0]) if numbers else 0
        print(f"報名人數：{enrolled_count}")

        # ── Step 4: 根據人數處理 ───────────────────────────
        if enrolled_count < 2:
            print("\n❌ 課程人數不足，課程取消")
            report = (
                f"📋 瑜珈課程報告\n"
                f"日期：{next_tuesday}（下週二）\n"
                f"課程：{TARGET_CLASS}\n"
                f"狀態：本週課程人數不足（{enrolled_count} 人），課程取消\n"
            )
            write_report(report, next_tuesday, enrolled_count, [], [])
            send_telegram(f"<b>瑜珈課程通知</b>\n\n"
                         f"日期：{next_tuesday}\n"
                         f"課程：{TARGET_CLASS}\n"
                         f"❌ 本週課程人數不足（{enrolled_count} 人），課程取消")
            await browser.close()
            return

        # 人數足夠，取得學員列表
        print(f"\n✅ 課程開成！共 {enrolled_count} 位學員報名")

        # 點進課程查看學員
        await target_row.click()
        await page.wait_for_load_state("networkidle")

        # 取得學員姓名列表
        student_elements = await page.locator('tr[data-student], div.student-name, td.name').all()
        students = []
        for el in student_elements:
            name = await el.inner_text()
            name = name.strip()
            if name:
                students.append(name)

        print(f"學員列表：{students}")

        # ── Step 5: 查詢每位學員的上課記錄 ──────────────────
        all_records = []
        for student_name in students:
            print(f"\n查詢學員「{student_name}」的上課記錄...")
            # 點進學員預約記錄
            student_link = page.locator(f'a:has-text("{student_name}"), tr:has-text("{student_name}")').first
            await student_link.click()
            await page.wait_for_load_state("networkidle")

            # 取得最近 10 筆記錄
            records = []
            rows = await page.locator("tr.record-row, tr:has(td)").all()
            for row in rows[:10]:
                cells = await row.locator("td").all_inner_texts()
                if len(cells) >= 3:
                    records.append({
                        "date": cells[0].strip() if len(cells) > 0 else "",
                        "time": cells[1].strip() if len(cells) > 1 else "",
                        "class": cells[2].strip() if len(cells) > 2 else "",
                        "teacher": cells[3].strip() if len(cells) > 3 else "",
                        "status": cells[4].strip() if len(cells) > 4 else "",
                    })

            all_records.append({"student": student_name, "records": records})
            await page.go_back()
            await page.wait_for_load_state("networkidle")

        # ── Step 6: 產生報告 ──────────────────────────────
        write_report("", next_tuesday, enrolled_count, students, all_records)

        # ── Step 7: 發送 Telegram 通知 ────────────────────
        student_list = "\n".join([f"• {s}" for s in students])
        telegram_msg = (
            f"<b>✅ 瑜珈課程開成通知</b>\n\n"
            f"📅 日期：{next_tuesday}（下週二）\n"
            f"🧘 課程：{TARGET_CLASS}\n"
            f"👥 報名人數：{enrolled_count} 人\n\n"
            f"<b>報名學員：</b>\n{student_list}\n\n"
            f"詳細上課記錄請查看 report.md"
        )
        send_telegram(telegram_msg)
        await browser.close()


def write_report(intro: str, date_str: str, count: int, students: list, records: list):
    """將報告寫入 report.md"""
    lines = [
        "# 瑜珈課程報告",
        "",
        f"**報告日期：** {date.today().strftime('%Y-%m-%d')}",
        f"**查詢日期（下週二）：** {date_str}",
        f"**目標課程：** 松江｜正念基礎瑜珈 10:30-11:30",
        "",
        "---",
        "",
    ]

    if count < 2:
        lines += [
            "## ❌ 課程取消",
            "",
            f"本週課程報名人數為 **{count}** 人，未達開課門檻（2 人），課程取消。",
            "",
        ]
    else:
        lines += [
            f"## ✅ 課程開成",
            "",
            f"報名人數：**{count}** 人（已達開課門檻）",
            "",
            "### 報名學員名單",
            "",
        ]
        for student in students:
            lines.append(f"- {student}")
        lines.append("")

        for record_data in records:
            student = record_data["student"]
            recs = record_data["records"]
            lines += [
                f"### 學員：{student} 的最近上課記錄",
                "",
                "| 日期 | 時間 | 課程名稱 | 老師 | 狀態 |",
                "|------|------|----------|------|------|",
            ]
            if recs:
                for r in recs:
                    lines.append(
                        f"| {r['date']} | {r['time']} | {r['class']} | {r['teacher']} | {r['status']} |"
                    )
            else:
                lines.append("| （無記錄） | | | | |")
            lines.append("")

    report_path = "/home/user/vivian-yoga/report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n✅ 報告已儲存至 {report_path}")


if __name__ == "__main__":
    asyncio.run(main())
