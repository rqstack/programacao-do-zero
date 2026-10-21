import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { QuizStatus } from "@/components/progress/quiz-status";
import { Container, PageHeader } from "@/components/ui/primitives";
import { allCourses, allQuizzes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Quizzes de revisão de cada aula e desafios finais de cada trilha.",
};

export default function QuizzesPage() {
  const quizzes = allQuizzes();
  return (
    <Container className="py-12">
      <PageHeader
        title="Quizzes"
        description={`${quizzes.length} quizzes: uma revisão por aula e um desafio final por trilha. Cada resposta vem com explicação.`}
      />
      <div className="mt-10 space-y-10">
        {allCourses().map((c) => {
          const list = quizzes.filter((q) => q.courseSlug === c.slug);
          return (
            <section key={c.slug} aria-labelledby={`q-${c.slug}`}>
              <h2 id={`q-${c.slug}`} className="text-xl font-semibold">
                {c.title}
              </h2>
              <ul className="mt-3 divide-y divide-line rounded-[var(--radius-lg)] border border-line">
                {list.map((q) => (
                  <li key={q.slug}>
                    <Link href={`/quizzes/${q.slug}`} className="flex min-h-12 items-center justify-between gap-4 px-4 py-3 hover:bg-panel">
                      <span className="flex items-center gap-2">
                        {q.kind === "trilha" && <Trophy aria-hidden className="size-4 shrink-0 text-amber" />}
                        <span className={q.kind === "trilha" ? "font-semibold" : ""}>{q.title}</span>
                        <span className="hidden font-mono text-xs text-subtle sm:inline">{q.questions.length} perguntas</span>
                      </span>
                      <QuizStatus slug={q.slug} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
