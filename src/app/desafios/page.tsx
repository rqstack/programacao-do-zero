import type { Metadata } from "next";
import { ChallengeArena } from "@/components/challenges/challenge-arena";
import { Container, PageHeader } from "@/components/ui/primitives";
import { codeChallenges, sqlChallenges } from "@content/challenges";

export const metadata: Metadata = {
  title: "Desafios de código",
  description: "Escolha a linguagem e a dificuldade, receba um problema e resolva programando. Testes gerados na hora, direto no navegador.",
};

export default function DesafiosPage() {
  return (
    <Container className="py-12">
      <PageHeader
        title="Desafios de código"
        description={`Escolha a linguagem e a dificuldade e receba um problema para resolver programando. São ${codeChallenges.length} problemas em JavaScript, TypeScript e Python e ${sqlChallenges.length} em SQL. Seu código roda no navegador, isolado, e é testado com casos novos a cada envio.`}
      />
      <div className="mt-10">
        <ChallengeArena />
      </div>
    </Container>
  );
}
