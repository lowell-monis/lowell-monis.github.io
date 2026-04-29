/* main.js — theme toggle, particles, wordmark scroll, vinyl player, contact form */

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

/* ── Wordmark scroll reveal ──────────────────────────────── */
(function () {
  var hero     = document.getElementById("hero");
  var wordmark = document.querySelector(".wordmark");
  if (!hero || !wordmark) return;

  new IntersectionObserver(function (entries) {
    wordmark.classList.toggle("visible", !entries[0].isIntersecting);
  }, { threshold: 0 }).observe(hero);
})();

/* ── Vinyl player (YouTube IFrame API) ───────────────────── */
/*
 * Audio source: Frank Sinatra – That's Life (official audio, YouTube)
 * Video: https://www.youtube.com/watch?v=UCENTf_LWYA
 * The YouTube IFrame API script is loaded in base.html AFTER this file,
 * so window.onYouTubeIframeAPIReady is guaranteed to be set when the API fires.
 */
var _ytPlayer   = null;
var _vinylReady = false;

window.onYouTubeIframeAPIReady = function () {
  var el = document.getElementById("yt-player");
  if (!el) return;

  _ytPlayer = new YT.Player("yt-player", {
    videoId: "UCENTf_LWYA",           /* Frank Sinatra – That's Life */
    playerVars: {
      autoplay: 0,
      fs: 0,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
      modestbranding: 1
    },
    events: {
      onReady: function () { _vinylReady = true; },
      onStateChange: function (e) {
        var playing = (e.data === YT.PlayerState.PLAYING);
        _setVinylState(playing);
      }
    }
  });
};

function _setVinylState(playing) {
  var record  = document.getElementById("vinyl-record");
  var arm     = document.getElementById("tone-arm-wrap");
  var icon    = document.getElementById("vinyl-icon");
  var label   = document.getElementById("vinyl-play-label");
  var btn     = document.getElementById("vinyl-btn");

  if (record) record.classList.toggle("spinning", playing);
  if (arm)    arm.classList.toggle("playing", playing);
  if (icon)   { icon.className = playing ? "fas fa-pause" : "fas fa-play"; }
  if (label)  label.textContent = playing ? "Pause" : "Play";
  if (btn)    btn.classList.toggle("playing", playing);
}

var _vinylSpinning = false;

function _toggleVinyl() {
  if (_vinylReady && _ytPlayer) {
    /* Audio is ready — let YouTube drive the visual state via onStateChange */
    var state = _ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      _ytPlayer.pauseVideo();
    } else {
      _ytPlayer.playVideo();
    }
  } else {
    /* YouTube not loaded — toggle visual spin independently */
    _vinylSpinning = !_vinylSpinning;
    _setVinylState(_vinylSpinning);
  }
}

var _didDrag = false;

(function () {
  var turntable = document.getElementById("vinyl-turntable");
  var vinylBtn  = document.getElementById("vinyl-btn");

  if (turntable) {
    turntable.addEventListener("click", function () {
      if (_didDrag) { _didDrag = false; return; }
      _toggleVinyl();
    });
    turntable.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); _toggleVinyl(); }
    });
  }
  if (vinylBtn) vinylBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    _toggleVinyl();
  });
})();

/* ── Vinyl drag-to-scrub ─────────────────────────────────── */
(function () {
  var record = document.getElementById("vinyl-record");
  if (!record) return;

  var dragging      = false;
  var wasSpinning   = false;
  var pointerAngle0 = 0;
  var recAngle0     = 0;
  var recAngleCur   = 0;
  var DEGS_PER_SEC  = 36; /* 360° = 10 s of content */

  function pointerAngle(e) {
    var r = record.getBoundingClientRect();
    var pt = e.touches ? e.touches[0] : e;
    return Math.atan2(pt.clientY - (r.top + r.height / 2),
                      pt.clientX - (r.left + r.width  / 2)) * 180 / Math.PI;
  }

  function computedAngle() {
    var m = window.getComputedStyle(record).transform;
    if (!m || m === "none") return 0;
    var v = m.replace("matrix(","").split(",");
    return Math.atan2(parseFloat(v[1]), parseFloat(v[0])) * 180 / Math.PI;
  }

  function onStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    dragging    = true;
    _didDrag    = false;
    wasSpinning = record.classList.contains("spinning");
    recAngle0   = computedAngle();
    recAngleCur = recAngle0;
    pointerAngle0 = pointerAngle(e);

    record.classList.remove("spinning");
    record.style.transform = "rotate(" + recAngle0 + "deg)";
    record.classList.add("dragging");

    if (_vinylReady && _ytPlayer &&
        _ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      _ytPlayer.pauseVideo();
    }
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    _didDrag = true;
    var delta = pointerAngle(e) - pointerAngle0;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    recAngleCur = recAngle0 + delta;
    record.style.transform = "rotate(" + recAngleCur + "deg)";
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    record.classList.remove("dragging");

    if (_vinylReady && _ytPlayer) {
      var seek = (recAngleCur - recAngle0) / DEGS_PER_SEC;
      var t    = Math.max(0, _ytPlayer.getCurrentTime() + seek);
      var dur  = _ytPlayer.getDuration();
      _ytPlayer.seekTo(dur > 0 ? Math.min(t, dur) : t, true);
      if (wasSpinning) _ytPlayer.playVideo();
    }

    if (wasSpinning) {
      record.style.transform = "";
      record.classList.add("spinning");
    }
  }

  record.addEventListener("mousedown",  onStart);
  record.addEventListener("touchstart", onStart, { passive: false });
  window.addEventListener("mousemove",  onMove);
  window.addEventListener("touchmove",  onMove,  { passive: false });
  window.addEventListener("mouseup",    onEnd);
  window.addEventListener("touchend",   onEnd);
})();

