"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, Lightbulb, Play, RotateCcw, Send, Shuffle, Sparkles, X } from "lucide-react";
import { CHALLENGE_LABEL, codeChallenges, sqlChallenges, sqlDataset, SQL_SCHEMA, type ChallengeDifficulty, type CodeChallenge, type SqlChallenge } from "@content/challenges";
import { InlineMd } from "@/components/content/inline-md";
import { Button, cx, Tag } from "@/components/ui/primitives";
import { XP_RULES } from "@/lib/gamification/rules";
import { buildCases, fnName, formatArgs, formatValue, LANG_LABEL, makeRng, pickChallenge, randomSeed, sameTable, sameValue, solutionCode, starterCode, type ChallengeLang, type SqlTable } from "@/lib/challenges/core";
import { runFunction, runSql, type CaseResult } from "@/lib/challenges/sandbox";
import { isRemote, runRemote, supportsRemote } from "@/lib/challenges/remote";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { CodeEditor } from "./code-editor";

const LANGS: Array<{ id: ChallengeLang; badge: string; color: string; note: string }> = [
  { id: "javascript", badge: "JS", color: "bg-[#f7df1e] text-[#1a1a1a]", note: "Roda direto no navegador." },
  { id: "typescript", badge: "TS", color: "bg-[#3178c6] text-white", note: "Os tipos são removidos e o código roda como JS." },
  { id: "python", badge: "PY", color: "bg-[#ffd43b] text-[#1f3b57]", note: "Python de verdade (Pyodide). Primeira vez baixa ~10 MB." },
  { id: "sql", badge: "SQL", color: "bg-[#00a1e0] text-white", note: "SQLite no navegador, com dados gerados na hora." },
  { id: "java", badge: "JV", color: "bg-[#e76f00] text-white", note: "JDK 17, compilado no servidor de execução." },
  { id: "c", badge: "C", color: "bg-[#5c6bc0] text-white", note: "GCC 14, compilado no servidor de execução." },
  { id: "cpp", badge: "C++", color: "bg-[#00599c] text-white", note: "GCC 14, compilado no servidor de execução." },
  { id: "csharp", badge: "C#", color: "bg-[#68217a] text-white", note: "Mono 6.6, compilado no servidor de execução." },
  { id: "go", badge: "GO", color: "bg-[#00add8] text-[#0b2733]", note: "Go 1.18, compilado no servidor de execução." },
  { id: "rust", badge: "RS", color: "bg-[#dea584] text-[#1a1a1a]", note: "Rust 1.85, compilado no servidor de execução." },
  { id: "php", badge: "PHP", color: "bg-[#777bb4] text-white", note: "PHP 8.3, executado no servidor de execução." },
];
const DIFFS: ChallengeDifficulty[] = ["facil", "medio", "dificil"];
const PREF_KEY = "pdz-desafio-pref";
const draftKey = (id: string, lang: ChallengeLang) => `pdz-desafio-codigo:${id}:${lang}`;

function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* sem armazenamento */
  }
}

type Picked = { kind: "code"; ch: CodeChallenge } | { kind: "sql"; ch: SqlChallenge };

