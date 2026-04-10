'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Save, X, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { addToSyncQueue } from '@/lib/syncUtils';
import { compressImage, uploadImageToSupabase } from '@/lib/imageUtils';
import GenealogySelector from './GenealogySelector';
import { useRouter } from 'next/navigation';

// Esquema de validación con Zod
const animalSchema = z.object({
  number: z.string().min(1, 'El código es obligatorio'),
  sex: z.enum(['Macho', 'Hembra']),
  color: z.string().optional(),
  origin_service_id: z.string().optional().nullable(),

  birth_date: z.string().optional().refine(val => !val || new Date(val) <= new Date(), { message: 'La fecha no puede ser futura' }),
  birth_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  mother_weight_at_birth: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  navel_length: z.string().optional(),
  birth_observations: z.string().optional(),

  weaning_date: z.string().optional().refine(val => !val || new Date(val) <= new Date(), { message: 'La fecha no puede ser futura' }),
  weaning_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  mother_weight_at_weaning: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  sc_at_weaning: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  weaning_observations: z.string().optional(),

  father_id: z.string().uuid().nullable().optional(),
  mother_id: z.string().uuid().nullable().optional(),

  current_weight_kg: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  current_sc_cm: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  observations: z.string().optional(),
});

// --- SUB-COMPONENTE REUTILIZABLE PARA IMÁGENES ---
const ImageUploader = ({ preview, onCapture, onRemove, label, id }) => {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => !preview && inputRef.current?.click()}
      className={`relative border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center text-neutral-400 bg-white/50 hover:bg-white cursor-pointer transition-all group overflow-hidden shadow-inner ${preview ? 'h-48' : 'h-32'}`}
    >
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-full object-cover animate-in fade-in zoom-in duration-300" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 active:scale-90 transition-all z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-neutral-500" strokeWidth={1.5} />
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onCapture} />
    </div>
  );
};

