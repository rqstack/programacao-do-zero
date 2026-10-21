"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trash2 } from "lucide-react";
import { Button, cx } from "@/components/ui/primitives";

type Tab = "html" | "css" | "js";
interface Code {
  html: string;
  css: string;
  js: string;
}
interface LogLine {
  level: "log" | "warn" | "error" | "info";
  text: string;
}

export const LAB_EXAMPLES: Array<{ id: string; label: string; code: Code }> = [
  {
    id: "ola",
    label: "Olá, mundo",
    code: {
      html: '<h1>Olá, mundo!</h1>\n<p id="msg">Edite o código e clique em Executar.</p>',
      css: "body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n  color: #1f2937;\n}\nh1 {\n  color: #1d4ed8;\n}",
      js: 'const nome = "estudante";\ndocument.querySelector("#msg").textContent = `Bem-vindo, ${nome}!`;\nconsole.log("Página carregada");',
    },
  },
  {
    id: "contador",
    label: "Contador com botão",
    code: {
      html: '<p>Cliques: <strong id="valor">0</strong></p>\n<button id="mais">+1</button>\n<button id="zerar">Zerar</button>',
      css: "body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n}\nbutton {\n  font-size: 1rem;\n  padding: 0.5rem 1rem;\n  margin-right: 0.5rem;\n}",
      js: 'let cliques = 0;\nconst valor = document.querySelector("#valor");\n\nfunction atualizar() {\n  valor.textContent = cliques;\n  console.log("cliques:", cliques);\n}\n\ndocument.querySelector("#mais").addEventListener("click", () => {\n  cliques++;\n  atualizar();\n});\n\ndocument.querySelector("#zerar").addEventListener("click", () => {\n  cliques = 0;\n  atualizar();\n});',
    },
  },
  {
    id: "tarefas",
    label: "Lista de tarefas",
    code: {
      html: '<form id="form">\n  <label for="texto">Nova tarefa</label>\n  <input id="texto" required>\n  <button>Adicionar</button>\n</form>\n<ul id="lista"></ul>\n<p id="vazio">Nenhuma tarefa ainda.</p>',
      css: "body {\n  font-family: system-ui, sans-serif;\n  padding: 1.5rem;\n}\nli {\n  margin: 0.25rem 0;\n}\n.feita {\n  text-decoration: line-through;\n  color: #6b7280;\n}",
      js: 'const tarefas = [];\nconst lista = document.querySelector("#lista");\nconst vazio = document.querySelector("#vazio");\n\nfunction renderizar() {\n  lista.replaceChildren();\n  tarefas.forEach((t, i) => {\n    const li = document.createElement("li");\n    li.textContent = t.texto;\n    if (t.feita) li.classList.add("feita");\n    li.addEventListener("click", () => {\n      tarefas[i].feita = !tarefas[i].feita;\n      renderizar();\n    });\n    lista.append(li);\n  });\n  vazio.hidden = tarefas.length > 0;\n}\n\ndocument.querySelector("#form").addEventListener("submit", (e) => {\n  e.preventDefault();\n  const campo = document.querySelector("#texto");\n  tarefas.push({ texto: campo.value.trim(), feita: false });\n  campo.value = "";\n  renderizar();\n});\n\nrenderizar();',
    },
  },
  {
    id: "logica",
    label: "Só JavaScript",
    code: {
      html: "<p>Abra o console abaixo para ver a saída.</p>",
      css: "body { font-family: system-ui, sans-serif; padding: 1.5rem; }",
      js: 'const notas = [8, 6.5, 9, 7];\nconst media = notas.reduce((s, n) => s + n, 0) / notas.length;\n\nconsole.log("Média:", media);\nconsole.log(media >= 7 ? "Aprovado" : "Reprovado");\n\nfor (let i = 1; i <= 3; i++) {\n  console.log(`3 x ${i} = ${3 * i}`);\n}',
    },
  },
];

const STORAGE_KEY = "pdz-laboratorio-v1";

/** Script injetado no iframe: repassa console e erros para a página, via postMessage. */
const BRIDGE = `<script>
(function () {
  function fmt(v) {
    if (typeof v === "string") return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      parent.postMessage({ __lab: true, level: level, text: args.map(fmt).join(" ") }, "*");
      original.apply(console, args);
    };
  });
  window.addEventListener("error", function (e) {
    parent.postMessage({ __lab: true, level: "error", text: e.message + (e.lineno ? " (linha " + e.lineno + ")" : "") }, "*");
  });
  window.addEventListener("unhandledrejection", function (e) {
    parent.postMessage({ __lab: true, level: "error", text: "Promise rejeitada: " + fmt(e.reason && e.reason.message ? e.reason.message : e.reason) }, "*");
  });
})();
<\/script>`;

