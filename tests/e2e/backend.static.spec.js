import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi } from './helpers.js';
import { staticAssets, validUsernames, seedPosts } from './catalog.js';
import { assertPublicUser, assertPost, readJson } from './schemas.js';

test.describe('Back · Estáticos', () => {
  for (const path of staticAssets) {
    test(`GET ${path} responde 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    });

    test(`GET ${path} tiene cuerpo`, async ({ request }) => {
      const buf = await (await request.get(path)).body();
      expect(buf.byteLength, path).toBeGreaterThan(8);
    });
  }
});

test.describe('Back · Páginas HTML', () => {
  test('GET /login es text/html', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] || '').toMatch(/html/i);
  });

  test('GET / sin sesión redirige al login', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers().location || '').toMatch(/\/login/);
  });

  test('GET /admin/users sin sesión redirige al login', async ({ request }) => {
    const res = await request.get('/admin/users', { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers().location || '').toMatch(/\/login/);
  });
});

test.describe('Back · Usernames válidos — publicUser', () => {
  for (const username of validUsernames) {
    test(`crea "${username}" con estructura publicUser`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.post('/api/users', {
        data: { username, password: 'Valid123!', role: 'user' }
      });
      expect(res.status()).toBe(201);
      const body = await readJson(res);
      assertPublicUser(body);
      expect(body.username).toBe(username);
      await request.delete(`/api/users/${body.id}`);
    });
  }
});

test.describe('Back · Posts semilla — recursos', () => {
  for (const seed of seedPosts) {
    test(`imagen de "${seed.title}" responde 200`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === seed.title);
      assertPost(found);
      expect((await request.get(found.image)).status()).toBe(200);
    });
  }
});

test.describe('Back · Contratos rápidos', () => {
  test('lista de posts ordenada por id descendente', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const posts = await (await request.get('/api/posts')).json();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < posts.length - 1; i += 1) {
      expect(posts[i].id).toBeGreaterThanOrEqual(posts[i + 1].id);
    }
  });

  test('POST post sin imagen usa imagen por defecto', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const body = await (await request.post('/api/posts', {
      multipart: { title: 'Sin archivo', location: 'UTEQ' }
    })).json();
    assertPost(body);
    expect(body.image).toBe('/src/images/main-image.png');
  });

  test('health.timestamp es fecha parseable', async ({ request }) => {
    const body = await (await request.get('/api/health')).json();
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});