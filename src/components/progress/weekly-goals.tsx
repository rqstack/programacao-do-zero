"use client";

import { useState } from "react";
import { CalendarCheck, Pencil } from "lucide-react";
import { Button, cx, ProgressBar } from "@/components/ui/primitives";
import type { ProgressState } from "@/lib/progress/model";
import { dispatchProgress } from "@/lib/progress/store";
import { WEEKLY_INFO, WEEKLY_TYPES, weekRange, weeklyProgress, type WeeklyGoal, type WeeklyType } from "@/lib/progress/weekly";

const fmt = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** Metas da semana: a pessoa escolhe quais e quanto. Sem penalidade por dia perdido. */
export function WeeklyGoals({ progress }: { progress: ProgressState }) {
  const [editing, setEditing] = useState(false);
  const goals = progress.settings.weekly;
  const items = weeklyProgress(progress, new Date());
  const range = weekRange(new Date());

  return (
    <section aria-labelledby="semana" className="rounded-[var(--radius-lg)] border border-line p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="semana" className="flex items-center gap-2 text-xl font-semibold">
            <CalendarCheck aria-hidden className="size-5 text-electric-hi" /> Metas da semana
          </h2>
          <p className="mt-1 text-sm text-muted">
            De {fmt(range.start)} a {fmt(range.end)}. Recomeça toda segunda; perder um dia não tira nada.
          </p>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            <Pencil aria-hidden className="size-4" /> {goals.length ? "Ajustar metas" : "Escolher metas"}
          </Button>
        )}
      </div>

      {editing ? (
        <GoalEditor
          initial={goals}
          onCancel={() => setEditing(false)}
          onSave={(g) => {
            dispatchProgress({ type: "settings/weekly", goals: g });
            setEditing(false);
          }}
        />
      ) : goals.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nenhuma meta escolhida. Metas pequenas e possíveis funcionam melhor: por exemplo, estudar 3 dias e concluir 2 aulas.</p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map(({ goal, value, done }) => (
            <li key={goal.type}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={cx(done && "text-ok")}>{WEEKLY_INFO[goal.type].label(goal.target)}</span>
                <span className="font-mono text-xs text-muted">
                  {Math.min(value, goal.target)}/{goal.target}
                  {done ? " · feito" : ""}
                </span>
              </div>
              <ProgressBar value={value / goal.target} label={WEEKLY_INFO[goal.type].label(goal.target)} className="mt-2" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GoalEditor({ initial, onSave, onCancel }: { initial: WeeklyGoal[]; onSave: (g: WeeklyGoal[]) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Record<WeeklyType, number | null>>(() => {
    const out = Object.fromEntries(WEEKLY_TYPES.map((t) => [t, null])) as Record<WeeklyType, number | null>;
    for (const g of initial) out[g.type] = g.target;
    return out;
  });
  return (
    <form
      className="mt-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(WEEKLY_TYPES.filter((t) => draft[t] !== null).map((t) => ({ type: t, target: draft[t]! })));
      }}
    >
      {WEEKLY_TYPES.map((t) => {
        const info = WEEKLY_INFO[t];
        const on = draft[t] !== null;
        const id = `meta-${t}`;
        return (
          <div key={t} className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-10 flex-1 items-center gap-3 text-sm">
              <input type="checkbox" className="size-4 accent-[#3d7bff]" checked={on} onChange={(e) => setDraft((d) => ({ ...d, [t]: e.target.checked ? info.suggested : null }))} />
              {info.label(draft[t] ?? info.suggested)}
            </label>
            {on && (
              <span className="flex items-center gap-2">
                <label htmlFor={id} className="sr-only">
                  Quantidade
                </label>
                <input
                  id={id}
                  type="number"
                  min={1}
                  max={info.max}
                  value={draft[t]!}
                  onChange={(e) => setDraft((d) => ({ ...d, [t]: Math.max(1, Math.min(info.max, Number(e.target.value) || 1)) }))}
                  className="min-h-10 w-20 rounded-md border border-line-strong bg-ink px-2 font-mono text-sm"
                />
              </span>
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit">Salvar metas</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