function buildDoc(code: Code): string {
  // </script> dentro do código do aluno encerraria a tag; escapamos a barra.
  const js = code.js.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BRIDGE}<style>${code.css}</style></head><body>${code.html}<script>${js}<\/script></body></html>`;
}

function loadSaved(): Code | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Code>;
    if (typeof v.html === "string" && typeof v.css === "string" && typeof v.js === "string") return { html: v.html, css: v.css, js: v.js };
  } catch {
    /* sem armazenamento disponível */
  }
  return null;
}

export function Lab() {
  const [code, setCode] = useState<Code>(LAB_EXAMPLES[0]!.code);
  const [tab, setTab] = useState<Tab>("js");
  const [doc, setDoc] = useState(() => buildDoc(LAB_EXAMPLES[0]!.code));
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [runId, setRunId] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const saved = loadSaved();
    if (saved) {
      // Restaura o código salvo neste navegador (efeito de inicialização).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(saved);
      setDoc(buildDoc(saved));
    }
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const d = e.data as { __lab?: boolean; level?: LogLine["level"]; text?: unknown };
      if (!d || d.__lab !== true || typeof d.text !== "string") return;
      const text = d.text.slice(0, 2000);
      setLogs((l) => [...l.slice(-199), { level: d.level ?? "log", text }]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const run = useCallback(() => {
    setLogs([]);
    setDoc(buildDoc(code));
    setRunId((n) => n + 1);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(code));
    } catch {
      /* ignora */
    }
  }, [code]);

  function load(id: string) {
    const ex = LAB_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setCode(ex.code);
    setLogs([]);
    setDoc(buildDoc(ex.code));
    setRunId((n) => n + 1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
      return;
    }
    // Tab insere dois espaços; Esc seguido de Tab continua saindo do campo pelo teclado.
    if (e.key === "Tab" && !e.shiftKey && !(e.currentTarget.dataset.escape === "1")) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = el;
      const value = el.value.slice(0, s) + "  " + el.value.slice(end);
      setCode((c) => ({ ...c, [tab]: value }));
      requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
    }
    if (e.key === "Escape") e.currentTarget.dataset.escape = "1";
    else if (e.key !== "Tab") delete e.currentTarget.dataset.escape;
  }

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "js", label: "JavaScript" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="exemplo" className="text-sm text-muted">
          Exemplo:
        </label>
        <select
          id="exemplo"
          onChange={(e) => load(e.target.value)}
          defaultValue=""
          className="min-h-10 rounded-md border border-line-strong bg-navy px-2 text-sm"
        >
          <option value="" disabled>
            Escolha um exemplo
          </option>
          {LAB_EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.label}
            </option>
          ))}
        </select>
        <span className="ml-auto hidden text-xs text-subtle sm:inline">Ctrl + Enter executa · Esc e depois Tab sai do editor</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[#040a17]">
          <div role="tablist" aria-label="Arquivos" className="flex border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cx("min-h-11 px-4 text-sm", tab === t.id ? "border-b-2 border-electric text-fg" : "text-muted hover:text-fg")}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label htmlFor="editor" className="sr-only">
            Código {TABS.find((t) => t.id === tab)?.label}
          </label>
          <textarea
            id="editor"
            value={code[tab]}
            onChange={(e) => setCode((c) => ({ ...c, [tab]: e.target.value }))}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="block h-[22rem] w-full resize-y bg-transparent p-4 font-mono text-[0.85rem] leading-relaxed text-[#e3ebf7] outline-none"
          />
          <div className="flex flex-wrap gap-2 border-t border-line p-3">
            <Button onClick={run}>
              <Play aria-hidden className="size-4" /> Executar
            </Button>
            <Button variant="ghost" onClick={() => load(LAB_EXAMPLES[0]!.id)}>
              <RotateCcw aria-hidden className="size-4" /> Recomeçar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white">
            <iframe
              key={runId}
              ref={frame}
              title="Resultado do código"
              sandbox="allow-scripts allow-modals"
              srcDoc={doc}
              className="block h-64 w-full"
            />
          </div>
          <div className="flex min-h-40 flex-col rounded-[var(--radius-lg)] border border-line bg-black/40">
            <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span className="text-xs text-subtle">Console</span>
              <button type="button" onClick={() => setLogs([])} className="inline-flex min-h-8 items-center gap-1 px-2 text-xs text-subtle hover:text-fg">
                <Trash2 aria-hidden className="size-3.5" /> Limpar
              </button>
            </div>
            <div role="log" aria-live="polite" className="max-h-56 flex-1 overflow-y-auto p-3 font-mono text-[0.8rem]">
              {logs.length === 0 ? (
                <span className="text-subtle">Nada no console ainda.</span>
              ) : (
                logs.map((l, i) => (
                  <div
                    key={i}
                    className={cx("whitespace-pre-wrap break-words border-b border-line/40 py-0.5", l.level === "error" ? "text-bad" : l.level === "warn" ? "text-amber" : "text-[#cfe0ff]")}
                  >
                    {l.level === "error" ? "✖ " : l.level === "warn" ? "⚠ " : "› "}
                    {l.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
