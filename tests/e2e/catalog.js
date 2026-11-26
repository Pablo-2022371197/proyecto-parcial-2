export const seedPosts = [
  { title: 'Bienvenida a UTEQGram', location: 'Querétaro', author: 'user' },
  { title: 'Campus UTEQ', location: 'Santa Rosa Jáuregui', author: 'admin' },
  { title: 'Momento en clase', location: 'IDGS14', author: 'user' }
];

export const seedUsers = [
  { username: 'admin', role: 'admin' },
  { username: 'user', role: 'user' }
];

export const staticAssets = [
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/css/help.css',
  '/src/css/material.indigo-pink.min.css',
  '/src/js/material.min.js',
  '/src/js/api.js',
  '/src/js/login.js',
  '/src/js/feed.js',
  '/src/js/nav.js',
  '/src/js/admin.js',
  '/src/images/main-image.png',
  '/src/images/main-image-sm.png',
  '/src/images/main-image-lg.png',
  '/src/images/icons/app-icon-192x192.png',
  '/src/images/icons/app-icon-512x512.png'
];

export const publicPages = ['/login'];

export const healthFields = ['status', 'service', 'timestamp', 'users'];
export const hostFields = [
  'timestamp',
  'cpuPercent',
  'memUsedBytes',
  'memTotalBytes',
  'memUsedPercent',
  'netRxBytes',
  'netTxBytes',
  'thermalAvailable',
  'load1'
];

export const protectedGets = [
  '/api/posts',
  '/api/users',
  '/api/users/1',
  '/api/auth/me'
];

export const protectedMutations = [
  { method: 'post', path: '/api/posts' },
  { method: 'post', path: '/api/users' },
  { method: 'put', path: '/api/users/1' },
  { method: 'delete', path: '/api/users/1' }
];

export const invalidLogins = [
  { username: '', password: 'Admin123!' },
  { username: 'admin', password: '' },
  { username: 'admin', password: 'admin' },
  { username: 'admin', password: 'admin123' },
  { username: 'Admin', password: 'Admin123!' },
  { username: 'administrator', password: 'Admin123!' },
  { username: 'root', password: 'root' },
  { username: 'user', password: 'user' },
  { username: 'user', password: 'User123' },
  { username: 'guest', password: 'guest' },
  { username: "' OR 1=1 --", password: 'x' },
  { username: 'admin', password: "' OR '1'='1" },
  { username: '<script>', password: 'x' },
  { username: 'adminx', password: 'Admin123!' },
  { username: 'userx', password: 'User123!' },
  { username: 'user', password: 'Admin123!' },
  { username: 'admin', password: 'User123!' },
  { username: 'null', password: 'null' },
  { username: 'undefined', password: 'undefined' },
  { username: 'a', password: 'aaaaaa' },
  { username: 'admin', password: '123456' },
  { username: 'test', password: 'test123' },
  { username: 'uteqgram', password: 'uteqgram' },
  { username: 'ADMIN', password: 'ADMIN123!' },
  { username: 'user.name', password: 'User123!' }
];

export const invalidUsernames = [
  'ab',
  'a',
  '',
  'thisusernameiswaytoolongtobeaccepted12',
  'has space',
  'inválido',
  'user/name',
  'user@host',
  'user#1',
  '😀user'
];

export const loginSelectors = [
  '#username',
  '#password',
  '#login-btn',
  '#login-form',
  '.mdl-layout-title',
  '#login-error'
];

export const feedSelectors = [
  '#shared-moments',
  '#share-image-button',
  '#logout-btn',
  '#title',
  '#location',
  '#post-btn',
  '#image',
  '.main-image',
  '#create-post-form',
  '#nav-username'
];

export const adminSelectors = [
  '#users-table',
  '#user-form',
  '#save-user-btn',
  '#user-role',
  '#user-username',
  '#user-password',
  '#reset-form-btn',
  '#user-id',
  '#logout-btn',
  '#nav-username'
];
