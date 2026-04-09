'use client';

import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';
import { processSyncQueue } from '@/lib/syncUtils';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Componente SyncStatus: Muestra el estado de sincronización (Patrón Outbox)
 * Permite forzar la sincronización al hacer clic.
 */
export default function SyncStatus() {
  const { isOnline, syncStatus, pendingItemsCount } = useSyncStore();
  
  const handleSyncClick = async () => {
    if (isOnline) {
      console.log('[Sync] Forzando sincronización manual...');
      await processSyncQueue();
    }
  };

  // Determinar el estado visual
  let StatusIcon = Cloud;
  let statusText = '';
  let statusColor = 'text-gray-400';
  let bgColor = 'bg-gray-100';
  let isRotating = false;

  if (!isOnline) {
    StatusIcon = CloudOff;
    statusText = 'Offline 🔴';
    statusColor = 'text-red-500';
    bgColor = 'bg-red-50';
  } else if (syncStatus === 'SYNCING') {
    StatusIcon = RefreshCw;
    statusText = 'Sincronizando 🔄';
    statusColor = 'text-blue-500';
    bgColor = 'bg-blue-50';
    isRotating = true;
  } else if (pendingItemsCount > 0) {
    StatusIcon = AlertCircle;
    statusText = `Pendiente (${pendingItemsCount}) 🟡`;
    statusColor = 'text-amber-500';
    bgColor = 'bg-amber-50';
  } else if (syncStatus === 'ERROR') {
    StatusIcon = AlertCircle;
    statusText = 'Error de Sinc. ❌';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
  } else {
    StatusIcon = CheckCircle2;
    statusText = 'Respaldado 🟢';
    statusColor = 'text-emerald-600';
    bgColor = 'bg-emerald-50';
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSyncClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent transition-all shadow-sm cursor-pointer ${bgColor}`}
    >
      <div className={isRotating ? 'animate-spin' : ''}>
        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
        {statusText}
      </span>
      
      {/* Indicador de items pendientes si no estamos sincronizando */}
      {pendingItemsCount > 0 && syncStatus !== 'SYNCING' && isOnline && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
    </motion.button>
  );
}
