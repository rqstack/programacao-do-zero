"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { BookOpen, Flame, Heart, Menu, Search, X } from "lucide-react";
import { levelFromXp } from "@/lib/gamification/rules";
import { dailyXp, streaks, totalXp } from "@/lib/progress/model";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { cx } from "@/components/ui/primitives";
import { AccountButton } from "@/components/auth/account-button";
import { Logo } from "./logo";

export const NAV = [
  { href: "/trilhas", label: "Trilhas" },
  { href: "/treino", label: "Treino" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/jogos", label: "Jogos" },
  { href: "/desafios", label: "Desafios" },
  { href: "/batalha", label: "Batalha" },
  { href: "/ranking", label: "Ranking" },
  { href: "/projetos", label: "Projetos" },
  { href: "/laboratorio", label: "Laboratório" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Anel da meta diária ao redor do número do nível. */
function GoalRing({ value, level }: { value: number; level: number | null }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className="relative grid size-9 place-items-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-9 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#1e2c49" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={v >= 1 ? "#34d399" : "#ffb547"} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} />
      </svg>
      <span className="font-mono text-xs font-bold text-amber">{level ?? "·"}</span>
    </span>
  );
}

function XpChip() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const now = new Date();
  const level = levelFromXp(totalXp(progress));
  const today = dailyXp(progress, now);
  const goal = progress.settings.dailyGoal;
  const { current } = streaks(progress.days, now);
  const label = hydrated
    ? `Meu progresso: nível ${level.level}, ${level.totalXp} XP, ${today} de ${goal} XP hoje, ofensiva de ${current} dia${current === 1 ? "" : "s"}`
    : "Meu progresso";
  return (
    <Link href="/progresso" className="group flex min-h-10 items-center gap-2 rounded-full border border-line-strong py-0.5 pl-0.5 pr-3 text-sm hover:border-amber/60" aria-label={label}>
      <GoalRing value={hydrated ? today / goal : 0} level={hydrated ? level.level : null} />
      <span aria-hidden className={cx("flex items-center gap-0.5 font-mono text-xs", hydrated && current > 0 ? "text-amber" : "text-subtle")}>
        <Flame className="size-4" /> {hydrated ? current : 0}
      </span>
      <span aria-hidden className="hidden font-mono text-xs text-muted group-hover:text-fg sm:inline xl:hidden">
        {hydrated ? `${level.totalXp} XP` : ""}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden flex-1 xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cx(
                    "rounded-md px-2 py-2 text-sm transition-colors",
                    isActive(pathname, item.href) ? "bg-panel text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/busca"
            aria-current={isActive(pathname, "/busca") ? "page" : undefined}
            title="Buscar no site"
            aria-label="Buscar no site"
            className="grid size-10 place-items-center rounded-full border border-line-strong text-muted hover:border-muted hover:text-fg"
          >
            <Search aria-hidden className="size-4" />
          </Link>
          <Link
            href="/ebook"
            aria-current={isActive(pathname, "/ebook") ? "page" : undefined}
            title="E-book do autor"
            aria-label="Ebook"
            className="hidden min-h-10 items-center gap-1.5 rounded-full border border-amber/50 px-2.5 text-sm font-semibold text-amber hover:bg-amber/10 xl:flex"
          >
            <BookOpen aria-hidden className="size-4" /> <span className="sr-only">Ebook</span>
          </Link>
          <Link
            href="/apoiar"
            aria-current={isActive(pathname, "/apoiar") ? "page" : undefined}
            title="Apoiar o projeto"
            aria-label="Apoiar o projeto"
            className="hidden min-h-10 items-center gap-1.5 rounded-full border border-line-strong px-2.5 text-sm text-muted hover:border-[#f472b6]/60 hover:text-fg xl:flex"
          >
            <Heart aria-hidden className="size-4 text-[#f472b6]" /> <span className="sr-only">Apoiar</span>
          </Link>
          <XpChip />
          <AccountButton />
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="grid size-11 place-items-center rounded-md border border-line-strong xl:hidden"
            aria-label="Abrir menu"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label="Menu"
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,100vw)] max-w-none border-l border-line bg-navy p-0 text-fg backdrop:bg-black/60"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <span className="font-semibold">Menu</span>
          <button type="button" onClick={close} className="grid size-11 place-items-center rounded-md" aria-label="Fechar menu">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <nav aria-label="Menu móvel" className="p-3">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Link href="/ebook" onClick={close} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-amber/50 font-semibold text-amber">
              <BookOpen aria-hidden className="size-4" /> Ebook
            </Link>
            <Link href="/apoiar" onClick={close} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-line-strong text-fg">
              <Heart aria-hidden className="size-4 text-[#f472b6]" /> Apoiar
            </Link>
          </div>
          <ul className="space-y-1">
            {[{ href: "/", label: "Início" }, ...NAV, { href: "/glossario", label: "Glossário" }, { href: "/progresso", label: "Meu progresso" }, { href: "/revisao", label: "Revisar erros" }, { href: "/salvos", label: "Salvos e anotações" }, { href: "/sobre", label: "Sobre o projeto" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={(item.href === "/" ? pathname === "/" : isActive(pathname, item.href)) ? "page" : undefined}
                  className="flex min-h-12 items-center rounded-md px-3 text-base text-muted aria-[current=page]:bg-panel aria-[current=page]:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  );
}
