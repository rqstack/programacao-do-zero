import { Fragment } from "react";

/** Formatação mínima para textos curtos (enunciados): `código` e **negrito**. Sem HTML bruto. */
export function InlineMd({ text }: { text: string }) {
  // ``código com `crase` `` também é aceito (crase dupla)
  const parts = text.split(/(``[^`].*?``|`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("``") && p.endsWith("``") && p.length > 4) {
          return (
            <code key={i} className="rounded border border-line bg-panel-2 px-1 py-0.5 font-mono text-[0.88em] text-[#cfe0ff]">
              {p.slice(2, -2).trim()}
            </code>
          );
        }
        if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
          return (
            <code key={i} className="rounded border border-line bg-panel-2 px-1 py-0.5 font-mono text-[0.88em] text-[#cfe0ff]">
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
          return (
            <strong key={i} className="font-semibold text-fg">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
