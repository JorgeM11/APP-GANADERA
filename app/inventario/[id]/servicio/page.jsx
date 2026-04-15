"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Syringe } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

// Importaciones Core
import { db } from "@/lib/db";
import ServicioForm from "@/components/inventario/ServicioForm";

export default function ServicioPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;

  // --- CONSULTAS REACTIVAS (DEXIE) ---
  const animal = useLiveQuery(() => db.animals.get(animalId), [animalId]);

  // --- GUARDS DE CARGA ---
  if (animal === undefined) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center text-[#1A3621]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs opacity-60">Cargando datos del animal...</p>
      </div>
    );
  }

  if (animal === null) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center text-[#1A3621] px-6 text-center">
        <h2 className="text-2xl font-black mb-2">Animal no encontrado</h2>
        <p className="text-sm text-neutral-500 mb-6 font-medium">No se pudo cargar la información para este registro.</p>
        <button onClick={() => router.back()} className="bg-[#1A3621] text-white px-8 py-3 rounded-full font-bold text-sm">VOLVER</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9F5] font-sans pb-40 relative">
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4 sticky top-0 bg-[#F8F9F5]/90 backdrop-blur-md z-30 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer">
            <ArrowLeft size={24} className="text-[#1A3621]" strokeWidth={2.5} />
          </button>
          <h1 className="font-sans text-lg font-bold text-[#1A3621]">Registro Reproductivo</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-5 mt-6 mb-8 sm:px-6 sm:mt-8 sm:mb-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Syringe size={14} strokeWidth={2.5} className="text-[#1A3621]" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#1A3621]">
            GESTIÓN GANADERA
          </span>
        </div>

        <span className="font-display text-[2.5rem] sm:text-5xl leading-[1.05] font-extrabold text-[#1A3621] mb-3 block">
          Registrar<br className="sm:hidden" /> Servicio
        </span>

        <p className="font-sans text-base font-medium text-gray-500 leading-relaxed max-w-[500px] sm:max-w-2xl mt-4">
          Registre el inicio del ciclo reproductivo (Monta o IA) para monitorear la eficiencia de su ganado.
        </p>
      </section>

      {/* Form Section */}
      <section className="px-5 sm:px-6 space-y-6 sm:space-y-10 max-w-2xl mx-auto">
        <ServicioForm
          animal={animal}
          onSubmitSuccess={() => router.push(`/inventario/${animalId}?tab=reproduction`)}
          onCancel={() => router.back()}
        />
      </section>
    </main>
  );
}
