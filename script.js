(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll state
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Services nav dropdown: close on outside click, and close on link click
  var navDropdown = document.querySelector(".nav-dropdown");
  if (navDropdown) {
    document.addEventListener("click", function (e) {
      if (navDropdown.hasAttribute("open") && !navDropdown.contains(e.target)) {
        navDropdown.removeAttribute("open");
      }
    });
    navDropdown.querySelectorAll(".dropdown-panel a").forEach(function (link) {
      link.addEventListener("click", function () { navDropdown.removeAttribute("open"); });
    });
  }

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var mobileDrawer = document.getElementById("mobileNavDrawer");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var targetMenu = mobileDrawer || navLinks;
      if (!targetMenu) return;
      var isOpen = targetMenu.classList.toggle("is-open");
      if (navLinks && navLinks !== targetMenu) navLinks.classList.toggle("is-open", isOpen);
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    var closeMenu = function () {
      if (mobileDrawer) mobileDrawer.classList.remove("is-open");
      if (navLinks) navLinks.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    if (mobileDrawer) {
      mobileDrawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });
    }
    if (navLinks) {
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });
    }
  }

  // Booking modal (Book a Free Discovery Call)
  var modal = document.getElementById("bookingModal");
  if (modal) {
    var modalPanel = modal.querySelector(".modal-panel");
    var closeBtn = document.getElementById("bookingModalClose");
    var lastFocused = null;

    var openModal = function (e) {
      if (e) e.preventDefault();
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    };

    var closeModal = function () {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", openModal);
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    // Tab switching
    var tabs = modal.querySelectorAll(".modal-tab");
    var panels = modal.querySelectorAll(".modal-tabpanel");
    var switchTab = function (name) {
      tabs.forEach(function (t) {
        var active = t.getAttribute("data-tab") === name;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
      });
    };
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { switchTab(tab.getAttribute("data-tab")); });
    });
    modal.querySelectorAll("[data-tab-switch]").forEach(function (el) {
      el.addEventListener("click", function () { switchTab(el.getAttribute("data-tab-switch")); });
    });

    // Copy-to-clipboard chip (e.g. email address) instead of forcing a mailto
    modal.querySelectorAll("[data-copy-text]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy-text");
        var restoreLabel = btn.textContent;
        var showCopied = function () {
          btn.textContent = "Copied!";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = restoreLabel;
            btn.classList.remove("is-copied");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showCopied).catch(function () {
            btn.textContent = text; // last resort: reveal it for manual copy
          });
        } else {
          // Fallback for older browsers without Clipboard API
          var temp = document.createElement("textarea");
          temp.value = text;
          temp.style.position = "fixed";
          temp.style.opacity = "0";
          document.body.appendChild(temp);
          temp.select();
          try { document.execCommand("copy"); showCopied(); } catch (err) { btn.textContent = text; }
          document.body.removeChild(temp);
        }
      });
    });

    // Calendly / Cal.com embed — only injects the iframe once a real
    // scheduling link has been configured, so visitors never see a broken
    // embed or 404 while it's still a placeholder.
    var calendlyEmbed = document.getElementById("calendlyEmbed");
    if (calendlyEmbed) {
      var calUrl = calendlyEmbed.getAttribute("data-calendly-url") || "";
      var isConfigured = calUrl && calUrl.indexOf("ADD_YOUR_CALENDLY_URL_HERE") === -1;
      if (isConfigured) {
        var iframe = document.createElement("iframe");
        iframe.src = calUrl;
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.loading = "lazy";
        iframe.title = "Schedule a discovery call";
        calendlyEmbed.appendChild(iframe);
      } else {
        calendlyEmbed.innerHTML =
          '<div class="calendly-placeholder">' +
            "<p><strong>Online scheduling isn\u2019t connected yet.</strong></p>" +
            "<p>In the meantime, send us a message or reach out directly and we\u2019ll find a time that works.</p>" +
            '<button type="button" class="btn btn-primary" data-tab-switch="message">Send a message instead</button>' +
          "</div>";
        var placeholderBtn = calendlyEmbed.querySelector("[data-tab-switch]");
        if (placeholderBtn) {
          placeholderBtn.addEventListener("click", function () { switchTab("message"); });
        }
      }
    }

    // Message form: submit to Web3Forms via fetch so the email is sent
    // directly to us, with no mail client involved on the visitor's end.
    // Falls back to a pre-filled mailto only if the access key hasn't been
    // configured yet, or as a last resort if the request itself fails.
    var form = modal.querySelector(".booking-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        var action = form.getAttribute("action") || "";
        var statusEl = form.querySelector("[data-form-status]");
        var fallbackEmail = form.getAttribute("data-fallback-email");
        var accessKeyInput = form.querySelector('[name="access_key"]');
        var accessKey = accessKeyInput ? accessKeyInput.value : "";

        if (!accessKey || accessKey.indexOf("YOUR_WEB3FORMS_ACCESS_KEY") !== -1) {
          // Not configured yet — fall back to a pre-filled email so the
          // request is never lost, but this should be temporary: add a real
          // access key from web3forms.com to send straight to your inbox.
          e.preventDefault();
          var name = form.querySelector("#bf-name").value;
          var email = form.querySelector("#bf-email").value;
          var company = form.querySelector("#bf-company").value;
          var message = form.querySelector("#bf-message").value;
          var body = "Name: " + name + "\nEmail: " + email + "\nCompany: " + company + "\n\n" + message;
          window.location.href = "mailto:" + fallbackEmail +
            "?subject=" + encodeURIComponent("Free Discovery Call Request — Website") +
            "&body=" + encodeURIComponent(body);
          return;
        }

        e.preventDefault();
        if (statusEl) { statusEl.textContent = "Sending…"; statusEl.className = "form-note"; }
        fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
          .then(function (result) {
            if (result.ok && result.data && result.data.success) {
              form.reset();
              if (statusEl) { statusEl.textContent = "Thanks — we'll be in touch within one business day."; statusEl.className = "form-note is-success"; }
            } else {
              throw new Error("submit failed");
            }
          }).catch(function () {
            if (statusEl) { statusEl.textContent = "Something went wrong. Please email us at " + fallbackEmail + " instead."; statusEl.className = "form-note is-error"; }
          });
      });
    }
  }

  // Scroll reveal
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // Service worker registration (PWA install + offline support).
  // The worker itself is network-first for HTML, so updates always show.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
