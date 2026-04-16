import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Se desactiva en local para no interferir con tus pruebas
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline.html", // Fallback offline: cuando el SW no puede servir una página, sirve este HTML shell
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