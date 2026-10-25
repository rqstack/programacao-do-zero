/**
 * Valida o banco da Batalha no executor real (Judge0): para cada desafio e linguagem,
 * a solução precisa ser ACEITA e o código inicial precisa compilar e ser RECUSADO.
 * Uso: npx tsx scripts/battle-validate.mts [id-do-desafio]
 * Requer o banco privado em supabase/functions/_shared/battle-bank.ts.
 */
import { BATTLE_LANGS, solutionFor, starterCode, withSolution } from "../supabase/functions/_shared/battle-core.ts";
import { judgeSubmission } from "../supabase/functions/_shared/battle-judge.ts";

const url = process.env.JUDGE0_URL ?? "https://ce.judge0.com";
const only = process.argv[2] && process.argv[2] !== "-" ? process.argv[2] : undefined;
const onlyLang = process.argv[3];
const { battleBank } = await import("../supabase/functions/_shared/battle-bank.ts");
let fails = 0;
for (const ch of battleBank.filter((c) => !only || c.id === only)) {
  for (const lang of BATTLE_LANGS.filter((l) => !onlyLang || l === onlyLang)) {
    const seed = Math.floor(Math.random() * 2 ** 31);
    const good = await judgeSubmission({ url }, ch, lang, withSolution(ch.signature, lang, solutionFor(ch, lang)), seed);
    const starter = await judgeSubmission({ url }, ch, lang, starterCode(ch.signature, lang), seed);
    const ok = good.verdict === "aceito" && starter.verdict === "resposta_errada";
    if (!ok) fails++;
    console.log(`${ok ? "OK " : "FALHA"} ${ch.id.padEnd(26)} ${lang.padEnd(10)} solução=${good.verdict} (${good.timeMs}ms) inicial=${starter.verdict}${ok ? "" : ` | ${good.message.slice(0, 160)} | ${starter.message.slice(0, 160)}`}`);
  }
}
console.log(fails === 0 ? "\nTUDO OK" : `\n${fails} combinação(ões) com problema`);
process.exit(fails === 0 ? 0 : 1);
