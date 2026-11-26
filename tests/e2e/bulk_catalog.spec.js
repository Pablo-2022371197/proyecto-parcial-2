import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi, loginUi } from './helpers.js';
import {
  seedPosts,
  seedUsers,
  staticAssets,
  publicPages,
  healthFields,
  hostFields,
  protectedGets,
  protectedMutations,
  invalidLogins,
  invalidUsernames,
  loginSelectors,
  feedSelectors,
  adminSelectors
} from './catalog.js';

test.describe('Catálogo de estáticos', () => {
  for (const path of staticAssets) {
    test(`GET ${path} responde 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    });

    test(`GET ${path} trae cuerpo`, async ({ request }) => {
      const res = await request.get(path);
      const buf = await res.body();
      expect(buf.byteLength, path).toBeGreaterThan(10);
    });
  }

  for (const path of publicPages) {
    test(`página pública ${path} es 200`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(200);
    });
  }
});

test.describe('Health y host', () => {
  for (const field of healthFields) {
    test(`/api/health expone ${field}`, async ({ request }) => {
      const body = await (await request.get('/api/health')).json();
      expect(body[field], field).toBeDefined();
    });
  }

  for (const field of hostFields) {
    test(`/api/host expone ${field}`, async ({ request }) => {
      const body = await (await request.get('/api/host')).json();
      expect(body).toHaveProperty(field);
    });
  }
});

test.describe('Rutas protegidas sin sesión', () => {
  for (const path of protectedGets) {
    test(`GET ${path} sin cookie es 401`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(401);
    });
  }

  for (const { method, path } of protectedMutations) {
    test(`${method.toUpperCase()} ${path} sin cookie es 401`, async ({ request }) => {
      const res = await request[method](path, { data: {} });
      expect(res.status()).toBe(401);
    });
  }
});

test.describe('Logins inválidos', () => {
  invalidLogins.forEach((creds, i) => {
    const label = `${i + 1} ${JSON.stringify(creds.username)}`;
    test(`rechaza login ${label}`, async ({ request }) => {
      const res = await loginApi(request, creds);
      expect([400, 401]).toContain(res.status());
    });
  });
});

test.describe('Validación de username al crear', () => {
  for (const username of invalidUsernames) {
    test(`admin no crea usuario "${username || '(vacío)'}"`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.post('/api/users', {
        data: { username, password: 'Valid123!', role: 'user' }
      });
      expect([400, 409]).toContain(res.status());
    });
  }
});

test.describe('Catálogo de posts semilla', () => {
  for (const post of seedPosts) {
    test(`existe el post "${post.title}"`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      expect(posts.some((p) => p.title === post.title)).toBeTruthy();
    });

    test(`"${post.title}" tiene ubicación ${post.location}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === post.title);
      expect(found?.location).toBe(post.location);
    });

    test(`"${post.title}" lo publicó ${post.author}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === post.title);
      expect(found?.author).toBe(post.author);
    });

    test(`"${post.title}" tiene imagen`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === post.title);
      expect(found?.image).toMatch(/^\//);
    });
  }
});

test.describe('Catálogo de usuarios semilla', () => {
  for (const u of seedUsers) {
    test(`existe el usuario ${u.username}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      expect(users.some((row) => row.username === u.username)).toBeTruthy();
    });

    test(`${u.username} tiene rol ${u.role}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      const found = users.find((row) => row.username === u.username);
      expect(found?.role).toBe(u.role);
    });

    test(`${u.username} no expone password_hash`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      const found = users.find((row) => row.username === u.username);
      expect(found.password_hash).toBeUndefined();
    });
  }
});

test.describe('UI login — controles', () => {
  for (const sel of loginSelectors) {
    test(`login muestra ${sel}`, async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator(sel).first()).toBeAttached();
    });
  }

  test('usuario tiene autocomplete=username', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#username')).toHaveAttribute('autocomplete', 'username');
  });

  test('contraseña tiene type=password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('contraseña tiene autocomplete=current-password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#password')).toHaveAttribute('autocomplete', 'current-password');
  });

  test('html declara lang=es', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test.describe('UI feed — controles', () => {
  for (const sel of feedSelectors) {
    test(`feed muestra ${sel}`, async ({ page }) => {
      await loginUi(page, USER);
      await expect(page.locator(sel).first()).toBeAttached();
    });
  }
});

test.describe('UI admin — controles', () => {
  for (const sel of adminSelectors) {
    test(`admin muestra ${sel}`, async ({ page }) => {
      await loginUi(page, ADMIN);
      await expect(page.locator(sel).first()).toBeAttached();
    });
  }
});
