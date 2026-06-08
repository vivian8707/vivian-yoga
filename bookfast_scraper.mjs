import { chromium } from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'fs';

const LOGIN_URL = 'https://new.console.bookfastpos.com/console/login';
const EMAIL = 'workingler401@gmail.com';
const PASSWORD = 'songjiangnanjing';

// Next Tuesday: 2026-06-16
const TARGET_DATE = '2026-06-16';
const CLASS_NAME = '松江｜正念基礎瑜珈 10:30-11:30';

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ locale: 'zh-TW' });
  const page = await context.newPage();

  console.log('=== 登入 BookFast ===');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/step1_login.png' });
  console.log('Login page loaded');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="Email"], input[placeholder*="email"], input[placeholder*="帳號"]', EMAIL).catch(async () => {
    const inputs = await page.$$('input');
    if (inputs.length > 0) await inputs[0].fill(EMAIL);
  });
  await page.fill('input[type="password"]', PASSWORD);
  await page.screenshot({ path: '/tmp/step2_filled.png' });

  // Submit login
  await page.click('button[type="submit"], button:has-text("登入"), button:has-text("Login")');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/step3_after_login.png' });
  console.log('After login URL:', page.url());
  console.log('Page title:', await page.title());

  // Navigate to booking management
  console.log('\n=== 前往預約管理 ===');

  // Try to find booking/reservation management link
  const navLinks = await page.$$eval('a, nav a, [class*="menu"] a, [class*="nav"] a', links =>
    links.map(l => ({ text: l.textContent?.trim(), href: l.href }))
  );
  console.log('Navigation links found:', JSON.stringify(navLinks.slice(0, 20), null, 2));

  // Look for booking management
  const bookingLink = await page.$('a:has-text("預約"), a:has-text("訂課"), a:has-text("booking"), a:has-text("reservation")');
  if (bookingLink) {
    await bookingLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    // Try navigating directly
    const currentUrl = page.url();
    const baseUrl = new URL(currentUrl).origin;
    await page.goto(`${baseUrl}/console/reservation`, { waitUntil: 'networkidle' }).catch(() => {});
    if (page.url().includes('login')) {
      await page.goto(`${baseUrl}/console/booking`, { waitUntil: 'networkidle' }).catch(() => {});
    }
  }

  await page.screenshot({ path: '/tmp/step4_booking.png' });
  console.log('Booking page URL:', page.url());

  // Get all page content
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Page text (first 2000 chars):', pageText.substring(0, 2000));

  await browser.close();
}

run().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
