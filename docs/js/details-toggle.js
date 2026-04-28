/* details-toggle.js — accessible show/hide for project detail panels */
document.addEventListener("DOMContentLoaded", function () {
  var buttons = document.querySelectorAll(".details-toggle");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      var panel    = document.getElementById(targetId);
      var expanded = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", String(!expanded));
      btn.querySelector(".details-toggle-text").textContent = expanded
        ? "More details"
        : "Hide details";

      if (expanded) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    });
  });
});
