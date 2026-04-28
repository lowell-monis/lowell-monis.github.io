/* main.js — theme toggle, particles, contact form */

/* ── Particles ───────────────────────────────────────────── */
function initParticles(color) {
  if (typeof particlesJS === "undefined") return;
  if (window.pJSDom && window.pJSDom.length > 0) {
    try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); window.pJSDom = []; } catch(e) {}
  }
  particlesJS("particles-js", {
    particles: {
      number:   { value: 50, density: { enable: true, value_area: 900 } },
      color:    { value: color },
      shape:    { type: "circle" },
      opacity:  { value: 0.22, random: true },
      size:     { value: 2.5, random: true },
      line_linked: { enable: true, distance: 140, color: color, opacity: 0.08, width: 0.6 },
      move:     { enable: true, speed: 0.6, direction: "none", random: true, out_mode: "out" }
    },
    interactivity: {
      detect_on: "window",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true }, resize: true },
      modes:  { repulse: { distance: 160, duration: 0.4 } }
    },
    retina_detect: true
  });
}

/* ── Theme toggle ────────────────────────────────────────── */
(function () {
  var DARK  = "editorial-dark";
  var LIGHT = "editorial-light";
  var KEY   = "pf-theme";

  var html  = document.documentElement;
  var btn   = document.getElementById("theme-toggle");
  var label = document.getElementById("toggle-label");

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (label) label.textContent = theme === DARK ? "Light" : "Dark";
    try { localStorage.setItem(KEY, theme); } catch(e) {}
    initParticles(theme === DARK ? "#ffffff" : "#000000");
  }

  function toggle() {
    applyTheme(html.getAttribute("data-theme") === DARK ? LIGHT : DARK);
  }

  var saved;
  try { saved = localStorage.getItem(KEY); } catch(e) {}
  if (saved !== DARK && saved !== LIGHT) saved = null;
  applyTheme(saved || html.getAttribute("data-theme") || DARK);

  if (btn) btn.addEventListener("click", toggle);
})();

/* ── Contact form → mailto ───────────────────────────────── */
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var recipient = form.getAttribute("data-email") || "";
    var name      = (form.querySelector("#cf-name")    || {}).value || "";
    var replyTo   = (form.querySelector("#cf-email")   || {}).value || "";
    var message   = (form.querySelector("#cf-message") || {}).value || "";

    if (!name || !replyTo || !message) return;

    var subject = encodeURIComponent("Message from " + name);
    var body    = encodeURIComponent(
      "From: "    + name    + "\n" +
      "Email: "   + replyTo + "\n\n" +
      message
    );

    window.location.href = "mailto:" + recipient +
      "?subject=" + subject + "&body=" + body;
  });
})();
