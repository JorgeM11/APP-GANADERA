import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // Esta es la regla de oro: Atrapa la ruta de perfil y la guarda para siempre
        urlPattern: /^\/inventario\/perfil($|\?)/,
        handler: 'CacheFirst', // Prioriza el molde guardado sobre internet
        options: {
          cacheName: 'animal-shell-cache',
          expiration: { maxEntries: 1, maxAgeSeconds: 365 * 24 * 60 * 60 }
        }
      },
      {
        urlPattern: /\.(?:js|css|json|webp|png|jpg)$/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-assets' }
      }
    ]
  }
});

export default withPWA({
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.unsplash.com' }] }
});