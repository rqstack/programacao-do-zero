"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Lightbulb, RefreshCw, TriangleAlert, X } from "lucide-react";
import { LANG_INFO } from "@battle/battle-core.ts";
import { InlineMd } from "@/components/content/inline-md";
import { ErrorHelp } from "@/components/learn/error-help";
import { Button, cx } from "@/components/ui/primitives";
import { errorText, rematch, type MatchState, type RematchInfo, type Submission } from "@/lib/battle/api";

const VERDICT: Record<Submission["status"], string> = {
  julgando: "Corrigindo",
  aceito: "Aceito",
  resposta_errada: "Resposta errada",
  erro_compilacao: "Erro de compilação",
  erro_execucao: "Erro na execução",
  tempo_excedido: "Tempo excedido",
  erro_tecnico: "Falha do corretor (não conta)",
};

const WHY: Partial<Record<Submission["status"], string>> = {
  resposta_errada: "O programa rodou, mas devolveu um valor diferente do esperado em algum teste. Teste casos-limite: lista vazia, zero, negativos, empates.",
  erro_compilacao: "O código não chegou a rodar: há um erro de sintaxe ou de tipo. Leia a primeira linha da mensagem; ela costuma apontar a linha do problema.",
  erro_execucao: "O programa quebrou no meio: índice fora da lista, divisão por zero ou valor vazio são as causas mais comuns.",
  tempo_excedido: "A solução está lenta demais para entradas grandes. Procure evitar laços dentro de laços e reaproveitar resultados.",
};

