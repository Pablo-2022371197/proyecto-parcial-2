async function api(path, options) {
  const opts = options || {};
  const headers = Object.assign({}, opts.headers || {});
  const isForm = opts.body instanceof FormData;
  if (!isForm && opts.body && typeof opts.body === 'object' && !(opts.body instanceof Blob)) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, Object.assign({ credentials: 'include' }, opts, { headers }));
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Error de red');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function currentUser() {
  return api('/api/auth/me');
}

function requireSession() {
  return currentUser().catch(function () {
    window.location.replace('/login');
    return null;
  });
}
