'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Scale, Plus, X, Syringe, ClipboardPlus, Ghost } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { calculateAge, formatWeight } from '@/lib/dateUtils';
import SyncStatus from '@/components/ui/SyncStatus';
import { motion, AnimatePresence } from 'motion/react';

// Opciones de acción en el FAB
const actionOptions = [
  { label: 'Vacunación por Lotes', icon: Syringe, href: '#' },
  { label: 'Nuevo Registro', icon: ClipboardPlus, href: '/inventario/nuevo' },
];

/**
 * SearchInput extraído fuera para evitar pérdida de foco al escribir.
 */
const SearchInput = ({ isMobile = false, searchTerm, setSearchTerm }) => (
  <div className={`relative flex items-center ${isMobile ? 'md:hidden bg-[#F1F3EE] mt-4' : 'hidden md:flex bg-white w-[400px] shadow-sm'} rounded-2xl py-2 px-4 shadow-inner w-full border border-transparent focus-within:border-[#1B4820]/30 transition-all`}>
    <Search className="w-5 h-5 text-neutral-500 mr-2 shrink-0" />
    <input
      type="text"
      placeholder={isMobile ? "Buscar ID, nombre o arete..." : "Buscar ID o arete..."}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-500 text-sm w-full"
    />
    <div className="border-l pl-3 ml-2 border-neutral-300 shrink-0">
      <button className="p-1 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none">
        <SlidersHorizontal className="w-5 h-5 text-neutral-800" />
      </button>
    </div>
  </div>
);

export default function InventarioPage() {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Obtener animales de Dexie de forma reactiva
  const animals = useLiveQuery(
    async () => {
      // Obtenemos todos y filtramos los no eliminados (!null, !undefined, !"")
      const collection = db.animals.toCollection();
      const allResults = await collection.reverse().sortBy('updated_at');
      const results = allResults.filter(a => !a.deleted_at);
      
      if (!searchTerm) return results;

      // Filtrado por término de búsqueda
      const term = searchTerm.toLowerCase();
      return results.filter(a => 
        a.number.toLowerCase().includes(term) || 
        a.id.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  return (
    <main className="min-h-screen bg-[#F7F7F2] font-sans pb-28 relative">
      
      {/* Overlay al abrir FAB - Ahora con Z-35 para estar por encima del Header */}
      <AnimatePresence>
        {isFabOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[35] cursor-pointer"
            onClick={() => setIsFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header con Z-30 */}
      <header className="bg-white md:bg-[#1B4820] px-4 pt-6 pb-4 md:py-4 md:px-8 sticky top-0 z-30 shadow-sm md:shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start md:gap-6 w-full md:w-auto">
            <span className="text-2xl md:text-3xl font-extrabold text-[#1B4820] md:text-white tracking-tight">
              Inventario
            </span>
            <SyncStatus />
          </div>
          
          <SearchInput isMobile={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <SearchInput isMobile={false} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-5 md:mt-8 relative z-0">
        
        {/* Estado de carga / Vacío */}
        {!animals && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <div className="animate-pulse space-y-4">
               <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto" />
               <div className="h-4 w-48 bg-neutral-200 rounded-full mx-auto" />
            </div>
          </div>
        )}

        {animals && animals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Ghost className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron animales</p>
            <p className="text-sm opacity-60">Registra tu primera cabeza en el botón verde</p>
          </div>
        )}

        {/* Listado Principal con Stagger de 0.1s */}
        <motion.div 
          variants={{
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-6"
        >
          {animals?.map((animal) => (
            <Link key={animal.id} href={`/inventario/${animal.id}`}>
              <motion.article 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group border border-neutral-100/50"
              >
                {/* Imagen (Fallback if no photo_path) */}
                <div className="relative aspect-square w-full bg-[#F4F5F0] overflow-hidden">
                  {animal.photo_path ? (
                    <img
                      src={animal.photo_path}
                      alt={`Animal ${animal.number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1B4820]/10">
                       <Plus className="w-12 h-12" strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Etiqueta de Sexo (Small pill) */}
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest text-white shadow-sm ${animal.sex === 'Hembra' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                    {animal.sex}
                  </div>
                </div>

                <div className="px-5 pt-5 pb-6 flex flex-col justify-between flex-1 gap-1">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-neutral-950 leading-tight">
                      #{animal.number}
                    </h2>
                  </div>
                  
                  <p className="text-xs md:text-sm text-neutral-500 font-bold uppercase tracking-wide">
                    {calculateAge(animal.birth_date)}
                  </p>
                  
                  <div className="flex items-center text-neutral-800 mt-3 bg-[#F1F3EE] w-fit px-3 py-1.5 rounded-2xl">
                    <Scale className="w-3.5 h-3.5 mr-2 text-[#1B4820]" strokeWidth={3}/>
                    <span className="text-sm font-black text-[#1B4820]">
                      {formatWeight(animal.last_weight_kg)}
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Floating Action Button (FAB) - Z-Index 50 para estar por encima de todo */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
              {actionOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Link 
                    key={index}
                    href={option.href}
                    className="flex items-center gap-3 bg-white rounded-full py-3 px-5 shadow-2xl border border-neutral-100 group hover:bg-[#1B4820] transition-all cursor-pointer ring-4 ring-black/5"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-800 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                    <div className="bg-[#1B4820] p-2 rounded-full text-white shadow group-hover:bg-white group-hover:text-[#1B4820] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`p-5 rounded-full text-white shadow-2xl transform transition-all duration-300 hover:cursor-pointer ${isFabOpen ? 'bg-neutral-800 rotate-0' : 'bg-[#1B4820]'}`}
        >
          {isFabOpen ? (
            <X className="w-8 h-8" strokeWidth={3} />
          ) : (
            <Plus className="w-8 h-8" strokeWidth={3} />
          )}
        </motion.button>
      </div>
    </main>
  );
}