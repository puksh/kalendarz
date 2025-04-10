const CACHE_NAME = "vue-pwa-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Combined fetch event listener
self.addEventListener("fetch", (event) => {
  // Check if the request is for a resource with integrity issues
  if (event.request.url.includes("kal.kot.li")) {
    event.respondWith(
      fetch(event.request, {
        // Skip integrity checks for problematic resources
        integrity: "",
        credentials: "same-origin",
      }).catch((error) => {
        console.log("Fetch error in service worker:", error);
        // Fallback response if needed
        return new Response("// Fallback content", {
          headers: { "Content-Type": "application/javascript" },
        });
      }),
    );
  } else {
    // Handle regular requests with cache-first strategy
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      }),
    );
  }
});
