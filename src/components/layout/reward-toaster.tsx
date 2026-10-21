"use client";

import { useEffect, useState } from "react";
import { Trophy, Zap } from "lucide-react";
import type { Reward } from "@/lib/progress/model";
import { onReward } from "@/lib/progress/store";

interface Toast {
  id: number;
  title: string;
  detail: string;
  kind: "xp" | "achievement";
}

let nextId = 1;

/** Avisos discretos de XP e conquistas. Anunciados para leitores de tela via aria-live. */
export function RewardToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      onReward((r: Reward) => {
        const fresh: Toast[] = [];
        if (r.xp > 0) fresh.push({ id: nextId++, kind: "xp", title: `+${r.xp} XP`, detail: r.label });
        for (const a of r.achievements) fresh.push({ id: nextId++, kind: "achievement", title: `Conquista: ${a.title}`, detail: a.description });
        setToasts((t) => [...t, ...fresh].slice(-4));
        for (const t of fresh) {
          setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), 4200);
        }
      }),
    [],
  );

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-amber/40 bg-navy/95 p-3 shadow-2xl shadow-black/50">
          {t.kind === "xp" ? <Zap aria-hidden className="mt-0.5 size-4 text-amber" /> : <Trophy aria-hidden className="mt-0.5 size-4 text-amber" />}
          <div>
            <p className="text-sm font-semibold text-amber">{t.title}</p>
            <p className="text-xs text-muted">{t.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
