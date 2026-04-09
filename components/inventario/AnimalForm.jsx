'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Camera,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  Trash2
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { addToSyncQueue } from '@/lib/syncUtils';
import GenealogySelector from './GenealogySelector';

// Esquema de validación con Zod
const animalSchema = z.object({
  number: z.string().min(1, 'El código es obligatorio'),
  sex: z.enum(['Macho', 'Hembra']),
  color: z.string().optional(),

  // Nacimiento
  birth_date: z.string().optional().refine(val => !val || new Date(val) <= new Date(), {
    message: 'La fecha no puede ser futura'
  }),
  birth_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  mother_weight_at_birth: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  navel_length: z.string().optional(),
  birth_observations: z.string().optional(),

  // Destete
  weaning_date: z.string().optional().refine(val => !val || new Date(val) <= new Date(), {
    message: 'La fecha no puede ser futura'
  }),
  weaning_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  mother_weight_at_weaning: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  sc_at_weaning: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  weaning_observations: z.string().optional(),

  // Genealogía
  father_id: z.string().uuid().nullable().optional(),
  mother_id: z.string().uuid().nullable().optional(),

  // Actuales
  current_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  current_sc_cm: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  observations: z.string().optional(),
  photo_path: z.string().optional().nullable(),
});

// No TS types in .jsx

/**
 * AnimalForm: Componente modular de registro de animales.
 */
