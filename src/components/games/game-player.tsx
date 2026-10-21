"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Clock, Play, RotateCcw, Trophy, XCircle } from "lucide-react";
import type { SeedGame } from "@content/schema";
import { CodeBlock } from "@/components/content/code-block";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button, cx, ProgressBar } from "@/components/ui/primitives";
import {
  familyOf,
  gradeRound,
  publicPayload,
  seededShuffle,
  type BugPayload,
  type ChoicePayload,
  type MemoryPayload,
  type OrderPayload,
  type RoundFeedback,
  type RoundState,
  type TypingPayload,
} from "@/lib/games/engine";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

interface PreparedRound {
  index: number;
  difficulty: number;
  points: number;
  payload: unknown;
  /** Para jogos de escolha: ordem de exibição das alternativas (índices originais). */
  optionOrder: number[];
}

type Phase = "intro" | "playing" | "done";

const DIFFICULTY = ["", "Fácil", "Médio", "Difícil"];

export function GamePlayer({ game }: { game: SeedGame }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const record = hydrated ? progress.games[game.slug] : undefined;

  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState("inicial");
  const [current, setCurrent] = useState(0);
  const [states, setStates] = useState<Record<number, RoundState>>({});
  const [feedback, setFeedback] = useState<RoundFeedback | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [reward, setReward] = useState<{ xp: number } | null>(null);
  const finished = useRef(false);

  const family = familyOf(game.kind);
  const rounds: PreparedRound[] = useMemo(() => {
    const ordered = game.rounds.map((r, index) => ({ r, index })).sort((a, b) => a.r.difficulty - b.r.difficulty || a.index - b.index);
    return ordered.map(({ r, index }) => {
      const optionCount = Array.isArray((r.payload as { options?: unknown[] }).options) ? (r.payload as { options: unknown[] }).options.length : 0;
      return {
        index,
        difficulty: r.difficulty,
        points: r.points ?? 10,
        payload: publicPayload(game.kind, r.payload, `${seed}:${index}`),
        optionOrder: seededShuffle(
          Array.from({ length: optionCount }, (_, i) => i),
          `${seed}:op:${index}`,
        ),
      };
    });
  }, [game, seed]);
  const maxScore = rounds.reduce((s, r) => s + r.points, 0);

  const finish = useCallback(
    (finalScore: number, finalCorrect: number) => {
      if (finished.current) return;
      finished.current = true;
      setPhase("done");
      setDeadline(null);
      const r = dispatchProgress({
        type: "game/result",
        slug: game.slug,
        title: game.title,
        score: finalScore,
        max: maxScore,
        accuracy: rounds.length ? finalCorrect / rounds.length : 0,
      });
      setReward({ xp: r.xp });
    },
    [game.slug, game.title, maxScore, rounds.length],
  );

  // Cronômetro do quiz relâmpago
  useEffect(() => {
    if (phase !== "playing" || deadline === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [phase, deadline]);
  const remainingMs = deadline === null ? null : Math.max(0, deadline - now);
  useEffect(() => {
    if (phase === "playing" && remainingMs === 0) finish(score, correct);
  }, [phase, remainingMs, finish, score, correct]);

  function start() {
    finished.current = false;
    setSeed(String(Math.random()).slice(2, 10));
    setCurrent(0);
    setStates({});
    setFeedback(null);
    setScore(0);
    setCorrect(0);
    setReward(null);
    setPhase("playing");
    if (game.timeLimitSeconds) {
      const t = Date.now();
      setNow(t);
      setDeadline(t + game.timeLimitSeconds * 1000);
    } else {
      setDeadline(null);
    }
  }

  /** Corrige uma resposta da rodada atual; devolve o feedback para a tela da rodada. */
  function answer(value: unknown): RoundFeedback | null {
    const round = rounds[current];
    if (!round || phase !== "playing") return null;
    const def = game.rounds[round.index]!;
    const outcome = gradeRound(
      game.kind,
      { payload: def.payload, solution: def.solution, points: round.points, explanation: def.explanation },
      states[current] ?? null,
      value,
    );
    if (!outcome.ok) return null;
    setStates((s) => ({ ...s, [current]: outcome.state }));
    const newScore = score + outcome.pointsDelta;
    const newCorrect = correct + outcome.correctDelta;
    setScore(newScore);
    setCorrect(newCorrect);
    if (outcome.state.done) setFeedback(outcome.feedback);
    return outcome.feedback;
  }

  function next() {
    setFeedback(null);
    if (current + 1 >= rounds.length) finish(score, correct);
    else setCurrent((c) => c + 1);
  }

  if (phase === "intro") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6">
        <h2 className="text-lg font-semibold">Como jogar</h2>
        <p className="mt-2 text-muted">{game.rules}</p>
        <p className="mt-3 font-mono text-xs text-subtle">
          {rounds.length} rodadas · {maxScore} pontos possíveis{game.timeLimitSeconds ? ` · ${game.timeLimitSeconds}s de tempo` : ""}
        </p>
        {record && (
          <p className="mt-3 text-sm text-muted">
            Seu recorde: <span className="font-mono text-amber">{record.best}/{record.max}</span> · {record.plays} partida{record.plays === 1 ? "" : "s"}
            {record.completed ? " · concluído" : ""}
          </p>
        )}
        <Button className="mt-6" size="lg" onClick={start}>
          <Play aria-hidden className="size-5" /> Começar
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    const accuracy = rounds.length ? correct / rounds.length : 0;
    return (
      <div className="rounded-[var(--radius-lg)] border border-amber/40 bg-navy/60 p-6" aria-live="polite">
        <Trophy aria-hidden className="size-7 text-amber" />
        <h2 className="mt-3 text-2xl font-bold">
          {score} de {maxScore} pontos
        </h2>
        <p className="mt-1 text-muted">
          {correct} de {rounds.length} rodadas certas ({Math.round(accuracy * 100)}%).
          {accuracy >= 0.6 ? " Jogo concluído!" : " Acerte pelo menos 60% para concluir o jogo."}
        </p>
        {reward && reward.xp > 0 && <p className="mt-2 font-mono text-sm text-amber">+{reward.xp} XP</p>}
        <Button className="mt-6" variant="secondary" onClick={start}>
          <RotateCcw aria-hidden className="size-4" /> Jogar de novo
        </Button>
      </div>
    );
  }

  const round = rounds[current]!;
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-mono text-subtle">
          Rodada {current + 1}/{rounds.length} · {DIFFICULTY[round.difficulty]}
        </span>
        <span className="flex items-center gap-4">
          {remainingMs !== null && (
            <span className={cx("inline-flex items-center gap-1 font-mono", remainingMs < 15000 ? "text-bad" : "text-muted")} aria-live="off">
              <Clock aria-hidden className="size-4" /> {Math.ceil(remainingMs / 1000)}s
            </span>
          )}
          <span className="font-mono text-amber">{score} pts</span>
        </span>
      </div>
      <ProgressBar value={current / rounds.length} label="Progresso na partida" className="mb-6" />

      <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 sm:p-6">
        {family === "choice" && <ChoiceView key={`${seed}-${current}`} payload={round.payload as ChoicePayload} order={round.optionOrder} onAnswer={answer} feedback={feedback} />}
        {family === "bug_hunt" && <BugView key={`${seed}-${current}`} payload={round.payload as BugPayload} onAnswer={answer} feedback={feedback} />}
        {family === "code_order" && <OrderView key={`${seed}-${current}`} payload={round.payload as OrderPayload} onAnswer={answer} feedback={feedback} />}
        {family === "memory" && <MemoryView key={`${seed}-${current}`} payload={round.payload as MemoryPayload} onAnswer={answer} />}
        {family === "typing" && <TypingView key={`${seed}-${current}`} payload={round.payload as TypingPayload} onAnswer={answer} feedback={feedback} />}

        {feedback && (
          <div className="mt-6 space-y-4" aria-live="polite">
            <FeedbackLine feedback={feedback} />
            <Button onClick={next} autoFocus>
              {current + 1 >= rounds.length ? "Ver resultado" : "Próxima rodada"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackLine({ feedback }: { feedback: RoundFeedback }) {
  const ok = feedback.kind === "memory" ? true : feedback.correct;
  let title = ok ? "Certo!" : "Não foi dessa vez.";
  if (feedback.kind === "memory") title = `Todos os pares em ${feedback.attempts} tentativas.`;
  if (feedback.kind === "typing") title = `${Math.round(feedback.accuracy * 100)}% de precisão${feedback.errors ? ` · ${feedback.errors} erro(s)` : ""}.`;
  return (
    <Alert tone={ok ? "success" : "warning"} title={title}>
      {feedback.explanation && <InlineMd text={feedback.explanation} />}
    </Alert>
  );
}

/* ------------------------------ Escolha ------------------------------ */

function ChoiceView({
  payload,
  order,
  onAnswer,
  feedback,
}: {
  payload: ChoicePayload;
  order: number[];
  onAnswer: (v: unknown) => RoundFeedback | null;
  feedback: RoundFeedback | null;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correctIndex = feedback?.kind === "choice" ? feedback.correctIndex : null;
  return (
    <div>
      <p className="text-lg font-semibold">
        <InlineMd text={payload.prompt} />
      </p>
      {payload.tables && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {payload.tables.map((t) => (
            <div key={t.name} className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <caption className="mb-1 text-left text-subtle">{t.name}</caption>
                <thead>
                  <tr>
                    {t.columns.map((c) => (
                      <th key={c} scope="col" className="border border-line bg-panel px-2 py-1 text-left">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-line px-2 py-1">
                          {cell === null ? "NULL" : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      {payload.code && <CodeBlock code={payload.code} language={payload.codeLang ?? "js"} />}
      <div className="mt-4 grid gap-2">
        {order.map((original) => {
          const isCorrect = correctIndex === original;
          const isWrong = feedback !== null && picked === original && !isCorrect;
          return (
            <button
              key={original}
              type="button"
              disabled={feedback !== null}
              onClick={() => {
                setPicked(original);
                onAnswer({ index: original });
              }}
              className={cx(
                "flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                feedback === null && "border-line-strong hover:border-electric",
                isCorrect && "border-ok/60 bg-ok/10",
                isWrong && "border-bad/60 bg-bad/10",
                feedback !== null && !isCorrect && !isWrong && "border-line opacity-60",
                /[;{}()<>=]/.test(payload.options[original]!) && "font-mono",
              )}
            >
              <span>{payload.options[original]}</span>
              {isCorrect && <CheckCircle2 aria-label="Correta" className="size-4 shrink-0 text-ok" />}
              {isWrong && <XCircle aria-label="Sua resposta" className="size-4 shrink-0 text-bad" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- Caça aos bugs ---------------------------- */

function BugView({ payload, onAnswer, feedback }: { payload: BugPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const [picked, setPicked] = useState<number | null>(null);
  const lines = payload.code.split("\n");
  const correctLine = feedback?.kind === "bug_hunt" ? feedback.correctLine : null;
  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <p className="mt-1 text-sm text-muted">Toque na linha que tem o bug.</p>
      <ol className="code-surface mt-4 overflow-x-auto rounded-md border border-line bg-[#040a17] py-2 font-mono text-[0.85rem]">
        {lines.map((line, i) => {
          const n = i + 1;
          const isCorrect = correctLine === n;
          const isWrong = feedback !== null && picked === n && !isCorrect;
          return (
            <li key={i}>
              <button
                type="button"
                disabled={feedback !== null}
                onClick={() => {
                  setPicked(n);
                  onAnswer({ line: n });
                }}
                aria-label={`Linha ${n}: ${line.trim() || "vazia"}`}
                className={cx(
                  "flex min-h-9 w-full items-center gap-4 whitespace-pre px-3 text-left",
                  feedback === null && "hover:bg-electric/10",
                  isCorrect && "bg-ok/15",
                  isWrong && "bg-bad/15",
                )}
              >
                <span aria-hidden className="w-5 shrink-0 text-right text-subtle">
                  {n}
                </span>
                <span className="text-[#d6e2f5]">{line || " "}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------------------- Monte o código ---------------------------- */

function OrderView({ payload, onAnswer, feedback }: { payload: OrderPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const [blocks, setBlocks] = useState(payload.blocks);
  const [announce, setAnnounce] = useState("");
  const correctOrder = feedback?.kind === "code_order" ? feedback.correctOrder : null;

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const nextBlocks = [...blocks];
    [nextBlocks[i], nextBlocks[j]] = [nextBlocks[j]!, nextBlocks[i]!];
    setBlocks(nextBlocks);
    setAnnounce(`Bloco movido para a posição ${j + 1}.`);
  }

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <p className="mt-1 text-sm text-muted">Organize os blocos de cima para baixo.</p>
      <ol className="mt-4 space-y-2">
        {blocks.map((b, i) => {
          const right = correctOrder ? correctOrder[i] === b.id : null;
          return (
            <li
              key={b.id}
              className={cx(
                "flex items-center gap-2 rounded-md border bg-[#040a17] p-1.5 pl-3",
                right === null ? "border-line" : right ? "border-ok/60" : "border-bad/60",
              )}
            >
              <code className="flex-1 overflow-x-auto whitespace-pre font-mono text-[0.85rem] text-[#d6e2f5]">{b.code}</code>
              {feedback === null && (
                <span className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir: ${b.code.trim()}`} className="grid size-9 place-items-center rounded border border-line-strong disabled:opacity-30">
                    <ArrowUp aria-hidden className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={`Descer: ${b.code.trim()}`} className="grid size-9 place-items-center rounded border border-line-strong disabled:opacity-30">
                    <ArrowDown aria-hidden className="size-4" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {feedback === null && (
        <Button className="mt-4" onClick={() => onAnswer({ order: blocks.map((b) => b.id) })}>
          Conferir ordem
        </Button>
      )}
      {correctOrder && feedback?.kind === "code_order" && !feedback.correct && (
        <div className="mt-4">
          <p className="text-sm text-muted">Ordem correta:</p>
          <pre className="mt-2 overflow-x-auto rounded-md border border-ok/40 bg-[#040a17] p-3 font-mono text-[0.85rem] text-[#d6e2f5]">
            {correctOrder.map((id) => payload.blocks.find((b) => b.id === id)?.code).join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Memória ------------------------------- */

function MemoryView({ payload, onAnswer }: { payload: MemoryPayload; onAnswer: (v: unknown) => RoundFeedback | null }) {
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function flip(id: string) {
    if (matched.includes(id) || open.includes(id) || wrong.length > 0) return;
    if (open.length === 0) {
      setOpen([id]);
      return;
    }
    const a = open[0]!;
    const fb = onAnswer({ a, b: id });
    setAttempts((n) => n + 1);
    if (fb?.kind === "memory" && fb.match) {
      setMatched((m) => [...m, a, id]);
      setOpen([]);
    } else {
      setOpen([a, id]);
      setWrong([a, id]);
      timer.current = window.setTimeout(() => {
        setOpen([]);
        setWrong([]);
      }, 900);
    }
  }

  return (
    <div>
      <p className="text-lg font-semibold">Encontre os pares: {payload.prompt}</p>
      <p className="mt-1 text-sm text-muted" aria-live="polite">
        {matched.length / 2} de {payload.cards.length / 2} pares · {attempts} tentativa{attempts === 1 ? "" : "s"}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {payload.cards.map((c) => {
          const visible = open.includes(c.id) || matched.includes(c.id);
          const isMatched = matched.includes(c.id);
          const isWrong = wrong.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => flip(c.id)}
                disabled={isMatched}
                aria-label={visible ? c.text : "Carta virada para baixo"}
                className={cx(
                  "grid min-h-20 w-full place-items-center rounded-md border p-2 text-center text-sm transition-colors",
                  !visible && "border-line-strong bg-panel-2 hover:border-electric",
                  visible && !isMatched && !isWrong && "border-electric bg-electric/10",
                  isMatched && "border-amber/60 bg-amber/10 text-amber",
                  isWrong && "border-bad/60 bg-bad/10",
                )}
              >
                {visible ? <span className={/[<>=]|^git |^[A-Z ]+$|^\d+$|^[a-z]+$/.test(c.text) ? "font-mono" : ""}>{c.text}</span> : <span aria-hidden className="font-mono text-subtle">?</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------ Digitação ------------------------------ */

function TypingView({ payload, onAnswer, feedback }: { payload: TypingPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const inputId = useId();

  function submit() {
    if (!typed) return;
    setElapsed(startedAt ? Date.now() - startedAt : null);
    onAnswer({ typed });
  }

  const target = payload.text;
  const cpm = elapsed ? Math.round((typed.length / elapsed) * 60000) : null;
  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-[#040a17] p-3 font-mono text-[0.95rem]" aria-label={`Texto para digitar: ${target}`}>
        {target.split("").map((ch, i) => {
          const t = typed[i];
          return (
            <span
              key={i}
              aria-hidden
              className={cx(
                "whitespace-pre",
                t === undefined ? "text-subtle" : t === ch ? "text-ok" : "rounded-sm bg-bad/30 text-[#ffd6d6]",
                i === typed.length && feedback === null && "border-b-2 border-amber",
              )}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <label htmlFor={inputId} className="mt-4 block text-sm text-muted">
        Digite aqui
      </label>
      <input
        id={inputId}
        value={typed}
        disabled={feedback !== null}
        onChange={(e) => {
          if (!startedAt) setStartedAt(Date.now());
          setTyped(e.target.value.slice(0, 800));
        }}
        onPaste={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-ink px-3 font-mono text-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
      />
      {feedback === null ? (
        <Button className="mt-4" onClick={submit} disabled={!typed}>
          Conferir
        </Button>
      ) : (
        cpm !== null && <p className="mt-3 font-mono text-sm text-muted">Velocidade: {cpm} caracteres por minuto</p>
      )}
    </div>
  );
}
