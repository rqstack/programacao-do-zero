// Confere, no site estático gerado em out/, se todo link interno e todo arquivo
// referenciado (href/src) existe. Uso: node scripts/check-links.mjs [basePath]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

function resolves(urlPath) {
  let p = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (base) {
    if (!p.startsWith(base + "/") && p !== base) return false;
    p = p.slice(base.length) || "/";
  }
  const target = path.join(OUT, p);
  if (p.endsWith("/")) return existsSync(path.join(target, "index.html"));
  return existsSync(target) || existsSync(`${target}.html`) || existsSync(path.join(target, "index.html"));
}

const broken = new Map();
const files = htmlFiles(OUT);
for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const url = m[1];
    if (url.startsWith("//")) continue;
    if (!resolves(url)) {
      const from = path.relative(OUT, file);
      broken.set(url, [...(broken.get(url) ?? []), from]);
    }
  }
}

if (broken.size > 0) {
  console.error(`${broken.size} link(s) quebrado(s):`);
  for (const [url, from] of broken) console.error(`  ${url}  (em ${from.slice(0, 3).join(", ")}${from.length > 3 ? "..." : ""})`);
  process.exit(1);
}
console.log(`Links OK: ${files.length} páginas verificadas${base ? ` (base ${base})` : ""}.`);
