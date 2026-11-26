import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginApi } from './helpers.js';
import {
  seedPosts,
  seedUsers,
  healthFields,
  hostFields,
  postFields,
  publicUserFields,
  authUserFields,
  protectedGets,
  protectedMutations,
  userForbidden,
  jsonEndpoints,
  postSamples,
  invalidRoles,
  shortPasswords,
  invalidLogins,
  invalidUsernames
} from './catalog.js';
import {
  KEYS,
  assertKeys,
  assertNoEnvelope,
  assertErrorEnvelope,
  assertAuthUser,
  assertPublicUser,
  assertPost,
  assertHealth,
  assertHost,
  assertOk,
  assertDeleted,
  readJson
} from './schemas.js';

let seq = 0;
function uniqueUser() {
  seq += 1;
  return `sch${seq}${Date.now().toString(36).slice(-5)}`.slice(0, 32);
}

test.describe('Back · Health — estructura', () => {
  test('GET /api/health es 200 JSON con claves exactas', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertHealth(body);
  });

  for (const { field, type } of healthFields) {
    test(`/api/health.${field} existe`, async ({ request }) => {
      const body = await (await request.get('/api/health')).json();
      expect(body).toHaveProperty(field);
    });

    test(`/api/health.${field} es ${type}`, async ({ request }) => {
      const body = await (await request.get('/api/health')).json();
      expect(typeof body[field]).toBe(type);
    });
  }

  test('/api/health no usa sobre code/data/message', async ({ request }) => {
    assertNoEnvelope(await (await request.get('/api/health')).json());
  });

  test('/api/health.users es entero >= 2', async ({ request }) => {
    const body = await (await request.get('/api/health')).json();
    expect(Number.isInteger(body.users)).toBe(true);
    expect(body.users).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Back · Host — estructura', () => {
  test('GET /api/host es 200 JSON con claves exactas', async ({ request }) => {
    const res = await request.get('/api/host');
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertHost(body);
  });

  for (const { field, type } of hostFields) {
    test(`/api/host.${field} existe`, async ({ request }) => {
      const body = await (await request.get('/api/host')).json();
      expect(body).toHaveProperty(field);
    });

    test(`/api/host.${field} es ${type}`, async ({ request }) => {
      const body = await (await request.get('/api/host')).json();
      expect(typeof body[field]).toBe(type);
    });
  }

  test('/api/host.thermalCelsius es null o number', async ({ request }) => {
    const body = await (await request.get('/api/host')).json();
    expect(body).toHaveProperty('thermalCelsius');
    expect(body.thermalCelsius === null || typeof body.thermalCelsius === 'number').toBe(true);
  });

  test('/api/host.cpuPercent está en 0-100', async ({ request }) => {
    const body = await (await request.get('/api/host')).json();
    expect(body.cpuPercent).toBeGreaterThanOrEqual(0);
    expect(body.cpuPercent).toBeLessThanOrEqual(100);
  });

  test('/api/host.memUsedPercent está en 0-100', async ({ request }) => {
    const body = await (await request.get('/api/host')).json();
    expect(body.memUsedPercent).toBeGreaterThanOrEqual(0);
    expect(body.memUsedPercent).toBeLessThanOrEqual(100);
  });

  test('/api/host.thermalAvailable es 0 o 1', async ({ request }) => {
    expect([0, 1]).toContain((await (await request.get('/api/host')).json()).thermalAvailable);
  });

  test('/api/host no usa sobre code/data/message', async ({ request }) => {
    assertNoEnvelope(await (await request.get('/api/host')).json());
  });
});

test.describe('Back · JSON público — content-type', () => {
  for (const path of jsonEndpoints) {
    test(`${path} Content-Type JSON`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.headers()['content-type'] || '').toMatch(/json/i);
    });
  }
});

test.describe('Back · Login — estructura de éxito', () => {
  test('login admin: { id, username, role }', async ({ request }) => {
    const res = await loginApi(request, ADMIN);
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertAuthUser(body);
    expect(body.username).toBe('admin');
    expect(body.role).toBe('admin');
  });

  test('login user: { id, username, role }', async ({ request }) => {
    const res = await loginApi(request, USER);
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertAuthUser(body);
    expect(body.username).toBe('user');
    expect(body.role).toBe('user');
  });

  for (const { field, type } of authUserFields) {
    test(`login admin.${field} es ${type}`, async ({ request }) => {
      const body = await (await loginApi(request, ADMIN)).json();
      expect(typeof body[field]).toBe(type);
    });
  }

  test('login no expone password ni password_hash', async ({ request }) => {
    const body = await (await loginApi(request, ADMIN)).json();
    expect(body.password).toBeUndefined();
    expect(body.password_hash).toBeUndefined();
  });

  test('login no usa sobre code/data/message', async ({ request }) => {
    assertNoEnvelope(await (await loginApi(request, USER)).json());
  });
});

