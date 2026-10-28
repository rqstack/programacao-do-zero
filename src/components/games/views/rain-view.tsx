"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Play, X } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";
import type { RainPayload, RoundFeedback } from "@/lib/games/engine";

/**
 * Chuva de código como jogo de coletar: as expressões descem em passos (não em animação
 * contínua), então funciona igual em celulares lentos e com "reduzir movimento".
 */
const ROWS = 6;
const SPAWN_EVERY = 2;

interface Falling {
  id: string;
  code: string;
  lane: number;
  row: number;
}
interface Landed {
  id: string;
  code: string;
  caught: boolean;
}

export function RainView({ payload, onAnswer, feedback }: { payload: RainPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const [phase, setPhase] = useState<"pronta" | "jogando" | "fim">("pronta");
  const [lane, setLane] = useState(1);
  const [falling, setFalling] = useState<Falling[]>([]);
  const [landed, setLanded] = useState<Landed[]>([]);
  const [stats, setStats] = useState({ caught: 0, spawned: 0 });
  const laneRef = useRef(1);
  const state = useRef({ tick: 0, spawned: 0, falling: [] as Falling[], caught: [] as string[], done: false });

  const move = useCallback((to: number) => {
    const l = Math.max(0, Math.min(2, to));
    laneRef.current = l;
    setLane(l);
  }, []);

  // Um passo do jogo: tudo desce uma linha; quem chega embaixo é pego (se o coletor está na pista) ou passa.
  const step = useCallback(() => {
    const s = state.current;
    if (s.done) return;
    s.tick++;
    const next: Falling[] = [];
    const landedNow: Landed[] = [];
    for (const f of s.falling) {
      const row = f.row + 1;
      if (row >= ROWS - 1) {
        const caught = f.lane === laneRef.current;
        if (caught) s.caught.push(f.id);
        landedNow.push({ id: f.id, code: f.code, caught });
      } else next.push({ ...f, row });
    }
    if (s.tick % SPAWN_EVERY === 1 && s.spawned < payload.drops.length) {
      const d = payload.drops[s.spawned++]!;
      next.push({ id: d.id, code: d.code, lane: d.lane, row: 0 });
    }
    s.falling = next;
    setFalling(next);
    setStats({ caught: s.caught.length, spawned: s.spawned });
    if (landedNow.length) setLanded((l) => [...landedNow, ...l].slice(0, 4));
    if (s.spawned >= payload.drops.length && next.length === 0) {
      s.done = true;
      setPhase("fim");
      onAnswer({ caught: s.caught });
    }
  }, [onAnswer, payload.drops]);

  useEffect(() => {
    if (phase !== "jogando") return;
    const id = window.setInterval(() => {
      if (!document.hidden) step();
    }, payload.tickMs);
    return () => window.clearInterval(id);
  }, [phase, payload.tickMs, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "jogando") return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        e.preventDefault();
        move(laneRef.current - 1);
      }
      if (k === "arrowright" || k === "d") {
        e.preventDefault();
        move(laneRef.current + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, move]);

  const fb = feedback?.kind === "rain" ? feedback : null;

  return (
    <div>
      <p className="text-lg font-semibold">{payload.rule}</p>
      <p className="mt-1 text-sm text-muted">
        {payload.drops.length} expressões nesta onda · mova o coletor com ← → (ou A e D) ou toque na pista.
      </p>

      <div className="relative mt-4 select-none overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#040a17]" style={{ height: `${ROWS * 3.25}rem` }}>
        {/* Pistas (tocar move o coletor) */}
        <div className="absolute inset-0 grid grid-cols-3">
          {[0, 1, 2].map((l) => (
            <button
              key={l}
              type="button"
              tabIndex={-1}
              aria-label={`Mover coletor para a pista ${l + 1}`}
              onClick={() => phase === "jogando" && move(l)}
              className={cx("border-line/60 transition-colors motion-reduce:transition-none", l < 2 && "border-r", lane === l && phase === "jogando" && "bg-electric/[0.06]")}
            />
          ))}
        </div>
        {falling.map((f) => (
          <div
            key={f.id}
            className="pointer-events-none absolute w-1/3 px-1.5 transition-[top] duration-200 ease-linear motion-reduce:transition-none"
            style={{ left: `${(f.lane * 100) / 3}%`, top: `${f.row * 3.25 + 0.4}rem` }}
          >
            <code className="block truncate rounded-md border border-line-strong bg-navy px-2 py-1.5 text-center font-mono text-[13px] text-[#dbe7ff]">{f.code}</code>
          </div>
        ))}
        {/* Coletor */}
        <div className="pointer-events-none absolute bottom-0 w-1/3 px-1.5 pb-1.5 transition-[left] duration-100 motion-reduce:transition-none" style={{ left: `${(lane * 100) / 3}%` }}>
          <div className="h-3 rounded-full bg-amber" />
        </div>
        {phase === "pronta" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/80 p-4 text-center">
            <div>
              <p className="font-semibold">{payload.rule}</p>
              <Button className="mt-4" autoFocus onClick={() => setPhase("jogando")}>
                <Play aria-hidden className="size-4" /> Começar a onda
              </Button>
            </div>
          </div>
        )}
      </div>

      {phase === "jogando" && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button variant="secondary" size="lg" aria-label="Mover para a esquerda" onClick={() => move(laneRef.current - 1)}>
            <ArrowLeft aria-hidden className="size-5" />
          </Button>
          <p className="font-mono text-sm text-muted" aria-live="polite">
            {stats.caught} pegas · {stats.spawned}/{payload.drops.length}
          </p>
          <Button variant="secondary" size="lg" aria-label="Mover para a direita" onClick={() => move(laneRef.current + 1)}>
            <ArrowRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {phase === "jogando" && landed.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2 font-mono text-xs" aria-label="Últimas expressões">
          {landed.map((l) => (
            <li key={l.id} className={cx("rounded border px-2 py-0.5", l.caught ? "border-electric/50 text-fg" : "border-line text-subtle")}>
              {l.caught ? "pegou" : "passou"}: {l.code}
            </li>
          ))}
        </ul>
      )}

      {fb && (
        <div className="mt-4">
          <p className="text-sm">
            Pegou <strong className="text-ok">{fb.hits}</strong> de {fb.targets} certas · <strong className={fb.wrong ? "text-bad" : "text-muted"}>{fb.wrong}</strong> isca(s) · deixou passar {fb.missed}.
          </p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {fb.details
              .filter((d) => d.target !== d.caught)
              .map((d) => (
                <li key={d.code} className="flex items-center gap-2 font-mono text-xs">
                  {d.caught ? <X aria-hidden className="size-3.5 text-bad" /> : <Check aria-hidden className="size-3.5 text-warn" />}
                  <span>
                    {d.code} <span className="text-subtle">→</span> {d.value}
                    <span className="ml-1 font-sans text-muted">{d.caught ? "(isca que você pegou)" : "(certa que passou)"}</span>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
