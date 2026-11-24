import { existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

process.env.PORT = process.env.PORT || '3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'playwright-secret';
process.env.OTEL_SDK_DISABLED = 'true';
process.env.SQLITE_PATH = resolve('data/e2e.db');
process.env.UPLOADS_DIR = resolve('data/uploads');

mkdirSync('data/uploads', { recursive: true });
for (const suffix of ['', '-wal', '-shm']) {
  const file = process.env.SQLITE_PATH + suffix;
  if (existsSync(file)) {
    rmSync(file, { force: true });
  }
}

await import('../server/index.js');
