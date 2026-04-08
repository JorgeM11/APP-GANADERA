'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, List, TrendingUp, ShieldPlus, Share2 } from 'lucide-react';

// Importación de Módulos
import DetailsTab from '../../components/DetailsTab';
import EvolutionTab from '../../components/EvolutionTab';
import HealthTab from '../../components/HealthTab';
import GenealogyTab from '../../components/GenealogyTab';

export default function AnimalProfilePage() {
  const [activeTab, setActiveTab] = useState('details');

  const navItems = [
    { id: 'details', label: 'Detalles', icon: List },
    { id: 'evolution', label: 'Evolución', icon: TrendingUp },
    { id: 'health', label: 'Salud', icon: ShieldPlus },
    { id: 'genealogy', label: 'Genealogía', icon: Share2 },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F2] font-sans pb-24 md:pb-8 relative">
      
      {/* HEADER FIJO */}
      <header className="bg-[#F7F7F2] px-4 py-4 sticky top-0 z-30 flex items-center gap-4 border-b border-neutral-100 md:border-none">
        <Link href="/inventario" className="p-2 -ml-2 hover:bg-neutral-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#1B4820]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1B4820]">
          {activeTab === 'details' ? 'Ficha del Animal' : 
           activeTab === 'evolution' ? 'Evolución del Animal' : 
           activeTab === 'health' ? 'Carnet de Salud' : 'Genealogía'}
        </h1>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* NAVEGACIÓN DESKTOP (Pestañas fijas arriba) */}
        <nav className="hidden md:flex items-center gap-8 border-b border-neutral-200 mb-6 px-8 sticky top-[72px] bg-[#F7F7F2] z-20 pt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors border-b-2 font-bold uppercase tracking-widest text-xs ${
                activeTab === item.id ? 'text-[#1B4820] border-[#1B4820]' : 'text-neutral-400 border-transparent hover:text-[#1B4820]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* CONTENIDO DINÁMICO (Cambia totalmente según la pestaña) */}
        <div className="px-4">
          {activeTab === 'details' && <DetailsTab />}
          {activeTab === 'evolution' && <EvolutionTab />}
          {activeTab === 'health' && <HealthTab />}
          {activeTab === 'genealogy' && <GenealogyTab />}
        </div>
      </div>

      {/* BOTTOM NAV (Móvil) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-neutral-200 px-4 py-3 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-[#1B4820]' : 'text-neutral-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}