import type { SeedGame } from "../schema";
import { fixedWaves } from "./rounds";

export const robo: SeedGame = {
  slug: "robo-programador",
  kind: "logic",
  title: "Robô programador",
  description: "Monte a sequência de comandos e leve o robô até a bandeira. Lógica, sequência e repetição na prática.",
  rules:
    "Adicione blocos (frente, virar à esquerda, virar à direita) e ajuste quantas vezes cada um se repete. Clique em Executar e veja o robô andar. Se bater na parede, ajuste o programa. Usar o menor número de blocos vale pontos extras.",
  rounds: [
    { difficulty: 1, payload: { prompt: "Leve o robô até a bandeira.", grid: ["#####", "#S.G#", "#####"], facing: "E", maxBlocks: 3 }, solution: { par: 1 }, explanation: "Um único bloco \"frente ×2\" resolve: repetir é mais curto do que escrever o mesmo comando duas vezes." },
    { difficulty: 1, payload: { prompt: "Agora tem uma curva.", grid: ["#####", "#S..#", "###.#", "###G#", "#####"], facing: "E", maxBlocks: 5 }, solution: { par: 3 }, explanation: "frente ×2, virar à direita, frente ×2. Virar não sai do lugar: só muda a direção." },
    { difficulty: 2, payload: { prompt: "Dê a volta no quarteirão (e pegue a estrela, se quiser).", grid: ["#######", "#S..*.#", "#####.#", "#G....#", "#######"], facing: "E", maxBlocks: 6 }, solution: { par: 5 }, explanation: "frente ×4, direita, frente ×2, direita, frente ×4. Decompor o caminho em retas e curvas é o mesmo que decompor um problema em partes." },
    { difficulty: 2, payload: { prompt: "Desça a escada.", grid: ["######", "#S.###", "##..##", "###.G#", "######"], facing: "E", maxBlocks: 10 }, solution: { par: 9 }, explanation: "O padrão \"frente, direita, frente, esquerda\" se repete. Reconhecer padrões é o primeiro passo para usar laços." },
    { difficulty: 3, payload: { prompt: "Um caminho em serpentina.", grid: ["#######", "#G#...#", "#.#.#.#", "#...#S#", "#######"], facing: "N", maxBlocks: 10 }, solution: { par: 9 }, explanation: "frente ×2, esquerda, frente ×2, esquerda, frente ×2, direita, frente ×2, direita, frente ×2." },
    { difficulty: 3, payload: { prompt: "O labirinto final. Planeje antes de executar!", grid: ["########", "#S.....#", "######.#", "#*.....#", "#.######", "#.....G#", "########"], facing: "E", maxBlocks: 10 }, solution: { par: 9 }, explanation: "frente ×5, direita, frente ×2, direita, frente ×5, esquerda, frente ×2, esquerda, frente ×5. Planejar no papel (pseudocódigo!) evita tentativa e erro." },
  ],
};

export const chuva: SeedGame = {
  slug: "chuva-de-codigo",
  kind: "lightning",
  lives: 3,
  title: "Chuva de código",
  description: "Expressões de código caem em três pistas. Mova o coletor e pegue só as que obedecem à regra da onda.",
  rules:
    "Cada onda tem uma regra, como \"pegue as que dão número par\". Mova o coletor com ← e → (ou A e D, ou tocando nas pistas) e pegue só as expressões certas. Pegar uma isca ou deixar passar muitas certas faz perder a onda (e uma vida). As ondas ficam mais rápidas e as expressões, mais traiçoeiras.",
  rounds: fixedWaves(),
};

const produtos = {
  name: "produtos",
  columns: ["id", "nome", "categoria", "preco", "estoque"],
  rows: [
    [1, "Teclado", "periferico", 150, 3],
    [2, "Monitor", "tela", 900, 0],
    [3, "Mouse", "periferico", 80, 10],
    [4, "Webcam", "periferico", 220, 5],
    [5, "Notebook", "computador", 3500, 2],
  ],
};
const clientes = {
  name: "clientes",
  columns: ["id", "nome", "cidade", "idade"],
  rows: [
    [1, "Ana", "Recife", 28],
    [2, "Bruno", "Salvador", 35],
    [3, "Carla", "Recife", 22],
    [4, "Davi", "Curitiba", 41],
  ],
};
const tables = [produtos, clientes];
const q = (table: string, columns: string[], extra: Partial<{ where: unknown; orderBy: unknown; limit: number }> = {}) => ({
  query: { table, columns, where: extra.where ?? null, orderBy: extra.orderBy ?? null, limit: extra.limit ?? null },
});

