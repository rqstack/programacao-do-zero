/**
 * MODELO PÚBLICO do banco da Batalha de Código.
 * O banco de verdade (supabase/functions/_shared/battle-bank.ts) é privado e fica fora do Git,
 * para ninguém copiar as soluções no meio de uma partida. Para rodar sua própria cópia:
 *   cp supabase/functions/_shared/battle-bank.example.ts supabase/functions/_shared/battle-bank.ts
 * e escreva seus desafios no mesmo formato (veja BattleChallenge em battle-core.ts).
 * Valide no executor com `npm run battle:validate`.
 */
import type { BattleChallenge } from "./battle-core.ts";

export const battleBank: readonly BattleChallenge[] = [
  {
    id: "maior-de-dois",
    tier: 1,
    title: "O maior de dois",
    statement: "Complete `resolver(a, b)` para devolver o **maior** dos dois números.\n\nSe forem iguais, devolva qualquer um deles (são o mesmo valor).",
    constraints: ["-1000 ≤ a, b ≤ 1000"],
    signature: { params: [{ name: "a", type: "int" }, { name: "b", type: "int" }], returns: "int" },
    examples: [[3, 9], [-2, -7]],
    edge: [[5, 5], [-1000, 1000]],
    generate: (r) => [r.int(-1000, 1000), r.int(-1000, 1000)],
    randomCases: 20,
    reference: ((a: number, b: number) => (a > b ? a : b)) as never,
    solutions: {
      javascript: "  return a > b ? a : b;",
      python: "    return a if a > b else b",
      java: "        return a > b ? a : b;",
      c: "    return a > b ? a : b;",
    },
  },
  {
    id: "soma-ate-n",
    tier: 2,
    title: "Soma de 1 até N",
    statement: "Complete `resolver(n)` para devolver `1 + 2 + 3 + ... + n`.\n\nPara `n = 0`, a soma é `0`.",
    constraints: ["0 ≤ n ≤ 20.000"],
    signature: { params: [{ name: "n", type: "int" }], returns: "int" },
    examples: [[4], [10]],
    edge: [[0], [1], [20000]],
    generate: (r) => [r.int(0, 20_000)],
    randomCases: 15,
    reference: ((n: number) => (n * (n + 1)) / 2) as never,
    solutions: {
      javascript: "  let soma = 0;\n  for (let i = 1; i <= n; i++) soma += i;\n  return soma;",
      python: "    soma = 0\n    for i in range(1, n + 1):\n        soma += i\n    return soma",
      java: "        int soma = 0;\n        for (int i = 1; i <= n; i++) soma += i;\n        return soma;",
      c: "    int soma = 0;\n    for (int i = 1; i <= n; i++) soma += i;\n    return soma;",
    },
  },
];
