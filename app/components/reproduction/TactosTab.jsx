import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function TactosTab({ animalId }) {
  // Sacamos el ID para usar en el link. Puede fallar si animalId es "#482" y lo usamos directo en URL,
  // idealmente el animalId debería ser un string puro UUID u optimizado, 
  // pero usaremos el mismo animalId asumiendo que lo extrae el page principal.
  
  // Limpiamos animalId por si acaso viene con "#" en esta UI temporal 
  const cleanAnimalId = animalId.toString().replace('#', '');

  return (
    <div className="relative min-h-[50vh]">
      <div className="bg-white p-5 rounded-2xl border border-neutral-200">
        <span className="text-xs uppercase tracking-widest text-[#1B4820] font-bold">15 de Abril, 2023</span>
        <h3 className="font-bold text-gray-800 text-lg mt-1">Diagnóstico: Preñada</h3>
        <p className="text-sm text-gray-500 mt-2">Gestación de aproximadamente 45 días confirmada vía ecografía para {animalId}.</p>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link 
        href={`/inventario/${cleanAnimalId}/tacto`} 
        className="fixed bottom-28 md:bottom-10 right-6 md:right-10 bg-[#1B4820] text-white p-4 rounded-full shadow-2xl z-50 transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </Link>
    </div>
  );
}
