"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tractor, ArrowRight } from "lucide-react";
import InputField from "../../components/ui/InputField";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { supabase } from "@/lib/supabaseClient";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setServerError(null);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.session) {
        // El Refresh Token ya quedó guardado en localStorage automáticamente.
        // El ganadero no necesitará volver a loguearse, incluso offline.
        router.push("/inventario");
      }
    } catch (error) {
      const msg = error?.message || "";
      if (msg === "Failed to fetch") {
        setServerError("Necesitas conexión a internet para iniciar sesión por primera vez.");
      } else {
        setServerError("Correo o contraseña incorrectos. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mobile-shell-wrapper">
      <div className="mobile-shell bg-surface-container-low">
        {/* Contenido principal */}
        <div className="flex flex-col items-center pt-[clamp(56px,12vh,80px)] px-6 pb-10">

          {/* ─── BRANDING ─── */}
          <div className="flex flex-col items-center gap-[14px] mb-10">
            {/* Squircle con ícono tractor */}
            <div className="w-[80px] h-[80px] rounded-3xl bg-primary-container flex items-center justify-center">
              <Tractor size={44} strokeWidth={1.5} className="text-primary-fixed" />
            </div>

            {/* Título */}
            <h1 className="font-display text-4xl font-bold text-on-surface tracking-[-0.02em] leading-tight m-0 text-center">
              Inicio de Sesión
            </h1>

            {/* Subtítulo uppercase */}
            <p className="font-sans text-[0.6875rem] font-medium text-outline tracking-[0.16em] uppercase m-0 text-center">
              Gestión Ganadera de Precisión
            </p>
          </div>

          {/* ─── CARD DEL FORMULARIO ─── */}
          <div className="w-full bg-surface-container-low rounded-[28px] p-7">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">

              {/* Campo: Correo Electrónico */}
              <div className="mb-5">
                <InputField
                  id="login-email"
                  label="Correo Electrónico"
                  type="email"
                  placeholder="nombre@campo.com"
                  autoComplete="email"
                  registration={register("email")}
                  error={errors.email?.message}
                />
              </div>

              {/* Fila: Label Contraseña + ¿Olvidaste? */}
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="font-sans text-sm font-medium text-on-surface-variant"
                >
                  Contraseña
                </label>

              </div>

              {/* Campo: Contraseña */}
              <div className="mb-7">
                <InputField
                  id="login-password"
                  label=""
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  registration={register("password")}
                  error={errors.password?.message}
                />
              </div>

              {/* Error de servidor */}
              {serverError && (
                <div
                  role="alert"
                  className="bg-error-container rounded-xl py-3 px-4 font-sans text-sm text-on-error-container mb-4 leading-relaxed"
                >
                  {serverError}
                </div>
              )}

              {/* Botón CTA */}
              <PrimaryButton type="submit" isLoading={isLoading} fullWidth={true}>
                Iniciar Sesión
                <ArrowRight size={20} strokeWidth={2.5} />
              </PrimaryButton>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
