"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cx } from "@/components/ui/primitives";

/**
 * Demonstração local do formato dos quizzes. As perguntas reais da plataforma são
 * corrigidas no servidor; esta prévia não vale XP e não registra nada.
 */
const QUESTIONS = [
  {
    prompt: "Qual é a saída deste código?",
    code: 'console.log("5" + 3);',
    options: ["8", '"53"', "NaN"],
    correct: 1,
    explanation: 'Quando um dos lados do + é texto, JavaScript junta os valores: o resultado é "53".',
  },
  {
    prompt: "Quantas vezes \"oi\" aparece?",
    code: 'for (let i = 0; i < 3; i++) {\n  console.log("oi");\n}',
    options: ["2", "3", "4"],
    correct: 1,
    explanation: "i vale 0, 1 e 2. Quando chega a 3, a condição i < 3 deixa de ser verdadeira.",
  },
];

export function DemoQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = QUESTIONS[index]!;
  const answered = picked !== null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-navy/80 p-5 sm:p-6">
      <div className="flex items-center justify-between text-xs text-subtle">
        <span>
          Pergunta {index + 1} de {QUESTIONS.length}
        </span>
        <span>Demonstração · não vale XP</span>
      </div>
      <p className="mt-3 font-semibold">{q.prompt}</p>
      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-[#040a17] p-3 font-mono text-sm text-[#d6e2f5]">{q.code}</pre>
      <fieldset className="mt-4 grid gap-2" disabled={answered}>
        <legend className="sr-only">Alternativas</legend>
        {q.options.map((option, i) => {
          const isCorrect = i === q.correct;
          const isPicked = i === picked;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setPicked(i)}
              className={cx(
                "flex min-h-11 items-center justify-between rounded-md border px-3 text-left font-mono text-sm transition-colors",
                !answered && "border-line-strong hover:border-electric",
                answered && isCorrect && "border-ok/60 bg-ok/10",
                answered && isPicked && !isCorrect && "border-bad/60 bg-bad/10",
                answered && !isPicked && !isCorrect && "border-line opacity-60",
              )}
            >
              {option}
              {answered && isCorrect && <CheckCircle2 aria-label="Resposta correta" className="size-4 text-ok" />}
              {answered && isPicked && !isCorrect && <XCircle aria-label="Sua resposta" className="size-4 text-bad" />}
            </button>
          );
        })}
      </fieldset>
      {answered && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <p className={cx("text-sm", picked === q.correct ? "text-ok" : "text-[#ffd6d6]")}>
            {picked === q.correct ? "Isso mesmo." : "Não foi dessa vez."} {q.explanation}
          </p>
          <button
            type="button"
            onClick={() => {
              setIndex((i) => (i + 1) % QUESTIONS.length);
              setPicked(null);
            }}
            className="min-h-10 rounded-md border border-line-strong px-4 text-sm hover:border-muted"
          >
            {index + 1 < QUESTIONS.length ? "Próxima pergunta" : "Recomeçar"}
          </button>
        </div>
      )}
    </div>
  );
}
