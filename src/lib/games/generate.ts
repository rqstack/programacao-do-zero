import type { SeedGame, SeedGameRound } from "@content/schema";
import { minimumBlocks, type RobotPayload } from "./robot";
import { runQuery, toSql, type SqlQuery, type SqlTable } from "./sql-mini";
import { BUGS } from "@content/games/bugs";
import { buildWave, RULES_BY_DIFFICULTY } from "@content/games/catch";
import { bugRound, waveRound } from "@content/games/rounds";
import { validateRound, type GameKind } from "./engine";

/**
 * Monta as fases de uma partida. Cada partida sorteia fases entre as cadastradas e
 * as geradas na hora (com nomes, valores e labirintos novos), mantendo a mesma
 * quantidade de fases por dificuldade. Assim, jogar de novo traz conteúdo diferente
 * sem mudar a pontuação máxima nem o XP do jogo.
 */
export type Rand = () => number;

export function seededRandom(seed: string): Rand {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (r: Rand, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
const pick = <T>(r: Rand, items: readonly T[]): T => items[Math.floor(r() * items.length)]!;
function sample<T>(r: Rand, items: readonly T[], n: number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out.slice(0, n);
}

type Difficulty = 1 | 2 | 3;
type Generated = Omit<SeedGameRound, "points">;
type Generator = (r: Rand, difficulty: Difficulty, game: SeedGame) => Generated | null;

const VARS = ["total", "preco", "idade", "nota", "contador", "saldo", "pontos", "media", "quantidade", "limite", "valor", "nivel"];
const FUNCS = ["dobro", "triplo", "calcular", "converter", "somarTaxa", "aplicar", "escalar"];
const PEOPLE = ["Ana", "Bruno", "Carla", "Davi", "Elisa", "Fábio", "Gabi", "Hugo", "Iara", "João"];
const CITIES = ["Recife", "Salvador", "Curitiba", "Manaus", "Natal", "Belém", "Fortaleza", "Goiânia"];
const RESOURCES = ["produtos", "tarefas", "alunos", "pedidos", "cursos", "filmes"];
const CLASSES = ["botao", "cartao", "titulo", "aviso", "menu", "rodape"];
const COLORS = ["#fff", "#222", "tomato", "navy", "teal", "#ffb547"];
const TITLES = ["Minha página", "Bem-vindo", "Projeto final", "Meu portfólio", "Lista de tarefas"];

/* ------------------------------ Digitação ------------------------------ */

type TypingTpl = (r: Rand) => { prompt: string; language: string; text: string; explanation: string };
const TYPING: Record<Difficulty, TypingTpl[]> = {
  1: [
    (r) => {
      const v = pick(r, VARS);
      return { prompt: "Criar uma variável", language: "js", text: `let ${v} = ${int(r, 2, 99)};`, explanation: "let cria uma variável que pode mudar depois." };
    },
    (r) => ({ prompt: "Mostrar uma mensagem", language: "js", text: `console.log("Olá, ${pick(r, PEOPLE)}!");`, explanation: "console.log mostra um texto no console." }),
    (r) => ({ prompt: "Mostrar um texto em Python", language: "python", text: `print("Bem-vindo, ${pick(r, PEOPLE)}")`, explanation: "Em Python, print mostra o texto na tela." }),
    (r) => ({ prompt: "Um título em HTML", language: "html", text: `<h1>${pick(r, TITLES)}</h1>`, explanation: "h1 é o título principal da página; toda tag aberta é fechada com /." }),
    (r) => ({ prompt: "Uma cor em CSS", language: "css", text: `.${pick(r, CLASSES)} { color: ${pick(r, COLORS)}; }`, explanation: "Seletor, chaves e a declaração propriedade: valor; terminada em ponto e vírgula." }),
  ],
  2: [
    (r) => {
      const v = pick(r, VARS);
      return { prompt: "Uma lista de números", language: "js", text: `const ${v}s = [${int(r, 1, 9)}, ${int(r, 10, 49)}, ${int(r, 50, 99)}];`, explanation: "Colchetes criam um array; os itens são separados por vírgula." };
    },
    (r) => {
      const v = pick(r, VARS);
      return { prompt: "Uma condição", language: "js", text: `if (${v} >= ${int(r, 5, 60)}) { console.log("ok"); }`, explanation: "O bloco entre chaves só roda quando a condição entre parênteses é verdadeira." };
    },
    (r) => ({ prompt: "Ler um número em Python", language: "python", text: `${pick(r, VARS)} = int(input("Digite um número: "))`, explanation: "input sempre devolve texto; int converte para número inteiro." }),
    (r) => ({ prompt: "Filtrar linhas em SQL", language: "sql", text: `SELECT nome FROM clientes WHERE cidade = '${pick(r, CITIES)}';`, explanation: "Textos em SQL usam aspas simples; WHERE filtra as linhas." }),
    (r) => ({ prompt: "Espaçamento em CSS", language: "css", text: `.${pick(r, CLASSES)} { margin: ${int(r, 1, 4) * 8}px auto; }`, explanation: "Com dois valores, margin define vertical e horizontal; auto centraliza na horizontal." }),
  ],
  3: [
    (r) => {
      const n = int(r, 2, 9);
      return { prompt: "Transformar uma lista", language: "js", text: `const novos = itens.map((x) => x * ${n});`, explanation: `map cria um novo array com cada item multiplicado por ${n}.` };
    },
    (r) => ({ prompt: "Um laço for", language: "js", text: `for (let i = 0; i < ${int(r, 3, 20)}; i++) { soma += i; }`, explanation: "Início, condição e passo: o laço repete enquanto a condição for verdadeira." }),
    (r) => {
      const res = pick(r, RESOURCES);
      return { prompt: "Buscar dados de uma API", language: "js", text: `const dados = await (await fetch("/api/${res}")).json();`, explanation: "O primeiro await espera a resposta; o segundo espera o JSON ser lido." };
    },
    (r) => ({ prompt: "List comprehension em Python", language: "python", text: `quadrados = [x * x for x in range(${int(r, 3, 12)})]`, explanation: "A list comprehension cria a lista em uma linha: expressão, for e o intervalo." }),
    (r) => ({ prompt: "Mostrar texto em Java", language: "java", text: `System.out.println("Total: " + ${pick(r, VARS)});`, explanation: "Em Java, + junta o texto com o valor da variável antes de imprimir." }),
    (r) => ({ prompt: "Ordenar e limitar em SQL", language: "sql", text: `SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT ${int(r, 2, 5)};`, explanation: "ORDER BY ... DESC põe os maiores primeiro; LIMIT corta a quantidade de linhas." }),
    (r) => {
      const f = pick(r, FUNCS);
      return { prompt: "Uma função tipada em TypeScript", language: "ts", text: `function ${f}(n: number): number { return n * ${int(r, 2, 9)}; }`, explanation: "Os tipos vêm depois dos dois-pontos: no parâmetro e no retorno." };
    },
  ],
};

/* ------------------------------ SQL ------------------------------ */

const OP_TEXT: Record<string, string> = { "=": "igual a", "<>": "diferente de", ">": "maior que", "<": "menor que", ">=": "de pelo menos", "<=": "de no máximo" };
const joinPt = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

const sqlGen: Generator = (r, d, game) => {
  const tables = (game.rounds[0]?.payload as { tables?: SqlTable[] } | undefined)?.tables;
  if (!tables?.length) return null;
  const t = pick(r, tables);
  const colIdx = (c: string) => t.columns.indexOf(c);
  const isNum = (c: string) => t.rows.every((row) => typeof row[colIdx(c)] === "number");
  const fields = t.columns.filter((c) => c !== "id");
  const textCols = fields.filter((c) => !isNum(c));
  const numCols = fields.filter(isNum);
  const shown = sample(r, fields, d === 1 ? 1 : 2).sort((a, b) => colIdx(a) - colIdx(b));

  const query: SqlQuery = { table: t.name, columns: shown, where: null, orderBy: null, limit: null };
  const parts: string[] = [];
  const wantWhere = d === 1 || r() < 0.7;
  if (wantWhere) {
    if ((d === 1 || r() < 0.4) && textCols.length) {
      const c = pick(r, textCols);
      const v = String(pick(r, t.rows)[colIdx(c)]);
      const op = d === 1 ? "=" : pick(r, ["=", "<>"] as const);
      query.where = { column: c, op, value: v };
      parts.push(`com ${c} ${OP_TEXT[op]} "${v}"`);
    } else if (numCols.length) {
      const c = pick(r, numCols);
      const v = Number(pick(r, t.rows)[colIdx(c)]);
      const op = pick(r, [">", "<", ">=", "<="] as const);
      query.where = { column: c, op, value: v };
      parts.push(`com ${c} ${OP_TEXT[op]} ${v}`);
    }
  }
  if (d >= 2 && (r() < 0.6 || !query.where)) {
    const c = pick(r, fields);
    const dir = pick(r, ["ASC", "DESC"] as const);
    query.orderBy = { column: c, dir };
    parts.push(numCols.includes(c) ? `ordenado por ${c} (${dir === "ASC" ? "do menor para o maior" : "do maior para o menor"})` : `em ordem ${dir === "ASC" ? "alfabética" : "alfabética inversa"} de ${c}`);
    if (d === 3 && r() < 0.6) {
      query.limit = int(r, 1, 3);
      parts.push(`só as ${query.limit} primeiras linhas`);
    }
  }
  const run = runQuery(tables, query);
  if (!run.ok || run.result.rows.length === 0) return null;
  // Evita filtro que não filtra nada (o pedido ficaria confuso).
  if (query.where && run.result.rows.length === t.rows.length && !query.limit) return null;
  return {
    difficulty: d,
    payload: { prompt: `Mostre ${joinPt(shown)} da tabela ${t.name}${parts.length ? `, ${parts.join(", ")}` : ""}.`, tables },
    solution: { query },
    explanation: `Uma resposta: \`${toSql(query).replace(/\n/g, " ")}\``,
  };
};

/* ------------------------------ Robô ------------------------------ */

const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] } as const;
type Dir = keyof typeof DIRS;
const TURN: Record<Dir, [Dir, Dir]> = { N: ["W", "E"], E: ["N", "S"], S: ["E", "W"], W: ["S", "N"] };

