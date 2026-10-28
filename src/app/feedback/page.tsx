import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Relatar um problema",
  description: "Conte um problema técnico, uma resposta errada, uma aula confusa ou uma sugestão de conteúdo.",
  robots: { index: false },
};

export default function FeedbackPage() {
  return (
    <Container className="py-10">
      <PageHeader title="Relatar um problema" description="Achou um erro, uma resposta que parece errada ou uma aula confusa? Conte aqui. Não precisa de nome nem de e-mail." />
      <div className="mt-8">
        <FeedbackForm />
      </div>
    </Container>
  );
}
