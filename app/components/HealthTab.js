'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Syringe, 
  Pill, 
  Stethoscope, 
  Apple, 
  Plus, 
  Filter 
} from 'lucide-react';

export default function HealthTab() {
  // Datos mockeados con el campo 'dose' (Dosis/Cantidad)
  const records = [
    { 
      date: '12/10/2023', 
      type: 'Vacuna', 
      product: 'Aftosa (Biogénesis)', 
      dose: '2 ml (Subcutánea)',
      icon: Syringe, 
      color: 'bg-[#EEF7EE] text-[#1B4820]' 
    },
    { 
      date: '05/09/2023', 
      type: 'Desparasitante', 
      product: 'Ivermectina 3.5%', 
      dose: '5 ml',
      icon: Pill, 
      color: 'bg-[#FDF2E9] text-[#8C6746]' 
    },
    { 
      date: '20/08/2023', 
      type: 'Tratamiento Clínico', 
      product: 'Curación de herida (Pecho)', 
      dose: 'Aplicación tópica',
      icon: Stethoscope, 
      color: 'bg-[#FEECEC] text-[#D15555]' 
    },
    { 
      date: '15/07/2023', 
      type: 'Suplementación', 
      product: 'Complejo Vitamínico B12', 
      dose: '10 ml',
      icon: Apple, 
      color: 'bg-[#F7F9EE] text-[#4F663F]' 
    },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* 1. Encabezado de Identificación */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center border border-neutral-100 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-[#F7F7F2] shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-full object-cover" 
            alt="Animal"
          />
        </div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Registro Individual</p>
        <span className="text-3xl font-black text-[#1B4820]">#204</span>
      </div>

      {/* 2. Tarjeta de Peso Actual */}
      <div className="bg-[#1B4820] p-8 rounded-[2.5rem] text-white shadow-xl mb-10">
        <p className="text-[10px] uppercase font-bold opacity-70 tracking-[0.2em] mb-2">Peso Actual</p>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black italic tracking-tighter">542</span>
          <span className="text-2xl font-bold opacity-80 tracking-tighter">kg</span>
        </div>
      </div>

      {/* 3. Sección Historial */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h3 className="text-2xl font-black text-[#1B4820]">Historial de Salud</h3>
        <button className="bg-[#F1F3EE] p-2 rounded-xl text-neutral-600 hover:bg-neutral-200 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* 4. Lista de Tratamientos (No clickeables) */}
      <div className="space-y-4">
        {records.map((item, i) => (
          <div 
            key={i} 
            className="bg-white p-6 rounded-[2.5rem] flex items-start gap-5 border border-neutral-100 shadow-sm"
          >
            {/* Círculo de Icono */}
            <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center shrink-0`}>
              <item.icon className="w-6 h-6" />
            </div>

            {/* Información del Tratamiento */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-bold text-neutral-900 tracking-tight">{item.date}</p>
                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Fecha</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Tipo</p>
                  <p className="text-sm font-bold text-neutral-800 leading-none">{item.type}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Cantidad / Dosis</p>
                  <p className="text-sm font-bold text-[#8C6746] leading-none">{item.dose}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Producto</p>
                <h4 className="text-base font-black text-neutral-900 leading-tight">{item.product}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. BOTÓN FLOTANTE (FAB) */}
      <Link href="/tratamiento">
        <button className="fixed bottom-28 md:bottom-10 right-6 md:right-10 bg-[#1B4820] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </Link>
    </div>
  );
}