const robot: Generator = (r, d) => {
  const size = d === 1 ? 6 : d === 2 ? 7 : 8;
  const segments = d === 1 ? int(r, 1, 2) : d === 2 ? int(r, 3, 4) : int(r, 5, 6);
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => "#"));
  let x = int(r, 1, size - 2);
  let y = int(r, 1, size - 2);
  const start = { x, y };
  const seen = new Set([`${x},${y}`]);
  let dir: Dir = pick(r, ["N", "E", "S", "W"] as const);
  const facing = d === 3 && r() < 0.5 ? pick(r, ["N", "E", "S", "W"] as const) : dir;
  const cells: Array<{ x: number; y: number }> = [];
  for (let s = 0; s < segments; s++) {
    if (s > 0) dir = TURN[dir][r() < 0.5 ? 0 : 1];
    const len = int(r, 1, 3);
    let moved = 0;
    for (let i = 0; i < len; i++) {
      const nx = x + DIRS[dir][0];
      const ny = y + DIRS[dir][1];
      if (nx < 1 || ny < 1 || nx > size - 2 || ny > size - 2 || seen.has(`${nx},${ny}`)) break;
      x = nx;
      y = ny;
      seen.add(`${x},${y}`);
      cells.push({ x, y });
      moved++;
    }
    if (moved === 0) return null;
  }
  if (cells.length < 2) return null;
  for (const c of cells) grid[c.y]![c.x] = ".";
  grid[start.y]![start.x] = "S";
  grid[y]![x] = "G";
  if (d >= 2 && cells.length > 2 && r() < 0.6) {
    const c = pick(r, cells.slice(0, -1));
    grid[c.y]![c.x] = "*";
  }
  const payload: RobotPayload = { prompt: "", grid: grid.map((row) => row.join("")), facing, maxBlocks: 12 };
  const par = minimumBlocks(payload);
  if (par === null || par > 10) return null;
  payload.maxBlocks = Math.min(12, par + 2);
  payload.prompt = pick(r, ["Leve o robô até a bandeira.", "Um caminho novo: planeje antes de executar.", "Chegue à bandeira com o menor programa que conseguir.", "Observe a direção do robô antes do primeiro bloco."]);
  return {
    difficulty: d,
    payload,
    solution: { par },
    explanation: `A menor solução usa ${par} bloco${par === 1 ? "" : "s"}. Agrupe passos repetidos no mesmo bloco (×N) e decomponha o caminho em retas e curvas.`,
  };
};

