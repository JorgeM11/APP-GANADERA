'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AnimalForm from '@/components/inventario/AnimalForm';
import BottomSheet from '@/components/ui/BottomSheet';
import { AnimatePresence } from 'motion/react';

export default function NuevoAnimalPage() {
  const router = useRouter();
  
  // Cada elemento: { id: string, sex: 'Macho'|'Hembra', onSelect: (id) => void }
  const [modalStack, setModalStack] = useState([]);

  // Abrir un nuevo nivel de modal (Recursivo)
  const handleOpenModal = useCallback((sex, onSelect) => {
    setModalStack(prev => [...prev, { 
      id: crypto.randomUUID(), 
      sex, 
      onSelect 
    }]);
  }, []);

  // Cerrar el último modal
  const handleCloseModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  /**
   * Manejador de éxito para modales.
   * Usamos una actualización funcional para evitar problemas de "stale closures" (cierres obsoletos)
   * asegurando que siempre trabajamos con la versión más reciente de la pila de modales.
   */
  const handleModalSuccess = useCallback((newAnimalId) => {
    setModalStack(prev => {
      if (prev.length === 0) return prev;
      
      const currentModal = prev[prev.length - 1];
      
      // Ejecutar el callback de selección si existe
      if (currentModal && typeof currentModal.onSelect === 'function') {
        currentModal.onSelect(newAnimalId);
      }
      
      // Retornar la pila sin el último elemento (cerrar modal)
      return prev.slice(0, -1);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#FCFCFA] font-sans pb-28 relative">
      
      {/* HEADER PRINCIPAL */}
      <header className="px-4 py-5 sticky top-0 z-20 bg-[#FCFCFA]/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/inventario" className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#1B4820]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1B4820]">
            Nuevo Animal
          </h1>
        </div>
      </header>

      {/* FORMULARIO BASE */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <AnimalForm 
          onCancel={() => router.push('/inventario')}
          onSubmitSuccess={() => router.push('/inventario')}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* MODALES RECURSIVOS (BottomSheets) */}
      <AnimatePresence>
        {modalStack.map((modal, index) => (
          <BottomSheet
            key={modal.id}
            isOpen={true}
            onClose={handleCloseModal}
            title={`Registrar ${modal.sex === 'Macho' ? 'Padre' : 'Madre'}`}
            description="Completa los datos mínimos para identificar al progenitor."
            style={{ zIndex: 50 + index * 10 }} // Incrementar Z-Index para modales anidados
          >
            <AnimalForm 
              isModal
              initialValues={{ sex: modal.sex }}
              onCancel={handleCloseModal}
              onSubmitSuccess={handleModalSuccess}
              onOpenModal={handleOpenModal}
            />
          </BottomSheet>
        ))}
      </AnimatePresence>

    </main>
  );
}