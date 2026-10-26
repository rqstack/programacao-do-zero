import { normalizeShortAnswer } from "@/lib/quiz/grading";

/**
 * Tutor sem IA e sem serviço externo: dicas em etapas, diagnóstico de respostas erradas
 * e explicação de mensagens de erro. Tudo determinístico, a partir do conteúdo das aulas.
 */

/** Distância de edição (Levenshtein), limitada para textos curtos. */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 20) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

const PAIRS: Array<[string, string, string]> = [
  ["(", ")", "parênteses"],
  ["[", "]", "colchetes"],
  ["{", "}", "chaves"],
];
const count = (s: string, ch: string) => s.split(ch).length - 1;

/**
 * Diz por que uma resposta curta não foi aceita, sem entregar a resposta.
 * Devolve null quando não há nada específico a dizer.
 */
export function diagnoseAnswer(answer: string, accepted: readonly string[]): string | null {
  const mine = normalizeShortAnswer(answer);
  if (!mine) return null;
  const options = accepted.map(normalizeShortAnswer).filter(Boolean);
  if (options.length === 0) return null;
  const best = options.reduce((a, b) => (distance(mine, b) < distance(mine, a) ? b : a));

  for (const [open, close, name] of PAIRS) {
    const o = count(mine, open);
    const c = count(mine, close);
    if (o !== c) return o > c ? `Faltou fechar ${name}: há ${o} "${open}" e ${c} "${close}".` : `Sobrou "${close}": há mais ${name} fechando do que abrindo.`;
  }
  if (count(mine, '"') % 2 === 1) return "Há aspas abertas sem fechar.";

  const d = distance(mine, best);
  if (best.startsWith(mine)) return "O começo está certo. Falta completar a resposta.";
  if (mine.startsWith(best)) return "A resposta certa está aí dentro, mas sobrou algo no final.";
  if (d <= 2) return "Muito perto! A diferença é de um ou dois caracteres: confira a digitação de nomes e símbolos.";

  const words = (s: string) => new Set(s.split(/[^a-z0-9_$]+/i).filter((w) => w.length > 1));
  const want = words(best);
  const have = words(mine);
  const shared = [...want].filter((w) => have.has(w)).length;
  if (want.size > 0 && shared / want.size >= 0.5) return "Você usou boa parte das peças certas. Confira a ordem e o que está faltando.";
  return null;
}

export interface ErrorExplanation {
  title: string;
  meaning: string;
  check: string;
}