export function ChallengeArena() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [lang, setLang] = useState<ChallengeLang>("javascript");
  const [diff, setDiff] = useState<ChallengeDifficulty>("facil");
  const [picked, setPicked] = useState<Picked | null>(null);

  useEffect(() => {
    const raw = readStore(PREF_KEY);
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as { lang?: ChallengeLang; diff?: ChallengeDifficulty };
      // Restaura a última escolha deste navegador.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (p.lang && p.lang in LANG_LABEL) setLang(p.lang);
      if (p.diff && DIFFS.includes(p.diff)) setDiff(p.diff);
    } catch {
      /* preferência inválida */
    }
  }, []);

  const solvedIn = (id: string, l: ChallengeLang) => Boolean(progress.challenges[id]?.langs.includes(l));
  const listFor = (l: ChallengeLang, d: ChallengeDifficulty): ReadonlyArray<CodeChallenge | SqlChallenge> =>
    l === "sql" ? sqlChallenges.filter((c) => c.difficulty === d) : codeChallenges.filter((c) => c.difficulty === d && (!isRemote(l) || supportsRemote(c)));

  function generate(exclude?: string) {
    writeStore(PREF_KEY, JSON.stringify({ lang, diff }));
    const list = listFor(lang, diff);
    const done = new Set(list.filter((c) => solvedIn(c.id, lang)).map((c) => c.id));
    const ch = pickChallenge(list, done, exclude);
    if (!ch) return;
    setPicked(lang === "sql" ? { kind: "sql", ch: ch as SqlChallenge } : { kind: "code", ch: ch as CodeChallenge });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (picked) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
            <ArrowLeft aria-hidden className="size-4" /> Trocar linguagem ou dificuldade
          </Button>
          <Button variant="secondary" size="sm" onClick={() => generate(picked.ch.id)}>
            <Shuffle aria-hidden className="size-4" /> Outro problema
          </Button>
        </div>
        {picked.kind === "code" ? (
          <CodeArena key={`${picked.ch.id}:${lang}`} ch={picked.ch} lang={lang as Exclude<ChallengeLang, "sql">} />
        ) : (
          <SqlArena key={picked.ch.id} ch={picked.ch} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="escolha-linguagem">
        <h2 id="escolha-linguagem" className="text-lg font-semibold">
          1. Escolha a linguagem
        </h2>
        <div role="radiogroup" aria-labelledby="escolha-linguagem" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LANGS.map((l) => {
            const all = l.id === "sql" ? sqlChallenges : isRemote(l.id) ? codeChallenges.filter(supportsRemote) : codeChallenges;
            const n = hydrated ? all.filter((c) => solvedIn(c.id, l.id)).length : 0;
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setLang(l.id)}
                className={cx(
                  "flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors",
                  active ? "border-electric bg-electric/10" : "border-line bg-navy/60 hover:border-line-strong",
                )}
              >
                <span className={cx("grid size-11 place-items-center rounded-[10px] font-mono text-sm font-black", l.color)}>{l.badge}</span>
                <span className="font-semibold">{LANG_LABEL[l.id]}</span>
                <span className="text-xs text-muted">{l.note}</span>
                <span className="font-mono text-xs text-subtle">
                  {n}/{all.length} resolvidos
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="escolha-dificuldade">
        <h2 id="escolha-dificuldade" className="text-lg font-semibold">
          2. Escolha a dificuldade
        </h2>
        <div role="radiogroup" aria-labelledby="escolha-dificuldade" className="mt-4 grid gap-3 sm:grid-cols-3">
          {DIFFS.map((d) => {
            const list = listFor(lang, d);
            const n = hydrated ? list.filter((c) => solvedIn(c.id, lang)).length : 0;
            const active = diff === d;
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDiff(d)}
                className={cx(
                  "rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors",
                  active ? "border-amber bg-amber/10" : "border-line bg-navy/60 hover:border-line-strong",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{CHALLENGE_LABEL[d]}</span>
                  <span className="font-mono text-xs text-amber">+{XP_RULES.challenge[d]} XP</span>
                </span>
                <span className="mt-2 block text-xs text-muted">
                  {d === "facil" ? "Laços, condicionais e textos." : d === "medio" ? "Listas, contagens e organização." : "Pilhas, algoritmos clássicos e consultas complexas."}
                </span>
                <span className="mt-2 block font-mono text-xs text-subtle">
                  {n}/{list.length} resolvidos em {LANG_LABEL[lang]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={() => generate()}>
          <Sparkles aria-hidden className="size-5" /> Gerar problema
        </Button>
        <p className="text-sm text-muted">Sorteia um problema que você ainda não resolveu nessa linguagem. Os testes mudam a cada envio.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Statement({ title, difficulty, topics, statement, solved, langsSolved, children }: { title: string; difficulty: ChallengeDifficulty; topics: string[]; statement: string; solved: boolean; langsSolved: ChallengeLang[]; children?: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="amber">{CHALLENGE_LABEL[difficulty]}</Tag>
        {topics.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        {solved && (
          <Tag tone="ok">
            <Check aria-hidden className="size-3" /> resolvido em {langsSolved.map((l) => LANG_LABEL[l]).join(", ")}
          </Tag>
        )}
      </div>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-muted">
        {statement.split("\n\n").map((p, i) => (
          <p key={i}>
            <InlineMd text={p} />
          </p>
        ))}
      </div>
      {children}
    </div>
  );
}

function Hints({ hints, onReveal, revealed, solution, solved }: { hints: string[]; onReveal: () => void; revealed: boolean; solution: string; solved: boolean }) {
  const [shown, setShown] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="mt-6 space-y-3">
      {hints.slice(0, shown).map((h, i) => (
        <p key={i} className="flex gap-2 rounded-[var(--radius-md)] border border-amber/30 bg-amber/[0.06] p-3 text-sm">
          <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
          <span>
            <InlineMd text={h} />
          </span>
        </p>
      ))}
      <div className="flex flex-wrap gap-2">
        {shown < hints.length && (
          <Button variant="secondary" size="sm" onClick={() => setShown((n) => n + 1)}>
            <Lightbulb aria-hidden className="size-4" /> {shown === 0 ? "Quero uma dica" : "Outra dica"}
          </Button>
        )}
        {!showSolution && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (solved || revealed) setShowSolution(true);
              else setConfirm(true);
            }}
          >
            <Eye aria-hidden className="size-4" /> Ver solução
          </Button>
        )}
      </div>
      {confirm && !showSolution && (
        <div role="alertdialog" aria-label="Confirmar" className="rounded-[var(--radius-md)] border border-warn/40 bg-warn/[0.08] p-3 text-sm">
          <p>Se você ver a solução antes de resolver, este desafio não dá mais XP. Tem certeza?</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onReveal();
                setShowSolution(true);
                setConfirm(false);
              }}
            >
              Ver mesmo assim
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
              Vou tentar mais
            </Button>
          </div>
        </div>
      )}
      {showSolution && (
        <div>
          <p className="text-xs font-semibold text-subtle">Uma solução possível (existem outras):</p>
          <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-[#060d1c] p-3 font-mono text-[13px] leading-6 text-[#dbe7ff]">{solution}</pre>
        </div>
      )}
    </div>
  );
}

function Console({ logs }: { logs: string[] }) {
  if (logs.length === 0) return null;
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-black/40 p-3">
      <p className="text-xs font-semibold text-subtle">Saída do seu código (console / print)</p>
      <pre className="mt-1 max-h-40 overflow-auto font-mono text-xs leading-5 text-muted">{logs.join("\n")}</pre>
    </div>
  );
}

function Win({ xp }: { xp: number }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-[var(--radius-lg)] border-2 border-ok/60 bg-ok/10 p-4">
      <span className="grid size-10 place-items-center rounded-full bg-ok text-[#04130d]">
        <Check aria-hidden className="size-6" strokeWidth={3} />
      </span>
      <div>
        <p className="font-bold text-ok">Todos os testes passaram!</p>
        <p className="text-sm text-muted">{xp > 0 ? `+${xp} XP. ` : ""}Tente outro problema ou resolva este em outra linguagem.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface Row {
  args: unknown[];
  expected: unknown;
  got: CaseResult | null;
  pass: boolean;
  hidden: boolean;
}

function CodeArena({ ch, lang }: { ch: CodeChallenge; lang: Exclude<ChallengeLang, "sql"> }) {
  const progress = useProgress();
  const record = progress.challenges[ch.id];
  const [code, setCode] = useState(() => starterCode(ch, lang));
  const [busy, setBusy] = useState<null | "loading" | "running" | "remote">(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mode, setMode] = useState<"examples" | "submit">("examples");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [win, setWin] = useState<number | null>(null);

  useEffect(() => {
    const saved = readStore(draftKey(ch.id, lang));
    // Rascunho deste desafio salvo neste navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setCode(saved);
  }, [ch.id, lang]);

  function change(v: string) {
    setCode(v);
    writeStore(draftKey(ch.id, lang), v);
  }

  async function run(which: "examples" | "submit") {
    setBusy(lang === "python" ? "loading" : isRemote(lang) ? "remote" : "running");
    setError(null);
    setWin(null);
    setMode(which);
    const cases = buildCases(ch, randomSeed(), which);
    const args = cases.map((c) => c.args);
    const out = isRemote(lang) ? await runRemote(ch, lang, code, args) : await runFunction(lang, code, fnName(ch, lang), args, () => setBusy("running"));
    setBusy(null);
    setLogs(out.logs);
    if (!out.ok) {
      setRows(null);
      setError(out.error);
      return;
    }
    const r = cases.map((c, i) => {
      const got = out.results[i] ?? null;
      return { ...c, got, pass: Boolean(got && got.ok && !(got.undef && c.expected !== null) && sameValue(got.value, c.expected)) };
    });
    setRows(r);
    if (which === "submit" && r.every((x) => x.pass)) {
      const reward = dispatchProgress({ type: "challenge/solve", id: ch.id, title: ch.title, lang, difficulty: ch.difficulty });
      setWin(reward.xp);
    }
  }

  const passed = rows?.filter((r) => r.pass).length ?? 0;
  const firstHiddenFail = rows?.find((r) => r.hidden && !r.pass);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div>
        <Statement title={ch.title} difficulty={ch.difficulty} topics={ch.topics} statement={ch.statement} solved={Boolean(record?.langs.length)} langsSolved={record?.langs ?? []}>
          <h3 className="mt-6 text-sm font-semibold text-subtle">Exemplos</h3>
          <ul className="mt-2 space-y-2">
            {ch.examples.map((args, i) => (
              <li key={i} className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-[#060d1c] px-3 py-2 font-mono text-[13px]">
                <span className="text-[#9cc2ff]">{fnName(ch, lang)}</span>({formatArgs(args, lang)}) <span className="text-subtle">→</span>{" "}
                <span className="text-amber">{formatValue(buildCases(ch, 0, "examples")[i]!.expected, lang)}</span>
              </li>
            ))}
          </ul>
        </Statement>
        <Hints hints={ch.hints} solved={Boolean(record?.langs.length)} revealed={record?.status === "revealed"} onReveal={() => dispatchProgress({ type: "challenge/reveal", id: ch.id })} solution={solutionCode(ch, lang)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Sua solução em {LANG_LABEL[lang]}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              change(starterCode(ch, lang));
              setRows(null);
              setError(null);
            }}
          >
            <RotateCcw aria-hidden className="size-4" /> Recomeçar
          </Button>
        </div>
        {isRemote(lang) && (
          <p className="text-xs text-muted">
            O programa completo já vem pronto: escreva só o corpo da função <code className="font-mono text-[#9cc2ff]">{ch.fn}</code>. Ele roda no Judge0, um servidor de execução gratuito e isolado; a saída padrão é usada para conferir as respostas, então para depurar escreva no erro padrão (stderr).
          </p>
        )}
        <CodeEditor value={code} onChange={change} indent={lang === "javascript" || lang === "typescript" ? 2 : 4} label={`Código em ${LANG_LABEL[lang]}`} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => run("examples")} disabled={busy !== null}>
            <Play aria-hidden className="size-4" /> Testar exemplos
          </Button>
          <Button onClick={() => run("submit")} disabled={busy !== null}>
            <Send aria-hidden className="size-4" /> Enviar solução
          </Button>
        </div>
        <p aria-live="polite" className="text-sm text-muted">
          {busy === "loading" ? "Carregando o Python no navegador (só demora na primeira vez)…" : busy === "remote" ? "Compilando e rodando no servidor de execução (alguns segundos)…" : busy === "running" ? "Rodando os testes…" : ""}
        </p>

        {win !== null && <Win xp={win} />}
        {error && (
          <div role="alert" className="rounded-[var(--radius-md)] border border-bad/50 bg-bad/[0.08] p-3">
            <p className="text-sm font-semibold text-bad">Seu código deu erro</p>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-[#ffd6d6]">{error}</pre>
          </div>
        )}
        {rows && (
          <div aria-live="polite">
            <p className={cx("text-sm font-semibold", passed === rows.length ? "text-ok" : "text-bad")}>
              {passed}/{rows.length} testes passaram{mode === "submit" ? " (exemplos + casos gerados agora)" : ""}
            </p>
            <ul className="mt-2 space-y-2">
              {rows
                .filter((r) => !r.hidden)
                .map((r, i) => (
                  <CaseRow key={i} row={r} lang={lang} fn={fnName(ch, lang)} />
                ))}
            </ul>
            {mode === "submit" && firstHiddenFail && (
              <>
                <p className="mt-3 text-xs text-subtle">Primeiro caso gerado que falhou:</p>
                <ul className="mt-1">
                  <CaseRow row={firstHiddenFail} lang={lang} fn={fnName(ch, lang)} />
                </ul>
              </>
            )}
            {mode === "examples" && passed === rows.length && <p className="mt-3 text-sm text-muted">
                <InlineMd text="Exemplos ok! Agora clique em **Enviar solução** para rodar os casos gerados." />
              </p>}
          </div>
        )}
        <Console logs={logs} />
      </div>
    </div>
  );
}

function CaseRow({ row, lang, fn }: { row: Row; lang: ChallengeLang; fn: string }) {
  const got = row.got;
  return (
    <li className={cx("rounded-[var(--radius-md)] border px-3 py-2 font-mono text-xs", row.pass ? "border-ok/40 bg-ok/[0.06]" : "border-bad/40 bg-bad/[0.06]")}>
      <p className="flex items-start gap-2 overflow-x-auto">
        {row.pass ? <Check aria-label="passou" className="size-4 shrink-0 text-ok" /> : <X aria-label="falhou" className="size-4 shrink-0 text-bad" />}
        <span>
          {fn}({formatArgs(row.args, lang)})
        </span>
      </p>
      {!row.pass && (
        <p className="mt-1 pl-6 text-muted">
          esperado <span className="text-amber">{formatValue(row.expected, lang)}</span> · recebido{" "}
          <span className="text-[#ffb4b4]">{!got ? "nada" : !got.ok ? got.error : got.undef ? (lang === "python" ? "None (faltou o return?)" : "undefined (faltou o return?)") : formatValue(got.value, lang)}</span>
        </p>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------

const TABLES = SQL_SCHEMA.split("\n").map((line) => {
  const m = /create table (\w+) \((.*)\);/.exec(line)!;
  return { name: m[1]!, cols: m[2]!.split(", ").map((c) => c.split(" ").slice(0, 2).join(" ")) };
});

function ResultTable({ table, caption }: { table: SqlTable; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
      <table className="w-full text-left font-mono text-xs">
        <caption className="border-b border-line px-3 py-2 text-left font-sans text-xs font-semibold text-subtle">
          {caption} · {table.rows.length} linha(s)
        </caption>
        <thead className="bg-panel-2 text-muted">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="px-3 py-1.5 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.slice(0, 30).map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((v, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-1.5">
                  {v === null ? <span className="text-subtle">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SqlArena({ ch }: { ch: SqlChallenge }) {
  const progress = useProgress();
  const record = progress.challenges[ch.id];
  const [code, setCode] = useState("-- escreva sua consulta aqui\nselect ");
  const [busy, setBusy] = useState<null | "loading" | "running">(null);
  const [mine, setMine] = useState<SqlTable | null>(null);
  const [want, setWant] = useState<SqlTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<null | { ok: boolean; passed: number; total: number }>(null);
  const [win, setWin] = useState<number | null>(null);
  const [seed, setSeed] = useState(() => randomSeed());
  const dataset = useMemo(() => sqlDataset(makeRng(seed)), [seed]);

  useEffect(() => {
    const saved = readStore(draftKey(ch.id, "sql"));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setCode(saved);
  }, [ch.id]);

  function change(v: string) {
    setCode(v);
    writeStore(draftKey(ch.id, "sql"), v);
  }

  async function execute() {
    setBusy("loading");
    setError(null);
    setVerdict(null);
    setWin(null);
    const [a, b] = await runSql(dataset, [code, ch.solution], () => setBusy("running"));
    setBusy(null);
    if (b && b.ok) setWant({ columns: b.columns, rows: b.rows });
    if (!a || !a.ok) {
      setMine(null);
      setError(a && !a.ok ? a.error : "Sem resultado.");
      return;
    }
    setMine({ columns: a.columns, rows: a.rows });
    if (b && b.ok) setVerdict({ ok: sameTable(a, b, ch.ordered), passed: sameTable(a, b, ch.ordered) ? 1 : 0, total: 1 });
  }

  async function submit() {
    setBusy("loading");
    setError(null);
    setWin(null);
    let passed = 0;
    const total = 3;
    for (let i = 0; i < total; i++) {
      const data = sqlDataset(makeRng(randomSeed()));
      const [a, b] = await runSql(data, [code, ch.solution], () => setBusy("running"));
      if (!a || !a.ok) {
        setBusy(null);
        setError(a && !a.ok ? a.error : "Sem resultado.");
        return;
      }
      if (b && b.ok && sameTable(a, b, ch.ordered)) passed++;
    }
    setBusy(null);
    setVerdict({ ok: passed === total, passed, total });
    if (passed === total) setWin(dispatchProgress({ type: "challenge/solve", id: ch.id, title: ch.title, lang: "sql", difficulty: ch.difficulty }).xp);
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div>
        <Statement title={ch.title} difficulty={ch.difficulty} topics={ch.topics} statement={ch.statement} solved={Boolean(record?.langs.length)} langsSolved={record?.langs ?? []}>
          {ch.ordered && <p className="mt-3 text-xs text-subtle">A ordem das linhas importa neste desafio.</p>}
          <h3 className="mt-6 text-sm font-semibold text-subtle">Tabelas</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {TABLES.map((t) => (
              <li key={t.name} className="rounded-[var(--radius-md)] border border-line bg-[#060d1c] p-3 font-mono text-xs">
                <p className="font-semibold text-[#9cc2ff]">{t.name}</p>
                <ul className="mt-1 space-y-0.5 text-muted">
                  {t.cols.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-subtle">Os dados são inventados e sorteados de novo a cada envio. Para espiar, rode `select * from clientes;`.</p>
        </Statement>
        <Hints hints={ch.hints} solved={Boolean(record?.langs.length)} revealed={record?.status === "revealed"} onReveal={() => dispatchProgress({ type: "challenge/reveal", id: ch.id })} solution={ch.solution} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Sua consulta SQL</p>
          <Button variant="ghost" size="sm" onClick={() => setSeed(randomSeed())}>
            <Shuffle aria-hidden className="size-4" /> Sortear outros dados
          </Button>
        </div>
        <CodeEditor value={code} onChange={change} indent={2} label="Consulta SQL" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={execute} disabled={busy !== null}>
            <Play aria-hidden className="size-4" /> Executar
          </Button>
          <Button onClick={submit} disabled={busy !== null}>
            <Send aria-hidden className="size-4" /> Enviar solução
          </Button>
        </div>
        <p aria-live="polite" className="text-sm text-muted">
          {busy === "loading" ? "Preparando o banco…" : busy === "running" ? "Rodando a consulta…" : ""}
        </p>
        {win !== null && <Win xp={win} />}
        {verdict && !verdict.ok && (
          <p role="status" className="text-sm font-semibold text-bad">
            {verdict.total > 1 ? `Passou em ${verdict.passed} de ${verdict.total} bancos sorteados.` : "O resultado ainda não bate com o esperado."} Compare as tabelas abaixo.
          </p>
        )}
        {verdict?.ok && verdict.total === 1 && <p className="text-sm font-semibold text-ok">Bateu com o esperado nestes dados! Agora envie para testar em outros bancos.</p>}
        {error && (
          <div role="alert" className="rounded-[var(--radius-md)] border border-bad/50 bg-bad/[0.08] p-3">
            <p className="text-sm font-semibold text-bad">Erro na consulta</p>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-[#ffd6d6]">{error}</pre>
          </div>
        )}
        {mine && <ResultTable table={mine} caption="Seu resultado" />}
        {want && mine && <ResultTable table={want} caption="Resultado esperado" />}
      </div>
    </div>
  );
}
