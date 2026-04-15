import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  cacheStartUrl: true, // Vital para que el dinosaurio no aparezca al abrir la app
  dynamicStartUrl: false, // Asegura que la ruta de inicio se trate de forma estática
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true,
};

export default withPWA(nextConfig);