import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  syncStatus: 'IDLE' | 'SYNCING' | 'ERROR' | 'UP_TO_DATE';
  pendingItemsCount: number;
  
  // Acciones
  setOnline: (isOnline: boolean) => void;
  setSyncStatus: (status: 'IDLE' | 'SYNCING' | 'ERROR' | 'UP_TO_DATE') => void;
  setPendingItemsCount: (count: number) => void;
  
  // Helper para inicialización
  initSyncStore: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'IDLE',
  pendingItemsCount: 0,

  setOnline: (isOnline) => set({ isOnline }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setPendingItemsCount: (pendingItemsCount) => set({ pendingItemsCount }),
  
  initSyncStore: () => {
    if (typeof window !== 'undefined') {
      set({ isOnline: navigator.onLine });
    }
  },
}));
