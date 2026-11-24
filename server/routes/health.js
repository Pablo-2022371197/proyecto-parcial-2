import { Router } from 'express';
import { queryGet } from '../db.js';
import { snapshotHost } from '../hostMetrics.js';

const router = Router();

router.get('/health', (_req, res) => {
  const users = queryGet('SELECT COUNT(*) AS n FROM users');
  res.json({
    status: 'ok',
    service: 'uteqgram',
    timestamp: new Date().toISOString(),
    users: users.n
  });
});

router.get('/host', (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    ...snapshotHost()
  });
});

export default router;
