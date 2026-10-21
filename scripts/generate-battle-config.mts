/** Gera supabase/battle-config.sql (arenas, regras, temporadas) e supabase/battle-challenges.sql. */
import { existsSync, writeFileSync } from "node:fs";
import { battleChallengesSql, battleConfigSql } from "../supabase/functions/_shared/battle-sql.ts";

writeFileSync("supabase/battle-config.sql", battleConfigSql());
console.log("supabase/battle-config.sql gerado.");
const privateBank = "supabase/functions/_shared/battle-bank.ts";
if (existsSync(privateBank)) {
  const { battleBank } = await import("../supabase/functions/_shared/battle-bank.ts");
  writeFileSync("supabase/battle-challenges.sql", battleChallengesSql(battleBank));
  console.log(`supabase/battle-challenges.sql gerado com ${battleBank.length} desafios.`);
} else {
  console.log("Banco privado ausente: battle-challenges.sql não foi alterado (veja battle-bank.example.ts).");
}
