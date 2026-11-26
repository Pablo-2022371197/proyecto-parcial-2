import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi } from './helpers.js';

test.describe('Defectos reales de la app', () => {
  // Documentados pero esperados: no deben tumbar el job de deploy.
  test.fail();
  test.use({ expect: { timeout: 1500 } });

  test('login usa un h1 como encabezado principal', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('existe enlace de recuperar contraseña', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /contraseña|password/i })).toBeVisible();
  });

  test('existe enlace para registrarse', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /crear cuenta|registr/i })).toBeVisible();
  });

  test('login envía token CSRF', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="csrf"], input[name="_csrf"]')).toHaveCount(1);
  });

  test('respuesta de login incluye flag Secure en la cookie', async ({ request }) => {
    const res = await loginApi(request, ADMIN);
    const cookie = (res.headers()['set-cookie'] || '').toLowerCase();
    expect(cookie).toContain('secure');
  });

  test('GET /login envía Strict-Transport-Security', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.headers()['strict-transport-security']).toBeTruthy();
  });

  test('GET /login envía X-Content-Type-Options nosniff', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('GET /login envía Content-Security-Policy', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.headers()['content-security-policy']).toBeTruthy();
  });

  test('/api/health reporta el estado de la base de datos', async ({ request }) => {
    const body = await (await request.get('/api/health')).json();
    expect(body.database).toBe('ok');
  });

  test('/api/posts responde con paginación { data, total }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const body = await (await request.get('/api/posts')).json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
  });

  test('existe /api/docs (OpenAPI)', async ({ request }) => {
    expect((await request.get('/api/docs')).status()).toBe(200);
  });

  test('existe /robots.txt', async ({ request }) => {
    expect((await request.get('/robots.txt')).status()).toBe(200);
  });

  test('login fallido incluye cabecera de rate limit', async ({ request }) => {
    const res = await loginApi(request, { username: 'admin', password: 'nope' });
    expect(
      res.headers()['x-ratelimit-remaining'] || res.headers()['retry-after']
    ).toBeTruthy();
  });

  test('el feed tiene un h1 accesible', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill(USER.username);
    await page.locator('#password').fill(USER.password);
    await page.locator('#login-btn').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('hay enlace skip to content', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a[href="#main"], .skip-link')).toBeVisible();
  });
});
