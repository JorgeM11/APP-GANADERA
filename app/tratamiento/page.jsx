"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Briefcase,
  Syringe,
  Bug,
  Droplets,
  FlaskConical,
  Save,
  X
} from "lucide-react";
import InputField from "../components/ui/InputField";
import ProductTypeCard from "../components/ui/ProductTypeCard";
import ActionButton from "../components/ui/ActionButton";

const tratamientoSchema = z.object({
  productName: z.string().min(1, "El nombre del producto es requerido"),
  dose: z.string().min(1, "La dosis es requerida"),
  applicationDate: z.string().min(1, "La fecha de aplicación es requerida"),
});

export default function TratamientoPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("vacuna");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tratamientoSchema),
    defaultValues: {
      productName: "",
      dose: "",
      applicationDate: "",
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      productType: selectedType,
    };
    console.log("[Terra Form] Registro de Tratamiento:", payload);
    // TODO: Integrar con Dexie.js / Supabase
    router.back();
  };

  return (
    <main className="min-h-screen bg-surface-container-low font-sans pb-8 sm:pb-16">
      {/* Top App Bar - Dashboard Constraint */}
      <div className="sticky top-0 bg-surface-container-low/95 backdrop-blur-sm z-20">
        <header className="flex items-center gap-3 px-5 pt-6 pb-2 max-w-6xl mx-auto sm:pt-8 sm:pb-4 sm:px-8">
          <Link
            href="/inventario"
            className="p-1 -ml-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} className="text-on-surface" strokeWidth={2} />
          </Link>
          <h2 className="font-sans text-lg font-semibold text-on-surface">
            Registros de Salud
          </h2>
        </header>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-6xl mx-auto sm:px-8">

        {/* Hero Section */}
        <section className="px-5 mt-6 mb-8 sm:px-0 sm:mt-4 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} strokeWidth={2.5} className="text-primary" />
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
              GESTIÓN GANADERA
            </span>
          </div>

          <span className="font-display text-[2.5rem] sm:text-5xl leading-[1.05] font-extrabold text-primary mb-3 block">
            Registrar<br className="sm:hidden" /> Tratamiento
          </span>

          <p className="font-sans text-base font-medium text-on-surface-variant leading-relaxed max-w-[360px] sm:max-w-2xl mt-4">
            Ingrese los detalles del protocolo médico para actualizar el historial del ejemplar.
            Registrar información veraz ayuda al control total de la rentabilidad y calidad.
          </p>
        </section>

        {/* Dashboard Form Layout */}
        <section className="px-5 space-y-6 sm:px-0 sm:space-y-10">

          {/* Tipo de Producto (Grid de Tarjetas 1 Fila en Desktop) */}
          <div>
            <p className="font-sans text-[0.9375rem] sm:text-lg font-semibold text-on-surface mb-3 sm:mb-4">
              Tipo de Producto
            </p>
            {/* sm:grid-cols-4 forzando la fila única. Además sm:min-h-[120px] o clases en ProductTypeCard para hacerlas robustas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className=" flex flex-col">
                <ProductTypeCard
                  icon={Syringe}
                  label="Vacuna"
                  isSelected={selectedType === "vacuna"}
                  onClick={() => setSelectedType("vacuna")}
                />
              </div>
              <div className=" flex flex-col">
                <ProductTypeCard
                  icon={Bug}
                  label="Desparasitante"
                  isSelected={selectedType === "desparasitante"}
                  onClick={() => setSelectedType("desparasitante")}
                />
              </div>
              <div className=" flex flex-col">
                <ProductTypeCard
                  icon={Droplets}
                  label="Vitamina"
                  isSelected={selectedType === "vitamina"}
                  onClick={() => setSelectedType("vitamina")}
                />
              </div>
              <div className=" flex flex-col">
                <ProductTypeCard
                  icon={FlaskConical}
                  label="Antibiótico"
                  isSelected={selectedType === "antibiotico"}
                  onClick={() => setSelectedType("antibiotico")}
                />
              </div>
            </div>
          </div>

          {/* Bloque de Entradas: Nombre + Dosis + Fecha agrupados */}
          <div className="space-y-6 sm:space-y-8">

            {/* Inputs grid 2 columnas en desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Nombre del Producto */}
              <div>
                <InputField
                  id="productName"
                  label="Nombre del Producto"
                  placeholder="Ej. Ivermectina 1%"
                  registration={register("productName")}
                  error={errors.productName?.message}
                />
              </div>

              {/* Dosis */}
              <div>
                <InputField
                  id="dose"
                  label="Dosis"
                  placeholder="Ej. 10 ml"
                  rightIcon={FlaskConical}
                  registration={register("dose")}
                  error={errors.dose?.message}
                />
              </div>
            </div>

            {/* Tarjeta Fecha de Aplicación - Abarcando el ancho total abajo */}
            <div className="relative overflow-hidden bg-[#eaf4e7] rounded-3xl border-l-[8px] border-primary p-5 shadow-sm sm:px-8 sm:py-6">
              <div className="absolute -right-4 -top-4 w-32 h-32 rounded-3xl bg-primary/5 rotate-12 pointer-events-none" />
              <div className="absolute right-12 top-10 w-16 h-16 rounded-full bg-primary/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-sans text-[1.0625rem] sm:text-[1.3rem] font-bold text-on-surface tracking-tight">
                      Fecha de Aplicación
                    </span>
                    <span className="text-error font-extrabold text-lg sm:text-xl leading-none mt-1">*</span>
                  </div>

                  <p className="font-sans text-[0.8125rem] sm:text-[0.9375rem] text-on-surface-variant mt-1 mb-5 sm:mb-0 max-w-[240px] sm:max-w-md">
                    Registrar la fecha exacta para el control de periodos de carencia.
                  </p>
                </div>

                <div className="relative group sm:w-1/2">
                  <input
                    id="applicationDate"
                    type="date"
                    className={`w-full bg-surface-container-lowest rounded-full py-3.5 sm:py-5 px-6 sm:px-8 font-sans font-bold text-on-surface outline-none transition-all
                      ${errors.applicationDate ? "ring-2 ring-error" : "ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary shadow-sm"}`}
                    {...register("applicationDate")}
                  />

                  {errors.applicationDate && (
                    <p className="font-sans text-[0.8125rem] text-error mt-2 ml-2 absolute">
                      {errors.applicationDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* Action Bar Inferior - Centrado en Desktop para que no se estiren inmensamente */}
        <section className="flex gap-4 px-5 pt-10 pb-8 sm:px-0 sm:mt-4 sm:justify-center">
          <div className="flex w-full sm:max-w-lg gap-4">
            <ActionButton
              variant="danger"
              icon={X}
              label="CANCELAR"
              onClick={() => router.back()}
            />
            <ActionButton
              variant="primary"
              icon={Save}
              label="GUARDAR"
              type="submit"
            />
          </div>
        </section>
      </form>
    </main>
  );
}
