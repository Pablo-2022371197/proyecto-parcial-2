document.addEventListener('DOMContentLoaded', function () {
  var tbody = document.querySelector('#users-table tbody');
  var form = document.getElementById('user-form');
  var errorEl = document.getElementById('admin-error');
  var idInput = document.getElementById('user-id');
  var usernameInput = document.getElementById('user-username');
  var passwordInput = document.getElementById('user-password');
  var roleInput = document.getElementById('user-role');
  var me = null;

  requireSession().then(function (user) {
    if (!user) {
      return;
    }
    if (user.role !== 'admin') {
      window.location.replace('/');
      return;
    }
    me = user;
    renderNav(user);
    return loadUsers();
  });

  function showError(msg) {
    errorEl.textContent = msg || '';
  }

  function resetForm() {
    idInput.value = '';
    form.reset();
    showError('');
  }

  function loadUsers() {
    return api('/api/users').then(function (users) {
      tbody.innerHTML = '';
      users.forEach(function (u) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + u.id + '</td>' +
          '<td>' + u.username + '</td>' +
          '<td><span class="role-badge ' + u.role + '">' + u.role + '</span></td>' +
          '<td>' + u.created_at + '</td>' +
          '<td></td>';
        var actions = tr.lastChild;
        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'mdl-button mdl-js-button mdl-button--raised';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', function () {
          idInput.value = u.id;
          usernameInput.value = u.username;
          passwordInput.value = '';
          roleInput.value = u.role;
          usernameInput.parentElement.classList.add('is-dirty');
        });
        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-button--accent';
        delBtn.textContent = 'Eliminar';
        delBtn.disabled = me && me.id === u.id;
        delBtn.addEventListener('click', function () {
          if (!confirm('¿Eliminar a ' + u.username + '?')) {
            return;
          }
          api('/api/users/' + u.id, { method: 'DELETE' })
            .then(loadUsers)
            .catch(function (err) {
              showError(err.message);
            });
        });
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        tbody.appendChild(tr);
      });
    }).catch(function (err) {
      showError(err.message);
    });
  }

  document.getElementById('reset-form-btn').addEventListener('click', resetForm);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');
    var id = idInput.value;
    var payload = {
      username: usernameInput.value.trim(),
      role: roleInput.value
    };
    if (passwordInput.value) {
      payload.password = passwordInput.value;
    }
    if (!id && !payload.password) {
      showError('La contraseña es obligatoria al crear.');
      return;
    }
    var req = id
      ? api('/api/users/' + id, { method: 'PUT', body: payload })
      : api('/api/users', { method: 'POST', body: payload });
    req.then(function () {
      resetForm();
      return loadUsers();
    }).catch(function (err) {
      showError(err.message);
    });
  });
});
