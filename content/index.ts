import type { SeedCourse } from "./schema";
import { games as allGames } from "./games";
import { projects as allProjects } from "./projects";
import { course as logica } from "./courses/logica-de-programacao/course";
import { course as html } from "./courses/html/course";
import { course as css } from "./courses/css/course";
import { course as javascript } from "./courses/javascript/course";
import { course as git } from "./courses/git-e-github/course";
import { course as typescript } from "./courses/typescript/course";
import { course as react } from "./courses/react/course";
import { course as node } from "./courses/node-e-apis/course";
import { course as modelagem } from "./courses/modelagem-de-dados/course";
import { course as sqlTrilha } from "./courses/sql/course";
import { course as supabaseTrilha } from "./courses/supabase/course";
import { course as testes } from "./courses/testes-e-depuracao/course";
import { course as deployTrilha } from "./courses/deploy-e-hospedagem/course";
import { course as fullStackTrilha } from "./courses/full-stack/course";
import { course as javaTrilha } from "./courses/java/course";
import { course as iaTrilha } from "./courses/ia-aplicada/course";

/** Ordem de exibição das trilhas. Só entram aqui cursos com todas as aulas escritas. */
export const courses: SeedCourse[] = [logica, html, css, javascript, git, typescript, react, node, modelagem, sqlTrilha, supabaseTrilha, testes, deployTrilha, fullStackTrilha, javaTrilha, iaTrilha];

export const games = allGames;

export const projects = allProjects;