/** Resumo educativo depois da partida. Mostra só o necessário do adversário (o código final). */
export function PostBattleReview({ st }: { st: MatchState }) {
  const subs = st.my_submissions;
  const accepted = subs.find((s) => s.status === "aceito");
  const firstErrors = [...new Set(subs.filter((s) => WHY[s.status]).map((s) => s.status))];
  const review = st.review;
  const altCode = st.opponent.final_accepted ? st.opponent.final_code : null;

  return (
    <section aria-labelledby="revisao-partida" className="space-y-6 rounded-[var(--radius-lg)] border border-line p-5 sm:p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Revisão da partida</p>
        <h2 id="revisao-partida" className="mt-1 text-2xl font-bold">
          {st.challenge?.title ?? "Desafio"}
        </h2>
        {st.challenge && (
          <details className="mt-2 text-sm text-muted">
            <summary className="cursor-pointer">Rever o enunciado</summary>
            <div className="mt-2 space-y-2">
              {st.challenge.statement.split("\n\n").map((p, i) => (
                <p key={i}>
                  <InlineMd text={p} />
                </p>
              ))}
            </div>
          </details>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Seus testes</h3>
        {subs.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Você não enviou nenhuma solução nesta partida.</p>
        ) : (
          <ol className="mt-2 space-y-2 text-sm">
            {subs.map((s, i) => (
              <li key={s.id} className="rounded-[var(--radius-md)] border border-line p-3">
                <p className="flex flex-wrap items-baseline gap-2">
                  {s.status === "aceito" ? <Check aria-hidden className="size-4 text-ok" /> : <X aria-hidden className="size-4 text-bad" />}
                  <span className="font-mono text-xs text-subtle">envio {i + 1}</span>
                  <span className={cx("font-semibold", s.status === "aceito" ? "text-ok" : "text-fg")}>{VERDICT[s.status]}</span>
                  {s.total ? (
                    <span className="font-mono text-xs text-muted">
                      {s.passed}/{s.total} testes
                    </span>
                  ) : null}
                </p>
                {s.message && s.status !== "aceito" && (
                  <>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[#060d1c] p-2 font-mono text-xs text-[#ffd6d6]">{s.message}</pre>
                    <ErrorHelp message={s.message} />
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
        {firstErrors.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {firstErrors.map((k) => (
              <li key={k} className="flex gap-2">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
                <span>
                  <strong className="text-fg">{VERDICT[k]}:</strong> {WHY[k]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {review && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Lightbulb aria-hidden className="size-4 text-amber" /> A lógica do problema
            </h3>
            <p className="mt-2 text-sm">{review.idea}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
              {review.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-semibold">Erros comuns</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {review.pitfalls.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h3 className="mt-5 flex items-center gap-2 font-semibold">
              <BookOpen aria-hidden className="size-4 text-electric-hi" /> Para estudar
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {review.study.map((t) => (
                <li key={t}>
                  <Link href={`/busca?q=${encodeURIComponent(t)}`} className="inline-flex min-h-9 items-center rounded-md border border-line-strong px-3 hover:border-muted">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <details open={Boolean(accepted)} className="rounded-[var(--radius-md)] border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">Sua solução ({LANG_INFO[st.me.lang].label})</summary>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-[#060d1c] p-3 font-mono text-xs leading-5 text-[#dbe7ff]">{st.me.final_code ?? "(nenhum envio)"}</pre>
        </details>
        <details className="rounded-[var(--radius-md)] border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            {altCode ? `Uma solução aceita, em ${LANG_INFO[st.opponent.lang].label}` : `Último envio do adversário (${LANG_INFO[st.opponent.lang].label})`}
          </summary>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-[#060d1c] p-3 font-mono text-xs leading-5 text-[#dbe7ff]">{st.opponent.final_code ?? "(não enviou código)"}</pre>
          {!altCode && st.opponent.final_code && <p className="mt-2 text-xs text-subtle">Este envio não passou em todos os testes.</p>}
        </details>
      </div>
    </section>
  );
}

const REMATCH_TEXT: Record<RematchInfo["status"], string> = {
  nenhum: "",
  pedido_por_mim: "Pedido enviado. Esperando a resposta…",
  pedido_pelo_adversario: "O adversário quer uma revanche!",
  aceito: "Revanche aceita. Entrando…",
  recusado: "A revanche foi recusada.",
  cancelado: "A revanche foi cancelada.",
  expirado: "O pedido de revanche expirou.",
};

/** Revanche: partida nova e independente (amistosa); a anterior continua no histórico. */
export function RematchPanel({ matchId, info, opponentName, onUpdate }: { matchId: string; info: RematchInfo | null; opponentName: string; onUpdate: (r: RematchInfo) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = info?.status ?? "nenhum";

  async function act(action: "pedir" | "aceitar" | "recusar") {
    setBusy(true);
    setError(null);
    try {
      const r = await rematch(matchId, action);
      if (r.error) setError(r.error);
      onUpdate(r);
    } catch (e) {
      setError(errorText(e, "Não foi possível falar com o servidor."));
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2" aria-live="polite">
      {status === "pedido_pelo_adversario" ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-semibold">{opponentName} quer uma revanche.</span>
          <Button disabled={busy} onClick={() => act("aceitar")}>
            Aceitar
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => act("recusar")}>
            Recusar
          </Button>
        </div>
      ) : status === "nenhum" || status === "expirado" ? (
        <Button variant="secondary" disabled={busy || !info?.opponent_available} onClick={() => act("pedir")}>
          <RefreshCw aria-hidden className="size-4" /> Pedir revanche
        </Button>
      ) : (
        <p className="text-sm text-muted">{REMATCH_TEXT[status]}</p>
      )}
      {(status === "nenhum" || status === "expirado") && info && !info.opponent_available && (
        <p className="text-xs text-subtle">{opponentName} saiu da tela da partida ou está jogando outra. A revanche fica disponível se a pessoa voltar.</p>
      )}
      {status === "expirado" && <p className="text-xs text-subtle">{REMATCH_TEXT.expirado}</p>}
      {(status === "nenhum" || status === "pedido_por_mim") && <p className="text-xs text-subtle">Revanches são amistosas: não valem troféus.</p>}
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
}
