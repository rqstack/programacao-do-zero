import { describe, expect, it } from "vitest";
import { transform } from "sucrase";
import { codeChallenges, sqlChallenges, sqlDataset } from "@content/challenges";
import { xpSources } from "@content/xp-sources";
import { buildCases, makeRng, sameTable, sameValue, solutionCode, starterCode } from "@/lib/challenges/core";
import { applyProgress, emptyProgress, mergeProgress } from "@/lib/progress/model";

const now = new Date("2026-10-21T12:00:00");

describe("desafios de código: conteúdo", () => {
  it("tem ids únicos e no formato das chaves de XP", () => {
    const ids = [...codeChallenges, ...sqlChallenges].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const d of ["facil", "medio", "dificil"] as const) {
      expect(codeChallenges.filter((c) => c.difficulty === d).length).toBeGreaterThanOrEqual(5);
      expect(sqlChallenges.filter((c) => c.difficulty === d).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("gera casos com o número certo de argumentos e a referência responde no tipo certo", () => {
    for (const c of codeChallenges) {
      const cases = buildCases(c, 42, "submit", 30);
      expect(cases.length, c.id).toBeGreaterThan(c.examples.length);
      for (const t of cases) {
        expect(t.args.length, c.id).toBe(c.params.length);
        const kind = c.returns.endsWith("[]") ? "array" : c.returns;
        expect(Array.isArray(t.expected) ? "array" : typeof t.expected, c.id).toBe(kind);
      }
    }
  });

  it("casos variam com a semente (não dá para decorar)", () => {
    const c = codeChallenges.find((x) => x.id === "soma-da-lista")!;
    expect(JSON.stringify(buildCases(c, 1, "submit"))).not.toBe(JSON.stringify(buildCases(c, 2, "submit")));
  });

  it("código inicial em TypeScript é válido e a solução em JS passa nos próprios testes", () => {
    for (const c of codeChallenges) {
      expect(() => transform(starterCode(c, "typescript"), { transforms: ["typescript"] }), c.id).not.toThrow();
      const js = transform(solutionCode(c, "typescript"), { transforms: ["typescript"] }).code;
      const f = new Function(`${js}\nreturn ${c.fn};`)() as (...a: unknown[]) => unknown;
      for (const t of buildCases(c, 7, "submit")) expect(sameValue(f(...structuredClone(t.args)), t.expected), c.id).toBe(true);
    }
  });

  it("todo desafio vira uma fonte de XP", () => {
    const keys = new Set(xpSources().map((s) => s.key));
    for (const c of [...codeChallenges, ...sqlChallenges]) expect(keys.has(`challenge:${c.id}`)).toBe(true);
  });

  it("gera dados SQL com clientes sem pedido", () => {
    const sql = sqlDataset(makeRng(3));
    expect(sql).toContain("insert into clientes");
    expect(sql).toContain("insert into pedidos");
  });
});

describe("comparação de resultados", () => {
  it("tolera arredondamento e compara listas", () => {
    expect(sameValue(0.1 + 0.2, 0.3)).toBe(true);
    expect(sameValue([1, 2], [1, 2])).toBe(true);
    expect(sameValue([1, 2], [2, 1])).toBe(false);
    expect(sameValue("1", 1)).toBe(false);
  });
  it("tabelas: ordem só importa quando pedida; nomes de coluna não importam", () => {
    const a = { columns: ["nome"], rows: [["Ana"], ["Bia"]] };
    const b = { columns: ["n"], rows: [["Bia"], ["Ana"]] };
    expect(sameTable(a, b, false)).toBe(true);
    expect(sameTable(a, b, true)).toBe(false);
    expect(sameTable(a, { columns: ["a", "b"], rows: [["Ana", 1], ["Bia", 2]] }, false)).toBe(false);
  });
});

describe("desafios no progresso", () => {
  it("dá XP uma vez por desafio e registra as linguagens", () => {
    let s = emptyProgress(now);
    const r1 = applyProgress(s, { type: "challenge/solve", id: "fizzbuzz", title: "FizzBuzz", lang: "python", difficulty: "facil" }, now);
    expect(r1.reward.xp).toBe(15);
    expect(r1.reward.achievements.map((a) => a.slug)).toContain("primeiro-desafio");
    s = r1.state;
    const r2 = applyProgress(s, { type: "challenge/solve", id: "fizzbuzz", title: "FizzBuzz", lang: "javascript", difficulty: "facil" }, now);
    expect(r2.reward.xp).toBe(0);
    expect(r2.state.challenges.fizzbuzz!.langs).toEqual(["javascript", "python"]);
  });
  it("revelar a solução antes tira o XP daquele desafio", () => {
    let s = applyProgress(emptyProgress(now), { type: "challenge/reveal", id: "primos-ate-n" }, now).state;
    const r = applyProgress(s, { type: "challenge/solve", id: "primos-ate-n", title: "Primos", lang: "javascript", difficulty: "dificil" }, now);
    expect(r.reward.xp).toBe(0);
    s = r.state;
    expect(s.challenges["primos-ate-n"]!.status).toBe("revealed");
  });
  it("mescla desafios sem perder linguagens", () => {
    const a = applyProgress(emptyProgress(now), { type: "challenge/solve", id: "fizzbuzz", title: "F", lang: "python", difficulty: "facil" }, now).state;
    const b = applyProgress(emptyProgress(now), { type: "challenge/solve", id: "fizzbuzz", title: "F", lang: "sql", difficulty: "facil" }, now).state;
    const m = mergeProgress(a, b);
    expect(m.challenges.fizzbuzz!.langs).toEqual(["python", "sql"]);
    expect(mergeProgress(m, a)).toEqual(m);
  });
});
