import Link from "next/link";

/**
 * Marca "Rota Zero": o zero é o ponto de partida; dele sai uma trilha que chega a um
 * ponto âmbar — o primeiro projeto. É o mesmo desenho dos mapas de trilha do site.
 */
export function LogoMark({ className = "size-9", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="11" fill="#0f1a2f" stroke="#2c3d62" strokeWidth="1.5" />
      {/* o zero */}
      <ellipse cx="15" cy="22.5" rx="6.6" ry="8.6" fill="none" stroke="#eaf0fa" strokeWidth="3" />
      {/* a trilha */}
      <path d="M20.4 16.6 C 23.5 13.2, 25.5 12, 29.2 11.2" fill="none" stroke="#3d7bff" strokeWidth="2.6" strokeLinecap="round" />
      {/* o destino */}
      <circle cx="30.6" cy="10.9" r="3.4" fill="#ffb547" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-md" aria-label="Programação do Zero, página inicial">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[1.02rem] font-bold tracking-tight">programação</span>
        <span className="font-mono text-[0.72rem] text-muted">
          do zero<span className="caret ml-px text-amber">_</span>
        </span>
      </span>
    </Link>
  );
}
