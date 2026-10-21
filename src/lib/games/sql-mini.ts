import { z } from "zod";

/**
 * Mini avaliador de consultas para o jogo de SQL. O aluno monta a consulta com peças
 * (SELECT, FROM, WHERE, ORDER BY, LIMIT) e ela roda sobre tabelas de exemplo em memória.
 * Nenhum SQL de texto é interpretado ou executado em banco de dados.
 */
const cell = z.union([z.string(), z.number(), z.null()]);
export const sqlTable = z.object({
  name: z.string().regex(/^[a-z_]{1,30}$/),
  columns: z.array(z.string().regex(/^[a-z_]{1,30}$/)).min(1).max(6),
  rows: z.array(z.array(cell)).min(1).max(12),
});

export const sqlQuery = z.object({
  table: z.string().max(30),
  columns: z.array(z.string().max(30)).min(1).max(6),
  where: z
    .object({ column: z.string().max(30), op: z.enum(["=", "<>", ">", "<", ">=", "<="]), value: z.union([z.string().max(60), z.number()]) })
    .nullable(),
  orderBy: z.object({ column: z.string().max(30), dir: z.enum(["ASC", "DESC"]) }).nullable(),
  limit: z.number().int().min(1).max(20).nullable(),
});

export type SqlTable = z.infer<typeof sqlTable>;
export type SqlQuery = z.infer<typeof sqlQuery>;
export type SqlCell = z.infer<typeof cell>;

export interface SqlResult {
  columns: string[];
  rows: SqlCell[][];
}

export type SqlRun = { ok: true; result: SqlResult } | { ok: false; error: string };

function compare(a: SqlCell, op: NonNullable<SqlQuery["where"]>["op"], b: string | number): boolean {
  if (a === null) return false;
  const x = typeof b === "number" ? Number(a) : String(a);
  switch (op) {
    case "=":
      return x === b;
    case "<>":
      return x !== b;
    case ">":
      return x > b;
    case "<":
      return x < b;
    case ">=":
      return x >= b;
    case "<=":
      return x <= b;
  }
}

export function runQuery(tables: readonly SqlTable[], q: SqlQuery): SqlRun {
  const t = tables.find((x) => x.name === q.table);
  if (!t) return { ok: false, error: `A tabela "${q.table}" não existe.` };
  const idx = (c: string) => t.columns.indexOf(c);
  for (const c of q.columns) if (c !== "*" && idx(c) < 0) return { ok: false, error: `A coluna "${c}" não existe em ${t.name}.` };
  if (q.where && idx(q.where.column) < 0) return { ok: false, error: `A coluna "${q.where.column}" não existe em ${t.name}.` };
  if (q.orderBy && idx(q.orderBy.column) < 0) return { ok: false, error: `A coluna "${q.orderBy.column}" não existe em ${t.name}.` };

  let rows = t.rows.map((r) => [...r]);
  if (q.where) {
    const w = q.where;
    rows = rows.filter((r) => compare(r[idx(w.column)] ?? null, w.op, w.value));
  }
  if (q.orderBy) {
    const i = idx(q.orderBy.column);
    const dir = q.orderBy.dir === "ASC" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const x = a[i] ?? null;
      const y = b[i] ?? null;
      if (x === y) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return (x < y ? -1 : 1) * dir;
    });
  }
  if (q.limit) rows = rows.slice(0, q.limit);
  const cols = q.columns.includes("*") ? t.columns : q.columns;
  return { ok: true, result: { columns: cols, rows: rows.map((r) => cols.map((c) => r[idx(c)] ?? null)) } };
}

/** Compara resultados. A ordem das linhas só importa quando a consulta-gabarito ordena. */
export function sameResult(a: SqlResult, b: SqlResult, ordered: boolean): boolean {
  if (a.columns.join("|") !== b.columns.join("|") || a.rows.length !== b.rows.length) return false;
  const ser = (r: SqlCell[]) => JSON.stringify(r);
  if (ordered) return a.rows.every((r, i) => ser(r) === ser(b.rows[i]!));
  const x = a.rows.map(ser).sort();
  const y = b.rows.map(ser).sort();
  return x.every((r, i) => r === y[i]);
}

/** Texto SQL equivalente à consulta montada (para o aluno ler a sintaxe real). */
export function toSql(q: SqlQuery): string {
  const lit = (v: string | number) => (typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`);
  let sql = `SELECT ${q.columns.join(", ")}\nFROM ${q.table}`;
  if (q.where) sql += `\nWHERE ${q.where.column} ${q.where.op} ${lit(q.where.value)}`;
  if (q.orderBy) sql += `\nORDER BY ${q.orderBy.column} ${q.orderBy.dir}`;
  if (q.limit) sql += `\nLIMIT ${q.limit}`;
  return `${sql};`;
}
