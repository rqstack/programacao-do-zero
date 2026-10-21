"use client";

import { useRef, type KeyboardEvent } from "react";

/**
 * Editor simples e acessível: textarea com numeração de linhas, Tab que indenta
 * e Enter que mantém a indentação. Esc tira o foco (para não prender o teclado).
 */
export function CodeEditor({ value, onChange, indent, label }: { value: string; onChange: (v: string) => void; indent: number; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  function replace(start: number, end: number, text: string, caret: number) {
    const el = ref.current!;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = caret;
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t } = el;
    const pad = " ".repeat(indent);
    if (e.key === "Escape") {
      el.blur();
      return;
    }
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        const head = value.slice(lineStart, lineStart + indent);
        const remove = head.length - head.trimStart().length;
        if (remove > 0) replace(lineStart, lineStart + remove, "", Math.max(lineStart, s - remove));
        return;
      }
      replace(s, t, pad, s + pad.length);
      return;
    }
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const line = value.slice(lineStart, s);
      let lead = line.match(/^\s*/)?.[0] ?? "";
      // Depois de "{" ou ":" (Python), abre um nível a mais.
      if (/[{[(:]\s*$/.test(line)) lead += pad;
      replace(s, t, `\n${lead}`, s + 1 + lead.length);
    }
  }

  return (
    <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#060d1c] focus-within:border-electric">
      <div ref={gutter} aria-hidden className="select-none overflow-hidden border-r border-line py-3 pl-2 pr-2 text-right font-mono text-[13px] leading-6 text-subtle">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        aria-label={label}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        rows={Math.min(24, Math.max(12, lines + 2))}
        className="min-w-0 flex-1 resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 text-[#dbe7ff] outline-none"
      />
    </div>
  );
}
