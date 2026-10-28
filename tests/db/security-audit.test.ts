import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./harness";

/** Auditoria do esquema inteiro: vale para as migrações atuais e as futuras. */
let db: PGlite;
beforeAll(async () => {
  db = await createTestDb({ seed: true, battle: true });
});

const rows = async <T,>(sql: string) => (await db.query<T>(sql)).rows;

describe("auditoria de segurança do banco", () => {
  it("todas as tabelas públicas têm RLS ligado", async () => {
    const off = await rows<{ t: string }>("select relname as t from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity");
    expect(off.map((r) => r.t)).toEqual([]);
  });

  it("toda função SECURITY DEFINER fixa o search_path", async () => {
    const bad = await rows<{ f: string }>(`
      select p.proname as f from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prosecdef and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')`);
    expect(bad.map((r) => r.f)).toEqual([]);
  });

  it("visitantes sem login só chamam funções de leitura pública e as de envio previstas", async () => {
    const anon = await rows<{ f: string }>(`
      select distinct p.proname as f from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute') order by 1`);
    const allowed = new Set([
      // leitura pública
      "get_leaderboard", "get_weekly_leaderboard", "get_public_profile", "search_profiles", "get_follow_list", "get_portfolio",
      "battle_leaderboard", "battle_arena_for", "battle_trophy_delta", "battle_event_summary", "week_start", "get_league",
      // envio sem login, com limite e validação no banco
      "submit_feedback",
      // funções auxiliares sem SECURITY DEFINER (rodam com as permissões de quem chama)
      "battle_lang_ok", "portfolio_shows",
    ]);
    const unexpected = anon.map((r) => r.f).filter((f) => !allowed.has(f) && !f.startsWith("pg_") && !f.startsWith("gen_"));
    expect(unexpected).toEqual([]);
  });

  it("nenhuma tabela dá escrita direta a visitantes ou a contas", async () => {
    const writable = await rows<{ t: string; who: string; priv: string }>(`
      select table_name as t, grantee as who, privilege_type as priv from information_schema.role_table_grants
      where table_schema = 'public' and grantee in ('anon', 'authenticated') and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
      order by 1, 2, 3`);
    // Só o próprio progresso (com RLS: cada um só a sua linha). Perfil: UPDATE apenas em colunas liberadas (column grants).
    for (const w of writable) expect(`${w.t}:${w.who}`).toBe("user_progress:authenticated");
  });
});
