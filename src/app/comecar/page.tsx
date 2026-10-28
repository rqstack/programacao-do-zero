import type { Metadata } from "next";
import { MyPath } from "@/components/path/my-path";
import { Container, PageHeader } from "@/components/ui/primitives";
import { pathData } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Minha trilha",
  description: "Responda 4 perguntas (ou pule) e receba uma sequência de estudos com as trilhas da plataforma, na ordem dos pré-requisitos.",
};

export default function ComecarPage() {
  const { courses, adaptive } = pathData();
  return (
    <Container className="py-10">
      <PageHeader title="Minha trilha" description="Uma sequência sugerida com as trilhas que já existem aqui. Você pode mudar as respostas ou ignorar a sugestão quando quiser." />
      <div className="mt-10">
        <MyPath courses={courses} adaptive={adaptive} />
      </div>
    </Container>
  );
}
