import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// Reproduz o layout do export do Next 16 e confere os nomes que o navegador pede
// (vistos no navegador: busca/__next.busca.__PAGE__.txt e __next.aulas.$d$slug.__PAGE__.txt).
const script = path.resolve("scripts/fix-export-prefetch.mjs");
let dir = "";
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

function put(rel: string, content: string) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
}

describe("pré-carregamento do export estático", () => {
  it("cria a cópia com pontos no lugar das barras, sem mexer no original", () => {
    dir = mkdtempSync(path.join(tmpdir(), "pdz-export-"));
    put("busca/__next.busca/__PAGE__.txt", "pagina-busca");
    put("aulas/x/__next.aulas/$d$slug/__PAGE__.txt", "pagina-aula");
    put("busca/__next._tree.txt", "arvore");
    const run = () => execFileSync(process.execPath, [script, dir], { encoding: "utf8" });

    expect(run()).toContain("2 arquivo(s)");
    expect(readFileSync(path.join(dir, "busca/__next.busca.__PAGE__.txt"), "utf8")).toBe("pagina-busca");
    expect(readFileSync(path.join(dir, "aulas/x/__next.aulas.$d$slug.__PAGE__.txt"), "utf8")).toBe("pagina-aula");
    expect(existsSync(path.join(dir, "busca/__next.busca/__PAGE__.txt"))).toBe(true);
    expect(run()).toContain("0 arquivo(s)"); // idempotente
  });

  it("sem a pasta out/ não faz nada nem falha", () => {
    expect(() => execFileSync(process.execPath, [script, path.join(tmpdir(), "nao-existe-pdz")])).not.toThrow();
  });
});