/* ── News pagination ─────────────────────────────────────── */
(function () {
  var PER_PAGE = 3;
  var frame = document.querySelector(".news-frame");
  if (!frame) return;
  var list  = frame.querySelector(".news-items");
  var items = Array.prototype.slice.call(list.querySelectorAll(".news-item"));
  if (items.length <= PER_PAGE) return;

  var page = 0;
  var total = Math.ceil(items.length / PER_PAGE);

  var bar = document.createElement("div");
  bar.className = "news-pagination";

  var prev = document.createElement("button");
  prev.className = "news-page-btn";
  prev.innerHTML = "&#8592;";
  prev.setAttribute("aria-label", "Previous");

  var ind = document.createElement("span");
  ind.className = "news-page-indicator";

  var next = document.createElement("button");
  next.className = "news-page-btn";
  next.innerHTML = "&#8594;";
  next.setAttribute("aria-label", "Next");

  bar.appendChild(prev);
  bar.appendChild(ind);
  bar.appendChild(next);
  frame.appendChild(bar);

  function render() {
    var start = page * PER_PAGE;
    items.forEach(function (el, i) {
      el.style.display = (i >= start && i < start + PER_PAGE) ? "" : "none";
    });
    ind.textContent  = (page + 1) + " / " + total;
    prev.disabled    = page === 0;
    next.disabled    = page === total - 1;
  }

  prev.addEventListener("click", function () { if (page > 0)       { page--; render(); } });
  next.addEventListener("click", function () { if (page < total-1) { page++; render(); } });
  render();
})();

/* ── Contact form ────────────────────────────────────────── */
/*
 * GitHub dispatch endpoint  → triggers Actions workflow → smtplib email
 * contact.php endpoint      → serve.py SMTP handler (local dev)
 */
(function () {
  var form   = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name     = (form.querySelector("#cf-name")    || {}).value || "";
    var replyTo  = (form.querySelector("#cf-email")   || {}).value || "";
    var message  = (form.querySelector("#cf-message") || {}).value || "";
    var endpoint = form.getAttribute("data-endpoint") || "contact.php";
    var token    = form.getAttribute("data-token")    || "";

    if (!name || !replyTo || !message) return;

    var btn = form.querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    if (status) status.textContent = "";

    var isDispatch = endpoint.indexOf("api.github.com") !== -1 && token;

    var request = isDispatch
      ? fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event_type: "contact-form-submission",
            client_payload: { name: name, email: replyTo, message: message }
          })
        }).then(function (r) {
          if (r.status === 204) return { success: true };
          return r.json().catch(function () { return { success: false }; });
        })
      : fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
          body: new URLSearchParams({ name: name, email: replyTo, message: message })
        }).then(function (r) {
          return r.text().then(function (t) {
            try { return JSON.parse(t); } catch (_) { return { success: true }; }
          });
        });

    request
      .then(function (data) {
        if (data.error) throw new Error(data.error);
        if (data.success === false) throw new Error("Request failed");
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = "Send Message"; }
        if (status) {
          status.style.color = "var(--text-2)";
          status.textContent = data.logged
            ? "Message received — configure SMTP secrets in GitHub Actions to enable email."
            : "Message sent! I’ll be in touch soon.";
        }
      })
      .catch(function (err) {
        console.error("Form error:", err);
        if (btn)    { btn.disabled = false; btn.textContent = "Send Message"; }
        if (status) { status.textContent = "Something went wrong — please try again or email directly."; status.style.color = "inherit"; }
      });
  });
})();

/* ── About photo cycling ─────────────────────────────────── */
(function () {
  var wrap = document.querySelector(".about-photo-wrap[data-photos]");
  if (!wrap) return;
  var img = wrap.querySelector("img");
  if (!img) return;

  var photos;
  try { photos = JSON.parse(wrap.getAttribute("data-photos")); } catch (e) { return; }
  if (!photos || photos.length < 2) return;

  var current = 0;

  wrap.addEventListener("click", function () {
    current = (current + 1) % photos.length;
    img.style.opacity = "0";
    setTimeout(function () {
      img.src = photos[current];
      img.style.opacity = "";
    }, 220);
  });
})();

