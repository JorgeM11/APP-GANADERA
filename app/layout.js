import "./globals.css";
import SyncManager from '@/components/providers/SyncManager'; // <-- Agregamos la importación

export const metadata = {
  title: "Terra Form — Gestión Ganadera de Precisión",
  description:
    "Aplicación móvil offline-first para gestión ganadera. Registra animales, eventos de salud, reproducción y evolución directamente desde el campo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <head>
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
      </head>
      <body className="min-h-full">
        {/* El SyncManager no ocupa espacio visual, pero vigilará el internet en toda la app */}
        <SyncManager /> 
        
        {children}
      </body>
    </html>
  );
}