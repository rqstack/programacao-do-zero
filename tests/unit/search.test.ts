import { describe, expect, it } from "vitest";
import { normalize, search, type SearchEntry } from "@/lib/search/query";

const idx: SearchEntry[] = [
  { kind: "aula", title: "Variáveis e tipos", text: "let, const e tipos de dado", href: "/aulas/variaveis" },
  { kind: "aula", title: "Laços de repetição", text: "for e while", href: "/aulas/lacos" },
  { kind: "glossario", title: "Variável", text: "Nome que guarda um valor", href: "/glossario" },
  { kind: "desafio", title: "Soma de pares", text: "Lógica · Fácil · laços", href: "/desafios?id=soma-pares" },
];

describe("busca global", () => {
  it("ignora acentos e maiúsculas", () => {
    expect(normalize("LAÇOS de Repetição")).toBe("lacos de repeticao");
    expect(search(idx, "lacos").map((r) => r.href)).toEqual(["/aulas/lacos", "/desafios?id=soma-pares"]);
  });
  it("título pesa mais que o texto e todos os termos precisam aparecer", () => {
    expect(search(idx, "variavel")[0]!.kind).toBe("glossario");
    expect(search(idx, "for while")).toHaveLength(1);
    expect(search(idx, "for python")).toHaveLength(0);
  });
  it("busca vazia não devolve nada", () => {
    expect(search(idx, "   ")).toEqual([]);
  });
});
