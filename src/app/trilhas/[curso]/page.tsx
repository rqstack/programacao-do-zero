import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { CourseMap } from "@/components/progress/course-map";
import { Container } from "@/components/ui/primitives";
import { allCourses, getCourse, LEVEL_LABEL } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allCourses().map((c) => ({ curso: c.slug }));
}

export async function generateMetadata(props: PageProps<"/trilhas/[curso]">): Promise<Metadata> {
  const { curso } = await props.params;
  const c = getCourse(curso);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function CursoPage(props: PageProps<"/trilhas/[curso]">) {
  const { curso } = await props.params;
  const course = getCourse(curso);
  if (!course) notFound();

  return (
    <Container className="py-12">
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <Link href="/trilhas" className="hover:text-fg">
          Trilhas
        </Link>{" "}
        / <span className="text-fg">{course.title}</span>
      </nav>
      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{course.description}</p>
          <p className="mt-3 font-mono text-xs text-subtle">
            {LEVEL_LABEL[course.level]} · {course.lessons.length} aulas · ~{Math.max(1, Math.round(course.totalMinutes / 60))} h de estudo
          </p>
          <div className="mt-10">
            <CourseMap modules={course.modules} />
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 lg:sticky lg:top-24">
          <Trophy aria-hidden className="size-5 text-amber" />
          <h2 className="font-semibold">Desafio final</h2>
          <p className="text-sm text-muted">
            Uma pergunta de cada aula da trilha. Bom para revisar antes de seguir para a próxima.
          </p>
          <Link href={`/quizzes/desafio-${course.slug}`} className="inline-flex min-h-10 items-center rounded-md border border-line-strong px-4 text-sm font-semibold hover:border-amber/60">
            Fazer o desafio
          </Link>
        </aside>
      </div>
    </Container>
  );
}
