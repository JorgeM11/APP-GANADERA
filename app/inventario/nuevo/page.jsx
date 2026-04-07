'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Camera, 
  X, 
  Save, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Check
} from 'lucide-react';

// ==========================================
// COMPONENTES REUTILIZABLES DE UI
// ==========================================

const InputField = ({ label, placeholder, required, type = "text", icon: Icon }) => (
  <div className="mb-4 last:mb-0">
    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 border border-transparent focus:border-[#1B4820]/30 transition-all shadow-sm"
      />
      {Icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </div>
);

// NUEVO: Custom Select Component estético
const CustomSelect = ({ label, options, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 last:mb-0 relative">
      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Botón principal del Select */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white rounded-xl px-4 py-3 text-left cursor-pointer flex justify-between items-center shadow-sm border transition-all select-none ${isOpen ? 'border-[#1B4820]/30 ring-2 ring-[#1B4820]/20' : 'border-transparent hover:border-[#1B4820]/30'}`}
      >
        <span className={value ? "text-neutral-800 font-medium" : "text-neutral-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Menú Desplegable */}
      {isOpen && (
        <>
          {/* Overlay invisible para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden transform opacity-100 scale-100 transition-all duration-200 origin-top">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors select-none ${value === option ? 'bg-[#EEF2EA] text-[#1B4820]' : 'text-neutral-700 hover:bg-neutral-50'}`}
              >
                <span className={value === option ? 'font-bold' : 'font-medium'}>{option}</span>
                {value === option && <Check className="w-4 h-4 text-[#1B4820]" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const TextAreaField = ({ label, placeholder, required, rows = 3 }) => (
  <div className="mb-4 last:mb-0">
    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 resize-none shadow-sm border border-transparent focus:border-[#1B4820]/30 transition-all"
    />
  </div>
);

const AccordionSection = ({ title, defaultOpen = false, color = "border-[#1B4820]", children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="bg-[#F4F5F0] rounded-3xl p-5 mb-4 shadow-sm border border-neutral-100/50 transition-all duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-1 h-5 rounded-full ${color.replace('border-', 'bg-')}`}></div>
          <h3 className="text-lg font-bold text-[#1B4820] group-hover:text-neutral-900 transition-colors">
            {title}
          </h3>
        </div>
        <div className="bg-white p-1.5 rounded-full shadow-sm text-neutral-500 group-hover:text-[#1B4820] transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
};

const StaticSection = ({ title, color = "bg-[#1B4820]", children }) => (
  <section className="bg-[#F4F5F0] rounded-3xl p-5 mb-4 shadow-sm border border-neutral-100/50">
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-1 h-5 rounded-full ${color}`}></div>
      <h3 className="text-lg font-bold text-[#1B4820]">{title}</h3>
    </div>
    {children}
  </section>
);

// ==========================================
// PÁGINA PRINCIPAL: NUEVO ANIMAL
// ==========================================
export default function NuevoAnimalPage() {
  // Estado para controlar el select personalizado
  const [sexo, setSexo] = useState('');

  return (
    <main className="min-h-screen bg-[#FCFCFA] font-sans pb-28 relative">
      
      {/* HEADER */}
      <header className="px-4 py-5 sticky top-0 z-20 bg-[#FCFCFA]/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/inventario" className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#1B4820]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1B4820]">
            Gestor Ganadero
          </h1>
        </div>
      </header>

      {/* FORMULARIO */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        
        {/* 1. FOTO */}
        <section className="bg-[#F4F5F0] rounded-3xl p-5 mb-4 shadow-sm border border-neutral-100/50">
          <div className="border-2 border-dashed border-neutral-300 rounded-2xl h-40 flex flex-col items-center justify-center text-neutral-400 bg-white/50 hover:bg-white cursor-pointer transition-colors group">
            <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-neutral-500" strokeWidth={1.5} />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Subir Foto</span>
          </div>
        </section>

        {/* 2. IDENTIFICACIÓN BÁSICA (Fija) */}
        <StaticSection title="Identificación Básica" color="bg-[#1B4820]">
          <InputField label="Código / Número" placeholder="EJ: 4492-B" required />
          
          {/* CUSTOM SELECT EN ACCIÓN */}
          <CustomSelect 
            label="Sexo"
            options={["Macho", "Hembra"]}
            value={sexo}
            onChange={setSexo}
            placeholder="Seleccionar..."
            required
          />
        </StaticSection>

        {/* 3. ACORDEÓN: DATOS DE NACIMIENTO */}
        <AccordionSection title="Evento: Nacimiento" color="border-[#4F663F]">
          <InputField label="Fecha de Nacimiento" placeholder="dd/mm/aaaa" type="date" required />
          <InputField label="Peso de la Cría (KG)" placeholder="0.00" type="number" />
          <InputField label="Peso de la Madre al Parto (KG)" placeholder="0.00" type="number" />
          <InputField label="Longitud de Ombligo" placeholder="Ej: Corto, Normal, Largo..." />
          <TextAreaField label="Observaciones del Parto" placeholder="Añade notas sobre el desarrollo del parto, complicaciones..." rows={2} />
        </AccordionSection>

        {/* 4. ACORDEÓN: DATOS DE DESTETE */}
        <AccordionSection title="Evento: Destete" color="border-[#4F663F]">
          <InputField label="Fecha de Destete" placeholder="dd/mm/aaaa" type="date" />
          <InputField label="Peso de la Cría (KG)" placeholder="0.00" type="number" />
          <InputField label="Peso de la Madre al Destete (KG)" placeholder="0.00" type="number" />
          <InputField label="Circunferencia Escrotal (CM)" placeholder="0.00" type="number" />
          <TextAreaField label="Observaciones del Destete" placeholder="Añade notas sobre el estrés, temperamento, etc..." rows={2} />
        </AccordionSection>

        {/* 5. GENEALOGÍA */}
        <StaticSection title="Genealogía" color="bg-[#8C6746]">
          <InputField label="Número / Registro Padre" placeholder="Registro del Padre" icon={Search} />
          <InputField label="Número / Registro Madre" placeholder="Registro de la Madre" icon={Search} />
        </StaticSection>

        {/* 6. MEDIDAS Y PESOS ACTUALES */}
        <StaticSection title="Medidas y Pesos Actuales" color="bg-[#1B4820]">
          <InputField label="Peso Actual (KG)" placeholder="0.00" type="number" />
          <InputField label="C.E. Actual (CM)" placeholder="Circ. Escrotal" type="number" />
        </StaticSection>

        {/* 7. DATOS ADMINISTRATIVOS */}
        <StaticSection title="Datos Administrativos" color="bg-[#4F663F]">
          <TextAreaField 
            label="Observaciones Generales" 
            placeholder="Añade notas sanitarias, de temperamento o procedencia general del animal..." 
            rows={4} 
          />
        </StaticSection>
      </div>

      {/* FOOTER DE ACCIONES */}
      <div className="fixed bottom-0 w-full bg-[#FCFCFA]/90 backdrop-blur-md border-t border-neutral-100 px-4 py-4 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/inventario" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-[#D15555] hover:bg-[#B94545] text-white font-bold py-3.5 rounded-2xl shadow-sm transition-colors active:scale-[0.98]">
              <X className="w-5 h-5" strokeWidth={2.5} />
              CANCELAR
            </button>
          </Link>
          
          <button className="flex-1 flex items-center justify-center gap-2 bg-[#0F2912] hover:bg-[#1B4820] text-white font-bold py-3.5 rounded-2xl shadow-sm transition-colors active:scale-[0.98]">
            <Save className="w-5 h-5" strokeWidth={2.5} />
            GUARDAR
          </button>
        </div>
      </div>

    </main>
  );
}