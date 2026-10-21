"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeProgress, parseProgress } from "./model";
import { getProgress, replaceProgress } from "./store";

export interface SyncResult {
  serverXp: number;
}

/**
 * Sincroniza o progresso deste aparelho com a conta:
 * 1. lê o progresso salvo na conta e mescla com o local;
 * 2. grava o resultado nos dois lugares;
 * 3. registra no banco as atividades concluídas (o banco valida chaves e valores).
 * Falhas de rede não apagam nada: o progresso local continua intacto.
 */
export async function syncProgress(supabase: SupabaseClient, userId: string): Promise<SyncResult> {
  const { data: remoteRow, error: readError } = await supabase.from("user_progress").select("data").eq("user_id", userId).maybeSingle();
  if (readError) throw new Error(`Falha ao ler o progresso da conta (${readError.code})`);

  const local = getProgress();
  const remote = remoteRow ? parseProgress(remoteRow.data) : null;
  const merged = remote ? mergeProgress(local, remote) : local;
  replaceProgress(merged);

  const { error: writeError } = await supabase.from("user_progress").upsert({ user_id: userId, data: merged }, { onConflict: "user_id" });
  if (writeError) throw new Error(`Falha ao salvar o progresso na conta (${writeError.code})`);

  const { data: total, error: xpError } = await supabase.rpc("award_xp", { p_keys: Object.keys(merged.xp) });
  if (xpError) throw new Error(`Falha ao registrar XP (${xpError.code})`);
  return { serverXp: Number(total ?? 0) };
}
