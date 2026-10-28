import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/dashboard";
import { Container, PageHeader } from "@/components/ui/primitives";
import { AdaptivePanel } from "@/components/path/adaptive-panel";
import { allCourses, allLessons, pathData } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Meu progresso",
  description: "XP, nível, sequência de estudos, conquistas e histórico — salvos no seu navegador.",
};

export default function ProgressoPage() {
  const courses = allCourses().map((c) => ({ slug: c.slug, title: c.title, lessonSlugs: c.lessons.map((l) => l.slug) }));
  const order = allLessons().map((l) => ({ slug: l.slug, title: l.title, courseTitle: l.courseTitle }));
  return (
    <Container className="py-12">
      <PageHeader title="Meu progresso" description="Tudo o que você conquistou até aqui. Sem conta: os dados ficam neste navegador." />
      <div className="mt-10">
        <ProgressDashboard courses={courses} order={order} />
      </div>
      <div className="mt-12">
        <AdaptivePanel data={pathData().adaptive} />
      </div>
    </Container>
  );
}
