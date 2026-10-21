"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Flag, Minus, Play, Plus, RotateCcw, RotateCw, Star, Trash2 } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";
import type { RoundFeedback } from "@/lib/games/engine";
import { findCell, runRobot, type Facing, type RobotCommand, type RobotPayload, type RobotProgram, type RobotStep } from "@/lib/games/robot";

const ROT: Record<Facing, number> = { N: 0, E: 90, S: 180, W: 270 };
const LABEL: Record<RobotCommand, string> = { frente: "Frente", esquerda: "Virar ←", direita: "Virar →" };
const ICON = { frente: ArrowUp, esquerda: RotateCcw, direita: RotateCw } as const;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RobotView({ payload, onAnswer, feedback }: { payload: RobotPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const start = findCell(payload.grid, "S")!;
  const initial: RobotStep = { x: start.x, y: start.y, facing: payload.facing, stars: 0 };
  const [program, setProgram] = useState<RobotProgram>([]);
  const [pos, setPos] = useState<RobotStep>(initial);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const timer = useRef<number | null>(null);
  const done = feedback !== null;

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function add(cmd: RobotCommand) {
    if (program.length >= payload.maxBlocks || done) return;
    setProgram((p) => [...p, { cmd, times: 1 }]);
  }

  function setTimes(i: number, delta: number) {
    setProgram((p) => p.map((b, j) => (j === i ? { ...b, times: Math.max(1, Math.min(9, b.times + delta)) } : b)));
  }

  function execute() {
    if (program.length === 0 || running || done) return;
    const run = runRobot(payload, program);
    setTries((t) => t + 1);
    setMessage(null);
    setRunning(true);
    const finishRun = () => {
      setRunning(false);
      if (run.outcome === "goal") {
        onAnswer({ program });
      } else {
        setMessage(run.outcome === "crash" ? "💥 O robô bateu na parede! Ajuste o programa e tente de novo." : "O robô parou antes da bandeira. Faltam comandos.");
        timer.current = window.setTimeout(() => setPos(initial), 900);
      }
    };
    if (prefersReducedMotion()) {
      setPos(run.steps.at(-1)!);
      finishRun();
      return;
    }
    let i = 0;
    const tick = () => {
      setPos(run.steps[i]!);
      i++;
      if (i < run.steps.length) timer.current = window.setTimeout(tick, 320);
      else timer.current = window.setTimeout(finishRun, 250);
    };
    tick();
  }

  const cols = payload.grid[0]!.length;
  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <div className="mt-4 grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div
          role="img"
          aria-label={`Labirinto com o robô na coluna ${pos.x + 1}, linha ${pos.y + 1}`}
          className="mx-auto grid w-fit gap-1 rounded-[var(--radius-md)] border border-line bg-[#040a17] p-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 2.6rem))` }}
        >
          {payload.grid.flatMap((row, y) =>
            row.split("").map((c, x) => {
              const here = pos.x === x && pos.y === y;
              return (
                <div
                  key={`${x}-${y}`}
                  className={cx(
                    "relative grid aspect-square place-items-center rounded-md text-lg",
                    c === "#" ? "bg-line-strong/70" : "bg-panel-2",
                    c === "G" && "bg-ok/15 ring-1 ring-ok/50",
                  )}
                >
                  {c === "G" && !here && <Flag aria-hidden className="size-5 text-ok" />}
                  {c === "*" && !here && <Star aria-hidden className="size-4 fill-amber text-amber" />}
                  {here && (
                    <span aria-hidden className="grid size-8 place-items-center rounded-full bg-electric text-white shadow-[0_0_16px_rgb(61_123_255/0.6)] transition-transform duration-200" style={{ transform: `rotate(${ROT[pos.facing]}deg)` }}>
                      <ArrowUp className="size-5" strokeWidth={3} />
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>

        <div>
          <p className="text-sm text-muted">Comandos (toque para adicionar):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["frente", "esquerda", "direita"] as const).map((cmd) => {
              const Icon = ICON[cmd];
              return (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => add(cmd)}
                  disabled={done || running || program.length >= payload.maxBlocks}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border-2 border-b-4 border-electric/60 bg-electric/10 px-3 font-semibold disabled:opacity-40"
                >
                  <Icon aria-hidden className="size-4" /> {LABEL[cmd]}
                </button>
              );
            })}
          </div>

          <p className="mt-5 flex justify-between text-sm text-muted">
            <span>Seu programa</span>
            <span className="font-mono">
              {program.length}/{payload.maxBlocks} blocos
            </span>
          </p>
          <ol className="mt-2 min-h-16 space-y-1.5 rounded-[var(--radius-md)] border border-dashed border-line-strong p-2">
            {program.length === 0 && <li className="p-2 text-sm text-subtle">Vazio. Adicione comandos acima.</li>}
            {program.map((b, i) => {
              const Icon = ICON[b.cmd];
              return (
                <li key={i} className="flex items-center gap-2 rounded-md bg-panel-2 px-2 py-1.5 font-mono text-sm">
                  <span className="w-5 text-right text-subtle">{i + 1}</span>
                  <Icon aria-hidden className="size-4 text-electric-hi" />
                  <span className="flex-1">{LABEL[b.cmd]}</span>
                  <span className="flex items-center gap-1" aria-label={`Repetir ${b.times} vezes`}>
                    <button type="button" aria-label="Menos uma vez" disabled={done || running || b.times <= 1} onClick={() => setTimes(i, -1)} className="grid size-8 place-items-center rounded border border-line-strong disabled:opacity-30">
                      <Minus aria-hidden className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-amber">×{b.times}</span>
                    <button type="button" aria-label="Mais uma vez" disabled={done || running || b.times >= 9} onClick={() => setTimes(i, 1)} className="grid size-8 place-items-center rounded border border-line-strong disabled:opacity-30">
                      <Plus aria-hidden className="size-3.5" />
                    </button>
                  </span>
                  <button type="button" aria-label={`Remover bloco ${i + 1}`} disabled={done || running} onClick={() => setProgram((p) => p.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded text-subtle hover:text-bad disabled:opacity-30">
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </li>
              );
            })}
          </ol>

          {!done && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={execute} disabled={running || program.length === 0}>
                <Play aria-hidden className="size-4" /> {running ? "Executando…" : "Executar"}
              </Button>
              {tries >= 3 && !running && (
                <Button variant="ghost" onClick={() => onAnswer({ program: program.length ? program : [{ cmd: "frente", times: 1 }] })}>
                  Desistir desta fase
                </Button>
              )}
            </div>
          )}
          <p className="mt-3 min-h-6 text-sm text-[#ffd6d6]" aria-live="polite">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
