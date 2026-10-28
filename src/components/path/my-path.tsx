"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, CircleDot, Pencil } from "lucide-react";
import { LANGUAGE_TRAILS } from "@content/paths";
import { Button, ButtonLink, cx, ProgressBar } from "@/components/ui/primitives";
import { buildPath, MINUTES, type Answers, type CourseInfo, type Goal, type Level } from "@/lib/path/recommend";
import type { ProgressState } from "@/lib/progress/model";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { AdaptivePanel, type AdaptiveData } from "./adaptive-panel";

const LEVELS: Array<{ id: Level; label: string; text: string }> = [
  { id: "nunca", label: "Nunca programei", text: "Começamos pela lógica, do zero." },
  { id: "basico", label: "Conheço o básico", text: "Variáveis, condições e laços não são novidade." },
  { id: "projetos", label: "Já desenvolvi alguns projetos", text: "Quero avançar e preencher lacunas." },
];
const GOALS: Array<{ id: Goal; label: string }> = [
  { id: "logica", label: "Aprender lógica" },
  { id: "linguagem", label: "Aprender uma linguagem" },
  { id: "projetos", label: "Criar projetos" },
  { id: "estagio", label: "Preparar-me para um estágio" },
  { id: "hobby", label: "Estudar por hobby" },
];

type LangKey = NonNullable<ProgressState["onboarding"]>["langs"][number];
type Draft = { level: Level | null; goal: Goal | null; langs: string[]; minutes: Answers["minutes"] | null };

