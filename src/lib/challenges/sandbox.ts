"use client";

/**
 * Executa o código do aluno fora da página, num Web Worker criado na hora:
 * sem acesso ao DOM, ao localStorage ou à sessão, e encerrado se passar do tempo
 * (laço infinito não trava o site). Python roda com Pyodide e SQL com sql.js (SQLite),
 * os dois carregados de CDN gratuita só quando a linguagem é escolhida.
 */
import type { SqlTable } from "./core";

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";
const SQLJS = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

export type CaseResult = { ok: true; value: unknown; undef?: boolean } | { ok: false; error: string };
export type RunOutcome =
  | { ok: true; results: CaseResult[]; logs: string[] }
  | { ok: false; error: string; logs: string[] };

const JS_WORKER = `
const fmt = (v) => { if (typeof v === "string") return v; try { return JSON.stringify(v); } catch (e) { return String(v); } };
self.onmessage = (e) => {
  const { id, code, fn, cases } = e.data;
  const logs = [];
  const push = (...a) => { if (logs.length < 200) logs.push(a.map(fmt).join(" ")); };
  const con = { log: push, info: push, warn: push, error: push, table: push };
  self.postMessage({ id, type: "ready" });
  let f;
  try {
    f = new Function("console", code + "\\n;return typeof " + fn + " === 'function' ? " + fn + " : undefined;")(con);
  } catch (err) {
    self.postMessage({ id, type: "done", data: { ok: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)), logs } });
    return;
  }
  if (!f) {
    self.postMessage({ id, type: "done", data: { ok: false, error: "Não achei a função " + fn + ". Mantenha o nome que veio no código inicial.", logs } });
    return;
  }
  const results = cases.map((args) => {
    try {
      const v = f(...args);
      if (v === undefined) return { ok: true, value: null, undef: true };
      return { ok: true, value: JSON.parse(JSON.stringify(v)) };
    } catch (err) {
      return { ok: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)) };
    }
  });
  self.postMessage({ id, type: "done", data: { ok: true, results, logs } });
};`;

const PY_HARNESS = `
import json
__ns = {"__name__": "__main__"}
try:
    exec(__code, __ns)
    __f = __ns.get(__fn)
    if not callable(__f):
        raise NameError("Não achei a função " + __fn + ". Mantenha o nome que veio no código inicial.")
    __res = []
    for __args in json.loads(__cases):
        try:
            __v = __f(*__args)
            __res.append({"ok": True, "value": __v, "undef": __v is None})
        except Exception as __e:
            __res.append({"ok": False, "error": type(__e).__name__ + ": " + str(__e)})
    __out = json.dumps({"ok": True, "results": __res})
except Exception as __e:
    __out = json.dumps({"ok": False, "error": type(__e).__name__ + ": " + str(__e)})
__out
`;

const PY_WORKER = `
let py = null;
self.onmessage = async (e) => {
  const { id, code, fn, cases } = e.data;
  const logs = [];
  try {
    if (!py) {
      importScripts("${PYODIDE}pyodide.js");
      py = await loadPyodide({ indexURL: "${PYODIDE}" });
    }
    py.setStdout({ batched: (s) => { if (logs.length < 200) logs.push(s); } });
    py.setStderr({ batched: (s) => { if (logs.length < 200) logs.push(s); } });
    self.postMessage({ id, type: "ready" });
    py.globals.set("__code", code);
    py.globals.set("__fn", fn);
    py.globals.set("__cases", JSON.stringify(cases));
    const data = JSON.parse(py.runPython(${JSON.stringify(PY_HARNESS)}));
    data.logs = logs;
    self.postMessage({ id, type: "done", data });
  } catch (err) {
    self.postMessage({ id, type: "done", data: { ok: false, error: String(err && err.message ? err.message : err).split("\\n").slice(-3).join("\\n"), logs } });
  }
};`;

