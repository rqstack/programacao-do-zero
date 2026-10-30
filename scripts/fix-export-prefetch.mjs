// Corrige os arquivos de pré-carregamento do export estático do Next 16.
//
// O build grava `pagina/__next.pagina/__PAGE__.txt`, mas o navegador pede
// `pagina/__next.pagina.__PAGE__.txt` (barras viram pontos). No GitHub Pages isso dava 404
// no console a cada link visível e desligava o pré-carregamento (a página abria, só que mais
// devagar). Este script cria a cópia com o nome que o navegador procura. Só adiciona
// arquivos dentro de out/; não altera nem apaga nada. Roda sozinho depois de `npm run build`.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "out";
if (!existsSync(root)) process.exit(0);

let created = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(full, dir, name);
    else walk(full);
  }
}
// Copia cada arquivo de `pai/__next.x/a/b.txt` para `pai/__next.x.a.b.txt`.
function flatten(dir, parent, prefix) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const flat = `${prefix}.${name}`;
    if (statSync(full).isDirectory()) flatten(full, parent, flat);
    else {
      const target = path.join(parent, flat);
      if (!existsSync(target)) {
        copyFileSync(full, target);
        created++;
      }
    }
  }
}

walk(root);
console.log(`pré-carregamento: ${created} arquivo(s) com o nome esperado pelo navegador`);
