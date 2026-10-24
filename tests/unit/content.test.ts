import ts from "typescript";
import { describe, expect, it } from "vitest";
import { readLessonBodies, readProjectBody, validateContent } from "@content/load";
import { courses, projects } from "@content/index";

const CHECKED = new Set(["js", "javascript", "jsx", "ts", "typescript", "tsx"]);

function codeBlocks(md: string) {
  const out: Array<{ lang: string; code: string }> = [];
  const re = /```([\w-]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) out.push({ lang: m[1]!.toLowerCase(), code: m[2]! });
  return out;
}

function kindOf(lang: string) {
  if (lang === "tsx") return { kind: ts.ScriptKind.TSX, ext: "tsx" };
  if (lang === "ts" || lang === "typescript") return { kind: ts.ScriptKind.TS, ext: "ts" };
  if (lang === "jsx") return { kind: ts.ScriptKind.JSX, ext: "jsx" };
  return { kind: ts.ScriptKind.JS, ext: "js" };
}

/** Erros de sintaxe detectados pelo parser do TypeScript (sem executar o código). */
function syntaxErrors(code: string, lang: string): string[] {
  const { kind, ext } = kindOf(lang);
  const file = ts.createSourceFile(`bloco.${ext}`, code, ts.ScriptTarget.Latest, true, kind);
  const diags = (file as unknown as { parseDiagnostics?: ts.Diagnostic[] }).parseDiagnostics ?? [];
  return diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("conteúdo educacional", () => {
  it("passa em todas as validações", () => {
    expect(validateContent()).toEqual([]);
  });

  it("o verificador de sintaxe detecta código quebrado", () => {
    expect(syntaxErrors("const a = ;", "js").length).toBeGreaterThan(0);
    expect(syntaxErrors('console.log("ok");', "js")).toEqual([]);
  });

  for (const course of courses) {
    it(`blocos de código da trilha ${course.slug} têm sintaxe válida`, () => {
      const problems: string[] = [];
      for (const [slug, body] of readLessonBodies(course)) {
        for (const block of codeBlocks(body)) {
          if (!CHECKED.has(block.lang)) continue;
          for (const err of syntaxErrors(block.code, block.lang)) problems.push(`${slug}: ${err}\n${block.code}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }

  it("blocos de código dos projetos têm sintaxe válida", () => {
    const problems: string[] = [];
    for (const p of projects) {
      for (const block of codeBlocks(readProjectBody(p.slug))) {
        if (!CHECKED.has(block.lang)) continue;
        for (const err of syntaxErrors(block.code, block.lang)) problems.push(`${p.slug}: ${err}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("códigos JavaScript das perguntas de quiz têm sintaxe válida", () => {
    const problems: string[] = [];
    for (const course of courses) {
      for (const lesson of course.modules.flatMap((m) => m.lessons)) {
        for (const question of lesson.quiz) {
          const lang = question.lang ?? "js";
          if (!question.code || question.kind === "find_bug" || !CHECKED.has(lang)) continue;
          for (const err of syntaxErrors(question.code, lang)) problems.push(`${lesson.slug}: ${err}\n${question.code}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("videoaulas", () => {
  it("usa IDs de playlist válidos, sem repetir dentro da trilha", async () => {
    const { videosByCourse } = await import("@content/videos");
    for (const [slug, list] of Object.entries(videosByCourse)) {
      expect(list.length, slug).toBeGreaterThan(0);
      for (const v of list) expect(v.playlist, slug).toMatch(/^PL[\w-]{16,40}$/);
      expect(new Set(list.map((v) => v.playlist)).size, slug).toBe(list.length);
    }
  });
});

describe("blocos SQL das aulas", () => {
  it("todo bloco ```sql roda num Postgres real (um banco limpo por aula)", async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const problems: string[] = [];
    for (const course of courses) {
      for (const [slug, body] of readLessonBodies(course)) {
        const blocks = [...body.matchAll(/```sql\n([\s\S]*?)```/g)].map((m) => m[1]!);
        if (blocks.length === 0) continue;
        const db = new PGlite();
        try {
          for (const b of blocks) await db.exec(b);
        } catch (e) {
          problems.push(`${course.slug}/${slug}: ${(e as Error).message}`);
        }
        await db.close();
      }
    }
    expect(problems).toEqual([]);
  });
});
