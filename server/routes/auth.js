import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryGet } from '../db.js';
import { signUser, setAuthCookie, clearAuthCookie, requireAuth } from '../auth.js';
import { log } from '../logger.js';

const router = Router();

router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  const user = queryGet(
    'SELECT id, username, password_hash, role FROM users WHERE username = ?',
    [username]
  );

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    log('warn', 'login_failed', { username });
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signUser(user);
  setAuthCookie(res, token);
  log('info', 'login_ok', { username: user.username, role: user.role });
  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  log('info', 'logout', { username: req.user?.username || null });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
