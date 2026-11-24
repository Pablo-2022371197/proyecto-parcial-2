import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginUi } from './helpers.js';

test.describe('Login UI', () => {
  test('muestra el formulario de acceso', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();
  });

  test('rechaza credenciales inválidas', async ({ page }) => {
    await loginUi(page, { username: 'admin', password: 'wrong' });
    await expect(page.locator('#login-error')).toContainText(/inválid/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin entra y ve el CRUD de usuarios', async ({ page }) => {
    await loginUi(page, ADMIN);
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('#users-table')).toBeVisible();
    await expect(page.locator('#users-table tbody tr').first()).toBeVisible();
    await expect(page.locator('#users-table tbody')).toContainText('admin');
    await expect(page.locator('#users-table tbody')).toContainText('user');
  });

  test('user entra al feed y no ve el menú de usuarios', async ({ page }) => {
    await loginUi(page, USER);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#shared-moments')).toBeVisible();
    await expect(page.locator('a[href="/admin/users"]').first()).toBeHidden();
  });

  test('logout regresa al login', async ({ page }) => {
    await loginUi(page, USER);
    await expect(page.locator('#logout-btn')).toBeVisible();
    await page.locator('#logout-btn').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
