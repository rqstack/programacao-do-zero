"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";
import type { CssPayload, RoundFeedback } from "@/lib/games/engine";

interface Node {
  el: Element;
  depth: number;
}

function describe(el: Element): string {
  const attrs = [...el.attributes]
    .filter((a) => a.name !== "data-alvo")
    .map((a) => (a.value === "" ? a.name : `${a.name}="${a.value}"`))
    .join(" ");
  return `<${el.tagName.toLowerCase()}${attrs ? ` ${attrs}` : ""}>`;
}

function ownText(el: Element): string {
  return [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent ?? "")
    .join("")
    .trim();
}

/** Avalia o seletor num documento isolado criado pelo DOMParser (nada é executado). */
export function CssLiveView({ payload, onAnswer, feedback }: { payload: CssPayload; onAnswer: (v: unknown) => RoundFeedback | null; feedback: RoundFeedback | null }) {
  const [selector, setSelector] = useState("");

  const { nodes, targets } = useMemo(() => {
    const doc = new DOMParser().parseFromString(`<body>${payload.html}</body>`, "text/html");
    const list: Node[] = [];
    const walk = (el: Element, depth: number) => {
      list.push({ el, depth });
      for (const child of el.children) walk(child, depth + 1);
    };
    for (const child of doc.body.children) walk(child, 0);
    return { nodes: list, targets: new Set(list.filter((n) => n.el.hasAttribute("data-alvo")).map((n) => n.el)) };
  }, [payload.html]);

  const evaluation = useMemo(() => {
    const s = selector.trim();
    if (!s) return { matched: new Set<Element>(), error: null as string | null };
    if (/data-alvo/i.test(s)) return { matched: new Set<Element>(), error: "Sem atalhos: use as tags, classes, ids e atributos do HTML." };
    try {
      const root = nodes[0]?.el.ownerDocument.body;
      const found = root ? [...root.querySelectorAll(s)] : [];
      return { matched: new Set(found), error: null };
    } catch {
      return { matched: new Set<Element>(), error: "Seletor inválido. Confira a sintaxe." };
    }
  }, [selector, nodes]);

  const hit = evaluation.error === null && evaluation.matched.size === targets.size && [...targets].every((t) => evaluation.matched.has(t));
  const done = feedback !== null;

  return (
    <div>
      <p className="text-lg font-semibold">{payload.prompt}</p>
      <div className="code-surface mt-4 rounded-[var(--radius-md)] border border-line bg-[#040a17] p-3 font-mono text-[0.85rem]">
        {nodes.map(({ el, depth }, i) => {
          const isTarget = targets.has(el);
          const isMatched = evaluation.matched.has(el);
          return (
            <div
              key={i}
              className={cx(
                "my-0.5 flex items-center gap-2 rounded px-2 py-1 transition-colors",
                isMatched && isTarget && "bg-ok/20 ring-1 ring-ok/60",
                isMatched && !isTarget && "bg-bad/20 ring-1 ring-bad/60",
                !isMatched && isTarget && "bg-amber/10",
              )}
              style={{ marginLeft: `${depth * 1.25}rem` }}
            >
              <span className="text-[#9fc1ff]">{describe(el)}</span>
              {ownText(el) && <span className="truncate text-[#d6e2f5]">{ownText(el)}</span>}
              {isTarget && <Star aria-label="alvo" className="ml-auto size-4 shrink-0 fill-amber text-amber" />}
            </div>
          );
        })}
      </div>

      <label htmlFor="seletor-css" className="mt-4 block text-sm font-medium">
        Seu seletor
      </label>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          id="seletor-css"
          value={selector}
          disabled={done}
          onChange={(e) => setSelector(e.target.value.slice(0, 120))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && selector.trim() && !evaluation.error) onAnswer({ selector: selector.trim(), hit });
          }}
          placeholder="ex.: ul li"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-h-11 flex-1 rounded-md border border-line-strong bg-ink px-3 font-mono focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
        />
        {!done && (
          <Button onClick={() => onAnswer({ selector: selector.trim(), hit })} disabled={!selector.trim() || evaluation.error !== null}>
            Confirmar
          </Button>
        )}
      </div>
      <p className={cx("mt-2 text-sm", evaluation.error ? "text-bad" : hit ? "text-ok" : "text-muted")} aria-live="polite">
        {evaluation.error ??
          (selector.trim()
            ? `Seleciona ${evaluation.matched.size} elemento${evaluation.matched.size === 1 ? "" : "s"}${hit ? " — exatamente os alvos!" : ` (alvos: ${targets.size})`}`
            : "Os elementos selecionados acendem enquanto você digita.")}
      </p>
      {done && feedback?.kind === "css_live" && !feedback.correct && (
        <p className="mt-2 text-sm text-muted">
          Uma resposta possível: <code className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[#cfe0ff]">{feedback.reference}</code>
        </p>
      )}
    </div>
  );
}
