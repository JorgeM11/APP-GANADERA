"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Token válido → va directo al inventario
        localStorage.setItem("ganadera_offline_session", "true");
        router.replace("/inventario");
      } else if (!navigator.onLine) {
        // Sin internet → revisa pase VIP local
        const paseVip = localStorage.getItem("ganadera_offline_session");
        router.replace(paseVip === "true" ? "/inventario" : "/login");
      } else {
        // Online pero sin sesión → necesita login
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#F0F2EB]">
      <div className="w-10 h-10 border-4 border-[#1B4820]/20 border-t-[#1B4820] rounded-full animate-spin"></div>
    </div>
  );
}
