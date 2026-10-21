import type { Metadata } from "next";
import { PracticeSession } from "@/components/practice/practice-session";
import { Container } from "@/components/ui/primitives";
import { questionBank } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Treino diário",
  description: "Dez perguntas por dia, com vidas e revisão do que você errou. Mantenha sua ofensiva!",
};

export default function TreinoPage() {
  return (
    <Container className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Treino diário</h1>
      <p className="mt-2 text-muted">Alguns minutos por dia mantêm o que você aprendeu fresco na memória e a sua ofensiva acesa.</p>
      <div className="mt-8">
        <PracticeSession bank={questionBank()} />
      </div>
    </Container>
  );
}
