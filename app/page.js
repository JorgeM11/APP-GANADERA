import { redirect } from "next/navigation";

/**
 * Ruta raíz /
 * Redirige siempre al login. No hay contenido aquí.
 * En el futuro, cuando exista lógica de sesión, este componente
 * podrá verificar si hay sesión activa y redirigir a /inventario directo.
 */
export default function RootPage() {
  redirect("/login");
}
