"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock, Flag, Loader2, RotateCcw, Send, Trophy, Wifi, WifiOff, X } from "lucide-react";
import { formatValue, LANG_INFO, starterCode } from "@battle/battle-core.ts";
import { CodeEditor } from "@/components/challenges/code-editor";
import { InlineMd } from "@/components/content/inline-md";
import { Avatar } from "@/components/profile/avatar";
import { Alert, Button, cx, Spinner } from "@/components/ui/primitives";
import { forfeit, matchState, submitCode, TYPE_LABEL, type MatchState, type OpponentState, type Submission } from "@/lib/battle/api";
import { profileHref } from "@/lib/profiles/api";

const POLL_MS = 1500;
const VERDICT: Record<Submission["status"], { label: string; tone: string }> = {
  julgando: { label: "Corrigindo…", tone: "text-muted" },
  aceito: { label: "Aceito", tone: "text-ok" },
  resposta_errada: { label: "Resposta errada", tone: "text-bad" },
  erro_compilacao: { label: "Erro de compilação", tone: "text-bad" },
  erro_execucao: { label: "Erro na execução", tone: "text-bad" },
  tempo_excedido: { label: "Tempo excedido", tone: "text-warn" },
  erro_tecnico: { label: "Falha do corretor (não conta)", tone: "text-warn" },
};
const OPP: Record<OpponentState, { label: string; dot: string }> = {
  conectado: { label: "Conectado", dot: "bg-ok" },
  resolvendo: { label: "Resolvendo", dot: "bg-electric animate-pulse" },
  enviando: { label: "Enviando solução", dot: "bg-amber animate-pulse" },
  desconectado: { label: "Sem conexão", dot: "bg-subtle" },
  desistiu: { label: "Desistiu", dot: "bg-bad" },
  concluido: { label: "Partida encerrada", dot: "bg-muted" },
};

