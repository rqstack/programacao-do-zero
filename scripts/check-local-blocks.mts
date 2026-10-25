/**
 * Roda localmente cada bloco ```python ou ```csharp de uma trilha que é seguido de
 * "Saída:" + bloco ```texto, e compara a saída real com a do texto.
 * Python usa o `python` instalado; C# usa `dotnet run arquivo.cs` (.NET 10+).
 * Uso: npx tsx scripts/check-local-blocks.mts <trilha> [--mostrar]
 *   --mostrar imprime a saída real de cada bloco (para conferir e escrever a aula).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const slug = process.argv[2];
const mostrar = process.argv.includes("--mostrar");
if (!slug) throw new Error("informe a trilha");
const md = readFileSync(`content/courses/${slug}/aulas.md`, "utf8").replace(/\r/g, "");
// O código do bloco não pode conter ``` (assim a busca não atravessa de um bloco para o outro).
const re = /```(python|csharp)\n((?:(?!```)[\s\S])*?)```\s*\n+Saída:\s*\n+```texto\n([\s\S]*?)```/g;
const norm = (s: string) => s.replace(/\r/g, "").replace(/[ \t]+$/gm, "").trimEnd();
let falhas = 0;
let n = 0;
for (const m of md.matchAll(re)) {
  n++;
  const [, lang, code, esperado] = m;
  const dir = mkdtempSync(path.join(tmpdir(), "pdz-bloco-"));
  let saida = "";
  try {
    if (lang === "python") {
      const f = path.join(dir, "main.py");
      writeFileSync(f, code!);
      saida = execFileSync("python", ["-X", "utf8", f], { cwd: dir, encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8" }, timeout: 30_000 });
    } else {
      const f = path.join(dir, "Programa.cs");
      writeFileSync(f, code!);
      saida = execFileSync("dotnet", ["run", f], { cwd: dir, encoding: "utf8", env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }, timeout: 180_000 });
    }
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string };
    saida = `ERRO: ${(err.stderr || err.stdout || err.message).slice(0, 800)}`;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const ok = norm(saida) === norm(esperado!);
  if (!ok) falhas++;
  const primeira = code!.split("\n").find((l) => l.trim()) ?? "";
  console.log(`${ok ? "OK    " : "DIFERE"} bloco ${n} (${lang}) ${primeira.trim().slice(0, 60)}`);
  if (!ok || mostrar) console.log(`--- saída real\n${norm(saida)}\n${ok ? "" : `--- esperado no texto\n${norm(esperado!)}\n`}`);
}
console.log(n === 0 ? "nenhum bloco com Saída encontrado" : falhas ? `\n${falhas} de ${n} bloco(s) com diferença` : `\nTODOS OS ${n} BLOCOS OK`);
process.exit(falhas ? 1 : 0);