test.describe('Back · Login — estructura de error { error }', () => {
  invalidLogins.forEach((creds, i) => {
    test(`rechaza ${i + 1} ${JSON.stringify(creds.username)} con { error }`, async ({ request }) => {
      const res = await loginApi(request, creds);
      expect([400, 401]).toContain(res.status());
      assertErrorEnvelope(await readJson(res));
    });
  });
});

test.describe('Back · Me y logout — estructura', () => {
  test('GET /api/auth/me admin: { id, username, role }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertAuthUser(body);
    expect(body.role).toBe('admin');
  });

  test('GET /api/auth/me user: { id, username, role }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const body = await readJson(await request.get('/api/auth/me'));
    assertAuthUser(body);
    expect(body.username).toBe('user');
  });

  for (const { field, type } of authUserFields) {
    test(`me admin.${field} es ${type}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const body = await (await request.get('/api/auth/me')).json();
      expect(typeof body[field]).toBe(type);
    });
  }

  test('POST /api/auth/logout: { ok: true }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/auth/logout');
    expect(res.status()).toBe(200);
    assertOk(await readJson(res));
  });

  test('tras logout, /api/auth/me es { error }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    expect((await request.post('/api/auth/logout')).status()).toBe(200);
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
    assertErrorEnvelope(await readJson(res));
  });
});

test.describe('Back · Rutas protegidas — { error } sin sesión', () => {
  for (const path of protectedGets) {
    test(`GET ${path} sin cookie es 401 { error }`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(401);
      assertErrorEnvelope(await readJson(res));
    });
  }

  for (const { method, path } of protectedMutations) {
    test(`${method.toUpperCase()} ${path} sin cookie es 401 { error }`, async ({ request }) => {
      const res = await request[method](path, { data: {} });
      expect(res.status()).toBe(401);
      assertErrorEnvelope(await readJson(res));
    });
  }
});

test.describe('Back · Permisos user — 403 { error }', () => {
  for (const { method, path } of userForbidden) {
    test(`user ${method.toUpperCase()} ${path} es 403 { error }`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const res = await request[method](path, {
        data: { username: 'x', password: 'xxxxxx', role: 'user' }
      });
      expect(res.status()).toBe(403);
      assertErrorEnvelope(await readJson(res));
    });
  }
});

test.describe('Back · Users — estructura de listado', () => {
  test('GET /api/users es arreglo JSON', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.get('/api/users');
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  test('cada usuario del listado cumple { id, username, role, created_at }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const users = await (await request.get('/api/users')).json();
    expect(users.length).toBeGreaterThanOrEqual(2);
    for (const row of users) {
      assertPublicUser(row);
    }
  });

  for (const seed of seedUsers) {
    test(`existe ${seed.username} con rol ${seed.role}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      const found = users.find((row) => row.username === seed.username);
      expect(found).toBeTruthy();
      assertPublicUser(found);
      expect(found.role).toBe(seed.role);
    });

    test(`${seed.username} no expone password_hash`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      const found = users.find((row) => row.username === seed.username);
      expect(found.password_hash).toBeUndefined();
    });
  }

  for (const { field, type } of publicUserFields) {
    test(`users[0].${field} es ${type}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const users = await (await request.get('/api/users')).json();
      expect(typeof users[0][field]).toBe(type);
    });
  }
});

test.describe('Back · Users — GET por id', () => {
  test('GET /api/users/:id de admin cumple publicUser', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const users = await (await request.get('/api/users')).json();
    const admin = users.find((row) => row.username === 'admin');
    const res = await request.get(`/api/users/${admin.id}`);
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    assertPublicUser(body);
    expect(body.username).toBe('admin');
  });

  test('GET /api/users/:id de user cumple publicUser', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const users = await (await request.get('/api/users')).json();
    const user = users.find((row) => row.username === 'user');
    const body = await readJson(await request.get(`/api/users/${user.id}`));
    assertPublicUser(body);
    expect(body.role).toBe('user');
  });

  test('GET /api/users/9999 es 404 { error }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.get('/api/users/9999');
    expect(res.status()).toBe(404);
    assertErrorEnvelope(await readJson(res));
  });
});

test.describe('Back · Users — mutaciones y validación', () => {
  test('POST crea publicUser 201 y DELETE { ok, id }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const username = uniqueUser();
    const createdRes = await request.post('/api/users', {
      data: { username, password: 'Valid123!', role: 'user' }
    });
    expect(createdRes.status()).toBe(201);
    const created = await readJson(createdRes);
    assertPublicUser(created);
    expect(created.username).toBe(username);
    expect(created.role).toBe('user');

    const del = await request.delete(`/api/users/${created.id}`);
    expect(del.status()).toBe(200);
    assertDeleted(await readJson(del), created.id);
  });

  test('PUT actualiza rol y mantiene publicUser', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const username = uniqueUser();
    const created = await (await request.post('/api/users', {
      data: { username, password: 'Valid123!', role: 'user' }
    })).json();
    const updatedRes = await request.put(`/api/users/${created.id}`, { data: { role: 'admin' } });
    expect(updatedRes.status()).toBe(200);
    const updated = await readJson(updatedRes);
    assertPublicUser(updated);
    expect(updated.role).toBe('admin');
    expect(updated.username).toBe(username);
    await request.delete(`/api/users/${created.id}`);
  });

  test('admin no elimina su cuenta: 400 { error }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const me = await (await request.get('/api/auth/me')).json();
    const res = await request.delete(`/api/users/${me.id}`);
    expect(res.status()).toBe(400);
    assertErrorEnvelope(await readJson(res));
  });

  test('usuario duplicado es 409 { error }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.post('/api/users', {
      data: { username: 'admin', password: 'Valid123!', role: 'user' }
    });
    expect(res.status()).toBe(409);
    assertErrorEnvelope(await readJson(res));
  });

  for (const username of invalidUsernames) {
    test(`username inválido ${JSON.stringify(username)} → 400 { error }`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.post('/api/users', {
        data: { username, password: 'Valid123!', role: 'user' }
      });
      expect(res.status()).toBe(400);
      assertErrorEnvelope(await readJson(res));
    });
  }

  for (const password of shortPasswords) {
    test(`password ${JSON.stringify(password)} → 400 { error }`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.post('/api/users', {
        data: { username: uniqueUser(), password, role: 'user' }
      });
      expect(res.status()).toBe(400);
      assertErrorEnvelope(await readJson(res));
    });
  }

  for (const role of invalidRoles) {
    test(`rol inválido ${JSON.stringify(role)} → 400 { error }`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.post('/api/users', {
        data: { username: uniqueUser(), password: 'Valid123!', role }
      });
      expect(res.status()).toBe(400);
      assertErrorEnvelope(await readJson(res));
    });
  }

  test('rol vacío se normaliza a user y responde publicUser', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const username = uniqueUser();
    const res = await request.post('/api/users', {
      data: { username, password: 'Valid123!', role: '' }
    });
    expect(res.status()).toBe(201);
    const created = await readJson(res);
    assertPublicUser(created);
    expect(created.role).toBe('user');
    await request.delete(`/api/users/${created.id}`);
  });
});

test.describe('Back · Posts — estructura de listado', () => {
  test('GET /api/posts es arreglo JSON, no { data, total }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.get('/api/posts');
    expect(res.status()).toBe(200);
    const body = await readJson(res);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(3);
    expect(body.data).toBeUndefined();
    expect(body.total).toBeUndefined();
  });

  test('cada post cumple { id, title, location, image, created_at, author }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const posts = await (await request.get('/api/posts')).json();
    for (const post of posts) {
      assertPost(post);
    }
  });

  for (const seed of seedPosts) {
    test(`post "${seed.title}" existe`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      expect(posts.some((p) => p.title === seed.title)).toBeTruthy();
    });

    test(`"${seed.title}" tiene ubicación ${seed.location}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === seed.title);
      expect(found.location).toBe(seed.location);
    });

    test(`"${seed.title}" lo publicó ${seed.author}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      const found = posts.find((p) => p.title === seed.title);
      expect(found.author).toBe(seed.author);
    });

    test(`"${seed.title}" cumple esquema Post`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      assertPost(posts.find((p) => p.title === seed.title));
    });
  }

  for (const { field, type } of postFields) {
    test(`posts[0].${field} es ${type}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const posts = await (await request.get('/api/posts')).json();
      expect(typeof posts[0][field]).toBe(type);
    });
  }
});

