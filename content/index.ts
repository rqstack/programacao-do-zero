import type { SeedCourse, SeedGame, SeedProject } from "./schema";
import { course as logica } from "./courses/logica-de-programacao/course";
import { course as html } from "./courses/html/course";
import { course as css } from "./courses/css/course";
import { course as javascript } from "./courses/javascript/course";

/** Ordem de exibição das trilhas. Só entram aqui cursos com todas as aulas escritas. */
export const courses: SeedCourse[] = [logica, html, css, javascript];

export const games: SeedGame[] = [];

export const projects: SeedProject[] = [];
