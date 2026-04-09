'use client';

import { useEffect } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { processSyncQueue } from '@/lib/syncUtils';
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
    if (navigator.onLine && pendingCount > 0) {
      processSyncQueue();
    }
  }, [pendingCount, setPendingItemsCount]);

  // 3. Event Listeners de Conectividad
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Sync Engine] Online');
      setOnline(true);
      processSyncQueue();
    };
    
    const handleOffline = () => {
      console.log('[Sync Engine] Offline');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling de seguridad cada 5 minutos
    const interval = setInterval(() => {
      if (navigator.onLine) {
        processSyncQueue();
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
