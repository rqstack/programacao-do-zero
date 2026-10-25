import { afterEach, describe, expect, it, vi } from "vitest";
import { codeChallenges } from "@content/challenges";
import { ARENAS, BATTLE_LANGS, LANG_INFO, starterCode, type Signature } from "@battle/battle-core.ts";
import { remoteSignature, REMOTE_LANGS, runRemote } from "@/lib/challenges/remote";
import { starterCode as challengeStarter } from "@/lib/challenges/core";
import { CHALLENGE_LANGS } from "@/lib/challenges/langs";

const SIGS: Signature[] = [
  { params: [{ name: "a", type: "int" }, { name: "b", type: "int" }], returns: "int" },
  { params: [{ name: "texto", type: "str" }], returns: "str" },
  { params: [{ name: "s", type: "str" }], returns: "bool" },
  { params: [{ name: "v", type: "int[]" }, { name: "k", type: "int" }], returns: "int[]" },
  { params: [{ name: "notas", type: "int[]" }], returns: "float" },
];

describe("linguagens da Batalha", () => {
  it("tem 10 linguagens, cada uma com executor configurado", () => {
    expect(BATTLE_LANGS).toHaveLength(10);
    for (const l of BATTLE_LANGS) {
      expect(LANG_INFO[l].judge0Id).toBeGreaterThan(0);
      expect(LANG_INFO[l].cpuSeconds * 3).toBeGreaterThan(0);
    }
  });

  it("gera o programa inicial em todas as linguagens e tipos, com o marcador da solução", () => {
    for (const sig of SIGS) {
      for (const l of BATTLE_LANGS) {
        const code = starterCode(sig, l);
        expect(code, `${l} ${sig.returns}`).toContain("escreva sua solução aqui");
        expect(code).toMatch(/resolver\(/);
      }
    }
  });

  it("troca o nome da função quando pedido (desafios usam o nome do enunciado)", () => {
    for (const l of BATTLE_LANGS) {
      const code = starterCode(SIGS[0]!, l, "somaDois");
      expect(code).toContain("somaDois(");
      expect(code).not.toMatch(/\bresolver\(/);
    }
  });

  it("tem 9 arenas em ordem crescente de troféus e nível", () => {
    expect(ARENAS).toHaveLength(9);
    ARENAS.forEach((a, i) => {
      expect(a.id).toBe(i + 1);
      expect(a.tier).toBe(i + 1);
      if (i > 0) expect(a.minTrophies).toBeGreaterThan(ARENAS[i - 1]!.minTrophies);
    });
  });
});

describe("desafios em linguagens compiladas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("todas as linguagens novas estão no modelo de progresso", () => {
    for (const l of REMOTE_LANGS) expect(CHALLENGE_LANGS).toContain(l);
  });

  it("todos os desafios atuais têm assinatura compatível e código inicial em cada linguagem", () => {
    for (const ch of codeChallenges) {
      const sig = remoteSignature(ch);
      expect(sig, ch.id).not.toBeNull();
      for (const l of REMOTE_LANGS) expect(challengeStarter(ch, l)).toContain(`${ch.fn}(`);
    }
    expect(remoteSignature(codeChallenges.find((c) => c.id === "media-das-notas")!)!.returns).toBe("float");
  });

  const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
  const judge = (body: object) => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })));

  it("lê uma resposta por linha conforme o tipo de retorno", async () => {
    const ch = codeChallenges.find((c) => c.id === "rotacionar-lista")!;
    judge({ status: { id: 3, description: "Accepted" }, stdout: b64("4 1 2 3\n\n7 8\n"), stderr: b64("depurando\n") });
    const out = await runRemote(ch, "go", "codigo", [[[1, 2, 3, 4], 1], [[], 3], [[7, 8], 0]]);
    expect(out).toEqual({ ok: true, logs: ["depurando"], results: [{ ok: true, value: [4, 1, 2, 3] }, { ok: true, value: [] }, { ok: true, value: [7, 8] }] });
  });

  it("mantém espaços em respostas de texto e acusa caso sem resposta", async () => {
    const ch = codeChallenges.find((c) => c.id === "inverter-texto")!;
    judge({ status: { id: 3, description: "Accepted" }, stdout: b64(" ab \n") });
    const out = await runRemote(ch, "c", "codigo", [[" ba "], ["x"]]);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.results[0]).toEqual({ ok: true, value: " ab " });
      expect(out.results[1]!.ok).toBe(false);
    }
  });

  it("mostra erro de compilação, tempo esgotado e falha de rede de forma amigável", async () => {
    const ch = codeChallenges.find((c) => c.id === "soma-da-lista")!;
    judge({ status: { id: 6, description: "Compilation Error" }, compile_output: b64("main.cpp:3: error: expected ';'") });
    let out = await runRemote(ch, "cpp", "x", [[[1]]]);
    expect(out.ok === false && out.error).toContain("Erro de compilação");
    judge({ status: { id: 5, description: "Time Limit Exceeded" } });
    out = await runRemote(ch, "rust", "x", [[[1]]]);
    expect(out.ok === false && out.error).toContain("Tempo esgotado");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    out = await runRemote(ch, "php", "x", [[[1]]]);
    expect(out.ok === false && out.error).toContain("Não foi possível falar");
  });
});
