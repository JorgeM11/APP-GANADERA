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
        // Esta regla atrapa la navegación normal Y los paquetes ocultos de Next.js (_rsc)
        urlPattern: ({ request, url }) => {
          const isNavigate = request.mode === "navigate";
          const isRSC = url.searchParams.has("_rsc");
          return isNavigate || isRSC;
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "next-app-router-cache",
          networkTimeoutSeconds: 3, // Se rinde rápido si no hay internet
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
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