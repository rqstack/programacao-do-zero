import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Target } from "lucide-react";
import { headingsOf, Markdown } from "@/components/content/markdown";
import { VideoCourses } from "@/components/content/video-courses";
import { CodeBlock } from "@/components/content/code-block";
import { FavoriteButton } from "@/components/learn/favorite-button";
import { LessonNotes } from "@/components/learn/lesson-notes";
import { CompleteLessonButton, ExercisePanel, LessonQuiz } from "@/components/learn/lesson-practice";
import { lessonExample } from "@/lib/tutor/tutor";
import { Container } from "@/components/ui/primitives";
import { allLessons, getLessonPage } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allLessons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: PageProps<"/aulas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getLessonPage(slug);
  return page ? { title: page.lesson.title, description: page.lesson.objective } : {};
}

export default async function AulaPage(props: PageProps<"/aulas/[slug]">) {
  const { slug } = await props.params;
  const page = getLessonPage(slug);
  if (!page) notFound();
  const { course, lesson, data, body, previous, next, nextCourse } = page;
  const toc = [...headingsOf(body), { id: "pratica", text: "Pratique" }, { id: "anotacoes", text: "Minhas anotações" }];
  const example = lessonExample(body, data.exercise.accepted);

  return (
    <Container className="py-10">
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <Link href="/trilhas" className="hover:text-fg">
          Trilhas
        </Link>{" "}
        /{" "}
        <Link href={`/trilhas/${course.slug}`} className="hover:text-fg">
          {course.title}
        </Link>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <article>
          <header className="border-b border-line pb-8">
            <p className="font-mono text-xs text-subtle">
              Aula {lesson.number} de {course.lessons.length} · {lesson.moduleTitle}
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold sm:text-4xl">{lesson.title}</h1>
              <FavoriteButton favKey={`lesson:${lesson.slug}`} title={lesson.title} className="mt-1 shrink-0" />
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-navy/60 p-4">
              <Target aria-hidden className="mt-0.5 size-5 shrink-0 text-amber" />
              <p className="text-sm">
                <span className="font-semibold">Objetivo:</span> <span className="text-muted">{lesson.objective}</span>
              </p>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-subtle">
              <Clock aria-hidden className="size-3.5" /> cerca de {lesson.minutes} minutos
            </p>
          </header>

          <Markdown source={body} className="mt-8" />

          <VideoCourses courseSlug={course.slug} compact className="mt-12 rounded-[var(--radius-lg)] border border-line p-5 sm:p-6" />

          <section id="pratica" aria-labelledby="pratica-titulo" className="mt-16 scroll-mt-24 space-y-12 border-t border-line pt-10">
            <h2 id="pratica-titulo" className="text-2xl font-bold">
              Pratique
            </h2>
            <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 sm:p-6">
              <h3 className="mb-4 font-semibold text-muted">Exercício</h3>
              <ExercisePanel
                slug={lesson.slug}
                title={lesson.title}
                exercise={data.exercise}
                tutor={{
                  objective: lesson.objective,
                  summary: lesson.summary,
                  example: example ? <CodeBlock code={example.code} language={example.lang} /> : null,
                  sections: headingsOf(body),
                }}
              />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 sm:p-6">
              <h3 className="mb-6 font-semibold text-muted">Quiz de revisão</h3>
              <LessonQuiz slug={lesson.slug} title={lesson.title} questions={data.quiz} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CompleteLessonButton slug={lesson.slug} title={lesson.title} />
            </div>
          </section>

          <section id="anotacoes" aria-label="Minhas anotações" className="mt-12 scroll-mt-24 rounded-[var(--radius-lg)] border border-line p-5 sm:p-6">
            <LessonNotes slug={lesson.slug} />
          </section>

          <nav aria-label="Navegação entre aulas" className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            {previous ? (
              <Link href={`/aulas/${previous.slug}`} className="group rounded-[var(--radius-md)] border border-line p-4 hover:border-muted">
                <span className="inline-flex items-center gap-1 text-xs text-subtle">
                  <ArrowLeft aria-hidden className="size-3.5" /> Aula anterior
                </span>
                <span className="mt-1 block font-semibold group-hover:text-electric-hi">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/aulas/${next.slug}`} className="group rounded-[var(--radius-md)] border border-electric/50 p-4 text-right hover:border-electric">
                <span className="inline-flex items-center gap-1 text-xs text-subtle">
                  Próxima aula <ArrowRight aria-hidden className="size-3.5" />
                </span>
                <span className="mt-1 block font-semibold group-hover:text-electric-hi">{next.title}</span>
              </Link>
            ) : nextCourse ? (
              <Link href={`/trilhas/${nextCourse.slug}`} className="group rounded-[var(--radius-md)] border border-amber/50 p-4 text-right hover:border-amber">
                <span className="inline-flex items-center gap-1 text-xs text-subtle">
                  Fim da trilha · próxima trilha <ArrowRight aria-hidden className="size-3.5" />
                </span>
                <span className="mt-1 block font-semibold">{nextCourse.title}</span>
              </Link>
            ) : (
              <Link href="/progresso" className="rounded-[var(--radius-md)] border border-amber/50 p-4 text-right">
                <span className="text-xs text-subtle">Você chegou ao fim</span>
                <span className="mt-1 block font-semibold">Ver meu progresso</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <nav aria-label="Nesta aula" className="sticky top-24">
            <p className="text-xs font-semibold text-subtle">Nesta aula</p>
            <ul className="mt-3 space-y-1.5 border-l border-line">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-muted hover:border-electric hover:text-fg">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </Container>
  );
}
