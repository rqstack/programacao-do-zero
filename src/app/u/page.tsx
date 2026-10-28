import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicProfileView } from "@/components/profile/public-profile";
import { Container, Spinner } from "@/components/ui/primitives";
import { portfolioCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Portfólio de quem estuda na Programação do Zero: projetos, trilhas, conquistas, GitHub e LinkedIn.",
};

export default function PerfilPublicoPage() {
  return (
    <Container className="py-12">
      <Suspense fallback={<Spinner label="Carregando perfil" />}>
        <PublicProfileView catalog={portfolioCatalog()} />
      </Suspense>
    </Container>
  );
}
