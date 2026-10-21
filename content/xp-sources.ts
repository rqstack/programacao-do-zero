import { XP_RULES } from "../src/lib/gamification/rules";
import { courses, games, projects } from "./index";

export interface XpSource {
  key: string;
  amount: number;
  label: string;
}

/**
 * Todas as atividades que rendem XP, com o valor de cada uma. As mesmas chaves são
 * usadas no progresso salvo no navegador (src/lib/progress/model.ts).
 */
export function xpSources(): XpSource[] {
  const out: XpSource[] = [];
  for (const course of courses) {
    const lessons = course.modules.flatMap((m) => m.lessons);
    for (const l of lessons) {
      out.push({ key: `lesson:${l.slug}`, amount: XP_RULES.lesson, label: `Aula: ${l.title}` });
      out.push({ key: `exercise:${l.slug}`, amount: XP_RULES.exercise, label: `Exercício: ${l.title}` });
      out.push({ key: `quiz:revisao-${l.slug}`, amount: XP_RULES.quizPassed, label: `Quiz: ${l.title}` });
    }
    out.push({ key: `quiz:desafio-${course.slug}`, amount: XP_RULES.quizPassed, label: `Desafio final: ${course.title}` });
  }
  for (const g of games) out.push({ key: `game:${g.slug}`, amount: XP_RULES.gameCompleted, label: `Jogo: ${g.title}` });
  for (const p of projects) out.push({ key: `project:${p.slug}`, amount: XP_RULES.project, label: `Projeto: ${p.title}` });
  return out;
}

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;

/** SQL idempotente que sincroniza xp_sources com o conteúdo atual. */
export function xpSourcesSql(): string {
  const rows = xpSources().map((s) => `  (${q(s.key)}, ${s.amount}, ${q(s.label)})`);
  return [
    "-- GERADO AUTOMATICAMENTE por scripts/generate-xp-sources.ts — não edite à mão.",
    "-- Rode no SQL Editor do Supabase depois das migrations (e sempre que o conteúdo mudar).",
    "begin;",
    "insert into public.xp_sources (key, amount, label) values",
    rows.join(",\n"),
    "on conflict (key) do update set amount = excluded.amount, label = excluded.label;",
    "commit;",
    "",
  ].join("\n");
}
