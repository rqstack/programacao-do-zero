import type { Metadata } from "next";
import { BattleHub } from "@/components/battle/battle-hub";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Batalha de Código",
  description: "Multiplayer de programação: duas pessoas, o mesmo problema e o mesmo tempo. Vence quem enviar primeiro uma solução correta. Arenas, troféus e ranking próprio.",
};

export default function BatalhaPage() {
  return (
    <Container className="py-12">
      <PageHeader
        title="Batalha de Código"
        description="Duas pessoas de verdade, o mesmo problema, o mesmo tempo. Vence quem enviar primeiro uma solução correta, conferida no servidor. Suba de arena ganhando troféus."
      />
      <div className="mt-10">
        <BattleHub />
      </div>
    </Container>
  );
}
