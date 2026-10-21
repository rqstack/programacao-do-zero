"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Lock, Swords, Trophy, X } from "lucide-react";
import { arenaFor, ARENAS, BATTLE_LANGS, BATTLE_RULES, LANG_INFO, type BattleLang } from "@battle/battle-core.ts";
import { useAuth } from "@/lib/auth/auth-provider";
import { battleMe, joinQueue, leaveQueue, type BattleMe } from "@/lib/battle/api";
import { Alert, Button, cx, EmptyState, Spinner } from "@/components/ui/primitives";
import { BattleRoom } from "./battle-room";
import { BattleHistory, BattleLeaderboard } from "./battle-boards";

const LANG_KEY = "pdz-batalha-linguagem";
const LANG_BADGE: Record<BattleLang, { badge: string; color: string }> = {
  javascript: { badge: "JS", color: "bg-[#f7df1e] text-[#1a1a1a]" },
  python: { badge: "PY", color: "bg-[#ffd43b] text-[#1f3b57]" },
  java: { badge: "JV", color: "bg-[#e76f00] text-white" },
  c: { badge: "C", color: "bg-[#5c6bc0] text-white" },
};

type View = { kind: "lobby" } | { kind: "fila"; since: number } | { kind: "partida"; matchId: string };

export function BattleHub() {
  const { configured, loading, session } = useAuth();
  const [me, setMe] = useState<BattleMe | null>(null);
  const [view, setView] = useState<View>({ kind: "lobby" });
  const [lang, setLang] = useState<BattleLang>("python");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"arenas" | "ranking" | "historico">("arenas");

  const refresh = useCallback(async () => {
    try {
      const m = await battleMe();
      setMe(m);
      // Reconexão: se a pessoa tem uma partida ativa, volta direto para ela.
      if (m?.active_match) setView({ kind: "partida", matchId: m.active_match });
    } catch {
      setError("Não foi possível carregar seus dados da Batalha.");
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY) as BattleLang | null;
      // Preferência salva neste navegador.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && (BATTLE_LANGS as readonly string[]).includes(saved)) setLang(saved);
    } catch {
      /* sem armazenamento */
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    // Dados externos ao entrar na página.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [session, refresh]);

  if (!configured) return <Alert tone="warning" title="Batalha indisponível nesta cópia do site">A Batalha precisa do Supabase configurado.</Alert>;
  if (loading) return <Spinner label="Carregando" />;
  if (!session) {
    return (
      <div className="space-y-10">
        <EmptyState title="Entre para batalhar" action={<Link href="/entrar" className="inline-flex min-h-11 items-center rounded-md bg-electric px-4 font-semibold text-white">Entrar com Google</Link>}>
          Na Batalha de Código você enfrenta outra pessoa de verdade: o mesmo problema, o mesmo tempo, e vence quem enviar primeiro uma solução correta. A conta é necessária para registrar seus troféus.
        </EmptyState>
        <ArenaPath trophies={0} />
        <BattleLeaderboard />
      </div>
    );
  }

  if (view.kind === "partida") {
    return (
      <BattleRoom
        matchId={view.matchId}
        onExit={() => {
          setView({ kind: "lobby" });
          refresh();
        }}
      />
    );
  }

  const trophies = me?.trophies ?? 0;
  const arena = arenaFor(trophies);
  const next = ARENAS.find((a) => a.minTrophies > trophies);

  return (
    <div className="space-y-10">
      {error && <Alert tone="error" title={error} />}

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6" style={{ borderTopColor: arena.color, borderTopWidth: 4 }}>
          <p className="font-mono text-xs text-subtle">Arena {arena.id} de {ARENAS.length}</p>
          <h2 className="mt-1 text-2xl font-bold">{arena.name}</h2>
          <p className="mt-1 text-sm text-muted">{arena.topics} · partidas de {Math.round(arena.durationSec / 60)} min</p>
          <div className="mt-5 flex flex-wrap items-end gap-6">
            <p className="flex items-center gap-2 font-mono text-3xl font-bold text-amber">
              <Trophy aria-hidden className="size-7" /> {trophies}
            </p>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-subtle">Vitórias</dt>
                <dd className="font-mono font-semibold text-ok">{me?.wins ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">Derrotas</dt>
                <dd className="font-mono font-semibold text-bad">{me?.losses ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">Sequência</dt>
                <dd className="font-mono font-semibold">{me?.streak ?? 0}</dd>
              </div>
            </dl>
          </div>
          {next && (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={`Progresso até ${next.name}`} aria-valuemin={arena.minTrophies} aria-valuemax={next.minTrophies} aria-valuenow={trophies}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((trophies - arena.minTrophies) / (next.minTrophies - arena.minTrophies)) * 100)}%`, background: next.color }} />
              </div>
              <p className="mt-1 text-xs text-muted">
                Faltam {next.minTrophies - trophies} troféus para {next.name}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-line p-5">
          <h2 id="linguagem" className="font-semibold">
            Sua linguagem
          </h2>
          <div role="radiogroup" aria-labelledby="linguagem" className="mt-3 grid grid-cols-2 gap-2">
            {BATTLE_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lang === l}
                disabled={view.kind === "fila"}
                onClick={() => {
                  setLang(l);
                  try {
                    window.localStorage.setItem(LANG_KEY, l);
                  } catch {
                    /* sem armazenamento */
                  }
                }}
                className={cx("flex items-center gap-2 rounded-[var(--radius-md)] border-2 p-2.5 text-left text-sm", lang === l ? "border-electric bg-electric/10" : "border-line hover:border-line-strong")}
              >
                <span className={cx("grid size-8 place-items-center rounded-md font-mono text-xs font-black", LANG_BADGE[l].color)}>{LANG_BADGE[l].badge}</span>
                <span>
                  <span className="block font-semibold">{LANG_INFO[l].label}</span>
                  <span className="block text-[11px] text-subtle">{LANG_INFO[l].version}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Vocês podem usar linguagens diferentes: o problema e os testes são os mesmos.</p>
          {view.kind === "fila" ? (
            <Queue lang={lang} since={view.since} onMatch={(id) => setView({ kind: "partida", matchId: id })} onCancel={() => setView({ kind: "lobby" })} />
          ) : (
            <Button size="lg" className="mt-4 w-full" onClick={() => setView({ kind: "fila", since: Date.now() })}>
              <Swords aria-hidden className="size-5" /> Procurar adversário
            </Button>
          )}
        </div>
      </section>

      <div>
        <div role="tablist" aria-label="Seções da Batalha" className="inline-flex rounded-full border border-line-strong p-1">
          {(["arenas", "ranking", "historico"] as const).map((t) => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={cx("min-h-9 rounded-full px-4 text-sm", tab === t ? "bg-electric text-white" : "text-muted hover:text-fg")}>
              {t === "arenas" ? "Arenas" : t === "ranking" ? "Ranking da Batalha" : "Histórico"}
            </button>
          ))}
        </div>
        <div className="mt-6" role="tabpanel">
          {tab === "arenas" ? <ArenaPath trophies={trophies} /> : tab === "ranking" ? <BattleLeaderboard /> : <BattleHistory />}
        </div>
      </div>

      <Rules />
    </div>
  );
}

/** Procurando adversário: chama a fila a cada 2 s (sinal de vida + tentativa de formar a partida). */
function Queue({ lang, since, onMatch, onCancel }: { lang: BattleLang; since: number; onMatch: (id: string) => void; onCancel: () => void }) {
  const [info, setInfo] = useState<{ waiting: number; players: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    let timer = 0;
    const tick = async () => {
      try {
        const r = await joinQueue(lang);
        if (!alive.current) return;
        if (r.state === "partida") {
          onMatch(r.match_id);
          return;
        }
        setInfo({ waiting: r.waiting_sec, players: r.players_in_queue });
        setError(null);
      } catch {
        if (alive.current) setError("Falha de conexão. Tentando de novo…");
      }
      if (alive.current) timer = window.setTimeout(tick, 2000);
    };
    tick();
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive.current = false;
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, [lang, onMatch]);

  const secs = Math.floor((now - since) / 1000);
  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-electric/50 bg-electric/[0.06] p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span aria-hidden className="relative grid size-10 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-electric/30 motion-reduce:hidden" />
          <Swords className="relative size-5 text-electric-hi" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Procurando adversário…</p>
          <p className="font-mono text-xs text-muted">
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")} · {info ? `${info.players} na fila` : "entrando na fila"}
          </p>
        </div>
      </div>
      {secs > 30 && <p className="mt-3 text-xs text-muted">Só jogadores reais. Se demorar, chame um colega para entrar ao mesmo tempo: a faixa de troféus aceita fica maior a cada segundo.</p>}
      {error && <p className="mt-2 text-xs text-bad">{error}</p>}
      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={async () => {
          alive.current = false;
          await leaveQueue().catch(() => undefined);
          onCancel();
        }}
      >
        <X aria-hidden className="size-4" /> Cancelar
      </Button>
    </div>
  );
}

function ArenaPath({ trophies }: { trophies: number }) {
  const current = arenaFor(trophies);
  return (
    <section aria-labelledby="arenas-titulo">
      <h2 id="arenas-titulo" className="sr-only">
        Arenas
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARENAS.map((a) => {
          const unlocked = trophies >= a.minTrophies;
          const isCurrent = a.id === current.id;
          return (
            <li key={a.id} className={cx("rounded-[var(--radius-lg)] border p-4", isCurrent ? "border-2" : "border-line", !unlocked && "opacity-60")} style={isCurrent ? { borderColor: a.color } : undefined}>
              <div className="flex items-center justify-between gap-2">
                <span className="grid size-9 place-items-center rounded-md font-mono text-sm font-bold text-[#0b1020]" style={{ background: a.color }}>
                  {a.id}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-amber">
                  {unlocked ? <Trophy aria-hidden className="size-3.5" /> : <Lock aria-hidden className="size-3.5" />} {a.minTrophies}+
                </span>
              </div>
              <p className="mt-3 font-semibold">
                {a.name}
                {isCurrent && <span className="ml-2 text-xs font-normal text-electric-hi">você está aqui</span>}
              </p>
              <p className="mt-1 text-sm text-muted">{a.topics}</p>
              <p className="mt-2 font-mono text-[11px] text-subtle">
                {Math.round(a.durationSec / 60 * 10) / 10} min · vitória +{a.win} · derrota {a.loss === 0 ? "não perde" : `−${a.loss}`}
                {a.floorProtected ? " · piso protegido" : ""}
              </p>
              <p className="mt-1 text-[11px] text-subtle">Recompensa: {a.reward}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Rules() {
  return (
    <details className="rounded-[var(--radius-lg)] border border-line p-5">
      <summary className="cursor-pointer font-semibold">Regras da Batalha</summary>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
        <li>Os dois recebem o mesmo problema, ao mesmo tempo, depois de uma contagem de {BATTLE_RULES.countdownSec} segundos.</li>
        <li>Vence quem enviar primeiro uma solução correta. A correção é feita no servidor, com testes ocultos gerados na hora; o navegador não decide nada.</li>
        <li>Se dois envios corretos chegarem quase juntos, vence o que chegou primeiro ao servidor.</li>
        <li>Envio errado não faz perder: corrija e envie de novo (até {BATTLE_RULES.maxSubmissions} envios, com {BATTLE_RULES.minSecondsBetweenSubmissions} s entre eles).</li>
        <li>Se o tempo acabar sem solução correta, ninguém ganha nem perde troféus. Envios feitos antes do fim ainda são corrigidos.</li>
        <li>Desistir, ou ficar mais de {BATTLE_RULES.abandonAfterSec} s sem conexão, conta como derrota por abandono (−{BATTLE_RULES.abandonExtraLoss} troféus a mais).</li>
        <li>Falha do corretor não conta como erro: envie de novo.</li>
        <li>Ganhar contra alguém com mais troféus vale mais; perder para alguém com menos custa mais (até {BATTLE_RULES.diffCap} troféus de ajuste).</li>
        <li>Os troféus da Batalha são separados do XP: não mudam seu nível nem o ranking de XP.</li>
      </ul>
    </details>
  );
}
