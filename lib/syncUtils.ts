import { db } from './db';
import { supabase } from './supabaseClient';
import { useSyncStore } from '@/store/syncStore';
import { uploadImageToSupabase } from './imageUtils'; // <-- IMPORTAMOS EL MOTOR DE IMÁGENES

// Candado de seguridad a nivel de módulo
let isSyncing = false; 

/**
 * 1. PUSH: De local a la Nube.
 */
export async function processSyncQueue() {
  const pendingItems = await db.sync_queue
    .where('status')
    .equals('PENDING')
    .sortBy('created_at');

  if (pendingItems.length === 0) return;

  const store = useSyncStore.getState();
  store.setPendingItemsCount(pendingItems.length);

  for (const item of pendingItems) {
    try {
      const payloadToUpload = { ...item.payload };

      // --- MAGIA OFFLINE PARA IMÁGENES ---
      // Si el item se guardó sin internet, tiene un 'photo_blob' pero no tiene 'photo_path' (URL).
      // Debemos subir esa imagen a Supabase AHORA que sí hay internet.
      if (payloadToUpload.photo_blob && !payloadToUpload.photo_path) {
        try {
          const fileName = `offline-sync-${item.table_name}-${payloadToUpload.id}`;
          const url = await uploadImageToSupabase(payloadToUpload.photo_blob, fileName);
          
          payloadToUpload.photo_path = url; // Le asignamos la URL real
          
          // Actualizamos Dexie para que sepa que este registro ya tiene URL
          await db.table(item.table_name).update(payloadToUpload.id, { photo_path: url });
        } catch (imgErr) {
          console.error('[Sync Engine] Error subiendo imagen rezagada', imgErr);
          throw new Error('No se pudo subir la imagen pendiente a la nube.');
        }
      }

      // Borramos el Blob crudo para que PostgreSQL no explote
      delete payloadToUpload.photo_blob; 

      // --- SUBIDA A BASE DE DATOS RELACIONAL ---
      let error;
      if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
        const { error: upsertError } = await supabase
          .from(item.table_name)
          .upsert(payloadToUpload);
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
      
      const currentCount = await db.sync_queue.where('status').equals('PENDING').count();
      store.setPendingItemsCount(currentCount);

    } catch (err: any) {
      console.error(`[Sync Engine] Error subiendo item ${item.id}:`, err);
      
      await db.sync_queue.update(item.id!, { 
        status: 'ERROR', 
        error_message: err.message || 'Error desconocido' 
      });
      
      throw err; // Lanzar error para que runFullSync lo atrape
    }
  }
}

/**
 * 2. PULL: De Nube a Local
 */
export async function pullFromServer() {
  // USAMOS getSession PARA NO DEPENDER DEL SERVIDOR SI LA RED ESTÁ INESTABLE
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;

  const lastSync = localStorage.getItem('lastSyncTimestamp') || '1970-01-01T00:00:00Z';
  const currentSyncTime = new Date().toISOString();

  const tables: Array<'animals' | 'growth_events' | 'services' | 'pregnancy_checks' | 'health_records'> = [
    'animals', 'growth_events', 'services', 'pregnancy_checks', 'health_records'
  ];

  for (const table of tables) {
    const { data: serverData, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .gt('updated_at', lastSync);

    if (error) throw error;

    if (serverData && serverData.length > 0) {
      for (const record of serverData) {
        // Si hay una foto en la nube, la descargamos al celular
        if ((table === 'animals' || table === 'growth_events') && record.photo_path) {
          try {
            const response = await fetch(record.photo_path);
            if (response.ok) {
              record.photo_blob = await response.blob();
            }
          } catch (imgErr) {
            console.warn(`[Sync Engine] No se descargó la imagen para uso offline: ${record.id}`);
          }
        }
        await db.table(table).put(record);
      }
    }
  }
  localStorage.setItem('lastSyncTimestamp', currentSyncTime);
}

/**
 * 3. MASTER SYNC: El Orquestador. 
 */
export async function runFullSync() {
  const store = useSyncStore.getState();

  if (!navigator.onLine) {
    if (store.syncStatus !== 'IDLE') store.setSyncStatus('IDLE');
    return;
  }

  if (isSyncing || store.syncStatus === 'SYNCING') return;

  isSyncing = true;
  store.setSyncStatus('SYNCING');

  try {
    await processSyncQueue(); 
    await pullFromServer();

    const errorCount = await db.sync_queue.where('status').equals('ERROR').count();
    
    if (errorCount > 0) {
      store.setSyncStatus('ERROR');
    } else {
      store.setSyncStatus('UP_TO_DATE');
      setTimeout(() => {
        if (useSyncStore.getState().syncStatus === 'UP_TO_DATE') {
          useSyncStore.getState().setSyncStatus('IDLE');
        }
      }, 3000);
    }
  } catch (err) {
    console.error('[Sync Engine] Fallo en Sincronización Maestra', err);
    store.setSyncStatus('ERROR');
  } finally {
    isSyncing = false; 
  }
}

/**
 * Helper para agregar a la cola
 */
export async function addToSyncQueue(
  table_name: 'animals' | 'growth_events' | 'services' | 'pregnancy_checks' | 'health_records',
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

  if (navigator.onLine) {
    setTimeout(() => {
      runFullSync();
    }, 500); // Aumenté el retraso a 500ms por seguridad de Dexie
  }
}