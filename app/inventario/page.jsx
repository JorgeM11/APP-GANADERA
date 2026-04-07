'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Scale, Plus, X, Syringe, ClipboardPlus, CalendarPlus } from 'lucide-react';

const mockAnimals = [
  {
    id: 'uuid-1',
    number: '1042',
    age: "1 año",
    weight: '450 kg',
    imageUrl: 'https://images.unsplash.com/photo-1546452273-90b366c841f2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'uuid-2',
    number: '2088',
    age: "1 año",
    weight: '520 kg',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'uuid-3',
    number: '4120',
    age: "1 año",
    weight: '185 kg',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f743727520d6?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'uuid-4',
    number: '8821',
    age: "1 año",
    weight: '610 kg',
    imageUrl: 'https://images.unsplash.com/photo-1542159154-1591460bc216?auto=format&fit=crop&q=80&w=800',
  },
];

const actionOptions = [
  { label: 'Vacunación por Lotes', icon: Syringe },
  { label: 'Nuevo Registro', icon: ClipboardPlus },
];

export default function InventarioPage() {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const MobileSearchBar = () => (
    <div className="md:hidden relative flex items-center bg-[#F1F3EE] rounded-2xl py-2.5 px-4 shadow-inner mt-4 w-full">
      <Search className="w-5 h-5 text-neutral-500 mr-2 shrink-0" />
      <input
        type="text"
        placeholder="Buscar por ID, nombre o arete..."
        className="flex-1 bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-500 text-sm w-full"
      />
      <div className="border-l pl-3 ml-2 border-neutral-300 shrink-0">
        <button className="p-1 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none">
          <SlidersHorizontal className="w-5 h-5 text-neutral-800" />
        </button>
      </div>
    </div>
  );

  const DesktopSearchBar = () => (
    <div className="hidden md:flex relative items-center bg-white rounded-full shadow-sm py-2 px-4 w-[400px]">
      <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
      <input
        type="text"
        placeholder="Buscar por ID o arete..."
        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-base w-full"
      />
      <div className="border-l pl-3 ml-2 border-gray-200 shrink-0">
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
          <SlidersHorizontal className="w-5 h-5 text-[#8C6746]" />
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F7F2] font-sans pb-28 relative">
      
      {isFabOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-20 transition-opacity duration-300 cursor-pointer"
          onClick={() => setIsFabOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="bg-white md:bg-[#1B4820] px-4 pt-6 pb-4 md:py-4 md:px-8 sticky top-0 z-10 shadow-sm md:shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <span className="text-2xl md:text-3xl font-extrabold text-[#1B4820] md:text-white tracking-tight">
            Inventario Bovino
          </span>
          <MobileSearchBar />
          <DesktopSearchBar />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-5 md:mt-8 relative z-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-6">
          {mockAnimals.map((animal) => (
            <Link key={animal.id} href={`/inventario/${animal.id}`}>
              <article 
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full cursor-pointer"
              >
                <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={animal.imageUrl}
                    alt={`Animal ${animal.number}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="px-4 pt-4 pb-5 flex flex-col justify-between flex-1 gap-1">
                  <h2 className="text-lg md:text-xl font-extrabold text-neutral-950 leading-tight">
                    #{animal.number}
                  </h2>
                  
                  <p className="text-sm md:text-base text-neutral-600 font-medium mb-1">
                    {animal.age}
                  </p>
                  
                  <div className="flex items-center text-neutral-800 mt-auto">
                    <Scale className="w-4 h-4 md:w-4.5 md:h-4.5 mr-1.5 text-neutral-700" strokeWidth={2.5}/>
                    <span className="text-sm md:text-base font-semibold">
                      {animal.weight}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex flex-col items-end gap-3">
        {isFabOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 transition-all duration-300 animate-fade-in-up">
            {actionOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button 
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-full py-2.5 px-4 shadow-lg border border-neutral-100 group hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-neutral-800 group-hover:text-emerald-950">
                    {option.label}
                  </span>
                  <div className="bg-[#1B4820] p-2.5 rounded-full text-white shadow">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`bg-[#1B4820] p-4 rounded-full text-white shadow-xl transform transition-transform duration-300 hover:cursor-pointer hover:scale-105 hover:bg-emerald-950 focus:outline-none ${isFabOpen ? 'rotate-180' : ''}`}
        >
          {isFabOpen ? (
            <X className="w-7 h-7" strokeWidth={3} />
          ) : (
            <Plus className="w-7 h-7" strokeWidth={3} />
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}