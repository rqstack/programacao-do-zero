import { z } from "zod";

/**
 * Robô programador: o aluno monta uma sequência de comandos (com repetição) e o
 * robô executa passo a passo numa grade. Ensina sequência, decomposição e laços.
 *
 * Grade: "#" parede, "." chão, "S" início, "G" objetivo, "*" estrela (bônus).
 */
export type Facing = "N" | "E" | "S" | "W";
export type RobotCommand = "frente" | "esquerda" | "direita";

export const robotPayload = z.object({
  prompt: z.string().min(1).max(500),
  grid: z.array(z.string().regex(/^[#.SG*]+$/).min(2).max(10)).min(2).max(10),
  facing: z.enum(["N", "E", "S", "W"]),
  /** Número máximo de blocos que o aluno pode usar. */
  maxBlocks: z.number().int().min(1).max(12),
});
export const robotSolution = z.object({
  /** Quantidade de blocos de uma solução enxuta (para dar a pontuação máxima). */
  par: z.number().int().min(1).max(12),
});
export const robotAnswer = z.object({
  program: z
    .array(z.object({ cmd: z.enum(["frente", "esquerda", "direita"]), times: z.number().int().min(1).max(9) }))
    .min(1)
    .max(12),
});

export type RobotPayload = z.infer<typeof robotPayload>;
export type RobotProgram = z.infer<typeof robotAnswer>["program"];

export interface RobotStep {
  x: number;
  y: number;
  facing: Facing;
  /** Estrelas coletadas até este passo. */
  stars: number;
}

export interface RobotRun {
  steps: RobotStep[];
  outcome: "goal" | "crash" | "stopped";
  starsCollected: number;
  totalStars: number;
}

const DIRS: Record<Facing, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const LEFT: Record<Facing, Facing> = { N: "W", W: "S", S: "E", E: "N" };
const RIGHT: Record<Facing, Facing> = { N: "E", E: "S", S: "W", W: "N" };

export function findCell(grid: readonly string[], ch: string): { x: number; y: number } | null {
  for (let y = 0; y < grid.length; y++) {
    const x = grid[y]!.indexOf(ch);
    if (x >= 0) return { x, y };
  }
  return null;
}

function cellAt(grid: readonly string[], x: number, y: number): string {
  return grid[y]?.[x] ?? "#";
}

/** Executa o programa. Para ao chegar no objetivo ou ao bater numa parede. */
export function runRobot(payload: RobotPayload, program: RobotProgram): RobotRun {
  const start = findCell(payload.grid, "S")!;
  let { x, y } = start;
  let facing: Facing = payload.facing;
  const collected = new Set<string>();
  const totalStars = payload.grid.join("").split("*").length - 1;
  const steps: RobotStep[] = [{ x, y, facing, stars: 0 }];

  for (const block of program) {
    for (let i = 0; i < block.times; i++) {
      if (block.cmd === "esquerda") facing = LEFT[facing];
      else if (block.cmd === "direita") facing = RIGHT[facing];
      else {
        const [dx, dy] = DIRS[facing];
        const nx = x + dx;
        const ny = y + dy;
        if (cellAt(payload.grid, nx, ny) === "#") {
          return { steps, outcome: "crash", starsCollected: collected.size, totalStars };
        }
        x = nx;
        y = ny;
        if (cellAt(payload.grid, x, y) === "*") collected.add(`${x},${y}`);
      }
      steps.push({ x, y, facing, stars: collected.size });
      if (cellAt(payload.grid, x, y) === "G") return { steps, outcome: "goal", starsCollected: collected.size, totalStars };
    }
  }
  return { steps, outcome: "stopped", starsCollected: collected.size, totalStars };
}

/**
 * Menor número de blocos (comando + repetições) que leva ao objetivo, por busca em
 * largura sobre (posição, direção). Usado para validar o conteúdo: todo labirinto
 * precisa ter solução dentro de maxBlocks.
 */
export function minimumBlocks(payload: RobotPayload): number | null {
  const start = findCell(payload.grid, "S");
  const goal = findCell(payload.grid, "G");
  if (!start || !goal) return null;
  type Node = { x: number; y: number; f: Facing; blocks: number; last: RobotCommand | null };
  const key = (n: { x: number; y: number; f: Facing; last: RobotCommand | null }) => `${n.x},${n.y},${n.f},${n.last}`;
  const queue: Node[] = [{ x: start.x, y: start.y, f: payload.facing, blocks: 0, last: null }];
  const best = new Map<string, number>([[key(queue[0]!), 0]]);
  while (queue.length > 0) {
    queue.sort((a, b) => a.blocks - b.blocks);
    const n = queue.shift()!;
    if (n.x === goal.x && n.y === goal.y) return n.blocks;
    const moves: Array<{ cmd: RobotCommand; x: number; y: number; f: Facing }> = [
      { cmd: "esquerda", x: n.x, y: n.y, f: LEFT[n.f] },
      { cmd: "direita", x: n.x, y: n.y, f: RIGHT[n.f] },
    ];
    const [dx, dy] = DIRS[n.f];
    if (cellAt(payload.grid, n.x + dx, n.y + dy) !== "#") moves.push({ cmd: "frente", x: n.x + dx, y: n.y + dy, f: n.f });
    for (const m of moves) {
      // Repetir o mesmo comando do bloco anterior não custa um bloco novo (é o "×N").
      const cost = n.blocks + (m.cmd === n.last ? 0 : 1);
      const next = { x: m.x, y: m.y, f: m.f, blocks: cost, last: m.cmd };
      const k = key(next);
      if ((best.get(k) ?? Infinity) <= cost) continue;
      best.set(k, cost);
      queue.push(next);
    }
  }
  return null;
}