export const sql: SeedGame = {
  slug: "desafio-sql",
  kind: "sql",
  title: "Construtor de consultas SQL",
  description: "Monte a consulta peça por peça, execute nas tabelas e chegue exatamente no resultado pedido.",
  rules:
    "Escolha a tabela, as colunas, o filtro (WHERE), a ordenação (ORDER BY) e o limite. Clique em Executar para ver o resultado ao vivo e compare com o que foi pedido. Quando o resultado bater, confirme a resposta.",
  rounds: [
    { difficulty: 1, payload: { prompt: "Liste o nome de todos os produtos.", tables }, solution: q("produtos", ["nome"]), explanation: "SELECT nome FROM produtos; — sem WHERE, todas as linhas aparecem." },
    { difficulty: 1, payload: { prompt: "Mostre o nome dos clientes de Recife.", tables }, solution: q("clientes", ["nome"], { where: { column: "cidade", op: "=", value: "Recife" } }), explanation: "WHERE filtra as linhas: só Ana e Carla moram em Recife." },
    { difficulty: 1, payload: { prompt: "Quais produtos estão sem estoque? Mostre o nome.", tables }, solution: q("produtos", ["nome"], { where: { column: "estoque", op: "=", value: 0 } }), explanation: "estoque = 0 devolve só o Monitor." },
    { difficulty: 2, payload: { prompt: "Mostre nome e preço dos produtos da categoria periferico.", tables }, solution: q("produtos", ["nome", "preco"], { where: { column: "categoria", op: "=", value: "periferico" } }), explanation: "Duas colunas no SELECT e um filtro por categoria: Teclado, Mouse e Webcam." },
    { difficulty: 2, payload: { prompt: "Liste nome e preço dos produtos, do mais caro para o mais barato.", tables }, solution: q("produtos", ["nome", "preco"], { orderBy: { column: "preco", dir: "DESC" } }), explanation: "ORDER BY preco DESC coloca o Notebook primeiro e o Mouse por último." },
    { difficulty: 3, payload: { prompt: "Quais são os 2 produtos mais baratos? Mostre nome e preço.", tables }, solution: q("produtos", ["nome", "preco"], { orderBy: { column: "preco", dir: "ASC" }, limit: 2 }), explanation: "Ordene do mais barato (ASC) e limite a 2 linhas: Mouse e Teclado." },
    { difficulty: 3, payload: { prompt: "Mostre nome e idade dos clientes com 30 anos ou mais, do mais novo ao mais velho.", tables }, solution: q("clientes", ["nome", "idade"], { where: { column: "idade", op: ">=", value: 30 }, orderBy: { column: "idade", dir: "ASC" } }), explanation: "WHERE idade >= 30 e ORDER BY idade ASC: Bruno (35) e depois Davi (41)." },
  ],
};

export const css: SeedGame = {
  slug: "seletor-css",
  kind: "css",
  title: "Seletor CSS ao vivo",
  description: "Digite um seletor e veja na hora quais elementos ele pega. Acerte exatamente os alvos ★.",
  rules:
    "O mini-site mostra os elementos alvo com ★. Digite um seletor CSS: os elementos que ele seleciona acendem em azul enquanto você digita. Confirme quando pegar todos os alvos e nenhum outro.",
  rounds: [
    { difficulty: 1, payload: { prompt: "Pegue as tarefas feitas.", html: '<ul>\n  <li class="feito" data-alvo>Estudar HTML</li>\n  <li>Estudar CSS</li>\n  <li class="feito" data-alvo>Fazer exercícios</li>\n</ul>' }, solution: { selector: ".feito" }, explanation: "O ponto seleciona pela classe: .feito." },
    { difficulty: 1, payload: { prompt: "Pegue só o título principal.", html: '<h1 id="titulo" data-alvo>Bem-vindo</h1>\n<h2>Seção</h2>\n<h2>Outra seção</h2>' }, solution: { selector: "#titulo" }, explanation: "# seleciona pelo id. h1 também funcionaria aqui." },
    { difficulty: 2, payload: { prompt: "Pegue só os links do menu.", html: '<nav>\n  <a href="/" data-alvo>Início</a>\n  <a href="/sobre" data-alvo>Sobre</a>\n</nav>\n<p>Leia <a href="/blog">o blog</a>.</p>' }, solution: { selector: "nav a" }, explanation: "nav a pega links descendentes de nav; o link do parágrafo fica de fora." },
    { difficulty: 2, payload: { prompt: "Pegue só o primeiro item.", html: "<ul>\n  <li data-alvo>Um</li>\n  <li>Dois</li>\n  <li>Três</li>\n</ul>" }, solution: { selector: "li:first-child" }, explanation: ":first-child pega o elemento que é o primeiro filho do pai." },
    { difficulty: 2, payload: { prompt: "Pegue só o campo de e-mail.", html: '<input type="text" name="nome">\n<input type="email" name="email" data-alvo>\n<input type="password" name="senha">' }, solution: { selector: 'input[type="email"]' }, explanation: "Colchetes selecionam por atributo: input[type=\"email\"] (ou [name=\"email\"])." },
    { difficulty: 3, payload: { prompt: "Pegue os itens das posições pares.", html: "<ul>\n  <li>1</li>\n  <li data-alvo>2</li>\n  <li>3</li>\n  <li data-alvo>4</li>\n  <li>5</li>\n</ul>" }, solution: { selector: "li:nth-child(2n)" }, explanation: ":nth-child(2n) (ou :nth-child(even)) pega as posições 2, 4, 6..." },
    { difficulty: 3, payload: { prompt: "Pegue só o parágrafo que é filho direto do card.", html: '<div class="card">\n  <p data-alvo>Texto do card</p>\n  <div class="rodape">\n    <p>Rodapé</p>\n  </div>\n</div>' }, solution: { selector: ".card > p" }, explanation: "> seleciona só filhos diretos; .card p pegaria também o parágrafo do rodapé." },
    { difficulty: 3, payload: { prompt: "Pegue só o botão principal.", html: '<button class="btn">Cancelar</button>\n<button class="btn primario" data-alvo>Salvar</button>\n<a class="primario" href="/ajuda">Ajuda</a>' }, solution: { selector: ".btn.primario" }, explanation: "Classes juntas, sem espaço (.btn.primario), exigem as duas no mesmo elemento." },
  ],
};

