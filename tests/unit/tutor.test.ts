import { describe, expect, it } from "vitest";
import { courses } from "@content/index";
import { readLessonBodies } from "@content/load";
import { diagnoseAnswer, explainError, lessonExample } from "@/lib/tutor/tutor";
import { normalizeShortAnswer } from "@/lib/quiz/grading";

describe("diagnóstico de respostas", () => {
  const acc = ['console.log("Olá")'];
  it("aponta parênteses e aspas sem par", () => {
    expect(diagnoseAnswer('console.log("Olá"', acc)).toMatch(/fechar parênteses/);
    expect(diagnoseAnswer('console.log("Olá)', acc)).toMatch(/aspas/);
  });
  it("reconhece começo certo e erro de digitação", () => {
    expect(diagnoseAnswer("console.log", acc)).toMatch(/começo está certo/);
    expect(diagnoseAnswer('consle.log("Olá")', acc)).toMatch(/um ou dois caracteres/);
  });
  it("nunca devolve a resposta aceita", () => {
    for (const a of ["x", "console", 'print("Olá")', "let x = 1"]) {
      const msg = diagnoseAnswer(a, acc) ?? "";
      expect(msg).not.toContain("console.log(");
    }
  });
});

describe("explicação de erros", () => {
  it("reconhece erros comuns de várias linguagens", () => {
    expect(explainError("ReferenceError: nme is not defined")?.title).toContain('"nme"');
    expect(explainError("NameError: name 'totl' is not defined")?.title).toContain('"totl"');
    expect(explainError("TypeError: Cannot read properties of undefined (reading 'x')")?.title).toMatch(/vazio/);
    expect(explainError("IndentationError: expected an indented block")?.title).toMatch(/Indentação/);
    expect(explainError("Main.java:3: error: cannot find symbol")?.title).toMatch(/não declarado/);
    expect(explainError("no such column: nomee")?.title).toMatch(/Coluna/);
    expect(explainError("tudo certo")).toBeNull();
  });
});

describe("exemplo da aula para a dica", () => {
  it("nenhuma aula usa como exemplo um trecho que já contém a resposta do exercício", () => {
    let withExample = 0;
    for (const course of courses) {
      const bodies = readLessonBodies(course);
      for (const l of course.modules.flatMap((m) => m.lessons)) {
        const ex = lessonExample(bodies.get(l.slug) ?? "", l.exercise.accepted);
        if (!ex) continue;
        withExample++;
        const code = normalizeShortAnswer(ex.code);
        for (const a of l.exercise.accepted.map(normalizeShortAnswer).filter((x) => x.length >= 3)) expect(code.includes(a), `${l.slug}: ${a}`).toBe(false);
      }
    }
    // Aulas sem código (carreira, nuvem) usam outra dica no lugar do exemplo.
    expect(withExample).toBeGreaterThan(60);
  });
});
