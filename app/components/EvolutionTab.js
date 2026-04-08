'use client';

import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  Scale, 
  Ruler, 
  Info
} from 'lucide-react';
import Link from 'next/link';

import { useParams } from 'next/navigation';

export default function EvolutionTab() {
  const params = useParams();
  const animalId = params?.id || '204'; // Fallback if missing
  const events = [
    { 
      id: '1',
      event_type: 'Pesaje 12 meses', 
      event_date: '15 de Octubre, 2023', 
      weight_kg: 450.00,
      mother_weight_kg: 580.00,
      scrotal_circumference_cm: 32.5,
      observations: 'Incremento óptimo de masa muscular. Dieta balanceada en potrero alto.',
      img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
    },
    { 
      id: '2',
      event_type: 'Destete', 
      event_date: '22 de Mayo, 2023', 
      weight_kg: 210.50,
      mother_weight_kg: 540.00,
      navel_length: 'Normal',
      observations: 'Transición exitosa a forraje seco sin estrés térmico.',
      img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600',
    },
    { 
      id: '3',
      event_type: 'Nacimiento', 
      event_date: '10 de Enero, 2023', 
      weight_kg: 34.00,
      mother_weight_kg: 520.00,
      navel_length: 'Corto',
      observations: 'Nacido en Lote Norte. Cría muy vigorosa.',
      img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-2 pb-24 relative">
      
      {/* TÍTULO DE SECCIÓN COMPACTO */}
      <div className="mb-6 px-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-[#1B4820] leading-tight">Evolución</h2>
          <div className="bg-[#EEF7EE] px-3 py-1.5 rounded-xl text-[#1B4820] font-black text-lg border border-[#1B4820]/10">
            #204
          </div>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-neutral-200 space-y-6 ml-4">
        {events.map((event, i) => (
          <div key={event.id} className="relative">
            <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-[3px] border-[#F7F7F2] shadow-sm z-10 ${
              i === 0 ? 'bg-[#1B4820]' : 'bg-neutral-300'
            }`} />

            <article className="flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm border border-neutral-100 group">
              
              {/* IMAGEN: Altura dinámica para Laptop (md:h-80) */}
              <div className="relative h-48 md:h-80 w-full overflow-hidden">
                <img 
                  src={event.img} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt={event.event_type} 
                />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase">
                  {event.event_date}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-neutral-900">{event.event_type}</h4>
                    
                    {/* DATOS SECUNDARIOS: En línea */}
                    {(event.scrotal_circumference_cm || event.navel_length) && (
                      <div className="flex gap-3 mt-1">
                        {event.scrotal_circumference_cm && (
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Ruler className="w-3 h-3" />
                            <span className="text-[10px] font-bold">C.E: {event.scrotal_circumference_cm}cm</span>
                          </div>
                        )}
                        {event.navel_length && (
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Info className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Ombligo: {event.navel_length}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {event.stats && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> {event.stats}
                    </div>
                  )}
                </div>

                {/* GRID DE PESOS */}
                <div className="grid grid-cols-2 gap-2">
                  <DataBox icon={Scale} label="Peso Cría" value={`${event.weight_kg} kg`} />
                  <DataBox icon={Scale} label="Peso Madre" value={`${event.mother_weight_kg} kg`} />
                </div>

                {/* OBSERVACIONES COMPACTAS */}
                <div className="bg-[#F8F9F5] p-3 rounded-xl">
                  <p className="text-[11px] text-neutral-600 font-medium leading-snug">
                    <span className="text-[8px] font-black text-neutral-400 uppercase mr-1">Nota:</span>
                    {event.observations}
                  </p>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      <Link href={`/inventario/${animalId}/evento`} className="fixed bottom-28 md:bottom-10 right-6 md:right-10 bg-[#1B4820] text-white p-4 rounded-full shadow-2xl z-50 transition-all active:scale-95 cursor-pointer">
        <Plus className="w-7 h-7" strokeWidth={3} />
      </Link>

    </div>
  );
}

function DataBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center gap-2">
      <div className="bg-white p-1.5 rounded-lg shadow-sm">
        <Icon className="w-3.5 h-3.5 text-[#8C6746]" />
      </div>
      <div>
        <p className="text-[8px] font-black text-neutral-400 uppercase leading-none mb-0.5">{label}</p>
        <p className="text-sm font-black text-neutral-800 leading-none">{value}</p>
      </div>
    </div>
  );
}