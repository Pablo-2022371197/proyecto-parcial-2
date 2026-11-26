import { rowByUsername } from './helpers.js';

export const seedPosts = [
  { title: 'Bienvenida a UTEQGram', location: 'Querétaro', author: 'user' },
  { title: 'Campus UTEQ', location: 'Santa Rosa Jáuregui', author: 'admin' },
  { title: 'Momento en clase', location: 'IDGS14', author: 'user' }
];

export const seedUsers = [
  { username: 'admin', role: 'admin' },
  { username: 'user', role: 'user' }
];

export const healthFields = [
  { field: 'status', type: 'string' },
  { field: 'service', type: 'string' },
  { field: 'timestamp', type: 'string' },
  { field: 'users', type: 'number' }
];

export const hostFields = [
  { field: 'timestamp', type: 'string' },
  { field: 'cpuPercent', type: 'number' },
  { field: 'memUsedBytes', type: 'number' },
  { field: 'memTotalBytes', type: 'number' },
  { field: 'memUsedPercent', type: 'number' },
  { field: 'netRxBytes', type: 'number' },
  { field: 'netTxBytes', type: 'number' },
  { field: 'thermalAvailable', type: 'number' },
  { field: 'load1', type: 'number' }
];

export const postFields = [
  { field: 'id', type: 'number' },
  { field: 'title', type: 'string' },
  { field: 'location', type: 'string' },
  { field: 'image', type: 'string' },
  { field: 'created_at', type: 'string' },
  { field: 'author', type: 'string' }
];

export const publicUserFields = [
  { field: 'id', type: 'number' },
  { field: 'username', type: 'string' },
  { field: 'role', type: 'string' },
  { field: 'created_at', type: 'string' }
];

export const authUserFields = [
  { field: 'id', type: 'number' },
  { field: 'username', type: 'string' },
  { field: 'role', type: 'string' }
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

export const userForbidden = [
  { method: 'get', path: '/api/users' },
  { method: 'get', path: '/api/users/1' },
  { method: 'post', path: '/api/users' },
  { method: 'put', path: '/api/users/1' },
  { method: 'delete', path: '/api/users/2' }
];

export const jsonEndpoints = ['/api/health', '/api/host'];

export const postSamples = [
  { title: 'Laboratorio DevOps', location: 'UTEQ' },
  { title: 'Pipeline verde', location: 'Ohio' },
  { title: 'Observabilidad', location: 'OpenObserve' },
  { title: 'Prueba Playwright', location: 'CI' },
  { title: 'Post con ñandú', location: 'Querétaro' },
  { title: 'Foto del campus', location: 'Santa Rosa' },
  { title: 'IDGS14', location: 'Aula 3' },
  { title: 'Despliegue EC2', location: 'us-east-2' }
];

export const invalidRoles = ['root', 'superadmin', 'ADMIN', 'usuario'];
export const shortPasswords = ['', '1', '12', '123', '12345'];

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

export const loginControls = [
  {
    id: 'username',
    selector: '#username',
    tag: 'INPUT',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'text' },
    accessible: { type: 'attr', name: 'name', value: 'username' },
    interact: { type: 'fill', value: 'admin' }
  },
  {
    id: 'password',
    selector: '#password',
    tag: 'INPUT',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'password' },
    accessible: { type: 'attr', name: 'autocomplete', value: 'current-password' },
    interact: { type: 'fill', value: 'secreto' }
  },
  {
    id: 'login-btn',
    selector: '#login-btn',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'submit' },
    accessible: { type: 'text', value: /Entrar/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'login-form',
    selector: '#login-form',
    tag: 'FORM',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'novalidate', value: '' },
    accessible: { type: 'attr', name: 'id', value: 'login-form' },
    interact: { type: 'none' }
  },
  {
    id: 'label-username',
    selector: 'label[for="username"]',
    tag: 'LABEL',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'for', value: 'username' },
    accessible: { type: 'text', value: /Usuario/ },
    interact: { type: 'click-label', focuses: '#username' }
  },
  {
    id: 'label-password',
    selector: 'label[for="password"]',
    tag: 'LABEL',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'for', value: 'password' },
    accessible: { type: 'text', value: /Contraseña/ },
    interact: { type: 'click-label', focuses: '#password' }
  },
  {
    id: 'login-error',
    selector: '#login-error',
    tag: 'P',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'role', value: 'alert' },
    accessible: { type: 'attr', name: 'id', value: 'login-error' },
    interact: { type: 'none' }
  }
];

