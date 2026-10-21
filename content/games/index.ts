import type { SeedGame } from "../schema";

/**
 * Jogos de revisão. As alternativas são embaralhadas na hora de jogar, então a
 * posição da resposta correta aqui não importa.
 */
const tabelas = [
  {
    name: "clientes",
    columns: ["id", "nome", "cidade"],
    rows: [
      [1, "Ana", "Recife"],
      [2, "Bruno", "Salvador"],
      [3, "Carla", "Recife"],
    ],
  },
  {
    name: "pedidos",
    columns: ["id", "cliente_id", "total"],
    rows: [
      [10, 1, 120],
      [11, 1, 80],
      [12, 3, 200],
    ],
  },
];

export const games: SeedGame[] = [
  {
    slug: "desafio-de-logica",
    kind: "logic",
    title: "Desafio de lógica",
    description: "Sequências, condições e laços em etapas que ficam mais difíceis.",
    rules: "Responda cada desafio. Eles começam simples e ficam mais difíceis. Depois de responder, leia a explicação antes de seguir.",
    rounds: [
      {
        difficulty: 1,
        payload: { prompt: "Qual é o próximo número da sequência 2, 4, 6, 8, ...?", options: ["9", "10", "12", "16"] },
        solution: { index: 1 },
        explanation: "A sequência soma 2 a cada passo: 8 + 2 = 10.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Regra: \"se está chovendo, eu levo guarda-chuva\". Hoje não levei guarda-chuva. Se a regra é sempre seguida, o que se conclui?",
          options: ["Não está chovendo", "Está chovendo", "Vai chover amanhã", "A regra é falsa"],
        },
        solution: { index: 0 },
        explanation: "Se chovesse, o guarda-chuva teria ido junto. Como não foi, não está chovendo. É a contrapositiva da regra.",
      },
      {
        difficulty: 1,
        payload: { prompt: "Qual valor é exibido?", code: "let x = 3;\nx = x * 2;\nx = x + 1;\nconsole.log(x);", options: ["6", "7", "8", "9"] },
        solution: { index: 1 },
        explanation: "x vale 3, depois 6 (3 × 2) e por fim 7 (6 + 1).",
      },
      {
        difficulty: 2,
        payload: { prompt: "Quantas vezes o corpo do laço executa?", code: "for (let i = 10; i > 0; i -= 3) {\n  // ...\n}", options: ["3", "4", "5", "10"] },
        solution: { index: 1 },
        explanation: "i assume 10, 7, 4 e 1. Em seguida vira -2, e a condição i > 0 fica falsa: 4 voltas.",
      },
      {
        difficulty: 2,
        payload: { prompt: "Qual valor é exibido?", code: "const a = true;\nconst b = false;\nconsole.log(a && !b || b);", options: ["true", "false", "undefined", "Erro"] },
        solution: { index: 0 },
        explanation: "!b é true; a && true é true; true || false é true. O && é avaliado antes do ||.",
      },
      {
        difficulty: 2,
        payload: { prompt: "Qual é o próximo número da sequência 1, 1, 2, 3, 5, 8, ...?", options: ["11", "12", "13", "16"] },
        solution: { index: 2 },
        explanation: "Cada número é a soma dos dois anteriores (sequência de Fibonacci): 5 + 8 = 13.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Qual valor é exibido?",
          code: "let total = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 === 0) continue;\n  total += i;\n}\nconsole.log(total);",
          options: ["9", "15", "6", "5"],
        },
        solution: { index: 0 },
        explanation: "continue pula os pares. Somam-se só 1, 3 e 5: total 9.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Uma regra transforma um número: se for par, dobra; se for ímpar, soma 1. Começando em 3 e aplicando a regra 3 vezes, qual é o resultado?",
          options: ["8", "16", "10", "12"],
        },
        solution: { index: 1 },
        explanation: "3 é ímpar → 4; 4 é par → 8; 8 é par → 16.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Numa lista ORDENADA de 1000 itens, a busca binária descarta metade da lista a cada comparação. No máximo, quantas comparações ela precisa?",
          options: ["10", "100", "500", "1000"],
        },
        solution: { index: 0 },
        explanation: "Dividir 1000 pela metade repetidamente chega a 1 em cerca de 10 passos, porque 2¹⁰ = 1024.",
      },
    ],
  },
  {
    slug: "caca-aos-bugs",
    kind: "bug_hunt",
    title: "Caça aos bugs",
    description: "Encontre a linha com o erro e entenda por que ela quebra o programa.",
    rules: "Leia o código e toque na linha que contém o bug. Depois da resposta, a explicação mostra o que acontece e como corrigir.",
    rounds: [
      {
        difficulty: 1,
        payload: { prompt: "O programa deveria cumprimentar a Ana.", language: "js", code: 'const nome = "Ana";\nconsole.log("Olá, " + nme);' },
        solution: { line: 2 },
        explanation: "A variável se chama `nome`, mas a linha 2 usa `nme`. O resultado é `ReferenceError: nme is not defined`.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Deveria mostrar \"Tem 18 anos\" apenas quando idade for 18.",
          language: "js",
          code: 'const idade = 20;\nif (idade = 18) {\n  console.log("Tem 18 anos");\n}',
        },
        solution: { line: 2 },
        explanation: "`=` tenta atribuir 18 a uma constante (TypeError). Para comparar, use `===`.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Deveria mostrar 6 (1 + 2 + 3).",
          language: "js",
          code: "let soma = 0;\nfor (let i = 1; i <= 3; i++) {\n  let soma = soma + i;\n}\nconsole.log(soma);",
        },
        solution: { line: 3 },
        explanation: "A linha 3 declara um novo `soma` dentro do bloco e tenta lê-lo antes de existir (ReferenceError). Remova o `let`: `soma = soma + i;`.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "A função deveria calcular a média das notas.",
          language: "js",
          code: "function media(notas) {\n  let soma = 0;\n  for (const n of notas) {\n    soma += n;\n  }\n  return soma / notas.lenght;\n}",
        },
        solution: { line: 6 },
        explanation: "`lenght` está escrito errado. `notas.lenght` é undefined, e a divisão resulta em NaN. O correto é `length`.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Deveria mostrar o maior número da lista.",
          language: "js",
          code: "const lista = [3, 1, 2];\nconst ordenada = [...lista].sort((a, b) => a - b);\nconst maior = ordenada[3];\nconsole.log(maior);",
        },
        solution: { line: 3 },
        explanation: "A lista tem 3 itens, com índices 0, 1 e 2. `ordenada[3]` é undefined. Use `ordenada[ordenada.length - 1]`.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Deveria buscar e devolver a lista de produtos.",
          language: "js",
          code: 'async function carregar() {\n  const resposta = fetch("/api/produtos");\n  const dados = await resposta.json();\n  return dados;\n}',
        },
        solution: { line: 2 },
        explanation: "Sem `await`, `resposta` é uma Promise, não a resposta. Chamar `.json()` nela gera TypeError. Corrija com `await fetch(...)`.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Deveria salvar só quando o botão for clicado.",
          language: "js",
          code: 'const botao = document.querySelector("#salvar");\nbotao.addEventListener("click", salvar());\n\nfunction salvar() {\n  console.log("salvo");\n}',
        },
        solution: { line: 2 },
        explanation: "`salvar()` executa a função na hora e passa `undefined` ao ouvinte. Passe a referência: `addEventListener(\"click\", salvar)`.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "desconto(200, 10) deveria devolver 180.",
          language: "js",
          code: "function desconto(preco, percentual) {\n  if (percentual > 100) {\n    return preco;\n  }\n  return preco - preco * percentual;\n}",
        },
        solution: { line: 5 },
        explanation: "O percentual precisa ser dividido por 100. Do jeito que está, desconto(200, 10) devolve 200 − 2000 = −1800. Correção: `preco * (percentual / 100)`.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Em Java, deveria mostrar \"iguais\" quando os textos forem iguais.",
          language: "java",
          code: 'String a = "oi";\nString b = new String("oi");\nif (a == b) {\n  System.out.println("iguais");\n}',
        },
        solution: { line: 3 },
        explanation: "Em Java, `==` compara referências (se é o mesmo objeto), não o conteúdo. Para comparar textos, use `a.equals(b)`.",
      },
    ],
  },
  {
    slug: "monte-o-codigo",
    kind: "code_order",
    title: "Monte o código",
    description: "Coloque os blocos na ordem certa para formar um programa que funciona.",
    rules: "Use os botões de subir e descer (ou arraste com o teclado) para ordenar os blocos. Quando achar que está certo, confira.",
    rounds: [
      {
        difficulty: 1,
        payload: {
          prompt: "Mostre no console o valor de a somado a 3.",
          blocks: [
            { id: "a", code: "const a = 2;" },
            { id: "b", code: "const soma = a + 3;" },
            { id: "c", code: "console.log(soma);" },
          ],
        },
        solution: { order: ["a", "b", "c"] },
        explanation: "Primeiro a variável existe, depois é usada no cálculo e, por fim, o resultado é exibido.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Mostre \"Menor de idade\" quando a idade for menor que 18.",
          blocks: [
            { id: "a", code: "const idade = 17;" },
            { id: "b", code: "if (idade >= 18) {" },
            { id: "c", code: '  console.log("Maior de idade");' },
            { id: "d", code: "} else {" },
            { id: "e", code: '  console.log("Menor de idade");' },
            { id: "f", code: "}" },
          ],
        },
        solution: { order: ["a", "b", "c", "d", "e", "f"] },
        explanation: "O if testa a condição; o bloco do else só executa quando ela é falsa. Para 17, aparece \"Menor de idade\".",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Crie a função dobro e mostre dobro(4).",
          blocks: [
            { id: "a", code: "const dobro = (n) => {" },
            { id: "b", code: "  const resultado = n * 2;" },
            { id: "c", code: "  return resultado;" },
            { id: "d", code: "};" },
            { id: "e", code: "console.log(dobro(4));" },
          ],
        },
        solution: { order: ["a", "b", "c", "d", "e"] },
        explanation: "Uma função em const precisa ser criada antes de ser chamada. O resultado exibido é 8.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Calcule e mostre a média das notas.",
          blocks: [
            { id: "a", code: "const notas = [7, 8, 9];" },
            { id: "b", code: "const soma = notas.reduce((t, n) => t + n, 0);" },
            { id: "c", code: "const media = soma / notas.length;" },
            { id: "d", code: "console.log(media);" },
          ],
        },
        solution: { order: ["a", "b", "c", "d"] },
        explanation: "Cada linha usa o resultado da anterior: notas → soma (24) → média (8) → exibição.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Monte uma função que busca itens e trata falhas HTTP.",
          blocks: [
            { id: "a", code: "async function carregar() {" },
            { id: "b", code: '  const resposta = await fetch("/api/itens");' },
            { id: "c", code: '  if (!resposta.ok) throw new Error("Falha");' },
            { id: "d", code: "  return resposta.json();" },
            { id: "e", code: "}" },
          ],
        },
        solution: { order: ["a", "b", "c", "d", "e"] },
        explanation: "A resposta precisa existir antes de ser verificada, e só se converte em JSON depois de confirmar que deu certo.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Monte a estrutura mínima de uma página HTML.",
          blocks: [
            { id: "a", code: "<!DOCTYPE html>" },
            { id: "b", code: '<html lang="pt-BR">' },
            { id: "c", code: "<head>" },
            { id: "d", code: "<title>Minha página</title>" },
            { id: "e", code: "</head>" },
            { id: "f", code: "<body>" },
            { id: "g", code: "<h1>Olá!</h1>" },
            { id: "h", code: "</body>" },
            { id: "i", code: "</html>" },
          ],
        },
        solution: { order: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
        explanation: "doctype, html, head (com o title), depois body com o conteúdo visível. As tags fecham na ordem inversa de abertura.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Monte a consulta SQL: quantidade de pedidos por cliente, do maior para o menor.",
          blocks: [
            { id: "a", code: "SELECT clientes.nome, COUNT(*) AS qtd" },
            { id: "b", code: "FROM clientes" },
            { id: "c", code: "JOIN pedidos ON pedidos.cliente_id = clientes.id" },
            { id: "d", code: "GROUP BY clientes.nome" },
            { id: "e", code: "ORDER BY qtd DESC;" },
          ],
        },
        solution: { order: ["a", "b", "c", "d", "e"] },
        explanation: "A ordem das cláusulas em SQL é fixa: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING e ORDER BY.",
      },
    ],
  },
  {
    slug: "quiz-relampago",
    kind: "lightning",
    title: "Quiz relâmpago",
    description: "12 perguntas rápidas contra o relógio. Quanto você lembra?",
    rules: "Você tem 2 minutos para responder as 12 perguntas. Perguntas sem resposta quando o tempo acabar contam como erro.",
    timeLimitSeconds: 120,
    rounds: [
      { difficulty: 1, points: 5, payload: { prompt: "Qual tag cria um link em HTML?", options: ["<a>", "<link>", "<href>", "<url>"] }, solution: { index: 0 }, explanation: "<a href=\"...\"> cria links. <link> liga arquivos, como CSS, no head." },
      { difficulty: 1, points: 5, payload: { prompt: "Quanto vale typeof 42 em JavaScript?", options: ["\"string\"", "\"number\"", "\"int\"", "\"float\""] }, solution: { index: 1 }, explanation: "JavaScript tem um único tipo numérico: number." },
      { difficulty: 1, points: 5, payload: { prompt: "Qual propriedade CSS muda a cor do texto?", options: ["font-color", "text-color", "color", "background"] }, solution: { index: 2 }, explanation: "color define a cor do texto; background define o fundo." },
      { difficulty: 1, points: 5, payload: { prompt: "Qual comando Git registra as mudanças no histórico?", options: ["git push", "git commit", "git status", "git clone"] }, solution: { index: 1 }, explanation: "commit registra; push envia os commits ao repositório remoto." },
      { difficulty: 1, points: 5, payload: { prompt: "Qual é o índice do primeiro item de um array?", options: ["1", "-1", "0", "Depende"] }, solution: { index: 2 }, explanation: "A contagem de índices começa em 0." },
      { difficulty: 1, points: 5, payload: { prompt: "Qual operador compara valor e tipo?", options: ["==", "===", "=", "!="] }, solution: { index: 1 }, explanation: "=== é a igualdade estrita: valor e tipo precisam ser iguais." },
      { difficulty: 2, points: 5, payload: { prompt: "Qual comando SQL busca dados?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"] }, solution: { index: 2 }, explanation: "SELECT consulta; os outros alteram dados." },
      { difficulty: 2, points: 5, payload: { prompt: "Qual status HTTP significa \"não encontrado\"?", options: ["200", "404", "500", "301"] }, solution: { index: 1 }, explanation: "404 = não encontrado; 200 = sucesso; 500 = erro no servidor." },
      { difficulty: 2, points: 5, payload: { prompt: "Qual elemento HTML marca o conteúdo principal da página?", options: ["<section>", "<div>", "<body>", "<main>"] }, solution: { index: 3 }, explanation: "<main> marca o conteúdo principal; deve haver um por página." },
      { difficulty: 2, points: 5, payload: { prompt: "Em React, o que guarda dados que mudam dentro do componente?", options: ["Props", "Estado (useState)", "CSS", "Comentários"] }, solution: { index: 1 }, explanation: "Estado muda com o tempo; props são recebidas do componente pai." },
      { difficulty: 2, points: 5, payload: { prompt: "Quanto vale \"5\" + 1 em JavaScript?", options: ["6", "NaN", "\"51\"", "Erro"] }, solution: { index: 2 }, explanation: "Com um texto no +, os valores são concatenados: \"51\"." },
      { difficulty: 2, points: 5, payload: { prompt: "Em Java, qual palavra cria um objeto a partir de uma classe?", options: ["new", "create", "object", "make"] }, solution: { index: 0 }, explanation: "new chama o construtor e cria uma instância: new Livro()." },
    ],
  },
  {
    slug: "memoria-de-programacao",
    kind: "memory",
    title: "Memória de programação",
    description: "Vire as cartas e encontre os pares de conceito e definição.",
    rules: "Vire duas cartas por vez. Se formarem um par (conceito + definição), elas ficam abertas. Quanto menos tentativas, mais pontos.",
    rounds: [
      {
        difficulty: 1,
        points: 20,
        payload: {
          prompt: "Tags HTML",
          cards: [
            { id: "t1", text: "<p>" },
            { id: "d1", text: "Parágrafo" },
            { id: "t2", text: "<a>" },
            { id: "d2", text: "Link" },
            { id: "t3", text: "<img>" },
            { id: "d3", text: "Imagem" },
            { id: "t4", text: "<ul>" },
            { id: "d4", text: "Lista não ordenada" },
          ],
        },
        solution: { pairs: [["t1", "d1"], ["t2", "d2"], ["t3", "d3"], ["t4", "d4"]] },
        explanation: "Cada tag descreve o significado do conteúdo: parágrafo, link, imagem e lista.",
      },
      {
        difficulty: 1,
        points: 20,
        payload: {
          prompt: "JavaScript básico",
          cards: [
            { id: "t1", text: "const" },
            { id: "d1", text: "Não pode ser reatribuída" },
            { id: "t2", text: "let" },
            { id: "d2", text: "Variável que pode mudar" },
            { id: "t3", text: "===" },
            { id: "d3", text: "Igualdade estrita" },
            { id: "t4", text: "return" },
            { id: "d4", text: "Devolve o resultado da função" },
          ],
        },
        solution: { pairs: [["t1", "d1"], ["t2", "d2"], ["t3", "d3"], ["t4", "d4"]] },
        explanation: "const e let declaram nomes; === compara valor e tipo; return encerra a função devolvendo um valor.",
      },
      {
        difficulty: 2,
        points: 20,
        payload: {
          prompt: "Métodos de array",
          cards: [
            { id: "t1", text: "map" },
            { id: "d1", text: "Transforma cada item" },
            { id: "t2", text: "filter" },
            { id: "d2", text: "Seleciona itens" },
            { id: "t3", text: "reduce" },
            { id: "d3", text: "Acumula em um só valor" },
            { id: "t4", text: "find" },
            { id: "d4", text: "Primeiro item que atende" },
          ],
        },
        solution: { pairs: [["t1", "d1"], ["t2", "d2"], ["t3", "d3"], ["t4", "d4"]] },
        explanation: "map transforma, filter seleciona, reduce acumula e find busca o primeiro.",
      },
      {
        difficulty: 2,
        points: 20,
        payload: {
          prompt: "Git",
          cards: [
            { id: "t1", text: "git init" },
            { id: "d1", text: "Cria um repositório" },
            { id: "t2", text: "git add" },
            { id: "d2", text: "Prepara as mudanças" },
            { id: "t3", text: "git commit" },
            { id: "d3", text: "Registra no histórico" },
            { id: "t4", text: "git push" },
            { id: "d4", text: "Envia ao repositório remoto" },
          ],
        },
        solution: { pairs: [["t1", "d1"], ["t2", "d2"], ["t3", "d3"], ["t4", "d4"]] },
        explanation: "O fluxo básico é: init (uma vez), add, commit e push.",
      },
      {
        difficulty: 3,
        points: 20,
        payload: {
          prompt: "Dados e web",
          cards: [
            { id: "t1", text: "PRIMARY KEY" },
            { id: "d1", text: "Identifica cada registro" },
            { id: "t2", text: "FOREIGN KEY" },
            { id: "d2", text: "Aponta para outra tabela" },
            { id: "t3", text: "200" },
            { id: "d3", text: "HTTP: sucesso" },
            { id: "t4", text: "404" },
            { id: "d4", text: "HTTP: não encontrado" },
          ],
        },
        solution: { pairs: [["t1", "d1"], ["t2", "d2"], ["t3", "d3"], ["t4", "d4"]] },
        explanation: "Chaves organizam relações entre tabelas; códigos de status dizem como uma requisição terminou.",
      },
    ],
  },
  {
    slug: "desafio-sql",
    kind: "sql",
    title: "Desafio SQL",
    description: "Leia as tabelas e escolha a consulta certa. Nenhum SQL é executado: é pura interpretação.",
    rules: "Observe as tabelas clientes e pedidos. Em cada rodada, escolha a consulta ou o resultado correto.",
    rounds: [
      {
        difficulty: 1,
        payload: { prompt: "Qual consulta lista o nome de todos os clientes?", tables: tabelas, options: ["SELECT nome FROM clientes;", "SELECT clientes FROM nome;", "GET nome FROM clientes;", "SELECT * WHERE clientes;"] },
        solution: { index: 0 },
        explanation: "SELECT coluna FROM tabela. As outras opções invertem a ordem ou usam comandos que não existem.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Qual consulta mostra só os clientes de Recife?",
          tables: tabelas,
          options: [
            "SELECT nome FROM clientes IF cidade = 'Recife';",
            "SELECT nome FROM clientes WHERE cidade = 'Recife';",
            "SELECT nome WHERE cidade = 'Recife' FROM clientes;",
            "SELECT Recife FROM clientes;",
          ],
        },
        solution: { index: 1 },
        explanation: "WHERE filtra linhas e vem depois do FROM. O resultado é Ana e Carla.",
      },
      {
        difficulty: 1,
        payload: { prompt: "Quantas linhas esta consulta devolve: SELECT * FROM pedidos WHERE total > 100;", tables: tabelas, options: ["1", "2", "3", "0"] },
        solution: { index: 1 },
        explanation: "Os totais são 120, 80 e 200. Só 120 e 200 são maiores que 100: 2 linhas.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Qual consulta mostra o total gasto por cada cliente_id?",
          tables: tabelas,
          options: [
            "SELECT cliente_id, total FROM pedidos;",
            "SELECT SUM(cliente_id) FROM pedidos;",
            "SELECT cliente_id, SUM(total) FROM pedidos GROUP BY cliente_id;",
            "SELECT cliente_id, COUNT(total) FROM pedidos ORDER BY total;",
          ],
        },
        solution: { index: 2 },
        explanation: "GROUP BY agrupa as linhas por cliente e SUM soma os totais de cada grupo: cliente 1 → 200, cliente 3 → 200.",
      },
      {
        difficulty: 2,
        payload: { prompt: "Qual é o resultado de SELECT SUM(total) FROM pedidos WHERE cliente_id = 1;", tables: tabelas, options: ["120", "200", "400", "2"] },
        solution: { index: 1 },
        explanation: "O cliente 1 tem os pedidos 10 (120) e 11 (80): 120 + 80 = 200.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Qual consulta traz o nome do cliente junto com o total de cada pedido?",
          tables: tabelas,
          options: [
            "SELECT nome, total FROM clientes, pedidos;",
            "SELECT clientes.nome, pedidos.total FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id;",
            "SELECT nome, total FROM pedidos JOIN clientes;",
            "SELECT nome FROM clientes WHERE total > 0;",
          ],
        },
        solution: { index: 1 },
        explanation: "O JOIN com ON liga cada pedido ao cliente pelo cliente_id. Sem a condição, cada pedido é combinado com todos os clientes.",
      },
      {
        difficulty: 3,
        payload: { prompt: "Olhando as tabelas, qual cliente não fez nenhum pedido?", tables: tabelas, options: ["Ana", "Bruno", "Carla", "Todos fizeram"] },
        solution: { index: 1 },
        explanation: "Os cliente_id que aparecem em pedidos são 1 (Ana) e 3 (Carla). Bruno (2) não aparece.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Qual consulta encontra os clientes sem pedidos?",
          tables: tabelas,
          options: [
            "SELECT c.nome FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;",
            "SELECT nome FROM clientes WHERE pedidos = 0;",
            "SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;",
            "SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id = NULL;",
          ],
        },
        solution: { index: 2 },
        explanation: "O LEFT JOIN mantém todos os clientes; quem não tem pedido fica com p.id nulo. Para testar nulo, use IS NULL (= NULL nunca é verdadeiro).",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Por que DELETE FROM pedidos; é perigoso?",
          tables: tabelas,
          options: [
            "Apaga só a primeira linha",
            "Apaga todas as linhas, porque não tem WHERE",
            "Apaga a tabela inteira, inclusive a estrutura",
            "Não faz nada sem um SELECT antes",
          ],
        },
        solution: { index: 1 },
        explanation: "Sem WHERE, o DELETE atinge todas as linhas. A estrutura da tabela continua (quem apaga a estrutura é o DROP TABLE).",
      },
    ],
  },
  {
    slug: "missoes-full-stack",
    kind: "fullstack",
    title: "Missões Full Stack",
    description: "Construa o Tarefas+ etapa por etapa, tomando as decisões de um time de desenvolvimento.",
    rules: "Cada missão é uma etapa da construção de uma aplicação de tarefas, do planejamento à publicação. Escolha a melhor decisão.",
    rounds: [
      {
        difficulty: 1,
        payload: { prompt: "Missão 1 · Planejamento. Antes de programar o Tarefas+, o que você define primeiro?", options: ["As cores dos botões", "Os requisitos: o que a pessoa usuária precisa fazer", "O nome do banco de dados", "O serviço de hospedagem"] },
        solution: { index: 1 },
        explanation: "Requisitos vêm primeiro. Sem saber o que o sistema precisa fazer, qualquer escolha técnica é um chute.",
      },
      {
        difficulty: 1,
        payload: { prompt: "Missão 2 · Interface. Qual camada mostra a lista de tarefas na tela?", options: ["Banco de dados", "Front-end", "Servidor DNS", "Sistema operacional"] },
        solution: { index: 1 },
        explanation: "O front-end (HTML, CSS, JavaScript ou React) é a camada que a pessoa vê e usa.",
      },
      {
        difficulty: 1,
        payload: { prompt: "Missão 3 · Comunicação. Em que formato o front-end e a API costumam trocar dados?", options: ["PDF", "JSON", "Imagens PNG", "Planilhas"] },
        solution: { index: 1 },
        explanation: "JSON é texto estruturado, leve e entendido por praticamente toda linguagem.",
      },
      {
        difficulty: 2,
        payload: { prompt: "Missão 4 · API. Qual método HTTP usar para criar uma nova tarefa?", options: ["GET", "POST", "DELETE", "HEAD"] },
        solution: { index: 1 },
        explanation: "POST cria recursos; GET lê; PUT/PATCH atualizam; DELETE remove.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Missão 5 · Validação. Onde validar que o título da tarefa não está vazio?",
          options: ["Só no front-end", "No servidor, mesmo que o front-end também valide", "Em lugar nenhum", "Só no banco, sem mensagem de erro"],
        },
        solution: { index: 1 },
        explanation: "A validação do front-end melhora a experiência, mas pode ser burlada. O servidor sempre valida de novo.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Missão 6 · Banco de dados. Como garantir que cada tarefa pertença a um usuário que existe?",
          options: ["Repetindo o nome do usuário em cada tarefa", "Com uma chave estrangeira usuario_id que referencia usuarios.id", "Em um arquivo de texto separado", "Com uma variável global no front-end"],
        },
        solution: { index: 1 },
        explanation: "A chave estrangeira garante integridade referencial: o banco recusa tarefas de usuários inexistentes.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Missão 7 · Segurança. Onde guardar a chave secreta da API de IA usada pelo assistente do Tarefas+?",
          options: ["No código do front-end", "Em variável de ambiente no servidor", "No README do repositório", "Em um comentário no HTML"],
        },
        solution: { index: 1 },
        explanation: "Tudo que vai para o navegador pode ser lido por qualquer pessoa. Segredos ficam só no servidor, em variáveis de ambiente.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Missão 8 · Falhas. A API ficou fora do ar. O que o front-end deve fazer?",
          options: ["Mostrar uma tela branca", "Mostrar uma mensagem clara e permitir tentar de novo", "Exibir o erro técnico completo", "Recarregar a página sem parar"],
        },
        solution: { index: 1 },
        explanation: "Erros acontecem. Uma boa interface explica o que houve, sem expor detalhes internos, e oferece um caminho.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Missão 9 · Publicação. Antes de publicar, qual verificação é essencial?",
          options: ["Trocar a cor do logo", "Rodar os testes e conferir que nenhum segredo foi versionado", "Apagar o README", "Desativar o HTTPS"],
        },
        solution: { index: 1 },
        explanation: "Testes evitam publicar algo quebrado. Um segredo no Git, mesmo apagado depois, fica no histórico e precisa ser trocado.",
      },
    ],
  },
  {
    slug: "corrida-de-digitacao",
    kind: "typing",
    title: "Corrida de digitação",
    description: "Digite trechos de código com precisão. Treina a memória dos símbolos que mais usamos.",
    rules: "Copie o trecho exatamente como aparece, com espaços e símbolos. Conta a precisão (mínimo de 95% para acertar) e o tempo mostra sua velocidade.",
    rounds: [
      { difficulty: 1, payload: { prompt: "Mostrar uma mensagem no console", language: "js", text: 'console.log("Olá, mundo!");' }, solution: {}, explanation: "A primeira linha de muita gente: console.log mostra um texto no console." },
      { difficulty: 1, payload: { prompt: "Um link em HTML", language: "html", text: '<a href="/cursos">Ver cursos</a>' }, solution: {}, explanation: "O atributo href diz para onde o link leva; o texto entre as tags é o que aparece." },
      { difficulty: 2, payload: { prompt: "Uma regra CSS", language: "css", text: ".botao { padding: 1rem; color: #fff; }" }, solution: {}, explanation: "Seletor de classe, chaves, e declarações propriedade: valor; separadas por ponto e vírgula." },
      { difficulty: 2, payload: { prompt: "Uma arrow function", language: "js", text: "const dobro = (n) => n * 2;" }, solution: {}, explanation: "Arrow function de uma expressão devolve o resultado sem precisar de return." },
      { difficulty: 3, payload: { prompt: "Filtrar números pares", language: "js", text: "const pares = numeros.filter((n) => n % 2 === 0);" }, solution: {}, explanation: "filter mantém os itens para os quais a função devolve true; % 2 === 0 testa se é par." },
      { difficulty: 3, payload: { prompt: "Uma consulta SQL com filtro", language: "sql", text: "SELECT nome FROM clientes WHERE cidade = 'Recife';" }, solution: {}, explanation: "Textos em SQL usam aspas simples; WHERE filtra as linhas." },
    ],
  },
  {
    slug: "seletor-css",
    kind: "css",
    title: "Seletor CSS",
    description: "Descubra qual seletor pega exatamente os elementos destacados.",
    rules: "Leia o HTML. Os elementos marcados com ★ são os alvos. Escolha o seletor que pega todos eles e nenhum outro.",
    rounds: [
      {
        difficulty: 1,
        payload: {
          prompt: "Qual seletor pega só os itens marcados com ★?",
          codeLang: "html",
          code: '<ul>\n  <li class="feito">Estudar HTML ★</li>\n  <li>Estudar CSS</li>\n  <li class="feito">Fazer exercícios ★</li>\n</ul>',
          options: [".feito", "li", "#feito", "ul .feito li"],
        },
        solution: { index: 0 },
        explanation: "O ponto seleciona pela classe. li pegaria os três itens; #feito procura um id.",
      },
      {
        difficulty: 1,
        payload: {
          prompt: "Qual seletor pega só o título marcado com ★?",
          codeLang: "html",
          code: '<h1 id="titulo">Bem-vindo ★</h1>\n<h2>Seção</h2>',
          options: ["h2", "#titulo", ".titulo", "h1 h2"],
        },
        solution: { index: 1 },
        explanation: "# seleciona pelo id. .titulo procuraria uma classe, que o h1 não tem.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Qual seletor pega só os links do menu (★)?",
          codeLang: "html",
          code: '<nav>\n  <a href="/">Início ★</a>\n  <a href="/sobre">Sobre ★</a>\n</nav>\n<p>Leia <a href="/blog">o blog</a>.</p>',
          options: ["a", "nav a", "p a", "nav + a"],
        },
        solution: { index: 1 },
        explanation: "nav a seleciona links descendentes de nav. Só a pegaria também o link do parágrafo.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Qual seletor pega só o item marcado com ★?",
          codeLang: "html",
          code: "<ul>\n  <li>Um ★</li>\n  <li>Dois</li>\n  <li>Três</li>\n</ul>",
          options: ["li:last-child", "li:first-child", "ul:first-child", "li + li"],
        },
        solution: { index: 1 },
        explanation: ":first-child pega o li que é o primeiro filho. li + li pegaria Dois e Três.",
      },
      {
        difficulty: 2,
        payload: {
          prompt: "Qual seletor pega só o campo de e-mail?",
          codeLang: "html",
          code: '<input type="text" name="nome">\n<input type="email" name="email">\n<input type="password" name="senha">',
          options: ["input:email", 'input[type="email"]', "#email", "input.email"],
        },
        solution: { index: 1 },
        explanation: "Colchetes selecionam por atributo. O campo não tem id nem classe \"email\".",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Qual seletor pega só os itens marcados com ★?",
          codeLang: "html",
          code: "<ul>\n  <li>1</li>\n  <li>2 ★</li>\n  <li>3</li>\n  <li>4 ★</li>\n</ul>",
          options: ["li:nth-child(odd)", "li:nth-child(2n)", "li:nth-child(2)", "li ~ li"],
        },
        solution: { index: 1 },
        explanation: ":nth-child(2n) pega as posições pares (2, 4...). odd pegaria 1 e 3; (2) só o segundo.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "Qual seletor pega só o parágrafo marcado com ★?",
          codeLang: "html",
          code: '<div class="card">\n  <p>Texto ★</p>\n  <div class="rodape">\n    <p>Rodapé</p>\n  </div>\n</div>',
          options: [".card p", ".card > p", ".rodape p", "p:last-child"],
        },
        solution: { index: 1 },
        explanation: "> seleciona apenas filhos diretos. .card p pegaria também o parágrafo do rodapé, que é neto.",
      },
      {
        difficulty: 3,
        payload: {
          prompt: "O link está dentro de <nav id=\"menu\" class=\"menu\">. Com estas regras, de que cor ele fica?",
          codeLang: "css",
          code: "#menu a { color: red; }\n.menu a { color: blue; }\na { color: green; }",
          options: ["Vermelho", "Azul", "Verde", "Preto, a cor padrão"],
        },
        solution: { index: 0 },
        explanation: "Vence a maior especificidade: #menu a (um id) ganha de .menu a (uma classe) e de a. A ordem não importa aqui.",
      },
    ],
  },
];
