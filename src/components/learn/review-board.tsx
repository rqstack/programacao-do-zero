"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { SeedQuestion } from "@content/schema";
import { CodeBlock } from "@/components/content/code-block";
import { InlineMd } from "@/components/content/inline-md";
import { Alert, Button, ButtonLink, cx, EmptyState } from "@/components/ui/primitives";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { weekRange } from "@/lib/progress/weekly";

export interface ReviewQuestion {
  id: string;
  lessonSlug: string;
  lessonTitle: string;
  courseTitle: string;
  question: SeedQuestion;
}

const SESSION = 10;

/** Revisão dos erros: refazer perguntas erradas, ver explicações e acompanhar a evolução. */
export function ReviewBoard({ bank }: { bank: ReviewQuestion[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [session, setSession] = useState<ReviewQuestion[] | null>(null);

  const byId = useMemo(() => new Map(bank.map((q) => [q.id, q])), [bank]);
  const pending = hydrated
    ? Object.entries(progress.mistakes)
        .filter(([id, n]) => n > 0 && byId.has(id))
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([id, n]) => ({ q: byId.get(id)!, n }))
    : [];

  // Assuntos com mais dificuldade: aulas com mais erros pendentes.
  const topics = new Map<string, { lessonSlug: string; lessonTitle: string; courseTitle: string; ids: string[]; weight: number }>();
  for (const { q, n } of pending) {
    const t = topics.get(q.lessonSlug) ?? { lessonSlug: q.lessonSlug, lessonTitle: q.lessonTitle, courseTitle: q.courseTitle, ids: [], weight: 0 };
    t.ids.push(q.id);
    t.weight += n;
    topics.set(q.lessonSlug, t);
  }
  const topicList = [...topics.values()].sort((a, b) => b.weight - a.weight);

  // Evolução: perguntas corrigidas por semana (últimas 6 semanas).
  const weeks = useMemo(() => {
    const out: Array<{ start: string; count: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      out.push({ start: weekRange(d).start, count: 0 });
    }
    if (hydrated) {
      for (const at of Object.values(progress.resolved)) {
        const start = weekRange(new Date(at)).start;
        const w = out.find((x) => x.start === start);
        if (w) w.count++;
      }
    }
    return out;
  }, [hydrated, progress.resolved]);
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
  const resolvedTotal = hydrated ? Object.keys(progress.resolved).length : 0;

  if (session) return <ReviewSession questions={session} onExit={() => setSession(null)} />;

  return (
    <div className="space-y-12">
      <section aria-labelledby="pendentes" className="grid gap-6 sm:grid-cols-3">
        <h2 id="pendentes" className="sr-only">
          Resumo
        </h2>
        <Stat label="Para revisar" value={hydrated ? pending.length : "—"} />
        <Stat label="Já corrigidas" value={hydrated ? resolvedTotal : "—"} />
        <Stat label="Assuntos com erros" value={hydrated ? topicList.length : "—"} />
      </section>

      {hydrated && pending.length === 0 ? (
        <EmptyState title={resolvedTotal ? "Nada pendente. Tudo revisado!" : "Nenhum erro para revisar ainda"} action={<ButtonLink href="/treino">Fazer o treino diário</ButtonLink>}>
          As perguntas que você errar nos quizzes e no treino aparecem aqui. Cada uma sai da lista quando você acerta de novo.
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setSession(pending.slice(0, SESSION).map((p) => p.q))} disabled={pending.length === 0}>
              <RotateCcw aria-hidden className="size-4" /> Refazer as {Math.min(SESSION, pending.length)} que mais errei
            </Button>
            <span className="text-sm text-muted">Sem XP e sem pressa: aqui o que conta é entender.</span>
          </div>

          <section aria-labelledby="assuntos">
            <h2 id="assuntos" className="text-xl font-bold">
              Onde você mais errou
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {topicList.map((t) => (
                <li key={t.lessonSlug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{t.lessonTitle}</p>
                    <p className="text-sm text-muted">
                      {t.courseTitle} · {t.ids.length} {t.ids.length === 1 ? "pergunta" : "perguntas"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setSession(t.ids.map((id) => byId.get(id)!))}>
                      Refazer
                    </Button>
                    <ButtonLink size="sm" variant="ghost" href={`/aulas/${t.lessonSlug}`}>
                      Rever a aula
                    </ButtonLink>
                    <ButtonLink size="sm" variant="ghost" href={`/quizzes/revisao-${t.lessonSlug}`}>
                      Praticar o quiz
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="evolucao">
        <h2 id="evolucao" className="text-xl font-bold">
          Evolução
        </h2>
        <p className="mt-1 text-sm text-muted">Perguntas que você tinha errado e passou a acertar, por semana.</p>
        <ol className="mt-5 flex h-36 items-end gap-3" aria-label="Perguntas corrigidas nas últimas 6 semanas">
          {weeks.map((w, i) => (
            <li key={w.start} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="font-mono text-xs text-muted">{w.count}</span>
              <span
                aria-hidden
                className={cx("w-full max-w-12 rounded-t-sm", i === weeks.length - 1 ? "bg-amber" : "bg-electric/60")}
                style={{ height: `${Math.max(3, (w.count / maxWeek) * 88)}px` }}
              />
              <span className="font-mono text-[10px] text-subtle">{i === weeks.length - 1 ? "esta" : w.start.slice(8, 10) + "/" + w.start.slice(5, 7)}</span>
              <span className="sr-only">
                Semana de {w.start}: {w.count}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-l-2 border-line-strong pl-4">
      <p className="font-mono text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

function ReviewSession({ questions, onExit }: { questions: ReviewQuestion[]; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const item = questions[i];
  const done = i >= questions.length;

  function confirm() {
    if (picked === null || !item) return;
    const correct = picked === item.question.correct;
    dispatchProgress({ type: "review/answer", id: item.id, correct });
    setResults((r) => [...r, correct]);
  }

  if (done || !item) {
    const right = results.filter(Boolean).length;
    return (
      <div className="space-y-5">
        <Alert tone={right === results.length ? "success" : "info"} title={`Você acertou ${right} de ${results.length}.`}>
          Cada acerto diminui a pergunta na revisão; ela sai da lista quando o número de acertos alcança o de erros. Errar de novo não tira nada: ela só fica mais um pouco.
        </Alert>
        <Button onClick={onExit}>Voltar para a revisão</Button>
      </div>
    );
  }

  const answered = results.length > i;
  const q = item.question;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-subtle">
          {i + 1}/{questions.length} · {item.lessonTitle}
        </p>
        <Button size="sm" variant="ghost" onClick={onExit}>
          Sair
        </Button>
      </div>
      <fieldset disabled={answered} className="mt-3">
        <legend className="text-lg font-semibold">
          <InlineMd text={q.prompt} />
        </legend>
        {q.code && <CodeBlock code={q.code} language={q.lang ?? "js"} />}
        <div className="mt-3 grid gap-2">
          {q.options.map((opt, oi) => {
            const isCorrect = answered && oi === q.correct;
            const isWrong = answered && picked === oi && oi !== q.correct;
            return (
              <label
                key={oi}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm",
                  !answered && (picked === oi ? "border-electric bg-electric/10" : "border-line-strong hover:border-muted"),
                  isCorrect && "border-ok/60 bg-ok/10",
                  isWrong && "border-bad/60 bg-bad/10",
                  answered && !isCorrect && !isWrong && "border-line opacity-60",
                )}
              >
                <input type="radio" name={`revisao-${item.id}`} className="size-4 accent-[#3d7bff]" checked={picked === oi} onChange={() => setPicked(oi)} />
                <span className="flex-1">
                  <InlineMd text={opt} />
                </span>
                {isCorrect && <CheckCircle2 aria-label="Resposta correta" className="size-4 text-ok" />}
                {isWrong && <XCircle aria-label="Sua resposta" className="size-4 text-bad" />}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 space-y-4" aria-live="polite">
        {answered && (
          <Alert tone={results[i] ? "success" : "warning"} title={results[i] ? "Certo!" : "Ainda não."}>
            <InlineMd text={q.explanation} />{" "}
            <Link href={`/aulas/${item.lessonSlug}`} className="underline underline-offset-2">
              Rever a aula
            </Link>
          </Alert>
        )}
        {!answered ? (
          <Button onClick={confirm} disabled={picked === null}>
            Conferir
          </Button>
        ) : (
          <Button
            autoFocus
            onClick={() => {
              setPicked(null);
              setI((n) => n + 1);
            }}
          >
            {i + 1 >= questions.length ? "Ver resultado" : "Próxima"}
          </Button>
        )}
      </div>
    </div>
  );
}

