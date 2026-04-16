import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  cacheStartUrl: true,
  dynamicStartUrl: false,
  fallbacks: {
    document: "/offline.html",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        // 1. APP SHELL Y DATOS (STALE WHILE REVALIDATE)
        // No espera a la red. Sirve el cache y actualiza por debajo.
        urlPattern: ({ request, url }) => {
          const isNavigate = request.mode === "navigate";
          const isRSC = url.searchParams.has("_rsc");
          return isNavigate || isRSC;
        },
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-app-router-shell",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // 2. MOTOR DE LA APP (CHUNKS Y JS)
        // Los archivos que hacen que los botones funcionen
        urlPattern: /\/_next\/static\/.+\.js$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-js-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30, // 30 días
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true,
};

export default withPWA(nextConfig);