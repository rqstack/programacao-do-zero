/**
 * Intervalo entre consultas do status do Pix. Normal: 5 s. Depois de falhas de rede,
 * espera mais (10, 20, 30 s) em vez de parar: uma queda rápida da conexão não pode
 * fazer a tela deixar de perceber o pagamento.
 */
export function pollDelay(failures: number): number {
  if (!Number.isFinite(failures) || failures <= 0) return 5_000;
  return Math.min(5_000 * 2 ** Math.min(failures, 10), 30_000);
}
