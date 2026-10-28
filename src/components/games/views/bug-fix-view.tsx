"use client";

import { useEffect, useRef, useState } from "react";
import { Bug, Check, Loader2, Play, X } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";
import { runFunction } from "@/lib/challenges/sandbox";
import type { BugPayload, RoundFeedback } from "@/lib/games/engine";

type CaseView = { args: string; expected: string; got: string | null; pass: boolean | null };

const show = (v: unknown) => (v === undefined ? "undefined" : JSON.stringify(v));

/**
 * Caça aos bugs: roda o código de verdade (Web Worker isolado) contra os testes, a pessoa
 * escolhe a linha, corrige e roda de novo. A primeira execução (ver os testes falhando) é grátis.
 */
export function BugFixView({ payload, onAnswer, feedback }: { payload: BugPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const original = payload.code.split("\n");
  const [lines, setLines] = useState(original);
  const [editing, setEditing] = useState<number | null>(null);
  const [cases, setCases] = useState<CaseView[]>(() => payload.cases.map((c, i) => ({ args: c.map(show).join(", "), expected: payload.expected[i]!, got: null, pass: null })));
  const [runs, setRuns] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);
  const left = payload.maxRuns - runs;

  async function execute(code: string[], counts: boolean) {
    setBusy(true);
    setError(null);
    const out = await runFunction("javascript", code.join("\n"), payload.fn, payload.cases);
    setBusy(false);
    let allPass = false;
    if (!out.ok) {
      setError(out.error);
      setCases((cs) => cs.map((c) => ({ ...c, got: null, pass: false })));
    } else {
      const next = cases.map((c, i) => {
        const r = out.results[i];
        const got = !r ? "?" : r.ok ? (r.undef ? "undefined" : show(r.value)) : `erro: ${r.error}`;
        return { ...c, got, pass: got === c.expected };
      });
      setCases(next);
      allPass = next.every((c) => c.pass);
    }
    if (!counts || done.current) return;
    const n = runs + 1;
    setRuns(n);
    if (allPass) {
      done.current = true;
      onAnswer({ passed: true, runs: n });
    } else if (n >= payload.maxRuns) {
      done.current = true;
      onAnswer({ passed: false, runs: n });
    }
  }

  // Primeiro: mostra os testes falhando com o código original (não conta como execução).
  useEffect(() => {
    // Execução inicial ao abrir a fase (dados externos: o Worker).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    execute(original, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fb = feedback?.kind === "bug_hunt" ? feedback : null;
  const passed = cases.filter((c) => c.pass).length;

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <p className="mt-1 text-sm text-muted">Toque na linha suspeita para editar e rode os testes. {fb ? "" : `${left} ${left === 1 ? "execução restante" : "execuções restantes"}.`}</p>

      <ol className="code-surface mt-4 overflow-x-auto rounded-md border border-line bg-[#040a17] py-2 font-mono text-[0.85rem]">
        {lines.map((line, i) => {
          const n = i + 1;
          const changed = line !== original[i];
          const isBug = fb && fb.correctLine === n;
          return (
            <li key={i} className={cx("flex min-h-10 items-center gap-3 px-3", isBug && "bg-ok/10", changed && !fb && "bg-electric/10")}>
              <span aria-hidden className="w-5 shrink-0 text-right text-subtle">
                {n}
              </span>
              {editing === n && !fb ? (
                <input
                  autoFocus
                  aria-label={`Editar linha ${n}`}
                  value={line}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  maxLength={300}
                  onChange={(e) => setLines((ls) => ls.map((l, j) => (j === i ? e.target.value : l)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!busy && left > 0) execute(lines, true);
                    }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  className="min-h-9 flex-1 rounded border border-electric bg-ink px-2 font-mono text-[#e6eeff] focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  disabled={Boolean(fb)}
                  onClick={() => setEditing(n)}
                  aria-label={`Linha ${n}: ${line.trim() || "vazia"}. Editar`}
                  className="min-h-9 flex-1 whitespace-pre text-left text-[#d6e2f5] hover:text-white disabled:cursor-default"
                >
                  {line || " "}
                </button>
              )}
              {isBug && <Bug aria-label="Linha do bug" className="size-4 shrink-0 text-ok" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!fb && (
          <>
            <Button onClick={() => execute(lines, true)} disabled={busy || left <= 0}>
              {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Play aria-hidden className="size-4" />} Rodar testes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                if (done.current) return;
                done.current = true;
                onAnswer({ passed: false, runs });
              }}
            >
              Desistir e ver a correção
            </Button>
          </>
        )}
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {busy ? "rodando…" : `${passed}/${cases.length} testes passando`}
        </span>
      </div>

      {error && <p className="mt-2 rounded border border-bad/40 bg-bad/[0.06] p-2 font-mono text-xs text-[#ffd6d6]">{error}</p>}

      <table className="mt-3 w-full text-left font-mono text-xs">
        <caption className="sr-only">Testes</caption>
        <thead className="text-subtle">
          <tr>
            <th className="py-1 pr-2 font-normal">{payload.fn}(…)</th>
            <th className="py-1 pr-2 font-normal">esperado</th>
            <th className="py-1 font-normal">saiu</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c, i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="max-w-[10rem] break-all py-1.5 pr-2 text-[#cfe0ff]">{c.args}</td>
              <td className="max-w-[8rem] break-all py-1.5 pr-2">{c.expected}</td>
              <td className={cx("break-all py-1.5", c.pass === true && "text-ok", c.pass === false && "text-bad")}>
                <span className="inline-flex items-start gap-1">
                  {c.pass === true && <Check aria-label="passou" className="mt-0.5 size-3.5 shrink-0" />}
                  {c.pass === false && <X aria-label="falhou" className="mt-0.5 size-3.5 shrink-0" />}
                  {c.got ?? "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fb && !fb.correct && (
        <p className="mt-3 text-sm">
          A correção da linha {fb.correctLine}: <code className="font-mono text-[#cfe0ff]">{fb.fix}</code>
        </p>
      )}
    </div>
  );
}
