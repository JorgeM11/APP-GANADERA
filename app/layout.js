import "./globals.css";
import SyncManager from '@/components/providers/SyncManager';

// 1. Configuración de Metadatos (Incluye PWA y Apple)
export const metadata = {
  title: "Terra Form — Gestión Ganadera de Precisión",
  description:
    "Aplicación móvil offline-first para gestión ganadera. Registra animales, eventos de salud, reproducción y evolución directamente desde el campo.",
  manifest: "/manifest.json", // Conecta con el archivo que creamos
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Terra Form",
    // startupImage: "/icons/apple-touch-icon.png", // Opcional: imagen de carga
  },
  formatDetection: {
    telephone: false,
  },
};

// 2. Configuración del Viewport (Color de la barra del navegador)
export const viewport = {
  themeColor: "#1B4820",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <head>
        {/* Las fuentes se mantienen igual */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Work+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        
        {/* Iconos específicos para Apple */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full">
        {/* Manejador de sincronización en segundo plano */}
        <SyncManager /> 
        
        {children}
      </body>
    </html>
  );
}