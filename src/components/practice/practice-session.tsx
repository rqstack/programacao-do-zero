"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Flame, Heart, HeartCrack, X, XCircle } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";
import { InlineMd } from "@/components/content/inline-md";
import { Button, cx, ProgressBar } from "@/components/ui/primitives";
import { seededShuffle } from "@/lib/games/engine";
import { PRACTICE_HEARTS, PRACTICE_SIZE, XP_RULES } from "@/lib/gamification/rules";
import { selectPractice, type BankQuestion } from "@/lib/practice/select";
import { localDay, streaks } from "@/lib/progress/model";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

type Phase = "intro" | "playing" | "done";

export function PracticeSession({ bank }: { bank: BankQuestion[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState("0");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hearts, setHearts] = useState(PRACTICE_HEARTS);
  const [right, setRight] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [earned, setEarned] = useState(0);

  const doneToday = hydrated && Boolean(progress.xp[`practice:${localDay(new Date())}`]);
  const reviewCount = hydrated ? Object.values(progress.mistakes).filter((n) => n > 0).length : 0;

  const [session, setSession] = useState<BankQuestion[]>([]);
  const current = session[index];
  const order = useMemo(
    () => (current ? seededShuffle(current.question.options.map((_, i) => i), `${seed}:${current.id}`) : []),
    [current, seed],
  );

  function start() {
    const newSeed = String(Date.now());
    setSession(
      selectPractice(bank, {
        completedLessons: new Set(Object.keys(progress.lessons)),
        mistakes: progress.mistakes,
        seed: newSeed,
        size: PRACTICE_SIZE,
      }),
    );
    setSeed(newSeed);
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setHearts(PRACTICE_HEARTS);
    setRight([]);
    setWrong([]);
    setEarned(0);
    setPhase("playing");
  }

  function finish(finalHearts: number, r: string[], w: string[]) {
    const reward = dispatchProgress({ type: "practice/complete", correct: r.length, total: session.length, heartsLeft: finalHearts, wrongIds: w, rightIds: r });
    setEarned(reward.xp);
    setPhase("done");
  }

  function check() {
    if (picked === null || !current) return;
    setChecked(true);
    if (picked === current.question.correct) setRight((r) => [...r, current.id]);
    else {
      setWrong((w) => [...w, current.id]);
      setHearts((h) => h - 1);
    }
  }

  function next() {
    if (!current) return;
    const isLast = index + 1 >= session.length;
    if (hearts <= 0 || isLast) {
      finish(hearts, right, wrong);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setChecked(false);
  }

  if (phase === "intro") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line bg-navy/60 p-6 sm:p-8">
        <p className="font-mono text-sm text-amber">{doneToday ? "Treino de hoje concluído ✓" : `+${XP_RULES.practice} XP no primeiro treino do dia`}</p>
        <h2 className="mt-3 text-2xl font-bold">{PRACTICE_SIZE} perguntas, {PRACTICE_HEARTS} vidas</h2>
        <ul className="mt-4 space-y-2 text-muted">
          <li>• Uma pergunta por vez, com a explicação logo depois de responder.</li>
          <li>• Cada erro custa uma vida. Sem vidas, o treino termina sem XP.</li>
          <li>
            • As perguntas que você errou voltam até você acertar.
            {reviewCount > 0 && <span className="text-amber"> Hoje há {reviewCount} para revisar.</span>}
          </li>
        </ul>
        <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={start}>
          {doneToday ? "Treinar de novo" : "Começar o treino"}
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    const total = right.length + wrong.length;
    const survived = hearts > 0;
    const { current: streak } = streaks(progress.days, new Date());
    return (
      <div className="rounded-[var(--radius-xl)] border border-amber/40 bg-navy/60 p-6 text-center sm:p-10" aria-live="polite">
        {survived ? <Flame aria-hidden className="mx-auto size-14 text-amber" /> : <HeartCrack aria-hidden className="mx-auto size-14 text-bad" />}
        <h2 className="mt-4 text-3xl font-bold">{survived ? "Treino concluído!" : "Acabaram as vidas"}</h2>
        <p className="mt-2 text-muted">
          {right.length} de {total} certas{survived ? "" : ". Revise as explicações e tente de novo"}.
        </p>
        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-md)] border border-line p-3">
            <p className="font-mono text-2xl font-bold text-amber">+{earned}</p>
            <p className="text-xs text-muted">XP</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line p-3">
            <p className="font-mono text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted">dia{streak === 1 ? "" : "s"} de ofensiva</p>
          </div>
        </div>
        {survived && earned === 0 && <p className="mt-4 text-sm text-subtle">O XP do treino vale uma vez por dia. Volte amanhã para manter a ofensiva!</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={start}>{survived ? "Treinar de novo" : "Tentar de novo"}</Button>
          <Link href="/trilhas" className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-4 font-semibold hover:border-muted">
            Voltar às trilhas
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return <p className="text-muted">Não há perguntas disponíveis para o treino ainda.</p>;
  }

  const isRight = checked && picked === current.question.correct;
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setPhase("intro")} aria-label="Sair do treino" className="grid size-10 shrink-0 place-items-center rounded-md text-muted hover:bg-panel hover:text-fg">
          <X aria-hidden className="size-5" />
        </button>
        <ProgressBar value={(index + (checked ? 1 : 0)) / session.length} label="Progresso do treino" className="h-3" />
        <span className="flex shrink-0 items-center gap-1 font-mono text-bad" aria-label={`${hearts} vidas`}>
          <Heart aria-hidden className="size-5 fill-current" /> {hearts}
        </span>
      </div>

      <div className="mt-8 pb-40">
        <p className="font-mono text-xs text-subtle">
          {current.lessonTitle}
          {progress.mistakes[current.id] ? <span className="ml-2 text-amber">revisão</span> : null}
        </p>
        <h2 className="mt-2 text-xl font-bold sm:text-2xl">
          <InlineMd text={current.question.prompt} />
        </h2>
        {current.question.code && <CodeBlock code={current.question.code} language={current.question.lang ?? "js"} />}
        <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Alternativas">
          {order.map((oi) => {
            const isPicked = picked === oi;
            const isCorrect = checked && oi === current.question.correct;
            const isWrongPick = checked && isPicked && !isCorrect;
            return (
              <button
                key={oi}
                type="button"
                role="radio"
                aria-checked={isPicked}
                disabled={checked}
                onClick={() => setPicked(oi)}
                className={cx(
                  "flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-md)] border-2 border-b-4 px-4 py-3 text-left transition-colors",
                  !checked && (isPicked ? "border-electric bg-electric/10" : "border-line-strong hover:border-muted"),
                  isCorrect && "border-ok bg-ok/10",
                  isWrongPick && "border-bad bg-bad/10",
                  checked && !isCorrect && !isWrongPick && "border-line opacity-50",
                )}
              >
                <span>
                  <InlineMd text={current.question.options[oi]!} />
                </span>
                {isCorrect && <CheckCircle2 aria-hidden className="size-5 shrink-0 text-ok" />}
                {isWrongPick && <XCircle aria-hidden className="size-5 shrink-0 text-bad" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Faixa inferior, como no Duolingo */}
      <div
        className={cx(
          "fixed inset-x-0 bottom-0 z-30 border-t-2 px-4 py-4 sm:py-6",
          !checked ? "border-line bg-ink/95" : isRight ? "border-ok/60 bg-[#062a1e]" : "border-bad/60 bg-[#2e0c10]",
        )}
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {checked ? (
            <div className="min-w-0">
              <p className={cx("text-lg font-bold", isRight ? "text-ok" : "text-bad")}>{isRight ? "Muito bem!" : "Resposta correta:"}</p>
              {!isRight && (
                <p className="text-sm text-fg">
                  <InlineMd text={current.question.options[current.question.correct]!} />
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                <InlineMd text={current.question.explanation} />
              </p>
            </div>
          ) : (
            <span className="hidden text-sm text-subtle sm:inline">Escolha uma alternativa</span>
          )}
          {checked ? (
            <Button size="lg" className={cx("shrink-0", !isRight && "bg-bad hover:bg-bad/90")} onClick={next} autoFocus>
              {hearts <= 0 ? "Ver resultado" : index + 1 >= session.length ? "Concluir" : "Continuar"}
            </Button>
          ) : (
            <Button size="lg" className="shrink-0" disabled={picked === null} onClick={check}>
              Verificar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
