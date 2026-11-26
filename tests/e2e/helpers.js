export const ADMIN = { username: 'admin', password: 'Admin123!' };
export const USER = { username: 'user', password: 'User123!' };

export async function loginApi(request, creds) {
  return request.post('/api/auth/login', { data: creds });
}

export async function loginUi(page, creds) {
  await page.goto('/login');
  await page.locator('#username').fill(creds.username);
  await page.locator('#password').fill(creds.password);
  await page.locator('#login-btn').click();
}

export async function loginViaApi(page, creds) {
  const res = await page.request.post('/api/auth/login', { data: creds });
  if (!res.ok()) {
    throw new Error(`loginViaApi ${res.status()} ${await res.text()}`);
  }
}

export function rowByUsername(page, username) {
  return page.locator('#users-table tbody tr').filter({
    has: page.locator('td:nth-child(2)', { hasText: new RegExp(`^${username}$`) })
  });
}

export function loc(page, control) {
  return control.locate ? control.locate(page) : page.locator(control.selector).first();
}
