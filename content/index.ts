import type { SeedCourse } from "./schema";
import { games as allGames } from "./games";
import { projects as allProjects } from "./projects";
import { course as logica } from "./courses/logica-de-programacao/course";
import { course as html } from "./courses/html/course";
import { course as css } from "./courses/css/course";
import { course as javascript } from "./courses/javascript/course";
import { course as git } from "./courses/git-e-github/course";

/** Ordem de exibição das trilhas. Só entram aqui cursos com todas as aulas escritas. */
export const courses: SeedCourse[] = [logica, html, css, javascript, git];

export const games = allGames;

export const projects = allProjects;
