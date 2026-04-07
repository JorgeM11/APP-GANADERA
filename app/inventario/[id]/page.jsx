'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  IdCard, 
  Network, 
  ShieldCheck, 
  FileText, 
  Pencil,
  CheckCircle2,
  List,
  TrendingUp,
  CalendarDays,
  Share2
} from 'lucide-react';

const mockAnimalDetails = {
  id: 'uuid-1',
  number: '482',
  weight: '842 kg',
  age: '3.5 Años',
  imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
  identification: {
    arete: '482',
    registro: 'Maximus IV',
    nacimiento: '12 de Octubre, 2020',
    sexo: 'Macho'
  },
  genealogy: {
    padre: 'Titan #99',
    madre: 'Luna #102'
  },
  health: {
    ultimoControl: '14 MAYO 2024',
    vacunas: [
      { nombre: 'Aftosa', fecha: '14 Mayo 2024' },
      { nombre: 'Carbunco', fecha: '14 Mayo 2024' },
      { nombre: 'Brucelosis', fecha: '10 Enero 2024' }
    ],
    desparasitacion: 'Al día',
    proximaDesparasitacion: '15 Sept 2024',
    dieta: 'Pastoreo Rotativo',
    suplemento: 'Suplemento Proteico 2kg/día'
  },
  observations: '"Ejemplar con excelente temperamento. Ha mostrado una ganancia de peso superior al promedio del lote durante la última temporada de lluvias. Sin registros de cojera o problemas respiratorios desde su ingreso. Ideal para semental de reemplazo en la próxima temporada."'
};

