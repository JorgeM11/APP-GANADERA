"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, Check, TriangleAlert, CheckCircle, X } from "lucide-react";

export default function TactoPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;
  
  // Variables estáticas según diseño
  const displayId = "Vaca #4028";
  const ultimoParto = "12 May 2023";

  // Estado del resultado y notificaciones
  const [resultado, setResultado] = useState(null); // 'prenada' | 'vacia' | null
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fechaTacto: "2023-10-27",
      observaciones: "",
    },
  });

  const handleCancel = () => {
    router.push(`/inventario/${animalId}?tab=reproduction`);
  };

  const onSubmit = (data) => {
    // Validar que se haya seleccionado un resultado
    if (!resultado) {
      alert("Por favor selecciona un resultado para el tacto.");
      return;
    }

    setIsSaving(true);
    const payload = {
      ...data,
      resultado,
      animalId,
    };
    
    console.log("[Terra Form] Guardando Tacto Reproductivo...", payload);

    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        router.push(`/inventario/${animalId}?tab=reproduction`);
      }, 2000);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#F8F9F5] font-sans pb-36 relative">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed z-50 px-5 py-4 bg-[#1A3621] text-white rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-5 top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:-translate-x-0 font-bold text-sm flex items-center gap-3 w-[90%] max-w-sm sm:w-auto">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          Registro guardado exitosamente
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center px-5 pt-6 pb-2 sticky top-0 bg-[#F8F9F5]/90 backdrop-blur-md z-30">
        <button 
          type="button"
          onClick={handleCancel}
          className="p-1 -ml-1 mr-3 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} className="text-[#1A3621]" strokeWidth={2.5} />
        </button>
        <h1 className="font-sans text-lg font-bold text-[#1A3621]">
          Registro Reproductivo
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col px-5 max-w-2xl mx-auto space-y-8 mt-2">
        
        {/* BLOQUE EVALUANDO ANIMAL */}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase">
              Evaluando Animal
            </span>
            <h2 className="text-4xl font-black text-[#1A3621] tracking-tight mt-0.5">
              {displayId}
            </h2>
          </div>
          <div className="bg-[#EAECE4] rounded-xl px-3 py-2 flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-widest font-extrabold text-gray-500">
              Último Parto
            </span>
            <span className="text-sm font-bold text-[#1A3621]">
              {ultimoParto}
            </span>
          </div>
        </div>

        {/* SECCIÓN 1: FECHA DEL TACTO */}
        <div>
          <label className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 border-l-4 border-[#1A3621] pl-2">
            Fecha del Tacto *
          </label>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
            <Calendar size={20} className="text-gray-400" strokeWidth={2.5} />
            <input
              type="date"
              className="font-bold text-gray-800 text-lg outline-none w-full bg-transparent"
              {...register("fechaTacto")}
            />
          </div>
        </div>

        {/* SECCIÓN 2: RESULTADO DEL TACTO (RADIO CARDS) */}
        <div>
          <label className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 border-l-4 border-[#1A3621] pl-2">
            Resultado del Tacto
          </label>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Tarjeta Preñada */}
            <div 
              onClick={() => setResultado('prenada')}
              className={`flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer transition-all active:scale-95 ${
                resultado === 'prenada' 
                  ? 'bg-white border-[3px] border-emerald-400 shadow-md' 
                  : 'bg-[#F4F5F0] border-[3px] border-transparent opacity-80'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                resultado === 'prenada' ? 'bg-emerald-100' : 'bg-emerald-100/50'
              }`}>
                <Check size={28} className="text-emerald-600" strokeWidth={3} />
              </div>
              <span className="font-bold text-[#1A3621] text-lg">Preñada</span>
            </div>

            {/* Tarjeta Vacía */}
            <div 
              onClick={() => setResultado('vacia')}
              className={`flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer transition-all active:scale-95 ${
                resultado === 'vacia' 
                  ? 'bg-white border-[3px] border-red-400 shadow-md' 
                  : 'bg-[#F4F5F0] border-[3px] border-transparent opacity-80'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                resultado === 'vacia' ? 'bg-red-100' : 'bg-red-100/50'
              }`}>
                <TriangleAlert size={28} className="text-red-500" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[#1A3621] text-lg">Vacía</span>
            </div>

          </div>
        </div>

        {/* SECCIÓN 3: OBSERVACIONES */}
        <div>
          <label className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 border-l-4 border-[#1A3621] pl-2">
            Observaciones del Tacto
          </label>
          <textarea
            rows={4}
            placeholder="Indicar condición corporal, anomalías uterinas, presencia de quistes o recomendaciones..."
            className="w-full bg-[#F4F5F0] rounded-3xl p-5 outline-none text-gray-700 font-medium placeholder-gray-400 resize-none border border-transparent focus:border-gray-200 focus:bg-white transition-colors"
            {...register("observaciones")}
          />
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F8F9F5] via-[#F8F9F5] to-transparent pt-12 pb-8 px-5 z-40">
          <div className="max-w-md mx-auto w-full bg-[#F8F9F5] rounded-[2rem] p-3 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.06)] border border-white/60">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-[#FDE4C9] hover:bg-[#FDE4C9]/80 text-[#D15E5A] rounded-full py-4 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                <X size={20} strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-widest">Cancelar</span>
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-[#1A3621] hover:bg-[#1A3621]/90 text-white rounded-full py-4 transition-all active:scale-95 shadow-[0_4px_14px_rgba(26,54,33,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={20} strokeWidth={2.5} />
                )}
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </span>
              </button>
            </div>
          </div>
        </div>

      </form>
    </main>
  );
}