/** Começo guiado (pode pular qualquer pergunta) e a trilha recomendada, sempre editável. */
export function MyPath({ courses, adaptive }: { courses: CourseInfo[]; adaptive: AdaptiveData }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const saved = hydrated ? progress.onboarding : null;
  const [editing, setEditing] = useState(false);

  if (!hydrated) return null;
  if (editing || !saved || saved.skipped) {
    return (
      <div className="space-y-10">
        <Questions
          initial={saved && !saved.skipped ? { level: saved.level, goal: saved.goal, langs: saved.langs, minutes: saved.minutes } : null}
          onDone={(d) => {
            dispatchProgress({ type: "onboarding/save", answers: { ...d, langs: d.langs.filter((l): l is LangKey => l in LANGUAGE_TRAILS) } });
            setEditing(false);
          }}
          onSkip={() => {
            dispatchProgress({ type: "onboarding/save", answers: null });
            setEditing(false);
          }}
          skipped={Boolean(saved?.skipped) && !editing}
        />
        <AdaptivePanel data={adaptive} />
      </div>
    );
  }

  const answers: Answers = { level: saved.level ?? "nunca", goal: saved.goal ?? "linguagem", langs: saved.langs, minutes: saved.minutes ?? 20 };
  const done = new Set(Object.keys(progress.lessons));
  const plan = buildPath(answers, courses, done);
  const main = plan.steps.filter((s) => !s.optional);
  const finished = main.filter((s) => s.status === "concluida").length;

  return (
    <div className="space-y-10">
      <section aria-labelledby="sua-trilha" className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="sua-trilha" className="text-2xl font-bold">
              Sua trilha
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil aria-hidden className="size-4" /> Mudar respostas
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted">
            {LEVELS.find((l) => l.id === answers.level)?.label} · {GOALS.find((g) => g.id === answers.goal)?.label}
            {answers.langs.length ? ` · ${answers.langs.map((l) => LANGUAGE_TRAILS[l]?.label).join(", ")}` : ""} · {answers.minutes} min por dia
          </p>
          <ProgressBar className="mt-4 max-w-md" value={main.length ? finished / main.length : 0} label="Trilhas concluídas da sua sequência" />
          <p className="mt-1 font-mono text-xs text-subtle">
            {finished}/{main.length} trilhas · faltam cerca de {plan.totalDays} dias no seu ritmo
          </p>

          <ol className="mt-6 space-y-3">
            {plan.steps.map((s, i) => {
              const Icon = s.status === "concluida" ? CheckCircle2 : s.status === "em_andamento" || s.status === "proxima" ? CircleDot : Circle;
              return (
                <li key={s.slug} className={cx("grid grid-cols-[1.5rem_1fr] gap-3", s.optional && "opacity-75")}>
                  <Icon aria-hidden className={cx("mt-0.5 size-5", s.status === "concluida" ? "text-ok" : s.status === "depois" ? "text-subtle" : "text-electric-hi")} />
                  <div className="min-w-0 border-b border-line pb-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link href={`/trilhas/${s.slug}`} className="font-semibold hover:text-electric-hi">
                        <span className="mr-2 font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                        {s.title}
                      </Link>
                      <span className="font-mono text-xs text-muted">
                        {s.done}/{s.total} aulas{s.status !== "concluida" ? ` · ~${s.days} dia(s)` : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{s.reason}</p>
                    {s.waitingFor.length > 0 && s.status === "depois" && (
                      <p className="text-xs text-subtle">
                        Melhor depois de: {s.waitingFor.map((w) => courses.find((c) => c.slug === w)?.title ?? w).join(", ")}. Mesmo assim, as aulas já estão abertas.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="rounded-[var(--radius-lg)] border border-line p-5 lg:sticky lg:top-24">
          {plan.next ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Próxima aula</p>
              <p className="mt-2 font-semibold">{plan.next.lessonTitle}</p>
              <p className="text-sm text-muted">{plan.next.courseTitle}</p>
              <ButtonLink href={`/aulas/${plan.next.lessonSlug}`} className="mt-4 w-full">
                Continuar <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </>
          ) : (
            <p className="text-sm">Você concluiu todas as trilhas da sua sequência. Mude as respostas para montar a próxima etapa.</p>
          )}
          <p className="mt-4 text-xs text-subtle">É só uma sugestão: todas as trilhas e aulas continuam abertas no menu Trilhas.</p>
        </aside>
      </section>

      <AdaptivePanel data={adaptive} />
    </div>
  );
}

function Questions({ initial, onDone, onSkip, skipped }: { initial: Draft | null; onDone: (d: Answers) => void; onSkip: () => void; skipped: boolean }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(initial ?? { level: null, goal: null, langs: [], minutes: null });
  const finish = (x: Draft) => onDone({ level: x.level ?? "nunca", goal: x.goal ?? "linguagem", langs: x.langs, minutes: x.minutes ?? 20 });
  const next = (x: Draft) => (step >= 3 ? finish(x) : setStep(step + 1));

  const option = (selected: boolean, label: string, text: string | null, onClick: () => void) => (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx("min-h-12 rounded-[var(--radius-md)] border-2 px-4 py-3 text-left", selected ? "border-electric bg-electric/10" : "border-line hover:border-line-strong")}
    >
      <span className="block font-semibold">{label}</span>
      {text && <span className="block text-sm text-muted">{text}</span>}
    </button>
  );

  return (
    <section aria-labelledby="perguntas" className="max-w-2xl">
      {skipped && <p className="mb-4 text-sm text-muted">Você pulou as perguntas. Quando quiser, responda para receber uma sequência sugerida.</p>}
      <p className="font-mono text-xs text-subtle">Pergunta {step + 1} de 4 · todas são opcionais</p>
      <ProgressBar className="mt-2" value={(step + 1) / 4} label="Perguntas respondidas" />
      {step === 0 && (
        <fieldset className="mt-6">
          <legend id="perguntas" className="text-xl font-bold">
            Qual é o seu nível atual?
          </legend>
          <div className="mt-4 grid gap-2">{LEVELS.map((l) => option(d.level === l.id, l.label, l.text, () => { const x = { ...d, level: l.id }; setD(x); next(x); }))}</div>
        </fieldset>
      )}
      {step === 1 && (
        <fieldset className="mt-6">
          <legend id="perguntas" className="text-xl font-bold">
            Qual é o seu objetivo?
          </legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{GOALS.map((g) => option(d.goal === g.id, g.label, null, () => { const x = { ...d, goal: g.id }; setD(x); next(x); }))}</div>
        </fieldset>
      )}
      {step === 2 && (
        <fieldset className="mt-6">
          <legend id="perguntas" className="text-xl font-bold">
            Quais linguagens despertam seu interesse?
          </legend>
          <p className="mt-1 text-sm text-muted">Escolha quantas quiser.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(LANGUAGE_TRAILS).map(([id, l]) =>
              option(d.langs.includes(id), l.label, null, () => setD({ ...d, langs: d.langs.includes(id) ? d.langs.filter((x) => x !== id) : [...d.langs, id] })),
            )}
          </div>
          <Button className="mt-4" onClick={() => next(d)}>
            Continuar
          </Button>
        </fieldset>
      )}
      {step === 3 && (
        <fieldset className="mt-6">
          <legend id="perguntas" className="text-xl font-bold">
            Quanto tempo você pretende estudar por dia?
          </legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{MINUTES.map((m) => option(d.minutes === m, `${m} min`, null, () => { const x = { ...d, minutes: m }; setD(x); finish(x); }))}</div>
        </fieldset>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        )}
        <Button variant="ghost" onClick={() => next(d)}>
          Pular esta pergunta
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Pular tudo e explorar sozinho
        </Button>
      </div>
    </section>
  );
}
