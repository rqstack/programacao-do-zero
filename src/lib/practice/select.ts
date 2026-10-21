import type { SeedQuestion } from "@content/schema";
import { seededShuffle } from "@/lib/games/engine";

export interface BankQuestion {
  /** "slug-da-aula#indice" */
  id: string;
  lessonSlug: string;
  lessonTitle: string;
  question: SeedQuestion;
}

/**
 * Monta um treino no estilo Duolingo:
 * 1. até metade das perguntas vem das que a pessoa mais errou (revisão);
 * 2. o resto vem das aulas já concluídas;
 * 3. sem aulas concluídas, usa as primeiras aulas da primeira trilha.
 * Nunca repete uma pergunta no mesmo treino.
 */
export function selectPractice(
  bank: readonly BankQuestion[],
  input: { completedLessons: ReadonlySet<string>; mistakes: Readonly<Record<string, number>>; seed: string; size: number },
): BankQuestion[] {
  const { completedLessons, mistakes, seed, size } = input;
  const byId = new Map(bank.map((q) => [q.id, q]));
  const picked: BankQuestion[] = [];
  const used = new Set<string>();
  const take = (q: BankQuestion | undefined) => {
    if (q && !used.has(q.id) && picked.length < size) {
      picked.push(q);
      used.add(q.id);
    }
  };

  const review = Object.entries(mistakes)
    .filter(([id, n]) => n > 0 && byId.has(id))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.ceil(size / 2));
  for (const [id] of review) take(byId.get(id));

  let pool = bank.filter((q) => completedLessons.has(q.lessonSlug));
  if (pool.length === 0) {
    const firstLessons = [...new Set(bank.map((q) => q.lessonSlug))].slice(0, 3);
    pool = bank.filter((q) => firstLessons.includes(q.lessonSlug));
  }
  for (const q of seededShuffle(pool, seed)) take(q);
  return seededShuffle(picked, `${seed}:ordem`);
}
