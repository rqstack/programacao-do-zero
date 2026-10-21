import type { Metadata } from "next";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { LogoMark } from "@/components/layout/logo";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com sua conta Google para seu XP contar no ranking.",
};

export default function EntrarPage() {
  return (
    <Container className="max-w-lg py-16">
      <LogoMark className="size-12" />
      <h1 className="mt-6 text-3xl font-bold">Entrar</h1>
      <p className="mt-2 text-muted">Estudar é aberto para todos. Com a conta, seu XP conta no ranking e seu progresso vai com você para qualquer aparelho.</p>
      <div className="mt-8">
        <SignInPanel />
      </div>
    </Container>
  );
}
