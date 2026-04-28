/* particles-config.js — initializes particles.js with theme-aware color */
function loadParticles(color) {
  if (typeof particlesJS === "undefined") return;

  particlesJS("particles-js", {
    particles: {
      number:    { value: 55, density: { enable: true, value_area: 900 } },
      color:     { value: color || "#ffffff" },
      shape:     { type: "circle" },
      opacity:   { value: 0.18, random: true, anim: { enable: false } },
      size:      { value: 2, random: true, anim: { enable: false } },
      line_linked: {
        enable:   true,
        distance: 140,
        color:    color || "#ffffff",
        opacity:  0.08,
        width:    0.5
      },
      move: {
        enable:    true,
        speed:     0.6,
        direction: "none",
        random:    true,
        straight:  false,
        out_mode:  "out"
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: false },
        resize:  true
      },
      modes: {
        grab: { distance: 180, line_linked: { opacity: 0.25 } }
      }
    },
    retina_detect: true
  });

  /* expose instance for theme switching */
  window.__particlesInstance = window.pJSDom && window.pJSDom[window.pJSDom.length - 1];
}

document.addEventListener("DOMContentLoaded", function () {
  var isDark = document.documentElement.getAttribute("data-theme") !== "editorial-light";
  loadParticles(isDark ? "#ffffff" : "#000000");
});