export const feedControls = [
  {
    id: 'logout-btn',
    selector: '#logout-btn',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Salir/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'header-feed',
    selector: '.mdl-layout__header a.mdl-navigation__link[href="/"]',
    tag: 'A',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'href', value: '/' },
    accessible: { type: 'text', value: /Feed/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'header-users',
    selector: '.mdl-layout__header a[data-admin-only][href="/admin/users"]',
    tag: 'A',
    visible: false,
    enabled: true,
    focusable: false,
    attr: { name: 'href', value: '/admin/users' },
    accessible: { type: 'text', value: /Usuarios/ },
    interact: { type: 'none' }
  },
  {
    id: 'nav-username',
    selector: '#nav-username',
    tag: 'SPAN',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'id', value: 'nav-username' },
    accessible: { type: 'text', value: /user \(user\)/ },
    interact: { type: 'none' }
  },
  {
    id: 'drawer-button',
    selector: '.mdl-layout__drawer-button',
    tag: 'DIV',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'tabindex', value: '0' },
    accessible: { type: 'attr', name: 'class', value: /mdl-layout__drawer-button/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'drawer-feed',
    selector: '.mdl-layout__drawer a.mdl-navigation__link[href="/"]',
    tag: 'A',
    visible: 'attached',
    enabled: true,
    focusable: false,
    attr: { name: 'href', value: '/' },
    accessible: { type: 'text', value: /Feed/ },
    interact: { type: 'none' }
  },
  {
    id: 'drawer-users',
    selector: '.mdl-layout__drawer a[data-admin-only][href="/admin/users"]',
    tag: 'A',
    visible: false,
    enabled: true,
    focusable: false,
    attr: { name: 'href', value: '/admin/users' },
    accessible: { type: 'text', value: /Usuarios/ },
    interact: { type: 'none' }
  },
  {
    id: 'fab',
    selector: '#share-image-button',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'attr', name: 'id', value: 'share-image-button' },
    interact: { type: 'trial-click' }
  },
  {
    id: 'title',
    selector: '#title',
    tag: 'INPUT',
    visible: 'attached',
    enabled: true,
    focusable: true,
    setup: 'open-modal',
    attr: { name: 'name', value: 'title' },
    accessible: { type: 'attr', name: 'id', value: 'title' },
    interact: { type: 'fill', value: 'Momento de prueba' }
  },
  {
    id: 'location',
    selector: '#location',
    tag: 'INPUT',
    visible: 'attached',
    enabled: true,
    focusable: true,
    setup: 'open-modal',
    attr: { name: 'name', value: 'location' },
    accessible: { type: 'attr', name: 'id', value: 'location' },
    interact: { type: 'fill', value: 'Campus UTEQ' }
  },
  {
    id: 'image',
    selector: '#image',
    tag: 'INPUT',
    visible: 'attached',
    enabled: true,
    focusable: true,
    setup: 'open-modal',
    attr: { name: 'accept', value: 'image/*' },
    accessible: { type: 'attr', name: 'type', value: 'file' },
    interact: { type: 'file' }
  },
  {
    id: 'post-btn',
    selector: '#post-btn',
    tag: 'BUTTON',
    visible: 'attached',
    enabled: true,
    focusable: true,
    setup: 'open-modal',
    attr: { name: 'type', value: 'submit' },
    accessible: { type: 'text', value: /Postear/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'close-modal',
    selector: '#close-create-post-modal-btn',
    tag: 'BUTTON',
    visible: 'attached',
    enabled: true,
    focusable: true,
    setup: 'open-modal',
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'attr', name: 'id', value: 'close-create-post-modal-btn' },
    interact: { type: 'trial-click' }
  },
  {
    id: 'create-post-form',
    selector: '#create-post-form',
    tag: 'FORM',
    visible: 'attached',
    enabled: true,
    focusable: false,
    attr: { name: 'id', value: 'create-post-form' },
    accessible: { type: 'attr', name: 'id', value: 'create-post-form' },
    interact: { type: 'none' }
  },
  {
    id: 'label-title',
    selector: 'label[for="title"]',
    tag: 'LABEL',
    visible: 'attached',
    enabled: true,
    focusable: false,
    setup: 'open-modal',
    attr: { name: 'for', value: 'title' },
    accessible: { type: 'text', value: /Título/ },
    interact: { type: 'click-label', focuses: '#title' }
  },
  {
    id: 'toast',
    selector: '#confirmation-toast',
    tag: 'DIV',
    visible: 'attached',
    enabled: true,
    focusable: false,
    attr: { name: 'aria-live', value: 'assertive' },
    accessible: { type: 'attr', name: 'aria-atomic', value: 'true' },
    interact: { type: 'none' }
  }
];

