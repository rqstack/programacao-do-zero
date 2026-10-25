import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras simples para usar a Programação do Zero.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </section>
  );
}

export default function TermosPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Termos de Uso</h1>
      <p className="mt-3 text-sm text-subtle">Última atualização: 25 de outubro de 2026</p>
      <p className="mt-6 text-lg text-muted">
        Ao usar a Programação do Zero, você concorda com estas regras. Elas existem para manter o site justo, seguro e útil para todo mundo.
      </p>

      <Section id="servico" title="1. O que é o site">
        <p>
          Uma plataforma gratuita para aprender programação, feita como projeto pessoal de estudo e com{" "}
          <Link href="/sobre" className="text-electric-hi underline underline-offset-2">
            vibe coding
          </Link>{" "}
          (em parceria com uma IA). O conteúdo é revisado e testado, mas pode ter erros: a documentação oficial de cada tecnologia é sempre a
          referência final. O site é oferecido como está, sem garantia de funcionamento contínuo, e pode mudar ou sair do ar.
        </p>
      </Section>

      <Section id="conta" title="2. Sua conta">
        <p>
          A conta é opcional e feita pelo login do Google. Você é responsável pelo que publica no seu perfil (nome de usuário, bio e links), que não
          pode conter conteúdo ofensivo, ilegal, enganoso ou que se passe por outra pessoa.
        </p>
      </Section>

      <Section id="regras" title="3. Jogo limpo">
        <ul className="list-disc space-y-1 pl-5">
          <li>Não tente burlar o XP, o ranking ou a Batalha de Código (por exemplo, com scripts, várias contas ou explorando falhas).</li>
          <li>Não envie código feito para atacar, sobrecarregar ou prejudicar o site ou os serviços usados por ele.</li>
          <li>Não use o site para assediar outras pessoas.</li>
        </ul>
        <p>Contas que descumprirem essas regras podem ter pontos removidos ou ser suspensas.</p>
        <p>
          Encontrou uma falha? Avise abrindo uma issue no{" "}
          <a
            href="https://github.com/rqstack/programacao-do-zero/issues"
            className="text-electric-hi underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            repositório do projeto
          </a>
          .
        </p>
      </Section>

      <Section id="apoio" title="4. Apoio voluntário">
        <p>
          Apoios por Pix são doações voluntárias, sem contrapartida: não liberam conteúdo, XP nem qualquer vantagem. O site continua gratuito para
          todos.
        </p>
      </Section>

      <Section id="conteudo" title="5. Conteúdo e código">
        <p>
          O código do site é aberto e está no GitHub. Os textos das aulas são próprios do projeto. Links externos (vídeos, documentação, ebook) levam
          a sites de terceiros, com suas próprias regras.
        </p>
      </Section>

      <Section id="privacidade" title="6. Privacidade">
        <p>
          Como tratamos os seus dados está na{" "}
          <Link href="/privacidade" className="text-electric-hi underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </Section>
    </Container>
  );
}
