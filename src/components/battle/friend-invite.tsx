"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Link2, UserPlus, X } from "lucide-react";
import { LANG_INFO, type BattleLang } from "@battle/battle-core.ts";
import { Alert, Button } from "@/components/ui/primitives";
import { errorText, inviteAccept, inviteCancel, inviteCreate, inviteMine, invitePeek, type InvitePeek, type MyInvite } from "@/lib/battle/api";

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Desafiar um amigo: gera um código de 8 caracteres (vale 15 minutos) ou entra com o código
 * recebido. A partida é amistosa: mesma correção no servidor, mas sem troféus.
 */
export function FriendInvite({ lang, initialCode, onMatch }: { lang: BattleLang; initialCode: string | null; onMatch: (matchId: string) => void }) {
  const [mine, setMine] = useState<MyInvite | null>(null);
  const [code, setCode] = useState(initialCode ?? "");
  const [peek, setPeek] = useState<InvitePeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const autoPeeked = useRef(false);

  // Retoma um convite aberto (ao recarregar a página) e acompanha até o amigo entrar.
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const tick = async () => {
      try {
        const m = await inviteMine();
        if (!alive) return;
        if (m?.status === "aceito" && m.match_id) {
          onMatch(m.match_id);
          return;
        }
        setMine(m && m.status === "aberto" ? m : null);
      } catch {
        /* sem conexão: tenta de novo */
      }
      if (alive) timer = window.setTimeout(tick, 2500);
    };
    tick();
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, [onMatch]);

  async function lookUp(value: string) {
    const c = value.trim().toUpperCase();
    setPeek(null);
    setError(null);
    if (!/^[A-HJ-NP-Z2-9]{8}$/.test(c)) {
      setError("O código tem 8 letras e números (sem 0, O, 1 ou I).");
      return;
    }
    try {
      setPeek(await invitePeek(c));
    } catch (e) {
      setError(errorText(e, "Não foi possível conferir o código."));
    }
  }

  useEffect(() => {
    if (initialCode && !autoPeeked.current) {
      autoPeeked.current = true;
      lookUp(initialCode);
    }
  }, [initialCode]);

  const link = mine ? `${window.location.origin}${window.location.pathname}?convite=${mine.code}` : "";
  const left = mine ? new Date(mine.expires_at).getTime() - now : 0;

  return (
    <section aria-labelledby="amigo" className="rounded-[var(--radius-lg)] border border-line p-5">
      <h2 id="amigo" className="flex items-center gap-2 font-semibold">
        <UserPlus aria-hidden className="size-4 text-electric-hi" /> Desafiar um amigo
      </h2>
      <p className="mt-1 text-sm text-muted">Partida amistosa: mesmo problema e mesma correção no servidor, mas não vale troféus.</p>
      {error && <Alert tone="error" title={error} className="mt-3" />}

      {mine && left > 0 ? (
        <div className="mt-4 space-y-3" role="status" aria-live="polite">
          <p className="text-sm">Envie o código ou o link para quem você quer desafiar:</p>
          <p className="font-mono text-3xl font-black tracking-[0.2em] text-amber">{mine.code}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  setError("Não deu para copiar. Selecione o código e copie à mão.");
                }
              }}
            >
              <Copy aria-hidden className="size-4" /> {copied ? "Link copiado" : "Copiar link"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await inviteCancel().catch(() => undefined);
                setMine(null);
              }}
            >
              <X aria-hidden className="size-4" /> Cancelar convite
            </Button>
          </div>
          <p className="font-mono text-xs text-muted">Esperando o amigo entrar · expira em {fmt(left)}</p>
        </div>
      ) : (
        <Button
          className="mt-4 w-full"
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              setMine(await inviteCreate(lang));
            } catch (e) {
              setError(errorText(e, "Não foi possível criar o convite."));
            }
            setBusy(false);
          }}
        >
          <Link2 aria-hidden className="size-4" /> Criar convite em {LANG_INFO[lang].label}
        </Button>
      )}

      <form
        className="mt-5 border-t border-line pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          lookUp(code);
        }}
      >
        <label htmlFor="codigo-convite" className="text-sm font-semibold">
          Recebeu um código?
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="codigo-convite"
            value={code}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setPeek(null);
            }}
            placeholder="EX.: K7Q2M9TA"
            className="min-h-11 w-full rounded-md border border-line-strong bg-ink px-3 font-mono uppercase tracking-widest focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
          />
          <Button type="submit" variant="secondary">
            Conferir
          </Button>
        </div>
      </form>

      {peek && (
        <div className="mt-3 text-sm" aria-live="polite">
          {peek.status === "aberto" && !peek.mine ? (
            <div className="space-y-2">
              <p>
                <strong>{peek.host_name}</strong> desafiou você ({peek.host_lang ? LANG_INFO[peek.host_lang].label : ""}). Você vai jogar em <strong>{LANG_INFO[lang].label}</strong>.
              </p>
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await inviteAccept(code, lang);
                    if (r.ok && r.match_id) onMatch(r.match_id);
                    else setError(r.error ?? "Não foi possível entrar.");
                  } catch (e) {
                    setError(errorText(e, "Não foi possível entrar."));
                  }
                  setBusy(false);
                }}
              >
                Aceitar e entrar na sala
              </Button>
            </div>
          ) : (
            <p className="text-muted">
              {peek.mine
                ? "Este convite é seu: envie o código para outra pessoa."
                : peek.status === "expirado"
                  ? "Este convite expirou. Peça um novo."
                  : peek.status === "usado"
                    ? "Este convite já foi usado."
                    : peek.status === "cancelado"
                      ? "Este convite foi cancelado."
                      : "Convite não encontrado. Confira o código."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
