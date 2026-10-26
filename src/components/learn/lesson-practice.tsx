"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, Eye, Lightbulb } from "lucide-react";
import type { SeedExercise, SeedQuestion } from "@content/schema";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button } from "@/components/ui/primitives";
import { isAcceptedAnswer } from "@/lib/quiz/grading";
import { diagnoseAnswer } from "@/lib/tutor/tutor";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { QuizRunner } from "./quiz-runner";

export interface TutorContext {
  objective: string;
  summary: string;
  /** Exemplo parecido tirado da própria aula (renderizado no servidor). */
  example: ReactNode | null;
  /** Seções da aula, para quando não há exemplo de código. */
  sections: Array<{ id: string; text: string }>;
}

const STEP_TITLES = ["O conceito", "O caminho", "Um exemplo parecido", "Solução explicada"] as const;

export function ExercisePanel({ slug, title, exercise, tutor }: { slug: string; title: string; exercise: SeedExercise; tutor?: TutorContext }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const status = hydrated ? progress.exercises[slug] : undefined;
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  /** Quantas etapas de ajuda já foram abertas (0 a 4). A 4ª revela a solução, sem XP. */
  const [steps, setSteps] = useState(0);
  const [tries, setTries] = useState(0);
  const inputId = `exercicio-${slug}`;

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const ok = isAcceptedAnswer(answer, exercise.accepted);
    setFeedback(ok ? "right" : "wrong");
    setDiagnosis(ok ? null : diagnoseAnswer(answer, exercise.accepted));
    setTries((t) => t + 1);
    if (ok) dispatchProgress({ type: "exercise/solve", slug, title });
  }

  function nextStep() {
    if (steps === 3) {
      if (!window.confirm("Ver a solução agora? Este exercício deixa de valer XP.")) return;
      dispatchProgress({ type: "exercise/reveal", slug });
    }
    setSteps((s) => Math.min(4, s + 1));
  }

  const solved = status === "solved" || feedback === "right";
  const revealed = steps >= 4 || status === "revealed";
  const stepBody = (i: number): ReactNode => {
    if (i === 0)
      return tutor ? (
        <>
          <p>{tutor.objective}</p>
          <p className="mt-1 text-muted">{tutor.summary}</p>
        </>
      ) : (
        <p>Releia o objetivo da aula no topo da página.</p>
      );
    if (i === 1) return <InlineMd text={exercise.hint} />;
    if (i === 2) {
      if (tutor?.example)
        return (
          <>
            <p className="text-muted">Um trecho da aula que usa a mesma ideia. Adapte, não copie:</p>
            {tutor.example}
          </>
        );
      const secs = tutor?.sections.slice(0, 4) ?? [];
      return secs.length ? (
        <p>
          Releia estas partes da aula:{" "}
          {secs.map((s, j) => (
            <span key={s.id}>
              {j > 0 && ", "}
              <a href={`#${s.id}`} className="text-electric-hi underline underline-offset-2">
                {s.text}
              </a>
            </span>
          ))}
          .
        </p>
      ) : (
        <p>Releia a aula com calma e tente explicar a ideia com suas palavras antes de responder.</p>
      );
    }
    return (
      <>
        <p className="font-semibold">
          Uma resposta aceita: <code className="font-mono text-[#cfe0ff]">{exercise.accepted[0]}</code>
        </p>
        <div className="mt-1">
          <InlineMd text={exercise.explanation} />
        </div>
        {exercise.accepted.length > 1 && <p className="mt-1 text-xs text-subtle">Outras formas também são aceitas ({exercise.accepted.length} no total).</p>}
      </>
    );
  };

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
            {diagnosis ?? "Releia o enunciado e compare com o que a aula mostrou."}
            {tries >= 2 && steps === 0 ? " Se travar, peça uma dica abaixo: elas vêm aos poucos." : ""}
          </Alert>
        )}
        {solved && (
          <Alert tone="success" title={status === "revealed" ? "Correto (sem XP, pois a solução foi revelada antes)." : "Correto!"}>
            <InlineMd text={exercise.explanation} />
          </Alert>
        )}
      </div>

      {!solved && (
        <div className="mt-5 border-t border-line pt-4">
          {(steps > 0 || revealed) && (
            <ol className="space-y-3">
              {STEP_TITLES.slice(0, revealed ? 4 : steps).map((t, i) => (
                <li key={t} className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm">
                  <span className="grid size-6 place-items-center rounded-full border border-amber/60 font-mono text-xs text-amber">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{t}</p>
                    <div className="mt-1 leading-relaxed">{stepBody(i)}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {!revealed && (
            <Button variant={steps === 3 ? "ghost" : "secondary"} size="sm" className={steps > 0 ? "mt-4" : ""} onClick={nextStep}>
              {steps === 3 ? <Eye aria-hidden className="size-4" /> : <Lightbulb aria-hidden className="size-4" />}
              {steps === 0 ? "Preciso de uma dica" : steps === 3 ? "Ver a solução explicada (sem XP)" : `Próxima dica (${steps + 1} de 4)`}
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
