import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cx } from "@/components/ui/primitives";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function textOf(children: unknown): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

const components: Components = {
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const match = /language-([\w-]+)/.exec(className ?? "");
    const raw = textOf(children);
    // Bloco (com linguagem ou com quebra de linha) vs. código inline
    if (match || raw.includes("\n")) {
      return <CodeBlock code={raw.replace(/\n$/, "")} language={match?.[1] ?? "texto"} />;
    }
    return <code>{children}</code>;
  },
  a: ({ href, children }) => {
    const external = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  img: () => null,
};

/**
 * Markdown seguro: react-markdown não interpreta HTML bruto (sem rehype-raw),
 * então tags vindas do conteúdo são exibidas como texto, nunca executadas.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cx("prose-lesson", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {source}
      </ReactMarkdown>
    </div>
  );
}

export function headingsOf(source: string): Array<{ id: string; text: string }> {
  return source
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3).trim())
    .map((text) => ({ id: slugify(text), text }));
}
