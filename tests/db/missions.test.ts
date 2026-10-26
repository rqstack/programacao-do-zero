import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asRole, createTestDb, createUser } from "./harness";

/** Missões rendem XP pelo mesmo caminho das outras atividades: uma vez por chave cadastrada. */
const ANA = "cccccccc-0000-4000-8000-000000000001";
let db: PGlite;
const award = (keys: string[]) =>
  asRole(db, "authenticated", ANA, async (tx) => (await tx.query<{ total: number }>("select public.award_xp($1::text[]) as total", [keys])).rows[0]!.total);

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  await createUser(db, ANA, { full_name: "Ana" });
});

describe("XP das missões", () => {
  it("credita a missão uma vez só, mesmo pedindo de novo", async () => {
    expect(await award(["mission:primeiros-passos"])).toBe(30);
    expect(await award(["mission:primeiros-passos", "mission:primeiros-passos"])).toBe(30);
  });
  it("missões sem XP pelo navegador (batalhas) e chaves inventadas não valem nada", async () => {
    expect(await award(["mission:programador-competitivo", "mission:inventada"])).toBe(30);
  });
  it("ninguém consegue cadastrar uma missão pelo navegador", async () => {
    await expect(
      asRole(db, "authenticated", ANA, (tx) => tx.query("insert into public.xp_sources (key, amount, label) values ('mission:hack', 500, 'x')")),
    ).rejects.toThrow();
  });
});
