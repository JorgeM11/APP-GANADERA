import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // 1. Atrapa cuando abres la app o recargas la página completa
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-pages-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
        }
      },
      {
        // 2. Atrapa cuando haces clic en un link de Next.js dentro de la app
        urlPattern: ({ url }) => url.pathname.includes('/_next/') || url.searchParams.has('_rsc'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-router-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
        }
      },
      {
        // 3. Atrapa todas tus imágenes, iconos y código JS/CSS
        urlPattern: /\.(?:js|css|json|webp|png|jpg|svg)$/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-assets' }
      }
    ]
  }
});

export default withPWA({
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.unsplash.com' }] }
});