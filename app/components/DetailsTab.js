import React from 'react';
import { IdCard, Network, FileText, Pencil } from 'lucide-react';

export default function DetailsTab() {
  return (
    <div className="max-w-6xl mx-auto md:grid md:grid-cols-12 md:gap-8 md:items-start">
      
      {/* COLUMNA 1: Perfil Rápido */}
      <div className="md:col-span-5 md:sticky md:top-32 space-y-5">
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm">
          <img src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
        </div>
        
        <span className="text-3xl font-black text-[#1B4820] tracking-tight block">#482</span>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block tracking-widest">Peso</span>
            <span className="text-2xl font-black text-[#1B4820]">842 kg</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block tracking-widest">Edad</span>
            <span className="text-2xl font-black text-[#1B4820]">3.5 Años</span>
          </div>
        </div>

        {/* CORRECCIÓN: Botón Editar en Desktop debajo de los pesos */}
        <button className="hidden md:flex w-full items-center justify-center gap-2 bg-[#FBE3C5] text-[#8C6746] font-bold py-4 rounded-2xl shadow-sm transition-transform hover:scale-[0.99]">
          <Pencil className="w-5 h-5" /> EDITAR
        </button>
      </div>

      {/* COLUMNA 2: Información Detallada */}
      <div className="md:col-span-7 space-y-4 mt-6 md:mt-0">
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-2 mb-5">
            <IdCard className="w-5 h-5 text-[#4F663F]" />
            <h3 className="text-lg font-bold text-[#1B4820]">Identificación Detallada</h3>
          </div>
          <div className="space-y-4 text-sm">
            <DataRow label="Número" value="#482" />
            <DataRow label="Fecha de Nacimiento" value="12 de Octubre, 2020" />
            <DataRow label="Sexo" value="Macho" />
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
          <div className="flex items-center gap-2 mb-5">
            <Network className="w-5 h-5 text-[#4F663F]" />
            <h3 className="text-lg font-bold text-[#1B4820]">Genealogía</h3>
          </div>
          <div className="pl-4 border-l-2 border-neutral-100 space-y-4 text-sm">
            <DataRow label="Padre (Semental)" value="#99" />
            <DataRow label="Madre (Vientre)" value="#102" />
          </div>
        </section>

        <section className="bg-[#EEF2EA] p-5 rounded-3xl border border-transparent">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[#4F663F]" />
            <h3 className="text-lg font-bold text-[#1B4820]">Observaciones del Ganadero</h3>
          </div>
          <p className="text-sm text-[#4F663F] leading-relaxed font-medium">Ejemplar con excelente temperamento. Ha mostrado una ganancia de peso superior al promedio del lote durante la última temporada de lluvias.Ejemplar con excelente temperamento. Ha mostrado una ganancia de peso superior al promedio del lote durante la última temporada de lluvias.</p>
        </section>

        {/* Botón Editar para MÓVIL (al final del scroll) */}
        <button className="md:hidden w-full flex items-center justify-center gap-2 bg-[#FBE3C5] text-[#8C6746] font-bold py-4 rounded-2xl shadow-sm mt-6 mb-4">
          <Pencil className="w-5 h-5" /> EDITAR
        </button>
      </div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">{label}</p>
      <p className="font-bold text-neutral-800">{value}</p>
    </div>
  );
}