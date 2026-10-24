/**
 * Roda cada bloco ```sql das aulas de uma trilha num Postgres real (PGlite).
 * Um banco limpo por aula; os blocos da mesma aula rodam em sequência.
 * Uso: npx tsx scripts/check-sql-blocks.mts <slug-da-trilha>
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const slug = process.argv[2];
const md = readFileSync(`content/courses/${slug}/aulas.md`, "utf8");
const lessons = md.split(/<!-- aula: ([a-z0-9-]+) -->/).slice(1);
let fails = 0;
for (let i = 0; i < lessons.length; i += 2) {
  const name = lessons[i]!;
  const blocks = [...lessons[i + 1]!.matchAll(/```sql\n([\s\S]*?)```/g)].map((m) => m[1]!);
  if (blocks.length === 0) continue;
  const db = new PGlite();
  try {
    for (const b of blocks) await db.exec(b);
    console.log(`OK    ${name} (${blocks.length} bloco(s))`);
  } catch (e) {
    fails++;
    console.log(`FALHA ${name}: ${(e as Error).message}`);
  }
  await db.close();
}
process.exit(fails ? 1 : 0);
