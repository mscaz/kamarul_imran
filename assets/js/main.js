(function () {
  function loadPublications() {
    return fetch('./data/publications.json')
      .then(function (response) { return response.ok ? response.json() : null; })
      .catch(function () { return null; });
  }

  window.loadProfile().then(function (profile) {
    window.applyTheme(profile.theme);
    return loadPublications().then(function (pubData) {
      window.renderSite(profile, pubData);
    });
  });
})();
