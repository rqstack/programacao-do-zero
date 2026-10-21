"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { Alert, Button, Spinner } from "@/components/ui/primitives";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function SignInPanel() {
  const { configured, loading, session, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voltou do Google já autenticado: segue para o progresso.
  useEffect(() => {
    if (session) router.replace("/progresso");
  }, [session, router]);

  if (!configured) {
    return (
      <Alert tone="warning" title="Login ainda não configurado">
        Esta cópia do site ainda não foi ligada a um projeto Supabase. Enquanto isso, seu progresso fica salvo só neste navegador. Veja o guia em
        docs/CONFIGURACAO.md no repositório.
      </Alert>
    );
  }
  if (loading || session) return <Spinner label="Verificando sua sessão" />;

  return (
    <div className="space-y-6">
      <Button
        size="lg"
        className="w-full bg-white text-ink hover:bg-[#e8eefb] sm:w-auto"
        disabled={starting}
        onClick={async () => {
          setStarting(true);
          setError(null);
          try {
            await signInWithGoogle();
          } catch {
            setError("Não foi possível abrir o login do Google. Verifique sua conexão e tente de novo.");
            setStarting(false);
          }
        }}
      >
        <GoogleIcon /> {starting ? "Abrindo o Google…" : "Entrar com Google"}
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
      <ul className="space-y-2 text-sm text-muted">
        <li className="flex gap-2">
          <Trophy aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" /> Seu XP passa a contar no ranking e na liga da semana.
        </li>
        <li>O progresso que você já tem neste navegador é levado para a conta automaticamente.</li>
        <li>Usamos só seu nome e foto do Google. Você pode mudar o nome, sair do ranking ou apagar a conta quando quiser.</li>
      </ul>
      <p className="text-xs text-subtle">
        Ao entrar, você concorda com o uso descrito na{" "}
        <Link href="/sobre#privacidade" className="underline">
          página de privacidade
        </Link>
        .
      </p>
    </div>
  );
}
