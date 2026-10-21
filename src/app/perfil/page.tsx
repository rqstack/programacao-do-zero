import type { Metadata } from "next";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Personalize seu perfil público, coloque seu GitHub e LinkedIn e adicione outras pessoas que estudam aqui.",
};

export default function PerfilPage() {
  return (
    <Container className="py-12">
      <PageHeader title="Meu perfil" description="Seu cartão de visitas de dev: nível, troféus, GitHub e LinkedIn em um link só. Aqui você também adiciona colegas." />
      <div className="mt-10">
        <ProfileEditor />
      </div>
    </Container>
  );
}
