/**
 * Executa os exemplos SQL da trilha Supabase num Postgres que emula o Supabase
 * (auth.uid(), papéis anon/authenticated) e confere o que as aulas afirmam.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asRole, createTestDb, createUser } from "./harness";

const md = readFileSync(path.resolve(__dirname, "../../content/courses/supabase/aulas.md"), "utf8");
const blocks = (slug: string) => [...md.split(`<!-- aula: ${slug} -->`)[1]!.split("<!-- aula:")[0]!.matchAll(/```pgsql\n([\s\S]*?)```/g)].map((m) => m[1]!);
const ANA = "abababab-0000-4000-8000-000000000001";
const BETO = "abababab-0000-4000-8000-000000000002";

describe("trilha Supabase: Row Level Security", () => {
  it("cada pessoa vê, altera e apaga só as próprias tarefas", async () => {
    const db = await createTestDb();
    await createUser(db, ANA);
    await createUser(db, BETO);
    for (const b of blocks("row-level-security")) await db.exec(b);

    await asRole(db, "authenticated", ANA, (tx) => tx.query("insert into public.tarefas (titulo) values ('da Ana')"));
    await asRole(db, "authenticated", BETO, (tx) => tx.query("insert into public.tarefas (titulo) values ('do Beto')"));

    const anaVe = await asRole(db, "authenticated", ANA, (tx) => tx.query<{ titulo: string }>("select titulo from public.tarefas"));
    expect(anaVe.rows.map((r) => r.titulo)).toEqual(["da Ana"]);
    const visitante = await asRole(db, "anon", null, async (tx) => (await tx.query("select * from public.tarefas").catch(() => ({ rows: [] }))).rows);
    expect(visitante).toEqual([]);

    // Beto tenta criar uma tarefa no nome da Ana: recusado pelo with check
    await expect(asRole(db, "authenticated", BETO, (tx) => tx.query("insert into public.tarefas (user_id, titulo) values ($1, 'falsa')", [ANA]))).rejects.toThrow(/row-level security/);
    // Beto tenta alterar/apagar a da Ana: nenhuma linha afetada
    const upd = await asRole(db, "authenticated", BETO, (tx) => tx.query("update public.tarefas set feita = true where titulo = 'da Ana' returning id"));
    expect(upd.rows).toEqual([]);
    // Ana não pode mudar o dono (permissão de coluna)
    await expect(asRole(db, "authenticated", ANA, (tx) => tx.query("update public.tarefas set user_id = $1", [BETO]))).rejects.toThrow(/permission denied/);
    const ok = await asRole(db, "authenticated", ANA, (tx) => tx.query("update public.tarefas set feita = true returning feita"));
    expect(ok.rows).toEqual([{ feita: true }]);
  });
});

describe("trilha Supabase: funções no servidor", () => {
  it("XP vem do servidor, conta uma vez e ignora chaves inventadas", async () => {
    const db = await createTestDb();
    await createUser(db, ANA);
    for (const b of blocks("funcoes-e-regras-no-servidor")) await db.exec(b);
    await db.query("insert into public.xp_fontes values ('aula:variaveis', 20), ('aula:lacos', 20)");

    const ganhar = (chaves: string[]) => asRole(db, "authenticated", ANA, async (tx) => (await tx.query<{ t: number }>("select public.ganhar_xp($1::text[]) as t", [chaves])).rows[0]!.t);
    expect(await ganhar(["aula:variaveis"])).toBe(20);
    expect(await ganhar(["aula:variaveis", "aula:variaveis"])).toBe(20); // repetido não conta
    expect(await ganhar(["aula:lacos", "aula:inventada"])).toBe(40); // inventada é ignorada
    await expect(asRole(db, "authenticated", ANA, (tx) => tx.query("insert into public.xp_eventos (user_id, chave, pontos) values ($1, 'aula:lacos', 999)", [ANA]))).rejects.toThrow(/row-level security|permission denied/);
    await expect(asRole(db, "anon", null, (tx) => tx.query("select public.ganhar_xp(array['aula:lacos'])"))).rejects.toThrow(/permission denied/);
  });
});
