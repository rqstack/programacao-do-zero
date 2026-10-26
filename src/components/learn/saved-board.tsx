"use client";

import Link from "next/link";
import { NotebookPen, Trash2 } from "lucide-react";
import { FavoriteButton } from "@/components/learn/favorite-button";
import { Button, ButtonLink, EmptyState } from "@/components/ui/primitives";
import type { SearchEntry, SearchKind } from "@/lib/search/query";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

const ORDER: SearchKind[] = ["trilha", "aula", "quiz", "jogo", "desafio", "projeto"];
const PLURAL: Record<SearchKind, string> = { trilha: "Trilhas", aula: "Aulas", quiz: "Quizzes", jogo: "Jogos", desafio: "Desafios", projeto: "Projetos", glossario: "Glossário" };

/** Favoritos por categoria e anotações das aulas. Tudo vem do progresso da própria pessoa. */
export function SavedBoard({ entries }: { entries: SearchEntry[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const byFav = new Map(entries.filter((e) => e.fav).map((e) => [e.fav!, e]));
  const lessons = new Map(entries.filter((e) => e.kind === "aula").map((e) => [e.href.replace("/aulas/", ""), e]));

  const favs = hydrated
    ? Object.entries(progress.favorites)
        .filter(([, f]) => f.on)
        .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
        .map(([key]) => byFav.get(key))
        .filter((e): e is SearchEntry => Boolean(e))
    : [];
  const notes = hydrated
    ? Object.entries(progress.notes)
        .filter(([slug, n]) => n.text && lessons.has(slug))
        .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
    : [];

  return (
    <div className="space-y-14">
      <section aria-labelledby="favoritos">
        <h2 id="favoritos" className="text-xl font-bold">
          Favoritos
        </h2>
        {hydrated && favs.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nada salvo ainda" action={<ButtonLink href="/busca">Buscar conteúdos</ButtonLink>}>
              Use o botão Salvar nas aulas ou na busca para guardar o que quer ver depois.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4 grid gap-8 md:grid-cols-2">
            {ORDER.map((kind) => {
              const list = favs.filter((f) => f.kind === kind);
              if (list.length === 0) return null;
              return (
                <div key={kind}>
                  <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {PLURAL[kind]} <span className="text-subtle">· {list.length}</span>
                  </h3>
                  <ul className="mt-2 divide-y divide-line border-y border-line">
                    {list.map((e) => (
                      <li key={e.fav} className="flex items-center gap-3 py-2.5">
                        <Link href={e.href} className="group min-w-0 flex-1">
                          <span className="block truncate font-semibold group-hover:text-electric-hi">{e.title}</span>
                          {e.context && <span className="block truncate text-xs text-muted">{e.context}</span>}
                        </Link>
                        <FavoriteButton favKey={e.fav!} title={e.title} compact />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="anotacoes">
        <h2 id="anotacoes" className="text-xl font-bold">
          Anotações
        </h2>
        <p className="mt-1 text-sm text-muted">Só você vê suas anotações. Elas nunca aparecem no perfil público.</p>
        {hydrated && notes.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nenhuma anotação">No fim de cada aula há um espaço para escrever com suas palavras o que entendeu.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {notes.map(([slug, n]) => {
              const lesson = lessons.get(slug)!;
              return (
                <li key={slug} className="rounded-[var(--radius-md)] border border-line p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link href={`${lesson.href}#anotacoes`} className="font-semibold hover:text-electric-hi">
                      {lesson.title}
                    </Link>
                    <span className="font-mono text-xs text-subtle">{new Date(n.at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[#d8e1f0]">{n.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink size="sm" variant="secondary" href={`${lesson.href}#anotacoes`}>
                      <NotebookPen aria-hidden className="size-4" /> Editar na aula
                    </ButtonLink>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (window.confirm(`Apagar a anotação de "${lesson.title}"?`)) dispatchProgress({ type: "note/save", slug, text: "" });
                      }}
                    >
                      <Trash2 aria-hidden className="size-4" /> Apagar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

