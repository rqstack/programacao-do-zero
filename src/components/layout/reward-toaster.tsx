"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import type { AchievementDefinition } from "@/lib/gamification/rules";
import type { Reward } from "@/lib/progress/model";
import { onReward } from "@/lib/progress/store";
import { RARITY_LABEL, RARITY_STYLE, TrophyBadge } from "@/components/progress/trophy";

interface XpToast {
  id: number;
  title: string;
  detail: string;
}

export const SOUND_KEY = "pdz-som-trofeu";

export function trophySoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Som curto de troféu (duas notas), gerado na hora com Web Audio — sem arquivos. */
function playChime(rarity: AchievementDefinition["rarity"]) {
  if (!trophySoundEnabled()) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = rarity === "platina" ? [784, 988, 1319] : rarity === "ouro" ? [880, 1319] : [784, 1175];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    window.setTimeout(() => ctx.close(), 1200);
  } catch {
    // Sem áudio disponível: a notificação visual continua.
  }
}

let nextId = 1;
const TROPHY_MS = 5200;

/**
 * Avisos de recompensa: XP em um aviso discreto embaixo e troféus no estilo PlayStation,
 * no canto superior, um de cada vez, com som curto. Anunciados para leitores de tela.
 */
export function RewardToaster() {
  const [xpToasts, setXpToasts] = useState<XpToast[]>([]);
  const [queue, setQueue] = useState<Array<AchievementDefinition & { key: number }>>([]);
  const [leaving, setLeaving] = useState(false);
  const current = queue[0] ?? null;
  const timers = useRef<number[]>([]);

  useEffect(
    () =>
      onReward((r: Reward) => {
        if (r.xp > 0) {
          const missions = r.missions?.length ? ` · Missão concluída: ${r.missions.map((m) => m.title).join(", ")}` : "";
          const t = { id: nextId++, title: `+${r.xp} XP`, detail: `${r.label}${r.label.startsWith("Missão") ? "" : missions}` };
          setXpToasts((all) => [...all, t].slice(-3));
          timers.current.push(window.setTimeout(() => setXpToasts((all) => all.filter((x) => x.id !== t.id)), 3600));
        }
        if (r.achievements.length > 0) setQueue((q) => [...q, ...r.achievements.map((a) => ({ ...a, key: nextId++ }))]);
      }),
    [],
  );

  // Mostra um troféu por vez: entra, fica alguns segundos, sai e passa para o próximo.
  useEffect(() => {
    if (!current) return;
    playChime(current.rarity);
    const hide = window.setTimeout(() => setLeaving(true), TROPHY_MS);
    const drop = window.setTimeout(() => {
      setLeaving(false);
      setQueue((q) => q.slice(1));
    }, TROPHY_MS + 350);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(drop);
    };
  }, [current]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed right-3 top-20 z-[60] w-[min(23rem,calc(100vw-1.5rem))]">
        {current && (
          <div
            key={current.key}
            className={`trophy-toast pointer-events-auto flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#141a26]/95 p-3 pr-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md ${leaving ? "trophy-toast-out" : ""}`}
            role="status"
          >
            <TrophyBadge icon={current.icon} rarity={current.rarity} size="lg" />
            <div className="min-w-0">
              <p className="text-xs text-muted">Você conquistou um troféu</p>
              <p className="truncate text-base font-bold text-fg">{current.title}</p>
              <p className={`text-xs font-semibold ${RARITY_STYLE[current.rarity].text}`}>
                {RARITY_LABEL[current.rarity]} · {current.description}
              </p>
            </div>
          </div>
        )}
      </div>
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
        {xpToasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-amber/40 bg-navy/95 p-3 shadow-2xl shadow-black/50">
            <Zap aria-hidden className="mt-0.5 size-4 text-amber" />
            <div>
              <p className="text-sm font-semibold text-amber">{t.title}</p>
              <p className="text-xs text-muted">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
