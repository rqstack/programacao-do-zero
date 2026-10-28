import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { asRole, createTestDb, createUser } from "./harness";

/** Relatos: entram só pela função, com validação e limite; ninguém lê pelo site. */
const ANA = "ffffffff-0000-4000-8000-000000000001";
let db: PGlite;
type J = Record<string, unknown>;
const send = (user: string | null, cat: string, msg: string, page: string | null = "/aulas/variaveis") =>
  asRole(db, user ? "authenticated" : "anon", user, async (tx) => (await tx.query<{ r: J }>("select public.submit_feedback($1, $2, $3) as r", [cat, msg, page])).rows[0]!.r);

beforeAll(async () => {
  db = await createTestDb();
  await createUser(db, ANA, { full_name: "Ana" });
});
beforeEach(async () => {
  await db.exec("delete from public.feedback");
});

describe("relatos dos alunos", () => {
  it("aceita relato com e sem login e guarda só o necessário", async () => {
    expect(await send(ANA, "resposta_errada", "A alternativa B também está certa.")).toEqual({ ok: true });
    expect(await send(null, "sugestao_conteudo", "Uma aula sobre expressões regulares.")).toEqual({ ok: true });
    const rows = (await db.query<{ user_id: string | null; page: string | null }>("select user_id, page from public.feedback order by id")).rows;
    expect(rows.map((r) => r.user_id)).toEqual([ANA, null]);
    expect(rows[0]!.page).toBe("/aulas/variaveis");
  });

  it("clique duplo ou reenvio não grava o mesmo relato duas vezes", async () => {
    const msg = "A pergunta 3 da aula de laços está com a resposta errada.";
    const [a, b] = await Promise.all([send(ANA, "resposta_errada", msg), send(ANA, "resposta_errada", msg)]);
    expect([a, b].every((r) => r.ok)).toBe(true);
    await send(null, "outro", "Relato sem login repetido.");
    await send(null, "outro", "Relato sem login repetido.");
    const n = (await db.query<{ n: number }>("select count(*)::int as n from public.feedback")).rows[0]!.n;
    expect(n).toBe(2);
    // Outro texto da mesma pessoa continua entrando normalmente.
    expect((await send(ANA, "resposta_errada", "Outra pergunta com problema na aula 4.")).ok).toBe(true);
  });

  it("valida tipo, tamanho e página", async () => {
    expect((await send(ANA, "spam", "mensagem qualquer aqui")).ok).toBe(false);
    expect((await send(ANA, "outro", "curto")).ok).toBe(false);
    expect((await send(ANA, "outro", "x".repeat(2001))).ok).toBe(false);
    expect(await send(ANA, "outro", "Página com endereço estranho.", "javascript:alert(1)")).toEqual({ ok: true });
    expect((await db.query<{ page: string | null }>("select page from public.feedback")).rows[0]!.page).toBeNull();
  });

  it("limita relatos por conta e sem login", async () => {
    for (let i = 0; i < 5; i++) expect((await send(ANA, "outro", `Relato número ${i} da Ana.`)).ok).toBe(true);
    expect((await send(ANA, "outro", "Mais um relato da Ana.")).error).toMatch(/vários relatos/);
    for (let i = 0; i < 20; i++) expect((await send(null, "outro", `Relato anônimo número ${i}.`)).ok).toBe(true);
    expect((await send(null, "outro", "Mais um relato anônimo.")).error).toMatch(/sem login/);
  });

  it("ninguém lê, altera ou apaga relatos pelo site", async () => {
    await send(ANA, "outro", "Relato privado da Ana.");
    for (const role of ["anon", "authenticated"] as const) {
      const user = role === "anon" ? null : ANA;
      await expect(asRole(db, role, user, (tx) => tx.query("select * from public.feedback"))).rejects.toThrow(/permission denied/);
      await expect(asRole(db, role, user, (tx) => tx.query("update public.feedback set status = 'resolvido'"))).rejects.toThrow(/permission denied/);
      await expect(asRole(db, role, user, (tx) => tx.query("insert into public.feedback (category, message) values ('outro', 'direto na tabela')"))).rejects.toThrow(/permission denied/);
    }
  });
});