export const adminControls = [
  {
    id: 'user-username',
    selector: '#user-username',
    tag: 'INPUT',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'name', value: 'username' },
    accessible: { type: 'attr', name: 'required', value: '' },
    interact: { type: 'fill', value: 'nuevo01' }
  },
  {
    id: 'user-password',
    selector: '#user-password',
    tag: 'INPUT',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'password' },
    accessible: { type: 'attr', name: 'name', value: 'password' },
    interact: { type: 'fill', value: 'Clave123!' }
  },
  {
    id: 'user-role',
    selector: '#user-role',
    tag: 'SELECT',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'name', value: 'role' },
    accessible: { type: 'attr', name: 'id', value: 'user-role' },
    interact: { type: 'select', value: 'admin' }
  },
  {
    id: 'save-user-btn',
    selector: '#save-user-btn',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'submit' },
    accessible: { type: 'text', value: /Guardar/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'reset-form-btn',
    selector: '#reset-form-btn',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Cancelar/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'user-form',
    selector: '#user-form',
    tag: 'FORM',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'novalidate', value: '' },
    accessible: { type: 'attr', name: 'id', value: 'user-form' },
    interact: { type: 'none' }
  },
  {
    id: 'header-feed',
    selector: '.mdl-layout__header a.mdl-navigation__link[href="/"]',
    tag: 'A',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'href', value: '/' },
    accessible: { type: 'text', value: /Feed/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'header-users',
    selector: '.mdl-layout__header a.mdl-navigation__link[href="/admin/users"]',
    tag: 'A',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'href', value: '/admin/users' },
    accessible: { type: 'text', value: /Usuarios/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'logout-btn',
    selector: '#logout-btn',
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Salir/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'drawer-button',
    selector: '.mdl-layout__drawer-button',
    tag: 'DIV',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'tabindex', value: '0' },
    accessible: { type: 'attr', name: 'class', value: /mdl-layout__drawer-button/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'edit-admin',
    locate: (page) => rowByUsername(page, 'admin').getByRole('button', { name: 'Editar' }),
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Editar/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'delete-self',
    locate: (page) => rowByUsername(page, 'admin').getByRole('button', { name: 'Eliminar' }),
    tag: 'BUTTON',
    visible: true,
    enabled: false,
    focusable: false,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Eliminar/ },
    interact: { type: 'none' }
  },
  {
    id: 'delete-user',
    locate: (page) => rowByUsername(page, 'user').getByRole('button', { name: 'Eliminar' }),
    tag: 'BUTTON',
    visible: true,
    enabled: true,
    focusable: true,
    attr: { name: 'type', value: 'button' },
    accessible: { type: 'text', value: /Eliminar/ },
    interact: { type: 'trial-click' }
  },
  {
    id: 'nav-username',
    selector: '#nav-username',
    tag: 'SPAN',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'id', value: 'nav-username' },
    accessible: { type: 'text', value: /admin \(admin\)/ },
    interact: { type: 'none' }
  },
  {
    id: 'users-table',
    selector: '#users-table',
    tag: 'TABLE',
    visible: true,
    enabled: true,
    focusable: false,
    attr: { name: 'id', value: 'users-table' },
    accessible: { type: 'attr', name: 'class', value: /users-table/ },
    interact: { type: 'none' }
  }
];
