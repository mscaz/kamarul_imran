/* Injects the stylesheet for profile.theme. Replaces any
   previously injected theme link rather than stacking them,
   so switching themes never bleeds styles from the old one. */
(function () {
  var LINK_ID = 'theme-stylesheet';

  window.applyTheme = function applyTheme(themeName) {
    var existing = document.getElementById(LINK_ID);
    if (existing) existing.remove();

    var link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = './assets/css/themes/' + themeName + '.css';
    document.head.appendChild(link);
  };
})();
