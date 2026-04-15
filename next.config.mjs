import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // --- MAGIA EXTREMA PARA OFFLINE ---
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Atrapa cualquier intento de cargar una página (como /perfil/123)
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst', // Intenta internet primero, si falla, usa el caché
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
          },
          // Si el celular ni siquiera tiene la página en caché, muestra un HTML de respaldo
          // (Opcional, pero evita que la app se rompa por completo)
        },
      },
      {
        // Atrapa todos los archivos estáticos de Next.js (JS, CSS, imágenes)
        urlPattern: /\.(?:js|css|webp|png|jpg|jpeg|svg)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
        },
      }
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);