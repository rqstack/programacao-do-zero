/**
 * Videoaulas gratuitas no YouTube, por trilha.
 *
 * Só entram cursos com todas as aulas publicadas há no máximo 1 ano (conferido em out/2026)
 * e com título e canal confirmados pelo oEmbed do YouTube. Trilhas sem curso recente ficam sem vídeos.
 * São cursos de outros autores, abertos e gratuitos, indicados como complemento: o texto das
 * aulas deste site é próprio. Para trocar ou adicionar, confira o link antes.
 */
export interface VideoCourse {
  /** ID da playlist (começa com PL). */
  playlist: string;
  title: string;
  channel: string;
  /** Idioma do áudio. */
  lang: "pt" | "en";
}

export const videosByCourse: Record<string, VideoCourse[]> = {
  "logica-de-programacao": [
    { playlist: "PLgLgGp0EWo769tZ35LvJgiB6aGOsMLIXs", title: "Lógica de Programação 2026", channel: "Marcelo Souza da Silva", lang: "pt" },
  ],
  html: [
    { playlist: "PL2Fdisxwzt_f69N5jAfypOOhjdW3yDFnw", title: "Curso Programador Web Moderno: Era da IA", channel: "Programação Web", lang: "pt" },
  ],
  css: [
    { playlist: "PL2Fdisxwzt_f69N5jAfypOOhjdW3yDFnw", title: "Curso Programador Web Moderno: Era da IA", channel: "Programação Web", lang: "pt" },
  ],
  javascript: [
    { playlist: "PL2Fdisxwzt_f69N5jAfypOOhjdW3yDFnw", title: "Curso Programador Web Moderno: Era da IA", channel: "Programação Web", lang: "pt" },
  ],
  "git-e-github": [
    { playlist: "PLx4x_zx8csUhopU45en_VDUS9hkze64xO", title: "Curso de Git e GitHub", channel: "CFBCursos", lang: "pt" },
  ],
  typescript: [
    { playlist: "PLdGiHoi_ynWGS92WJWKeekO6DAudZ9DA6", title: "Curso de TypeScript 2026", channel: "Uanela Como", lang: "pt" },
  ],
  react: [
    { playlist: "PLrE0Wm1aZt8d7bXUCynHqoQQS8z_Z9r9z", title: "Curso completo de React.js", channel: "Julio Code", lang: "pt" },
    { playlist: "PL1dUY2RYa2RhOeNNC7NUpL1urJOX3QJcz", title: "Curso React para Iniciantes", channel: "Serliv", lang: "pt" },
  ],
  "node-e-apis": [
    { playlist: "PLdGiHoi_ynWG0h0ZzcrSwPAJdJIT6VqpR", title: "Curso de Backend: Node.js, Express, PostgreSQL e Prisma", channel: "Uanela Como", lang: "pt" },
  ],
  sql: [
    { playlist: "PLSG35NDBu9HfN-jf_z182JkTxi-KA3wgG", title: "Curso SQL Básico", channel: "André Krul", lang: "pt" },
  ],
  supabase: [
    { playlist: "PL4ZwkMMhwaqIem09eRINhc2fjfaM_t2OO", title: "Curso Supabase Master", channel: "Léo Henrique", lang: "pt" },
  ],
  // Java: cursos do DevDojo por escolha do dono do projeto (exceção à regra de até 1 ano).
  java: [
    { playlist: "PL62G310vn6nFIsOCC0H-C2infYgwm8SWW", title: "Maratona Java Virado no Jiraya", channel: "DevDojo", lang: "pt" },
    { playlist: "PL62G310vn6nFTNJ4JbW8BuhAiK16MEc_x", title: "Spring Boot Direto Das Trincheiras", channel: "DevDojo", lang: "pt" },
  ],
  "ia-aplicada": [
    { playlist: "PLnTte7--UAGg4g-8GrS6RtdN3VqwKdb0x", title: "Engenharia de Prompt para IA", channel: "Bruno Lobo Pinheiro", lang: "pt" },
    { playlist: "PLp8AftP4p8Fvj6gwYoQURaGEzPHGV2sOY", title: "Curso Básico de Automações com n8n", channel: "Hashtag No Code & IA", lang: "pt" },
  ],
  "full-stack": [
    { playlist: "PL2Fdisxwzt_f69N5jAfypOOhjdW3yDFnw", title: "Curso Programador Web Moderno: Era da IA", channel: "Programação Web", lang: "pt" },
  ],
  "jogos-com-canvas": [
    { playlist: "PLYElE_rzEw_tjnJ_5gzRw0ZM5HRn7AIS0", title: "Vanilla JavaScript Game Development", channel: "Franks laboratory", lang: "en" },
  ],
};

export function playlistUrl(id: string): string {
  return `https://www.youtube.com/playlist?list=${id}`;
}
