import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "./harness";

/** Os scripts preparados para produção precisam rodar limpos num banco com todas as migrações. */
const DIR = path.resolve(__dirname, "../../supabase/producao-pendente");
const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

describe("scripts pendentes de produção", () => {
  it.each(files)("%s roda sem erro e duas vezes seguidas (idempotente)", async (file) => {
    const db = await createTestDb({ seed: false });
    const sql = readFileSync(path.join(DIR, file), "utf8");
    await db.exec(sql);
    await db.exec(sql);
    const n = (await db.query<{ n: number }>("select count(*)::int as n from public.xp_sources")).rows[0]!.n;
    expect(n).toBe(69);
  });
});
