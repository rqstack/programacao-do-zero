import type { Metadata } from "next";
import Link from "next/link";
import { ProjectBadge } from "@/components/progress/project-checklist";
import { Container, PageHeader, Tag } from "@/components/ui/primitives";
import { allProjects, LEVEL_LABEL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Projetos guiados",
  description: "Projetos com requisitos, etapas e critérios de conclusão, do primeiro site a aplicações com banco de dados e IA.",
};

export default function ProjetosPage() {
  const projects = allProjects();
  return (
    <Container className="py-12">
      <PageHeader
        title="Projetos guiados"
        description="Do primeiro site a uma aplicação com banco de dados, login e IA. Cada projeto tem requisitos, etapas, código de partida e critérios de conclusão."
      />
      <ol className="mt-10 space-y-3">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/projetos/${p.slug}`} className="grid gap-3 rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 transition-colors hover:border-electric sm:grid-cols-[3rem_1fr_auto] sm:items-center">
              <span className="font-mono text-sm text-subtle">P{i + 1}</span>
              <span>
                <span className="block text-lg font-semibold">{p.title}</span>
                <span className="mt-1 block text-sm text-muted">{p.summary}</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </span>
              </span>
              <span className="flex flex-col items-start gap-1 sm:items-end">
                <span className="font-mono text-xs text-subtle">{LEVEL_LABEL[p.level]}</span>
                {p.portfolio && <Tag tone="amber">Para o portfólio</Tag>}
                <ProjectBadge slug={p.slug} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Container>
  );
}
