import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Brain, Code, Database, Keyboard, Layers, ListOrdered, MousePointerClick, Rocket, Zap } from "lucide-react";
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
      <Link
        href="/desafios"
        className="group mt-10 flex flex-col gap-4 rounded-[var(--radius-lg)] border-2 border-amber/50 bg-gradient-to-br from-amber/[0.12] to-electric/[0.08] p-6 hover:border-amber sm:flex-row sm:items-center"
      >
        <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-amber text-[#1a1206]">
          <Code aria-hidden className="size-7" strokeWidth={2.4} />
        </span>
        <span className="flex-1">
          <span className="font-mono text-xs text-amber">NOVO · resolva programando</span>
          <span className="mt-1 block text-xl font-bold">Desafios de código</span>
          <span className="mt-1 block text-sm text-muted">Escolha JavaScript, TypeScript, Python ou SQL e a dificuldade. O site sorteia um problema, você escreve o código e ele é testado na hora.</span>
        </span>
        <span className="font-semibold text-amber group-hover:underline">Jogar agora →</span>
      </Link>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
