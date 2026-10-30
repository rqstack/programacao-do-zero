"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { NOTE_MAX_CHARS } from "@/lib/progress/model";
import { dispatchProgress, getProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { Button } from "@/components/ui/primitives";

/**
 * Anotações da aula. Ficam no progresso (navegador) e, com login, na conta — numa tabela
 * que só a própria pessoa pode ler (RLS). Nunca aparecem no perfil público.
 */
export function LessonNotes({ slug }: { slug: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const auth = useAuth();
  const saved = hydrated ? (progress.notes[slug]?.text ?? "") : "";
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "full">("idle");
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega a anotação salva depois da hidratação (uma vez).
  useEffect(() => {
    if (hydrated && !loaded.current) {
      loaded.current = true;
      setText(saved);
    }
  }, [hydrated, saved]);

  function save(value: string) {
    dispatchProgress({ type: "note/save", slug, text: value });
    // Se a anotação é nova e o limite de aulas com anotação foi atingido, nada é salvo.
    setStatus(value.trim() && !getProgress().notes[slug]?.text ? "full" : "saved");
  }

  function onChange(value: string) {
    setText(value);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(value), 700);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const id = `notas-${slug}`;
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 font-semibold text-muted">
        <NotebookPen aria-hidden className="size-4" /> Minhas anotações
      </label>
      <textarea
        id={id}
        value={text}
        maxLength={NOTE_MAX_CHARS}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
            save(text);
          }
        }}
        rows={5}
        placeholder="Escreva com suas palavras o que entendeu, dúvidas para pesquisar depois, um exemplo seu..."
        className="mt-3 w-full rounded-md border border-line-strong bg-ink p-3 text-sm leading-relaxed focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
        <span aria-live="polite">
          {status === "saving" && "Salvando..."}
          {status === "saved" && (text.trim() ? "Salvo." : "Anotação apagada.")}
          {status === "full" && <span className="text-warn">Limite de 80 aulas com anotação. Apague alguma em Salvos e anotações.</span>}
          {status === "idle" && (auth.session ? "Só você vê. Fica salva na sua conta." : "Só você vê. Fica neste navegador; entre com o Google para levar a outros aparelhos.")}
        </span>
        <span className="font-mono">
          {text.length}/{NOTE_MAX_CHARS}
        </span>
      </div>
      {text.trim() && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => {
            if (window.confirm("Apagar a anotação desta aula?")) {
              setText("");
              save("");
            }
          }}
        >
          <Trash2 aria-hidden className="size-4" /> Apagar anotação
        </Button>
      )}
    </div>
  );
}
