"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { onReward, resetProgress } from "@/lib/progress/store";
import { syncProgress } from "@/lib/progress/sync";
import { BASE_PATH, getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  showInRanking: boolean;
}

type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  syncStatus: SyncStatus;
  serverXp: number | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<boolean>;
  syncNow: () => Promise<void>;
  updateProfile: (changes: Partial<Pick<Profile, "displayName" | "showInRanking">>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  /** Relê o perfil depois de editar em /perfil. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [serverXp, setServerXp] = useState<number | null>(null);
  const syncing = useRef(false);
  const pending = useRef<number | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("id, username, display_name, avatar_url, show_in_ranking").eq("id", userId).maybeSingle();
    if (data) {
      setProfile({
        id: data.id as string,
        username: String(data.username ?? ""),
        displayName: String(data.display_name ?? ""),
        avatarUrl: (data.avatar_url as string | null) ?? null,
        showInRanking: Boolean(data.show_in_ranking),
      });
    }
  }, []);

  const runSync = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase || syncing.current) return;
    syncing.current = true;
    setSyncStatus("syncing");
    try {
      const r = await syncProgress(supabase, userId);
      setServerXp(r.serverXp);
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    } finally {
      syncing.current = false;
    }
  }, []);

  // Sessão inicial (inclui a volta do login do Google com ?code= na URL) e mudanças.
  // Chamadas ao banco saem do callback via setTimeout, como recomenda o Supabase,
  // para não bloquear o cliente de autenticação.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let lastUser: string | null = null;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
      const uid = s?.user.id ?? null;
      if (!uid) {
        lastUser = null;
        setProfile(null);
        setServerXp(null);
        setSyncStatus("idle");
        return;
      }
      if (uid !== lastUser) {
        lastUser = uid;
        window.setTimeout(() => {
          loadProfile(uid);
          runSync(uid);
        }, 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile, runSync]);

  const userId = session?.user.id ?? null;

  // Novas recompensas: sincroniza alguns segundos depois (agrupa ações seguidas).
  useEffect(() => {
    if (!userId) return;
    const off = onReward(() => {
      if (pending.current) window.clearTimeout(pending.current);
      pending.current = window.setTimeout(() => runSync(userId), 2500);
    });
    return () => {
      off();
      if (pending.current) window.clearTimeout(pending.current);
    };
  }, [userId, runSync]);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${BASE_PATH}/entrar/` },
    });
  }, []);

  /**
   * Sai da conta. Antes, sincroniza; depois, limpa o progresso deste aparelho para que,
   * em um computador compartilhado, a próxima pessoa não herde o progresso de quem saiu.
   * Devolve false (sem sair) se a sincronização falhar, para não perder nada.
   */
  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return false;
    if (userId) {
      try {
        await syncProgress(supabase, userId);
      } catch {
        return false;
      }
    }
    await supabase.auth.signOut();
    resetProgress();
    return true;
  }, [userId]);

  const syncNow = useCallback(async () => {
    if (userId) await runSync(userId);
  }, [userId, runSync]);

  const updateProfile = useCallback(
    async (changes: Partial<Pick<Profile, "displayName" | "showInRanking">>) => {
      const supabase = getSupabase();
      if (!supabase || !userId) return false;
      const patch: Record<string, unknown> = {};
      if (changes.displayName !== undefined) patch.display_name = changes.displayName.trim().slice(0, 40);
      if (changes.showInRanking !== undefined) patch.show_in_ranking = changes.showInRanking;
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) return false;
      await loadProfile(userId);
      return true;
    },
    [userId, loadProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const deleteAccount = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;
    const { error } = await supabase.rpc("delete_my_account");
    if (error) return false;
    await supabase.auth.signOut();
    return true;
  }, [userId]);

  const value = useMemo<AuthContextValue>(
    () => ({ configured, loading, session, profile, syncStatus, serverXp, signInWithGoogle, signOut, syncNow, updateProfile, deleteAccount, refreshProfile }),
    [configured, loading, session, profile, syncStatus, serverXp, signInWithGoogle, signOut, syncNow, updateProfile, deleteAccount, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