const SQL_WORKER = `
let SQL = null;
self.onmessage = async (e) => {
  const { id, setup, queries } = e.data;
  try {
    if (!SQL) {
      importScripts("${SQLJS}sql-wasm.js");
      SQL = await initSqlJs({ locateFile: (f) => "${SQLJS}" + f });
    }
    self.postMessage({ id, type: "ready" });
    const data = queries.map((q) => {
      const db = new SQL.Database();
      try {
        db.run(setup);
        const r = db.exec(q);
        const last = r[r.length - 1];
        return { ok: true, columns: last ? last.columns : [], rows: last ? last.values : [] };
      } catch (err) {
        return { ok: false, error: String(err && err.message ? err.message : err) };
      } finally {
        db.close();
      }
    });
    self.postMessage({ id, type: "done", data });
  } catch (err) {
    self.postMessage({ id, type: "done", data: queries.map(() => ({ ok: false, error: "Não foi possível carregar o SQLite: " + String(err && err.message ? err.message : err) })) });
  }
};`;

/** Um worker reaproveitável. O relógio só começa quando o worker avisa que está pronto. */
class Sandbox {
  private worker: Worker | null = null;
  private seq = 0;
  constructor(
    private readonly source: string,
    private readonly bootMs: number,
  ) {}

  run<T>(payload: Record<string, unknown>, timeoutMs: number, onReady?: () => void): Promise<T | "timeout"> {
    if (!this.worker) {
      const url = URL.createObjectURL(new Blob([this.source], { type: "text/javascript" }));
      this.worker = new Worker(url);
      URL.revokeObjectURL(url);
    }
    const worker = this.worker;
    const id = ++this.seq;
    return new Promise((resolve) => {
      let timer = window.setTimeout(() => kill(), this.bootMs);
      const kill = () => {
        worker.removeEventListener("message", onMsg);
        worker.terminate();
        if (this.worker === worker) this.worker = null;
        resolve("timeout");
      };
      const onMsg = (e: MessageEvent<{ id: number; type: string; data?: T }>) => {
        if (e.data.id !== id) return;
        if (e.data.type === "ready") {
          window.clearTimeout(timer);
          timer = window.setTimeout(kill, timeoutMs);
          onReady?.();
          return;
        }
        window.clearTimeout(timer);
        worker.removeEventListener("message", onMsg);
        resolve(e.data.data as T);
      };
      worker.addEventListener("message", onMsg);
      worker.postMessage({ id, ...payload });
    });
  }
}

const js = new Sandbox(JS_WORKER, 5_000);
const python = new Sandbox(PY_WORKER, 90_000);
const sqlite = new Sandbox(SQL_WORKER, 45_000);

const TIMEOUT_MSG = "Tempo esgotado: o código demorou demais (laço infinito?). A execução foi interrompida.";

export async function runFunction(lang: "javascript" | "typescript" | "python", code: string, fn: string, cases: unknown[][], onReady?: () => void): Promise<RunOutcome> {
  if (lang === "python") {
    const r = await python.run<RunOutcome>({ code, fn, cases }, 6_000, onReady);
    return r === "timeout" ? { ok: false, error: TIMEOUT_MSG, logs: [] } : r;
  }
  let source = code;
  if (lang === "typescript") {
    try {
      const { transform } = await import("sucrase");
      source = transform(code, { transforms: ["typescript"] }).code;
    } catch (err) {
      return { ok: false, error: `Erro de sintaxe: ${err instanceof Error ? err.message : String(err)}`, logs: [] };
    }
  }
  const r = await js.run<RunOutcome>({ code: source, fn, cases }, 3_000, onReady);
  return r === "timeout" ? { ok: false, error: TIMEOUT_MSG, logs: [] } : r;
}

export type SqlRun = ({ ok: true } & SqlTable) | { ok: false; error: string };

/** Roda cada consulta num banco novo, criado a partir de `setup`. */
export async function runSql(setup: string, queries: string[], onReady?: () => void): Promise<SqlRun[]> {
  const r = await sqlite.run<SqlRun[]>({ setup, queries }, 5_000, onReady);
  return r === "timeout" ? queries.map(() => ({ ok: false, error: TIMEOUT_MSG })) : r;
}
