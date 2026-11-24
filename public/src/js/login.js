document.addEventListener('DOMContentLoaded', function () {
  currentUser().then(function () {
    window.location.replace('/');
  }).catch(function () {
    /* stay on login */
  });

  var form = document.getElementById('login-form');
  var errorEl = document.getElementById('login-error');
  var btn = document.getElementById('login-btn');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorEl.textContent = '';
    btn.disabled = true;
    api('/api/auth/login', {
      method: 'POST',
      body: {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value
      }
    }).then(function (user) {
      if (user.role === 'admin') {
        window.location.replace('/admin/users');
      } else {
        window.location.replace('/');
      }
    }).catch(function (err) {
      errorEl.textContent = err.message || 'No se pudo iniciar sesión';
    }).then(function () {
      btn.disabled = false;
    });
  });
});