export default function AnimalForm({
  initialValues,
  onSubmitSuccess,
  onCancel,
  onOpenModal, // Callback para abrir modal de genealogía
  isModal = false
}) {
  const [activeAccordions, setActiveAccordions] = useState({ birth: false, weaning: false });
  const fileInputRef = React.useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: initialValues || {
      sex: 'Macho',
    }
  });

  const selectedSex = watch('sex');
  const fatherId = watch('father_id');
  const motherId = watch('mother_id');
  const photoPath = watch('photo_path');

  const toggleAccordion = (section) => {
    setActiveAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
      setValue('photo_path', base64);
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      alert('Error al procesar la imagen.');
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setValue('photo_path', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (data) => {
    try {
      // 1. Obtener Usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay sesión de usuario activa');

      const animalId = crypto.randomUUID();
      const now = new Date().toISOString();

      // 2. Transacción Atómica en Dexie
      await db.transaction('rw', [db.animals, db.growth_events, db.sync_queue], async () => {

        // A. Insertar Animal
        const animalData = {
          id: animalId,
          user_id: user.id,
          number: data.number,
          sex: data.sex,
          color: data.color || null,
          birth_date: data.birth_date || null,
          mother_id: data.mother_id || null,
          father_id: data.father_id || null,
          observations: data.observations || null,
          photo_path: data.photo_path || null,

          // Denormalización de último peso
          last_weight_kg: data.current_weight_kg || data.weaning_weight_kg || data.birth_weight_kg || null,
          last_weight_date: data.current_weight_kg ? now : (data.weaning_weight_kg ? data.weaning_date : (data.birth_weight_kg ? data.birth_date : null)),

          created_at: now,
          updated_at: now,
          deleted_at: null
        };
        await db.animals.add(animalData);
        await addToSyncQueue('animals', 'INSERT', animalData);

        // B. Evento de Nacimiento
        if (data.birth_date) {
          const birthEvent = {
            id: crypto.randomUUID(),
            user_id: user.id,
            animal_id: animalId,
            event_type: 'Nacimiento',
            event_date: data.birth_date,
            weight_kg: data.birth_weight_kg || null,
            mother_weight_kg: data.mother_weight_at_birth || null,
            navel_length: data.navel_length || null,
            observations: data.birth_observations || null,
            created_at: now,
            updated_at: now
          };
          await db.growth_events.add(birthEvent);
          await addToSyncQueue('growth_events', 'INSERT', birthEvent);
        }

        // C. Evento de Destete
        if (data.weaning_date) {
          const weaningEvent = {
            id: crypto.randomUUID(),
            user_id: user.id,
            animal_id: animalId,
            event_type: 'Destete',
            event_date: data.weaning_date,
            weight_kg: data.weaning_weight_kg || null,
            mother_weight_kg: data.mother_weight_at_weaning || null,
            scrotal_circumference_cm: data.current_sc_cm || null,
            observations: data.weaning_observations || null,
            created_at: now,
            updated_at: now
          };
          await db.growth_events.add(weaningEvent);
          await addToSyncQueue('growth_events', 'INSERT', weaningEvent);
        }
      });

      onSubmitSuccess && onSubmitSuccess(animalId);
    } catch (err) {
      console.error('Error guardando animal:', err);
      alert('Error al guardar. Verifica la consola.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="pb-10">

      {/* 0. SECCIÓN: IDENTIFICACIÓN VISUAL (FOTO Y DESCRIPCIÓN) */}
      <section className="bg-[#F4F5F0] rounded-3xl p-5 mb-4 shadow-sm border border-neutral-100/50">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-neutral-300 rounded-2xl h-60 flex flex-col items-center justify-center text-neutral-400 bg-white/50 hover:bg-white cursor-pointer transition-all group mb-5 overflow-hidden shadow-inner"
        >
          {photoPath ? (
            <>
              <img
                src={photoPath}
                alt="Previsualización"
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-300"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 active:scale-90 transition-all z-10"
                title="Eliminar foto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-md py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Cambiar Foto</span>
              </div>
            </>
          ) : (
            <>
              <Camera className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform text-neutral-500" strokeWidth={1.5} />
              <span className="text-sm font-black uppercase tracking-widest text-neutral-500">Subir Foto</span>
              <p className="text-[10px] text-neutral-400 mt-2 font-medium">Recomendado: Close-up del animal</p>
            </>
          )}
        </div>

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          capture="environment" // Sugerir cámara trasera en móviles
        />

        <div className="mb-2">
          <label className="text-sm font-bold text-[#1B4820] mb-2 block">
            Descripción Breve
          </label>
          <textarea
            {...register('observations')}
            placeholder="Añade una descripción visual del animal..."
            rows={4}
            className="w-full bg-white rounded-2xl px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 border border-transparent focus:border-[#1B4820]/30 transition-all shadow-sm resize-none"
          />
        </div>
      </section>

      {/* 1. SECCIÓN: IDENTIFICACIÓN */}
      <section className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Identificación Básica</label>

        <div className="mb-4">
          <input
            {...register('number')}
            placeholder="Código / Número *"
            className={`w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 ${errors.number ? 'border-red-500' : 'border-neutral-100 focus:border-[#1B4820]/30'}`}
          />
          {errors.number && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.number.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setValue('sex', 'Macho')}
            className={`py-3 rounded-xl font-bold text-sm transition-all border ${selectedSex === 'Macho' ? 'bg-[#1B4820] text-white border-[#1B4820]' : 'bg-white text-neutral-500 border-neutral-100'}`}
          >
            MACHO
          </button>
          <button
            type="button"
            onClick={() => setValue('sex', 'Hembra')}
            className={`py-3 rounded-xl font-bold text-sm transition-all border ${selectedSex === 'Hembra' ? 'bg-[#1B4820] text-white border-[#1B4820]' : 'bg-white text-neutral-500 border-neutral-100'}`}
          >
            HEMBRA
          </button>
        </div>

        <input
          {...register('color')}
          placeholder="Color (Ej: Rojo Suave)"
          className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20"
        />
      </section>

      {/* 2. ACORDEÓN: NACIMIENTO */}
      <div className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleAccordion('birth')}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-emerald-600"></div>
            <h3 className="text-lg font-bold text-[#1B4820]">Evento: Nacimiento</h3>
          </div>
          {activeAccordions.birth ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {activeAccordions.birth && (
          <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Fecha de Nacimiento</label>
              <input type="date" {...register('birth_date')} className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 border border-neutral-100 focus:outline-none" />
              {errors.birth_date && <p className="text-red-500 text-[10px] mt-1">{errors.birth_date.message}</p>}
            </div>
            <input type="number" step="any" {...register('birth_weight_kg')} placeholder="Peso Cría (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none" />
            <input type="number" step="any" {...register('mother_weight_at_birth')} placeholder="Peso Madre al Parto (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none" />
            <input {...register('navel_length')} placeholder="Longitud Ombligo" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none" />
            <textarea {...register('birth_observations')} placeholder="Observaciones del parto..." rows={2} className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none resize-none" />
          </div>
        )}
      </div>

      {/* 3. ACORDEÓN: DESTETE */}
      <div className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleAccordion('weaning')}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-amber-600"></div>
            <h3 className="text-lg font-bold text-[#1B4820]">Evento: Destete</h3>
          </div>
          {activeAccordions.weaning ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {activeAccordions.weaning && (
          <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <input type="date" {...register('weaning_date')} className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 border border-neutral-100 focus:outline-none" />
            <input type="number" step="any" {...register('weaning_weight_kg')} placeholder="Peso al Destete (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none" />
            <input type="number" step="any" {...register('mother_weight_at_weaning')} placeholder="Peso Madre al Destete" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none" />
            <textarea {...register('weaning_observations')} placeholder="Observaciones del destete..." rows={2} className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none resize-none" />
          </div>
        )}
      </div>

      {/* 4. SECCIÓN: MEDIDAS ACTUALES */}
      <section className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full bg-[#1B4820]"></div>
          <h3 className="text-lg font-bold text-[#1B4820]">Medidas y Pesos Actuales</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Peso Actual (KG)</label>
            <input
              type="number"
              step="any"
              {...register('current_weight_kg')}
              placeholder="0.00"
              className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Circ. Escrotal (CM)</label>
            <input
              type="number"
              step="any"
              {...register('current_sc_cm')}
              placeholder="0.00"
              className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none"
            />
          </div>
        </div>
      </section>

      {/* 5. GENEALOGÍA */}
      <section className="bg-neutral-100/50 rounded-3xl p-5 mb-12 border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full bg-[#8C6746]"></div>
          <h3 className="text-lg font-bold text-[#1B4820]">Genealogía</h3>
        </div>
        <GenealogySelector
          label="Padre (Toro)"
          sex="Macho"
          value={fatherId}
          onChange={(id) => setValue('father_id', id)}
          onCreateNew={(sex) => onOpenModal && onOpenModal(sex, (id) => setValue('father_id', id))}
        />
        <GenealogySelector
          label="Madre (Vaca)"
          sex="Hembra"
          value={motherId}
          onChange={(id) => setValue('mother_id', id)}
          onCreateNew={(sex) => onOpenModal && onOpenModal(sex, (id) => setValue('mother_id', id))}
        />
      </section>

      {/* FOOTER ACCIONES (Solo si no es modal) */}
      {!isModal && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-neutral-100 p-3 z-40">
          <div className="max-w-2xl mx-auto flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-[#D15555] hover:bg-[#B94545] text-white font-bold py-2 rounded-full shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-[10px] tracking-widest">CANCELAR</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0F2912] hover:bg-[#1B4820] text-white font-bold py-2 rounded-full shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <span className="text-[10px] py-4">GUARDANDO...</span>
              ) : (
                <>
                  <Save className="w-6 h-6" strokeWidth={2.5} />
                  <span className="text-[10px] tracking-widest uppercase">GUARDAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* BOTONES SI ES MODAL */}
      {isModal && (
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[#D15555] text-white font-bold py-3 rounded-full flex flex-col items-center justify-center gap-1"
          >
            <X className="w-5 h-5" />
            <span className="text-[10px] tracking-widest">CANCELAR</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#0F2912] text-white font-bold py-3 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span className="text-[10px] tracking-widest uppercase">GUARDAR</span>
          </button>
        </div>
      )}
    </form>
  );
}
