"use client";

import Link from "next/link";
import { useState } from "react";
import { CloudOff, LogIn, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { Alert, Button, cx } from "@/components/ui/primitives";

const SYNC_LABEL = {
  idle: "Aguardando",
  syncing: "Sincronizando…",
  synced: "Progresso salvo na conta",
  error: "Não foi possível sincronizar agora",
} as const;

export function AccountSection() {
  const { configured, loading, session, profile, syncStatus, serverXp, syncNow, signOut, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState(false);

  if (!configured || loading) return null;

  if (!session) {
    return (
      <section id="conta" aria-labelledby="conta-titulo" className="scroll-mt-24 rounded-[var(--radius-lg)] border border-electric/40 bg-electric/[0.06] p-6">
        <h2 id="conta-titulo" className="text-xl font-semibold">
          Seu XP ainda não conta no ranking
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Entre com o Google para levar este progresso para a sua conta, entrar no ranking e na liga da semana.</p>
        <Link href="/entrar" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-electric px-4 font-semibold text-white hover:bg-electric-hi">
          <LogIn aria-hidden className="size-4" /> Entrar com Google
        </Link>
      </section>
    );
  }

  const currentName = name ?? profile?.displayName ?? "";

  return (
    <section id="conta" aria-labelledby="conta-titulo" className="scroll-mt-24 rounded-[var(--radius-lg)] border border-line p-6">
      <h2 id="conta-titulo" className="text-xl font-semibold">
        Sua conta
      </h2>
      <p className="mt-1 text-sm text-muted">{session.user.email}</p>

      <p className={cx("mt-4 inline-flex items-center gap-2 text-sm", syncStatus === "error" ? "text-bad" : "text-muted")} aria-live="polite">
        {syncStatus === "error" ? <CloudOff aria-hidden className="size-4" /> : <RefreshCw aria-hidden className={cx("size-4", syncStatus === "syncing" && "animate-spin")} />}
        {SYNC_LABEL[syncStatus]}
        {serverXp !== null && syncStatus === "synced" && <span className="font-mono text-amber"> · {serverXp} XP no ranking</span>}
      </p>
      {syncStatus === "error" && (
        <Button variant="ghost" size="sm" className="ml-2" onClick={() => syncNow()}>
          Tentar de novo
        </Button>
      )}

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          const trimmed = currentName.trim();
          if (trimmed.length < 2 || trimmed.length > 40) {
            setMessage({ tone: "error", text: "O nome precisa ter entre 2 e 40 caracteres." });
            return;
          }
          const ok = await updateProfile({ displayName: trimmed });
          setMessage(ok ? { tone: "success", text: "Nome atualizado." } : { tone: "error", text: "Não foi possível salvar o nome." });
        }}
      >
        <div className="flex-1">
          <label htmlFor="nome-ranking" className="block text-sm font-medium">
            Nome no ranking
          </label>
          <input
            id="nome-ranking"
            value={currentName}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-ink px-3 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
        <Button type="submit" variant="secondary">
          Salvar nome
        </Button>
      </form>

      <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[#3d7bff]"
          checked={profile?.showInRanking ?? true}
          onChange={async (e) => {
            const ok = await updateProfile({ showInRanking: e.target.checked });
            if (!ok) setMessage({ tone: "error", text: "Não foi possível salvar a preferência." });
          }}
        />
        Aparecer no ranking público
      </label>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
        <Button
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await signOut();
            setBusy(false);
            if (!ok) setMessage({ tone: "error", text: "Não foi possível salvar seu progresso antes de sair. Verifique a conexão e tente de novo." });
          }}
        >
          <LogOut aria-hidden className="size-4" /> Sair da conta
        </Button>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-bad">Apagar minha conta</summary>
        <div className="mt-3 space-y-3 text-sm">
          <p className="text-muted">Apaga sua conta, seu XP, sua posição no ranking e o progresso salvo na conta. Não dá para desfazer.</p>
          <label htmlFor="confirmar-exclusao" className="block">
            Digite APAGAR para confirmar
          </label>
          <input
            id="confirmar-exclusao"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            className="min-h-11 w-full max-w-xs rounded-md border border-bad/50 bg-ink px-3"
          />
          <Button
            variant="danger"
            disabled={confirmDelete !== "APAGAR" || busy}
            onClick={async () => {
              setBusy(true);
              const ok = await deleteAccount();
              setBusy(false);
              setMessage(ok ? { tone: "success", text: "Conta apagada." } : { tone: "error", text: "Não foi possível apagar a conta agora." });
            }}
          >
            <Trash2 aria-hidden className="size-4" /> Apagar conta definitivamente
          </Button>
        </div>
      </details>

      {message && (
        <Alert tone={message.tone} className="mt-4">
          {message.text}
        </Alert>
      )}
    </section>
  );
}
