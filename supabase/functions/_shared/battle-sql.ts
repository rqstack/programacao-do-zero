/** Gera o SQL de configuração da Batalha a partir de battle-core.ts (fonte única). */
import { ARENAS, BATTLE_RULES, publicPart, type BattleChallenge } from "./battle-core.ts";
import { BATTLE_REVIEWS } from "./battle-review.ts";
import { EVENTS } from "./battle-events.ts";

export { EVENTS, type BattleEvent, type EventMetric } from "./battle-events.ts";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;

/** Temporadas trimestrais (horário de Brasília). */
export const SEASONS = [
  { id: 1, name: "Temporada 1 · Out–Dez 2026", starts: "2026-10-01T00:00:00-03:00", ends: "2027-01-01T00:00:00-03:00" },
  { id: 2, name: "Temporada 2 · Jan–Mar 2027", starts: "2027-01-01T00:00:00-03:00", ends: "2027-04-01T00:00:00-03:00" },
  { id: 3, name: "Temporada 3 · Abr–Jun 2027", starts: "2027-04-01T00:00:00-03:00", ends: "2027-07-01T00:00:00-03:00" },
  { id: 4, name: "Temporada 4 · Jul–Set 2027", starts: "2027-07-01T00:00:00-03:00", ends: "2027-10-01T00:00:00-03:00" },
];

export function battleConfigSql(): string {
  const r = BATTLE_RULES;
  return [
    "-- GERADO AUTOMATICAMENTE por scripts/generate-battle-config.mts a partir de",
    "-- supabase/functions/_shared/battle-core.ts — não edite à mão. Rode depois das migrations.",
    "begin;",
    "insert into public.battle_arenas (id, slug, name, min_trophies, tier, duration_sec, win, loss, floor_protected) values",
    ARENAS.map((a) => `  (${a.id}, ${q(a.slug)}, ${q(a.name)}, ${a.minTrophies}, ${a.tier}, ${a.durationSec}, ${a.win}, ${a.loss}, ${a.floorProtected})`).join(",\n"),
    "on conflict (id) do update set slug = excluded.slug, name = excluded.name, min_trophies = excluded.min_trophies, tier = excluded.tier,",
    "  duration_sec = excluded.duration_sec, win = excluded.win, loss = excluded.loss, floor_protected = excluded.floor_protected;",
    "insert into public.battle_rules (id, countdown_sec, diff_step, diff_cap, abandon_extra_loss, abandon_after_sec, max_submissions,",
    "  min_seconds_between, max_code_bytes, judge_grace_sec, window_base, window_per_sec, queue_stale_sec) values",
    `  (true, ${r.countdownSec}, ${r.diffStep}, ${r.diffCap}, ${r.abandonExtraLoss}, ${r.abandonAfterSec}, ${r.maxSubmissions}, ${r.minSecondsBetweenSubmissions}, ${r.maxCodeBytes}, ${r.judgeGraceSec}, ${r.windowBase}, ${r.windowPerSec}, ${r.queueStaleSec})`,
    "on conflict (id) do update set countdown_sec = excluded.countdown_sec, diff_step = excluded.diff_step, diff_cap = excluded.diff_cap,",
    "  abandon_extra_loss = excluded.abandon_extra_loss, abandon_after_sec = excluded.abandon_after_sec, max_submissions = excluded.max_submissions,",
    "  min_seconds_between = excluded.min_seconds_between, max_code_bytes = excluded.max_code_bytes, judge_grace_sec = excluded.judge_grace_sec,",
    "  window_base = excluded.window_base, window_per_sec = excluded.window_per_sec, queue_stale_sec = excluded.queue_stale_sec;",
    "insert into public.battle_seasons (id, name, starts_at, ends_at) values",
    SEASONS.map((s) => `  (${s.id}, ${q(s.name)}, ${q(s.starts)}, ${q(s.ends)})`).join(",\n"),
    "on conflict (id) do update set name = excluded.name, starts_at = excluded.starts_at, ends_at = excluded.ends_at;",
    "insert into public.battle_events (id, slug, name, description, metric, tiers, starts_at, ends_at) values",
    EVENTS.map((e) => `  (${e.id}, ${q(e.slug)}, ${q(e.name)}, ${q(e.description)}, ${q(e.metric)}, '{${e.tiers.join(",")}}', ${q(e.starts)}, ${q(e.ends)})`).join(",\n"),
    "on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, metric = excluded.metric,",
    "  tiers = excluded.tiers, starts_at = excluded.starts_at, ends_at = excluded.ends_at;",
    "commit;",
    "",
  ].join("\n");
}

/** Parte pública dos desafios (enunciado e exemplos). Nada de testes ocultos ou soluções. */
export function battleChallengesSql(bank: readonly BattleChallenge[]): string {
  return [
    "-- GERADO AUTOMATICAMENTE por scripts/generate-battle-config.mts — só a parte PÚBLICA dos desafios.",
    "begin;",
    "insert into public.battle_challenges (id, tier, title, public_data, review_data) values",
    bank
      .map((c) => {
        const review = BATTLE_REVIEWS[c.id];
        return `  (${q(c.id)}, ${c.tier}, ${q(c.title)}, ${q(JSON.stringify(publicPart(c)))}::jsonb, ${review ? `${q(JSON.stringify(review))}::jsonb` : "null"})`;
      })
      .join(",\n"),
    "on conflict (id) do update set tier = excluded.tier, title = excluded.title, public_data = excluded.public_data, review_data = excluded.review_data, enabled = true;",
    `update public.battle_challenges set enabled = false where id not in (${bank.map((c) => q(c.id)).join(", ")});`,
    "commit;",
    "",
  ].join("\n");
}
