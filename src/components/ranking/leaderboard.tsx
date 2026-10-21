"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Crown, Medal, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { levelFromXp, levelTitle } from "@/lib/gamification/rules";
import { getSupabase } from "@/lib/supabase/client";
import { Alert, Button, cx, EmptyState, Spinner } from "@/components/ui/primitives";

interface Row {
  rank: number;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  is_me: boolean | null;
}

type Tab = "semana" | "geral";

/** Dias até a próxima segunda-feira, 00:00 em Brasília. */
function daysUntilReset(now = new Date()): number {
  const br = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dow = br.getDay(); // 0 = domingo
  return dow === 0 ? 1 : 8 - dow;
}

export function Leaderboard() {
  const { configured, session, serverXp } = useAuth();
  const [tab, setTab] = useState<Tab>("semana");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (which: Tab) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase.rpc(which === "semana" ? "get_weekly_leaderboard" : "get_leaderboard", { p_limit: 50 });
    setLoading(false);
    if (err) {
      setError(true);
      return;
    }
    setRows(((data ?? []) as Row[]).map((r) => ({ ...r, rank: Number(r.rank), xp: Number(r.xp) })));
  }, []);

  useEffect(() => {
    if (!configured) return;
    // Busca inicial e a cada troca de aba (dados externos).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(tab);
  }, [configured, tab, load, serverXp]);

  if (!configured) {
    return (
      <Alert tone="warning" title="Ranking indisponível nesta cópia do site">
        O ranking precisa de um projeto Supabase configurado. Veja docs/CONFIGURACAO.md no repositório.
      </Alert>
    );
  }

  const days = daysUntilReset();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Tipo de ranking" className="inline-flex rounded-full border border-line-strong p-1">
          {(["semana", "geral"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx("min-h-9 rounded-full px-4 text-sm", tab === t ? "bg-electric text-white" : "text-muted hover:text-fg")}
            >
              {t === "semana" ? "Liga da semana" : "Geral"}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">
          {tab === "semana" ? `A liga recomeça em ${days} dia${days === 1 ? "" : "s"} (segunda-feira).` : "XP acumulado desde o primeiro dia."}
        </span>
      </div>

      {!session && (
        <Alert tone="info" className="mt-6" title="Você ainda não está no ranking">
          <Link href="/entrar" className="underline">
            Entre com o Google
          </Link>{" "}
          para seu XP contar aqui.
        </Alert>
      )}

      <div className="mt-6" role="tabpanel" aria-label={tab === "semana" ? "Liga da semana" : "Ranking geral"}>
        {loading && !rows ? (
          <Spinner label="Carregando ranking" />
        ) : error ? (
          <Alert tone="error" title="Não foi possível carregar o ranking">
            <Button variant="ghost" size="sm" onClick={() => load(tab)} className="mt-2">
              <RefreshCw aria-hidden className="size-4" /> Tentar de novo
            </Button>
          </Alert>
        ) : !rows || rows.length === 0 ? (
          <EmptyState title={tab === "semana" ? "Ninguém pontuou nesta semana ainda" : "O ranking ainda está vazio"}>
            Conclua uma aula ou o treino do dia para ser a primeira pessoa da lista.
          </EmptyState>
        ) : (
          <ol className="divide-y divide-line rounded-[var(--radius-lg)] border border-line">
            {rows.map((r) => {
              const lvl = levelFromXp(r.xp);
              return (
                <li key={`${r.rank}-${r.display_name}-${r.xp}`} className={cx("flex items-center gap-4 px-4 py-3", r.is_me && "bg-electric/10")}>
                  <span className="w-8 shrink-0 text-center font-mono text-sm">
                    {r.rank === 1 ? (
                      <Crown aria-label="1º lugar" className="mx-auto size-5 text-amber" />
                    ) : r.rank <= 3 ? (
                      <Medal aria-label={`${r.rank}º lugar`} className={cx("mx-auto size-5", r.rank === 2 ? "text-[#c9d2e3]" : "text-[#d08a4e]")} />
                    ) : (
                      <span className="text-subtle">{r.rank}º</span>
                    )}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-panel-2">
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" width={36} height={36} referrerPolicy="no-referrer" className="size-full object-cover" />
                    ) : (
                      <span aria-hidden className="text-sm font-semibold">
                        {r.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {r.display_name}
                      {r.is_me && <span className="ml-2 text-xs text-electric-hi">você</span>}
                    </span>
                    {tab === "geral" && (
                      <span className="block text-xs text-muted">
                        Nível {lvl.level} · {levelTitle(lvl.level)}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-sm text-amber">{r.xp} XP</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