export default function AnimalForm({ initialValues, onSubmitSuccess, onCancel, onOpenModal, isModal = false }) {
  const router = useRouter();
  const [activeAccordions, setActiveAccordions] = useState({ birth: false, weaning: false, service: false });
  
  const [images, setImages] = useState({
    main: { blob: null, preview: null },
    birth: { blob: null, preview: null },
    weaning: { blob: null, preview: null }
  });

  const [showQuickService, setShowQuickService] = useState(false);
  const [isSavingQuickService, setIsSavingQuickService] = useState(false);
  const [quickServiceData, setQuickServiceData] = useState({ date: '', type: 'Monta Natural' });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: initialValues || { sex: 'Macho' }
  });

  const selectedSex = watch('sex');
  const fatherId = watch('father_id');
  const motherId = watch('mother_id');

  const motherServices = useLiveQuery(
    () => motherId ? db.services.where('mother_id').equals(motherId).and(s => !s.deleted_at).toArray() : [],
    [motherId]
  );

  const toggleAccordion = (section) => {
    setActiveAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImageCapture = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBlob = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressedBlob);
      setImages(prev => ({ ...prev, [type]: { blob: compressedBlob, preview: previewUrl } }));
    } catch (error) {
      console.error('Error procesando imagen:', error);
      alert('Error al comprimir la foto.');
    }
  };

  const removeImage = (type) => {
    setImages(prev => ({ ...prev, [type]: { blob: null, preview: null } }));
  };

  // --- CORRECCIÓN OFFLINE: CREADOR RÁPIDO DE SERVICIO ---
  const handleQuickServiceCreate = async () => {
    if (!quickServiceData.date) return alert('Selecciona una fecha para el servicio');
    if (isSavingQuickService) return; 
    
    setIsSavingQuickService(true);
    
    try {
      // USAMOS getSession() EN LUGAR DE getUser() PARA MODO OFFLINE
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        alert('No hay sesión activa en el teléfono. Por favor, inicia sesión.');
        router.push('/login');
        return;
      }

      const newService = {
        id: crypto.randomUUID(),
        user_id: user.id,
        mother_id: motherId,
        type_conception: quickServiceData.type,
        service_date: quickServiceData.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await db.transaction('rw', [db.services, db.sync_queue], async () => {
        await db.services.add(newService);
        await addToSyncQueue('services', 'INSERT', newService);
      });
      
      setValue('origin_service_id', newService.id);
      setShowQuickService(false);
    } catch (err) {
      console.error('Error creando servicio rápido', err);
    } finally {
      setIsSavingQuickService(false);
    }
  };

  // --- CORRECCIÓN OFFLINE: GUARDADO MAESTRO ---
  const handleSave = async (data) => {
    try {
      // USAMOS getSession() EN LUGAR DE getUser() PARA MODO OFFLINE
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        alert('No hay sesión activa en el teléfono. Por favor, inicia sesión.');
        router.push('/login');
        return;
      }

      const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
      const animalId = crypto.randomUUID();
      const now = new Date().toISOString();

      const processImage = async (blob, prefix) => {
        if (!blob) return { url: null, blob: null };
        let url = null;
        if (isOnline) {
          try {
            url = await uploadImageToSupabase(blob, `${prefix}-${Date.now()}`);
          } catch (e) {
            console.error('Fallo subida, guardando local', e);
          }
        }
        return { url, blob };
      };

      const mainImg = await processImage(images.main.blob, `animal-${data.number}`);
      const birthImg = await processImage(images.birth.blob, `birth-${data.number}`);
      const weaningImg = await processImage(images.weaning.blob, `weaning-${data.number}`);

      await db.transaction('rw', [db.animals, db.growth_events, db.sync_queue], async () => {
        const animalData = {
          id: animalId,
          user_id: user.id,
          number: data.number,
          sex: data.sex,
          status: 'Activo',
          color: data.color || null,
          birth_date: data.birth_date || null,
          mother_id: data.mother_id || null,
          father_id: data.father_id || null,
          origin_service_id: data.origin_service_id || null,
          observations: data.observations || null,
          photo_path: mainImg.url,
          photo_blob: mainImg.blob,
          last_weight_kg: data.current_weight_kg || data.weaning_weight_kg || data.birth_weight_kg || null,
          last_weight_date: data.current_weight_kg ? now : (data.weaning_weight_kg ? data.weaning_date : (data.birth_weight_kg ? data.birth_date : null)),
          created_at: now,
          updated_at: now,
          deleted_at: null
        };
        await db.animals.add(animalData);
        await addToSyncQueue('animals', 'INSERT', animalData);

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
            photo_path: birthImg.url,
            photo_blob: birthImg.blob,
            created_at: now,
            updated_at: now
          };
          await db.growth_events.add(birthEvent);
          await addToSyncQueue('growth_events', 'INSERT', birthEvent);
        }

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
            photo_path: weaningImg.url,
            photo_blob: weaningImg.blob,
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

      {/* 0. IDENTIFICACIÓN VISUAL */}
      <section className="bg-[#F4F5F0] rounded-3xl p-5 mb-4 shadow-sm border border-neutral-100/50">
        <div className="mb-5">
          <ImageUploader id="main" label="Foto del Animal" preview={images.main.preview} onCapture={(e) => handleImageCapture(e, 'main')} onRemove={() => removeImage('main')} />
        </div>
        <div className="mb-2">
          <label className="text-sm font-bold text-[#1B4820] mb-2 block">Descripción Breve</label>
          <textarea {...register('observations')} placeholder="Añade una descripción visual del animal..." rows={3} className="w-full bg-white rounded-2xl px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 border border-transparent focus:border-[#1B4820]/30 transition-all shadow-sm resize-none" />
        </div>
      </section>

      {/* 1. IDENTIFICACIÓN BÁSICA */}
      <section className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Identificación Básica</label>
        <div className="mb-4">
          <input {...register('number')} placeholder="Código / Número *" className={`w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 ${errors.number ? 'border-red-500' : 'border-neutral-100 focus:border-[#1B4820]/30'}`} />
          {errors.number && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.number.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button type="button" onClick={() => setValue('sex', 'Macho')} className={`py-3 rounded-xl font-bold text-sm transition-all border ${selectedSex === 'Macho' ? 'bg-[#1B4820] text-white border-[#1B4820]' : 'bg-white text-neutral-500 border-neutral-100'}`}>MACHO</button>
          <button type="button" onClick={() => setValue('sex', 'Hembra')} className={`py-3 rounded-xl font-bold text-sm transition-all border ${selectedSex === 'Hembra' ? 'bg-[#1B4820] text-white border-[#1B4820]' : 'bg-white text-neutral-500 border-neutral-100'}`}>HEMBRA</button>
        </div>
        <input {...register('color')} placeholder="Color (Ej: Rojo Suave)" className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 placeholder-neutral-400 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20" />
      </section>

      {/* GENEALOGÍA */}
      <section className="bg-neutral-100/50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full bg-[#8C6746]"></div>
          <h3 className="text-lg font-bold text-[#1B4820]">Genealogía</h3>
        </div>
        <GenealogySelector label="Padre (Toro)" sex="Macho" value={fatherId} onChange={(id) => setValue('father_id', id)} onCreateNew={(sex) => onOpenModal && onOpenModal(sex, (id) => setValue('father_id', id))} />
        <GenealogySelector label="Madre (Vaca)" sex="Hembra" value={motherId} onChange={(id) => setValue('mother_id', id)} onCreateNew={(sex) => onOpenModal && onOpenModal(sex, (id) => setValue('mother_id', id))} />
      </section>

      {/* ACORDEÓN: SERVICIO DE ORIGEN */}
      {motherId && (
        <div className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('service')}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-blue-500"></div>
              <h3 className="text-lg font-bold text-[#1B4820]">Servicio de Origen</h3>
            </div>
            {activeAccordions.service ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${activeAccordions.service ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="pt-5 space-y-4">
                {motherServices === undefined ? (
                  <p className="text-sm text-neutral-500">Cargando servicios...</p>
                ) : showQuickService ? (
                  <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-[#1B4820] tracking-widest border-b border-neutral-100 pb-2">Nuevo Servicio Rápido</h4>
                    
                    <input type="date" value={quickServiceData.date} onChange={e => setQuickServiceData(d => ({...d, date: e.target.value}))} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
                    
                    <div className="relative">
                      <select value={quickServiceData.type} onChange={e => setQuickServiceData(d => ({...d, type: e.target.value}))} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all">
                        <option>Monta Natural</option>
                        <option>Inseminación Artificial</option>
                        <option>Transferencia de Embriones</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" disabled={isSavingQuickService} onClick={() => setShowQuickService(false)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold py-3.5 rounded-xl transition-colors">Cancelar</button>
                      <button type="button" disabled={isSavingQuickService} onClick={handleQuickServiceCreate} className="flex-1 bg-[#1B4820] hover:bg-[#0F2912] text-white text-xs font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors shadow-sm">
                        {isSavingQuickService ? 'Guardando...' : 'Guardar y Usar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {motherServices.length === 0 ? (
                      <div className="text-center bg-white border border-neutral-100 p-4 rounded-2xl">
                        <p className="text-xs text-neutral-500 mb-2 font-medium">Esta madre no tiene servicios registrados.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <select {...register('origin_service_id')} className="w-full bg-white rounded-2xl px-4 py-4 text-neutral-800 border border-neutral-200 outline-none font-medium appearance-none shadow-sm focus:ring-2 focus:ring-[#1B4820]/20 transition-all">
                          <option value="">Selecciona el servicio origen...</option>
                          {motherServices.map(s => (
                            <option key={s.id} value={s.id}>{s.service_date} - {s.type_conception}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-5 h-5 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                    
                    <button type="button" onClick={() => setShowQuickService(true)} className="w-full flex items-center justify-center gap-2 bg-neutral-50 border border-dashed border-neutral-300 hover:border-[#1B4820] hover:text-[#1B4820] hover:bg-emerald-50 text-neutral-600 font-bold py-3.5 rounded-xl transition-all text-xs">
                      <Plus className="w-4 h-4" />
                      REGISTRAR NUEVO SERVICIO
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACORDEÓN: NACIMIENTO */}
      <div className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('birth')}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-emerald-600"></div>
            <h3 className="text-lg font-bold text-[#1B4820]">Evento: Nacimiento</h3>
          </div>
          {activeAccordions.birth ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
        </div>
        <div className={`grid transition-all duration-300 ease-in-out ${activeAccordions.birth ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="pt-5 space-y-4">
              <ImageUploader id="birth" label="Foto al Nacer" preview={images.birth.preview} onCapture={(e) => handleImageCapture(e, 'birth')} onRemove={() => removeImage('birth')} />
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Fecha de Nacimiento</label>
                <input type="date" {...register('birth_date')} className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              </div>
              <input type="number" step="any" {...register('birth_weight_kg')} placeholder="Peso Cría (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <input type="number" step="any" {...register('mother_weight_at_birth')} placeholder="Peso Madre al Parto (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <input {...register('navel_length')} placeholder="Longitud Ombligo" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <textarea {...register('birth_observations')} placeholder="Observaciones del parto..." rows={2} className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none resize-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* ACORDEÓN: DESTETE */}
      <div className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('weaning')}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-amber-600"></div>
            <h3 className="text-lg font-bold text-[#1B4820]">Evento: Destete</h3>
          </div>
          {activeAccordions.weaning ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
        </div>
        <div className={`grid transition-all duration-300 ease-in-out ${activeAccordions.weaning ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="pt-5 space-y-4">
              <ImageUploader id="weaning" label="Foto al Destete" preview={images.weaning.preview} onCapture={(e) => handleImageCapture(e, 'weaning')} onRemove={() => removeImage('weaning')} />
              <input type="date" {...register('weaning_date')} className="w-full bg-white rounded-xl px-4 py-3 text-neutral-800 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <input type="number" step="any" {...register('weaning_weight_kg')} placeholder="Peso al Destete (KG)" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <input type="number" step="any" {...register('mother_weight_at_weaning')} placeholder="Peso Madre al Destete" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
              <textarea {...register('weaning_observations')} placeholder="Observaciones del destete..." rows={2} className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none resize-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* MEDIDAS ACTUALES */}
      <section className="bg-neutral-50 rounded-3xl p-5 mb-4 border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full bg-[#1B4820]"></div>
          <h3 className="text-lg font-bold text-[#1B4820]">Medidas y Pesos Actuales</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Peso Actual (KG)</label>
            <input type="number" step="any" {...register('current_weight_kg')} placeholder="0.00" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Circ. Escrotal (CM)</label>
            <input type="number" step="any" {...register('current_sc_cm')} placeholder="0.00" className="w-full bg-white rounded-xl px-4 py-3 border border-neutral-100 outline-none focus:ring-2 focus:ring-[#1B4820]/20 transition-all" />
          </div>
        </div>
      </section>

      {/* FOOTERS */}
      {!isModal && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-neutral-100 p-3 z-40">
          <div className="max-w-2xl mx-auto flex gap-4">
            <button type="button" onClick={onCancel} className="flex-1 bg-[#D15555] hover:bg-[#B94545] text-white font-bold py-2 rounded-full shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1">
              <X className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-[10px] tracking-widest">CANCELAR</span>
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#0F2912] hover:bg-[#1B4820] text-white font-bold py-2 rounded-full shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1">
              {isSubmitting ? (
                <span className="text-[10px] py-4">GUARDANDO...</span>
              ) : (
                <><Save className="w-6 h-6" strokeWidth={2.5} /><span className="text-[10px] tracking-widest uppercase">GUARDAR</span></>
              )}
            </button>
          </div>
        </div>
      )}

      {isModal && (
        <div className="flex gap-4 mt-8">
          <button type="button" onClick={onCancel} className="flex-1 bg-[#D15555] text-white font-bold py-3 rounded-full flex flex-col items-center justify-center gap-1">
            <X className="w-5 h-5" /><span className="text-[10px] tracking-widest">CANCELAR</span>
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#0F2912] text-white font-bold py-3 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg">
            <Save className="w-5 h-5" /><span className="text-[10px] tracking-widest uppercase">GUARDAR</span>
          </button>
        </div>
      )}
    </form>
  );
}