export default function AnimalDetailsPage({ params }) {
  // En el futuro usaremos params.id para buscar en Dexie.js
  const animal = mockAnimalDetails;

  return (
    <main className="min-h-screen bg-[#F7F7F2] font-sans pb-24 md:pb-8 relative">
      
      {/* HEADER FIJO */}
      <header className="bg-[#F7F7F2] px-4 py-4 sticky top-0 z-30 flex items-center gap-4 border-b border-neutral-100 md:border-none">
        <Link href="/inventario" className="p-2 -ml-2 hover:bg-neutral-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#1B4820]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1B4820]">
          Ficha del Animal
        </h1>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 mt-2 md:grid md:grid-cols-12 md:gap-8 md:items-start">
        
        {/* COLUMNA IZQUIERDA (Desktop) / BLOQUE SUPERIOR (Móvil) */}
        <div className="md:col-span-5 md:sticky md:top-24 space-y-5 relative z-10">
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm">
            <img 
              src={animal.imageUrl} 
              alt={animal.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <span className="text-3xl font-black text-[#1B4820] tracking-tight block">
            #{animal.number}
          </span>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center flex flex-col justify-center border border-neutral-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1">Peso</span>
              <span className="text-2xl font-black text-[#1B4820]">{animal.weight}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center flex flex-col justify-center border border-neutral-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1">Edad</span>
              <span className="text-2xl font-black text-[#1B4820]">{animal.age}</span>
            </div>
          </div>

          <button className="hidden md:flex w-full items-center justify-center gap-2 bg-[#FBE3C5] hover:bg-[#F2D1A8] text-[#8C6746] font-bold py-4 rounded-2xl shadow-sm transition-colors mt-4">
            <Pencil className="w-5 h-5" />
            EDITAR
          </button>
        </div>

        {/* COLUMNA DERECHA (Desktop) / BLOQUE INFERIOR (Móvil) */}
        <div className="md:col-span-7 mt-6 md:mt-0 relative">
          
          {/* NAVEGACIÓN DESKTOP (FIJA AL HACER SCROLL) */}
          <div className="hidden md:flex items-center gap-8 border-b border-neutral-200 mb-6 px-2 sticky top-[72px] bg-[#F7F7F2] z-20 pt-2 pb-0">
            <button className="flex items-center gap-2 text-[#1B4820] border-b-2 border-[#1B4820] pb-3 -mb-[2px] transition-colors bg-transparent">
              <List className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Detalles</span>
            </button>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-[#1B4820] pb-3 -mb-[2px] transition-colors border-b-2 border-transparent hover:border-neutral-300 bg-transparent">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Evolución</span>
            </button>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-[#1B4820] pb-3 -mb-[2px] transition-colors border-b-2 border-transparent hover:border-neutral-300 bg-transparent">
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Evento</span>
            </button>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-[#1B4820] pb-3 -mb-[2px] transition-colors border-b-2 border-transparent hover:border-neutral-300 bg-transparent">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Genealogía</span>
            </button>
          </div>

          {/* CONTENIDO DE DETALLES */}
          <div className="space-y-4">
            {/* Identificación */}
            <section className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
              <div className="flex items-center gap-2 mb-5">
                <IdCard className="w-5 h-5 text-[#4F663F]" />
                <h3 className="text-lg font-bold text-[#1B4820]">Identificación Detallada</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Número de Arete</p>
                  <p className="font-bold text-neutral-800">{animal.identification.arete}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Nombre Registro</p>
                  <p className="font-bold text-neutral-800">{animal.identification.registro}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Fecha de Nacimiento</p>
                  <p className="font-bold text-neutral-800">{animal.identification.nacimiento}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Sexo</p>
                  <p className="font-bold text-neutral-800">{animal.identification.sexo}</p>
                </div>
              </div>
            </section>

            {/* Genealogía */}
            <section className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
              <div className="flex items-center gap-2 mb-5">
                <Network className="w-5 h-5 text-[#4F663F]" />
                <h3 className="text-lg font-bold text-[#1B4820]">Genealogía</h3>
              </div>
              <div className="relative pl-4 border-l-2 border-neutral-100 space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Padre (Semental)</p>
                  <p className="font-bold text-neutral-800">{animal.genealogy.padre}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Madre (Vientre)</p>
                  <p className="font-bold text-neutral-800">{animal.genealogy.madre}</p>
                </div>
              </div>
            </section>

            {/* Estado Sanitario */}
            <section className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#4F663F]" />
                  <h3 className="text-lg font-bold text-[#1B4820]">Estado Sanitario</h3>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">
                  Último: {animal.health.ultimoControl}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Historial de Vacunación (Resumido)</p>
                  <div className="space-y-2">
                    {animal.health.vacunas.map((vacuna, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1B4820]" />
                        <p className="text-sm font-bold text-neutral-800">{vacuna.nombre} <span className="font-medium text-neutral-500">- {vacuna.fecha}</span></p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 text-xs font-bold text-[#8C6746] hover:text-[#5A4027] uppercase tracking-wider transition-colors">
                    Ver Historial Completo →
                  </button>
                </div>

                
              </div>
            </section>

            {/* Observaciones */}
            <section className="bg-[#EEF2EA] p-5 rounded-3xl border border-transparent">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-[#4F663F]" />
                <h3 className="text-lg font-bold text-[#1B4820]">Observaciones del Ganadero</h3>
              </div>
              <p className="text-sm text-[#4F663F] leading-relaxed font-medium">
                {animal.observations}
              </p>
            </section>
          </div>

          {/* Botón Editar Móvil */}
          <button className="md:hidden w-full flex items-center justify-center gap-2 bg-[#FBE3C5] hover:bg-[#F2D1A8] text-[#8C6746] font-bold py-4 rounded-2xl shadow-sm transition-colors mt-6 mb-4">
            <Pencil className="w-5 h-5" />
            EDITAR
          </button>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR (Solo visible en Móvil y Tablet pequeña) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-neutral-200 px-4 py-3 md:hidden z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <button className="flex flex-col items-center gap-1 text-[#1B4820]">
            <List className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Detalles</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-[#1B4820] transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Evolución</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-[#1B4820] transition-colors">
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Evento</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-[#1B4820] transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Genealogía</span>
          </button>
        </div>
      </div>

    </main>
  );
}