'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Scale, Plus, X, Syringe, ClipboardPlus, CheckCircle2, XCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { calculateAge, formatWeight } from '@/lib/dateUtils';
import SyncStatus from '@/components/ui/SyncStatus';
import AnimalImage from '@/components/inventario/AnimalImage';
import { motion, AnimatePresence } from 'motion/react';

const actionOptions = [
  { label: 'Vacunación por Lotes', icon: Syringe, href: '#' },
  { label: 'Nuevo Registro', icon: ClipboardPlus, href: '/inventario/nuevo' },
];

const SearchInput = ({ isMobile = false, searchTerm, setSearchTerm }) => (
  <div className={`relative flex items-center ${isMobile
      ? 'md:hidden bg-white mt-4 w-full border-neutral-300'
      : 'hidden md:flex bg-white md:w-full md:max-w-md border-neutral-300 shadow-sm'
    } rounded-2xl py-2 px-4 border focus-within:border-[#1B4820] transition-all`}>

    <Search className="w-5 h-5 text-neutral-600 mr-2 shrink-0" />
    <input
      type="text"
      placeholder={isMobile ? "Buscar ID o número..." : "Buscar animal por ID o número..."}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 bg-transparent border-none outline-none text-black font-medium placeholder-neutral-500 text-sm w-full"
    />
    <div className="border-l pl-3 ml-2 border-neutral-300 shrink-0">
      <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none">
        <SlidersHorizontal className="w-5 h-5 text-black" />
      </button>
    </div>
  </div>
);

export default function InventarioPage() {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allAnimals = useLiveQuery(
    () => db.animals
      .reverse()
      .sortBy('updated_at')
      .then(res => res.filter(a => !a.deleted_at)),
    []
  );

  const filteredAnimals = useMemo(() => {
    if (!allAnimals) return [];
    if (!searchTerm) return allAnimals;

    const term = searchTerm.toLowerCase();
    return allAnimals.filter(a =>
      a.number.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term)
    );
  }, [allAnimals, searchTerm]);

  return (
    <main className="min-h-screen bg-[#F0F2EB] font-sans pb-28 relative">

      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[35] cursor-pointer"
            onClick={() => setIsFabOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="bg-white md:bg-[#1B4820] px-4 pt-6 pb-4 md:py-4 md:px-8 sticky top-0 z-30 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex md:flex-1 items-center justify-between md:justify-start w-full">
            <span className="text-2xl md:text-3xl font-black text-[#1B4820] md:text-white tracking-tight whitespace-nowrap">
              Inventario Ganadero
            </span>
            <div className="md:hidden">
              <SyncStatus />
            </div>
          </div>
          <div className="hidden md:flex md:flex-1 justify-center">
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="hidden md:flex md:flex-1 justify-end">
            <SyncStatus />
          </div>
          <SearchInput isMobile={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-5 md:mt-8 relative z-0">
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAnimals.map((animal) => (
                <motion.article
                  key={animal.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer group border border-neutral-200"
                >
                  <Link href={`/inventario/${animal.id}`} className="flex flex-col h-full">
                    {/* ZONA DE IMAGEN */}
                    <div className="relative aspect-square w-full bg-[#E5E7EB] overflow-hidden">
                      <AnimalImage
                        photoPath={animal.photo_path}
                        photoBlob={animal.photo_blob}
                        alt={`#${animal.number}`}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-100"
                      />

                      {/* PILL DE STATUS (Sólido y Visible) */}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg ${animal.status === 'Inactivo'
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                        }`}>
                        {animal.status === 'Inactivo' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{animal.status || 'Activo'}</span>
                      </div>
                    </div>

                    {/* ZONA DE TEXTO (Contraste Máximo) */}
                    <div className="px-5 pt-4 pb-6 flex flex-col justify-between flex-1 gap-1">
                      <div>
                        {/* BADGE DE SEXO (Justo arriba del nombre) */}
                        <div className={`inline-block px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white mb-2 ${animal.sex === 'Hembra' ? 'bg-pink-600' : 'bg-blue-700'
                          }`}>
                          {animal.sex}
                        </div>

                        <h2 className="text-2xl font-black text-black leading-tight mb-1">#{animal.number}</h2>
                        <p className="text-xs text-neutral-700 font-bold uppercase tracking-wider">{calculateAge(animal.birth_date)}</p>
                      </div>

                      {/* PESO (Sólido) */}
                      <div className="flex items-center text-black mt-4 bg-neutral-100 border border-neutral-200 w-fit px-3 py-2 rounded-xl">
                        <Scale className="w-4 h-4 mr-2 text-[#1B4820]" strokeWidth={3} />
                        <span className="text-sm font-black tracking-tight">{formatWeight(animal.last_weight_kg)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-black text-neutral-400 uppercase tracking-widest">Sin resultados</p>
          </div>
        )}
      </div>

      {/* FAB (Botón de Acción) */}
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
                    className="flex items-center gap-3 bg-white rounded-full py-3.5 px-6 shadow-2xl border-2 border-[#1B4820]/10 group hover:bg-[#1B4820] transition-all cursor-pointer"
                  >
                    <span className="text-sm font-black uppercase tracking-widest text-black group-hover:text-white transition-colors">{option.label}</span>
                    <div className="bg-[#1B4820] p-2 rounded-full text-white group-hover:bg-white group-hover:text-[#1B4820] transition-colors"><Icon className="w-4 h-4" /></div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`bg-[#1B4820] p-4 rounded-full text-white shadow-2xl transform transition-transform duration-300 cursor-pointer hover:scale-110 active:scale-95 ${isFabOpen ? 'rotate-180 bg-black' : ''}`}
        >
          {isFabOpen ? <X className="w-8 h-8" strokeWidth={3} /> : <Plus className="w-8 h-8" strokeWidth={3} />}
        </button>
      </div>
    </main>
  );
}