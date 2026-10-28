import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asRole, createTestDb, createUser } from "./harness";

/** Portfólio público: privado por padrão, só dados registrados no servidor, seções escolhidas pela pessoa. */
const ANA = "eeeeeeee-0000-4000-8000-000000000001";
const BETO = "eeeeeeee-0000-4000-8000-000000000002";
let db: PGlite;

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const as = (id: string | null) => (sql: string, p: unknown[] = []) =>
  asRole(db, id ? "authenticated" : "anon", id, async (tx) => (await tx.query<{ r: J }>(sql, p)).rows[0]?.r ?? null);
const portfolio = (viewer: string | null, username: string) => as(viewer)("select public.get_portfolio($1) as r", [username]);
const usernameOf = async (id: string) => (await db.query<{ username: string }>("select username from public.profiles where id = $1", [id])).rows[0]!.username;

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  await createUser(db, ANA, { full_name: "Ana" });
  await createUser(db, BETO, { full_name: "Beto" });
  // Ana conclui uma aula e um projeto (registrados pelo servidor via award_xp).
  const lesson = (await db.query<{ key: string }>("select key from public.xp_sources where key like 'lesson:%' order by key limit 1")).rows[0]!.key;
  const project = (await db.query<{ key: string }>("select key from public.xp_sources where key like 'project:%' order by key limit 1")).rows[0]!.key;
  await as(ANA)("select public.award_xp($1::text[]) as r", [[lesson, project]]);
  const slug = project.split(":")[1]!;
  // Progresso salvo com um link bom e um projeto que NÃO foi registrado no servidor.
  await as(ANA)(
    "insert into public.user_progress (user_id, data) values ($1, $2::jsonb) returning null as r",
    [ANA, JSON.stringify({ projects: { [slug]: { url: "https://github.com/ana/projeto" }, falso: { url: "https://x.com/y", completedAt: "2026-10-01" } } })],
  );
});

describe("portfólio público", () => {
  it("perfis novos nascem privados: ninguém além da pessoa vê", async () => {
    const ana = await usernameOf(ANA);
    expect((await db.query<{ is_public: boolean }>("select is_public from public.profiles where id = $1", [ANA])).rows[0]!.is_public).toBe(false);
    expect(await portfolio(null, ana)).toBeNull();
    expect(await portfolio(BETO, ana)).toBeNull();
    expect(await portfolio(ANA, ana)).not.toBeNull();
  });

  it("depois de publicar, mostra só o que o servidor registrou", async () => {
    const ana = await usernameOf(ANA);
    await as(ANA)("update public.profiles set is_public = true where id = $1 returning null as r", [ANA]);
    const p = await portfolio(null, ana);
    expect(p!.lessons).toHaveLength(1);
    expect(p!.projects).toHaveLength(1);
    expect(p!.projects[0].url).toBe("https://github.com/ana/projeto");
    expect(JSON.stringify(p)).not.toContain("falso");
    expect(JSON.stringify(p)).not.toContain(ANA);
  });

  it("seções ocultas nem saem do banco", async () => {
    const ana = await usernameOf(ANA);
    await as(ANA)("update public.profiles set portfolio = $2::jsonb where id = $1 returning null as r", [ANA, JSON.stringify({ show_projects: false, show_xp: false })]);
    const p = await portfolio(null, ana);
    expect(p!.projects).toBeNull();
    expect(p!.xp).toBeNull();
    expect(p!.lessons).toHaveLength(1);
    expect(p!.prefs).toMatchObject({ show_projects: false, show_trails: true });
  });

  it("links inseguros não aparecem", async () => {
    const ana = await usernameOf(ANA);
    await as(ANA)("update public.profiles set portfolio = '{}'::jsonb where id = $1 returning null as r", [ANA]);
    const slug = (await portfolio(ANA, ana))!.projects[0].slug;
    await as(ANA)("update public.user_progress set data = $2::jsonb where user_id = $1 returning null as r", [ANA, JSON.stringify({ projects: { [slug]: { url: "javascript:alert(1)" } } })]);
    expect((await portfolio(null, ana))!.projects[0].url).toBeNull();
  });

  it("ninguém altera o perfil de outra pessoa nem grava preferências inválidas", async () => {
    await as(BETO)("update public.profiles set is_public = true, portfolio = '{\"show_xp\": false}'::jsonb where id = $1 returning null as r", [ANA]);
    const p = await portfolio(null, await usernameOf(ANA));
    expect(p!.xp).not.toBeNull();
    await expect(as(ANA)("update public.profiles set portfolio = '[]'::jsonb where id = $1 returning null as r", [ANA])).rejects.toThrow();
  });
});
