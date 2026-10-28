"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Code, ExternalLink, FolderGit2, Languages, Swords } from "lucide-react";
import { ProgressBar } from "@/components/ui/primitives";
import { getPortfolio, studiedLanguages, trailProgress, verifiedAchievements, type PortfolioCatalog, type PortfolioData } from "@/lib/profiles/portfolio";

/** Seções do portfólio público. Tudo vem do que o servidor registrou; o que a pessoa ocultou nem chega aqui. */
export function PortfolioSections({ username, catalog, onPrefs }: { username: string; catalog: PortfolioCatalog; onPrefs?: (d: PortfolioData) => void }) {
  const [data, setData] = useState<PortfolioData | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    getPortfolio(username).then((d) => {
      if (!alive) return;
      setData(d);
      if (d && onPrefs) onPrefs(d);
    });
    return () => {
      alive = false;
    };
  }, [username, onPrefs]);

  if (!data) return null;
  const trails = data.lessons ? trailProgress(data.lessons, catalog) : [];
  const langs = data.lessons ? studiedLanguages(data.lessons, catalog) : [];
  const achievements = data.prefs.show_achievements ? verifiedAchievements(data, catalog) : [];

  return (
    <div className="space-y-8">
      {data.projects && data.projects.length > 0 && (
        <section aria-labelledby="pf-projetos">
          <h2 id="pf-projetos" className="flex items-center gap-2 text-lg font-semibold">
            <FolderGit2 aria-hidden className="size-5 text-electric-hi" /> Projetos concluídos
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {data.projects.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                <div>
                  <Link href={`/projetos/${p.slug}`} className="font-semibold hover:text-electric-hi">
                    {catalog.projects[p.slug] ?? p.slug}
                  </Link>
                  <p className="font-mono text-xs text-subtle">concluído em {new Date(p.at).toLocaleDateString("pt-BR")}</p>
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-sm text-electric-hi hover:underline">
                    Ver o código <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {trails.length > 0 && (
        <section aria-labelledby="pf-trilhas">
          <h2 id="pf-trilhas" className="flex items-center gap-2 text-lg font-semibold">
            <Languages aria-hidden className="size-5 text-electric-hi" /> Trilhas estudadas
          </h2>
          {langs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Linguagens e ferramentas estudadas">
              {langs.map((l) => (
                <li key={l} className="rounded-md border border-line-strong px-2.5 py-1 font-mono text-xs">
                  {l}
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {trails.map((t) => (
              <li key={t.slug}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{t.title}</span>
                  <span className="font-mono text-xs text-muted">
                    {t.done}/{t.total} aulas
                  </span>
                </div>
                <ProgressBar value={t.done / t.total} label={`Progresso em ${t.title}`} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.challenges && data.challenges.length > 0 && (
        <section aria-labelledby="pf-desafios">
          <h2 id="pf-desafios" className="flex items-center gap-2 text-lg font-semibold">
            <Code aria-hidden className="size-5 text-electric-hi" /> Desafios de código resolvidos <span className="font-mono text-sm text-muted">{data.challenges.length}</span>
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {data.challenges.slice(0, 24).map((id) => (
              <li key={id} className="rounded-md border border-line px-2.5 py-1">
                {catalog.challenges[id]?.title ?? id}
              </li>
            ))}
          </ul>
        </section>
      )}

      {achievements.length > 0 && (
        <section aria-labelledby="pf-conquistas">
          <h2 id="pf-conquistas" className="flex items-center gap-2 text-lg font-semibold">
            <Award aria-hidden className="size-5 text-amber" /> Conquistas
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <li key={a.slug} className="rounded-md border border-line px-3 py-2 text-sm">
                <span className="font-semibold">{a.title}</span>
                <span className="block text-xs text-muted">{a.description}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-subtle">Só aparecem conquistas que dá para conferir pelo que o servidor registrou.</p>
        </section>
      )}

      {data.battle && (
        <section aria-labelledby="pf-batalha" className="text-sm">
          <h2 id="pf-batalha" className="flex items-center gap-2 text-lg font-semibold">
            <Swords aria-hidden className="size-5 text-electric-hi" /> Batalha de Código
          </h2>
          <p className="mt-2 text-muted">
            {data.battle.wins} vitórias · {data.battle.trophies} troféus (melhor marca: {data.battle.best_trophies})
          </p>
        </section>
      )}
    </div>
  );
}
