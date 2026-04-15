'use client';

import { useEffect } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { runFullSync } from '@/lib/syncUtils'; // <-- CAMBIAMOS LA IMPORTACIÓN
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * SyncManager: Componente de lógica pura que vigila la conectividad y la cola.
 * Se monta en el Root Layout para estar siempre activo.
 */
export default function SyncManager() {
  const { setOnline, setPendingItemsCount } = useSyncStore();
  
  // 1. Vigilar el conteo de items pendientes de forma reactiva en Dexie
  const pendingCount = useLiveQuery(
    () => db.sync_queue.where('status').equals('PENDING').count(),
    [],
    0
  );

  // 2. Actualizar el store de Zustand cuando cambie el conteo de Dexie
  useEffect(() => {
    setPendingItemsCount(pendingCount);
    
    // Si recuperamos conexión y hay items pendientes, intentar procesar
    if (typeof navigator !== 'undefined' && navigator.onLine && pendingCount > 0) {
      runFullSync(); // <-- AHORA HACE PUSH Y PULL
    }
  }, [pendingCount, setPendingItemsCount]);

  // 3. Event Listeners de Conectividad
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Sync Engine] Online recuperado. Iniciando Sincronización Bidireccional...');
      setOnline(true);
      runFullSync(); // <-- AHORA HACE PUSH Y PULL
    };
    
    const handleOffline = () => {
      console.log('[Sync Engine] Offline activo.');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Arranque en frío: Sincronizar al abrir la app si hay internet
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      runFullSync();
    }

    // 5. Polling de seguridad cada 5 minutos
    const interval = setInterval(() => {
      if (navigator.onLine) {
        console.log('[Sync Engine] Polling automático (5min)...');
        runFullSync(); // <-- AHORA HACE PUSH Y PULL
      }
    }, 1000 * 60 * 5);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [setOnline]);

  return null; // Este componente no renderiza nada visible
}