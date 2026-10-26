"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { cx } from "@/components/ui/primitives";

/** Salva ou remove um conteúdo dos favoritos ("tipo:slug"). Fica no progresso e sincroniza com a conta. */
export function FavoriteButton({ favKey, title, compact = false, className }: { favKey: string; title: string; compact?: boolean; className?: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const on = hydrated && Boolean(progress.favorites[favKey]?.on);
  const Icon = on ? BookmarkCheck : Bookmark;
  const label = on ? `Remover "${title}" dos salvos` : `Salvar "${title}" para depois`;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => dispatchProgress({ type: "favorite/set", key: favKey, on: !on })}
      className={cx(
        "inline-flex min-h-9 items-center gap-1.5 rounded-md border text-sm transition-colors",
        compact ? "size-9 justify-center" : "px-3",
        on ? "border-amber/50 text-amber hover:bg-amber/10" : "border-line-strong text-muted hover:border-muted hover:text-fg",
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {!compact && <span>{on ? "Salvo" : "Salvar"}</span>}
    </button>
  );
}
