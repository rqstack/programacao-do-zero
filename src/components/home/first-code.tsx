"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Play, RotateCcw } from "lucide-react";
import { cx } from "@/components/ui/primitives";

gsap.registerPlugin(useGSAP);

type ProgramId = "saudacao" | "conta" | "decisao";

interface Program {
  id: ProgramId;
  label: string;
  hint: string;
}

const PROGRAMS: Program[] = [
  { id: "saudacao", label: "Saudação", hint: "Troque o nome entre aspas e execute." },
  { id: "conta", label: "Conta", hint: "Mude o preço e a quantidade." },
  { id: "decisao", label: "Decisão", hint: "Mude a idade e veja o if escolher um caminho." },
];

const kw = (t: string) => <span className="text-[#ff9ec1]">{t}</span>;
const fn = (t: string) => <span className="text-[#9fc1ff]">{t}</span>;
const str = (t: string) => <span className="text-[#9be39b]">{t}</span>;
const num = (t: string) => <span className="text-[#f5b84b]">{t}</span>;
const dim = (t: string) => <span className="text-subtle">{t}</span>;

function InlineInput({
  value,
  onChange,
  label,
  width,
  numeric,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  width: string;
  numeric?: boolean;
}) {
  return (
    <input
      aria-label={label}
      value={value}
      inputMode={numeric ? "numeric" : "text"}
      maxLength={numeric ? 4 : 24}
      onChange={(e) => onChange(numeric ? e.target.value.replace(/[^\d]/g, "") : e.target.value)}
      className={cx(
        "mx-0.5 rounded border border-electric/60 bg-electric/10 px-1 font-mono text-[0.95em] outline-none focus:border-electric-hi focus:ring-2 focus:ring-electric/40",
        numeric ? "text-[#f5b84b]" : "text-[#9be39b]",
      )}
      style={{ width }}
    />
  );
}

function Line({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="code-line flex min-h-7 items-center whitespace-pre" style={{ animationDelay: `${n * 70}ms` }}>
      <span aria-hidden className="mr-4 w-4 shrink-0 select-none text-right text-subtle/70">
        {n}
      </span>
      <span>{children}</span>
    </div>
  );
}

/** Executa o programa escolhido de forma determinística — nenhum código é avaliado com eval. */
function run(id: ProgramId, v: { nome: string; preco: string; qtd: string; idade: string }): string[] {
  if (id === "saudacao") {
    const nome = v.nome.trim() || "você";
    return [`Olá, ${nome}! Este é o seu primeiro código.`];
  }
  if (id === "conta") {
    const preco = Number(v.preco || 0);
    const qtd = Number(v.qtd || 0);
    return [String(preco * qtd)];
  }
  const idade = Number(v.idade || 0);
  return [idade >= 18 ? "Pode tirar a carteira de motorista." : `Faltam ${18 - idade} anos.`];
}

export function FirstCode() {
  const [program, setProgram] = useState<ProgramId>("saudacao");
  const [values, setValues] = useState({ nome: "Ana", preco: "12", qtd: "3", idade: "16" });
  const [output, setOutput] = useState<string[] | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".reveal-shell", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".reveal-shell", { autoAlpha: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const set = (k: keyof typeof values) => (v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setOutput(null);
  };
  const current = PROGRAMS.find((p) => p.id === program)!;

  return (
    <div ref={root}>
      <div className="reveal reveal-shell overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-[#040a17] shadow-[0_30px_80px_-30px_rgb(47_107_255/0.45)]">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div role="tablist" aria-label="Programas de exemplo" className="flex gap-1">
            {PROGRAMS.map((p) => (
              <button
                key={p.id}
                role="tab"
                type="button"
                aria-selected={program === p.id}
                onClick={() => {
                  setProgram(p.id);
                  setOutput(null);
                }}
                className={cx(
                  "min-h-9 rounded-md px-3 text-sm transition-colors",
                  program === p.id ? "bg-panel-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="hidden font-mono text-xs text-subtle sm:inline">primeiro-codigo.js</span>
        </div>

        <div role="tabpanel" aria-label={current.label} className="overflow-x-auto px-3 py-4 font-mono text-[0.9rem] leading-7 text-[#e3ebf7] sm:px-4">
          {program === "saudacao" && (
            <>
              <Line n={1}>
                {kw("const")} nome = {str('"')}
                <InlineInput label="Nome" value={values.nome} onChange={set("nome")} width={`${Math.max(3, values.nome.length + 1)}ch`} />
                {str('"')};
              </Line>
              <Line n={2}>
                {fn("console")}.{fn("log")}({str("`Olá, ")}
                {dim("${")}nome{dim("}")}
                {str("! Este é o seu primeiro código.`")});
              </Line>
            </>
          )}
          {program === "conta" && (
            <>
              <Line n={1}>
                {kw("const")} preco = <InlineInput label="Preço" numeric value={values.preco} onChange={set("preco")} width={`${Math.max(2, values.preco.length + 1)}ch`} />;
              </Line>
              <Line n={2}>
                {kw("const")} quantidade = <InlineInput label="Quantidade" numeric value={values.qtd} onChange={set("qtd")} width={`${Math.max(2, values.qtd.length + 1)}ch`} />;
              </Line>
              <Line n={3}>
                {fn("console")}.{fn("log")}(preco * quantidade);
              </Line>
            </>
          )}
          {program === "decisao" && (
            <>
              <Line n={1}>
                {kw("const")} idade = <InlineInput label="Idade" numeric value={values.idade} onChange={set("idade")} width={`${Math.max(2, values.idade.length + 1)}ch`} />;
              </Line>
              <Line n={2}>
                {kw("if")} (idade {">="} {num("18")}) {"{"}
              </Line>
              <Line n={3}>
                {"  "}
                {fn("console")}.{fn("log")}({str('"Pode tirar a carteira de motorista."')});
              </Line>
              <Line n={4}>
                {"}"} {kw("else")} {"{"}
              </Line>
              <Line n={5}>
                {"  "}
                {fn("console")}.{fn("log")}({str("`Faltam ")}
                {dim("${")}
                {num("18")} - idade{dim("}")}
                {str(" anos.`")});
              </Line>
              <Line n={6}>{"}"}</Line>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOutput(run(program, values))}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-electric px-4 text-sm font-semibold text-white hover:bg-electric-hi"
          >
            <Play aria-hidden className="size-4" /> Executar
          </button>
          {output && (
            <button
              type="button"
              onClick={() => setOutput(null)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:text-fg"
            >
              <RotateCcw aria-hidden className="size-4" /> Limpar
            </button>
          )}
          <span className="text-xs text-subtle">{current.hint}</span>
        </div>

        <div className="border-t border-line bg-black/40 px-3 py-3 font-mono text-sm sm:px-4">
          <p className="mb-1 text-xs text-subtle">Console</p>
          <output aria-live="polite" className="block min-h-6 text-[#cfe0ff]">
            {output ? output.map((l, i) => <span key={i} className="block">{"> "}{l}</span>) : <span className="text-subtle">Clique em Executar para ver a saída.</span>}
          </output>
        </div>
      </div>
    </div>
  );
}