export const fullstack: SeedGame = {
  slug: "missoes-full-stack",
  kind: "fullstack",
  title: "Missões Full Stack",
  description: "Monte o fluxo de cada missão: do clique no navegador até o banco de dados e de volta.",
  rules: "Cada missão mostra as etapas embaralhadas de um fluxo real de uma aplicação. Arraste (ou use as setas) para colocá-las na ordem em que acontecem.",
  rounds: [
    {
      difficulty: 1,
      payload: {
        prompt: "Missão 1: o caminho de uma página até a sua tela.",
        blocks: [
          { id: "a", code: "Você digita o endereço no navegador" },
          { id: "b", code: "O DNS encontra o IP do servidor" },
          { id: "c", code: "O navegador envia uma requisição HTTP" },
          { id: "d", code: "O servidor monta a resposta" },
          { id: "e", code: "O navegador desenha a página" },
        ],
      },
      solution: { order: ["a", "b", "c", "d", "e"] },
      explanation: "Antes de falar com o servidor, o navegador precisa saber o endereço IP dele — é o papel do DNS.",
    },
    {
      difficulty: 2,
      payload: {
        prompt: "Missão 2: carregar a lista de tarefas do Tarefas+.",
        blocks: [
          { id: "a", code: "A tela pede GET /tarefas" },
          { id: "b", code: "A API confere quem está logado" },
          { id: "c", code: "A API consulta o banco de dados" },
          { id: "d", code: "A API responde em JSON" },
          { id: "e", code: "O React mostra a lista" },
        ],
      },
      solution: { order: ["a", "b", "c", "d", "e"] },
      explanation: "Autorização vem antes do acesso aos dados: a API só consulta o banco depois de saber quem pediu.",
    },
    {
      difficulty: 2,
      payload: {
        prompt: "Missão 3: cadastrar uma pessoa com segurança.",
        blocks: [
          { id: "a", code: "O formulário envia nome, e-mail e senha" },
          { id: "b", code: "O servidor valida os campos" },
          { id: "c", code: "Confere se o e-mail já existe" },
          { id: "d", code: "Gera o hash da senha" },
          { id: "e", code: "Salva o usuário no banco" },
          { id: "f", code: "Responde 201 Created" },
        ],
      },
      solution: { order: ["a", "b", "c", "d", "e", "f"] },
      explanation: "Senhas nunca são salvas em texto puro: o hash é gerado antes de gravar.",
    },
    {
      difficulty: 3,
      payload: {
        prompt: "Missão 4: do seu código até o site no ar.",
        blocks: [
          { id: "a", code: "Commit na branch da funcionalidade" },
          { id: "b", code: "⬆️ git push para o GitHub" },
          { id: "c", code: "Abre o pull request" },
          { id: "d", code: "Merge na main" },
          { id: "e", code: "Build de produção" },
          { id: "f", code: "Site publicado" },
        ],
      },
      solution: { order: ["a", "b", "c", "d", "e", "f"] },
      explanation: "O PR só existe depois que a branch está no GitHub; a publicação usa o código que entrou na main.",
    },
    {
      difficulty: 3,
      payload: {
        prompt: "Missão 5: login e acesso a uma página protegida.",
        blocks: [
          { id: "a", code: "A pessoa envia e-mail e senha" },
          { id: "b", code: "O servidor compara a senha com o hash" },
          { id: "c", code: "O servidor emite um token de sessão" },
          { id: "d", code: "O navegador guarda a sessão" },
          { id: "e", code: "As próximas requisições levam o token" },
          { id: "f", code: "O servidor verifica o token antes de responder" },
        ],
      },
      solution: { order: ["a", "b", "c", "d", "e", "f"] },
      explanation: "Autenticar uma vez gera o token; depois, cada requisição protegida é verificada no servidor.",
    },
  ],
};
