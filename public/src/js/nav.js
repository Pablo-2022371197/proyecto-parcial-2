function renderNav(user) {
  var nameEl = document.getElementById('nav-username');
  var adminLinks = document.querySelectorAll('[data-admin-only]');
  var logoutBtn = document.getElementById('logout-btn');

  if (nameEl && user) {
    nameEl.textContent = user.username + ' (' + user.role + ')';
  }

  adminLinks.forEach(function (el) {
    if (!user || user.role !== 'admin') {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      api('/api/auth/logout', { method: 'POST' }).finally(function () {
        window.location.replace('/login');
      });
    });
  }
}
