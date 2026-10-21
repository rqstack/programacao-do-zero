import { describe, expect, it } from "vitest";
import { gradeRound, validateRound } from "@/lib/games/engine";
import { minimumBlocks, runRobot } from "@/lib/games/robot";
import { runQuery, sameResult, toSql } from "@/lib/games/sql-mini";
import { games } from "@content/index";

const curva = { prompt: "x", grid: ["#####", "#S..#", "###.#", "###G#", "#####"], facing: "E" as const, maxBlocks: 5 };

describe("robô programador", () => {
  it("chega ao objetivo com o programa certo", () => {
    const run = runRobot(curva, [
      { cmd: "frente", times: 2 },
      { cmd: "direita", times: 1 },
      { cmd: "frente", times: 2 },
    ]);
    expect(run.outcome).toBe("goal");
    expect(run.steps.at(-1)).toMatchObject({ x: 3, y: 3 });
  });

  it("bate na parede e para", () => {
    const run = runRobot(curva, [{ cmd: "frente", times: 5 }]);
    expect(run.outcome).toBe("crash");
    expect(run.steps.at(-1)).toMatchObject({ x: 3, y: 1 });
  });

  it("calcula a menor solução e pontua pelo par", () => {
    expect(minimumBlocks(curva)).toBe(3);
    const round = { payload: curva, solution: { par: 3 }, points: 10, explanation: "" };
    const enxuto = gradeRound("logic", round, null, { program: [{ cmd: "frente", times: 2 }, { cmd: "direita", times: 1 }, { cmd: "frente", times: 2 }] });
    expect(enxuto.ok && enxuto.pointsDelta).toBe(10);
    const longo = gradeRound("logic", round, null, {
      program: [{ cmd: "frente", times: 1 }, { cmd: "frente", times: 1 }, { cmd: "direita", times: 1 }, { cmd: "frente", times: 2 }],
    });
    expect(longo.ok && longo.pointsDelta).toBe(7);
    expect(gradeRound("logic", round, null, { program: Array(6).fill({ cmd: "frente", times: 1 }) })).toEqual({ ok: false, error: "invalid_answer" });
  });

  it("recusa labirintos sem solução ou com par errado", () => {
    expect(validateRound("logic", { ...curva, grid: ["#####", "#S#G#", "#####"] }, { par: 1 }).ok).toBe(false);
    expect(validateRound("logic", curva, { par: 2 }).ok).toBe(false);
    expect(validateRound("logic", curva, { par: 3 }).ok).toBe(true);
  });
});

const produtos = {
  name: "produtos",
  columns: ["nome", "preco"],
  rows: [
    ["Teclado", 150],
    ["Mouse", 80],
    ["Monitor", 900],
  ],
};

describe("mini SQL", () => {
  it("filtra, ordena e limita", () => {
    const r = runQuery([produtos], { table: "produtos", columns: ["nome"], where: { column: "preco", op: ">", value: 100 }, orderBy: { column: "preco", dir: "DESC" }, limit: 1 });
    expect(r).toEqual({ ok: true, result: { columns: ["nome"], rows: [["Monitor"]] } });
  });

  it("acusa coluna ou tabela inexistente", () => {
    expect(runQuery([produtos], { table: "produto", columns: ["nome"], where: null, orderBy: null, limit: null }).ok).toBe(false);
    expect(runQuery([produtos], { table: "produtos", columns: ["valor"], where: null, orderBy: null, limit: null }).ok).toBe(false);
  });

  it("compara resultados com e sem ordem", () => {
    const a = { columns: ["n"], rows: [["x"], ["y"]] };
    const b = { columns: ["n"], rows: [["y"], ["x"]] };
    expect(sameResult(a, b, false)).toBe(true);
    expect(sameResult(a, b, true)).toBe(false);
  });

  it("gera o SQL equivalente", () => {
    expect(toSql({ table: "clientes", columns: ["nome"], where: { column: "cidade", op: "=", value: "Recife" }, orderBy: null, limit: null })).toBe(
      "SELECT nome\nFROM clientes\nWHERE cidade = 'Recife';",
    );
  });

  it("o gabarito de cada rodada do jogo acerta a si mesmo", () => {
    const g = games.find((x) => x.kind === "sql")!;
    for (const r of g.rounds) {
      const out = gradeRound("sql", { payload: r.payload, solution: r.solution, points: 10, explanation: "" }, null, r.solution);
      expect(out.ok && out.correctDelta).toBe(1);
    }
  });
});

describe("chuva de código", () => {
  const round = { payload: { statement: "x" }, solution: { truth: true }, points: 5, explanation: "" };
  it("acerta, erra e deixa cair", () => {
    expect(gradeRound("lightning", round, null, { value: true }).ok && true).toBe(true);
    const caiu = gradeRound("lightning", round, null, { value: null });
    expect(caiu.ok && caiu.correctDelta).toBe(0);
    expect(caiu.ok && caiu.feedback.kind === "rain" && caiu.feedback.timedOut).toBe(true);
  });
});

describe("seletor ao vivo", () => {
  it("não aceita o atalho data-alvo", () => {
    const round = { payload: { prompt: "x", html: "<p data-alvo>a</p>" }, solution: { selector: "p" }, points: 10, explanation: "" };
    expect(gradeRound("css", round, null, { selector: "[data-alvo]", hit: true })).toEqual({ ok: false, error: "invalid_answer" });
    expect(gradeRound("css", round, null, { selector: "p", hit: true }).ok).toBe(true);
  });
});
