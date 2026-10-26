/**
 * Busca global: roda no navegador sobre um índice gerado no build (sem servidor de busca).
 * Ignora maiúsculas e acentos e dá mais peso ao título.
 */
export type SearchKind = "aula" | "trilha" | "jogo" | "quiz" | "projeto" | "desafio" | "glossario";

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  /** Texto curto mostrado no resultado. */
  text: string;
  href: string;
  /** Contexto (ex.: trilha da aula). */
  context?: string;
  /** Texto extra só para casar a busca (ex.: subtítulos da aula). */
  extra?: string;
  /** Chave de favorito ("tipo:slug"), quando o item pode ser salvo. */
  fav?: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  aula: "Aula",
  trilha: "Trilha",
  jogo: "Jogo",
  quiz: "Quiz",
  projeto: "Projeto",
  desafio: "Desafio",
  glossario: "Glossário",
};

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9#+.]+/g, " ")
    .trim();
}

export function search(index: readonly SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const terms = normalize(query).split(" ").filter((t) => t.length > 0);
  if (terms.length === 0) return [];
  const scored: Array<{ e: SearchEntry; score: number; i: number }> = [];
  index.forEach((e, i) => {
    const title = normalize(e.title);
    const body = normalize(`${e.text} ${e.context ?? ""} ${e.extra ?? ""}`);
    let score = 0;
    for (const t of terms) {
      const inTitle = title.includes(t);
      const inBody = body.includes(t);
      // Todos os termos precisam aparecer em algum lugar.
      if (!inTitle && !inBody) return;
      if (inTitle) score += title.split(" ").includes(t) ? 6 : 4;
      if (inBody) score += 1;
    }
    if (title === normalize(query)) score += 10;
    if (title.startsWith(terms[0]!)) score += 2;
    scored.push({ e, score, i });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.e);
}
