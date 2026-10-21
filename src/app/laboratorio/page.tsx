import type { Metadata } from "next";
import { Lab } from "@/components/lab/lab";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Laboratório",
  description: "Escreva HTML, CSS e JavaScript e veja o resultado na hora, direto no navegador.",
};

export default function LaboratorioPage() {
  return (
    <Container className="py-12">
      <PageHeader
        title="Laboratório"
        description="Teste os exemplos das aulas e experimente à vontade. O código roda isolado no seu navegador e fica salvo aqui quando você executa."
      />
      <div className="mt-8">
        <Lab />
      </div>
    </Container>
  );
}
