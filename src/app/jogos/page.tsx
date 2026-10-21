import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Brain, Database, Keyboard, Layers, ListOrdered, MousePointerClick, Rocket, Zap } from "lucide-react";
import { GameRecord } from "@/components/progress/game-record";
import { Container, PageHeader } from "@/components/ui/primitives";
import { allGames } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Jogos interativos para revisar lógica, código, SQL, CSS e desenvolvimento full stack.",
};

const ICONS = {
  logic: Brain,
  bug_hunt: Bug,
  code_order: ListOrdered,
  lightning: Zap,
  memory: Layers,
  sql: Database,
  fullstack: Rocket,
  typing: Keyboard,
  css: MousePointerClick,
} as const;

export default function JogosPage() {
  const games = allGames();
  return (
    <Container className="py-12">
      <PageHeader title="Jogos" description={`${games.length} jogos para revisar brincando. Conclua com 60% de acertos para ganhar XP.`} />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => {
          const Icon = ICONS[g.kind];
          return (
            <li key={g.slug}>
              <Link href={`/jogos/${g.slug}`} className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 transition-colors hover:border-electric">
                <Icon aria-hidden className="size-6 text-electric-hi" />
                <span className="mt-4 text-lg font-semibold">{g.title}</span>
                <span className="mt-1 flex-1 text-sm text-muted">{g.description}</span>
                <span className="mt-4 flex items-center justify-between font-mono text-xs text-subtle">
                  <span>
                    {g.rounds.length} rodadas{g.timeLimitSeconds ? ` · ${g.timeLimitSeconds}s` : ""}
                  </span>
                  <GameRecord slug={g.slug} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
