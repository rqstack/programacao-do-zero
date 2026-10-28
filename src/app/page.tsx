import Link from "next/link";
import { ArrowRight, BookOpen, Code2, FlaskConical, Gamepad2, Hammer, Swords, type LucideIcon } from "lucide-react";
import { ARENAS, BATTLE_LANGS } from "@battle/battle-core.ts";
import { codeChallenges, sqlChallenges } from "@content/challenges";
import { LEVEL_TITLES } from "@/lib/gamification/rules";
import { DemoQuiz } from "@/components/home/demo-quiz";
import { EbookSection } from "@/components/home/ebook-section";
import { FirstCode } from "@/components/home/first-code";
import { OnboardingPrompt } from "@/components/path/onboarding-prompt";
import { ContinueCard } from "@/components/progress/continue-card";
import { Container } from "@/components/ui/primitives";
import { allCourses, allGames, allLessons, allProjects, allQuizzes, CATEGORY_LABEL } from "@/lib/catalog";

const STEPS = [
  { title: "Estude a aula", text: "Explicação curta, exemplo comentado e os erros que todo iniciante comete." },
  { title: "Pratique na hora", text: "Um exercício e um quiz de revisão no fim de cada aula, com correção imediata." },
  { title: "Jogue para fixar", text: "Caça aos bugs, monte o código, desafio SQL e outros jogos de revisão." },
  { title: "Construa projetos", text: "Projetos guiados com requisitos e critérios de conclusão para o seu portfólio." },
];

const FAQ = [
  {
    q: "Preciso pagar?",
    a: "Não. Todo o conteúdo e todas as funções são gratuitos.",
  },
  {
    q: "Preciso criar conta?",
    a: "Para estudar, não. Para o seu XP contar no ranking e na liga da semana, entre com sua conta Google — o progresso que você já tem é levado junto.",
  },
  {
    q: "Como participo das batalhas?",
    a: "Entre com a conta Google, abra a Batalha, escolha a linguagem e entre na fila. O sistema procura alguém com troféus parecidos e os dois recebem o mesmo desafio.",
  },
  {
    q: "Onde fica salvo meu progresso?",
    a: "Sem login, no seu navegador. Com login, também na sua conta, para continuar em qualquer aparelho. Você pode apagar a conta quando quiser.",
  },
  {
    q: "Nunca programei. Consigo acompanhar?",
    a: "Sim. A trilha de Lógica de programação começa do absoluto zero, explicando cada termo antes de usá-lo.",
  },
  {
    q: "Preciso instalar alguma coisa?",
    a: "Para começar, não: o laboratório roda JavaScript no próprio navegador. Nas trilhas de back-end e Java, as aulas mostram o que instalar e como.",
  },
  {
    q: "Quem fez a plataforma?",
    a: "É um projeto pessoal de estudo, criado com vibe coding — em parceria com uma IA — enquanto o autor estuda inteligência artificial. O código é aberto.",
  },
];

