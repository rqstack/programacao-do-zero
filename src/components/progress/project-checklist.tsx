"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Alert, Button, cx } from "@/components/ui/primitives";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

export function ProjectChecklist({ slug, title, criteria }: { slug: string; title: string; criteria: string[] }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const record = hydrated ? progress.projects[slug] : undefined;
  const checked = new Set(record?.checked ?? []);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const allChecked = criteria.every((_, i) => checked.has(i));

  function complete(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed && !/^https:\/\/\S+$/i.test(trimmed)) {
      setError("Use um link que comece com https://");
      return;
    }
    setError(null);
    dispatchProgress({ type: "project/complete", slug, title, totalCriteria: criteria.length, url: trimmed || null });
  }

  return (
    <div>
      <ul className="space-y-2">
        {criteria.map((c, i) => (
          <li key={i}>
            <label className={cx("flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm", checked.has(i) ? "border-amber/50 bg-amber/5" : "border-line")}>
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[#ffb547]"
                checked={checked.has(i)}
                onChange={() => dispatchProgress({ type: "project/toggle", slug, index: i })}
              />
              <span>{c}</span>
            </label>
          </li>
        ))}
      </ul>
      {record?.completedAt ? (
        <Alert tone="success" title="Projeto concluído" className="mt-6">
          Concluído em {new Date(record.completedAt).toLocaleDateString("pt-BR")}.
          {record.url && (
            <>
              {" "}
              <a href={record.url} target="_blank" rel="noopener noreferrer" className="underline">
                Abrir o link do projeto
              </a>
            </>
          )}
        </Alert>
      ) : (
        <form onSubmit={complete} className="mt-6 space-y-3">
          <label htmlFor={`url-${slug}`} className="block text-sm font-medium">
            Link do repositório ou da versão publicada (opcional)
          </label>
          <input
            id={`url-${slug}`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            placeholder="https://github.com/seu-usuario/seu-projeto"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `url-${slug}-erro` : undefined}
            className="min-h-11 w-full rounded-md border border-line-strong bg-ink px-3 text-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
          />
          {error && (
            <p id={`url-${slug}-erro`} className="text-xs text-bad">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!allChecked}>
            <CheckCircle2 aria-hidden className="size-4" /> Concluir projeto
          </Button>
          {!allChecked && <p className="text-xs text-subtle">Marque todos os critérios para concluir.</p>}
        </form>
      )}
    </div>
  );
}

export function ProjectBadge({ slug }: { slug: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const r = hydrated ? progress.projects[slug] : undefined;
  if (r?.completedAt) return <span className="font-mono text-xs text-amber">concluído ✓</span>;
  if (r && r.checked.length > 0) return <span className="font-mono text-xs text-muted">em andamento</span>;
  return null;
}
