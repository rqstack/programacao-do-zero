import { CirclePlay, ExternalLink } from "lucide-react";
import { playlistUrl, videosByCourse } from "@content/videos";
import { cx } from "@/components/ui/primitives";

/** Videoaulas gratuitas (playlists do YouTube) indicadas para uma trilha. */
export function VideoCourses({ courseSlug, compact = false, className }: { courseSlug: string; compact?: boolean; className?: string }) {
  const list = videosByCourse[courseSlug] ?? [];
  if (list.length === 0) return null;
  const id = compact ? "videos-aula" : "videos-trilha";

  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className={cx("font-semibold", compact ? "text-lg" : "text-xl")}>
        {compact ? "Quer ver em vídeo?" : "Videoaulas gratuitas"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Cursos abertos no YouTube, de outros autores, que cobrem o mesmo assunto. Use como complemento: assista e volte para praticar aqui.
      </p>
      <ul className={cx("mt-4 grid gap-3", !compact && "sm:grid-cols-2")}>
        {list.map((v) => (
          <li key={v.playlist}>
            <a
              href={playlistUrl(v.playlist)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-navy/60 p-3 hover:border-[#ff4d4d]/60"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#ff3b3b]/15 text-[#ff6b6b]">
                <CirclePlay className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold group-hover:text-fg">{v.title}</span>
                <span className="block truncate text-xs text-muted">
                  {v.channel} · playlist no YouTube{v.lang === "en" ? " · em inglês" : ""}
                </span>
              </span>
              <ExternalLink aria-hidden className="size-4 shrink-0 text-subtle" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
