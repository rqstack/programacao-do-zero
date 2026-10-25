/** Linguagens dos desafios de código (sem dependências: usado também no modelo de progresso). */
export const CHALLENGE_LANGS = ["javascript", "python", "sql", "typescript", "java", "c", "cpp", "csharp", "go", "rust", "php"] as const;
export type ChallengeLang = (typeof CHALLENGE_LANGS)[number];
