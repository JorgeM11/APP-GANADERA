"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, Ruler, Camera, Save, X, ChevronDown, CheckCircle } from "lucide-react";

export default function EventoDeVidaPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;
  
  const displayId = "742-GZ";

  // Estados React
  const [tipoEvento, setTipoEvento] = useState("Destete");
  const [eventoPersonalizado, setEventoPersonalizado] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempMeses, setTempMeses] = useState("");

  // Estados de carga y Toast
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Estados Dropdowns
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [isLargoOpen, setIsLargoOpen] = useState(false);

  // Opciones Dropdowns
  const tipoOpciones = ["Destete", "Peso a los 12 meses", "Peso a los 18 meses", "Otro"];
  const largoOpciones = [
    { value: "1", label: "Corto (1)" },
    { value: "5", label: "Largo (5)" }
  ];

  // Estado y Ref para Fotografía
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fechaEvento: "2023-10-25",
      pesoVaca: "",
      pesoCria: "",
      circunferencia: "",
      largoViril: "1",
    },
  });

  const selectedLargo = watch("largoViril");

  // Validadores Numéricos
  const preventInvalidNumberKeys = (e) => {
    // Evitar signos + - * / e E y caracteres inválidos
    if (['+', '-', 'e', 'E', '*', '/', '{', '}', 'ñ', 'Ñ'].includes(e.key) || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  const handleNumericInput = (e) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, ''); // Remover todo lo que no sea número o punto
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join(''); // Prevenir mútiples puntos
    }
    e.target.value = val;
  };

  // Click Externo para Dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".custom-dropdown")) {
        setIsTipoOpen(false);
        setIsLargoOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const getDisplayTitle = () => {
    if (tipoEvento === "Otro" && eventoPersonalizado) {
      return `Peso en ${eventoPersonalizado} meses`;
    }
    return tipoEvento;
  };

  const selectTipoEvento = (opcion) => {
    if (opcion === "Otro") {
      setIsTipoOpen(false);
      setIsModalOpen(true);
    } else {
      setTipoEvento(opcion);
      setEventoPersonalizado("");
      setIsTipoOpen(false);
    }
  };

  const handleModalConfirm = () => {
    if (tempMeses.trim()) {
      setEventoPersonalizado(tempMeses);
      setTipoEvento("Otro");
    } else {
      setTipoEvento("Destete");
    }
    setIsModalOpen(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const onSubmit = (data) => {
    setIsSaving(true);
    const payload = {
      ...data,
      tipoEvento: getDisplayTitle(),
      animalId,
    };
    console.log("[Terra Form] Guardando Evento de Vida...", payload);

    // Simulación de delay de red o guardado local
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);

      // Desaparece toast y redirecciona
      setTimeout(() => {
        setShowToast(false);
        router.push(`/inventario/${animalId}?tab=evolution`);
      }, 2000);
    }, 1000);
  };

  const handleCancel = () => {
    router.push(`/inventario/${animalId}?tab=evolution`);
  };

  return (
    <main className="min-h-screen bg-[#F8F9F5] font-sans pb-36 relative">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed z-50 px-5 py-4 bg-[#1A3621] text-white rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-5 top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:-translate-x-0 font-bold text-sm flex items-center gap-3 w-[90%] max-w-sm sm:w-auto">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          Evento de vida registrado exitosamente
        </div>
      )}

      <header className="flex items-center justify-between px-5 pt-6 pb-4 sticky top-0 bg-[#F8F9F5]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleCancel}
            className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} className="text-[#1A3621]" strokeWidth={2.5} />
          </button>
          <h1 className="font-sans text-lg font-bold text-[#1A3621]">
            Registrar Evento de Vida
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col px-5 max-w-2xl mx-auto space-y-6">

        {/* Hero Card */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm bg-black">
          <Image
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800"
            alt="Bovino"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-4 left-5 flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300">
              ID DE ANIMAL: {displayId}
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {getDisplayTitle()}
            </span>
          </div>
        </div>

        {/* Dropdown Custom - Tipo de Evento */}
        <div className="w-full custom-dropdown relative z-20">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 pl-1">
            Tipo de Evento
          </label>
          <div 
            className="w-full bg-white font-bold text-gray-800 text-lg rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between cursor-pointer border border-gray-100"
            onClick={() => {
              setIsTipoOpen(!isTipoOpen);
              setIsLargoOpen(false);
            }}
          >
            <span>{tipoEvento}</span>
            <ChevronDown className={`w-5 h-5 text-[#1A3621] transition-transform ${isTipoOpen ? "rotate-180" : ""}`} />
          </div>
          
          {isTipoOpen && (
            <div className="absolute top-[85px] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              {tipoOpciones.map((opcion) => (
                <div
                  key={opcion}
                  onClick={() => selectTipoEvento(opcion)}
                  className={`px-5 py-3.5 font-bold cursor-pointer hover:bg-gray-50 transition-colors ${tipoEvento === opcion ? "text-[#1A3621] bg-emerald-50/50" : "text-gray-700"}`}
                >
                  {opcion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Datos Generales */}
        <div className="pt-2">
          <div className="flex items-center mb-4">
            <div className="w-1.5 h-6 bg-[#1A3621] rounded-full mr-2.5" />
            <h3 className="font-bold text-[#1A3621]">Datos Generales</h3>
          </div>

          <div className="space-y-4">
            {/* Fecha */}
            <div className="bg-white rounded-2xl p-4 flex flex-col shadow-sm border border-gray-100/50">
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-3">
                Fecha del Evento
              </label>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-[#1A3621]" />
                <input
                  type="date"
                  className="font-bold text-gray-800 text-lg outline-none w-full bg-transparent"
                  {...register("fechaEvento")}
                />
              </div>
            </div>

            {/* Inputs de Pesos con validación bloqueando teclado y ruleta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-l-[6px] border-[#1A3621] rounded-2xl p-4 flex flex-col shadow-sm">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Peso Vaca (KG)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  onKeyDown={preventInvalidNumberKeys}
                  className="text-2xl font-extrabold text-[#1A3621] outline-none w-full bg-transparent placeholder-gray-300"
                  {...register("pesoVaca", { onChange: handleNumericInput })}
                />
              </div>

              <div className="bg-white border-l-[6px] border-[#1A3621] rounded-2xl p-4 flex flex-col shadow-sm">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Peso Cría (KG)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  onKeyDown={preventInvalidNumberKeys}
                  className="text-2xl font-extrabold text-[#1A3621] outline-none w-full bg-transparent placeholder-gray-300"
                  {...register("pesoCria", { onChange: handleNumericInput })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección Medidas */}
        <div className="bg-[#EFEFE6]/70 rounded-3xl p-5 border border-gray-200/40">
          <div className="flex items-center gap-2 mb-4">
            <Ruler size={18} className="text-[#1A3621]" />
            <h3 className="font-bold text-[#1A3621] text-[15px]">Sección Medidas</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl px-4 py-3 flex flex-col shadow-sm">
              <label className="text-[0.60rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Circunferencia Escrotal (CM)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="---"
                onKeyDown={preventInvalidNumberKeys}
                className="font-bold text-gray-800 text-base outline-none w-full bg-transparent"
                {...register("circunferencia", { onChange: handleNumericInput })}
              />
            </div>

            {/* Dropdown Custom - Largo Viril */}
            <div className="custom-dropdown relative bg-white rounded-xl px-4 py-3 flex flex-col shadow-sm z-10">
              <label className="text-[0.60rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Largo Viril/Ombligo
              </label>
              <div 
                className="flex items-center justify-between cursor-pointer outline-none"
                onClick={() => {
                  setIsLargoOpen(!isLargoOpen);
                  setIsTipoOpen(false);
                }}
              >
                <span className="font-bold text-gray-800 text-base">
                  {largoOpciones.find(o => o.value === selectedLargo)?.label || "Corto (1)"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLargoOpen ? "rotate-180" : ""}`} />
              </div>

              {isLargoOpen && (
                <div className="absolute top-[60px] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in">
                  {largoOpciones.map((opcion) => (
                    <div
                      key={opcion.value}
                      onClick={() => {
                        setValue("largoViril", opcion.value);
                        setIsLargoOpen(false);
                      }}
                      className="px-4 py-3 font-bold text-[15px] cursor-pointer hover:bg-gray-50 text-gray-700"
                    >
                      {opcion.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toma de Fotografía */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative h-32 mt-2 border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center bg-[#EAECE4]/30 cursor-pointer active:scale-95 transition-transform hover:bg-[#EAECE4]/50 overflow-hidden"
        >
          {photoPreview ? (
            <Image src={photoPreview} alt="Preview" fill className="object-cover" />
          ) : (
            <>
              <div className="bg-[#1A3621] rounded-full p-2.5 mb-2">
                <Camera className="text-white w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1A3621]">
                Tomar Foto Del Evento
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Sticky Footer - Botones Píldora Horizontal */}
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#F8F9F5] via-[#F8F9F5] to-transparent pt-12 pb-8 px-5 z-40">
          <div className="max-w-md mx-auto w-full bg-[#F8F9F5] rounded-[2rem] p-3 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.06)] border border-white/60">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 flex flex-row items-center justify-center gap-2 bg-[#D15E5A] hover:bg-[#D15E5A]/90 text-white rounded-full py-4 transition-all active:scale-95 shadow-[0_4px_14px_rgba(209,94,90,0.3)] disabled:opacity-50"
              >
                <X size={20} strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-widest">Cancelar</span>
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex flex-row items-center justify-center gap-2 bg-[#1A3621] hover:bg-[#1A3621]/90 text-white rounded-full py-4 transition-all active:scale-95 shadow-[0_4px_14px_rgba(26,54,33,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={20} strokeWidth={2.5} />
                )}
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </span>
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Modal - "Otro" Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-safe flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-6">¿Peso a los cuántos meses?</h2>
            <input
              type="text"
              inputMode="numeric"
              onKeyDown={preventInvalidNumberKeys}
              onChange={(e) => setTempMeses(e.target.value.replace(/[^0-9]/g, ''))}
              value={tempMeses}
              placeholder="Ej. 6"
              className="w-full mt-4 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xl font-bold outline-none "
              autoFocus
            />
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTipoEvento("Destete");
                }}
                className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={handleModalConfirm}
                className="flex-1 py-4 font-bold text-white bg-[#1A3621] rounded-full shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
