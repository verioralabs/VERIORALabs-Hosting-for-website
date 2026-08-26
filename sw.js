/* ===================================================================
   Veriora Labs — Service Worker (offline + installable PWA)
   Version tag: 20260811  (bump this cache name when assets change)

   Strategy:
   - HTML navigations: network-first, so updates show immediately
     (matches the .htaccess no-cache for HTML).
   - Static assets (CSS/JS/images): stale-while-revalidate, so the
     cached copy renders instantly and fresh copies are stored in the
     background. Versioned ?v= URLs mean old caches get purged on the
     next activate.
   =================================================================== */

var VERSION = "20260811";
var CACHE_NAME = "veriora-labs-" + VERSION;

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key.indexOf("veriora-labs-") === 0 && key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  // Only handle same-origin requests (skip Calendly, Web3Forms, fonts,
  // Google Analytics, etc. — let the browser handle those normally).
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first so edits to copy/structure show up
  // immediately, with the cached copy (or 404 page) as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match("404.html");
          });
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then(function (cached) {
      var networkFetch = fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return cached;
        });
      return cached || networkFetch;
    })
  );
});