test.describe('Back · Posts — creación y errores', () => {
  for (const sample of postSamples) {
    test(`POST crea "${sample.title}" con esquema Post`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const res = await request.post('/api/posts', {
        multipart: { title: sample.title, location: sample.location }
      });
      expect(res.status()).toBe(201);
      const body = await readJson(res);
      assertPost(body);
      expect(body.title).toBe(sample.title);
      expect(body.location).toBe(sample.location);
      expect(body.author).toBe('user');
    });
  }

  test('POST /api/posts sin título es 400 { error }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/posts', {
      multipart: { title: '', location: 'X' }
    });
    expect(res.status()).toBe(400);
    assertErrorEnvelope(await readJson(res));
  });

  test('POST /api/posts sin ubicación es 400 { error }', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const res = await request.post('/api/posts', {
      multipart: { title: 'Solo título', location: '' }
    });
    expect(res.status()).toBe(400);
    assertErrorEnvelope(await readJson(res));
  });
});

test.describe('Back · Claves exactas del contrato', () => {
  test('health keys = status, service, timestamp, users', async ({ request }) => {
    assertKeys(await (await request.get('/api/health')).json(), KEYS.health);
  });

  test('host keys incluyen thermalCelsius y métricas', async ({ request }) => {
    assertKeys(await (await request.get('/api/host')).json(), KEYS.host);
  });

  test('login keys = id, username, role', async ({ request }) => {
    assertKeys(await (await loginApi(request, ADMIN)).json(), KEYS.authUser);
  });

  test('error keys = error', async ({ request }) => {
    assertKeys(await (await loginApi(request, { username: 'x', password: 'y' })).json(), KEYS.error);
  });

  test('logout keys = ok', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    assertKeys(await (await request.post('/api/auth/logout')).json(), KEYS.ok);
  });
});

