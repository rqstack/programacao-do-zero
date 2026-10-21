import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/learn/quiz-runner";
import { Container } from "@/components/ui/primitives";
import { allQuizzes, getQuiz } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allQuizzes().map((q) => ({ slug: q.slug }));
}

export async function generateMetadata(props: PageProps<"/quizzes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const q = getQuiz(slug);
  return q ? { title: q.title, description: q.description } : {};
}

export default async function QuizPage(props: PageProps<"/quizzes/[slug]">) {
  const { slug } = await props.params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();
  return (
    <Container className="max-w-3xl py-10">
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <Link href="/quizzes" className="hover:text-fg">
          Quizzes
        </Link>{" "}
        /{" "}
        <Link href={`/trilhas/${quiz.courseSlug}`} className="hover:text-fg">
          {quiz.courseTitle}
        </Link>
      </nav>
      <h1 className="mt-4 text-3xl font-bold">{quiz.title}</h1>
      <p className="mt-2 text-muted">
        {quiz.description} Para passar: {quiz.passPercent}% de acertos.
        {quiz.lessonSlug && (
          <>
            {" "}
            <Link href={`/aulas/${quiz.lessonSlug}`} className="text-electric-hi underline underline-offset-2">
              Rever a aula
            </Link>
            .
          </>
        )}
      </p>
      <div className="mt-10">
        <QuizRunner slug={quiz.slug} title={quiz.title} questions={quiz.questions} questionIds={quiz.questionIds} passPercent={quiz.passPercent} />
      </div>
    </Container>
  );
}
