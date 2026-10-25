import type { Metadata } from "next";
import { EbookSection } from "@/components/home/ebook-section";

export const metadata: Metadata = {
  title: "E-book O Próximo Nível da Programação",
  description: "Conheça o e-book O Próximo Nível da Programação e continue evoluindo na sua jornada como programador.",
};

export default function EbookPage() {
  return <EbookSection page />;
}
