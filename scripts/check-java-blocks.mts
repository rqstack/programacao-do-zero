/**
 * Compila e executa cada bloco ```java de uma trilha no Judge0 (JDK 17) e compara a saída
 * com o bloco ```texto seguinte (que começa depois da palavra "Saída:").
 * Uso: npx tsx scripts/check-java-blocks.mts java
 */
import { readFileSync } from "node:fs";
const slug = process.argv[2] ?? "java";
const md = readFileSync(`content/courses/${slug}/aulas.md`, "utf8");
const re = /```java\n([\s\S]*?)```\s*\n+Saída:\s*\n+```texto\n([\s\S]*?)```/g;
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
let fails = 0;
for (const m of md.matchAll(re)) {
  const [, code, expected] = m;
  const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=true&wait=true", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "programacao-do-zero" },
    body: JSON.stringify({ language_id: 91, source_code: b64(code!), stdin: "" }),
  });
  const d = (await res.json()) as { status: { description: string }; stdout?: string; compile_output?: string; stderr?: string };
  const out = d.stdout ? Buffer.from(d.stdout, "base64").toString("utf8") : "";
  // printf/String.format seguem o idioma do sistema: no Brasil 1,68; no servidor de teste 1.68.
  const norm = (s: string) => s.replace(/\r/g, "").replace(/(\d),(\d)/g, "$1.$2").trimEnd();
  const ok = norm(out) === norm(expected!);
  if (!ok) fails++;
  const first = code!.split("\n").find((l) => /class Main|record|interface|abstract class|class /.test(l)) ?? "";
  console.log(`${ok ? "OK   " : "DIFERE"} ${d.status.description.padEnd(12)} ${first.trim().slice(0, 50)}`);
  if (!ok) {
    console.log("--- esperado\n" + norm(expected!) + "\n--- obtido\n" + norm(out));
    const err = d.compile_output ?? d.stderr;
    if (err) console.log("--- erro\n" + Buffer.from(err, "base64").toString("utf8").slice(0, 500));
  }
}
process.exit(fails ? 1 : 0);