/* ------------------------------ Memória ------------------------------ */

const MEMORY: Record<Difficulty, Array<{ theme: string; pairs: Array<[string, string]> }>> = {
  1: [
    { theme: "Tags HTML", pairs: [["<p>", "Parágrafo"], ["<a>", "Link"], ["<img>", "Imagem"], ["<ul>", "Lista não ordenada"], ["<h1>", "Título principal"], ["<button>", "Botão"], ["<form>", "Formulário"], ["<input>", "Campo de entrada"]] },
    { theme: "Propriedades CSS", pairs: [["color", "Cor do texto"], ["margin", "Espaço externo"], ["padding", "Espaço interno"], ["display", "Tipo de caixa"], ["font-size", "Tamanho da fonte"], ["border", "Borda"], ["background", "Fundo"]] },
    { theme: "JavaScript básico", pairs: [["const", "Não pode ser reatribuída"], ["let", "Variável que pode mudar"], ["===", "Igualdade estrita"], ["return", "Devolve o resultado da função"], ["if", "Executa se a condição for verdadeira"], ["console.log", "Mostra no console"]] },
  ],
  2: [
    { theme: "Métodos de array", pairs: [["map", "Transforma cada item"], ["filter", "Seleciona itens"], ["reduce", "Acumula em um só valor"], ["find", "Primeiro item que atende"], ["some", "Algum item atende?"], ["every", "Todos os itens atendem?"], ["push", "Adiciona no fim"]] },
    { theme: "Git", pairs: [["git init", "Cria um repositório"], ["git add", "Prepara as mudanças"], ["git commit", "Registra no histórico"], ["git push", "Envia ao repositório remoto"], ["git pull", "Traz as mudanças do remoto"], ["git branch", "Lista ou cria ramificações"], ["git status", "Mostra o que mudou"]] },
    { theme: "Python", pairs: [["print", "Mostra na tela"], ["input", "Lê o que a pessoa digita"], ["len", "Tamanho de uma coleção"], ["def", "Cria uma função"], ["range", "Sequência de números"], ["append", "Adiciona na lista"], ["dict", "Pares chave e valor"]] },
  ],
  3: [
    { theme: "Dados e web", pairs: [["PRIMARY KEY", "Identifica cada registro"], ["FOREIGN KEY", "Aponta para outra tabela"], ["200", "HTTP: sucesso"], ["404", "HTTP: não encontrado"], ["201", "HTTP: criado"], ["500", "HTTP: erro no servidor"], ["401", "HTTP: precisa entrar"]] },
    { theme: "Segurança", pairs: [["Hash", "Senha guardada sem volta"], ["HTTPS", "Conexão criptografada"], ["Token", "Prova de sessão"], ["XSS", "Script injetado na página"], ["SQL injection", "Comando injetado na consulta"], ["RLS", "Regra de acesso por linha"]] },
    { theme: "Cláusulas SQL", pairs: [["SELECT", "Escolhe as colunas"], ["WHERE", "Filtra as linhas"], ["JOIN", "Junta tabelas"], ["GROUP BY", "Agrupa linhas"], ["ORDER BY", "Ordena o resultado"], ["LIMIT", "Limita a quantidade"], ["HAVING", "Filtra os grupos"]] },
  ],
};

