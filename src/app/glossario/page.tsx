import type { Metadata } from "next";
import { glossary } from "@content/glossario";
import { GlossarySearch } from "@/components/glossary/glossary-search";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Glossário",
  description: "Os termos de programação usados nas aulas, explicados em linguagem simples.",
};

export default function GlossarioPage() {
  return (
    <Container className="max-w-4xl py-12">
      <PageHeader title="Glossário" description="Os termos usados nas aulas, explicados em linguagem simples." />
      <div className="mt-8">
        <GlossarySearch terms={glossary} />
      </div>
    </Container>
  );
}