export default function HomePage() {
  const courses = allCourses();
  const lessons = allLessons();
  const games = allGames();
  const projects = allProjects();
  const quizCount = allQuizzes().length;
  const order = lessons.map((l) => ({ slug: l.slug, title: l.title, courseTitle: l.courseTitle }));
  const areas: { title: string; icon: LucideIcon; accent: string; links: { href: string; label: string; text: string; count?: string }[] }[] = [
    {
      title: "Aprender",
      icon: BookOpen,
      accent: "var(--color-electric)",
      links: [
        { href: "/trilhas", label: "Trilhas", text: "Da lógica ao back-end, nuvem e IA, em ordem.", count: `${courses.length} trilhas` },
        { href: "/quizzes", label: "Quizzes", text: "Revisão com explicação em cada resposta.", count: `${quizCount}` },
        { href: "/glossario", label: "Glossário", text: "Os termos explicados sem jargão." },
      ],
    },
    {
      title: "Praticar",
      icon: Code2,
      accent: "var(--color-ok)",
      links: [
        { href: "/treino", label: "Treino diário", text: "10 perguntas; o que você errou volta depois." },
        { href: "/desafios", label: "Desafios de código", text: "Escreva o código e veja os testes na hora.", count: `${codeChallenges.length + sqlChallenges.length}` },
        { href: "/laboratorio", label: "Laboratório", text: "HTML, CSS e JavaScript rodando no navegador." },
      ],
    },
    {
      title: "Jogar e competir",
      icon: Swords,
      accent: "var(--color-amber)",
      links: [
        { href: "/jogos", label: "Jogos de revisão", text: "Fases novas a cada partida.", count: `${games.length} jogos` },
        { href: "/batalha", label: "Batalha de Código", text: "1 contra 1, ao vivo, com troféus e arenas." },
        { href: "/ranking", label: "Ranking e liga", text: `Suba de ${LEVEL_TITLES[0]} até ${LEVEL_TITLES[LEVEL_TITLES.length - 1]}; a liga recomeça toda segunda.` },
      ],
    },
    {
      title: "Construir",
      icon: Hammer,
      accent: "#c084fc",
      links: [
        { href: "/projetos", label: "Projetos guiados", text: "Requisitos e critérios de conclusão para o portfólio.", count: `${projects.length}` },
        { href: "/progresso", label: "Seu progresso", text: "XP, ofensiva, troféus e o que falta em cada trilha." },
      ],
    },
  ];

  return (
    <>
      <noscript>
        <style>{`.reveal{visibility:visible!important;animation:none!important}`}</style>
      </noscript>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line backdrop-glow">
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0" />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="font-mono text-sm text-amber">
              {courses.length} trilhas · {lessons.length} aulas · {quizCount} quizzes · grátis e sem cadastro
            </p>
            <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.06] sm:text-5xl lg:text-6xl">Do primeiro código aos seus próprios projetos.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Uma plataforma gratuita, em português, para aprender a programar do absoluto zero: aulas curtas, prática com correção na hora,
              jogos, desafios de código, batalhas ao vivo e projetos para o portfólio.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ContinueCard order={order} />
              <Link href="/trilhas" className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-line-strong px-5 font-semibold hover:border-muted">
                Ver todas as trilhas
              </Link>
            </div>
            <OnboardingPrompt />
          </div>
          <FirstCode />
        </Container>
      </section>

      {/* Para quem é e o que tem */}
      <section aria-labelledby="para-quem" className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 id="para-quem" className="text-3xl font-bold sm:text-4xl">
                Feito para quem está começando
              </h2>
              <p className="mt-4 text-muted">
                Para quem nunca escreveu uma linha de código, para quem já viu o básico e quer praticar, e para quem está montando portfólio para
                um estágio. Tudo em português, gratuito e aberto: para estudar, não precisa de conta.
              </p>
              <ol className="mt-8 space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-electric font-mono text-xs font-bold text-electric-hi">{i + 1}</span>
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {areas.map((area) => (
                <div key={area.title} className="border-t-2 pt-4" style={{ borderColor: area.accent }}>
                  <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    <area.icon aria-hidden className="size-4" style={{ color: area.accent }} /> {area.title}
                  </h3>
                  <ul className="mt-3 divide-y divide-line">
                    {area.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="group flex items-baseline justify-between gap-3 py-2.5">
                          <span>
                            <span className="font-semibold group-hover:text-electric-hi">{l.label}</span>
                            <span className="block text-sm text-muted">{l.text}</span>
                          </span>
                          {l.count && <span className="shrink-0 font-mono text-xs text-subtle">{l.count}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Mapa das trilhas */}
      <section aria-labelledby="trilhas" className="border-y border-line bg-navy/40 py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="trilhas" className="text-3xl font-bold sm:text-4xl">
                O mapa da jornada
              </h2>
              <p className="mt-3 max-w-2xl text-muted">A ordem sugerida vai da lógica até projetos completos com back-end e inteligência artificial.</p>
            </div>
            <Link href="/trilhas" className="inline-flex items-center gap-1 text-sm font-semibold text-electric-hi hover:underline">
              Abrir trilhas <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <ol className="mt-10 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-ink/60">
            {courses.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/trilhas/${c.slug}`} className="group grid gap-2 px-5 py-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-4">
                  <span className="font-mono text-sm text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-semibold group-hover:text-electric-hi">{c.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{c.description}</span>
                  </span>
                  <span className="font-mono text-xs text-subtle sm:text-right">
                    {CATEGORY_LABEL[c.category]} · {c.lessons.length} aulas · ~{Math.round(c.totalMinutes / 60)} h
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Batalha de Código */}
      <section aria-labelledby="batalha" className="py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-amber">Multiplayer ao vivo</p>
            <h2 id="batalha" className="mt-3 text-3xl font-bold sm:text-4xl">
              Batalha de Código
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Duas pessoas recebem o mesmo problema ao mesmo tempo. Vence quem passar nos testes primeiro. Os testes rodam no servidor, então o
              resultado não depende do navegador de ninguém.
            </p>
            <ol className="mt-8 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-electric-hi">01</span> Entre com sua conta Google (é grátis).
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-electric-hi">02</span> Escolha uma entre {BATTLE_LANGS.length} linguagens e entre na fila.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-electric-hi">03</span> Resolva o desafio, ganhe troféus e suba de arena.
              </li>
            </ol>
            <Link href="/batalha" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] bg-electric px-5 font-semibold text-white hover:bg-electric-strong">
              Ir para a Batalha <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">As {ARENAS.length} arenas</h3>
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {ARENAS.map((a) => (
                <li key={a.id} className="grid grid-cols-[0.75rem_1fr_auto] items-baseline gap-3 py-2.5 text-sm">
                  <span aria-hidden className="h-3 w-1 rounded-full" style={{ background: a.color }} />
                  <span>
                    <span className="font-semibold">{a.name}</span>
                    <span className="block text-muted">{a.topics}</span>
                  </span>
                  <span className="font-mono text-xs text-subtle">{a.minTrophies === 0 ? "início" : `${a.minTrophies} troféus`}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Quiz e jogos */}
      <section aria-labelledby="praticar" className="border-t border-line py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 id="praticar" className="text-3xl font-bold sm:text-4xl">
              Praticar é parte da aula
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Experimente o formato dos quizzes ao lado. Cada aula termina com perguntas como estas, e cada resposta vem com a explicação.
            </p>
            <h3 className="mt-10 flex items-center gap-2 text-lg font-semibold">
              <Gamepad2 aria-hidden className="size-5 text-amber" /> Jogos para revisar
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {games.map((g) => (
                <li key={g.slug}>
                  <Link href={`/jogos/${g.slug}`} className="block rounded-md border border-line px-3 py-2.5 text-sm hover:border-electric">
                    <span className="font-medium">{g.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{g.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <DemoQuiz />
        </Container>
      </section>

      {/* Laboratório e projetos */}
      <section className="border-t border-line py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <FlaskConical aria-hidden className="size-6 text-electric-hi" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Laboratório de código</h2>
            <p className="mt-3 text-muted">
              Escreva HTML, CSS e JavaScript e veja o resultado na hora, com o console ao lado. Roda isolado no seu navegador, sem instalar nada.
            </p>
            <Link href="/laboratorio" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-semibold hover:border-muted">
              Abrir o laboratório <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div>
            <Hammer aria-hidden className="size-6 text-amber" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Projetos que você vai construir</h2>
            <ul className="mt-4 space-y-2">
              {projects.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link href={`/projetos/${p.slug}`} className="flex items-baseline justify-between gap-3 border-b border-line py-2 hover:text-electric-hi">
                    <span>{p.title}</span>
                    <span className="shrink-0 font-mono text-xs text-subtle">{p.level}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {projects.length > 6 && (
              <Link href="/projetos" className="mt-4 inline-flex text-sm font-semibold text-electric-hi hover:underline">
                Ver os {projects.length} projetos
              </Link>
            )}
          </div>
        </Container>
      </section>

      <EbookSection />

      {/* Perguntas frequentes */}
      <section id="perguntas" aria-labelledby="faq" className="border-t border-line py-20">
        <Container className="max-w-3xl">
          <h2 id="faq" className="text-3xl font-bold">
            Perguntas frequentes
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="font-mono text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <ContinueCard order={order} fallbackLabel="Começar agora, de graça" />
          </div>
        </Container>
      </section>
    </>
  );
}
