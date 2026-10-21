// Gera supabase/seed.sql com todas as atividades que rendem XP.
// Uso: npm run db:seed
import { writeFileSync } from "node:fs";
import path from "node:path";
import { xpSources, xpSourcesSql } from "../content/xp-sources";

writeFileSync(path.join(process.cwd(), "supabase", "seed.sql"), xpSourcesSql(), "utf8");
console.log(`supabase/seed.sql gerado com ${xpSources().length} atividades.`);
