"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Dumbbell, Flame, RotateCcw, Target, Upload } from "lucide-react";
import { DAILY_GOALS, levelFromXp, levelTitle } from "@/lib/gamification/rules";
import { dailyXp, historyOf, streaks, totalXp } from "@/lib/progress/model";
import { dispatchProgress, exportProgress, importProgress, resetProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { Alert, Button, cx, EmptyState, ProgressBar } from "@/components/ui/primitives";
import { AccountSection } from "@/components/auth/account-section";
import { ContinueCard, type LessonOrderItem } from "./continue-card";
import { MissionsPanel } from "./missions-panel";
import { TrophyCase } from "./trophy-case";
import { WeeklyGoals } from "./weekly-goals";

interface CourseSummary {
  slug: string;
  title: string;
  lessonSlugs: string[];
}

const KIND_LABEL: Record<string, string> = {
  lesson: "Aula",
  practice: "Treino",
  exercise: "Exercício",
  quiz: "Quiz",
  game: "Jogo",
  project: "Projeto",
};

export function ProgressDashboard({ courses, order }: { courses: CourseSummary[]; order: LessonOrderItem[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return <p className="text-muted">Carregando seu progresso salvo neste navegador…</p>;
  }

  const xp = totalXp(progress);
  const level = levelFromXp(xp);
  const { current, best } = streaks(progress.days, new Date());
  const history = historyOf(progress);
  const lessonsDone = Object.keys(progress.lessons).length;
  const pendingMistakes = Object.values(progress.mistakes).filter((n) => n > 0).length;
  const stats = [
    { label: "Aulas concluídas", value: lessonsDone },
    { label: "Exercícios resolvidos", value: Object.values(progress.exercises).filter((e) => e === "solved").length },
    { label: "Quizzes aprovados", value: Object.values(progress.quizzes).filter((q) => q.passed).length },
    { label: "Jogos concluídos", value: Object.values(progress.games).filter((g) => g.completed).length },
    { label: "Projetos concluídos", value: Object.values(progress.projects).filter((p) => p.completedAt).length },
  ];

  function download() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `programacao-do-zero-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage({ tone: "error", text: "Arquivo grande demais para ser um backup de progresso." });
      return;
    }
    const ok = importProgress(await file.text());
    setMessage(ok ? { tone: "success", text: "Progresso importado." } : { tone: "error", text: "Esse arquivo não é um backup válido da Programação do Zero." });
  }

  return (
    <div className="space-y-12">
      <AccountSection />

      {/* Nível */}
      <section aria-labelledby="nivel" className="grid gap-6 rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 id="nivel" className="sr-only">
            Nível
          </h2>
          <p className="font-mono text-sm text-amber">Nível {level.level}</p>
          <p className="mt-1 text-3xl font-bold">{levelTitle(level.level)}</p>
          <p className="mt-2 text-sm text-muted">
            {xp} XP · faltam {level.nextLevelXp - xp} XP para o nível {level.level + 1}
          </p>
          <ProgressBar value={level.progress} label={`Progresso até o nível ${level.level + 1}`} className="mt-4 max-w-md" />
        </div>
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line px-4 py-3">
          <Flame aria-hidden className={cx("size-7", current > 0 ? "text-amber" : "text-subtle")} />
          <div>
            <p className="text-xl font-bold">
              {current} dia{current === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-muted">sequência atual · recorde {best}</p>
          </div>
        </div>
      </section>

      {/* Meta diária */}
      <section aria-labelledby="meta" className="grid gap-6 rounded-[var(--radius-lg)] border border-line p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 id="meta" className="flex items-center gap-2 text-xl font-semibold">
            <Target aria-hidden className="size-5 text-amber" /> Meta diária
          </h2>
          <p className="mt-2 text-sm text-muted">
            Hoje: <span className="font-mono text-amber">{dailyXp(progress, new Date())}</span> de {progress.settings.dailyGoal} XP
            {dailyXp(progress, new Date()) >= progress.settings.dailyGoal ? " · meta cumprida!" : ""}
          </p>
          <ProgressBar value={dailyXp(progress, new Date()) / progress.settings.dailyGoal} label="Meta diária de XP" className="mt-3 max-w-md" />
          <div role="group" aria-label="Escolher meta diária" className="mt-4 flex flex-wrap gap-2">
            {DAILY_GOALS.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={progress.settings.dailyGoal === g}
                onClick={() => dispatchProgress({ type: "settings/goal", goal: g })}
                className={cx(
                  "min-h-10 rounded-full border px-4 text-sm",
                  progress.settings.dailyGoal === g ? "border-amber bg-amber/10 text-amber" : "border-line-strong text-muted hover:text-fg",
                )}
              >
                {g} XP {g === 10 ? "· leve" : g === 20 ? "· regular" : g === 30 ? "· puxado" : "· intenso"}
              </button>
            ))}
          </div>
        </div>
        <Link href="/treino" className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] bg-electric px-5 font-semibold text-white hover:bg-electric-strong">
          <Dumbbell aria-hidden className="size-5" /> Treino de hoje
        </Link>
      </section>

      <WeeklyGoals progress={progress} />

      {lessonsDone === 0 && history.length === 0 ? (
        <EmptyState title="Seu progresso começa na primeira aula" action={<ContinueCard order={order} />}>
          Conclua aulas, resolva exercícios, passe nos quizzes e jogue para ganhar XP. Tudo fica salvo neste navegador, sem cadastro.
        </EmptyState>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <ContinueCard order={order} />
          <Link href="/revisao" className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-line-strong px-5 font-semibold hover:border-muted">
            Revisar erros{pendingMistakes ? ` (${pendingMistakes})` : ""}
          </Link>
          <Link href="/comecar" className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-line-strong px-5 font-semibold hover:border-muted">
            Minha trilha
          </Link>
          <Link href="/salvos" className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-line-strong px-5 font-semibold hover:border-muted">
            Salvos e anotações
          </Link>
        </div>
      )}

      {/* Números */}
      <section aria-labelledby="numeros">
        <h2 id="numeros" className="text-xl font-semibold">
          Atividades
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[var(--radius-md)] border border-line p-4">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="mt-1 font-mono text-2xl font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Trilhas */}
      <section aria-labelledby="trilhas-progresso">
        <h2 id="trilhas-progresso" className="text-xl font-semibold">
          Trilhas
        </h2>
        <ul className="mt-4 space-y-3">
          {courses.map((c) => {
            const done = c.lessonSlugs.filter((s) => progress.lessons[s]).length;
            return (
              <li key={c.slug}>
                <Link href={`/trilhas/${c.slug}`} className="block rounded-[var(--radius-md)] border border-line p-4 hover:border-muted">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{c.title}</span>
                    <span className="font-mono text-xs text-amber">
                      {done}/{c.lessonSlugs.length}
                    </span>
                  </span>
                  <ProgressBar value={c.lessonSlugs.length ? done / c.lessonSlugs.length : 0} label={`Progresso em ${c.title}`} className="mt-3" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <MissionsPanel progress={progress} />

      <TrophyCase progress={progress} />

      {/* Histórico */}
      <section aria-labelledby="historico">
        <h2 id="historico" className="text-xl font-semibold">
          Histórico
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nenhuma atividade com XP ainda.</p>
        ) : (
          <ol className="mt-4 divide-y divide-line rounded-[var(--radius-md)] border border-line">
            {history.slice(0, 50).map((h) => (
              <li key={h.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span>
                  <span className="mr-2 font-mono text-xs text-subtle">{KIND_LABEL[h.kind] ?? h.kind}</span>
                  {h.label}
                </span>
                <span className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-subtle">{new Date(h.at).toLocaleDateString("pt-BR")}</span>
                  <span className="text-amber">+{h.amount} XP</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Dados */}
      <section id="dados" aria-labelledby="dados-titulo" className="rounded-[var(--radius-lg)] border border-line p-6">
        <h2 id="dados-titulo" className="text-xl font-semibold">
          Seus dados
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          O progresso fica só neste navegador. Limpar os dados do navegador apaga o progresso; faça um backup para levá-lo a outro aparelho.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download}>
            <Download aria-hidden className="size-4" /> Exportar backup
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden className="size-4" /> Importar backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={onImport} />
          {!confirmReset ? (
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden className="size-4" /> Zerar progresso
            </Button>
          ) : (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#ffd6d6]">Isso apaga todo o progresso deste navegador.</span>
              <Button
                variant="danger"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  setMessage({ tone: "success", text: "Progresso zerado." });
                }}
              >
                Sim, zerar
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
            </span>
          )}
        </div>
        {message && (
          <Alert tone={message.tone} className="mt-4">
            {message.text}
          </Alert>
        )}
      </section>
    </div>
  );
}
