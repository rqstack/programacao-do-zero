import type { SeedGame } from "../schema";
import { BUGS } from "./bugs";
import { chuva, css, fullstack, robo, sql } from "./novos";
import { bugRound } from "./rounds";

/**
 * Jogos de revisão. As alternativas são embaralhadas na hora de jogar, então a
 * posição da resposta correta aqui não importa.
 */
const classicos: SeedGame[] = [
  {
    slug: "caca-aos-bugs",
    kind: "bug_hunt",
    lives: 3,
    title: "Caça aos bugs",
    description: "O código roda e os testes falham. Ache a linha com o bug, corrija e rode de novo até todos passarem.",
    rules:
      "Rode os testes, veja quais falham e compare o que saiu com o esperado. Toque na linha suspeita, edite e rode de novo. Você tem 3 execuções por bug; se não conseguir, perde uma vida e vê a correção explicada. Corrigir na primeira tentativa vale mais pontos.",
    rounds: ([1, 2, 3] as const).flatMap((d) => BUGS.filter((b) => b.difficulty === d).slice(0, 2).map(bugRound)),
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
];

const [caca, monte, memoria, digitacao] = classicos as [SeedGame, SeedGame, SeedGame, SeedGame];

/** Ordem de exibição dos jogos. */
export const games: SeedGame[] = [robo, caca, monte, chuva, memoria, sql, fullstack, digitacao, css];
