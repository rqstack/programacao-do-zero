// Gera o site estático e publica a pasta out/ na branch gh-pages do GitHub.
// Uso: npm run deploy   (requer permissão de push no repositório "origin")
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const repoUrl = execSync("git remote get-url origin").toString().trim();
const repoName = path.basename(repoUrl).replace(/\.git$/, "");

run("npm run build", { env: { ...process.env, NEXT_PUBLIC_BASE_PATH: `/${repoName}`, MSYS_NO_PATHCONV: "1" } });

// O GitHub Pages ignora pastas que começam com "_" (como _next) sem este arquivo.
writeFileSync("out/.nojekyll", "");

const dir = mkdtempSync(path.join(tmpdir(), "pdz-pages-"));
try {
  cpSync("out", dir, { recursive: true });
  const git = (cmd) => run(`git ${cmd}`, { cwd: dir });
  git("init -q -b gh-pages");
  git("add -A");
  git('commit -q -m "Publicação do site estático"');
  git(`push -f "${repoUrl}" gh-pages`);
  console.log(`\nPublicado em https://${repoUrl.split("/").at(-2)}.github.io/${repoName}/`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