const memoryFrom = (r: Rand, d: Difficulty, set: { theme: string; pairs: Array<[string, string]> }): Generated => {
  const pairs = sample(r, set.pairs, 4);
  const cards = pairs.flatMap(([term, def], i) => [
    { id: `t${i + 1}`, text: term },
    { id: `d${i + 1}`, text: def },
  ]);
  return {
    difficulty: d,
    payload: { prompt: set.theme, cards },
    solution: { pairs: pairs.map((_, i) => [`t${i + 1}`, `d${i + 1}`]) },
    explanation: pairs.map(([t, def]) => `${t}: ${def.toLowerCase()}`).join(" · "),
  };
};

/* ---------------------------- Seletor ao vivo ---------------------------- */

const WORDS = ["Estudar HTML", "Estudar CSS", "Fazer exercícios", "Revisar Git", "Ler a aula", "Treinar SQL", "Criar projeto", "Assistir vídeo"];
const MARKS: Array<{ cls: string; label: string }> = [
  { cls: "feito", label: "as tarefas feitas" },
  { cls: "urgente", label: "as tarefas urgentes" },
  { cls: "novo", label: "os itens novos" },
  { cls: "favorito", label: "os favoritos" },
];
const ORD = ["primeiro", "segundo", "terceiro", "quarto", "quinto"];

