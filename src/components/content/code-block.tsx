import { highlight } from "sugar-high";
import { CopyButton } from "./copy-button";

const LANG_LABEL: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  pgsql: "SQL (Supabase)",
  java: "Java",
  csharp: "C#",
  cs: "C#",
  xml: "XML",
  xaml: "XAML",
  python: "Python",
  py: "Python",
  bash: "Terminal",
  sh: "Terminal",
  json: "JSON",
  pseudo: "Pseudocódigo",
  texto: "Texto",
  text: "Texto",
};

/** Linguagens com sintaxe parecida com JS recebem destaque; as demais ficam em texto puro escapado. */
const HIGHLIGHT = new Set(["js", "javascript", "ts", "typescript", "jsx", "tsx", "json", "css", "sql", "pgsql", "html", "java", "csharp", "cs"]);

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const lang = language.toLowerCase();
  // sugar-high escapa o conteúdo (&lt; &gt; &quot;), então o HTML gerado é seguro.
  const html = HIGHLIGHT.has(lang) ? highlight(code) : null;
  return (
    <figure className="code-surface not-prose my-6 overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#040a17]">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-subtle">
        <span>{LANG_LABEL[lang] ?? language}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[0.86rem] leading-relaxed">
        {html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code className="text-[#d6e2f5]">{code}</code>}
      </pre>
    </figure>
  );
}
