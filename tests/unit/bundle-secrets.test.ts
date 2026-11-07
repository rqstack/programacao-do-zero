import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = path.resolve("scripts/check-bundle-secrets.mjs");
let dir = "";
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

// JWT de mentira, só com o papel no payload (assinatura falsa).
const jwt = (role: string) => {
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b({ alg: "HS256", typ: "JWT" })}.${b({ iss: "supabase", role })}.assinatura-falsa-de-teste`;
};

function run(files: Record<string, string>) {
  dir = mkdtempSync(path.join(tmpdir(), "pdz-secrets-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  }
  try {
    return { ok: true, out: execFileSync(process.execPath, [script, dir], { encoding: "utf8", stdio: "pipe" }) };
  } catch (e) {
    return { ok: false, out: String((e as { stderr?: string }).stderr ?? e) };
  }
}

describe("conferência de segredos no pacote do site", () => {
  it("aceita a chave anon e o texto das aulas que cita service_role", () => {
    const r = run({ "index.html": `<p>Nunca use a chave service_role no navegador.</p><script>k="${jwt("anon")}"</script>` });
    expect(r.ok, r.out).toBe(true);
  });

  it("barra um JWT service_role", () => {
    const r = run({ "_next/static/app.js": `const k="${jwt("service_role")}";` });
    expect(r.ok).toBe(false);
    expect(r.out).toContain("service_role");
  });

  it("barra chave sb_secret_ e source map", () => {
    expect(run({ "a.js": "x='sb_secret_abcdefghijklmnop'" }).ok).toBe(false);
    expect(run({ "_next/static/app.js.map": "{}" }).ok).toBe(false);
  });
});