const cssGen: Generator = (r, d) => {
  const n = int(r, 4, 5);
  const items = sample(r, WORDS, n);
  const li = (text: string, attrs: string, target: boolean) => `  <li${attrs}${target ? " data-alvo" : ""}>${text}</li>`;
  const ul = (rows: string[]) => `<ul>\n${rows.join("\n")}\n</ul>`;

  if (d === 1) {
    if (r() < 0.6) {
      const mark = pick(r, MARKS);
      const k = int(r, 1, n - 1);
      const marked = new Set(sample(r, items.map((_, i) => i), k));
      return {
        difficulty: d,
        payload: { prompt: `Pegue ${mark.label}.`, html: ul(items.map((t, i) => li(t, marked.has(i) ? ` class="${mark.cls}"` : "", marked.has(i)))) },
        solution: { selector: `.${mark.cls}` },
        explanation: `O ponto seleciona pela classe: .${mark.cls}.`,
      };
    }
    const id = pick(r, ["titulo", "principal", "destaque", "topo"]);
    const heads = sample(r, ["Bem-vindo", "Seção", "Novidades", "Contato", "Sobre"], 3);
    const which = int(r, 0, 2);
    const html = heads.map((h, i) => (i === which ? `<h2 id="${id}" data-alvo>${h}</h2>` : `<h2>${h}</h2>`)).join("\n");
    return { difficulty: d, payload: { prompt: `Pegue só o título "${heads[which]}".`, html }, solution: { selector: `#${id}` }, explanation: `# seleciona pelo id: #${id}.` };
  }

  if (d === 2) {
    const kind = int(r, 0, 2);
    if (kind === 0) {
      const k = int(r, 2, n);
      return {
        difficulty: d,
        payload: { prompt: `Pegue só o ${ORD[k - 1]} item.`, html: ul(items.map((t, i) => li(t, "", i === k - 1))) },
        solution: { selector: `li:nth-child(${k})` },
        explanation: `:nth-child(${k}) pega o elemento que está na posição ${k} entre os irmãos.`,
      };
    }
    if (kind === 1) {
      return {
        difficulty: d,
        payload: { prompt: "Pegue só o último item.", html: ul(items.map((t, i) => li(t, "", i === n - 1))) },
        solution: { selector: "li:last-child" },
        explanation: ":last-child pega o último filho do elemento pai.",
      };
    }
    const types = sample(r, ["text", "email", "password", "number", "date"], 3);
    const target = pick(r, types);
    const html = types.map((t) => `<input type="${t}" name="campo-${t}"${t === target ? " data-alvo" : ""}>`).join("\n");
    return {
      difficulty: d,
      payload: { prompt: `Pegue só o campo do tipo ${target}.`, html },
      solution: { selector: `input[type="${target}"]` },
      explanation: `Colchetes selecionam por atributo: input[type="${target}"].`,
    };
  }

  if (r() < 0.5) {
    const even = r() < 0.5;
    const count = int(r, 5, 6);
    const rows = Array.from({ length: count }, (_, i) => li(String(i + 1), "", even ? (i + 1) % 2 === 0 : (i + 1) % 2 === 1));
    return {
      difficulty: d,
      payload: { prompt: `Pegue os itens das posições ${even ? "pares" : "ímpares"}.`, html: ul(rows) },
      solution: { selector: even ? "li:nth-child(2n)" : "li:nth-child(odd)" },
      explanation: even ? ":nth-child(2n) (ou :nth-child(even)) pega as posições 2, 4, 6..." : ":nth-child(odd) (ou :nth-child(2n+1)) pega as posições 1, 3, 5...",
    };
  }
  const labels = sample(r, ["Salvar", "Cancelar", "Enviar", "Voltar", "Excluir"], 3);
  const main = int(r, 0, 2);
  const html = [
    ...labels.map((l, i) => (i === main ? `<button class="btn primario" data-alvo>${l}</button>` : `<button class="btn">${l}</button>`)),
    `<a class="primario" href="/ajuda">Ajuda</a>`,
  ].join("\n");
  return {
    difficulty: d,
    payload: { prompt: "Pegue só o botão principal.", html },
    solution: { selector: ".btn.primario" },
    explanation: "Classes juntas, sem espaço (.btn.primario), exigem as duas no mesmo elemento.",
  };
};

/* ------------------------------ Monte o código ------------------------------ */

type OrderTpl = (r: Rand) => { prompt: string; lines: string[]; explanation: string };
const ORDER: Record<Difficulty, OrderTpl[]> = {
  1: [
    (r) => {
      const v = pick(r, VARS);
      const n = int(r, 2, 20);
      const k = int(r, 2, 5);
      return { prompt: `Mostre ${v} multiplicado por ${k}.`, lines: [`const ${v} = ${n};`, `const resultado = ${v} * ${k};`, "console.log(resultado);"], explanation: `Cada linha usa a anterior: ${v} → resultado (${n * k}) → exibição.` };
    },
    (r) => {
      const age = int(r, 10, 25);
      return {
        prompt: `Mostre a mensagem certa para a idade ${age}.`,
        lines: [`const idade = ${age};`, "if (idade >= 18) {", '  console.log("Maior de idade");', "} else {", '  console.log("Menor de idade");', "}"],
        explanation: `O if testa a condição; o else só roda quando ela é falsa. Para ${age}, aparece "${age >= 18 ? "Maior" : "Menor"} de idade".`,
      };
    },
  ],
  2: [
    (r) => {
      const f = pick(r, FUNCS);
      const k = int(r, 2, 9);
      const n = int(r, 2, 9);
      return { prompt: `Crie a função ${f} e mostre ${f}(${n}).`, lines: [`const ${f} = (n) => {`, `  const resultado = n * ${k};`, "  return resultado;", "};", `console.log(${f}(${n}));`], explanation: `A função precisa existir antes de ser chamada. O resultado é ${n * k}.` };
    },
    (r) => {
      const xs = [int(r, 5, 10), int(r, 5, 10), int(r, 5, 10)];
      return {
        prompt: "Calcule e mostre a média das notas.",
        lines: [`const notas = [${xs.join(", ")}];`, "const soma = notas.reduce((t, n) => t + n, 0);", "const media = soma / notas.length;", "console.log(media);"],
        explanation: "Cada linha depende da anterior: notas → soma → média → exibição.",
      };
    },
  ],
  3: [
    (r) => {
      const f = pick(r, ["dobro", "triplo", "calcular", "converter"]);
      const k = int(r, 2, 9);
      return {
        prompt: `Em Python: ${f} devolve 0 para negativos e n * ${k} nos outros casos.`,
        lines: [`def ${f}(n):`, "    if n < 0:", "        return 0", `    return n * ${k}`, `print(${f}(${int(r, 1, 9)}))`],
        explanation: "Em Python o bloco é definido pela indentação: o if fica dentro da função, e o print fora dela.",
      };
    },
    (r) => {
      const res = pick(r, RESOURCES);
      return {
        prompt: `Monte uma função que busca ${res} e trata falhas HTTP.`,
        lines: ["async function carregar() {", `  const resposta = await fetch("/api/${res}");`, '  if (!resposta.ok) throw new Error("Falha");', "  return resposta.json();", "}"],
        explanation: "A resposta precisa existir antes de ser verificada, e só vira JSON depois de confirmar que deu certo.",
      };
    },
    (r) => {
      const city = pick(r, CITIES);
      return {
        prompt: `Monte a consulta: clientes de ${city}, em ordem alfabética, só os 3 primeiros.`,
        lines: ["SELECT nome", "FROM clientes", `WHERE cidade = '${city}'`, "ORDER BY nome ASC", "LIMIT 3;"],
        explanation: "A ordem das cláusulas é fixa: SELECT, FROM, WHERE, ORDER BY e LIMIT.",
      };
    },
  ],
};

