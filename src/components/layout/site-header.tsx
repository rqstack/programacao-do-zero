"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Menu, X } from "lucide-react";
import { levelFromXp } from "@/lib/gamification/rules";
import { totalXp } from "@/lib/progress/model";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { cx } from "@/components/ui/primitives";
import { Logo } from "./logo";

export const NAV = [
  { href: "/trilhas", label: "Trilhas" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/jogos", label: "Jogos" },
  { href: "/laboratorio", label: "Laboratório" },
  { href: "/projetos", label: "Projetos" },
  { href: "/glossario", label: "Glossário" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function XpChip({ compact = false }: { compact?: boolean }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const level = levelFromXp(totalXp(progress));
  return (
    <Link
      href="/progresso"
      className="group flex min-h-10 items-center gap-2 rounded-full border border-line-strong py-1 pl-1 pr-3 text-sm hover:border-amber/60"
      aria-label={hydrated ? `Meu progresso: nível ${level.level}, ${level.totalXp} XP` : "Meu progresso"}
    >
      <span aria-hidden className="grid size-8 place-items-center rounded-full bg-amber/15 font-mono text-xs font-bold text-amber">
        {hydrated ? level.level : "·"}
      </span>
      {!compact && (
        <span className="font-mono text-xs text-muted group-hover:text-fg">{hydrated ? `${level.totalXp} XP` : "Progresso"}</span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cx(
                    "rounded-md px-3 py-2 text-sm transition-colors",
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
          <XpChip />
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="grid size-11 place-items-center rounded-md border border-line-strong lg:hidden"
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
          <ul className="space-y-1">
            {[{ href: "/", label: "Início" }, ...NAV, { href: "/progresso", label: "Meu progresso" }, { href: "/sobre", label: "Sobre o projeto" }].map((item) => (
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
