"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Term } from "@content/glossario";
import { cx } from "@/components/ui/primitives";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function GlossarySearch({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Term["area"] | "Todas">("Todas");
  const areas = useMemo(() => ["Todas", ...new Set(terms.map((t) => t.area))] as const, [terms]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return terms
      .filter((t) => area === "Todas" || t.area === area)
      .filter((t) => !q || normalize(t.term).includes(q) || normalize(t.definition).includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
  }, [terms, query, area]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="busca" className="sr-only">
          Buscar termo
        </label>
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            id="busca"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar termo ou definição"
            className="min-h-11 w-full rounded-md border border-line-strong bg-navy pl-9 pr-3 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
      </div>
      <div role="group" aria-label="Filtrar por área" className="mt-3 flex flex-wrap gap-1.5">
        {areas.map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={area === a}
            onClick={() => setArea(a as Term["area"] | "Todas")}
            className={cx("min-h-9 rounded-full border px-3 text-sm", area === a ? "border-electric bg-electric/10 text-fg" : "border-line-strong text-muted hover:text-fg")}
          >
            {a}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-subtle" aria-live="polite">
        {results.length} termo{results.length === 1 ? "" : "s"}
      </p>
      {results.length === 0 ? (
        <p className="mt-4 text-muted">Nenhum termo encontrado. Tente outra palavra ou limpe o filtro.</p>
      ) : (
        <dl className="mt-3 divide-y divide-line border-y border-line">
          {results.map((t) => (
            <div key={t.term} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="font-semibold">
                {t.term}
                <span className="ml-2 font-mono text-xs font-normal text-subtle">{t.area}</span>
              </dt>
              <dd className="text-muted">{t.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
