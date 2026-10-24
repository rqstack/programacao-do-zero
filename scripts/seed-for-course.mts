/** Imprime o SQL (upsert) só das atividades de XP de uma trilha. Uso: npx tsx scripts/seed-for-course.mts <slug> */
import { courses } from "../content/index.ts";
import { xpSources } from "../content/xp-sources.ts";
const slug = process.argv[2];
const course = courses.find((c) => c.slug === slug);
if (!course) throw new Error(`trilha não encontrada: ${slug}`);
const lessons = new Set(course.modules.flatMap((m) => m.lessons.map((l) => l.slug)));
const rows = xpSources().filter((s) => {
  const [kind, id] = s.key.split(":") as [string, string];
  return (kind === "lesson" || kind === "exercise") ? lessons.has(id) : kind === "quiz" && (lessons.has(id.replace(/^revisao-/, "")) || id === `desafio-${slug}`);
});
const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
console.log(`insert into public.xp_sources (key, amount, label) values\n${rows.map((r) => `  (${q(r.key)}, ${r.amount}, ${q(r.label)})`).join(",\n")}\non conflict (key) do update set amount = excluded.amount, label = excluded.label;\n-- ${rows.length} atividades`);
