import React from 'react';

export default function PartosTab({ animalId }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-200">
      <span className="text-xs uppercase tracking-widest text-[#1B4820] font-bold">10 de Octubre, 2023</span>
      <h3 className="font-bold text-gray-800 text-lg mt-1">Nacimiento del Ternero #591</h3>
      <p className="text-sm text-gray-500 mt-2">Parto natural sin complicaciones. Madre: {animalId}</p>
    </div>
  );
}
