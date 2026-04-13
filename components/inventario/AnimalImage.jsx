'use client';

import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

/**
 * AnimalImage: Componente inteligente que decide qué fuente de imagen usar
 * para lograr una experiencia Offline-First perfecta.
 * * @param {string} photoPath - URL pública de Supabase Storage (Online)
 * @param {Blob} photoBlob - Archivo binario crudo guardado en Dexie (Offline)
 * @param {string} alt - Texto alternativo para accesibilidad
 * @param {string} className - Clases de CSS extra
 */
export default function AnimalImage({ 
  photoPath, 
  photoBlob, 
  alt = 'Foto del animal', 
  className = '' 
}) {
  // Estado para la URL temporal creada a partir del Blob
  const [localUrl, setLocalUrl] = useState(null);

  useEffect(() => {
    // 1. Si NO hay URL de la nube, pero SÍ hay un binario local...
    if (!photoPath && photoBlob instanceof Blob) {
      
      // Creamos una URL temporal que el navegador sí puede renderizar
      const url = URL.createObjectURL(photoBlob);
      setLocalUrl(url);

      // --- LIMPIEZA CRUCIAL ---
      // Esta función se ejecuta cuando el componente desaparece de la pantalla.
      // Es VITAL para no llenar la memoria del teléfono de URLs fantasma.
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      // Si llega una photoPath nueva, borramos la local vieja
      setLocalUrl(null);
    }
  }, [photoPath, photoBlob]); // Se ejecuta si cambia el path o el blob

  // --- LÓGICA DE DECISIÓN DE FUENTE (Last Write Wins) ---
  let finalSrc = null;

  if (photoPath) {
    // 1. Prioridad Máxima: Si ya se sincronizó, usamos la nube (URL Supabase)
    finalSrc = photoPath;
  } else if (localUrl) {
    // 2. Prioridad Media: Si estamos offline, usamos la URL temporal local
    finalSrc = localUrl;
  }

  // --- RENDERIZADO CON SKELETON PLACEHOLDER ---
  if (!finalSrc) {
    // Si no hay ninguna foto, mostramos un ícono placeholder bonito
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 ${className}`}>
        <Camera className="w-1/3 h-1/3 opacity-50" strokeWidth={1} />
        <span className="text-[5px] font-bold uppercase tracking-widest mt-1 opacity-50">SIN FOTO</span>
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      // Usamos object-cover para que la foto llene el espacio sin deformarse
      className={`object-cover animate-in fade-in duration-300 ${className}`}
      // Lazy loading para mejorar rendimiento en listados largos
      loading="lazy" 
    />
  );
}