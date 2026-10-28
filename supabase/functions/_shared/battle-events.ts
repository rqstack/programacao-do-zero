/** Eventos semanais da Batalha. Arquivo separado: o site importa só isto (sem as revisões dos desafios). */
/**
 * Eventos semanais (horário de Brasília, segunda a segunda). Usam as partidas ranqueadas
 * normais: nada muda na fila; o placar só conta as partidas do período nos níveis do evento.
 * Métricas: "vitorias" (mais vitórias), "resolvidos" (mais partidas com solução aceita) e
 * "velocidade" (menor tempo até a primeira solução aceita).
 */
export type EventMetric = "vitorias" | "resolvidos" | "velocidade";
export interface BattleEvent {
  id: number;
  slug: string;
  name: string;
  description: string;
  metric: EventMetric;
  tiers: number[];
  starts: string;
  ends: string;
}

const week = (n: number) => {
  const start = new Date(Date.UTC(2026, 9, 26, 3) + n * 7 * 86_400_000); // segunda 26/10/2026 00:00 (Brasília)
  const end = new Date(start.getTime() + 7 * 86_400_000);
  const iso = (d: Date) => `${d.toISOString().slice(0, 10)}T00:00:00-03:00`;
  return { starts: iso(start), ends: iso(end) };
};

export const EVENTS: readonly BattleEvent[] = [
  { id: 1, slug: "semana-das-condicionais", name: "Semana das condicionais", description: "Partidas do Terminal Inicial: if, else e comparações. Vence quem somar mais vitórias.", metric: "vitorias", tiers: [1], ...week(0) },
  { id: 2, slug: "desafio-dos-lacos", name: "Desafio dos laços", description: "Partidas do Vale dos Laços. Conta cada partida em que você teve uma solução aceita, mesmo que o outro tenha sido mais rápido.", metric: "resolvidos", tiers: [2], ...week(1) },
  { id: 3, slug: "evento-de-velocidade", name: "Evento de velocidade", description: "Qualquer arena. Vale o seu menor tempo entre o início da partida e a primeira solução aceita.", metric: "velocidade", tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9], ...week(2) },
  { id: 4, slug: "semana-das-listas", name: "Semana das listas", description: "Biblioteca das Listas e Fábrica de Funções: arrays, funções e manipulação de dados. Conta partidas resolvidas.", metric: "resolvidos", tiers: [3, 4], ...week(3) },
  { id: 5, slug: "semana-de-algoritmos", name: "Semana de algoritmos", description: "Torre dos Algoritmos e Núcleo do Kernel. Vence quem somar mais vitórias.", metric: "vitorias", tiers: [5, 6], ...week(4) },
  { id: 6, slug: "desafio-de-logica", name: "Desafio de lógica", description: "Todas as arenas. Conta cada partida em que você teve uma solução aceita.", metric: "resolvidos", tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9], ...week(5) },
  { id: 7, slug: "semana-dos-grafos", name: "Semana dos grafos", description: "Labirinto dos Grafos: grades, buscas e conexões. Conta partidas resolvidas.", metric: "resolvidos", tiers: [7], ...week(6) },
  { id: 8, slug: "semana-da-memoria", name: "Semana da memória", description: "Câmara da Memória e Trono do Compilador: programação dinâmica e otimização. Vence quem somar mais vitórias.", metric: "vitorias", tiers: [8, 9], ...week(7) },
];

