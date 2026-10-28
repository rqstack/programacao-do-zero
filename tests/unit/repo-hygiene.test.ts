import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Guarda contra segredos no Git: nenhum .env versionado (só o exemplo, sem valores reais). */
const ROOT = path.resolve(__dirname, "../..");
const tracked = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);

const SECRET_PATTERNS: Array<[string, RegExp]> = [
  ["chave secreta do Supabase", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["token JWT", /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/],
  ["chave privada", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["token do GitHub", /ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/],
  ["segredo OAuth do Google", /GOCSPX-[A-Za-z0-9_-]{20,}/],
];

describe("higiene do repositório", () => {
  it("nenhum arquivo .env é versionado, exceto .env.example", () => {
    const envs = tracked.filter((f) => /(^|\/)\.env(\.|$)/.test(f));
    expect(envs).toEqual([".env.example"]);
  });

  it(".env.example só tem nomes de variáveis, sem chaves reais", () => {
    const text = readFileSync(path.join(ROOT, ".env.example"), "utf8");
    for (const line of text.split("\n").filter((l) => /^[A-Z_]+=/.test(l))) {
      expect(line.split("=")[1]!.trim(), line.split("=")[0]).toMatch(/^$|^https:\/\/seu-projeto|^sua[-_]|^<|^cole-aqui/i);
    }
  });

  it("nenhum arquivo versionado contém padrões de credencial", () => {
    const hits: string[] = [];
    for (const f of tracked) {
      if (/\.(png|jpg|jpeg|gif|ico|pdf|woff2?|ttf|wasm|lock)$/i.test(f) || f.endsWith("package-lock.json")) continue;
      let text = "";
      try {
        text = readFileSync(path.join(ROOT, f), "utf8");
      } catch {
        continue;
      }
      for (const [name, re] of SECRET_PATTERNS) if (re.test(text)) hits.push(`${f}: ${name}`);
    }
    expect(hits).toEqual([]);
  });
});
