export const ADMIN = { username: 'admin', password: 'Admin123!' };
export const USER = { username: 'user', password: 'User123!' };

export async function loginApi(request, creds) {
  const res = await request.post('/api/auth/login', { data: creds });
  return res;
}

export async function loginUi(page, creds) {
  await page.goto('/login');
  await page.locator('#username').fill(creds.username);
  await page.locator('#password').fill(creds.password);
  await page.locator('#login-btn').click();
}
