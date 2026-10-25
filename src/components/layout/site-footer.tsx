import Link from "next/link";
import { LogoMark } from "./logo";

const COLUMNS = [
  {
    title: "Estudar",
    links: [
      { href: "/trilhas", label: "Trilhas" },
      { href: "/quizzes", label: "Quizzes" },
      { href: "/jogos", label: "Jogos" },
      { href: "/projetos", label: "Projetos guiados" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { href: "/laboratorio", label: "Laboratório de código" },
      { href: "/glossario", label: "Glossário" },
      { href: "/progresso", label: "Meu progresso" },
    ],
  },
  {
    title: "Projeto",
    links: [
      { href: "/sobre", label: "Sobre e créditos" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/termos", label: "Termos de uso" },
      { href: "/ebook", label: "E-book do autor" },
      { href: "/apoiar", label: "Apoiar o projeto" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-navy/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-bold">Programação do Zero</span>
          </div>
          <p className="mt-3 text-sm text-muted">Do primeiro código aos seus próprios projetos. Gratuito, sem cadastro.</p>
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            Projeto pessoal de estudo, criado com <strong className="font-medium text-muted">vibe coding</strong>: escrito em parceria com uma IA
            enquanto o autor estuda inteligência artificial para entendê-la. <Link href="/sobre" className="underline underline-offset-2 hover:text-fg">Saiba mais</Link>.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-subtle sm:px-6">
          Conteúdo educacional gratuito. O aprendizado depende do estudo e da prática de cada pessoa. Seu progresso fica salvo apenas neste navegador.
        </p>
      </div>
    </footer>
  );
}
