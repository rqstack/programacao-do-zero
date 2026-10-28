/**
 * Pré-requisitos entre trilhas (usados na trilha personalizada). Uma trilha só é sugerida
 * depois das que ela pede; nada é bloqueado: todas as aulas continuam abertas.
 * Os testes conferem que todas as trilhas aparecem aqui e que não há ciclos.
 */
export const PREREQUISITES: Record<string, string[]> = {
  "logica-de-programacao": [],
  html: [],
  css: ["html"],
  javascript: ["logica-de-programacao", "html"],
  "git-e-github": [],
  typescript: ["javascript"],
  react: ["javascript", "css"],
  "node-e-apis": ["javascript"],
  "modelagem-de-dados": [],
  sql: ["modelagem-de-dados"],
  supabase: ["sql", "javascript"],
  "testes-e-depuracao": ["javascript"],
  "deploy-e-hospedagem": ["git-e-github", "html"],
  "full-stack": ["react", "node-e-apis", "supabase"],
  java: ["logica-de-programacao"],
  "ia-aplicada": ["logica-de-programacao"],
  carreira: ["git-e-github"],
  python: ["logica-de-programacao"],
  csharp: ["logica-de-programacao"],
  aws: ["deploy-e-hospedagem"],
};

/** Linguagens que a pessoa pode escolher no começo, com as trilhas de cada uma. */
export const LANGUAGE_TRAILS: Record<string, { label: string; courses: string[] }> = {
  web: { label: "HTML e CSS", courses: ["html", "css"] },
  javascript: { label: "JavaScript", courses: ["javascript"] },
  typescript: { label: "TypeScript", courses: ["typescript"] },
  python: { label: "Python", courses: ["python"] },
  java: { label: "Java", courses: ["java"] },
  csharp: { label: "C#", courses: ["csharp"] },
  sql: { label: "SQL", courses: ["modelagem-de-dados", "sql"] },
};

/** Trilhas de cada objetivo (além das linguagens escolhidas). */
export const GOAL_TRAILS: Record<string, string[]> = {
  logica: ["logica-de-programacao", "testes-e-depuracao"],
  linguagem: [],
  projetos: ["html", "css", "javascript", "git-e-github", "react", "node-e-apis", "sql", "supabase", "deploy-e-hospedagem", "full-stack"],
  estagio: ["logica-de-programacao", "git-e-github", "html", "css", "javascript", "sql", "testes-e-depuracao", "deploy-e-hospedagem", "carreira"],
  hobby: ["logica-de-programacao", "ia-aplicada"],
};