const IDS = "abcdefghijkl";
const orderFrom = (r: Rand, d: Difficulty, tpl: OrderTpl): Generated => {
  const t = tpl(r);
  const ids = t.lines.map((_, i) => IDS[i]!);
  return { difficulty: d, payload: { prompt: t.prompt, blocks: t.lines.map((code, i) => ({ id: ids[i]!, code })) }, solution: { order: ids }, explanation: t.explanation };
};

/* ------------------------------ Missões Full Stack ------------------------------ */

const FLOWS: Array<{ prompt: string; steps: string[]; explanation: string }> = [
  {
    prompt: "Uma compra na loja virtual.",
    steps: ["A pessoa clica em Finalizar compra", "O front envia o carrinho para a API", "A API confere quem está logado", "A API confere o estoque no banco", "A API registra o pedido", "O banco confirma a gravação", "A API responde 201 Created", "A tela mostra o número do pedido"],
    explanation: "Primeiro a API sabe quem pediu e se há estoque; só então grava o pedido e responde.",
  },
  {
    prompt: "Recuperar a senha esquecida.",
    steps: ["A pessoa informa o e-mail", "O servidor procura a conta", "O servidor gera um código temporário", "O e-mail com o link é enviado", "A pessoa abre o link", "O servidor confere se o código ainda vale", "A nova senha vira hash e é salva"],
    explanation: "O código temporário só é aceito se ainda for válido, e a senha nova é salva como hash.",
  },
  {
    prompt: "Enviar uma foto de perfil.",
    steps: ["A pessoa escolhe a imagem", "O front confere tipo e tamanho", "O arquivo é enviado ao armazenamento", "O servidor confere a permissão", "O endereço da foto é salvo no perfil", "A tela mostra a foto nova"],
    explanation: "Validar no front ajuda a pessoa, mas quem decide é o servidor, antes de salvar.",
  },
  {
    prompt: "Uma busca com filtro.",
    steps: ["A pessoa digita o termo", "O front espera ela parar de digitar", "O front pede GET /busca?termo=...", "A API valida o termo", "A API consulta o banco com o filtro", "A API responde em JSON", "A tela mostra os resultados"],
    explanation: "Esperar a digitação parar evita uma requisição por tecla; a API valida antes de consultar.",
  },
  {
    prompt: "Do código até o site no ar.",
    steps: ["Commit na branch da funcionalidade", "git push para o GitHub", "Abre o pull request", "Os testes automáticos rodam", "Alguém revisa e aprova", "Merge na main", "Build de produção", "Site publicado"],
    explanation: "O PR só existe depois do push; a publicação usa o código que entrou na main.",
  },
  {
    prompt: "Login e acesso a uma página protegida.",
    steps: ["A pessoa envia e-mail e senha", "O servidor compara a senha com o hash", "O servidor emite um token de sessão", "O navegador guarda a sessão", "As próximas requisições levam o token", "O servidor verifica o token antes de responder"],
    explanation: "Autenticar uma vez gera o token; depois, cada requisição protegida é verificada.",
  },
];

const flowFrom = (r: Rand, d: Difficulty, flow: (typeof FLOWS)[number]): Generated => {
  const size = Math.min(flow.steps.length, d === 1 ? 4 : d === 2 ? 5 : 6);
  // Um subconjunto que mantém a ordem original continua sendo um fluxo válido.
  const keep = sample(r, flow.steps.map((_, i) => i), size).sort((a, b) => a - b);
  const ids = keep.map((_, i) => IDS[i]!);
  return {
    difficulty: d,
    payload: { prompt: flow.prompt, blocks: keep.map((s, i) => ({ id: ids[i]!, code: flow.steps[s]! })) },
    solution: { order: ids },
    explanation: flow.explanation,
  };
};

/* ------------------------------ Conteúdo extra ------------------------------ */
// Situações novas (conceitos diferentes, não as mesmas com outros nomes).