const draftKey = (id: string) => `pdz-batalha-codigo:${id}`;
const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function BattleRoom({ matchId, onExit }: { matchId: string; onExit: () => void }) {
  const [st, setSt] = useState<MatchState | null>(null);
  const [offset, setOffset] = useState(0); // servidor - navegador, em ms
  const [now, setNow] = useState(() => Date.now());
  const [online, setOnline] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pane, setPane] = useState<"problema" | "codigo">("problema");
  const [confirmQuit, setConfirmQuit] = useState(false);
  const lastType = useRef(0);
  const alive = useRef(true);

  const poll = useCallback(async () => {
    try {
      const t0 = Date.now();
      const s = await matchState(matchId, Date.now() - lastType.current < 8000 ? "resolvendo" : "conectado");
      const t1 = Date.now();
      // Corrige a diferença de relógio usando o meio da ida e volta.
      setOffset(new Date(s.server_now).getTime() - (t0 + t1) / 2);
      setSt(s);
      setOnline(true);
      return s;
    } catch {
      setOnline(false);
      return null;
    }
  }, [matchId]);

  useEffect(() => {
    alive.current = true;
    let timer = 0;
    const loop = async () => {
      const s = await poll();
      if (!alive.current) return;
      if (s && (s.status === "finalizada" || s.status === "cancelada")) return;
      timer = window.setTimeout(loop, POLL_MS);
    };
    loop();
    const clock = window.setInterval(() => setNow(Date.now()), 250);
    return () => {
      alive.current = false;
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, [poll]);

  // Código inicial quando o desafio aparece (ou o rascunho salvo, ao reconectar).
  useEffect(() => {
    if (!st?.challenge || code !== null) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(draftKey(matchId));
    } catch {
      /* sem armazenamento */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(saved ?? starterCode(st.challenge.signature, st.me.lang));
  }, [st?.challenge, st?.me.lang, code, matchId]);

  if (!st) {
    return online ? <Spinner label="Entrando na sala" /> : <Alert tone="error" title="Sem conexão com a partida">Tentando reconectar…</Alert>;
  }

  const serverNow = now + offset;
  const startsIn = new Date(st.starts_at).getTime() - serverNow;
  const left = new Date(st.ends_at).getTime() - serverNow;
  const done = st.status === "finalizada" || st.status === "cancelada";
  const pending = st.my_submissions.some((s) => s.status === "julgando");

  if (done) return <Result st={st} code={code} onExit={onExit} />;

  async function send() {
    if (!code || sending) return;
    setSending(true);
    setFeedback(null);
    const r = await submitCode(matchId, code);
    setSending(false);
    if (r.error) setFeedback(r.error);
    else if (r.verdict && r.verdict !== "aceito") setFeedback(r.message ?? VERDICT[r.verdict].label);
    poll();
  }

  return (
    <div className="space-y-4">
      {/* Barra da partida: você, tempo, adversário */}
      <div className="sticky top-16 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-ink/95 p-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Você</p>
          <p className="truncate font-mono text-xs text-muted">
            {LANG_INFO[st.me.lang].label} · <Trophy aria-hidden className="inline size-3 text-amber" /> {st.me.trophies_before}
          </p>
        </div>
        <div className="text-center" aria-live="off">
          <p className="text-[11px] text-subtle">{st.arena.name}</p>
          <p className={cx("font-mono text-2xl font-bold tabular-nums", startsIn > 0 ? "text-electric-hi" : left < 30_000 ? "animate-pulse text-bad" : left < 60_000 ? "text-warn" : "text-fg")}>
            <Clock aria-hidden className="mr-1 inline size-5 align-[-2px]" />
            {startsIn > 0 ? fmt(startsIn) : fmt(left)}
          </p>
          <span className="sr-only" role="timer">
            {startsIn > 0 ? `Começa em ${Math.ceil(startsIn / 1000)} segundos` : `Restam ${Math.ceil(left / 1000)} segundos`}
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{st.opponent.name}</p>
            <p className="flex items-center justify-end gap-1.5 text-xs text-muted">
              <span aria-hidden className={cx("size-2 rounded-full", OPP[st.opponent.state].dot)} />
              {OPP[st.opponent.state].label} · {LANG_INFO[st.opponent.lang].label}
              {st.opponent.submissions > 0 && ` · ${st.opponent.submissions} envio(s)`}
            </p>
          </div>
          <Avatar name={st.opponent.name} url={st.opponent.avatar_url} size={36} className="hidden sm:grid" />
        </div>
      </div>
      {!online && (
        <p role="status" className="flex items-center gap-2 text-sm text-warn">
          <WifiOff aria-hidden className="size-4" /> Conexão instável. Seu código continua salvo aqui; tentando reconectar…
        </p>
      )}

      {startsIn > 0 || !st.challenge ? (
        <div className="grid min-h-[40vh] place-items-center rounded-[var(--radius-lg)] border border-line bg-navy/60 p-8 text-center">
          <div>
            <p className="text-sm text-muted">Adversário encontrado! O desafio aparece para os dois ao mesmo tempo.</p>
            <p className="mt-4 font-mono text-7xl font-black text-electric-hi tabular-nums" aria-live="assertive">
              {Math.max(1, Math.ceil(startsIn / 1000))}
            </p>
            <p className="mt-4 text-sm">
              Você ({LANG_INFO[st.me.lang].label}) contra <strong>{st.opponent.name}</strong> ({LANG_INFO[st.opponent.lang].label})
            </p>
          </div>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Partes da batalha" className="inline-flex rounded-full border border-line-strong p-1 lg:hidden">
            {(["problema", "codigo"] as const).map((p) => (
              <button key={p} role="tab" type="button" aria-selected={pane === p} onClick={() => setPane(p)} className={cx("min-h-9 rounded-full px-4 text-sm", pane === p ? "bg-electric text-white" : "text-muted")}>
                {p === "problema" ? "Problema" : "Código"}
              </button>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className={cx("space-y-4", pane !== "problema" && "hidden lg:block")} aria-label="Problema">
              <h2 className="text-2xl font-bold">{st.challenge.title}</h2>
              <div className="space-y-3 text-[0.95rem] leading-relaxed text-muted">
                {st.challenge.statement.split("\n\n").map((p, i) => (
                  <p key={i}>
                    <InlineMd text={p} />
                  </p>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-subtle">Entrada</h3>
                <ul className="mt-1 text-sm text-muted">
                  {st.challenge.signature.params.map((p) => (
                    <li key={p.name}>
                      <code className="font-mono text-[#cfe0ff]">{p.name}</code>: {TYPE_LABEL[p.type]}
                    </li>
                  ))}
                  <li>
                    Devolve: <span>{TYPE_LABEL[st.challenge.signature.returns]}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-subtle">Limites</h3>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                  {st.challenge.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-subtle">Exemplos</h3>
                <ul className="mt-2 space-y-2">
                  {st.challenge.examples.map((ex, i) => (
                    <li key={i} className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-[#060d1c] px-3 py-2 font-mono text-[13px]">
                      resolver(
                      {ex.input
                        .map((v, j) => {
                          const t = st.challenge!.signature.params[j]!.type;
                          return t === "int[]" ? `[${formatValue(t, v).split(" ").filter(Boolean).join(", ")}]` : t === "str" ? JSON.stringify(v) : formatValue(t, v);
                        })
                        .join(", ")}
                      ) <span className="text-subtle">→</span> <span className="text-amber">{ex.output === "" ? "(vazio)" : ex.output}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-subtle">O código inicial já lê a entrada e imprime a resposta. Você só precisa completar a função `resolver`.</p>
            </section>

            <section className={cx("space-y-3", pane !== "codigo" && "hidden lg:block")} aria-label="Seu código">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Sua solução em {LANG_INFO[st.me.lang].label}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const fresh = starterCode(st.challenge!.signature, st.me.lang);
                    setCode(fresh);
                    try {
                      window.localStorage.setItem(draftKey(matchId), fresh);
                    } catch {
                      /* sem armazenamento */
                    }
                  }}
                >
                  <RotateCcw aria-hidden className="size-4" /> Recomeçar
                </Button>
              </div>
              {code !== null && (
                <CodeEditor
                  value={code}
                  indent={st.me.lang === "javascript" || st.me.lang === "typescript" ? 2 : 4}
                  label={`Código em ${LANG_INFO[st.me.lang].label}`}
                  onChange={(v) => {
                    lastType.current = Date.now();
                    setCode(v);
                    try {
                      window.localStorage.setItem(draftKey(matchId), v);
                    } catch {
                      /* sem armazenamento */
                    }
                  }}
                />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={send} disabled={sending || pending || left <= 0}>
                  {sending || pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
                  {sending || pending ? "Corrigindo no servidor…" : "Enviar solução"}
                </Button>
                {!confirmQuit ? (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmQuit(true)}>
                    <Flag aria-hidden className="size-4" /> Desistir
                  </Button>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    Desistir conta como derrota.
                    <Button variant="danger" size="sm" onClick={async () => setSt(await forfeit(matchId))}>
                      Desistir mesmo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmQuit(false)}>
                      Continuar
                    </Button>
                  </span>
                )}
              </div>
              {feedback && (
                <p role="alert" className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-bad/40 bg-bad/[0.06] p-3 font-mono text-xs text-[#ffd6d6]">
                  {feedback}
                </p>
              )}
              {st.my_submissions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-subtle">Seus envios</h3>
                  <ol className="mt-1 space-y-1">
                    {[...st.my_submissions].reverse().map((s, i) => (
                      <li key={s.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                        <span className="font-mono text-xs text-subtle">#{st.my_submissions.length - i}</span>
                        <span className={cx("font-semibold", VERDICT[s.status].tone)}>{VERDICT[s.status].label}</span>
                        {s.total ? <span className="font-mono text-xs text-muted">{s.passed}/{s.total} testes</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-xs text-subtle">
                <Wifi aria-hidden className="size-3.5" /> O código roda em um servidor isolado, com testes ocultos novos a cada envio.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Result({ st, code, onExit }: { st: MatchState; code: string | null; onExit: () => void }) {
  const won = st.winner === "eu";
  const lost = st.winner === "adversario";
  const delta = st.me.trophy_delta ?? 0;
  const title = won ? "Vitória!" : lost ? "Derrota" : "Sem vencedor";
  const reason =
    st.result === "abandono"
      ? won
        ? "O adversário desistiu ou perdeu a conexão."
        : "Você desistiu ou ficou tempo demais sem conexão."
      : st.result === "tempo_esgotado"
        ? "O tempo acabou sem nenhuma solução correta. Ninguém ganha nem perde troféus."
        : st.result === "cancelada"
          ? "A partida foi cancelada por uma falha técnica."
          : won
            ? "Sua solução correta chegou primeiro ao servidor."
            : "O adversário enviou uma solução correta primeiro.";
  return (
    <div className="space-y-6">
      <section className={cx("rounded-[var(--radius-lg)] border-2 p-8 text-center", won ? "border-ok/60 bg-ok/[0.06]" : lost ? "border-bad/50 bg-bad/[0.05]" : "border-line")} role="status">
        <p className="text-sm text-muted">{st.arena.name} · {st.challenge?.title}</p>
        <h2 className={cx("mt-2 text-4xl font-black", won ? "text-ok" : lost ? "text-bad" : "text-fg")}>{title}</h2>
        <p className="mt-2 text-muted">{reason}</p>
        <p className={cx("mt-5 inline-flex items-center gap-2 font-mono text-3xl font-bold", delta > 0 ? "text-amber" : delta < 0 ? "text-bad" : "text-muted")}>
          <Trophy aria-hidden className="size-7" /> {delta > 0 ? `+${delta}` : delta}
        </p>
        <p className="mt-1 text-sm text-muted">
          {st.me.trophies_before} → {Math.max(0, st.me.trophies_before + delta)} troféus
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onExit}>Jogar de novo</Button>
          {st.opponent.username && (
            <Link href={profileHref(st.opponent.username)} className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-line-strong px-4 font-semibold hover:border-muted">
              Ver perfil de {st.opponent.name}
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Códigos da partida">
        <details open className="rounded-[var(--radius-lg)] border border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">Seu código ({LANG_INFO[st.me.lang].label})</summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-[var(--radius-md)] bg-[#060d1c] p-3 font-mono text-xs leading-5 text-[#dbe7ff]">{code ?? "(nenhum)"}</pre>
        </details>
        <details className="rounded-[var(--radius-lg)] border border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">Código de {st.opponent.name} ({LANG_INFO[st.opponent.lang].label})</summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-[var(--radius-md)] bg-[#060d1c] p-3 font-mono text-xs leading-5 text-[#dbe7ff]">{st.opponent.final_code ?? "(não enviou código)"}</pre>
        </details>
      </section>

      {st.my_submissions.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-line p-4">
          <h3 className="text-sm font-semibold">Seus envios</h3>
          <ol className="mt-2 space-y-1 text-sm">
            {st.my_submissions.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-2">
                {s.status === "aceito" ? <Check aria-hidden className="size-4 text-ok" /> : <X aria-hidden className="size-4 text-bad" />}
                <span className="font-mono text-xs text-subtle">#{i + 1}</span>
                <span className={VERDICT[s.status].tone}>{VERDICT[s.status].label}</span>
                {s.message && s.status !== "aceito" && <span className="truncate text-xs text-muted">{s.message}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
