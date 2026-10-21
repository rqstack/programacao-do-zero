import type { Metadata } from "next";
import { Leaderboard } from "@/components/ranking/leaderboard";
import { Container, PageHeader } from "@/components/ui/primitives";
import { LEVEL_TITLES, xpForLevel } from "@/lib/gamification/rules";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Liga da semana e ranking geral de XP da Programação do Zero.",
};

export default function RankingPage() {
  return (
    <Container className="py-12">
      <PageHeader title="Ranking" description="Quem mais aprendeu esta semana e desde sempre. A liga semanal recomeça toda segunda-feira." />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_18rem]">
        <Leaderboard />
        <aside aria-labelledby="titulos" className="h-fit rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5">
          <h2 id="titulos" className="font-semibold">
            Títulos por nível
          </h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {LEVEL_TITLES.map((t, i) => (
              <li key={t} className="flex justify-between gap-3">
                <span>
                  <span className="mr-2 font-mono text-xs text-subtle">{i + 1}</span>
                  {t}
                </span>
                <span className="font-mono text-xs text-subtle">{xpForLevel(i + 1)} XP</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </Container>
  );
}
