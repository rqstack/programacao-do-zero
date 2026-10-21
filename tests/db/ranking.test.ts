import type { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { xpSources, xpSourcesSql } from "@content/xp-sources";
import { applyProgress, emptyProgress } from "@/lib/progress/model";
import { asRole, createTestDb, createUser, SEED_FILE } from "./harness";

const ANA = "aaaaaaaa-0000-4000-8000-000000000001";
const BETO = "aaaaaaaa-0000-4000-8000-000000000002";
const CAIO = "aaaaaaaa-0000-4000-8000-000000000003";

let db: PGlite;

async function denied(fn: () => Promise<unknown>) {
  await expect(fn()).rejects.toThrow(/permission denied|row-level security|login necessário/);
}

const award = (user: string, keys: string[]) =>
  asRole(db, "authenticated", user, async (tx) => (await tx.query<{ total: number }>("select public.award_xp($1::text[]) as total", [keys])).rows[0]!.total);

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  await createUser(db, ANA, { full_name: "Ana Souza", avatar_url: "https://lh3.googleusercontent.com/a/foto" });
  await createUser(db, BETO, { name: "Beto", picture: "javascript:alert(1)" });
  await createUser(db, CAIO, {});
});

describe("seed de atividades", () => {
  it("supabase/seed.sql está atualizado com o conteúdo", () => {
    expect(readFileSync(SEED_FILE, "utf8")).toBe(xpSourcesSql());
  });

  it("as chaves geradas pelo progresso do navegador existem no banco, com o mesmo valor", () => {
    const sources = new Map(xpSources().map((s) => [s.key, s.amount]));
    const lesson = xpSources().find((s) => s.key.startsWith("lesson:"))!.key.slice("lesson:".length);
    const { state } = applyProgress(emptyProgress(new Date()), { type: "lesson/complete", slug: lesson, title: "x" }, new Date());
    for (const [key, entry] of Object.entries(state.xp)) expect(sources.get(key)).toBe(entry.amount);
  });
});

describe("perfis vindos do Google", () => {
  it("usa nome e foto do Google e descarta URLs inseguras", async () => {
    const rows = (await db.query<{ id: string; display_name: string; avatar_url: string | null }>("select id, display_name, avatar_url from public.profiles order by id")).rows;
    expect(rows).toEqual([
      { id: ANA, display_name: "Ana Souza", avatar_url: "https://lh3.googleusercontent.com/a/foto" },
      { id: BETO, display_name: "Beto", avatar_url: null },
      { id: CAIO, display_name: "", avatar_url: null },
    ]);
  });

  it("cada pessoa vê só o próprio perfil e não muda o id nem o avatar", async () => {
    const seen = await asRole(db, "authenticated", ANA, (tx) => tx.query<{ id: string }>("select id from public.profiles"));
    expect(seen.rows.map((r) => r.id)).toEqual([ANA]);
    await denied(() => asRole(db, "authenticated", ANA, (tx) => tx.query("update public.profiles set avatar_url = 'https://x.test/y' where id = $1", [ANA])));
    const other = await asRole(db, "authenticated", ANA, (tx) => tx.query("update public.profiles set display_name = 'hack' where id = $1 returning id", [BETO]));
    expect(other.rows).toEqual([]);
    const own = await asRole(db, "authenticated", ANA, (tx) => tx.query<{ display_name: string }>("update public.profiles set display_name = 'Ana S.' where id = $1 returning display_name", [ANA]));
    expect(own.rows).toEqual([{ display_name: "Ana S." }]);
  });
});

describe("XP validado pelo banco", () => {
  it("aceita só atividades cadastradas, com o valor do banco, uma vez", async () => {
    const lesson = xpSources().find((s) => s.key.startsWith("lesson:"))!;
    const project = xpSources().find((s) => s.key.startsWith("project:"))!;
    const total = await award(ANA, [lesson.key, project.key, "lesson:nao-existe", "xp:9999"]);
    expect(total).toBe(lesson.amount + project.amount);
    expect(await award(ANA, [lesson.key, lesson.key])).toBe(total);
  });

  it("ninguém insere ou altera XP diretamente", async () => {
    const key = xpSources()[0]!.key;
    await denied(() => asRole(db, "authenticated", BETO, (tx) => tx.query("insert into public.xp_events (user_id, source_key, amount) values ($1, $2, 500)", [BETO, key])));
    await denied(() => asRole(db, "authenticated", ANA, (tx) => tx.query("update public.xp_events set amount = 500")));
    await denied(() => asRole(db, "authenticated", ANA, (tx) => tx.query("insert into public.xp_sources (key, amount) values ('lesson:fake', 500)")));
  });

  it("visitante sem login não ganha XP", async () => {
    await denied(() => asRole(db, "anon", null, (tx) => tx.query("select public.award_xp(array['lesson:x'])")));
  });

  it("cada pessoa vê só o próprio XP", async () => {
    await award(BETO, [xpSources()[0]!.key]);
    const rows = await asRole(db, "authenticated", BETO, (tx) => tx.query<{ user_id: string }>("select user_id from public.xp_events"));
    expect(new Set(rows.rows.map((r) => r.user_id))).toEqual(new Set([BETO]));
  });
});

