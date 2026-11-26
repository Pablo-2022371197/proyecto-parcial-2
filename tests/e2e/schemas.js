import { expect } from '@playwright/test';

export const KEYS = {
  health: ['service', 'status', 'timestamp', 'users'],
  host: [
    'cpuPercent',
    'load1',
    'memTotalBytes',
    'memUsedBytes',
    'memUsedPercent',
    'netRxBytes',
    'netTxBytes',
    'thermalAvailable',
    'thermalCelsius',
    'timestamp'
  ],
  authUser: ['id', 'role', 'username'],
  publicUser: ['created_at', 'id', 'role', 'username'],
  post: ['author', 'created_at', 'id', 'image', 'location', 'title'],
  error: ['error'],
  ok: ['ok'],
  deleted: ['id', 'ok']
};

export function assertKeys(obj, keys) {
  expect(obj).toEqual(expect.any(Object));
  expect(Array.isArray(obj)).toBe(false);
  expect(Object.keys(obj).sort()).toEqual([...keys].sort());
}

export function assertNoEnvelope(obj) {
  expect(obj).not.toHaveProperty('code');
  expect(obj).not.toHaveProperty('data');
  expect(obj).not.toHaveProperty('message');
}

export function assertErrorEnvelope(body) {
  assertKeys(body, KEYS.error);
  expect(typeof body.error).toBe('string');
  expect(body.error.length).toBeGreaterThan(0);
}

export function assertAuthUser(user) {
  assertKeys(user, KEYS.authUser);
  assertNoEnvelope(user);
  expect(Number.isInteger(user.id)).toBe(true);
  expect(user.id).toBeGreaterThan(0);
  expect(typeof user.username).toBe('string');
  expect(user.username.length).toBeGreaterThanOrEqual(3);
  expect(['admin', 'user']).toContain(user.role);
  expect(user).not.toHaveProperty('password_hash');
  expect(user).not.toHaveProperty('password');
}

export function assertPublicUser(user) {
  assertKeys(user, KEYS.publicUser);
  assertNoEnvelope(user);
  expect(Number.isInteger(user.id)).toBe(true);
  expect(user.id).toBeGreaterThan(0);
  expect(typeof user.username).toBe('string');
  expect(user.username.length).toBeGreaterThanOrEqual(3);
  expect(['admin', 'user']).toContain(user.role);
  expect(typeof user.created_at).toBe('string');
  expect(user.created_at.length).toBeGreaterThan(0);
  expect(user).not.toHaveProperty('password_hash');
  expect(user).not.toHaveProperty('password');
}

export function assertPost(post) {
  assertKeys(post, KEYS.post);
  assertNoEnvelope(post);
  expect(Number.isInteger(post.id)).toBe(true);
  expect(post.id).toBeGreaterThan(0);
  expect(typeof post.title).toBe('string');
  expect(post.title.length).toBeGreaterThan(0);
  expect(typeof post.location).toBe('string');
  expect(post.location.length).toBeGreaterThan(0);
  expect(typeof post.image).toBe('string');
  expect(post.image.startsWith('/')).toBe(true);
  expect(typeof post.created_at).toBe('string');
  expect(typeof post.author).toBe('string');
  expect(post.author.length).toBeGreaterThan(0);
}

export function assertHealth(body) {
  assertKeys(body, KEYS.health);
  assertNoEnvelope(body);
  expect(body.status).toBe('ok');
  expect(body.service).toBe('uteqgram');
  expect(typeof body.timestamp).toBe('string');
  expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(typeof body.users).toBe('number');
  expect(body.users).toBeGreaterThanOrEqual(2);
}

export function assertHost(body) {
  assertKeys(body, KEYS.host);
  assertNoEnvelope(body);
  expect(typeof body.timestamp).toBe('string');
  expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(typeof body.cpuPercent).toBe('number');
  expect(body.cpuPercent).toBeGreaterThanOrEqual(0);
  expect(typeof body.memUsedBytes).toBe('number');
  expect(body.memUsedBytes).toBeGreaterThan(0);
  expect(typeof body.memTotalBytes).toBe('number');
  expect(body.memTotalBytes).toBeGreaterThan(0);
  expect(typeof body.memUsedPercent).toBe('number');
  expect(body.memUsedPercent).toBeGreaterThanOrEqual(0);
  expect(body.memUsedPercent).toBeLessThanOrEqual(100);
  expect(typeof body.netRxBytes).toBe('number');
  expect(body.netRxBytes).toBeGreaterThanOrEqual(0);
  expect(typeof body.netTxBytes).toBe('number');
  expect(body.netTxBytes).toBeGreaterThanOrEqual(0);
  expect([0, 1]).toContain(body.thermalAvailable);
  expect(body.thermalCelsius === null || typeof body.thermalCelsius === 'number').toBe(true);
  expect(typeof body.load1).toBe('number');
}

export function assertOk(body) {
  assertKeys(body, KEYS.ok);
  expect(body.ok).toBe(true);
}

export function assertDeleted(body, id) {
  assertKeys(body, KEYS.deleted);
  expect(body.ok).toBe(true);
  expect(body.id).toBe(id);
}

export async function readJson(res) {
  expect(res.headers()['content-type'] || '').toMatch(/json/i);
  return res.json();
}
