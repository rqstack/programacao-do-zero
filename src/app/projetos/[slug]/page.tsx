import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { ProjectChecklist } from "@/components/progress/project-checklist";
import { Container, Tag } from "@/components/ui/primitives";
import { allProjects, getProject, LEVEL_LABEL } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/projetos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProject(slug);
  return p ? { title: p.project.title, description: p.project.summary } : {};
}

export default async function ProjetoPage(props: PageProps<"/projetos/[slug]">) {
  const { slug } = await props.params;
  const data = getProject(slug);
  if (!data) notFound();
  const { project, body } = data;
  return (
    <Container className="py-10">
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <Link href="/projetos" className="hover:text-fg">
          Projetos
        </Link>{" "}
        / <span className="text-fg">{project.title}</span>
      </nav>
      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article>
          <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
            {LEVEL_LABEL[project.level]}
            {project.portfolio && <Tag tone="amber">Para o portfólio e vagas</Tag>}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{project.title}</h1>
          <p className="mt-3 text-muted">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.skills.map((s) => (
              <Tag key={s} tone="electric">
                {s}
              </Tag>
            ))}
          </div>
          <Markdown source={body} className="mt-8" />
        </article>
        <aside className="h-fit rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Critérios de conclusão</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Marque cada item quando o seu projeto cumprir. Fica salvo neste navegador.</p>
          <ProjectChecklist slug={project.slug} title={project.title} criteria={project.criteria} />
        </aside>
      </div>
    </Container>
  );
}
