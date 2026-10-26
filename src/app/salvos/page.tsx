import type { Metadata } from "next";
import { SavedBoard } from "@/components/learn/saved-board";
import { Container, PageHeader } from "@/components/ui/primitives";
import { searchIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Salvos e anotações",
  description: "Seus conteúdos favoritos e as anotações que você fez nas aulas.",
  robots: { index: false },
};

export default function SalvosPage() {
  const entries = searchIndex().filter((e) => e.fav || e.kind === "aula");
  return (
    <Container className="py-10">
      <PageHeader title="Salvos e anotações" description="O que você guardou para ver depois e o que escreveu nas aulas." />
      <div className="mt-10">
        <SavedBoard entries={entries} />
      </div>
    </Container>
  );
}
