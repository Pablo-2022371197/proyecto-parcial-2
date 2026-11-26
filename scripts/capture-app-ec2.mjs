import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('informe/evidencias');
mkdirSync(dir, { recursive: true });
const APP = 'http://3.144.214.32';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(25000);

await page.goto(`${APP}/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: resolve(dir, '01_login.png'), fullPage: true });

await page.locator('#username').fill('user');
await page.locator('#password').fill('User123!');
await page.locator('#login-btn').click();
await page.waitForURL(/\/$/);
await page.waitForSelector('.shared-moment-card');
await page.screenshot({ path: resolve(dir, '02_feed_user.png'), fullPage: true });

await page.locator('#logout-btn').click();
await page.waitForURL(/\/login/);
await page.locator('#username').fill('admin');
await page.locator('#password').fill('Admin123!');
await page.locator('#login-btn').click();
await page.waitForURL(/\/admin\/users/);
await page.waitForSelector('#users-table tbody tr');
await page.screenshot({ path: resolve(dir, '03_admin_users.png'), fullPage: true });

await page.goto(APP, { waitUntil: 'networkidle' });
await page.waitForSelector('.shared-moment-card');
await page.screenshot({ path: resolve(dir, '04_feed_admin.png'), fullPage: true });

const health = await page.request.get(`${APP}/api/health`);
const host = await page.request.get(`${APP}/api/host`);
const json = JSON.stringify({
  health: await health.json(),
  host: await host.json()
}, null, 2);
await page.setContent(`<pre style="font:14px Consolas,monospace;padding:24px">${json}</pre>`);
await page.screenshot({ path: resolve(dir, '05_health_host.png'), fullPage: true });

await browser.close();
console.log('ec2 evidencias 01-05 ok');
