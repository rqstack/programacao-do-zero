import type { Metadata } from "next";
import Link from "next/link";
import { Bot, GitBranch, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description: "Um projeto pessoal de estudo, gratuito e aberto, criado com vibe coding.",
};

export default function SobrePage() {
  return (
    <Container className="max-w-3xl py-12">
      <LogoMark className="size-14" />
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Sobre a Programação do Zero</h1>
      <p className="mt-4 text-lg text-muted">
        Uma plataforma gratuita para quem quer aprender programação do começo, no próprio ritmo e sem precisar criar conta.
      </p>

      <section aria-labelledby="vibe" className="mt-12 rounded-[var(--radius-lg)] border border-electric/40 bg-electric/[0.06] p-6">
        <Bot aria-hidden className="size-6 text-electric-hi" />
        <h2 id="vibe" className="mt-3 text-xl font-semibold">
          Um projeto de vibe coding
        </h2>
        <div className="mt-3 space-y-3 text-muted">
          <p>
            Este site é um projeto pessoal de estudo. Ele foi construído com <strong className="text-fg">vibe coding</strong>: o autor descreve o
            que quer, uma inteligência artificial escreve boa parte do código e do conteúdo, e ele revisa, testa e decide os próximos passos.
          </p>
          <p>
            A ideia é estudar IA para entendê-la de verdade: onde ela acelera o trabalho, onde erra e por que tudo o que ela produz precisa ser
            verificado. É exatamente o que as aulas de inteligência artificial ensinam.
          </p>
          <p>Encontrou algo errado em uma aula? Avise abrindo uma issue no repositório — corrigir faz parte do processo.</p>
        </div>
      </section>

      <section aria-labelledby="como" className="mt-12">
        <h2 id="como" className="text-xl font-semibold">
          Como o conteúdo é feito
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li>Toda aula segue a mesma estrutura: objetivo, explicação, conceitos, exemplo, código explicado, erros comuns, resumo, exercício e quiz.</li>
          <li>Testes automáticos conferem se cada aula tem todas as seções, se os gabaritos são válidos e se os blocos de JavaScript têm sintaxe correta.</li>
          <li>A estrutura das trilhas segue o e-book <em>O Próximo Nível da Programação</em>, do mesmo autor.</li>
          <li>A documentação oficial de cada tecnologia é sempre a referência final.</li>
        </ul>
      </section>

      <section id="privacidade" aria-labelledby="privacidade-titulo" className="mt-12 scroll-mt-24">
        <ShieldCheck aria-hidden className="size-6 text-ok" />
        <h2 id="privacidade-titulo" className="mt-3 text-xl font-semibold">
          Privacidade
        </h2>
        <div className="mt-3 space-y-3 text-muted">
          <p>Não há anúncios nem rastreamento. Estudar não exige conta: sem login, o progresso fica só no armazenamento local do seu navegador.</p>
          <p>
            Se você entrar com o Google, o site guarda na sua conta (hospedada no Supabase) apenas: nome e foto do Google, e-mail, o progresso de estudo e
            o XP de cada atividade concluída. O nome, a foto e o XP aparecem no ranking — dá para mudar o nome ou sair do ranking a qualquer momento.
          </p>
          <p>
            Em <Link href="/progresso#conta" className="text-electric-hi underline underline-offset-2">Meu progresso</Link> você pode exportar um backup,
            sair da conta ou apagá-la definitivamente, junto com todos os seus dados.
          </p>
          <p>O código do laboratório fica só no seu navegador e roda isolado do resto do site.</p>
        </div>
      </section>

      <section aria-labelledby="codigo" className="mt-12">
        <GitBranch aria-hidden className="size-6 text-amber" />
        <h2 id="codigo" className="mt-3 text-xl font-semibold">
          Código aberto
        </h2>
        <p className="mt-3 text-muted">
          O código está no GitHub:{" "}
          <a href="https://github.com/rqstack/programacao-do-zero" className="text-electric-hi underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            github.com/rqstack/programacao-do-zero
          </a>
          . Ele é feito com Next.js, React, TypeScript e Tailwind CSS, e é publicado como um site estático.
        </p>
      </section>
    </Container>
  );
}
