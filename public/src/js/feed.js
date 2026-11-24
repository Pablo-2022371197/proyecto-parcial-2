document.addEventListener('DOMContentLoaded', function () {
  var createPostArea = document.querySelector('#create-post');
  var closeCreatePostModalBtn = document.querySelector('#close-create-post-modal-btn');
  var sharedMomentsArea = document.querySelector('#shared-moments');
  var form = document.querySelector('#create-post-form');
  var titleInput = document.querySelector('#title');
  var locationInput = document.querySelector('#location');
  var imageInput = document.querySelector('#image');
  var snackbarContainer = document.querySelector('#confirmation-toast');
  var postButton = document.querySelector('#post-btn');
  var shareImageButton = document.querySelector('#share-image-button');

  requireSession().then(function (user) {
    if (!user) {
      return;
    }
    renderNav(user);
    return loadPosts();
  });

  function openCreatePostModal() {
    createPostArea.style.transform = 'translateY(0)';
  }

  function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vh)';
  }

  function showSnackbar(message) {
    if (typeof componentHandler !== 'undefined' && snackbarContainer && !snackbarContainer.MaterialSnackbar) {
      componentHandler.upgradeElement(snackbarContainer);
    }
    if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
      snackbarContainer.MaterialSnackbar.showSnackbar({ message: message });
    }
  }

  function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
      sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
  }

  function createCard(data) {
    var cardWrapper = document.createElement('article');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url(' + (data.image || '/src/images/main-image.png') + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '180px';
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = 'white';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = data.title;
    cardTitle.appendChild(cardTitleTextElement);
    cardWrapper.appendChild(cardTitle);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.style.textAlign = 'center';
    cardSupportingText.textContent = data.location + (data.author ? ' · ' + data.author : '');
    cardWrapper.appendChild(cardSupportingText);
    if (typeof componentHandler !== 'undefined') {
      componentHandler.upgradeElement(cardWrapper);
    }
    sharedMomentsArea.appendChild(cardWrapper);
  }

  function loadPosts() {
    return api('/api/posts').then(function (posts) {
      clearCards();
      posts.forEach(createCard);
    });
  }

  shareImageButton.addEventListener('click', openCreatePostModal);
  closeCreatePostModalBtn.addEventListener('click', closeCreatePostModal);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var title = titleInput.value.trim();
    var location = locationInput.value.trim();
    if (!title || !location) {
      alert('Ingresa un título y una ubicación válidos.');
      return;
    }
    var body = new FormData();
    body.append('title', title);
    body.append('location', location);
    if (imageInput.files && imageInput.files[0]) {
      body.append('image', imageInput.files[0]);
    }
    postButton.disabled = true;
    postButton.textContent = 'Publicando...';
    api('/api/posts', { method: 'POST', body: body })
      .then(function (post) {
        createCard(post);
        form.reset();
        closeCreatePostModal();
        showSnackbar('¡Publicación creada!');
        return loadPosts();
      })
      .catch(function (err) {
        alert(err.message || 'No se pudo crear la publicación.');
      })
      .then(function () {
        postButton.disabled = false;
        postButton.textContent = 'Postear!';
      });
  });
});
