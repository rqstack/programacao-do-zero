"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ACHIEVEMENTS, type Rarity } from "@/lib/gamification/rules";
import type { ProgressState } from "@/lib/progress/model";
import { SOUND_KEY, trophySoundEnabled } from "@/components/layout/reward-toaster";
import { cx } from "@/components/ui/primitives";
import { RARITY_LABEL, RARITY_STYLE, TrophyBadge } from "./trophy";

const ORDER: Rarity[] = ["platina", "ouro", "prata", "bronze"];

/** Vitrine de troféus: contagem por raridade e cada troféu com ícone. */
export function TrophyCase({ progress }: { progress: ProgressState }) {
  const [sound, setSound] = useState(() => (typeof window === "undefined" ? true : trophySoundEnabled()));
  const earned = (slug: string) => progress.achievements[slug];
  const total = ACHIEVEMENTS.length;
  const got = ACHIEVEMENTS.filter((a) => earned(a.slug)).length;

  return (
    <section aria-labelledby="conquistas">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="conquistas" className="text-xl font-semibold">
          Troféus{" "}
          <span className="font-mono text-sm text-muted">
            {got}/{total}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => {
            const next = !sound;
            setSound(next);
            try {
              window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
            } catch {
              /* sem armazenamento */
            }
          }}
          aria-pressed={sound}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-xs text-muted hover:text-fg"
        >
          {sound ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />} Som dos troféus {sound ? "ligado" : "desligado"}
        </button>
      </div>

      <ul className="mt-4 flex flex-wrap gap-3" aria-label="Troféus por raridade">
        {ORDER.map((r) => {
          const list = ACHIEVEMENTS.filter((a) => a.rarity === r);
          const n = list.filter((a) => earned(a.slug)).length;
          return (
            <li key={r} className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
              <span aria-hidden className={cx("size-3 rounded-full", RARITY_STYLE[r].bg)} />
              <span className={RARITY_STYLE[r].text}>{RARITY_LABEL[r]}</span>
              <span className="font-mono text-muted">
                {n}/{list.length}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...ACHIEVEMENTS]
          .sort((a, b) => Number(Boolean(earned(b.slug))) - Number(Boolean(earned(a.slug))))
          .map((a) => {
            const at = earned(a.slug);
            return (
              <li key={a.slug} className={cx("flex items-center gap-3 rounded-[var(--radius-lg)] border p-4", at ? "border-line-strong bg-navy" : "border-line opacity-60")}>
                <TrophyBadge icon={a.icon} rarity={a.rarity} locked={!at} />
                <div className="min-w-0">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted">{a.description}</p>
                  <p className={cx("mt-1 text-xs", at ? RARITY_STYLE[a.rarity].text : "text-subtle")}>
                    {RARITY_LABEL[a.rarity]} · {at ? `conquistado em ${new Date(at).toLocaleDateString("pt-BR")}` : "bloqueado"}
                  </p>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
