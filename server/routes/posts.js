import { Router } from 'express';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { queryAll, queryGet, queryRun } from '../db.js';
import { requireAuth } from '../auth.js';

const uploadsDir = resolve(process.env.UPLOADS_DIR || 'data/uploads');
mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase() || '.png';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten imágenes'));
      return;
    }
    cb(null, true);
  }
});

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  const rows = queryAll(`
    SELECT p.id, p.title, p.location, p.image_path AS image, p.created_at,
           u.username AS author
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Archivo inválido' });
    }

    const title = String(req.body?.title || '').trim();
    const location = String(req.body?.location || '').trim();
    if (!title || !location) {
      return res.status(400).json({ error: 'Título y ubicación son obligatorios' });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : '/src/images/main-image.png';

    const result = queryRun(
      'INSERT INTO posts (user_id, title, location, image_path) VALUES (?, ?, ?, ?)',
      [req.user.id, title, location, imagePath]
    );

    const post = queryGet(`
      SELECT p.id, p.title, p.location, p.image_path AS image, p.created_at,
             u.username AS author
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `, [Number(result.lastInsertRowid)]);

    res.status(201).json(post);
  });
});

export default router;
