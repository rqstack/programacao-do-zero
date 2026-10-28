import type { ProgressState } from "@/lib/progress/model";

/**
 * Recomendações adaptativas a partir do desempenho real: acertos e erros nos quizzes,
 * perguntas ainda erradas, exercícios resolvidos ou com solução revelada e desafios
 * resolvidos por dificuldade. O tempo de resposta NÃO é usado: estudar com calma não
 * conta contra ninguém. Complementa os quizzes e exercícios; nada fica bloqueado.
 */
export interface LessonInfo {
  slug: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
}
export interface ChallengeInfo {
  id: string;
  title: string;
  difficulty: "facil" | "medio" | "dificil";
  topics: string[];
}

export type Recommendation =
  | { kind: "reforcar"; lesson: LessonInfo; reason: string; pending: number; quizBest: number | null }
  | { kind: "desafio"; challenge: ChallengeInfo; reason: string }
  | { kind: "avancar"; course: { slug: string; title: string }; reason: string };

const LEVELS = ["facil", "medio", "dificil"] as const;

/** Nível de desafio sugerido: sobe quando há 3 resolvidos no nível e mais acertos que soluções reveladas. */
export function challengeLevel(state: ProgressState, challenges: readonly ChallengeInfo[]): (typeof LEVELS)[number] {
  const diff = new Map(challenges.map((c) => [c.id, c.difficulty]));
  const stat = (d: string) => {
    const recs = Object.entries(state.challenges).filter(([id]) => diff.get(id) === d);
    return { solved: recs.filter(([, r]) => r.status === "solved" && r.langs.length > 0).length, revealed: recs.filter(([, r]) => r.status === "revealed").length };
  };
  for (const d of LEVELS) {
    const s = stat(d);
    if (s.solved < 3 || s.revealed >= s.solved) return d;
  }
  return "dificil";
}

export function adaptiveRecommendations(
  state: ProgressState,
  lessons: readonly LessonInfo[],
  challenges: readonly ChallengeInfo[],
  courses: ReadonlyArray<{ slug: string; title: string; lessons: string[] }>,
  limit = 4,
): Recommendation[] {
  const out: Recommendation[] = [];
  const byLesson = new Map(lessons.map((l) => [l.slug, l]));

  // 1. Reforço: perguntas ainda erradas e quizzes abaixo da nota.
  const weight = new Map<string, number>();
  for (const [id, n] of Object.entries(state.mistakes)) {
    const slug = id.split("#")[0]!;
    if (n > 0 && byLesson.has(slug)) weight.set(slug, (weight.get(slug) ?? 0) + n);
  }
  for (const [slug, q] of Object.entries(state.quizzes)) {
    const lesson = slug.replace(/^revisao-/, "");
    if (byLesson.has(lesson) && !q.passed && q.attempts > 0) weight.set(lesson, (weight.get(lesson) ?? 0) + 2);
  }
  for (const [slug] of [...weight.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)) {
    const lesson = byLesson.get(slug)!;
    const pending = Object.entries(state.mistakes).filter(([id, n]) => id.startsWith(`${slug}#`) && n > 0).length;
    const quiz = state.quizzes[`revisao-${slug}`];
    const reason = quiz && !quiz.passed
      ? `Sua melhor nota no quiz foi ${quiz.best}%. Revise a explicação e tente de novo.`
      : `Você ainda tem ${pending} ${pending === 1 ? "pergunta" : "perguntas"} para acertar deste assunto.`;
    out.push({ kind: "reforcar", lesson, reason, pending, quizBest: quiz ? quiz.best : null });
  }

  // 2. Um desafio do tamanho certo.
  const level = challengeLevel(state, challenges);
  const candidate = challenges.find((c) => c.difficulty === level && !state.challenges[c.id]);
  if (candidate) {
    const reason =
      level === "facil"
        ? "Comece pelos fáceis: resolva 3 para liberar a sugestão de desafios médios."
        : level === "medio"
          ? "Você já resolveu desafios fáceis sem precisar ver a solução. Hora de um pouco mais."
          : "Você vai bem nos médios. Este é um dos difíceis.";
    out.push({ kind: "desafio", challenge: candidate, reason });
  }

  // 3. Domínio: trilha concluída com os quizzes aprovados → próximo assunto.
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i]!;
    const mastered = c.lessons.length > 0 && c.lessons.every((l) => state.lessons[l] && state.quizzes[`revisao-${l}`]?.passed);
    const next = courses[i + 1];
    if (mastered && next && !next.lessons.every((l) => state.lessons[l])) {
      out.push({ kind: "avancar", course: { slug: next.slug, title: next.title }, reason: `Você concluiu ${c.title} com os quizzes aprovados.` });
      break;
    }
  }
  return out.slice(0, limit);
}
