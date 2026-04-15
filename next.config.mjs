import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Estas opciones fuerzan a Next.js a descargar las páginas en cuanto detecta un enlace
  cacheOnFrontEndNav: true, 
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    // Esto es clave: le dice al Service Worker que no ignore los parámetros ?id=
    // Pero que use el mismo archivo cacheado para todos los IDs.
    ignoreURLParametersMatching: [/^id$/, /^tab$/], 
    runtimeCaching: [
      {
        // 1. CACHÉ DE NAVEGACIÓN (VISTAS)
        // Esta regla atrapa todas las páginas (Inventario, Perfil, Formularios)
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst", // Intenta descargar lo más nuevo, si no hay internet, usa el caché
        options: {
          cacheName: "vistas-ganaderas-offline",
          networkTimeoutSeconds: 3, // Si el internet está muy lento, salta al caché en 3 seg.
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // Guardar por 30 días
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // 2. CACHÉ DE IMÁGENES DE SUPABASE
        // Para que las fotos de las vacas se vean siempre
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: "StaleWhileRevalidate", // Muestra lo que hay en caché y actualiza por debajo si hay red
        options: {
          cacheName: "fotos-animales",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      {
        // 3. RECURSOS ESTÁTICOS (JS, CSS, Fuentes)
        urlPattern: /\.(?:js|css|json|woff2|png|svg|jpg)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "activos-sistema",
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivamos la optimización de imágenes porque requiere un servidor activo.
  // unoptimized: true permite que las imágenes se sirvan como archivos estáticos normales (offline-ready).
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true,
};

export default withPWA(nextConfig);