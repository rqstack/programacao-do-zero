import Link from "next/link";
import { ArrowRight, Dumbbell, Flame, FlaskConical, Gamepad2, Hammer, Trophy } from "lucide-react";
import { LEVEL_TITLES } from "@/lib/gamification/rules";
import { DemoQuiz } from "@/components/home/demo-quiz";
import { FirstCode } from "@/components/home/first-code";
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
              {lessons.length} aulas · {quizCount} quizzes · {games.length} jogos · grátis
            </p>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.04] sm:text-6xl">Do primeiro código aos seus próprios projetos.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Aprenda programação passo a passo, pratique com desafios interativos e desenvolva projetos reais, mesmo que esteja começando do
              absoluto zero.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ContinueCard order={order} />
              <Link href="/trilhas" className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-line-strong px-5 font-semibold hover:border-muted">
                Ver todas as trilhas
              </Link>
            </div>
          </div>
          <FirstCode />
        </Container>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="como-funciona" className="py-20">
        <Container>
          <h2 id="como-funciona" className="text-3xl font-bold sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 max-w-2xl text-muted">Cada aula é uma parada da rota. Você avança no seu ritmo e o site guarda onde parou.</p>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-[15px] top-4 h-[calc(100%-2rem)] w-0.5 bg-line md:left-4 md:right-4 md:top-[15px] md:h-0.5 md:w-auto" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 md:block">
                <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 border-electric bg-ink font-mono text-sm font-bold text-electric-hi md:mb-5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Hábito diário */}
      <section aria-labelledby="todo-dia" className="pb-20">
        <Container className="grid gap-4 md:grid-cols-3">
          <h2 id="todo-dia" className="sr-only">
            Estude um pouco todo dia
          </h2>
          <Link href="/treino" className="group rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6 hover:border-electric">
            <Dumbbell aria-hidden className="size-6 text-electric-hi" />
            <p className="mt-4 text-lg font-semibold group-hover:text-electric-hi">Treino diário</p>
            <p className="mt-1 text-sm text-muted">10 perguntas, 3 vidas. O que você errou volta até você acertar.</p>
          </Link>
          <Link href="/progresso" className="group rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6 hover:border-amber/60">
            <Flame aria-hidden className="size-6 text-amber" />
            <p className="mt-4 text-lg font-semibold">Ofensiva e meta do dia</p>
            <p className="mt-1 text-sm text-muted">Escolha quanto XP quer fazer por dia e não deixe a chama apagar.</p>
          </Link>
          <Link href="/ranking" className="group rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6 hover:border-amber/60">
            <Trophy aria-hidden className="size-6 text-amber" />
            <p className="mt-4 text-lg font-semibold">Liga da semana</p>
            <p className="mt-1 text-sm text-muted">
              Entre com o Google e suba de {LEVEL_TITLES[0]} até {LEVEL_TITLES[LEVEL_TITLES.length - 1]}. A liga recomeça toda segunda.
            </p>
          </Link>
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

      {/* Quiz e jogos */}
      <section aria-labelledby="praticar" className="py-20">
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
