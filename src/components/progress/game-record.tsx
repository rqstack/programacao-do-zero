"use client";

import { useHydrated, useProgress } from "@/lib/progress/store";

export function GameRecord({ slug }: { slug: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const g = hydrated ? progress.games[slug] : undefined;
  if (!g) return <span>novo</span>;
  return (
    <span className={g.completed ? "text-amber" : ""}>
      recorde {g.best}/{g.max}
      {g.completed ? " ✓" : ""}
    </span>
  );
}
