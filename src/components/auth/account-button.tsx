"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

/** Avatar da conta (ou "Entrar"). Some quando o login não está configurado. */
export function AccountButton() {
  const { configured, loading, session, profile } = useAuth();
  if (!configured || loading) return null;
  if (!session) {
    return (
      <Link href="/entrar" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-electric px-3.5 text-sm font-semibold text-white hover:bg-electric-hi">
        <LogIn aria-hidden className="size-4" /> Entrar
      </Link>
    );
  }
  const name = profile?.displayName || session.user.email?.split("@")[0] || "Você";
  return (
    <Link href="/perfil" className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong bg-panel-2 hover:border-electric" aria-label={`Seu perfil: ${name}`}>
      {profile?.avatarUrl ? (
        // Foto do Google: imagem externa simples (o site é estático, sem otimização de imagens).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" width={40} height={40} referrerPolicy="no-referrer" className="size-full object-cover" />
      ) : (
        <span aria-hidden className="font-semibold">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </Link>
  );
}
