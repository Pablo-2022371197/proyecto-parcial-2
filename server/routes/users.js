import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryAll, queryGet, queryRun } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
const ROLES = new Set(['admin', 'user']);

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    created_at: row.created_at
  };
}

router.use(requireAdmin);

router.get('/', (_req, res) => {
  const rows = queryAll(
    'SELECT id, username, role, created_at FROM users ORDER BY id ASC'
  );
  res.json(rows.map(publicUser));
});

router.get('/:id', (req, res) => {
  const row = queryGet(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [Number(req.params.id)]
  );
  if (!row) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json(publicUser(row));
});

router.post('/', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'user');

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Usuario inválido (3-32, alfanumérico)' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  if (!ROLES.has(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const exists = queryGet('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) {
    return res.status(409).json({ error: 'El usuario ya existe' });
  }

  const result = queryRun(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, bcrypt.hashSync(password, 10), role]
  );
  const created = queryGet(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [Number(result.lastInsertRowid)]
  );
  res.status(201).json(publicUser(created));
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = queryGet(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [id]
  );
  if (!current) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const username = req.body?.username != null
    ? String(req.body.username).trim()
    : current.username;
  const role = req.body?.role != null ? String(req.body.role) : current.role;
  const password = req.body?.password != null ? String(req.body.password) : '';

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Usuario inválido (3-32, alfanumérico)' });
  }
  if (!ROLES.has(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  if (current.role === 'admin' && role !== 'admin') {
    const admins = queryGet(
      "SELECT COUNT(*) AS n FROM users WHERE role = 'admin'"
    );
    if (admins.n <= 1) {
      return res.status(400).json({ error: 'No se puede quitar el último admin' });
    }
  }

  const taken = queryGet(
    'SELECT id FROM users WHERE username = ? AND id <> ?',
    [username, id]
  );
  if (taken) {
    return res.status(409).json({ error: 'El usuario ya existe' });
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    queryRun(
      'UPDATE users SET username = ?, role = ?, password_hash = ? WHERE id = ?',
      [username, role, bcrypt.hashSync(password, 10), id]
    );
  } else {
    queryRun(
      'UPDATE users SET username = ?, role = ? WHERE id = ?',
      [username, role, id]
    );
  }

  const updated = queryGet(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [id]
  );
  res.json(publicUser(updated));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = queryGet('SELECT id, role FROM users WHERE id = ?', [id]);
  if (!current) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  if (id === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }
  if (current.role === 'admin') {
    const admins = queryGet(
      "SELECT COUNT(*) AS n FROM users WHERE role = 'admin'"
    );
    if (admins.n <= 1) {
      return res.status(400).json({ error: 'No se puede eliminar el último admin' });
    }
  }
  queryRun('DELETE FROM users WHERE id = ?', [id]);
  res.json({ ok: true, id });
});

export default router;