MEMORY[1].push(
  { theme: "Comandos do terminal", pairs: [["cd", "Entrar em uma pasta"], ["ls", "Listar arquivos"], ["mkdir", "Criar pasta"], ["pwd", "Mostrar a pasta atual"], ["rm", "Apagar arquivo"], ["cp", "Copiar arquivo"]] },
  { theme: "Tipos de dados", pairs: [["string", "Texto"], ["number", "Número"], ["boolean", "Verdadeiro ou falso"], ["array", "Lista ordenada"], ["object", "Pares de chave e valor"], ["null", "Ausência intencional de valor"]] },
);
MEMORY[2].push(
  { theme: "React", pairs: [["useState", "Estado do componente"], ["props", "Dados vindos do componente pai"], ["useEffect", "Efeito depois de renderizar"], ["key", "Identifica itens de uma lista"], ["JSX", "Marcação dentro do JavaScript"], ["componente", "Função que devolve interface"]] },
  { theme: "Métodos HTTP", pairs: [["GET", "Buscar dados"], ["POST", "Criar um recurso"], ["PUT", "Substituir um recurso"], ["PATCH", "Alterar parte de um recurso"], ["DELETE", "Apagar um recurso"], ["header", "Metadado da requisição"]] },
);
MEMORY[3].push(
  { theme: "Complexidade", pairs: [["O(1)", "Tempo constante"], ["O(n)", "Cresce junto com a entrada"], ["O(n²)", "Laço dentro de laço"], ["O(log n)", "Corta o problema pela metade"], ["O(n log n)", "Boa ordenação"], ["Memoização", "Guardar resultados já calculados"]] },
  { theme: "Estruturas de dados", pairs: [["Pilha", "Último a entrar, primeiro a sair"], ["Fila", "Primeiro a entrar, primeiro a sair"], ["Mapa (hash)", "Busca rápida por chave"], ["Árvore", "Hierarquia de nós"], ["Grafo", "Nós ligados por arestas"], ["Conjunto", "Itens sem repetição"]] },
);

TYPING[1].push(
  () => ({ prompt: "Um botão de formulário", language: "html", text: '<button type="submit">Enviar</button>', explanation: "type=\"submit\" faz o botão enviar o formulário." }),
  (r) => ({ prompt: "Registrar uma mudança no Git", language: "bash", text: `git commit -m "${pick(r, ["Adiciona menu", "Corrige busca", "Cria rodapé"])}"`, explanation: "-m traz a mensagem do commit entre aspas." }),
);
TYPING[2].push(
  () => ({ prompt: "Desestruturar um objeto", language: "js", text: "const { nome, idade } = pessoa;", explanation: "As chaves criam variáveis com os mesmos nomes das propriedades." }),
  () => ({ prompt: "Contar linhas em SQL", language: "sql", text: "SELECT COUNT(*) FROM pedidos WHERE status = 'pago';", explanation: "COUNT(*) conta as linhas que passaram pelo WHERE." }),
);
TYPING[3].push(
  () => ({ prompt: "Um componente React", language: "jsx", text: "export default function App() { return <h1>Olá</h1>; }", explanation: "Um componente é uma função que devolve JSX." }),
  () => ({ prompt: "Uma função em Python", language: "python", text: "def media(v): return sum(v) / len(v)", explanation: "sum soma a lista e len conta os itens." }),
  () => ({ prompt: "Uma rota de API com Express", language: "js", text: 'app.get("/api/cursos", (req, res) => res.json(cursos));', explanation: "A rota recebe o pedido (req) e responde (res) com JSON." }),
);

ORDER[1].push((r) => {
  const pergunta = pick(r, ["Seu nome: ", "Como você se chama? "]);
  return {
    prompt: "Em Python: pergunte o nome e mostre uma saudação.",
    lines: [`nome = input("${pergunta}")`, 'saudacao = "Olá, " + nome', "print(saudacao)"],
    explanation: "Primeiro a entrada, depois a conta com ela e, por fim, a saída.",
  };
});
ORDER[2].push((r) => {
  const n = int(r, 3, 5);
  return {
    prompt: `Mostre os números de 1 a ${n} e, depois, a palavra fim.`,
    lines: [`for (let i = 1; i <= ${n}; i++) {`, "  console.log(i);", "}", 'console.log("fim");'],
    explanation: "O que está dentro das chaves repete; o que vem depois roda uma vez, no final.",
  };
});
ORDER[3].push((r) => {
  const branch = pick(r, ["nova-busca", "menu-mobile", "corrige-login"]);
  return {
    prompt: "Crie uma branch, registre a mudança e envie ao GitHub.",
    lines: [`git checkout -b ${branch}`, "git add .", 'git commit -m "Implementa a mudança"', `git push -u origin ${branch}`],
    explanation: "A branch vem antes da mudança; add prepara, commit registra e push envia.",
  };
});

/* ------------------------------ Seleção das fases ------------------------------ */

type Keyed = SeedGameRound & { key: string };

