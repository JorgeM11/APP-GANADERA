import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatWeight } from '@/lib/dateUtils';
import AnimalImage from '@/components/inventario/AnimalImage';
import { Share2 } from 'lucide-react';

export default function GenealogyTab({ animal }) {
  const animalId = animal?.id;

  // 1. Obtener Padres
  const father = useLiveQuery(() => animal?.father_id ? db.animals.get(animal.father_id) : null, [animal?.father_id]);
  const mother = useLiveQuery(() => animal?.mother_id ? db.animals.get(animal.mother_id) : null, [animal?.mother_id]);

  // 2. Obtener Descendientes
  const offspring = useLiveQuery(
    () => db.animals
      .where('mother_id').equals(animalId)
      .or('father_id').equals(animalId)
      .toArray()
      .then(res => res.filter(a => !a.deleted_at)),
    [animalId]
  );

  const FamilyCard = ({ label, id, relation, isMain, photo_path, photo_blob }) => (
    <div className={`bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3 transition-all ${isMain ? 'ring-2 ring-[#1B4820] scale-105 z-10' : 'hover:bg-neutral-50'}`}>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-neutral-100">
        <AnimalImage 
          photoPath={photo_path}
          photoBlob={photo_blob}
          alt={`#${id}`}
          className="w-full h-full"
        />
      </div>
      <div>
        <p className="text-[12px] font-black text-neutral-800 leading-tight">#{id || '---'}</p>
        <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{relation}</p>
      </div>
    </div>
  );

  if (!animal) return null;

  return (
    <div className="space-y-10 py-4 max-w-lg mx-auto pb-20">
      
      {/* LÍNEA DE ASCENDENCIA */}
      <div className="space-y-6 text-center">
        <h5 className="text-[10px] pb-2 font-black uppercase tracking-[0.3em] text-neutral-400">Padres (Progenitores)</h5>
        
        <div className="flex justify-center items-center gap-4 relative">
          <FamilyCard 
             id={father?.number} 
             relation="Padre" 
             photo_path={father?.photo_path} 
             photo_blob={father?.photo_blob} 
          />
          <FamilyCard 
             id={mother?.number} 
             relation="Madre" 
             photo_path={mother?.photo_path} 
             photo_blob={mother?.photo_blob} 
          />
        </div>
      </div>

      {/* SUJETO ACTUAL */}
      <div className="relative py-14 flex justify-center">
        {/* Línea conectora vertical de fondo */}
        <div className="absolute h-full w-px bg-neutral-200 top-0 left-1/2 -translate-x-1/2" />
        
        <div className="bg-[#1B4820] text-white p-8 rounded-[3rem] shadow-2xl z-10 text-center min-w-[220px] border-4 border-white relative">
          {/* Imagen Circular del Sujeto */}
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-md bg-neutral-100">
              <AnimalImage 
                photoPath={animal.photo_path}
                photoBlob={animal.photo_blob}
                alt={animal.number}
                className="w-full h-full"
              />
            </div>
          </div>

          <p className="text-2xl font-black italic leading-none mb-4">#{animal.number}</p>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mb-1">Peso Registrado</p>
            <p className="text-xl font-black italic leading-none">{formatWeight(animal.last_weight_kg)}</p>
          </div>
        </div>
      </div>

      {/* LÍNEA DE DESCENDENCIA */}
      <div className="space-y-6 text-center">
        <h5 className="text-[10px] font-black pb-2 uppercase tracking-[0.3em] text-neutral-400">Descendencia Directa</h5>
        
        {offspring && offspring.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {offspring.map(child => (
              <FamilyCard 
                key={child.id}
                id={child.number} 
                relation={child.sex === 'Hembra' ? 'Hija' : 'Hijo'} 
                photo_path={child.photo_path}
                photo_blob={child.photo_blob}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-neutral-300">
            <Share2 className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sin descendencia registrada</p>
          </div>
        )}
      </div>

    </div>
  );
}