/**
 * Gera o pacote da Edge Function battle-submit (um único index.js) SEM as soluções de
 * referência do banco privado: elas só servem para validar o banco no Judge0
 * (npm run battle:validate) e não precisam ir para o servidor.
 * Uso: npx tsx scripts/bundle-battle-submit.mts <arquivo-de-saída>
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build, type Plugin } from "esbuild";
import ts from "typescript";

const out = process.argv[2] ?? "battle-submit.bundle.js";

/** Remove as propriedades `solutions: {...}` e esvazia o mapa `novas`. */
function semSolucoes(code: string, file: string): string {
  const src = ts.createSourceFile(file, code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const cortes: Array<[number, number, string]> = [];
  const visitar = (n: ts.Node) => {
    if (ts.isPropertyAssignment(n) && n.name.getText(src) === "solutions" && ts.isObjectLiteralExpression(n.initializer)) {
      cortes.push([n.initializer.getStart(src), n.initializer.getEnd(), "{}"]);
      return;
    }
    if (ts.isVariableDeclaration(n) && n.name.getText(src) === "novas" && n.initializer) {
      cortes.push([n.initializer.getStart(src), n.initializer.getEnd(), "{}"]);
      return;
    }
    ts.forEachChild(n, visitar);
  };
  visitar(src);
  let r = code;
  for (const [a, b, t] of cortes.sort((x, y) => y[0] - x[0])) r = r.slice(0, a) + t + r.slice(b);
  return r;
}

const removerSolucoes: Plugin = {
  name: "remover-solucoes",
  setup(b) {
    b.onLoad({ filter: /battle-bank\.ts$/ }, (args) => ({ contents: semSolucoes(readFileSync(args.path, "utf8"), args.path), loader: "ts" }));
  },
};

await build({
  entryPoints: ["supabase/functions/battle-submit/index.ts"],
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["jsr:*", "npm:*"],
  outfile: out,
  plugins: [removerSolucoes],
  logLevel: "warning",
});
const bundle = readFileSync(out, "utf8");
// Prova de que nenhuma solução vai ao servidor: monta só o banco com o mesmo corte, carrega
// o resultado e exige que todo desafio fique com `solutions` vazio. (A referência em JS
// continua: o servidor precisa dela para calcular as respostas esperadas.)
const tmp = mkdtempSync(path.join(tmpdir(), "pdz-banco-"));
let semSolucao = 0;
const comSolucao: string[] = [];
try {
  const banco = path.join(tmp, "banco.mjs");
  await build({ entryPoints: ["supabase/functions/_shared/battle-bank.ts"], bundle: true, format: "esm", platform: "neutral", outfile: banco, plugins: [removerSolucoes], logLevel: "warning" });
  const { battleBank } = (await import(pathToFileURL(banco).href)) as { battleBank: Array<{ id: string; solutions?: Record<string, unknown> }> };
  for (const ch of battleBank) {
    if (Object.keys(ch.solutions ?? {}).length === 0) semSolucao++;
    else comSolucao.push(ch.id);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
const vazou = comSolucao.length > 0 || semSolucao === 0 || /partition_point|sort\.SearchInts|bisect_left|System\.out/.test(bundle);
console.log(`${out}: ${(bundle.length / 1024).toFixed(1)} KB — ${semSolucao} desafios sem soluções${vazou ? ` — ATENÇÃO: há código de solução no pacote (${comSolucao.slice(0, 5).join(", ") || "padrão conhecido"})!` : ""}`);
if (vazou) {
  rmSync(out, { force: true }); // nunca deixa um pacote com soluções no disco
  process.exit(1);
}