/**
 * Candidatos de uma dificuldade, cada um com a CHAVE da situação. Variações do mesmo
 * modelo (outros nomes ou números) têm a mesma chave: contam como a mesma situação.
 */
function candidates(game: SeedGame, d: Difficulty, r: Rand): Keyed[] {
  const out: Keyed[] = [];
  const add = (key: string, g: Generated | SeedGameRound | null) => {
    if (g) out.push({ ...g, key });
  };
  switch (game.kind as GameKind) {
    case "typing":
      TYPING[d].forEach((tpl, i) => {
        const t = tpl(r);
        add(`dig:${d}:${i}`, { difficulty: d, payload: { prompt: t.prompt, language: t.language, text: t.text }, solution: {}, explanation: t.explanation });
      });
      break;
    case "lightning":
      for (const rule of RULES_BY_DIFFICULTY[d]) {
        const w = buildWave(r, d, rule);
        if (w) out.push(waveRound(w, d) as Keyed);
      }
      break;
    case "bug_hunt":
      for (const b of BUGS) if (b.difficulty === d) out.push(bugRound(b) as Keyed);
      break;
    case "memory":
      MEMORY[d].forEach((set) => add(`mem:${set.theme}`, memoryFrom(r, d, set)));
      break;
    case "code_order":
      ORDER[d].forEach((tpl, i) => add(`ordem:${d}:${i}`, orderFrom(r, d, tpl)));
      break;
    case "fullstack":
      FLOWS.forEach((f, i) => add(`fluxo:${d}:${i}`, flowFrom(r, d, f)));
      break;
    case "logic":
      for (let i = 0; i < 40 && out.length < 8; i++) {
        const g = robot(r, d, game);
        if (g) add(`robo:${(g.payload as { grid: string[] }).grid.join("/")}`, g);
      }
      break;
    case "sql":
      for (let i = 0; i < 60 && out.length < 10; i++) {
        const g = sqlGen(r, d, game);
        if (!g) continue;
        const q = (g.solution as { query: SqlQuery }).query;
        add(`sql:${q.table}:${q.columns.join(",")}:${q.where?.column ?? ""}${q.where?.op ?? ""}:${q.orderBy?.column ?? ""}:${q.limit ? "l" : ""}`, g);
      }
      break;
    case "css":
      for (let i = 0; i < 40 && out.length < 10; i++) {
        const g = cssGen(r, d, game);
        if (g) add(`css:${(g.solution as { selector: string }).selector}`, g);
      }
      break;
  }
  return out;
}

export interface PlayOptions {
  /** Chaves das situações já jogadas, da mais antiga para a mais recente. */
  recent?: readonly string[];
  /** Quem já domina o jogo recebe uma fase difícil no lugar de uma fácil. */
  advanced?: boolean;
}

/**
 * Fases de uma partida. Por dificuldade, junta as fases cadastradas e as geradas e escolhe
 * primeiro as situações que a pessoa nunca viu; depois, as vistas há mais tempo. O sorteio
 * só desempata. Assim a partida seguinte não repete a anterior enquanto houver conteúdo.
 */
export function buildPlayRounds(game: SeedGame, seed: string, options: PlayOptions = {}): Keyed[] {
  const r = seededRandom(`${game.slug}:${seed}`);
  const recent = options.recent ?? [];
  const lastSeen = new Map<string, number>();
  recent.forEach((k, i) => lastSeen.set(k, i));

  const counts: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0 };
  for (const x of game.rounds) counts[x.difficulty]++;
  const points = (d: Difficulty) => game.rounds.find((x) => x.difficulty === d)?.points;
  if (options.advanced && counts[1] > 1 && counts[3] > 0) {
    counts[1]--;
    counts[3]++;
  }

  const out: Keyed[] = [];
  const used = new Set<string>();
  for (const d of [1, 2, 3] as const) {
    if (counts[d] === 0) continue;
    const pool = new Map<string, Keyed>();
    game.rounds.forEach((x, i) => {
      if (x.difficulty === d) {
        const key = x.key ?? (game.kind === "memory" ? `mem:${(x.payload as { prompt: string }).prompt}` : `${game.slug}:f${i}`);
        pool.set(key, { ...x, key });
      }
    });
    for (const c of candidates(game, d, r)) {
      if (pool.has(c.key) || !validateRound(game.kind as GameKind, c.payload, c.solution).ok) continue;
      const p = points(d);
      pool.set(c.key, p === undefined ? c : { ...c, points: p });
    }
    const ranked = [...pool.values()]
      .filter((c) => !used.has(c.key))
      .map((c) => ({ c, seen: lastSeen.get(c.key) ?? -1, tie: r() }))
      .sort((a, b) => a.seen - b.seen || a.tie - b.tie)
      .slice(0, counts[d])
      .map((x) => x.c);
    for (const c of ranked) used.add(c.key);
    out.push(...ranked);
  }
  return out;
}
