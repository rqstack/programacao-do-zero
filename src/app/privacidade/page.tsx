import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Quais dados a Programação do Zero guarda, para quê, com quem compartilha e como apagar.",
};

const REPO_ISSUES = "https://github.com/rqstack/programacao-do-zero/issues";

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

export default function PrivacidadePage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-3 text-sm text-subtle">Última atualização: 25 de outubro de 2026</p>
      <p className="mt-6 text-lg text-muted">
        A Programação do Zero é um projeto pessoal, gratuito e de código aberto. Não tem anúncios, não vende dados e não usa ferramentas de
        rastreamento. Esta página explica, em linguagem simples, o que é guardado e por quê, seguindo a Lei Geral de Proteção de Dados (LGPD).
      </p>

      <Section id="sem-conta" title="1. Usando o site sem conta">
        <p>
          Estudar não exige cadastro. Sem login, o seu progresso fica apenas no armazenamento local do seu navegador (localStorage) e não é
          enviado para nenhum servidor. O código que você escreve no laboratório e nos desafios roda no seu próprio navegador.
        </p>
      </Section>

      <Section id="com-conta" title="2. Entrando com o Google">
        <p>Ao entrar com o Google, recebemos do Google apenas o seu nome, e-mail e foto de perfil. Com a conta, o site guarda:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>nome, foto e e-mail da conta Google;</li>
          <li>o progresso de estudo e o XP de cada atividade concluída;</li>
          <li>os dados de perfil que você escolher preencher (nome de usuário, título, bio, GitHub, LinkedIn e site);</li>
          <li>quem você segue e quem segue você;</li>
          <li>se você jogar a Batalha de Código: partidas, códigos enviados, resultados, troféus e posição no ranking.</li>
        </ul>
        <p>
          <strong className="text-fg">O que fica público:</strong> nome, foto, XP e posição no ranking; e o perfil público, se você não o deixar
          privado. O e-mail nunca é exibido.
        </p>
        <p>Usamos esses dados só para fazer o site funcionar: salvar o seu progresso, mostrar rankings e perfis e organizar as partidas.</p>
      </Section>

      <Section id="apoio" title="3. Apoio voluntário por Pix">
        <p>
          Se você fizer um apoio por Pix, o site registra o valor, a situação do pagamento e uma versão embaralhada (hash) do seu endereço IP,
          usada apenas para limitar abusos. O pagamento é processado pela Syncpay; o site não recebe nem guarda dados bancários. Apoiar não dá
          nenhuma vantagem no site e não exige conta.
        </p>
      </Section>

      <Section id="terceiros" title="4. Serviços usados">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-fg">GitHub Pages</strong>: hospeda o site. Como qualquer servidor, registra dados técnicos de acesso (como o
            endereço IP) para segurança.
          </li>
          <li>
            <strong className="text-fg">Supabase</strong>: guarda as contas e os dados descritos acima, em servidores no Brasil (São Paulo).
          </li>
          <li>
            <strong className="text-fg">Google</strong>: faz o login. O site não tem acesso à sua senha.
          </li>
          <li>
            <strong className="text-fg">Judge0</strong>: executa os códigos enviados na Batalha de Código. Só o código é enviado, sem nome nem
            e-mail.
          </li>
          <li>
            <strong className="text-fg">Syncpay</strong>: processa os apoios por Pix.
          </li>
        </ul>
        <p>Não compartilhamos dados com mais ninguém.</p>
      </Section>

      <Section id="cookies" title="5. Cookies e armazenamento local">
        <p>
          O site usa o armazenamento local do navegador para guardar o progresso sem conta, as preferências e a sessão de login. Não há cookies
          de publicidade nem de análise.
        </p>
      </Section>

      <Section id="direitos" title="6. Seus direitos e como apagar seus dados">
        <p>
          Em{" "}
          <Link href="/progresso#conta" className="text-electric-hi underline underline-offset-2">
            Meu progresso
          </Link>{" "}
          você pode exportar uma cópia dos seus dados, sair da conta ou apagá-la definitivamente. Ao apagar, a conta, o progresso, o perfil, as
          conexões e os dados de partidas são removidos.
        </p>
        <p>
          Você também pode corrigir os dados do perfil a qualquer momento em{" "}
          <Link href="/perfil" className="text-electric-hi underline underline-offset-2">
            Perfil
          </Link>
          . Para qualquer outro pedido previsto na LGPD, entre em contato pelo canal abaixo.
        </p>
      </Section>

      <Section id="contato" title="7. Contato">
        <p>
          Dúvidas ou pedidos sobre privacidade podem ser enviados abrindo uma issue no{" "}
          <a href={REPO_ISSUES} className="text-electric-hi underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            repositório do projeto no GitHub
          </a>
          . Se esta política mudar, a data no topo da página será atualizada.
        </p>
      </Section>

      <p className="mt-10 text-sm text-subtle">
        Veja também os{" "}
        <Link href="/termos" className="underline underline-offset-2 hover:text-fg">
          Termos de Uso
        </Link>
        .
      </p>
    </Container>
  );
}
