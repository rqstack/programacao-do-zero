import { describe, expect, it } from "vitest";
import { BUGS, fixedCode, runBugCode } from "@content/games/bugs";

const outcome = (code: readonly string[], fn: string, args: unknown[]) => {
  try {
    return { ok: true as const, v: JSON.stringify(runBugCode(code, fn, args)) ?? "undefined" };
  } catch (e) {
    return { ok: false as const, v: String(e) };
  }
};

describe("banco do Caça aos bugs", () => {
  it("tem ids únicos, todos os níveis e um conceito por bug", () => {
    expect(new Set(BUGS.map((b) => b.id)).size).toBe(BUGS.length);
    for (const d of [1, 2, 3]) expect(BUGS.filter((b) => b.difficulty === d).length).toBeGreaterThanOrEqual(8);
  });

  it.each(BUGS.map((b) => [b.id, b] as const))("%s: a correção passa em todos os casos e o bug falha em pelo menos um", (_id, b) => {
    expect(b.line).toBeGreaterThanOrEqual(1);
    expect(b.line).toBeLessThanOrEqual(b.code.length);
    expect(b.code[b.line - 1]).not.toBe(b.fix);
    const fixed = fixedCode(b);
    let failures = 0;
    for (const args of b.cases) {
      const good = outcome(fixed, b.fn, args);
      expect(good.ok, `${b.id} ${JSON.stringify(args)}: ${good.v}`).toBe(true);
      const bad = outcome(b.code, b.fn, args);
      if (!bad.ok || bad.v !== good.v) failures++;
    }
    expect(failures, `${b.id}: o código com bug passa em todos os casos`).toBeGreaterThan(0);
  });
});
