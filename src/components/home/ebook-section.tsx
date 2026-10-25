import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import capa from "../../../public/ebook-capa.webp";

export const EBOOK_URL = "https://o-proximo-nivel-da-programacao.vercel.app/";

/** Divulgação do e-book do autor: discreta, sem pop-up e sem bloquear o conteúdo gratuito. */
export function EbookSection({ page = false }: { page?: boolean }) {
  const Heading = page ? "h1" : "h2";
  return (
    <section id="ebook-secao" aria-labelledby="ebook" className={page ? "py-12 sm:py-16" : "border-t border-line py-20"}>
      <Container className="grid items-center gap-10 md:grid-cols-[minmax(0,15rem)_1fr] lg:gap-16">
        <Image
          src={capa}
          alt="Capa do e-book O Próximo Nível da Programação: do código à inteligência artificial"
          className="mx-auto w-44 rounded-[var(--radius-md)] border border-line shadow-xl shadow-black/40 sm:w-52 md:w-full"
          sizes="(min-width: 768px) 240px, 208px"
        />
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-subtle">E-book do autor da plataforma</p>
          <Heading id="ebook" className={page ? "mt-2 text-3xl font-bold sm:text-4xl" : "mt-2 text-2xl font-bold sm:text-3xl"}>
            Você já começou a aprender. Agora é hora de evoluir.
          </Heading>
          <p className="mt-4 text-muted">
            Aprender programação não precisa ser uma jornada de tentativas e dúvidas sem fim. Se você quer aprofundar seus conhecimentos, entender melhor os conceitos e avançar nos estudos, conheça o ebook <strong className="text-fg">O Próximo Nível da Programação</strong>.
          </p>
          <p className="mt-3 text-muted">Conheça o material e continue evoluindo na sua jornada como programador.</p>
          <a
            href={EBOOK_URL}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-electric px-5 font-semibold text-white hover:bg-electric-hi"
          >
            Quero dar o próximo passo <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
          <p className="mt-3 text-xs text-subtle">Todo o conteúdo deste site continua gratuito, com ou sem o e-book.</p>
        </div>
      </Container>
    </section>
  );
}
