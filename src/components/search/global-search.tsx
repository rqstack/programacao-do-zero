"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { FavoriteButton } from "@/components/learn/favorite-button";
import { cx } from "@/components/ui/primitives";
import { KIND_LABEL, search, type SearchEntry, type SearchKind } from "@/lib/search/query";

const KINDS: SearchKind[] = ["aula", "trilha", "quiz", "jogo", "projeto", "desafio", "glossario"];
const SUGGESTIONS = ["variáveis", "laços", "funções", "SQL", "React", "Git", "API", "Python"];

export function GlobalSearch({ index }: { index: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "todos">("todos");

  // Abre com o termo do endereço (/busca?q=...), para links e para o botão voltar.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setQuery(q.slice(0, 80));
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [query]);

  const all = useMemo(() => search(index, query, 200), [index, query]);
  const counts = useMemo(() => {
    const c = new Map<SearchKind, number>();
    for (const r of all) c.set(r.kind, (c.get(r.kind) ?? 0) + 1);
    return c;
  }, [all]);
  const results = (kind === "todos" ? all : all.filter((r) => r.kind === kind)).slice(0, 50);

  return (
    <div>
      <label htmlFor="busca-global" className="sr-only">
        Buscar no site
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-subtle" />
        <input
          id="busca-global"
          type="search"
          autoFocus
          value={query}
          maxLength={80}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: laço for, JOIN, useState, variáveis"
          className="min-h-12 w-full rounded-[var(--radius-md)] border border-line-strong bg-ink pl-11 pr-3 text-base focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
        />
      </div>

      {!query.trim() ? (
        <div className="mt-6 text-sm text-muted">
          <p>Busque por aulas, trilhas, quizzes, jogos, projetos, desafios e termos do glossário. Algumas ideias:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-md border border-line-strong px-3 py-1.5 text-fg hover:border-muted">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div role="group" aria-label="Filtrar por tipo" className="mt-5 flex flex-wrap gap-2 text-sm">
            {(["todos", ...KINDS] as const).map((k) => {
              const n = k === "todos" ? all.length : (counts.get(k) ?? 0);
              if (k !== "todos" && n === 0) return null;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={cx("rounded-md border px-3 py-1.5", kind === k ? "border-electric bg-electric/10 text-fg" : "border-line-strong text-muted hover:text-fg")}
                >
                  {k === "todos" ? "Tudo" : KIND_LABEL[k]} <span className="font-mono text-xs text-subtle">{n}</span>
                </button>
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite">
            {all.length} resultados
          </p>
          {results.length === 0 ? (
            <p className="mt-8 text-muted">Nada encontrado para “{query.trim()}”. Tente uma palavra mais curta ou sem acento.</p>
          ) : (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {results.map((r) => (
                <li key={`${r.kind}:${r.href}:${r.title}`} className="flex items-start gap-3 py-3">
                  <Link href={r.href} className="group min-w-0 flex-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                      {KIND_LABEL[r.kind]}
                      {r.context ? ` · ${r.context}` : ""}
                    </span>
                    <span className="block font-semibold group-hover:text-electric-hi">{r.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{r.text}</span>
                  </Link>
                  {r.fav && <FavoriteButton favKey={r.fav} title={r.title} compact />}
                </li>
              ))}
            </ul>
          )}
          {all.length > results.length && <p className="mt-3 text-sm text-subtle">Mostrando os 50 mais relevantes. Refine a busca para ver outros.</p>}
        </>
      )}
    </div>
  );
}
