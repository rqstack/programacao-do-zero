export interface GradableQuestion {
  id: string;
  options: readonly string[];
  correctIndex: number;
  points: number;
  explanation: string;
}

export interface QuestionResult {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface QuizGrade {
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  results: QuestionResult[];
}

/**
 * Corrige um quiz no servidor. Respostas ausentes, fora do intervalo ou para
 * perguntas que não pertencem ao quiz contam como erradas/são ignoradas.
 */
export function gradeQuiz(
  questions: readonly GradableQuestion[],
  answers: Readonly<Record<string, unknown>>,
  passPercent: number,
): QuizGrade {
  let score = 0;
  let maxScore = 0;
  const results: QuestionResult[] = questions.map((q) => {
    maxScore += q.points;
    const raw = answers[q.id];
    const selected = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    const correct = selected === q.correctIndex;
    if (correct) score += q.points;
    return { questionId: q.id, selectedIndex: selected, correctIndex: q.correctIndex, correct, explanation: q.explanation };
  });
  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  return { score, maxScore, percent, passed: maxScore > 0 && percent >= passPercent, results };
}

/** Normaliza respostas curtas de exercícios para comparação tolerante. */
export function normalizeShortAnswer(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/'/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([(){}[\],;:=<>+\-*/])\s*/g, "$1")
    .replace(/[;.]+$/, "")
    .toLowerCase();
}

export function isAcceptedAnswer(given: string, accepted: readonly string[]): boolean {
  const g = normalizeShortAnswer(given);
  if (!g) return false;
  return accepted.some((a) => normalizeShortAnswer(a) === g);
}
