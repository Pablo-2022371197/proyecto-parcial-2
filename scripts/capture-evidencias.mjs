import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('informe/evidencias');
mkdirSync(dir, { recursive: true });

const APP = 'http://3.144.214.32';
const OO = 'http://3.144.214.32:5080/web/';
const GH = 'https://github.com/Pablo-2022371197/proyecto-parcial-2/actions';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(25000);

async function shot(name) {
  const path = resolve(dir, name);
  await page.screenshot({ path, fullPage: false });
  console.log('saved', name);
}

await page.goto(`${APP}/login`, { waitUntil: 'networkidle' });
await shot('01_login.png');

await page.locator('#username').fill('user');
await page.locator('#password').fill('User123!');
await page.locator('#login-btn').click();
await page.waitForURL(/\/$/);
await page.waitForSelector('.shared-moment-card');
await shot('02_feed_user.png');

await page.locator('#logout-btn').click();
await page.waitForURL(/\/login/);
await page.locator('#username').fill('admin');
await page.locator('#password').fill('Admin123!');
await page.locator('#login-btn').click();
await page.waitForURL(/\/admin\/users/);
await page.waitForSelector('#users-table tbody tr');
await shot('03_admin_users.png');

await page.goto(APP, { waitUntil: 'networkidle' });
await page.waitForSelector('.shared-moment-card');
await shot('04_feed_admin.png');

const health = await page.request.get(`${APP}/api/health`);
const host = await page.request.get(`${APP}/api/host`);
await page.setContent(`<pre style="font:14px Consolas,monospace;padding:24px">${JSON.stringify({
  health: await health.json(),
  host: await host.json()
}, null, 2)}</pre>`);
await shot('05_health_host.png');

await page.goto(OO, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
const email = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[type="text"]').first();
const pass = page.locator('input[type="password"]').first();
await email.waitFor({ timeout: 15000 });
await email.fill('admin@uteqgram.local');
await pass.fill('OpenObserve123!');
await page.getByRole('button', { name: /sign in|login|iniciar|submit/i }).first().click().catch(async () => {
  await page.keyboard.press('Enter');
});
await page.waitForTimeout(4000);
await shot('07_openobserve_home.png');

await page.goto(`${OO}dashboards`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await shot('08_openobserve_dashboards.png');

const dashLink = page.getByText(/UTEQGram/i).first();
if (await dashLink.count()) {
  await dashLink.click();
  await page.waitForTimeout(5000);
  await shot('09_openobserve_dashboard_cpu.png');
}

await page.goto(`${OO}logs?stream_type=logs&stream=cicd&period=6h`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await shot('10_openobserve_cicd.png');

await page.goto(`${OO}traces?period=1h`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await shot('11_openobserve_traces.png');

await page.goto(`${OO}alerts`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await shot('12_openobserve_alerts.png');

await page.goto(GH, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await shot('13_github_actions.png');

await browser.close();
console.log('done');
