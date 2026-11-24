import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ADMIN, USER, loginUi } from './helpers.js';

const dir = resolve('informe/evidencias');
mkdirSync(dir, { recursive: true });

test.describe('Evidencias del informe', () => {
  test('capturas de login, feed, admin y health', async ({ page, request }) => {
    await page.goto('/login');
    await page.screenshot({ path: resolve(dir, '01_login.png'), fullPage: true });

    await loginUi(page, USER);
    await page.waitForURL(/\/$/);
    await page.waitForSelector('.shared-moment-card');
    await page.screenshot({ path: resolve(dir, '02_feed_user.png'), fullPage: true });

    await page.locator('#logout-btn').click();
    await page.waitForURL(/\/login/);
    await loginUi(page, ADMIN);
    await page.waitForURL(/\/admin\/users/);
    await page.waitForSelector('#users-table tbody tr');
    await page.screenshot({ path: resolve(dir, '03_admin_users.png'), fullPage: true });

    await page.goto('/');
    await page.waitForSelector('.shared-moment-card');
    await page.screenshot({ path: resolve(dir, '04_feed_admin.png'), fullPage: true });

    const health = await request.get('/api/health');
    const host = await request.get('/api/host');
    await page.setContent(`<pre>${JSON.stringify({
      health: await health.json(),
      host: await host.json()
    }, null, 2)}</pre>`);
    await page.screenshot({ path: resolve(dir, '05_health_host.png'), fullPage: true });
  });
});
