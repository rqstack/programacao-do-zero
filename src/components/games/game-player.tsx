"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, CarFront, Flag, Flame, GripVertical, Heart, Play, RotateCcw, Star, Trophy } from "lucide-react";
import type { SeedGame } from "@content/schema";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button, cx, ProgressBar } from "@/components/ui/primitives";
import {
  familyOf,
  gradeRound,
  publicPayload,
  type BugPayload,
  type CssPayload,
  type MemoryPayload,
  type OrderPayload,
  type RainPayload,
  type RobotPayload,
  type RoundFeedback,
  type RoundState,
  type SqlPayload,
  type TypingPayload,
} from "@/lib/games/engine";
import { buildPlayRounds } from "@/lib/games/generate";
import { dispatchProgress, getProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { CssLiveView } from "./views/css-live-view";
import { BugFixView } from "./views/bug-fix-view";
import { RainView } from "./views/rain-view";
import { RobotView } from "./views/robot-view";
import { SqlBuilderView } from "./views/sql-builder-view";

interface PreparedRound {
  index: number;
  difficulty: number;
  points: number;
  payload: unknown;
}

type Phase = "intro" | "playing" | "done";
const DIFFICULTY = ["", "Fácil", "Médio", "Difícil"];

function starsFor(accuracy: number): number {
  return accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0;
}

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
  const [lives, setLives] = useState(game.lives ?? 0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [pop, setPop] = useState<{ id: number; text: string } | null>(null);
  const [reward, setReward] = useState<{ xp: number } | null>(null);
  const finished = useRef(false);
  /** Valores atuais para callbacks agendados (ex.: avanço automático da chuva). */
  const live = useRef({ score: 0, correct: 0, lives: game.lives ?? 0, current: 0 });

  const family = familyOf(game.kind);
  /**
   * Fases desta partida. Montadas no "Jogar" / "Jogar de novo" a partir do histórico do jogador
   * (situações nunca vistas primeiro), e não a cada renderização.
   */
  const [playRounds, setPlayRounds] = useState(() => buildPlayRounds(game, "inicial"));
  const rounds: PreparedRound[] = useMemo(
    () => playRounds.map((r, index) => ({ index, difficulty: r.difficulty, points: r.points ?? 10, payload: publicPayload(game.kind, r.payload, `${seed}:${index}`) })),
    [game.kind, playRounds, seed],
  );
  const maxScore = rounds.reduce((s, r) => s + r.points, 0);

  const finish = useCallback(
    (finalScore: number, finalCorrect: number) => {
      if (finished.current) return;
      finished.current = true;
      setPhase("done");
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

  function start() {
    finished.current = false;
    const newSeed = String(Math.random()).slice(2, 10);
    const saved = getProgress();
    const rec = saved.games[game.slug];
    const advanced = Boolean(rec?.completed && rec.max > 0 && rec.best / rec.max >= 0.8);
    const next = buildPlayRounds(game, newSeed, { recent: saved.gameSeen[game.slug] ?? [], advanced });
    setPlayRounds(next);
    dispatchProgress({ type: "game/seen", slug: game.slug, keys: next.map((r) => r.key) });
    setSeed(newSeed);
    setCurrent(0);
    setStates({});
    setFeedback(null);
    setScore(0);
    setCorrect(0);
    setLives(game.lives ?? 0);
    setCombo(0);
    setBestCombo(0);
    setReward(null);
    live.current = { score: 0, correct: 0, lives: game.lives ?? 0, current: 0 };
    setPhase("playing");
  }

  /** Corrige a resposta da rodada atual e atualiza pontos, combo e vidas. */
  function answer(value: unknown): RoundFeedback | null {
    const round = rounds[current];
    if (!round || phase !== "playing") return null;
    const def = playRounds[round.index]!;
    const outcome = gradeRound(game.kind, { payload: def.payload, solution: def.solution, points: round.points, explanation: def.explanation }, states[current] ?? null, value);
    if (!outcome.ok) return null;
    setStates((s) => ({ ...s, [current]: outcome.state }));
    setScore((s) => s + outcome.pointsDelta);
    live.current.score += outcome.pointsDelta;
    if (outcome.pointsDelta > 0) setPop({ id: Date.now(), text: `+${outcome.pointsDelta}` });
    if (outcome.state.done) {
      if (outcome.correctDelta === 1) {
        live.current.correct += 1;
        setCorrect((c) => c + 1);
        setCombo((c) => {
          const n = c + 1;
          setBestCombo((b) => Math.max(b, n));
          return n;
        });
      } else {
        setCombo(0);
        if (game.lives) {
          live.current.lives -= 1;
          setLives((l) => l - 1);
        }
      }
      setFeedback(outcome.feedback);
    }
    return outcome.feedback;
  }

  function next() {
    setFeedback(null);
    const now = live.current;
    const outOfLives = Boolean(game.lives) && now.lives <= 0;
    if (outOfLives || now.current + 1 >= rounds.length) finish(now.score, now.correct);
    else {
      now.current += 1;
      setCurrent(now.current);
    }
  }

  if (phase === "intro") {
    return (
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-navy/60">
        <div className="relative bg-gradient-to-br from-electric/25 via-navy to-amber/10 p-6 sm:p-8">
          <div aria-hidden className="grid-paper absolute inset-0 opacity-50" />
          <div className="relative">
            <p className="font-mono text-xs text-amber">
              {rounds.length} fases · {maxScore} pontos{game.lives ? ` · ${game.lives} vidas` : ""}
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Pronto para jogar?</h2>
            <p className="mt-3 max-w-xl text-muted">{game.rules}</p>
            {record && (
              <p className="mt-4 flex items-center gap-2 text-sm">
                <Trophy aria-hidden className="size-4 text-amber" /> Recorde: <span className="font-mono text-amber">{record.best}/{record.max}</span> · {record.plays} partida
                {record.plays === 1 ? "" : "s"}
              </p>
            )}
            <Button className="mt-6 min-h-14 px-8 text-lg" size="lg" onClick={start}>
              <Play aria-hidden className="size-5" /> Jogar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const accuracy = rounds.length ? correct / rounds.length : 0;
    const stars = starsFor(accuracy);
    const gameOver = Boolean(game.lives) && lives <= 0;
    return (
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-amber/40 bg-navy/70 p-6 text-center sm:p-10" aria-live="polite">
        {stars === 3 && <Confetti />}
        <p className="font-mono text-sm text-amber">{gameOver ? "Fim de jogo" : "Partida concluída"}</p>
        <div className="mt-4 flex justify-center gap-2" aria-label={`${stars} de 3 estrelas`}>
          {[1, 2, 3].map((n) => (
            <Star key={n} aria-hidden className={cx("size-12 transition-transform", n <= stars ? "star-pop fill-amber text-amber" : "text-line-strong")} style={{ animationDelay: `${n * 180}ms` }} />
          ))}
        </div>
        <h2 className="mt-4 text-3xl font-bold">
          {score} <span className="text-lg text-muted">de {maxScore} pontos</span>
        </h2>
        <p className="mt-2 text-muted">
          {correct} de {rounds.length} fases certas · melhor combo ×{bestCombo}
          {accuracy >= 0.6 ? "" : " · acerte 60% para concluir o jogo"}
        </p>
        {reward && reward.xp > 0 && <p className="mt-3 font-mono text-lg text-amber">+{reward.xp} XP</p>}
        <Button className="mt-8" onClick={start}>
          <RotateCcw aria-hidden className="size-4" /> Jogar de novo
        </Button>
      </div>
    );
  }

  const round = rounds[current]!;
  const autoNext = false;
  return (
    <div>
      {/* HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-sm text-subtle">
          Fase {current + 1}/{rounds.length} · {DIFFICULTY[round.difficulty]}
        </span>
        <span className="flex items-center gap-4">
          {game.lives ? (
            <span className="flex items-center gap-0.5" aria-label={`${lives} vidas`}>
              {Array.from({ length: game.lives }, (_, i) => (
                <Heart key={i} aria-hidden className={cx("size-5", i < lives ? "fill-bad text-bad" : "text-line-strong")} />
              ))}
            </span>
          ) : null}
          {combo >= 2 && (
            <span key={combo} className="combo-pop inline-flex items-center gap-1 font-mono text-sm font-bold text-amber">
              <Flame aria-hidden className="size-4" /> ×{combo}
            </span>
          )}
          <span className="relative font-mono text-lg font-bold text-amber" aria-live="off">
            {score}
            {pop && (
              <span key={pop.id} aria-hidden className="score-pop absolute -top-5 right-0 text-sm text-ok">
                {pop.text}
              </span>
            )}
          </span>
        </span>
      </div>
      <ProgressBar value={current / rounds.length} label="Progresso na partida" className="mb-5" />

      <div className="rounded-[var(--radius-xl)] border border-line bg-navy/60 p-4 sm:p-6">
        {family === "robot" && <RobotView key={`${seed}-${current}`} payload={round.payload as RobotPayload} onAnswer={answer} feedback={feedback} />}
        {family === "rain" && <RainView key={`${seed}-${current}`} payload={round.payload as RainPayload} onAnswer={answer} feedback={feedback} />}
        {family === "css_live" && <CssLiveView key={`${seed}-${current}`} payload={round.payload as CssPayload} onAnswer={answer} feedback={feedback} />}
        {family === "sql_builder" && <SqlBuilderView key={`${seed}-${current}`} payload={round.payload as SqlPayload} onAnswer={answer} feedback={feedback} />}
        {family === "bug_hunt" && <BugFixView key={`${seed}-${current}`} payload={round.payload as BugPayload} onAnswer={answer} feedback={feedback} />}
        {family === "code_order" && (
          <OrderView key={`${seed}-${current}`} payload={round.payload as OrderPayload} onAnswer={answer} feedback={feedback} variant={game.kind === "fullstack" ? "flow" : "code"} />
        )}
        {family === "memory" && <MemoryView key={`${seed}-${current}`} payload={round.payload as MemoryPayload} onAnswer={answer} />}
        {family === "typing" && <TypingView key={`${seed}-${current}`} payload={round.payload as TypingPayload} onAnswer={answer} feedback={feedback} />}

        {feedback && !autoNext && (
          <div className="mt-6 space-y-4" aria-live="polite">
            <FeedbackLine feedback={feedback} />
            <Button onClick={next} autoFocus>
              {(game.lives && lives <= 0) || current + 1 >= rounds.length ? "Ver resultado" : "Próxima fase"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti absolute top-0 block h-3 w-1.5 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: ["#ffb547", "#3d7bff", "#34d399", "#eaf0fa"][i % 4], animationDelay: `${(i % 8) * 90}ms` }}
        />
      ))}
    </div>
  );
}

function FeedbackLine({ feedback }: { feedback: RoundFeedback }) {
  const ok = feedback.kind === "memory" ? true : feedback.correct;
  let title = ok ? "Certo!" : "Não foi dessa vez.";
  if (feedback.kind === "memory") title = `Todos os pares em ${feedback.attempts} tentativas.`;
  if (feedback.kind === "bug_hunt") title = feedback.correct ? (feedback.runs <= 1 ? "Todos os testes passaram de primeira!" : `Todos os testes passaram (${feedback.runs} execuções).`) : "O bug venceu desta vez.";
  if (feedback.kind === "rain") title = feedback.correct ? `Onda vencida: ${feedback.hits} de ${feedback.targets}.` : `Onda perdida: ${feedback.hits} de ${feedback.targets} certas e ${feedback.wrong} isca(s).`;
  if (feedback.kind === "typing") title = `${Math.round(feedback.accuracy * 100)}% de precisão${feedback.errors ? ` · ${feedback.errors} erro(s)` : ""}.`;
  if (feedback.kind === "robot")
    title = feedback.correct ? (feedback.blocks <= feedback.par ? "Bandeira! Programa enxuto: pontuação máxima." : `Bandeira! Dá para fazer com ${feedback.par} blocos.`) : "Fase não concluída.";
  return (
    <Alert tone={ok ? "success" : "warning"} title={title}>
      {feedback.explanation && <InlineMd text={feedback.explanation} />}
    </Alert>
  );
}

/* --------------------- Monte o código / Missões Full Stack --------------------- */

function OrderView({
  payload,
  onAnswer,
  feedback,
  variant,
}: {
  payload: OrderPayload;
  onAnswer: (v: unknown) => RoundFeedback | null;
  feedback: RoundFeedback | null;
  variant: "code" | "flow";
}) {
  const [blocks, setBlocks] = useState(payload.blocks);
  const [dragging, setDragging] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const correctOrder = feedback?.kind === "code_order" ? feedback.correctOrder : null;

  function moveTo(id: string, to: number) {
    setBlocks((bs) => {
      const from = bs.findIndex((b) => b.id === id);
      if (from < 0 || from === to) return bs;
      const next = [...bs];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    moveTo(blocks[i]!.id, j);
    setAnnounce(`Bloco movido para a posição ${j + 1}.`);
  }

  // Arrastar com ponteiro (mouse e toque): o bloco vai para a posição sob o dedo.
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !listRef.current) return;
    const items = [...listRef.current.querySelectorAll<HTMLElement>("[data-index]")];
    const over = items.find((el) => {
      const r = el.getBoundingClientRect();
      return e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (over) moveTo(dragging, Number(over.dataset.index));
  }

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <p className="mt-1 text-sm text-muted">Arraste pela alça ou use as setas. De cima para baixo.</p>
      <ol
        ref={listRef}
        className={cx("mt-4", variant === "flow" ? "space-y-0" : "space-y-2")}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        {blocks.map((b, i) => {
          const right = correctOrder ? correctOrder[i] === b.id : null;
          return (
            <li key={b.id} data-index={i}>
              <div
                className={cx(
                  "flex items-center gap-2 border-2 transition-[transform,border-color] duration-150",
                  variant === "flow" ? "rounded-[var(--radius-lg)] bg-navy p-3 text-base" : "rounded-md bg-[#040a17] p-1.5 pl-1",
                  right === null ? (dragging === b.id ? "scale-[1.02] border-electric" : "border-line") : right ? "border-ok/70" : "border-bad/70",
                )}
              >
                {feedback === null && (
                  <span
                    aria-hidden
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setDragging(b.id);
                    }}
                    className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded text-subtle hover:text-fg active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </span>
                )}
                {variant === "flow" ? (
                  <span className="flex-1 font-medium">{b.code}</span>
                ) : (
                  <code className="flex-1 overflow-x-auto whitespace-pre font-mono text-[0.85rem] text-[#d6e2f5]">{b.code}</code>
                )}
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
              </div>
              {variant === "flow" && i < blocks.length - 1 && (
                <span aria-hidden className="flex justify-center py-1 text-electric-hi">
                  <ArrowDown className="size-5" />
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
          Conferir {variant === "flow" ? "fluxo" : "ordem"} <ArrowRight aria-hidden className="size-4" />
        </Button>
      )}
      {correctOrder && feedback?.kind === "code_order" && !feedback.correct && (
        <div className="mt-4">
          <p className="text-sm text-muted">Ordem correta:</p>
          <ol className="mt-2 list-decimal space-y-1 rounded-md border border-ok/40 bg-[#040a17] p-3 pl-8 text-[0.85rem] text-[#d6e2f5]">
            {correctOrder.map((id) => (
              <li key={id} className={variant === "code" ? "whitespace-pre font-mono" : ""}>
                {payload.blocks.find((b) => b.id === id)?.code}
              </li>
            ))}
          </ol>
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
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {payload.cards.map((c) => {
          const visible = open.includes(c.id) || matched.includes(c.id);
          const isMatched = matched.includes(c.id);
          const isWrong = wrong.includes(c.id);
          return (
            <li key={c.id} className="[perspective:600px]">
              <button
                type="button"
                onClick={() => flip(c.id)}
                disabled={isMatched}
                aria-label={visible ? c.text : "Carta virada para baixo"}
                className={cx("relative h-24 w-full transition-transform duration-300 [transform-style:preserve-3d]", visible && "[transform:rotateY(180deg)]", isWrong && "shake")}
              >
                <span aria-hidden className="absolute inset-0 grid place-items-center rounded-[var(--radius-md)] border-2 border-b-4 border-electric/50 bg-gradient-to-br from-electric/30 to-panel-2 font-mono text-2xl text-electric-hi [backface-visibility:hidden]">
                  {"{ }"}
                </span>
                <span
                  aria-hidden
                  className={cx(
                    "absolute inset-0 grid place-items-center rounded-[var(--radius-md)] border-2 p-2 text-center text-sm [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    isMatched ? "border-amber/70 bg-amber/10 text-amber" : isWrong ? "border-bad/60 bg-bad/10" : "border-electric bg-navy",
                  )}
                >
                  {c.text}
                </span>
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
  const target = payload.text;

  function submit() {
    if (!typed) return;
    setElapsed(startedAt ? Date.now() - startedAt : null);
    onAnswer({ typed });
  }

  let rightPrefix = 0;
  while (rightPrefix < typed.length && typed[rightPrefix] === target[rightPrefix]) rightPrefix++;
  const carPos = Math.min(1, rightPrefix / target.length);
  const cpm = elapsed ? Math.round((typed.length / elapsed) * 60000) : null;

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      {/* Pista */}
      <div aria-hidden className="relative mt-4 h-12 overflow-hidden rounded-full border border-line bg-[#040a17]">
        <div className="absolute inset-y-0 left-0 bg-electric/15" style={{ width: `${carPos * 100}%` }} />
        <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-line-strong" />
        <Flag aria-hidden className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-amber" />
        <CarFront aria-hidden className="absolute top-1/2 size-6 -translate-y-1/2 text-electric-hi transition-[left] duration-150" style={{ left: `calc(${carPos * 100}% * 0.88)` }} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-[#040a17] p-3 font-mono text-[1rem]" aria-label={`Texto para digitar: ${target}`}>
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
        Digite aqui (Enter para conferir)
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
        className="mt-1 min-h-12 w-full rounded-md border border-line-strong bg-ink px-3 font-mono focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
      />
      {feedback === null ? (
        <Button className="mt-4" onClick={submit} disabled={!typed}>
          Cruzar a linha de chegada
        </Button>
      ) : (
        cpm !== null && <p className="mt-3 font-mono text-sm text-muted">Velocidade: {cpm} caracteres por minuto</p>
      )}
    </div>
  );
}
