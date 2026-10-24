import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asRole, createTestDb } from "./harness";

let db: PGlite;
const USER = "eeeeeeee-0000-4000-8000-000000000001";

beforeAll(async () => {
  db = await createTestDb();
});

describe("apoio via Pix: tabela de doações", () => {
  it("o navegador (anon ou logado) não lê nem grava doações", async () => {
    for (const [role, uid] of [["anon", null], ["authenticated", USER]] as const) {
      await expect(asRole(db, role, uid, (tx) => tx.query("select * from public.support_donations"))).rejects.toThrow(/permission denied/);
      await expect(
        asRole(db, role, uid, (tx) =>
          tx.query("insert into public.support_donations (id, idempotency_key, amount_cents, expires_at, ip_hash) values (gen_random_uuid(), gen_random_uuid(), 500, now(), 'abcdefgh')"),
        ),
      ).rejects.toThrow(/permission denied/);
    }
  });

  it("recusa valor abaixo de R$ 5,00 e chave de idempotência repetida", async () => {
    await expect(db.query("insert into public.support_donations (id, idempotency_key, amount_cents, expires_at, ip_hash) values (gen_random_uuid(), gen_random_uuid(), 499, now(), 'abcdefgh')")).rejects.toThrow(/check/);
    const key = "22222222-2222-4222-8222-222222222222";
    await db.query("insert into public.support_donations (id, idempotency_key, amount_cents, expires_at, ip_hash) values (gen_random_uuid(), $1, 500, now(), 'abcdefgh')", [key]);
    await expect(db.query("insert into public.support_donations (id, idempotency_key, amount_cents, expires_at, ip_hash) values (gen_random_uuid(), $1, 900, now(), 'abcdefgh')", [key])).rejects.toThrow(/duplicate|unique/);
  });

  it("confirmado exige data de confirmação", async () => {
    await expect(
      db.query("insert into public.support_donations (id, idempotency_key, amount_cents, expires_at, ip_hash, status) values (gen_random_uuid(), gen_random_uuid(), 500, now(), 'abcdefgh', 'confirmado')"),
    ).rejects.toThrow(/check/);
  });
});
