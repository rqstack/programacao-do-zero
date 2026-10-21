"use client";

import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  CalendarCheck,
  CircleCheck,
  Code,
  ClipboardCheck,
  Cog,
  Crosshair,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  Gamepad2,
  Gem,
  Hammer,
  Joystick,
  Languages,
  Library,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Swords,
  Target,
  Terminal,
  Trophy,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Rarity } from "@/lib/gamification/rules";
import { cx } from "@/components/ui/primitives";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  "book-open": BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  "calendar-check": CalendarCheck,
  "circle-check": CircleCheck,
  "clipboard-check": ClipboardCheck,
  code: Code,
  cog: Cog,
  crosshair: Crosshair,
  crown: Crown,
  dumbbell: Dumbbell,
  flame: Flame,
  footprints: Footprints,
  gamepad: Gamepad2,
  gem: Gem,
  hammer: Hammer,
  joystick: Joystick,
  languages: Languages,
  library: Library,
  medal: Medal,
  rocket: Rocket,
  sparkles: Sparkles,
  star: Star,
  swords: Swords,
  target: Target,
  terminal: Terminal,
  trophy: Trophy,
  wrench: Wrench,
  zap: Zap,
};

export const RARITY_LABEL: Record<Rarity, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro", platina: "Platina" };

/** Cores de cada raridade: bronze, prata, ouro e platina (azul gelo). */
export const RARITY_STYLE: Record<Rarity, { ring: string; text: string; bg: string }> = {
  bronze: { ring: "ring-[#cd8a4e]", text: "text-[#e0a06a]", bg: "bg-[radial-gradient(circle_at_30%_30%,#f0b47c,#8a4f22)]" },
  prata: { ring: "ring-[#c4ccd8]", text: "text-[#d6dde8]", bg: "bg-[radial-gradient(circle_at_30%_30%,#f4f7fb,#7c8698)]" },
  ouro: { ring: "ring-[#ffcf4a]", text: "text-[#ffd76a]", bg: "bg-[radial-gradient(circle_at_30%_30%,#fff0a8,#c58a0d)]" },
  platina: { ring: "ring-[#b9e6ff]", text: "text-[#c8ecff]", bg: "bg-[radial-gradient(circle_at_30%_30%,#ffffff,#6fb9e6_55%,#5a63c9)]" },
};

export function TrophyBadge({ icon, rarity, locked = false, size = "md" }: { icon: string; rarity: Rarity; locked?: boolean; size?: "md" | "lg" }) {
  const Icon = ICONS[icon] ?? Trophy;
  const style = RARITY_STYLE[rarity];
  return (
    <span
      aria-hidden
      className={cx(
        "grid shrink-0 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-navy",
        size === "lg" ? "size-14" : "size-11",
        locked ? "bg-panel-2 ring-line-strong" : cx(style.bg, style.ring),
      )}
    >
      <Icon className={cx(size === "lg" ? "size-7" : "size-5", locked ? "text-subtle" : "text-[#1a1206] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]")} strokeWidth={2.4} />
    </span>
  );
}
