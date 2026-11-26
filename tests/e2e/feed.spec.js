import { test, expect } from '@playwright/test';
import { USER, loginUi } from './helpers.js';

test.describe('Feed', () => {
  test('el usuario ve los posts semilla', async ({ page }) => {
    await loginUi(page, USER);
    await expect(page.locator('.shared-moment-card').first()).toBeVisible();
    await expect(page.locator('.shared-moment-card')).not.toHaveCount(0);
    await expect(page.getByText('Bienvenida a UTEQGram')).toBeVisible();
  });

  test('el usuario puede crear un post', async ({ page }) => {
    await loginUi(page, USER);
    await page.locator('#share-image-button').click();
    await page.locator('#title').fill('Post de prueba');
    await page.locator('#location').fill('Sala de cómputo');
    await page.locator('#post-btn').click();
    await expect(page.getByText('Post de prueba')).toBeVisible();
    await expect(page.getByText(/Sala de cómputo/)).toBeVisible();
  });

  test('el usuario no puede abrir el CRUD de usuarios', async ({ page }) => {
    await loginUi(page, USER);
    await expect(page.locator('#shared-moments')).toBeVisible();
    await page.evaluate(() => { window.location.assign('/admin/users'); });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#shared-moments')).toBeVisible();
    await expect(page.locator('#users-table')).toHaveCount(0);
  });
});
