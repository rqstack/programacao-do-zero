import type { Metadata } from "next";
import { GlobalSearch } from "@/components/search/global-search";
import { Container, PageHeader } from "@/components/ui/primitives";
import { searchIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Encontre aulas, trilhas, quizzes, jogos, projetos, desafios e termos do glossário.",
};

export default function BuscaPage() {
  return (
    <Container className="max-w-3xl py-10">
      <PageHeader title="Buscar" description="Tudo o que existe no site, em um lugar só." />
      <div className="mt-8">
        <GlobalSearch index={searchIndex()} />
      </div>
    </Container>
  );
}
