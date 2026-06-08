const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const LOGIN_URL = 'https://new.console.bookfastpos.com/console/login';
const EMAIL = 'workingler401@gmail.com';
const PASSWORD = 'songjiangnanjing';

// Next Tuesday from 2026-06-08 (Monday) => 2026-06-16
const TARGET_DATE = '2026-06-16';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const context = await browser.newContext({
    locale: 'zh-TW',
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
    }
  });
  const page = await context.newPage();

  // Capture console logs from the page
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  console.log('=== 步驟1: 登入 BookFast ===');
  // Remove automation flags
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/step1_login.png' });

  const pageTitle = await page.title();
  const pageUrl = page.url();
  console.log('Login page title:', pageTitle);
  console.log('Login page URL:', pageUrl);

  // Get all input fields
  // Log page HTML to understand structure
  const pageHTML = await page.content();
  console.log('Page HTML length:', pageHTML.length);
  console.log('HTML (first 2000):', pageHTML.substring(0, 2000));

  // Try waiting for inputs to appear
  await page.waitForTimeout(2000);

  const inputs = await page.$$eval('input', inputs => inputs.map(i => ({
    type: i.type, name: i.name, placeholder: i.placeholder, id: i.id, class: i.className
  })));
  console.log('Input fields:', JSON.stringify(inputs));

  // Fill email
  try {
    await page.fill('input[type="email"]', EMAIL);
  } catch {
    try {
      await page.fill('input[name="email"]', EMAIL);
    } catch {
      const allInputs = await page.$$('input:not([type="hidden"])');
      if (allInputs.length > 0) await allInputs[0].fill(EMAIL);
    }
  }

  // Fill password
  await page.fill('input[type="password"]', PASSWORD);
  await page.screenshot({ path: '/tmp/step2_filled.png' });

  // Click login button
  try {
    await page.click('button[type="submit"]');
  } catch {
    try {
      await page.click('button:has-text("登入")');
    } catch {
      await page.press('input[type="password"]', 'Enter');
    }
  }

  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/step3_after_login.png' });
  console.log('After login URL:', page.url());
  console.log('After login title:', await page.title());

  // Check if login successful
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text after login (first 500):', bodyText.substring(0, 500));

  // Look for navigation menu items
  const menuItems = await page.$$eval('a, [class*="menu"] *, [class*="nav"] *, [role="menuitem"]',
    els => els.map(el => ({ tag: el.tagName, text: el.textContent?.trim()?.substring(0, 50), href: el.href || '' }))
      .filter(el => el.text && el.text.length > 0)
  );
  console.log('\nMenu items found:');
  menuItems.slice(0, 30).forEach(item => console.log(' -', item.tag, item.text, item.href));

  console.log('\n=== 步驟2: 前往預約管理 ===');

  // Try clicking on 預約管理
  let foundBooking = false;
  for (const selector of [
    'a:has-text("預約管理")', 'a:has-text("預約")', 'a:has-text("訂課")',
    '[class*="reservation"]', '[class*="booking"]', 'a[href*="reservation"]', 'a[href*="booking"]'
  ]) {
    const el = await page.$(selector);
    if (el) {
      console.log('Found booking nav link:', selector);
      await el.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1500);
      foundBooking = true;
      break;
    }
  }

  if (!foundBooking) {
    // Try direct URL
    const baseUrl = new URL(page.url()).origin;
    for (const path of ['/console/reservation', '/console/booking', '/console/schedule', '/console/class']) {
      await page.goto(baseUrl + path, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      if (!page.url().includes('login')) {
        console.log('Navigated to:', page.url());
        break;
      }
    }
  }

  await page.screenshot({ path: '/tmp/step4_booking_page.png' });
  console.log('Booking page URL:', page.url());

  const bookingPageText = await page.evaluate(() => document.body.innerText);
  console.log('Booking page text (first 1000):', bookingPageText.substring(0, 1000));

  // Get all links on this page
  const allLinks = await page.$$eval('a', links =>
    links.map(l => ({ text: l.textContent?.trim()?.substring(0, 50), href: l.href }))
      .filter(l => l.text)
  );
  console.log('\nAll links on booking page:', JSON.stringify(allLinks.slice(0, 20), null, 2));

  await browser.close();
  console.log('\nDone. Screenshots saved to /tmp/');
}

run().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
