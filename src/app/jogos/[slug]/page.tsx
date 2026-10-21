import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/games/game-player";
import { Container } from "@/components/ui/primitives";
import { allGames, getGame } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allGames().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/jogos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const g = getGame(slug);
  return g ? { title: g.title, description: g.description } : {};
}

export default async function JogoPage(props: PageProps<"/jogos/[slug]">) {
  const { slug } = await props.params;
  const game = getGame(slug);
  if (!game) notFound();
  return (
    <Container className="max-w-3xl py-10">
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <Link href="/jogos" className="hover:text-fg">
          Jogos
        </Link>{" "}
        / <span className="text-fg">{game.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold">{game.title}</h1>
      <p className="mt-2 text-muted">{game.description}</p>
      <div className="mt-8">
        <GamePlayer game={game} />
      </div>
    </Container>
  );
}
