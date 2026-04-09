import { db } from './db';
import { supabase } from './supabaseClient';
import { useSyncStore } from '@/store/syncStore';

/**
 * Función principal para procesar la cola de sincronización (Push)
 * De local (Dexie) a la nube (Supabase)
 */
export async function processSyncQueue() {
  const store = useSyncStore.getState();
  
  // Evitar múltiples ejecuciones simultáneas
  if (store.syncStatus === 'SYNCING' || !navigator.onLine) return;

  // 1. Obtener items pendientes
  const pendingItems = await db.sync_queue
    .where('status')
    .equals('PENDING')
    .sortBy('created_at');

  if (pendingItems.length === 0) {
    store.setSyncStatus('UP_TO_DATE');
    store.setPendingItemsCount(0);
    return;
  }

  store.setSyncStatus('SYNCING');
  store.setPendingItemsCount(pendingItems.length);

  for (const item of pendingItems) {
    try {
      // Intentar sincronizar con Supabase
      let error;
      
      if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
        const { error: upsertError } = await supabase
          .from(item.table_name)
          .upsert(item.payload);
        error = upsertError;
      } else if (item.operation === 'DELETE') {
        const { error: deleteError } = await supabase
          .from(item.table_name)
          .delete()
          .eq('id', item.payload.id);
        error = deleteError;
      }

      if (error) throw error;

      // Éxito: Eliminar de la cola local
      await db.sync_queue.delete(item.id!);
      
      // Actualizar contador en el store
      const currentCount = await db.sync_queue.where('status').equals('PENDING').count();
      store.setPendingItemsCount(currentCount);

    } catch (err: any) {
      console.error(`[Sync Engine] Error en item ${item.id}:`, err);
      
      // Marcar error en el item para evitar bucles infinitos inmediatos
      await db.sync_queue.update(item.id!, { 
        status: 'ERROR', 
        error_message: err.message || 'Error desconocido' 
      });
      
      store.setSyncStatus('ERROR');
      return; // Detener el procesamiento de la cola
    }
  }

  store.setSyncStatus('UP_TO_DATE');
}

/**
 * Helper para agregar un item a la cola de sincronización
 * Debe llamarse SIEMPRE dentro de la misma transacción en la que se modifica la tabla principal
 */
export async function addToSyncQueue(
  table_name: any,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: any
) {
  await db.sync_queue.add({
    table_name,
    operation,
    payload,
    created_at: new Date().toISOString(),
    status: 'PENDING'
  });
}
