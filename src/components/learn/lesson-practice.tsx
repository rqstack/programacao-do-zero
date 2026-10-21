"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Lightbulb } from "lucide-react";
import type { SeedExercise, SeedQuestion } from "@content/schema";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button } from "@/components/ui/primitives";
import { isAcceptedAnswer } from "@/lib/quiz/grading";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { QuizRunner } from "./quiz-runner";

export function ExercisePanel({ slug, title, exercise }: { slug: string; title: string; exercise: SeedExercise }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const status = hydrated ? progress.exercises[slug] : undefined;
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const inputId = `exercicio-${slug}`;

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const ok = isAcceptedAnswer(answer, exercise.accepted);
    setFeedback(ok ? "right" : "wrong");
    setTries((t) => t + 1);
    if (ok) dispatchProgress({ type: "exercise/solve", slug, title });
  }

  function reveal() {
    setRevealed(true);
    dispatchProgress({ type: "exercise/reveal", slug });
  }

  const solved = status === "solved" || feedback === "right";
  return (
    <div>
      <p className="text-lg">
        <InlineMd text={exercise.prompt} />
      </p>
      <form onSubmit={check} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Sua resposta
        </label>
        <input
          id={inputId}
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setFeedback(null);
          }}
          autoComplete="off"
          spellCheck={false}
          maxLength={300}
          placeholder="Digite sua resposta"
          className="min-h-11 flex-1 rounded-md border border-line-strong bg-ink px-3 font-mono text-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
        />
        <Button type="submit">Conferir</Button>
      </form>
      <div className="mt-3 space-y-3" aria-live="polite">
        {feedback === "wrong" && (
          <Alert tone="warning" title="Ainda não.">
            Releia a aula e tente de novo.{tries >= 2 && !showHint ? " Se quiser, use a dica." : ""}
          </Alert>
        )}
        {solved && (
          <Alert tone="success" title={status === "revealed" ? "Correto (sem XP, pois a solução foi revelada antes)." : "Correto!"}>
            <InlineMd text={exercise.explanation} />
          </Alert>
        )}
        {showHint && !solved && (
          <p className="flex items-start gap-2 text-sm text-[#fbe7c0]">
            <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" /> {exercise.hint}
          </p>
        )}
        {revealed && !solved && (
          <Alert tone="info" title={`Uma resposta aceita: ${exercise.accepted[0]}`}>
            <InlineMd text={exercise.explanation} />
          </Alert>
        )}
      </div>
      {!solved && (
        <div className="mt-3 flex flex-wrap gap-2">
          {!showHint && (
            <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
              <Lightbulb aria-hidden className="size-4" /> Ver dica
            </Button>
          )}
          {!revealed && (
            <Button variant="ghost" size="sm" onClick={reveal}>
              <Eye aria-hidden className="size-4" /> Ver solução (sem XP)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function CompleteLessonButton({ slug, title }: { slug: string; title: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const done = hydrated && Boolean(progress.lessons[slug]);
  if (done) {
    return (
      <p className="inline-flex min-h-11 items-center gap-2 text-amber">
        <CheckCircle2 aria-hidden className="size-5" /> Aula concluída
      </p>
    );
  }
  return (
    <Button size="lg" onClick={() => dispatchProgress({ type: "lesson/complete", slug, title })}>
      <CheckCircle2 aria-hidden className="size-5" /> Marcar aula como concluída
    </Button>
  );
}

export function LessonQuiz({ slug, title, questions }: { slug: string; title: string; questions: SeedQuestion[] }) {
  return <QuizRunner slug={`revisao-${slug}`} title={`Revisão: ${title}`} questions={questions} questionIds={questions.map((_, i) => `${slug}#${i}`)} compact />;
}
