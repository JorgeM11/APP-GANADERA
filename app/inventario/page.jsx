'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Scale, Plus, X, Syringe, ClipboardPlus, Ghost } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { calculateAge, formatWeight } from '@/lib/dateUtils';
import SyncStatus from '@/components/ui/SyncStatus';
import { motion, AnimatePresence } from 'motion/react';

const actionOptions = [
  { label: 'Vacunación por Lotes', icon: Syringe, href: '#' },
  { label: 'Nuevo Registro', icon: ClipboardPlus, href: '/inventario/nuevo' },
];

const SearchInput = ({ isMobile = false, searchTerm, setSearchTerm }) => (
  <div className={`relative flex items-center ${
    isMobile 
      ? 'md:hidden bg-[#F1F3EE] mt-4 w-full' 
      : 'hidden md:flex bg-white md:w-full md:max-w-md shadow-sm'
    } rounded-2xl py-2 px-4 border border-transparent focus-within:border-[#1B4820]/30 transition-all shadow-inner`}>
    
    <Search className="w-5 h-5 text-neutral-500 mr-2 shrink-0" />
    <input
      type="text"
      placeholder={isMobile ? "Buscar ID, nombre o arete..." : "Buscar animal por ID o número..."}
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

  const animals = useLiveQuery(
    async () => {
      const collection = db.animals.toCollection();
      const allResults = await collection.reverse().sortBy('updated_at');
      const results = allResults.filter(a => !a.deleted_at);
      if (!searchTerm) return results;
      const term = searchTerm.toLowerCase();
      return results.filter(a => 
        a.number.toLowerCase().includes(term) || a.id.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  return (
    <main className="min-h-screen bg-[#F7F7F2] font-sans pb-28 relative">
      
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

      <header className="bg-white md:bg-[#1B4820] px-4 pt-6 pb-4 md:py-4 md:px-8 sticky top-0 z-30 shadow-sm md:shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex md:flex-1 items-center justify-between md:justify-start w-full">
            <span className="text-2xl md:text-3xl font-extrabold text-[#1B4820] md:text-white tracking-tight whitespace-nowrap">
              Inventario Ganadero
            </span>
            <div className="md:hidden">
              <SyncStatus />
            </div>
          </div>
          <div className="hidden md:flex md:flex-1 justify-center">
            <SearchInput isMobile={false} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="hidden md:flex md:flex-1 justify-end">
            <SyncStatus />
          </div>
          <SearchInput isMobile={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-5 md:mt-8 relative z-0">
        {/* ... Lógica de lista de animales igual a la anterior ... */}
        {animals?.length > 0 && (
          <motion.div 
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-6"
          >
            {animals.map((animal) => (
              <Link key={animal.id} href={`/inventario/${animal.id}`}>
                <motion.article 
                  variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group border border-neutral-100/50"
                >
                  <div className="relative aspect-square w-full bg-[#F4F5F0] overflow-hidden">
                    {animal.photo_path ? (
                      <img src={animal.photo_path} alt={`#${animal.number}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1B4820]/10"><Plus className="w-12 h-12" strokeWidth={1} /></div>
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest text-white shadow-sm ${animal.sex === 'Hembra' ? 'bg-pink-500' : 'bg-blue-500'}`}>{animal.sex}</div>
                  </div>
                  <div className="px-5 pt-5 pb-6 flex flex-col justify-between flex-1 gap-1">
                    <h2 className="text-xl md:text-2xl font-black text-neutral-950 leading-tight">#{animal.number}</h2>
                    <p className="text-xs md:text-sm text-neutral-500 font-bold uppercase tracking-wide">{calculateAge(animal.birth_date)}</p>
                    <div className="flex items-center text-neutral-800 mt-3 bg-[#F1F3EE] w-fit px-3 py-1.5 rounded-2xl">
                      <Scale className="w-3.5 h-3.5 mr-2 text-[#1B4820]" strokeWidth={3}/>
                      <span className="text-sm font-black text-[#1B4820]">{formatWeight(animal.last_weight_kg)}</span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* FAB - Z-Index 50 con tu animación original */}
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
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-800 group-hover:text-white transition-colors">{option.label}</span>
                    <div className="bg-[#1B4820] p-2 rounded-full text-white shadow group-hover:bg-white group-hover:text-[#1B4820] transition-colors"><Icon className="w-4 h-4" /></div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TU BOTÓN ORIGINAL RECUPERADO */}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`bg-[#1B4820] p-4 rounded-full text-white shadow-xl transform transition-transform duration-300 hover:cursor-pointer hover:scale-105 hover:bg-emerald-950 focus:outline-none ${isFabOpen ? 'rotate-180 bg-neutral-800' : ''}`}
        >
          {isFabOpen ? (
            <X className="w-7 h-7" strokeWidth={3} />
          ) : (
            <Plus className="w-7 h-7" strokeWidth={3} />
          )}
        </button>
      </div>
    </main>
  );
}