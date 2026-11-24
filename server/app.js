import express from 'express';
import cookieParser from 'cookie-parser';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optionalAuth } from './auth.js';
import { requestLogger } from './logger.js';
import { httpMetrics } from './httpMetrics.js';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const uploadsDir = resolve(process.env.UPLOADS_DIR || 'data/uploads');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(optionalAuth);
  app.use(httpMetrics);
  app.use(requestLogger);

  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api', healthRoutes);

  app.get('/login', (req, res) => {
    if (req.user) {
      return res.redirect(req.user.role === 'admin' ? '/admin/users' : '/');
    }
    res.sendFile(resolve(publicDir, 'login.html'));
  });
  app.get('/admin/users', (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    if (req.user.role !== 'admin') {
      return res.redirect('/');
    }
    res.sendFile(resolve(publicDir, 'admin.html'));
  });
  app.get('/', (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    res.sendFile(resolve(publicDir, 'index.html'));
  });

  app.use(express.static(publicDir));

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Error interno' });
  });

  return app;
}
