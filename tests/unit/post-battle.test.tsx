import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostBattleReview, RematchPanel } from "@/components/battle/post-battle";
import type { MatchState } from "@/lib/battle/api";

const base: MatchState = {
  match_id: "m1",
  kind: "amistosa",
  status: "finalizada",
  result: "vitoria",
  winner: "adversario",
  server_now: "2026-10-26T10:00:00Z",
  starts_at: "2026-10-26T09:55:00Z",
  ends_at: "2026-10-26T09:58:00Z",
  finished_at: "2026-10-26T09:57:00Z",
  arena: { id: 1, name: "Terminal Inicial", tier: 1 },
  challenge: {
    id: "par-ou-impar",
    tier: 1,
    title: "Par ou ímpar?",
    statement: "Devolva `par` ou `impar`.",
    constraints: [],
    signature: { params: [{ name: "n", type: "int" }], returns: "str" },
    examples: [],
  } as unknown as MatchState["challenge"],
  me: { lang: "python", trophies_before: 0, trophy_delta: 0, final_code: "def resolver(n):\n    return 'par'" },
  review: { idea: "Use o resto da divisão por 2.", steps: ["Calcule n % 2."], pitfalls: ["Negativos."], study: ["condicionais"] },
  rematch: { status: "nenhum", match_id: null, expires_at: null, opponent_available: true },
  opponent: { name: "Beto", username: null, avatar_url: null, lang: "javascript", trophies_before: 0, trophy_delta: 0, state: "concluido", submissions: 1, final_code: "return n % 2 === 0 ? 'par' : 'impar';", final_accepted: true },
  my_submissions: [
    { id: 1, status: "resposta_errada", passed: 2, total: 5, message: null, submitted_at: "2026-10-26T09:56:00Z" },
    { id: 2, status: "erro_execucao", passed: 0, total: 5, message: "NameError: name 'x' is not defined", submitted_at: "2026-10-26T09:56:30Z" },
  ] as MatchState["my_submissions"],
};

describe("revisão pós-batalha", () => {
  it("mostra testes, erros explicados, a lógica, uma solução aceita e o que estudar", () => {
    const html = renderToStaticMarkup(createElement(PostBattleReview, { st: base }));
    expect(html).toContain("2/5 testes");
    expect(html).toContain("O que isso quer dizer");
    expect(html).toContain("Use o resto da divisão por 2.");
    expect(html).toContain("Uma solução aceita, em JavaScript");
    expect(html).toContain("/busca?q=condicionais");
  });
  it("sem solução aceita do adversário, avisa que o envio dele não passou", () => {
    const html = renderToStaticMarkup(createElement(PostBattleReview, { st: { ...base, opponent: { ...base.opponent, final_accepted: false } } }));
    expect(html).toContain("não passou em todos os testes");
  });
});

describe("painel de revanche", () => {
  const render = (info: MatchState["rematch"]) => renderToStaticMarkup(createElement(RematchPanel, { matchId: "m1", info, opponentName: "Beto", onUpdate: () => undefined }));
  it("explica quando o adversário não está disponível", () => {
    expect(render({ status: "nenhum", match_id: null, expires_at: null, opponent_available: false })).toContain("saiu da tela da partida");
  });
  it("mostra aceitar e recusar para quem recebeu o pedido", () => {
    const html = render({ status: "pedido_pelo_adversario", match_id: null, expires_at: null, opponent_available: true });
    expect(html).toContain("Aceitar");
    expect(html).toContain("Recusar");
  });
});
