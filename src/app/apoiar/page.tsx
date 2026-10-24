import type { Metadata } from "next";
import { SupportPix } from "@/components/support/support-pix";
import { Container, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Apoiar o projeto",
  description: "Contribuição voluntária via Pix para manter a Programação do Zero gratuita.",
};

export default function ApoiarPage() {
  return (
    <Container className="max-w-3xl py-12">
      <PageHeader title="Apoiar o projeto" description="A Programação do Zero é e continua gratuita. Se ela te ajudou e você quiser, pode contribuir com qualquer valor a partir de R$ 5,00." />
      <ul className="mt-8 space-y-2 text-sm text-muted">
        <li>• A contribuição é totalmente voluntária e não libera conteúdo, XP, troféus nem vantagens na Batalha.</li>
        <li>• Não é preciso ter conta nem informar nome ou CPF.</li>
        <li>• O pagamento é processado pela Syncpay; a confirmação é feita no servidor, direto com ela.</li>
      </ul>
      <div className="mt-8">
        <SupportPix />
      </div>
    </Container>
  );
}
