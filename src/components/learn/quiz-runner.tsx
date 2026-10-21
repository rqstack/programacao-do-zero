"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { SeedQuestion } from "@content/schema";
import { CodeBlock } from "@/components/content/code-block";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button, cx } from "@/components/ui/primitives";
import { gradeQuiz } from "@/lib/quiz/grading";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

const KIND_LABEL: Record<NonNullable<SeedQuestion["kind"]>, string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro ou falso",
  code_reading: "Leia o código",
  find_bug: "Encontre o bug",
  logic: "Desafio de lógica",
};

export function QuizRunner({
  slug,
  title,
  questions,
  passPercent = 70,
  compact = false,
  questionIds,
}: {
  slug: string;
  title: string;
  questions: SeedQuestion[];
  passPercent?: number;
  compact?: boolean;
  questionIds?: string[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(0);
  const progress = useProgress();
  const hydrated = useHydrated();
  const best = hydrated ? progress.quizzes[slug] : undefined;

  const gradable = useMemo(
    () => questions.map((q, i) => ({ id: String(i), options: q.options, correctIndex: q.correct, points: 1, explanation: q.explanation })),
    [questions],
  );
  const grade = submitted ? gradeQuiz(gradable, answers, passPercent) : null;
  const answeredAll = Object.keys(answers).length === questions.length;

  function submit() {
    const g = gradeQuiz(gradable, answers, passPercent);
    setSubmitted(true);
    const ids = questionIds ?? [];
    const wrongIds = g.results.filter((r) => !r.correct).map((r) => ids[Number(r.questionId)]).filter((x): x is string => Boolean(x));
    const rightIds = g.results.filter((r) => r.correct).map((r) => ids[Number(r.questionId)]).filter((x): x is string => Boolean(x));
    dispatchProgress({ type: "quiz/result", slug, title, percent: g.percent, passed: g.passed, wrongIds, rightIds });
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
    setRound((r) => r + 1);
  }

  return (
    <div>
      {best && !submitted && (
        <p className="mb-4 text-sm text-muted">
          Sua melhor nota: <span className="font-mono text-amber">{best.best}%</span>
          {best.passed ? " · aprovado" : ""} · {best.attempts} tentativa{best.attempts === 1 ? "" : "s"}
        </p>
      )}
      <ol className="space-y-8">
        {questions.map((q, qi) => {
          const result = grade?.results[qi];
          const name = `q-${slug}-${round}-${qi}`;
          return (
            <li key={`${round}-${qi}`}>
              <fieldset disabled={submitted}>
                <legend className="w-full">
                  <span className="font-mono text-xs text-subtle">
                    {qi + 1}/{questions.length} · {KIND_LABEL[q.kind ?? "multiple_choice"]}
                  </span>
                  <span className={cx("mt-1 block font-semibold", compact ? "text-base" : "text-lg")}>
                    <InlineMd text={q.prompt} />
                  </span>
                </legend>
                {q.code && <CodeBlock code={q.code} language={q.lang ?? "js"} />}
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const checked = answers[String(qi)] === oi;
                    const isCorrect = submitted && oi === q.correct;
                    const isWrongPick = submitted && checked && oi !== q.correct;
                    return (
                      <label
                        key={oi}
                        className={cx(
                          "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                          !submitted && (checked ? "border-electric bg-electric/10" : "border-line-strong hover:border-muted"),
                          isCorrect && "border-ok/60 bg-ok/10",
                          isWrongPick && "border-bad/60 bg-bad/10",
                          submitted && !isCorrect && !isWrongPick && "border-line opacity-60",
                        )}
                      >
                        <input
                          type="radio"
                          name={name}
                          className="size-4 accent-[#3d7bff]"
                          checked={checked}
                          onChange={() => setAnswers((a) => ({ ...a, [String(qi)]: oi }))}
                        />
                        <span className="flex-1">
                          <InlineMd text={opt} />
                        </span>
                        {isCorrect && <CheckCircle2 aria-label="Resposta correta" className="size-4 shrink-0 text-ok" />}
                        {isWrongPick && <XCircle aria-label="Sua resposta" className="size-4 shrink-0 text-bad" />}
                      </label>
                    );
                  })}
                </div>
                {result && (
                  <p className={cx("mt-3 text-sm", result.correct ? "text-[#c8f5e4]" : "text-[#ffd6d6]")}>
                    {result.correct ? "Correto. " : "Não foi dessa vez. "}
                    <InlineMd text={q.explanation} />
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="mt-8" aria-live="polite">
        {!submitted ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={!answeredAll}>
              Corrigir respostas
            </Button>
            {!answeredAll && (
              <span className="text-sm text-subtle">
                Responda todas as perguntas ({Object.keys(answers).length}/{questions.length}).
              </span>
            )}
          </div>
        ) : (
          grade && (
            <div className="space-y-4">
              <Alert tone={grade.passed ? "success" : "warning"} title={`Você acertou ${grade.score} de ${grade.maxScore} (${grade.percent}%)`}>
                {grade.passed
                  ? "Aprovado! Siga em frente."
                  : `Para passar, são necessários ${passPercent}%. Releia as explicações acima e tente de novo.`}
              </Alert>
              <Button variant="secondary" onClick={retry}>
                <RotateCcw aria-hidden className="size-4" /> Tentar novamente
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
