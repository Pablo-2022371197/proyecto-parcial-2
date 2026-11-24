import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { log } from './logger.js';

const tracer = trace.getTracer('uteqgram-sqlite');

const sqlitePath = process.env.SQLITE_PATH || resolve('data/app.db');

if (sqlitePath !== ':memory:') {
  mkdirSync(dirname(resolve(sqlitePath)), { recursive: true });
}

export const db = new DatabaseSync(sqlitePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    image_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export function withSpan(name, sql, fn) {
  return tracer.startActiveSpan(name, (span) => {
    span.setAttribute('db.system', 'sqlite');
    span.setAttribute('db.statement', sql);
    try {
      const result = fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  });
}

export function queryAll(sql, params = []) {
  return withSpan('sqlite.queryAll', sql, () => db.prepare(sql).all(...params));
}

export function queryGet(sql, params = []) {
  return withSpan('sqlite.queryGet', sql, () => db.prepare(sql).get(...params));
}

export function queryRun(sql, params = []) {
  return withSpan('sqlite.queryRun', sql, () => db.prepare(sql).run(...params));
}

export function seedIfEmpty() {
  const row = queryGet('SELECT COUNT(*) AS n FROM users');
  if (row.n > 0) {
    return;
  }

  const adminHash = bcrypt.hashSync('Admin123!', 10);
  const userHash = bcrypt.hashSync('User123!', 10);

  queryRun(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    ['admin', adminHash, 'admin']
  );
  queryRun(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    ['user', userHash, 'user']
  );

  const admin = queryGet('SELECT id FROM users WHERE username = ?', ['admin']);
  const user = queryGet('SELECT id FROM users WHERE username = ?', ['user']);
  const defaultImage = '/src/images/main-image.png';

  const posts = [
    [user.id, 'Bienvenida a UTEQGram', 'Querétaro', defaultImage],
    [admin.id, 'Campus UTEQ', 'Santa Rosa Jáuregui', defaultImage],
    [user.id, 'Momento en clase', 'IDGS14', defaultImage]
  ];

  for (const post of posts) {
    queryRun(
      'INSERT INTO posts (user_id, title, location, image_path) VALUES (?, ?, ?, ?)',
      post
    );
  }

  log('info', 'database_seeded', { users: 2, posts: posts.length, sqlitePath });
}

seedIfEmpty();
