import React from 'react';
import Link from 'next/link';
import { Plus, Syringe } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export default function ServiciosTab({ animalId }) {
  const services = useLiveQuery(
    () => db.services
      .where('mother_id').equals(animalId)
      .reverse()
      .sortBy('service_date')
      .then(res => res.filter(s => !s.deleted_at)),
    [animalId]
  );

  const cleanAnimalId = animalId.toString().replace('#', '');

  return (
    <div className="relative min-h-[50vh] space-y-4">
      {services && services.length > 0 ? (
        services.map((service) => (
          <div key={service.id} className="bg-white p-5 rounded-2xl border border-neutral-200">
            <span className="text-xs uppercase tracking-widest text-[#1B4820] font-bold">
              {new Date(service.service_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h3 className="font-bold text-gray-800 text-lg mt-1">
              {service.type_conception === 'IA' ? 'Inseminación Artificial' : 'Monta Directa'}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Padre/Pajuela: <span className="font-bold text-[#1B4820]">{service.father_id ? `#${service.father_id.split('-')[0]}` : 'N/A'}</span>
            </p>
          </div>
        ))
      ) : (
        <div className="bg-white/50 p-10 rounded-2xl border border-dashed border-neutral-300 text-center">
          <Syringe className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">Sin servicios registrados</p>
        </div>
      )}

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
