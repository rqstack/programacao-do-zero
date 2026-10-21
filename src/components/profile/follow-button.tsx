"use client";

import Link from "next/link";
import { useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { setFollow } from "@/lib/profiles/api";
import { Button } from "@/components/ui/primitives";

/** "Adicionar" / "Adicionado": seguir alguém. Sem login, leva para a tela de entrar. */
export function FollowButton({ username, initial, onChange, size = "sm" }: { username: string; initial: boolean; onChange?: (following: boolean) => void; size?: "sm" | "md" }) {
  const { session } = useAuth();
  const [following, setFollowing] = useState(initial);
  const [busy, setBusy] = useState(false);
  if (!session) {
    return (
      <Link href="/entrar" className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong px-3 text-sm font-semibold hover:border-electric">
        <UserPlus aria-hidden className="size-4" /> Entrar para adicionar
      </Link>
    );
  }
  return (
    <Button
      size={size}
      variant={following ? "secondary" : "primary"}
      disabled={busy}
      aria-pressed={following}
      onClick={async () => {
        setBusy(true);
        const ok = await setFollow(username, !following);
        setBusy(false);
        if (ok) {
          setFollowing(!following);
          onChange?.(!following);
        }
      }}
    >
      {following ? <UserCheck aria-hidden className="size-4" /> : <UserPlus aria-hidden className="size-4" />}
      {following ? "Adicionado" : "Adicionar"}
    </Button>
  );
}
