"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do navegador. A URL e a chave "anon" são públicas por natureza
 * (vão no site estático); quem protege os dados são as políticas RLS do banco.
 * Nunca coloque a chave service_role aqui.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function isSupabaseConfigured(): boolean {
  return /^https:\/\//.test(URL) && ANON_KEY.length > 20;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured() || typeof window === "undefined") return null;
  client ??= createClient(URL, ANON_KEY, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "pdz-auth",
    },
  });
  return client;
}

/**
 * Pergunta ao Supabase quais provedores de login estão ligados (endpoint público
 * /auth/v1/settings). Em caso de falha de rede, devolve true para não bloquear o login.
 */
export async function isGoogleEnabled(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${URL}/auth/v1/settings`, { headers: { apikey: ANON_KEY } });
    if (!res.ok) return true;
    const data = (await res.json()) as { external?: Record<string, boolean> };
    return Boolean(data.external?.google);
  } catch {
    return true;
  }
}
