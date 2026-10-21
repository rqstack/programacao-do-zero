import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { validateRound } from "../src/lib/games/engine";
import { courses, games, projects } from "./index";
import type { SeedCourse } from "./schema";

/**
 * Leitura do conteúdo em tempo de build (Node). As páginas são geradas
 * estaticamente a partir daqui; nada disso roda no navegador.
 */
const ROOT = path.join(process.cwd(), "content");
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REQUIRED_SECTIONS = [
  "## Por que isso importa",
  "## Conceitos fundamentais",
  "## Exemplo prático",
  "## Explicando o código",
  "## Erros comuns",
  "## Resumo",
  "## Próximo passo",
];

const bodyCache = new Map<string, Map<string, string>>();

export function readLessonBodies(course: SeedCourse): Map<string, string> {
  const cached = bodyCache.get(course.slug);
  if (cached) return cached;
  const file = path.join(ROOT, "courses", course.slug, "aulas.md");
  if (!existsSync(file)) throw new Error(`Arquivo de aulas ausente: ${file}`);
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const parts = raw.split(/^<!-- aula: ([a-z0-9-]+) -->\s*$/m);
  const bodies = new Map<string, string>();
  for (let i = 1; i < parts.length; i += 2) {
    const slug = parts[i]!;
    if (bodies.has(slug)) throw new Error(`Aula duplicada em ${course.slug}/aulas.md: ${slug}`);
    bodies.set(slug, parts[i + 1]!.trim());
  }
  bodyCache.set(course.slug, bodies);
  return bodies;
}

export function readProjectBody(slug: string): string {
  const file = path.join(ROOT, "projetos", `${slug}.md`);
  if (!existsSync(file)) throw new Error(`Corpo do projeto ausente: ${file}`);
  return readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
}

/** Valida todo o conteúdo. Retorna a lista de problemas (vazia = tudo certo). */
export function validateContent(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const unique = (kind: string, slug: string) => {
    if (!SLUG.test(slug)) errors.push(`${kind} com slug inválido: ${slug}`);
    if (seen.has(`${kind}:${slug}`)) errors.push(`${kind} com slug repetido: ${slug}`);
    seen.add(`${kind}:${slug}`);
  };

  for (const course of courses) {
    unique("trilha", course.slug);
    let bodies: Map<string, string>;
    try {
      bodies = readLessonBodies(course);
    } catch (e) {
      errors.push((e as Error).message);
      continue;
    }
    const declared = new Set<string>();
    for (const lesson of course.modules.flatMap((m) => m.lessons)) {
      unique("aula", lesson.slug);
      declared.add(lesson.slug);
      const body = bodies.get(lesson.slug);
      if (!body) errors.push(`Aula sem corpo: ${course.slug}/${lesson.slug}`);
      else {
        for (const section of REQUIRED_SECTIONS) {
          if (!body.includes(section)) errors.push(`Aula ${lesson.slug} sem a seção "${section}"`);
        }
        if (!body.includes("```")) errors.push(`Aula ${lesson.slug} sem nenhum bloco de código`);
      }
      if (lesson.objective.length < 20) errors.push(`Aula ${lesson.slug} com objetivo curto demais`);
      if (lesson.exercise.accepted.length === 0) errors.push(`Exercício sem resposta aceita: ${lesson.slug}`);
      if (lesson.quiz.length < 3) errors.push(`Quiz da aula ${lesson.slug} precisa de pelo menos 3 perguntas`);
      lesson.quiz.forEach((q, i) => {
        const where = `pergunta ${i + 1} da aula ${lesson.slug}`;
        if (q.options.length < 2 || q.options.length > 6) errors.push(`${where}: número de opções inválido`);
        if (q.correct < 0 || q.correct >= q.options.length) errors.push(`${where}: resposta fora das opções`);
        if (new Set(q.options).size !== q.options.length) errors.push(`${where}: opções repetidas`);
      });
    }
    for (const slug of bodies.keys()) {
      if (!declared.has(slug)) errors.push(`Corpo de aula sem metadados: ${course.slug}/${slug}`);
    }
  }

  for (const game of games) {
    unique("jogo", game.slug);
    if (game.rounds.length < 3) errors.push(`Jogo ${game.slug} precisa de pelo menos 3 rodadas`);
    game.rounds.forEach((round, i) => {
      const v = validateRound(game.kind, round.payload, round.solution);
      if (!v.ok) errors.push(`Jogo ${game.slug}, rodada ${i + 1}: ${v.error}`);
    });
  }

  for (const project of projects) {
    unique("projeto", project.slug);
    try {
      readProjectBody(project.slug);
    } catch (e) {
      errors.push((e as Error).message);
    }
    if (project.criteria.length < 3) errors.push(`Projeto ${project.slug} precisa de pelo menos 3 critérios`);
  }
  return errors;
}
