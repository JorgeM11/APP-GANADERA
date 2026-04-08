import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ServiciosTab({ animalId }) {
  const cleanAnimalId = animalId.toString().replace('#', '');

  return (
    <div className="relative min-h-[50vh]">
      <div className="bg-white p-5 rounded-2xl border border-neutral-200">
        <span className="text-xs uppercase tracking-widest text-[#1B4820] font-bold">01 de Marzo, 2023</span>
        <h3 className="font-bold text-gray-800 text-lg mt-1">Inseminación Artificial</h3>
        <p className="text-sm text-gray-500 mt-2">Catálogo pajuela: Toro Rojo #ABC</p>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link 
        href={`/inventario/${cleanAnimalId}/servicio`} 
        className="fixed bottom-28 md:bottom-10 right-6 md:right-10 bg-[#1A3621] text-white p-4 rounded-full shadow-lg z-50 transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </Link>
    </div>
  );
}
