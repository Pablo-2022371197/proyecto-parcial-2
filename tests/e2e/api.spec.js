import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi } from './helpers.js';

test.describe('API backend', () => {
  test('GET /api/health responde ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('uteqgram');
    expect(body.users).toBeGreaterThanOrEqual(2);
    expect(body.timestamp).toBeTruthy();
  });

  test('GET /api/host incluye CPU, RAM y bandera térmica', async ({ request }) => {
    const res = await request.get('/api/host');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('cpuPercent');
    expect(body).toHaveProperty('memUsedPercent');
    expect(body).toHaveProperty('netRxBytes');
    expect(body).toHaveProperty('thermalAvailable');
  });

  test('posts y users exigen autenticación', async ({ request }) => {
    expect((await request.get('/api/posts')).status()).toBe(401);
    expect((await request.get('/api/users')).status()).toBe(401);
    expect((await request.get('/api/auth/me')).status()).toBe(401);
  });

  test('login API inválido y válido', async ({ request }) => {
    const bad = await loginApi(request, { username: 'admin', password: 'nope' });
    expect(bad.status()).toBe(401);
    const ok = await loginApi(request, ADMIN);
    expect(ok.status()).toBe(200);
    const me = await request.get('/api/auth/me');
    expect(me.status()).toBe(200);
    expect((await me.json()).role).toBe('admin');
  });

  test('user puede listar posts y no puede CRUD de users', async ({ request }) => {
    const login = await loginApi(request, USER);
    expect(login.status()).toBe(200);
    const posts = await request.get('/api/posts');
    expect(posts.status()).toBe(200);
    expect((await posts.json()).length).toBeGreaterThanOrEqual(3);

    const create = await request.post('/api/users', {
      data: { username: 'hacker', password: 'Hacker123!', role: 'admin' }
    });
    expect(create.status()).toBe(403);
  });

  test('admin CRUD por API', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const created = await request.post('/api/users', {
      data: { username: 'apiuser', password: 'Apiuser123!', role: 'user' }
    });
    expect(created.status()).toBe(201);
    const user = await created.json();
    expect(user.username).toBe('apiuser');
    expect(user.password_hash).toBeUndefined();

    const updated = await request.put(`/api/users/${user.id}`, {
      data: { role: 'admin' }
    });
    expect(updated.status()).toBe(200);
    expect((await updated.json()).role).toBe('admin');

    const del = await request.delete(`/api/users/${user.id}`);
    expect(del.status()).toBe(200);
  });

  test('user autenticado crea un post por API', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/posts', {
      multipart: {
        title: 'API post',
        location: 'CI'
      }
    });
    expect(res.status()).toBe(201);
    const post = await res.json();
    expect(post.title).toBe('API post');
    expect(post.author).toBe('user');
  });
});
