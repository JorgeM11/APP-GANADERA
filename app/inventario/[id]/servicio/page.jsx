"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { ArrowLeft, CalendarClock, Calendar, Leaf, FlaskConical, ShieldCheck, CheckCircle2, X } from "lucide-react";

export default function ServicioPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;

  // Estado del resultado y notificaciones
  const [tipoServicio, setTipoServicio] = useState('Monta Natural'); // 'Monta Natural' | 'Inseminación Artificial'
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fechaServicio: "",
      toroId: "",
    },
  });

  const handleCancel = () => {
    router.push(`/inventario/${animalId}?tab=reproduction`);
  };

  const onSubmit = (data) => {
    setIsSaving(true);
    const payload = {
      ...data,
      tipoServicio,
      animalId,
    };

    console.log("[Terra Form] Guardando Registro de Servicio...", payload);

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
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          Servicio registrado exitosamente
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col px-5 max-w-2xl mx-auto space-y-6 mt-4">

        {/* REFERENCIA HISTÓRICA */}
        <div className="bg-[#EFEFE6] rounded-xl border-l-[6px] border-[#1A3621] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CalendarClock className="text-[#1A3621] mt-0.5 flex-shrink-0" size={20} strokeWidth={2.5} />
            <div>
              <span className="block text-[0.65rem] uppercase font-bold tracking-widest text-gray-500 mb-1">
                Referencia Histórica
              </span>
              <h3 className="font-bold text-[#1A3621] text-[17px] leading-tight">
                Fecha del Parto Anterior:<br />15/05/2023
              </h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                Información vital para el cálculo del intervalo entre partos y la ventana de fertilidad actual.
              </p>
            </div>
          </div>
        </div>

        {/* FECHA DE SERVICIO */}
        <div>
          <label className="flex items-center text-[0.68rem] font-bold uppercase tracking-widest text-[#1A3621] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A3621] mr-2"></span>
            Fecha de Servicio
          </label>
          <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-[#EAECE4]">
            <input
              type="date"
              className="font-bold text-gray-800 text-base outline-none w-full bg-transparent appearance-none"
              {...register("fechaServicio")}
            />
          </div>
        </div>

        {/* TIPO DE SERVICIO (RADIO CARDS) */}
        <div>
          <label className="flex items-center text-[0.68rem] font-bold uppercase tracking-widest text-[#1A3621] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A3621] mr-2"></span>
            Tipo de Servicio
          </label>
          <div className="grid grid-cols-2 gap-4">

            {/* Monta Natural */}
            <div
              onClick={() => setTipoServicio('Monta Natural')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer transition-all active:scale-95 ${tipoServicio === 'Monta Natural'
                ? 'bg-[#F0F2EB] border-2 border-[#1A3621] shadow-sm'
                : 'bg-[#F4F5F0] border-2 border-transparent opacity-80 hover:bg-[#EAECE4]'
                }`}
            >
              <Leaf size={24} className={`mb-3 ${tipoServicio === 'Monta Natural' ? 'text-[#1A3621]' : 'text-gray-400'}`} strokeWidth={2.5} />
              <span className={`text-[13px] font-bold text-center ${tipoServicio === 'Monta Natural' ? 'text-[#1A3621]' : 'text-gray-500'}`}>
                Monta Natural
              </span>
            </div>

            {/* Inseminación Artificial */}
            <div
              onClick={() => setTipoServicio('Inseminación Artificial')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer transition-all active:scale-95 ${tipoServicio === 'Inseminación Artificial'
                ? 'bg-[#F0F2EB] border-2 border-[#1A3621] shadow-sm'
                : 'bg-[#F4F5F0] border-2 border-transparent opacity-80 hover:bg-[#EAECE4]'
                }`}
            >
              <FlaskConical size={24} className={`mb-3 ${tipoServicio === 'Inseminación Artificial' ? 'text-[#1A3621]' : 'text-gray-400'}`} strokeWidth={2.5} />
              <span className={`text-[13px] font-bold text-center ${tipoServicio === 'Inseminación Artificial' ? 'text-[#1A3621]' : 'text-gray-500'}`}>
                Inseminación Artificial
              </span>
            </div>

          </div>
        </div>

        {/* IDENTIFICACIÓN DEL TORO */}
        <div>
          <label className="flex items-center text-[0.68rem] font-bold uppercase tracking-widest text-[#1A3621] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A3621] mr-2"></span>
            Identificación del Toro
          </label>
          <div className="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 border-l-4 border-l-[#EAECE4]">
            <input
              type="text"
              placeholder="Nombre o Código del Semental"
              className="font-bold text-gray-800 text-[15px] outline-none w-full bg-transparent placeholder-gray-300"
              {...register("toroId")}
            />
            <ShieldCheck size={20} className="text-gray-400 flex-shrink-0" strokeWidth={2.5} />
          </div>
        </div>

        {/* BANNER DECORATIVO */}
        <div className="relative h-44 w-full rounded-[1.25rem] overflow-hidden mt-6 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800"
            alt="Toros"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-5 flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight leading-tight">
              Genética de Precisión
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 mt-1">
              Gestión de datos para la mejora continua
            </span>
          </div>
        </div>

        {/* STICKY FOOTER */}
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
                  <CheckCircle2 size={20} strokeWidth={2.5} />
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