const hostNumerics = [
  'cpuPercent',
  'memUsedBytes',
  'memTotalBytes',
  'memUsedPercent',
  'netRxBytes',
  'netTxBytes',
  'load1',
  'thermalAvailable'
];

test.describe('Back · Host — números finitos', () => {
  for (const field of hostNumerics) {
    test(`/api/host.${field} es finito`, async ({ request }) => {
      const value = (await (await request.get('/api/host')).json())[field];
      expect(Number.isFinite(value)).toBe(true);
    });

    test(`/api/host.${field} no es negativo`, async ({ request }) => {
      const value = (await (await request.get('/api/host')).json())[field];
      expect(value).toBeGreaterThanOrEqual(0);
    });
  }

  test('memUsedBytes no supera memTotalBytes', async ({ request }) => {
    const body = await (await request.get('/api/host')).json();
    expect(body.memUsedBytes).toBeLessThanOrEqual(body.memTotalBytes);
  });
});

test.describe('Back · JSON autenticado — content-type', () => {
  for (const path of ['/api/posts', '/api/users', '/api/auth/me']) {
    test(`${path} es application/json`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type'] || '').toMatch(/json/i);
    });
  }
});

test.describe('Back · Recurso creado — tipos de campo', () => {
  for (const { field, type } of publicUserFields) {
    test(`POST /api/users → ${field} es ${type}`, async ({ request }) => {
      expect((await loginApi(request, ADMIN)).status()).toBe(200);
      const created = await (await request.post('/api/users', {
        data: { username: uniqueUser(), password: 'Valid123!', role: 'user' }
      })).json();
      expect(typeof created[field]).toBe(type);
      await request.delete(`/api/users/${created.id}`);
    });
  }

  for (const { field, type } of postFields) {
    test(`POST /api/posts → ${field} es ${type}`, async ({ request }) => {
      expect((await loginApi(request, USER)).status()).toBe(200);
      const created = await (await request.post('/api/posts', {
        multipart: { title: `Tipo ${field}`, location: 'CI' }
      })).json();
      expect(typeof created[field]).toBe(type);
    });
  }
});

test.describe('Back · Errores adicionales — { error }', () => {
  test('403 admin required tiene claves exactas', async ({ request }) => {
    expect((await loginApi(request, USER)).status()).toBe(200);
    const body = await (await request.get('/api/users')).json();
    assertKeys(body, KEYS.error);
  });

  test('DELETE usuario inexistente es 404 { error }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const res = await request.delete('/api/users/9999');
    expect(res.status()).toBe(404);
    assertErrorEnvelope(await readJson(res));
  });

  test('PUT username inválido es 400 { error }', async ({ request }) => {
    expect((await loginApi(request, ADMIN)).status()).toBe(200);
    const users = await (await request.get('/api/users')).json();
    const user = users.find((row) => row.username === 'user');
    const res = await request.put(`/api/users/${user.id}`, { data: { username: 'ab' } });
    expect(res.status()).toBe(400);
    assertErrorEnvelope(await readJson(res));
  });
});
