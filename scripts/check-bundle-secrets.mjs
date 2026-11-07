// Confere a pasta out/ antes de publicar: nenhuma chave secreta e nenhum source map.
// A chave "anon" do Supabase é pública (vai no site de propósito) e é aceita; qualquer outro
// JWT (por exemplo service_role), chave sb_secret_, chave privada ou token conhecido barra a publicação.
// Uso: node scripts/check-bundle-secrets.mjs [pasta]   (padrão: out)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "out";
if (!existsSync(root)) {
  console.error(`pasta ${root} não encontrada`);
  process.exit(1);
}

const TEXT = /\.(html|js|mjs|css|txt|json|xml|svg|webmanifest)$/i;
const patterns = [
  ["chave secreta do Supabase", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["chave privada", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["token do GitHub", /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ["chave de API secreta", /\bsk_(?:live|test)_[A-Za-z0-9]{16,}/],
];
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]{10,}/g;

const problems = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    const rel = path.relative(root, full);
    if (name.endsWith(".map")) {
      problems.push(`${rel}: source map publicado`);
      continue;
    }
    if (!TEXT.test(name)) continue;
    const text = readFileSync(full, "utf8");
    for (const [label, re] of patterns) if (re.test(text)) problems.push(`${rel}: ${label}`);
    for (const m of text.matchAll(JWT)) {
      let role = "?";
      try {
        role = JSON.parse(Buffer.from(m[1], "base64url").toString("utf8")).role ?? "?";
      } catch {
        // payload ilegível: trata como suspeito
      }
      if (role !== "anon") problems.push(`${rel}: JWT com papel "${role}"`);
    }
  }
}
walk(root);

if (problems.length) {
  console.error(`Publicação barrada: ${problems.length} problema(s) no pacote:`);
  for (const p of problems.slice(0, 20)) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("pacote sem segredos nem source maps");
