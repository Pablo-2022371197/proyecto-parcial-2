import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi } from './helpers.js';

const jsonEndpoints = [
  '/api/health',
  '/api/host'
];

test.describe('Health contrato extra', () => {
  test('health.status es ok', async ({ request }) => {
    expect((await (await request.get('/api/health')).json()).status).toBe('ok');
  });
  test('health.service es uteqgram', async ({ request }) => {
    expect((await (await request.get('/api/health')).json()).service).toBe('uteqgram');
  });
  test('health.users es número', async ({ request }) => {
    expect(typeof (await (await request.get('/api/health')).json()).users).toBe('number');
  });
  test('host.cpuPercent es número', async ({ request }) => {
    expect(typeof (await (await request.get('/api/host')).json()).cpuPercent).toBe('number');
  });
  test('host.thermalAvailable es 0 o 1', async ({ request }) => {
    expect([0, 1]).toContain((await (await request.get('/api/host')).json()).thermalAvailable);
  });
});

test.describe('JSON autenticado', () => {
  const authed = ['/api/posts', '/api/users', '/api/auth/me'];
  for (const path of authed) {
    test(`${path} es JSON`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type'] || '').toMatch(/json/i);
    });
  }
});

test.describe('Content-Type JSON público', () => {
  for (const path of jsonEndpoints) {
    test(`${path} es application/json`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.headers()['content-type'] || '').toMatch(/json/i);
    });
  }
});

test.describe('Permisos por rol', () => {
  const userForbidden = [
    { method: 'get', path: '/api/users' },
    { method: 'get', path: '/api/users/1' },
    { method: 'post', path: '/api/users' },
    { method: 'put', path: '/api/users/1' },
    { method: 'delete', path: '/api/users/2' }
  ];

  for (const { method, path } of userForbidden) {
    test(`user ${method.toUpperCase()} ${path} es 403`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const res = await request[method](path, {
        data: { username: 'x', password: 'xxxxxx', role: 'user' }
      });
      expect(res.status()).toBe(403);
    });
  }

  test('admin GET /api/users/1 devuelve admin', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.get('/api/users/1');
    expect(res.status()).toBe(200);
    expect((await res.json()).username).toBe('admin');
  });

  test('admin GET /api/users/9999 es 404', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    expect((await request.get('/api/users/9999')).status()).toBe(404);
  });

  test('admin no elimina su propia cuenta', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const me = await (await request.get('/api/auth/me')).json();
    expect((await request.delete(`/api/users/${me.id}`)).status()).toBe(400);
  });
});

test.describe('Creación de posts por catálogo', () => {
  const samples = [
    { title: 'Laboratorio DevOps', location: 'UTEQ' },
    { title: 'Pipeline verde', location: 'Ohio' },
    { title: 'Observabilidad', location: 'OpenObserve' },
    { title: 'Prueba Playwright', location: 'CI' },
    { title: 'Post con ñandú', location: 'Querétaro' },
    { title: 'Foto del campus', location: 'Santa Rosa' },
    { title: 'IDGS14', location: 'Aula 3' },
    { title: 'Despliegue EC2', location: 'us-east-2' }
  ];

  for (const sample of samples) {
    test(`POST /api/posts crea "${sample.title}"`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const res = await request.post('/api/posts', {
        multipart: { title: sample.title, location: sample.location }
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.title).toBe(sample.title);
      expect(body.location).toBe(sample.location);
      expect(body.author).toBe('user');
    });
  }

  test('POST /api/posts sin título es 400', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/posts', {
      multipart: { title: '', location: 'X' }
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/posts sin ubicación es 400', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/posts', {
      multipart: { title: 'Solo título', location: '' }
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Login API — contrato', () => {
  test('login admin no expone hash', async ({ request }) => {
    const res = await loginApi(request, ADMIN);
    const body = await res.json();
    expect(body.password_hash).toBeUndefined();
    expect(body.username).toBe('admin');
    expect(body.role).toBe('admin');
  });

  test('login user no expone hash', async ({ request }) => {
    const res = await loginApi(request, USER);
    const body = await res.json();
    expect(body.password_hash).toBeUndefined();
    expect(body.role).toBe('user');
  });

  test('Set-Cookie httpOnly en login', async ({ request }) => {
    const res = await loginApi(request, USER);
    const cookie = res.headers()['set-cookie'] || '';
    expect(cookie.toLowerCase()).toMatch(/httponly/);
  });

  test('logout deja /api/auth/me en 401', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    expect((await request.post('/api/auth/logout')).status()).toBe(200);
    expect((await request.get('/api/auth/me')).status()).toBe(401);
  });
});
