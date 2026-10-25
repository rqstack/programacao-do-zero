/**
 * Gera o pacote da Edge Function battle-submit (um único index.js) SEM as soluções de
 * referência do banco privado: elas só servem para validar o banco no Judge0
 * (npm run battle:validate) e não precisam ir para o servidor.
 * Uso: npx tsx scripts/bundle-battle-submit.mts <arquivo-de-saída>
 */
import { readFileSync } from "node:fs";
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
const vazou = /partition_point|sort\.SearchInts|bisect_left|System\.out/.test(bundle);
console.log(`${out}: ${(bundle.length / 1024).toFixed(1)} KB${vazou ? " — ATENÇÃO: ainda há código de solução no pacote!" : " — sem soluções"}`);
process.exit(vazou ? 1 : 0);
