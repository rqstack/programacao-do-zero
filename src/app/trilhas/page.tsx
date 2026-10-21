import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/primitives";
import { allCourses, CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Trilhas",
  description: "Todas as trilhas de estudo da Programação do Zero, da lógica de programação à inteligência artificial.",
};

export default function TrilhasPage() {
  const courses = allCourses();
  const groups = [...new Set(courses.map((c) => c.category))];
  return (
    <Container className="py-12">
      <PageHeader
        title="Trilhas"
        description={`${courses.length} trilhas, ${courses.reduce((s, c) => s + c.lessons.length, 0)} aulas. A ordem da lista é a sugerida para quem está começando.`}
      />
      <div className="mt-10 space-y-12">
        {groups.map((cat) => (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <h2 id={`cat-${cat}`} className="text-xl font-semibold">
              {CATEGORY_LABEL[cat]}
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {courses
                .filter((c) => c.category === cat)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/trilhas/${c.slug}`}
                      className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 transition-colors hover:border-electric"
                    >
                      <span className="font-mono text-xs text-subtle">
                        {String(c.position + 1).padStart(2, "0")} · {LEVEL_LABEL[c.level]}
                      </span>
                      <span className="mt-2 text-lg font-semibold">{c.title}</span>
                      <span className="mt-2 flex-1 text-sm text-muted">{c.description}</span>
                      <span className="mt-4 font-mono text-xs text-subtle">
                        {c.lessons.length} aulas · {c.modules.length} módulos · ~{Math.max(1, Math.round(c.totalMinutes / 60))} h
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
