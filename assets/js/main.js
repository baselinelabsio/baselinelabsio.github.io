/* Baseline Labs marketing site — light interactions */
(function () {
  "use strict";

  // Signals that JS is running, which enables the scroll-reveal styles.
  // Without this class the content stays visible instead of blank.
  document.documentElement.classList.add("js");

  var clamp = function (n, min, max) { return n < min ? min : n > max ? max : n; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year in footers
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Header detaches into a floating bar once the page is scrolled
  var header = document.querySelector(".site-header");
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onHeaderScroll();
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
  }

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
     Featured project showcase
     - wide + tall viewports: the section pins and scrolling advances the
       tabs one by one; the page only moves on after the last one
     - otherwise: a normal section, tabs clickable and auto-advancing
     ------------------------------------------------------------------ */
  var showcase = document.querySelector(".showcase");
  var panel = document.querySelector(".showcase-panel");
  var scList = document.querySelector(".sc-list");
  var scImg = document.querySelector(".sc-media .phone-screen img");
  var scMedia = document.querySelector(".sc-media");
  var scCaption = document.querySelector(".sc-caption");

  if (showcase && panel && scList && scImg && scMedia) {
    var items = Array.prototype.slice.call(scList.querySelectorAll(".sc-item"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".sc-dot"));
    var current = items.findIndex(function (i) { return i.classList.contains("is-active"); });
    if (current < 0) current = 0;

    // Guards against out-of-order image swaps when scrolling quickly
    var swapToken = 0;

    var activate = function (idx) {
      if (idx === current || !items[idx]) return;
      current = idx;

      items.forEach(function (item, n) {
        item.classList.toggle("is-active", n === idx);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-active", n === idx);
        dot.setAttribute("aria-selected", n === idx ? "true" : "false");
      });

      var el = items[idx];
      var shot = el.getAttribute("data-shot");
      var alt = el.getAttribute("data-alt") || "";
      var cap = el.getAttribute("data-caption") || "";
      var token = ++swapToken;

      var apply = function () {
        if (token !== swapToken) return; // superseded by a newer swap
        scImg.src = shot;
        scImg.alt = alt;
        if (scCaption) scCaption.textContent = cap;
        scMedia.classList.remove("is-swapping");
      };

      scMedia.classList.add("is-swapping");
      window.setTimeout(function () {
        if (token !== swapToken) return;
        var pre = new Image();
        pre.onload = apply;
        pre.onerror = apply;
        pre.src = shot;
      }, reduce ? 0 : 160);
    };

    // --- auto-advance (only when the section is NOT scroll-driven) ---
    var autoTimer = null;
    var stopAuto = function () {
      if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
    };
    var startAuto = function () {
      if (reduce || pinned) return;
      stopAuto();
      autoTimer = window.setInterval(function () {
        activate((current + 1) % items.length);
      }, 4500);
    };

    // --- pinned / scroll-driven mode ---
    // Only where the pinned layout genuinely fits, otherwise it would clip.
    var pinQuery = window.matchMedia("(min-width: 981px) and (min-height: 700px)");
    var pinned = false;

    var applyMode = function () {
      var shouldPin = pinQuery.matches && !reduce;
      if (shouldPin === pinned) return;
      pinned = shouldPin;
      showcase.classList.toggle("is-pinned", pinned);
      showcase.style.setProperty("--steps", String(items.length));
      if (pinned) { stopAuto(); } else { startAuto(); }
    };

    var sectionTop = function () {
      return window.scrollY + showcase.getBoundingClientRect().top;
    };

    var ticking = false;
    var update = function () {
      ticking = false;
      var r = showcase.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var e;

      if (pinned) {
        // Full width by the time the section pins to the top, then held.
        e = 1 - r.top / vh;

        // Scroll position within the section picks the active tab.
        var travel = showcase.offsetHeight - vh;
        if (travel > 0) {
          var p = clamp(-r.top / travel, 0, 1);
          var idx = Math.min(items.length - 1, Math.floor(p * items.length));
          activate(idx);
        }
      } else {
        // Eases open, reaching full width as the section centres.
        var range = Math.max(r.height / 2, vh * 0.45);
        var raw = clamp((vh / 2 - r.top) / range, 0, 1);
        e = raw * raw;
      }

      panel.style.setProperty("--expand", clamp(e, 0, 1).toFixed(3));
    };

    var requestUpdate = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    };

    // Clicking a progress dot jumps to that step when pinned, else just switches
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        if (pinned) {
          var travel = showcase.offsetHeight - window.innerHeight;
          var target = sectionTop() + ((idx + 0.5) / items.length) * travel;
          window.scrollTo({ top: target, behavior: "smooth" });
        } else {
          activate(idx);
          stopAuto();
        }
      });
    });

    applyMode();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () { applyMode(); requestUpdate(); });

    // Auto-advance only while the section is on screen (non-pinned only)
    if ("IntersectionObserver" in window) {
      var scIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { startAuto(); } else { stopAuto(); }
        });
      }, { threshold: 0.35 });
      scIO.observe(showcase);
    } else {
      startAuto();
    }
  }

  // Scroll-reveal (respects reduced-motion via CSS)
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
