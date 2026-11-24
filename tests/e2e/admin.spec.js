import { test, expect } from '@playwright/test';
import { ADMIN, loginUi } from './helpers.js';

test.describe('CRUD de usuarios', () => {
  test('admin crea, edita y elimina un usuario', async ({ page }) => {
    await loginUi(page, ADMIN);
    await expect(page.locator('#users-table')).toBeVisible();

    await page.locator('#user-username').fill('alumno01');
    await page.locator('#user-password').fill('Alumno123!');
    await page.locator('#user-role').selectOption('user');
    await page.locator('#save-user-btn').click();
    await expect(page.locator('#users-table tbody')).toContainText('alumno01');

    await page.getByRole('row', { name: /alumno01/ }).getByRole('button', { name: 'Editar' }).click();
    await page.locator('#user-role').selectOption('admin');
    await page.locator('#save-user-btn').click();
    await expect(page.getByRole('row', { name: /alumno01/ })).toContainText('admin');

    page.once('dialog', (d) => d.accept());
    await page.getByRole('row', { name: /alumno01/ }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.locator('#users-table tbody')).not.toContainText('alumno01');
  });

  test('admin no puede eliminarse a sí mismo', async ({ page }) => {
    await loginUi(page, ADMIN);
    const adminRow = page.getByRole('row', { name: /^1\s+admin/ });
    await expect(adminRow.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
  });
});
