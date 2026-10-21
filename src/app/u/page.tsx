import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicProfileView } from "@/components/profile/public-profile";
import { Container, Spinner } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Perfil de quem estuda na Programação do Zero: nível, XP, troféus, GitHub e LinkedIn.",
};

export default function PerfilPublicoPage() {
  return (
    <Container className="py-12">
      <Suspense fallback={<Spinner label="Carregando perfil" />}>
        <PublicProfileView />
      </Suspense>
    </Container>
  );
}
