"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";
import type { RoundFeedback, SqlPayload, SqlQuery, SqlResult } from "@/lib/games/engine";
import { runQuery, toSql } from "@/lib/games/sql-mini";

const OPS = ["=", "<>", ">", "<", ">=", "<="] as const;

function ResultTable({ result, caption }: { result: SqlResult; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <caption className="mb-1 text-left text-subtle">{caption}</caption>
        <thead>
          <tr>
            {result.columns.map((c) => (
              <th key={c} scope="col" className="border border-line bg-panel px-2 py-1 text-left">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td colSpan={result.columns.length} className="border border-line px-2 py-2 text-subtle">
                Nenhuma linha.
              </td>
            </tr>
          ) : (
            result.rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j} className="border border-line px-2 py-1">
                    {v === null ? "NULL" : String(v)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const select = "min-h-10 rounded-md border border-line-strong bg-ink px-2 font-mono text-sm";

export function SqlBuilderView({ payload, onAnswer, feedback }: { payload: SqlPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const first = payload.tables[0]!;
  const [table, setTable] = useState(first.name);
  const [columns, setColumns] = useState<string[]>([]);
  const [useWhere, setUseWhere] = useState(false);
  const [where, setWhere] = useState({ column: first.columns[0]!, op: "=" as (typeof OPS)[number], value: "" });
  const [useOrder, setUseOrder] = useState(false);
  const [order, setOrder] = useState({ column: first.columns[0]!, dir: "ASC" as "ASC" | "DESC" });
  const [limit, setLimit] = useState<number | null>(null);
  const [ran, setRan] = useState<ReturnType<typeof runQuery> | null>(null);

  const t = payload.tables.find((x) => x.name === table) ?? first;
  const numeric = (col: string) => {
    const i = t.columns.indexOf(col);
    return t.rows.every((r) => typeof r[i] === "number" || r[i] === null);
  };

  const query: SqlQuery = useMemo(
    () => ({
      table,
      columns: columns.length ? t.columns.filter((c) => columns.includes(c)) : ["*"],
      where: useWhere ? { column: where.column, op: where.op, value: numeric(where.column) ? Number(where.value) : where.value } : null,
      orderBy: useOrder ? order : null,
      limit,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, columns, useWhere, where, useOrder, order, limit, t],
  );
  const done = feedback !== null;

  function changeTable(name: string) {
    const nt = payload.tables.find((x) => x.name === name)!;
    setTable(name);
    setColumns([]);
    setWhere({ column: nt.columns[0]!, op: "=", value: "" });
    setOrder({ column: nt.columns[0]!, dir: "ASC" });
    setRan(null);
  }

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>

      <details className="mt-3 rounded-[var(--radius-md)] border border-line p-3" open>
        <summary className="cursor-pointer text-sm text-muted">Tabelas disponíveis</summary>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {payload.tables.map((tb) => (
            <ResultTable key={tb.name} caption={tb.name} result={{ columns: tb.columns, rows: tb.rows }} />
          ))}
        </div>
      </details>

      <fieldset disabled={done} className="mt-4 space-y-3 rounded-[var(--radius-md)] border border-line bg-[#040a17] p-4 font-mono text-sm">
        <legend className="px-1 font-sans text-sm text-muted">Monte a consulta</legend>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-[#ff9ec1]">SELECT</span>
          {t.columns.map((c) => (
            <label key={c} className={cx("inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded border px-2", columns.includes(c) ? "border-electric bg-electric/15" : "border-line-strong")}>
              <input
                type="checkbox"
                className="size-3.5 accent-[#3d7bff]"
                checked={columns.includes(c)}
                onChange={(e) => setColumns((cs) => (e.target.checked ? [...cs, c] : cs.filter((x) => x !== c)))}
              />
              {c}
            </label>
          ))}
          {columns.length === 0 && <span className="text-subtle">(nenhuma = *)</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-[#ff9ec1]">FROM</span>
          <select aria-label="Tabela" className={select} value={table} onChange={(e) => changeTable(e.target.value)}>
            {payload.tables.map((tb) => (
              <option key={tb.name}>{tb.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex w-20 items-center gap-1.5 text-[#ff9ec1]">
            <input type="checkbox" className="size-3.5 accent-[#3d7bff]" checked={useWhere} onChange={(e) => setUseWhere(e.target.checked)} /> WHERE
          </label>
          {useWhere && (
            <>
              <select aria-label="Coluna do filtro" className={select} value={where.column} onChange={(e) => setWhere((w) => ({ ...w, column: e.target.value }))}>
                {t.columns.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select aria-label="Operador" className={select} value={where.op} onChange={(e) => setWhere((w) => ({ ...w, op: e.target.value as (typeof OPS)[number] }))}>
                {OPS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <input
                aria-label="Valor do filtro"
                className={cx(select, "w-32")}
                inputMode={numeric(where.column) ? "numeric" : "text"}
                value={where.value}
                onChange={(e) => setWhere((w) => ({ ...w, value: e.target.value.slice(0, 60) }))}
                placeholder={numeric(where.column) ? "número" : "texto"}
              />
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex w-20 items-center gap-1.5 whitespace-nowrap text-[#ff9ec1]">
            <input type="checkbox" className="size-3.5 accent-[#3d7bff]" checked={useOrder} onChange={(e) => setUseOrder(e.target.checked)} /> ORDER BY
          </label>
          {useOrder && (
            <>
              <select aria-label="Coluna da ordenação" className={select} value={order.column} onChange={(e) => setOrder((o) => ({ ...o, column: e.target.value }))}>
                {t.columns.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select aria-label="Direção" className={select} value={order.dir} onChange={(e) => setOrder((o) => ({ ...o, dir: e.target.value as "ASC" | "DESC" }))}>
                <option>ASC</option>
                <option>DESC</option>
              </select>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex w-20 items-center gap-1.5 text-[#ff9ec1]">
            <input type="checkbox" className="size-3.5 accent-[#3d7bff]" checked={limit !== null} onChange={(e) => setLimit(e.target.checked ? 2 : null)} /> LIMIT
          </label>
          {limit !== null && (
            <input aria-label="Limite de linhas" type="number" min={1} max={20} className={cx(select, "w-20")} value={limit} onChange={(e) => setLimit(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
          )}
        </div>
      </fieldset>

      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-black/40 p-3 font-mono text-sm text-[#cfe0ff]">{toSql(query)}</pre>

      {!done && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setRan(runQuery(payload.tables, query))}>
            <Play aria-hidden className="size-4" /> Executar
          </Button>
          <Button onClick={() => onAnswer({ query })}>Confirmar resposta</Button>
        </div>
      )}

      <div className="mt-4" aria-live="polite">
        {ran && !done && (ran.ok ? <ResultTable caption="Resultado" result={ran.result} /> : <p className="text-sm text-bad">{ran.error}</p>)}
        {done && feedback?.kind === "sql_builder" && (
          <div className="grid gap-4 md:grid-cols-2">
            {feedback.result ? <ResultTable caption="Seu resultado" result={feedback.result} /> : <p className="text-sm text-bad">{feedback.error}</p>}
            <ResultTable caption="Resultado esperado" result={feedback.expected} />
            {!feedback.correct && <pre className="overflow-x-auto rounded-md border border-ok/40 bg-black/40 p-3 font-mono text-xs text-[#c8f5e4] md:col-span-2">{feedback.expectedSql}</pre>}
          </div>
        )}
      </div>
    </div>
  );
}
