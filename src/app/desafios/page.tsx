import type { Metadata } from "next";
import { ChallengeArena } from "@/components/challenges/challenge-arena";
import { Container, PageHeader } from "@/components/ui/primitives";
import { codeChallenges, sqlChallenges } from "@content/challenges";
import { CHALLENGE_LANGS } from "@/lib/challenges/langs";

export const metadata: Metadata = {
  title: "Desafios de código",
  description: "Escolha a linguagem e a dificuldade, receba um problema e resolva programando. Testes gerados na hora, direto no navegador.",
};

export default function DesafiosPage() {
  return (
    <Container className="py-12">
      <PageHeader
        title="Desafios de código"
        description={`Escolha a linguagem e a dificuldade e receba um problema para resolver programando. São ${codeChallenges.length} problemas de lógica, que podem ser resolvidos em até ${CHALLENGE_LANGS.length - 1} linguagens, e ${sqlChallenges.length} em SQL. JavaScript, TypeScript, Python e SQL rodam isolados no seu navegador; Java, C, C++, C#, Go, Rust e PHP são executados pelo Judge0 público, sem rede e com limite de tempo. Cada envio é testado com casos novos.`}
      />
      <div className="mt-10">
        <ChallengeArena />
      </div>
    </Container>
  );
}