describe("ranking", () => {
  it("é público, ordenado por XP e só expõe nome, avatar e XP", async () => {
    const rows = await asRole(db, "anon", null, (tx) =>
      tx.query<{ rank: number; display_name: string; xp: number; is_me: boolean | null }>("select * from public.get_leaderboard(10)"),
    );
    expect(rows.rows.map((r) => r.display_name)).toEqual(["Ana S.", "Beto"]);
    expect(Number(rows.rows[0]!.rank)).toBe(1);
    expect(Object.keys(rows.rows[0]!).sort()).toEqual(["avatar_url", "display_name", "is_me", "rank", "xp"]);
  });

  it("quem escolhe não aparecer some do ranking, mas vê a própria posição", async () => {
    await asRole(db, "authenticated", BETO, (tx) => tx.query("update public.profiles set show_in_ranking = false where id = $1", [BETO]));
    const board = await asRole(db, "anon", null, (tx) => tx.query<{ display_name: string }>("select display_name from public.get_leaderboard(10)"));
    expect(board.rows.map((r) => r.display_name)).toEqual(["Ana S."]);
    const mine = await asRole(db, "authenticated", BETO, (tx) => tx.query<{ rank: number; xp: number }>("select * from public.get_my_rank()"));
    expect(mine.rows).toHaveLength(1);
  });

  it("marca a própria linha com is_me", async () => {
    const rows = await asRole(db, "authenticated", ANA, (tx) => tx.query<{ display_name: string; is_me: boolean }>("select display_name, is_me from public.get_leaderboard(10)"));
    expect(rows.rows.find((r) => r.display_name === "Ana S.")?.is_me).toBe(true);
  });
});

describe("progresso sincronizado", () => {
  it("cada pessoa lê e grava só o próprio progresso", async () => {
    await asRole(db, "authenticated", ANA, (tx) => tx.query("insert into public.user_progress (user_id, data) values ($1, '{\"version\":1}')", [ANA]));
    await denied(() => asRole(db, "authenticated", BETO, (tx) => tx.query("insert into public.user_progress (user_id, data) values ($1, '{}')", [ANA])));
    const seen = await asRole(db, "authenticated", BETO, (tx) => tx.query("select * from public.user_progress"));
    expect(seen.rows).toEqual([]);
    await denied(() => asRole(db, "anon", null, (tx) => tx.query("select * from public.user_progress")));
  });

  it("recusa progresso grande demais", async () => {
    const huge = JSON.stringify({ x: "a".repeat(400_000) });
    await expect(asRole(db, "authenticated", CAIO, (tx) => tx.query("insert into public.user_progress (user_id, data) values ($1, $2::jsonb)", [CAIO, huge]))).rejects.toThrow();
  });
});

describe("exclusão de conta", () => {
  it("apaga usuário, perfil, XP e progresso da própria pessoa", async () => {
    await asRole(db, "authenticated", ANA, (tx) => tx.query("select public.delete_my_account()"));
    const left = (await db.query<{ n: number }>(
      "select (select count(*) from auth.users where id = $1) + (select count(*) from public.profiles where id = $1) + (select count(*) from public.xp_events where user_id = $1) + (select count(*) from public.user_progress where user_id = $1) as n",
      [ANA],
    )).rows[0]!;
    expect(Number(left.n)).toBe(0);
    await denied(() => asRole(db, "anon", null, (tx) => tx.query("select public.delete_my_account()")));
  });
});

describe("treino diário e liga semanal", () => {
  const DANI = "aaaaaaaa-0000-4000-8000-000000000004";
  const today = async () =>
    (await db.query<{ d: string }>("select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d")).rows[0]!.d;

  it("aceita o treino de hoje uma vez e recusa datas antigas ou futuras", async () => {
    await createUser(db, DANI, { full_name: "Dani" });
    const d = await today();
    const first = await award(DANI, [`practice:${d}`]);
    expect(first).toBe(15);
    expect(await award(DANI, [`practice:${d}`])).toBe(15);
    expect(await award(DANI, ["practice:2020-01-01", "practice:2999-01-01", "practice:2026-13-45"])).toBe(15);
  });

  it("a liga semanal só soma XP desde segunda-feira", async () => {
    const lesson = xpSources().find((s) => s.key.startsWith("lesson:"))!;
    await award(DANI, [lesson.key]);
    await db.query("update public.xp_events set created_at = public.week_start() - interval '1 day' where user_id = $1 and source_key = $2", [DANI, lesson.key]);
    const rows = await asRole(db, "anon", null, (tx) => tx.query<{ display_name: string; xp: number }>("select display_name, xp from public.get_weekly_leaderboard(10)"));
    expect(rows.rows.find((r) => r.display_name === "Dani")?.xp).toBe(15);
    const all = await asRole(db, "anon", null, (tx) => tx.query<{ display_name: string; xp: number }>("select display_name, xp from public.get_leaderboard(10)"));
    expect(all.rows.find((r) => r.display_name === "Dani")?.xp).toBe(15 + lesson.amount);
  });
});
