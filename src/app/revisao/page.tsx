import type { Metadata } from "next";
import { ReviewBoard } from "@/components/learn/review-board";
import { Container, PageHeader } from "@/components/ui/primitives";
import { allLessons, questionBank } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Revisar erros",
  description: "As perguntas que você errou, para refazer com explicação até acertar.",
  robots: { index: false },
};

export default function RevisaoPage() {
  const courseOf = new Map(allLessons().map((l) => [l.slug, l.courseTitle]));
  const bank = questionBank().map((q) => ({ ...q, courseTitle: courseOf.get(q.lessonSlug) ?? "" }));
  return (
    <Container className="max-w-4xl py-10">
      <PageHeader title="Revisar erros" description="Perguntas que você errou nos quizzes e no treino. Refaça, leia a explicação e veja sua evolução." />
      <div className="mt-10">
        <ReviewBoard bank={bank} />
      </div>
    </Container>
  );
}
