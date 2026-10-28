/**
 * Ponta a ponta da Batalha: banco Postgres real (PGlite, com as migrations de produção) +
 * corretor real (Judge0). Faz o mesmo caminho da Edge Function battle-submit.
 * Usa a internet, então só roda com BATTLE_E2E=1:  BATTLE_E2E=1 npx vitest run tests/db/battle-e2e.test.ts
 */
import type { PGlite } from "@electric-sql/pglite";
import { existsSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { withSolution, type BattleChallenge, type BattleLang } from "@battle/battle-core.ts";
import { judgeSubmission } from "@battle/battle-judge.ts";
import { asRole, createTestDb, createUser } from "./harness";

const RUN = process.env.BATTLE_E2E === "1" && existsSync(path.resolve(__dirname, "../../supabase/functions/_shared/battle-bank.ts"));
const ANA = "dddddddd-0000-4000-8000-000000000001";
const BETO = "dddddddd-0000-4000-8000-000000000002";
type J = Record<string, unknown>;

let db: PGlite;
let bank: readonly BattleChallenge[];

const rpc = async (u: string | null, sql: string, params: unknown[] = []) =>
  (await asRole(db, u ? "authenticated" : "service_role", u, async (tx) => (await tx.query<{ r: J }>(sql, params)).rows))[0]!.r;

/** O mesmo fluxo da Edge Function: registra, corrige no Judge0 e grava o veredito. */
async function submit(user: string, match: string, code: string) {
  const reg = await rpc(null, "select public.battle_register_submission($1, $2, $3) as r", [user, match, code]);
  if (!reg.ok) return { error: reg.error as string };
  const ch = bank.find((c) => c.id === reg.challenge_id)!;
  const res = await judgeSubmission({ url: process.env.JUDGE0_URL ?? "https://ce.judge0.com" }, ch, reg.lang as BattleLang, code, Math.floor(Math.random() * 2 ** 31));
  await rpc(null, "select public.battle_complete_submission($1, $2, $3, $4, $5) as r", [reg.submission_id, res.verdict, res.passed, res.total, res.message]);
  return res;
}

async function newMatch(langA: BattleLang, langB: BattleLang) {
  await db.exec("update public.battle_participants set active = false; delete from public.battle_queue;");
  expect((await rpc(ANA, "select public.battle_join_queue($1) as r", [langA])).state).toBe("fila");
  const m = await rpc(BETO, "select public.battle_join_queue($1) as r", [langB]);
  expect(m.state).toBe("partida");
  const id = m.match_id as string;
  // Pula a contagem de 5 s.
  await db.query("update public.battle_matches set starts_at = now() - interval '1 second' where id = $1", [id]);
  const a = await rpc(ANA, "select public.battle_state($1, 'resolvendo') as r", [id]);
  const b = await rpc(BETO, "select public.battle_state($1, 'resolvendo') as r", [id]);
  expect(a.challenge).toEqual(b.challenge);
  const ch = bank.find((c) => c.id === (a.challenge as J).id)!;
  return { id, ch };
}

describe.skipIf(!RUN)("Batalha de ponta a ponta (Judge0 real)", () => {
  beforeAll(async () => {
    const bankModule = "@battle/" + "battle-bank.ts"; // privado: fora do Git e do CI
    bank = ((await import(/* @vite-ignore */ bankModule)) as { battleBank: BattleChallenge[] }).battleBank;
    db = await createTestDb({ battle: true });
    await createUser(db, ANA, { full_name: "Ana" });
    await createUser(db, BETO, { full_name: "Beto" });
  });

  it("código errado é recusado; o correto (outra linguagem) vence e ganha troféus", async () => {
    const { id, ch } = await newMatch("java", "python");
    const wrong = await submit(ANA, id, withSolution(ch.signature, "java", ch.signature.returns === "str" ? '        return "x";' : ch.signature.returns === "bool" ? "        return false;" : ch.signature.returns === "int[]" ? "        return new int[0];" : "        return 12345;"));
    expect("verdict" in wrong && wrong.verdict).toBe("resposta_errada");
    expect((await rpc(ANA, "select public.battle_state($1) as r", [id])).status).toBe("em_andamento");

    const ok = await submit(BETO, id, withSolution(ch.signature, "python", ch.solutions.python));
    expect("verdict" in ok && ok.verdict).toBe("aceito");
    const b = await rpc(BETO, "select public.battle_state($1) as r", [id]);
    expect(b).toMatchObject({ status: "finalizada", result: "vitoria", winner: "eu" });
    expect((b.me as J).trophy_delta).toBe(30);
    const a = await rpc(ANA, "select public.battle_state($1) as r", [id]);
    expect(a.winner).toBe("adversario");
    expect((a.opponent as J).final_code).toContain("def resolver");
  });

  it("erro de compilação não conta como vitória e a pessoa pode tentar de novo", async () => {
    const { id, ch } = await newMatch("c", "javascript");
    const broken = await submit(ANA, id, "int main( { nao compila");
    expect("verdict" in broken && broken.verdict).toBe("erro_compilacao");
    await db.query("update public.battle_submissions set submitted_at = now() - interval '10 seconds' where match_id = $1", [id]);
    const ok = await submit(ANA, id, withSolution(ch.signature, "c", ch.solutions.c));
    expect("verdict" in ok && ok.verdict).toBe("aceito");
    expect(await rpc(ANA, "select public.battle_state($1) as r", [id])).toMatchObject({ winner: "eu" });
  });

  it("laço infinito é cortado pelo limite de tempo e não trava a partida", async () => {
    const { id, ch } = await newMatch("javascript", "c");
    const loop = await submit(ANA, id, withSolution(ch.signature, "javascript", "  while (true) {}"));
    expect("verdict" in loop && loop.verdict).toBe("tempo_excedido");
    const ok = await submit(BETO, id, withSolution(ch.signature, "c", ch.solutions.c));
    expect("verdict" in ok && ok.verdict).toBe("aceito");
  });

  it("dois envios corretos ao mesmo tempo: vence o registrado primeiro", async () => {
    const { id, ch } = await newMatch("python", "java");
    const [ra, rb] = await Promise.all([
      submit(ANA, id, withSolution(ch.signature, "python", ch.solutions.python)),
      submit(BETO, id, withSolution(ch.signature, "java", ch.solutions.java)),
    ]);
    expect("verdict" in ra && ra.verdict).toBe("aceito");
    expect("verdict" in rb && rb.verdict).toBe("aceito");
    const first = (await db.query<{ user_id: string }>("select user_id from public.battle_submissions where match_id = $1 order by submitted_at, id limit 1", [id])).rows[0]!.user_id;
    const winner = (await db.query<{ winner_id: string }>("select winner_id from public.battle_matches where id = $1", [id])).rows[0]!.winner_id;
    expect(winner).toBe(first);
  });

  it("o código tentando acessar a rede não consegue", async () => {
    const { id, ch } = await newMatch("python", "python");
    const body = '    import urllib.request\n    urllib.request.urlopen("https://example.com", timeout=3)\n    return 0';
    const r = await submit(ANA, id, withSolution(ch.signature, "python", body));
    expect("verdict" in r && r.verdict).not.toBe("aceito");
  });
});
