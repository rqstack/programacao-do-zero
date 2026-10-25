"use client";

import type { BattleLang, ParamType, Signature } from "@battle/battle-core.ts";
import { getSupabase } from "@/lib/supabase/client";

export interface BattleMe {
  trophies: number;
  best_trophies: number;
  wins: number;
  losses: number;
  draws: number;
  abandons: number;
  streak: number;
  best_streak: number;
  active_match: string | null;
  in_queue: boolean;
}

export interface PublicChallenge {
  id: string;
  tier: number;
  title: string;
  statement: string;
  constraints: string[];
  signature: Signature;
  examples: Array<{ input: unknown[]; output: string }>;
}

export type OpponentState = "conectado" | "resolvendo" | "enviando" | "desconectado" | "desistiu" | "concluido";

export interface Submission {
  id: number;
  status: "julgando" | "aceito" | "resposta_errada" | "erro_compilacao" | "erro_execucao" | "tempo_excedido" | "erro_tecnico";
  passed: number | null;
  total: number | null;
  message: string | null;
  submitted_at: string;
}

export interface MatchState {
  match_id: string;
  status: "pronta" | "em_andamento" | "finalizada" | "cancelada";
  result: "vitoria" | "tempo_esgotado" | "abandono" | "cancelada" | null;
  winner: "eu" | "adversario" | null;
  server_now: string;
  starts_at: string;
  ends_at: string;
  finished_at: string | null;
  arena: { id: number; name: string; tier: number };
  challenge: PublicChallenge | null;
  me: { lang: BattleLang; trophies_before: number; trophy_delta: number | null };
  opponent: {
    name: string;
    username: string | null;
    avatar_url: string | null;
    lang: BattleLang;
    trophies_before: number;
    trophy_delta: number | null;
    state: OpponentState;
    submissions: number;
    final_code: string | null;
  };
  my_submissions: Submission[];
}

export interface LeaderRow {
  rank: number;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  trophies: number;
  arena_name: string;
  wins: number;
  losses: number;
  win_rate: number;
  streak: number;
  best_streak: number;
  is_me: boolean;
}

export interface HistoryRow {
  match_id: string;
  finished_at: string;
  challenge_title: string;
  arena_name: string;
  my_lang: BattleLang;
  opponent_name: string;
  opponent_username: string | null;
  opponent_lang: BattleLang;
  outcome: "vitoria" | "derrota" | "empate";
  result: string;
  trophy_delta: number | null;
}

function sb() {
  const s = getSupabase();
  if (!s) throw new Error("Supabase não configurado");
  return s;
}

export async function battleMe(): Promise<BattleMe | null> {
  const { data, error } = await sb().rpc("battle_me");
  if (error) throw error;
  return (data as BattleMe | null) ?? null;
}

export async function joinQueue(lang: BattleLang): Promise<{ state: "fila"; waiting_sec: number; players_in_queue: number } | { state: "partida"; match_id: string }> {
  const { data, error } = await sb().rpc("battle_join_queue", { p_lang: lang });
  if (error) throw error;
  return data;
}

export async function leaveQueue(): Promise<void> {
  await sb().rpc("battle_leave_queue");
}

export async function matchState(matchId: string, activity: "conectado" | "resolvendo"): Promise<MatchState> {
  const { data, error } = await sb().rpc("battle_state", { p_match: matchId, p_activity: activity });
  if (error) throw error;
  return data as MatchState;
}

export async function forfeit(matchId: string): Promise<MatchState> {
  const { data, error } = await sb().rpc("battle_forfeit", { p_match: matchId });
  if (error) throw error;
  return data as MatchState;
}

export async function leaderboard(scope: "geral" | "temporada"): Promise<LeaderRow[]> {
  const { data, error } = await sb().rpc("battle_leaderboard", { p_scope: scope, p_limit: 50 });
  if (error) throw error;
  return ((data ?? []) as LeaderRow[]).map((r) => ({ ...r, rank: Number(r.rank) }));
}

export async function history(): Promise<HistoryRow[]> {
  const { data, error } = await sb().rpc("battle_history", { p_limit: 30 });
  if (error) throw error;
  return (data ?? []) as HistoryRow[];
}

export interface SubmitResponse {
  verdict?: Submission["status"];
  passed?: number;
  total?: number;
  message?: string;
  match_status?: string;
  error?: string;
}

/** Envia o código para a Edge Function, que corrige no servidor (o navegador não decide nada). */
export async function submitCode(matchId: string, code: string): Promise<SubmitResponse> {
  const s = sb();
  const { data } = await s.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { error: "Sua sessão expirou. Entre de novo." };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    const res = await fetch(`${base}/functions/v1/battle-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      body: JSON.stringify({ match_id: matchId, code }),
    });
    return (await res.json()) as SubmitResponse;
  } catch {
    return { error: "Sem conexão com o corretor. Tente de novo." };
  }
}

export const TYPE_LABEL: Record<ParamType, string> = { int: "inteiro", str: "texto", bool: "verdadeiro/falso", "int[]": "lista de inteiros", float: "número decimal" };
