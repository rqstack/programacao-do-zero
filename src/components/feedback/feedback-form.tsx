"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Alert, Button, cx } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth/auth-provider";
import { getSupabase } from "@/lib/supabase/client";

const CATEGORIES = [
  { id: "problema_tecnico", label: "Problema técnico", hint: "Algo não carrega, um botão não funciona, erro na tela." },
  { id: "resposta_errada", label: "Questão com resposta errada", hint: "Diga qual pergunta e por que a resposta parece errada." },
  { id: "aula_confusa", label: "Aula confusa", hint: "Que parte ficou difícil de entender?" },
  { id: "sugestao_conteudo", label: "Sugestão de conteúdo", hint: "Uma aula, trilha, jogo ou desafio que faria falta." },
  { id: "jogo_ou_batalha", label: "Problema em jogo ou batalha", hint: "Qual jogo ou partida, e o que aconteceu." },
  { id: "outro", label: "Outro assunto", hint: "" },
] as const;

/** Formulário de relato. Não pede nome nem e-mail; o texto vai para uma tabela que só o dono lê. */
export function FeedbackForm() {
  const { configured, session } = useAuth();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"] | null>(null);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  // Trava imediata: o botão só fica desabilitado depois de renderizar; o clique duplo chegava antes.
  const sending = useRef(false);

  // Página de onde a pessoa veio (/feedback?de=/aulas/x), para facilitar achar o problema.
  useEffect(() => {
    const de = new URLSearchParams(window.location.search).get("de");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (de && /^\/[A-Za-z0-9/_?=&.#%-]{0,199}$/.test(de)) setPage(de);
  }, []);

  if (!configured) return <Alert tone="warning" title="Envio de relatos indisponível nesta cópia do site">É preciso o Supabase configurado.</Alert>;
  if (state === "sent") {
    return (
      <Alert tone="success" title="Relato enviado. Obrigado!">
        Ele chega só para quem mantém o site. Não há resposta automática, mas cada relato é lido.
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setState("idle");
              setMessage("");
              setCategory(null);
            }}
          >
            Enviar outro
          </Button>
        </div>
      </Alert>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!category) return setError("Escolha o tipo do relato.");
    if (message.trim().length < 10) return setError("Conte um pouco mais (pelo menos 10 caracteres).");
    const supabase = getSupabase();
    if (!supabase) return setError("Envio indisponível agora.");
    if (sending.current) return;
    sending.current = true;
    setState("sending");
    const { data, error: rpcError } = await supabase.rpc("submit_feedback", { p_category: category, p_message: message, p_page: page });
    sending.current = false;
    if (rpcError || !data?.ok) {
      setState("idle");
      setError((data as { error?: string } | null)?.error ?? "Não foi possível enviar agora. Tente de novo em instantes.");
      return;
    }
    setState("sent");
  }

  const hint = CATEGORIES.find((c) => c.id === category)?.hint;
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6" noValidate>
      <fieldset>
        <legend className="font-semibold">Sobre o que é?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <label key={c.id} className={cx("flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2 text-sm", category === c.id ? "border-electric bg-electric/10" : "border-line-strong hover:border-muted")}>
              <input type="radio" name="categoria" className="size-4 accent-[#3d7bff]" checked={category === c.id} onChange={() => setCategory(c.id)} />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="relato" className="font-semibold">
          O que aconteceu?
        </label>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
        <textarea
          id="relato"
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full rounded-md border border-line-strong bg-ink p-3 text-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
        />
        <p className="mt-1 flex justify-between text-xs text-subtle">
          <span>Não escreva senhas, e-mail ou dados pessoais.</span>
          <span className="font-mono">{message.length}/2000</span>
        </p>
      </div>
      {page && (
        <p className="text-sm text-muted">
          Página: <code className="font-mono text-[#cfe0ff]">{page}</code>{" "}
          <button type="button" className="underline" onClick={() => setPage(null)}>
            não enviar
          </button>
        </p>
      )}
      <p className="text-xs text-subtle">
        {session ? "Como você entrou na conta, o relato fica ligado a ela só para evitar abuso (ninguém mais vê)." : "Sem login: o relato vai sem nenhum dado seu."} Os relatos não são públicos.
      </p>
      {error && <Alert tone="error" title={error} />}
      <Button type="submit" disabled={state === "sending"}>
        <Send aria-hidden className="size-4" /> {state === "sending" ? "Enviando…" : "Enviar relato"}
      </Button>
    </form>
  );
}