const RULES: Array<{ test: RegExp; explain: (m: RegExpMatchArray) => ErrorExplanation }> = [
  {
    test: /ReferenceError:?\s*(\S+) is not defined|NameError: name '([^']+)' is not defined/i,
    explain: (m) => ({
      title: `O nome "${m[1] ?? m[2]}" não existe`,
      meaning: "O programa tentou usar uma variável ou função que ainda não foi criada (ou foi escrita com outro nome).",
      check: "Confira a digitação, maiúsculas e minúsculas, e se o nome foi declarado antes de ser usado e no mesmo bloco.",
    }),
  },
  {
    test: /Cannot access '([^']+)' before initialization/i,
    explain: (m) => ({
      title: `"${m[1]}" foi usado antes de receber um valor`,
      meaning: "Com let e const, a variável só existe a partir da linha em que é declarada.",
      check: "Mova a declaração para antes do uso, ou veja se há outra declaração com o mesmo nome dentro do bloco.",
    }),
  },
  {
    test: /(\S+) is not a function/i,
    explain: (m) => ({
      title: `"${m[1]}" não é uma função`,
      meaning: "O código chamou com parênteses algo que não é uma função (um número, texto, undefined ou um método com nome errado).",
      check: "Confira o nome do método (ex.: length é propriedade, não leva parênteses) e o tipo do valor antes da chamada.",
    }),
  },
  {
    test: /Cannot read propert(?:y|ies) of (undefined|null)|'NoneType' object has no attribute|NullPointerException|Object reference not set/i,
    explain: () => ({
      title: "O valor está vazio (undefined, null ou None)",
      meaning: "O programa tentou acessar algo dentro de um valor que não existe.",
      check: "Descubra de onde veio esse valor: um índice fora da lista, uma função sem return ou um campo com nome errado costumam ser a causa.",
    }),
  },
  {
    test: /Assignment to constant variable/i,
    explain: () => ({
      title: "Tentou mudar uma constante",
      meaning: "Uma variável criada com const não pode receber outro valor.",
      check: "Use let se o valor precisa mudar, ou crie uma variável nova. Num if, compare com === em vez de =.",
    }),
  },
  {
    test: /Unexpected token|Unexpected end of input|missing \) after|SyntaxError|invalid syntax|expected ['"`;)]|error: ';' expected/i,
    explain: () => ({
      title: "Erro de sintaxe: o código não pôde nem ser lido",
      meaning: "Algum símbolo está faltando, sobrando ou fora do lugar.",
      check: "Procure parênteses, chaves, colchetes e aspas sem par, vírgulas a mais e a linha indicada (às vezes o problema está na linha anterior).",
    }),
  },
  {
    test: /IndentationError|unexpected indent|expected an indented block/i,
    explain: () => ({
      title: "Indentação errada (Python)",
      meaning: "Em Python, os espaços no começo da linha definem os blocos.",
      check: "Use 4 espaços em cada nível e não misture tab com espaços. Depois de ':' a linha seguinte precisa estar mais à direita.",
    }),
  },
  {
    test: /TypeError: unsupported operand|can only concatenate str|must be str, not|cannot be applied to|incompatible types|cannot convert/i,
    explain: () => ({
      title: "Tipos que não combinam",
      meaning: "A operação recebeu valores de tipos diferentes, como somar texto com número.",
      check: "Converta antes de operar: int()/str() em Python, Number()/String() em JavaScript, ou ajuste o tipo da variável.",
    }),
  },
  {
    test: /IndexError|index out of range|ArrayIndexOutOfBounds|IndexOutOfRange/i,
    explain: () => ({
      title: "Posição fora da lista",
      meaning: "O código pediu um índice que não existe. Lembre que o primeiro item é o índice 0 e o último é tamanho - 1.",
      check: "Revise as condições dos laços (< em vez de <=) e listas vazias.",
    }),
  },
  {
    test: /KeyError: (.+)/i,
    explain: (m) => ({
      title: `A chave ${m[1]} não existe no dicionário`,
      meaning: "O dicionário não tem esse item.",
      check: "Confira o nome da chave ou use .get(chave, padrão) para ter um valor quando ela faltar.",
    }),
  },
  {
    test: /ZeroDivisionError|division by zero|DivideByZero/i,
    explain: () => ({
      title: "Divisão por zero",
      meaning: "O programa dividiu um número por 0.",
      check: "Trate o caso de lista vazia ou divisor zero antes de dividir.",
    }),
  },
  {
    test: /Maximum call stack size exceeded|RecursionError|StackOverflow/i,
    explain: () => ({
      title: "Recursão sem fim",
      meaning: "Uma função chamou a si mesma vezes demais.",
      check: "Confira o caso base (quando a função para) e se cada chamada se aproxima dele.",
    }),
  },
  {
    test: /Tempo limite|timed? ?out|Time limit exceeded|demorou demais/i,
    explain: () => ({
      title: "O programa demorou demais",
      meaning: "Provavelmente há um laço que nunca termina ou um algoritmo lento demais para entradas grandes.",
      check: "Veja se a variável do laço muda a cada volta e se a condição de parada é alcançada.",
    }),
  },
  {
    test: /no such column|column "?([a-z_]+)"? does not exist/i,
    explain: () => ({
      title: "Coluna inexistente (SQL)",
      meaning: "A consulta usou uma coluna que não existe nessa tabela.",
      check: "Confira o nome da coluna no esquema e se ela pertence à tabela do FROM (ou do JOIN).",
    }),
  },
  {
    test: /no such table|relation "?([a-z_]+)"? does not exist/i,
    explain: () => ({
      title: "Tabela inexistente (SQL)",
      meaning: "A consulta citou uma tabela que não existe.",
      check: "Confira o nome da tabela no esquema mostrado no desafio.",
    }),
  },
  {
    test: /cannot find symbol|undeclared identifier|was not declared in this scope|does not exist in the current context|cannot find value/i,
    explain: () => ({
      title: "Nome não declarado (linguagem compilada)",
      meaning: "O compilador não encontrou essa variável, função ou tipo.",
      check: "Declare antes de usar, confira a digitação e os imports, e veja se o nome existe dentro do bloco atual.",
    }),
  },
];

/** Explica uma mensagem de erro em linguagem simples; null se não reconhecer. */
export function explainError(message: string): ErrorExplanation | null {
  const text = message.slice(0, 4000);
  for (const r of RULES) {
    const m = text.match(r.test);
    if (m) return r.explain(m);
  }
  return null;
}

/**
 * Primeiro bloco de código da aula que sirva de exemplo sem entregar a resposta do
 * exercício (blocos que já contêm uma resposta aceita são pulados).
 */
export function lessonExample(body: string, accepted: readonly string[]): { lang: string; code: string } | null {
  const answers = accepted.map(normalizeShortAnswer).filter((a) => a.length >= 3);
  for (const m of body.matchAll(/```([a-z0-9+#-]*)\n([\s\S]*?)```/gi)) {
    const lang = (m[1] || "texto").toLowerCase();
    const code = m[2]!.trimEnd();
    if (lang === "texto" || lang === "text" || code.split("\n").length > 25 || code.length < 10) continue;
    const norm = normalizeShortAnswer(code);
    if (answers.some((a) => norm.includes(a))) continue;
    return { lang, code };
  }
  return null;
}
