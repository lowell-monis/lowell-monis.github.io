/* theme-toggle.js */
(function () {
  var DARK  = "editorial-dark";
  var LIGHT = "editorial-light";
  var KEY   = "portfolio-theme";

  var html       = document.documentElement;
  var stylesheet = document.getElementById("theme-stylesheet");
  var btn        = document.getElementById("theme-toggle");
  var label      = document.getElementById("toggle-label");

  function applyTheme(theme) {
    /* 1. Flip data-theme attribute (controls CSS toggle-thumb position) */
    html.setAttribute("data-theme", theme);

    /* 2. Swap the theme stylesheet — replace only the filename, not the path */
    var href = stylesheet.getAttribute("href");
    var newHref = href.replace(/(themes\/)[\w-]+(\.css)$/, "$1" + theme + "$2");
    stylesheet.setAttribute("href", newHref);

    /* 3. Update toggle label to show what clicking will switch TO */
    label.textContent = theme === DARK ? "Light" : "Dark";

    /* 4. Persist preference */
    try { localStorage.setItem(KEY, theme); } catch (e) {}

    /* 5. Recolor particles if running */
    var color = theme === DARK ? "#ffffff" : "#000000";
    if (window.pJSDom && window.pJSDom.length > 0) {
      try {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window.pJSDom = [];
      } catch (e) {}
      if (typeof loadParticles === "function") loadParticles(color);
    }
  }

  function toggle() {
    var current = html.getAttribute("data-theme");
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  /* On load: honour saved preference, fall back to data-theme set by build.py */
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  applyTheme(saved || html.getAttribute("data-theme") || DARK);

  if (btn) btn.addEventListener("click", toggle);
})();
