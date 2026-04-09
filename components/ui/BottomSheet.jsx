'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

/**
 * BottomSheet: Modal deslizable desde la parte inferior con gestos de arrastre.
 * 
 * @param {boolean} isOpen - Controla la visibilidad.
 * @param {function} onClose - Callback al cerrar.
 * @param {string} title - Título del modal.
 * @param {string} description - Subtítulo opcional.
 * @param {React.ReactNode} children - Contenido.
 */
export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}) {

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px]"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Si el usuario arrastró hacia abajo con suficiente fuerza o distancia, cerrar.
              if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[92dvh] bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Handle / Grip */}
            <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              {description && (
                <p className="text-sm text-neutral-500">{description}</p>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-12">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
