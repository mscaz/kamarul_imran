/* Fetches and parses profile.yaml, validates required fields,
   exposes window.PROFILE. Fails soft: shows an on-page banner
   instead of a blank page when parsing or validation fails. */
(function () {
  var REQUIRED_FIELDS = [
    'name',
    'qualification',
    'institution_address',
    'research_interests',
    'expertise'
  ];

  var VALID_THEMES = [
    'classic-navy',
    'forest-green',
    'ocean-teal',
    'slate-minimal',
    'warm-maroon'
  ];
  var DEFAULT_THEME = 'classic-navy';

  function showError(message) {
    var banner = document.getElementById('config-error-banner');
    if (!banner) return;
    banner.textContent = message;
    banner.classList.add('visible');
  }

  function validate(profile) {
    var missing = REQUIRED_FIELDS.filter(function (field) {
      var value = profile[field];
      if (Array.isArray(value)) return value.length === 0;
      return !value || String(value).trim() === '';
    });
    if (missing.length > 0) {
      showError(
        'This site is missing required profile information: ' +
        missing.join(', ') +
        '. Edit profile.yaml to add these fields.'
      );
    }

    if (VALID_THEMES.indexOf(profile.theme) === -1) {
      if (profile.theme) {
        console.warn('Unknown theme "' + profile.theme + '" in profile.yaml, falling back to ' + DEFAULT_THEME);
      }
      profile.theme = DEFAULT_THEME;
    }

    return profile;
  }

  window.loadProfile = function loadProfile() {
    return fetch('./profile.yaml')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('profile.yaml could not be loaded (HTTP ' + response.status + ')');
        }
        return response.text();
      })
      .then(function (text) {
        var parsed;
        try {
          parsed = jsyaml.load(text);
        } catch (err) {
          throw new Error('profile.yaml has a syntax error: ' + err.message);
        }
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('profile.yaml did not parse into a valid profile object.');
        }
        return validate(parsed);
      })
      .catch(function (err) {
        showError('Could not load this site\'s profile: ' + err.message);
        return validate({ theme: DEFAULT_THEME });
      });
  };
})();
