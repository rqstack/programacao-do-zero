/**
 * Desafios de código: problemas para resolver programando, em JavaScript, TypeScript,
 * Python ou SQL. Os casos de teste são gerados na hora (sementes aleatórias), então a
 * resposta não pode ser decorada. A solução de referência em JavaScript calcula o
 * resultado esperado; a de Python e a de SQL também são mostradas ao aluno.
 */
export type ChallengeDifficulty = "facil" | "medio" | "dificil";
export type ValueType = "number" | "string" | "boolean" | "number[]" | "string[]";

export interface Rng {
  /** Inteiro entre min e max (inclusive). */
  int: (min: number, max: number) => number;
  pick: <T>(list: readonly T[]) => T;
  bool: () => boolean;
}

export interface CodeChallenge {
  id: string;
  difficulty: ChallengeDifficulty;
  title: string;
  /** Parágrafos separados por linha em branco; aceita `código` e **negrito**. */
  statement: string;
  topics: string[];
  /** Nome da função em JavaScript/TypeScript (em Python vira snake_case). */
  fn: string;
  params: Array<{ name: string; type: ValueType }>;
  returns: ValueType;
  /** O retorno pode ter casas decimais (nas linguagens compiladas vira double). */
  decimal?: boolean;
  /** Exemplos visíveis (só os argumentos; o resultado vem da referência). */
  examples: unknown[][];
  /** Casos-limite sempre testados no envio. */
  edge?: unknown[][];
  generate: (r: Rng) => unknown[];
  /** Corpo da função de referência em JavaScript (também é a solução de JS/TS). */
  js: string;
  /** Corpo da função em Python (indentado com 4 espaços), usando os nomes em snake_case. */
  py: string;
  hints: string[];
}

export interface SqlChallenge {
  id: string;
  difficulty: ChallengeDifficulty;
  title: string;
  statement: string;
  topics: string[];
  /** Se a ordem das linhas importa (quando o enunciado pede ORDER BY). */
  ordered: boolean;
  solution: string;
  hints: string[];
}

// ---------- geradores ----------
const LETRAS = "abcdefghijklmnopqrstuvwxyz";
const PALAVRAS = ["casa", "codigo", "dado", "festa", "gato", "janela", "livro", "mesa", "nuvem", "ovo", "pato", "rede", "sol", "tela", "uva", "vento", "zebra", "arara", "radar", "osso", "reviver", "ana"];
const word = (r: Rng, min = 3, max = 8) => Array.from({ length: r.int(min, max) }, () => r.pick([...LETRAS])).join("");
const nums = (r: Rng, len: number, min: number, max: number) => Array.from({ length: len }, () => r.int(min, max));
const frase = (r: Rng, n: number) => Array.from({ length: n }, () => r.pick(PALAVRAS)).join(" ");

export const codeChallenges: readonly CodeChallenge[] = [
  // ---------------- FÁCIL ----------------
  {
    id: "soma-da-lista",
    difficulty: "facil",
    title: "Soma da lista",
    statement: "Escreva `somaLista(numeros)` que devolve a soma de todos os números da lista.\n\nSe a lista estiver vazia, a soma é `0`.",
    topics: ["laços", "arrays"],
    fn: "somaLista",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number",
    examples: [[[1, 2, 3]], [[10, -4]]],
    edge: [[[]]],
    generate: (r) => [nums(r, r.int(0, 12), -50, 100)],
    js: "  let soma = 0;\n  for (const n of numeros) soma += n;\n  return soma;",
    py: "    soma = 0\n    for n in numeros:\n        soma += n\n    return soma",
    hints: ["Comece com uma variável valendo 0.", "Percorra a lista somando cada número nessa variável."],
  },
  {
    id: "contar-vogais",
    difficulty: "facil",
    title: "Contar vogais",
    statement: "Escreva `contarVogais(texto)` que devolve quantas vogais (`a e i o u`) o texto tem.\n\nMaiúsculas também contam: `\"Ola\"` tem 2 vogais. O texto não tem acentos.",
    topics: ["strings", "laços"],
    fn: "contarVogais",
    params: [{ name: "texto", type: "string" }],
    returns: "number",
    examples: [["programacao"], ["OLA mundo"]],
    edge: [[""], ["xyz"]],
    generate: (r) => [Array.from({ length: r.int(0, 3) }, () => { const w = word(r); return r.bool() ? w.toUpperCase() : w; }).join(" ")],
    js: '  let total = 0;\n  for (const letra of texto.toLowerCase()) {\n    if ("aeiou".includes(letra)) total++;\n  }\n  return total;',
    py: '    total = 0\n    for letra in texto.lower():\n        if letra in "aeiou":\n            total += 1\n    return total',
    hints: ["Converta o texto para minúsculas antes de comparar.", "Para cada letra, verifique se ela está em \"aeiou\"."],
  },
  {
    id: "maior-numero",
    difficulty: "facil",
    title: "Maior número",
    statement: "Escreva `maiorNumero(numeros)` que devolve o maior número da lista, **sem usar** `Math.max` nem `max()`.\n\nA lista sempre tem pelo menos um número.",
    topics: ["laços", "comparação"],
    fn: "maiorNumero",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number",
    examples: [[[3, 9, 2]], [[-5, -1, -8]]],
    edge: [[[7]]],
    generate: (r) => [nums(r, r.int(1, 12), -100, 100)],
    js: "  let maior = numeros[0];\n  for (const n of numeros) {\n    if (n > maior) maior = n;\n  }\n  return maior;",
    py: "    maior = numeros[0]\n    for n in numeros:\n        if n > maior:\n            maior = n\n    return maior",
    hints: ["Comece supondo que o primeiro é o maior.", "Cuidado: começar com 0 falha quando todos são negativos."],
  },
  {
    id: "palindromo",
    difficulty: "facil",
    title: "É palíndromo?",
    statement: "Escreva `ehPalindromo(palavra)` que devolve `true` se a palavra é igual lida de trás para frente (como `\"arara\"`) e `false` caso contrário.\n\nAs palavras vêm em minúsculas e sem espaços.",
    topics: ["strings"],
    fn: "ehPalindromo",
    params: [{ name: "palavra", type: "string" }],
    returns: "boolean",
    examples: [["arara"], ["codigo"]],
    edge: [[""], ["a"]],
    generate: (r) => {
      if (r.bool()) return [r.pick(PALAVRAS)];
      const w = word(r, 1, 5);
      return [w + (r.bool() ? "" : r.pick([...LETRAS])) + [...w].reverse().join("")];
    },
    js: '  return palavra === palavra.split("").reverse().join("");',
    py: "    return palavra == palavra[::-1]",
    hints: ["Inverta a palavra e compare com a original.", "Em JavaScript: split(\"\"), reverse() e join(\"\")."],
  },
  {
    id: "fizzbuzz",
    difficulty: "facil",
    title: "FizzBuzz",
    statement: "Escreva `fizzBuzz(n)` que devolve:\n\n`\"FizzBuzz\"` se `n` for divisível por 3 e por 5; `\"Fizz\"` se só por 3; `\"Buzz\"` se só por 5; e o próprio número como texto nos outros casos (ex.: `\"7\"`).",
    topics: ["condicionais", "resto da divisão"],
    fn: "fizzBuzz",
    params: [{ name: "n", type: "number" }],
    returns: "string",
    examples: [[15], [9], [10], [7]],
    edge: [[1], [30]],
    generate: (r) => [r.int(1, 300)],
    js: '  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);',
    py: '    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)',
    hints: ["Use o operador de resto: n % 3 === 0 significa divisível por 3.", "Teste o caso de 3 e 5 juntos primeiro."],
  },
  {
    id: "contar-pares",
    difficulty: "facil",
    title: "Quantos pares?",
    statement: "Escreva `contarPares(numeros)` que devolve quantos números da lista são pares.\n\nZero é par, e números negativos também podem ser pares (`-4`).",
    topics: ["laços", "resto da divisão"],
    fn: "contarPares",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number",
    examples: [[[1, 2, 3, 4]], [[0, -2, 7]]],
    edge: [[[]]],
    generate: (r) => [nums(r, r.int(0, 15), -30, 30)],
    js: "  return numeros.filter((n) => n % 2 === 0).length;",
    py: "    return len([n for n in numeros if n % 2 == 0])",
    hints: ["Um número é par quando o resto da divisão por 2 é 0.", "Em JavaScript, -3 % 2 dá -1: compare com 0, não com 1."],
  },
  {
    id: "inverter-texto",
    difficulty: "facil",
    title: "Texto ao contrário",
    statement: "Escreva `inverterTexto(texto)` que devolve o texto com os caracteres na ordem inversa.\n\nExemplo: `\"sol nasce\"` vira `\"ecsan los\"`.",
    topics: ["strings", "laços"],
    fn: "inverterTexto",
    params: [{ name: "texto", type: "string" }],
    returns: "string",
    examples: [["sol nasce"], ["abc"]],
    edge: [[""]],
    generate: (r) => [frase(r, r.int(1, 4))],
    js: '  let saida = "";\n  for (const c of texto) saida = c + saida;\n  return saida;',
    py: "    return texto[::-1]",
    hints: ["Percorra o texto e coloque cada caractere na frente do resultado.", "Ou percorra de trás para frente com um índice."],
  },
  {
    id: "media-das-notas",
    difficulty: "facil",
    title: "Média das notas",
    statement: "Escreva `media(notas)` que devolve a média aritmética das notas (soma dividida pela quantidade).\n\nSe a lista estiver vazia, devolva `0`. Não arredonde.",
    topics: ["laços", "divisão"],
    fn: "media",
    params: [{ name: "notas", type: "number[]" }],
    returns: "number",
    decimal: true,
    examples: [[[7, 8, 9]], [[5, 10]]],
    edge: [[[]]],
    generate: (r) => [nums(r, r.int(0, 8), 0, 10)],
    js: "  if (notas.length === 0) return 0;\n  let soma = 0;\n  for (const n of notas) soma += n;\n  return soma / notas.length;",
    py: "    if len(notas) == 0:\n        return 0\n    return sum(notas) / len(notas)",
    hints: ["Trate a lista vazia antes de dividir (divisão por zero).", "Média = soma / quantidade."],
  },

  // ---------------- MÉDIO ----------------
  {
    id: "letra-mais-frequente",
    difficulty: "medio",
    title: "Letra mais frequente",
    statement: "Escreva `letraMaisFrequente(texto)` que devolve a letra que mais aparece no texto (só letras minúsculas de `a` a `z`; ignore espaços).\n\nEm caso de empate, devolva a que vem primeiro no alfabeto. O texto tem pelo menos uma letra.",
    topics: ["objetos/dicionários", "contagem"],
    fn: "letraMaisFrequente",
    params: [{ name: "texto", type: "string" }],
    returns: "string",
    examples: [["banana"], ["abc cba"]],
    edge: [["z"]],
    generate: (r) => [frase(r, r.int(1, 4))],
    js: '  const conta = {};\n  for (const c of texto) {\n    if (c >= "a" && c <= "z") conta[c] = (conta[c] ?? 0) + 1;\n  }\n  let melhor = "";\n  for (const c of Object.keys(conta).sort()) {\n    if (melhor === "" || conta[c] > conta[melhor]) melhor = c;\n  }\n  return melhor;',
    py: '    conta = {}\n    for c in texto:\n        if "a" <= c <= "z":\n            conta[c] = conta.get(c, 0) + 1\n    melhor = ""\n    for c in sorted(conta):\n        if melhor == "" or conta[c] > conta[melhor]:\n            melhor = c\n    return melhor',
    hints: ["Conte cada letra num objeto (JS) ou dicionário (Python).", "Percorra as letras em ordem alfabética e só troque quando a contagem for MAIOR."],
  },
  {
    id: "remover-duplicados",
    difficulty: "medio",
    title: "Remover duplicados",
    statement: "Escreva `removerDuplicados(numeros)` que devolve uma nova lista sem repetições, mantendo a ordem da **primeira** aparição de cada número.\n\nExemplo: `[3, 1, 3, 2, 1]` vira `[3, 1, 2]`.",
    topics: ["arrays", "Set"],
    fn: "removerDuplicados",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number[]",
    examples: [[[3, 1, 3, 2, 1]], [[5, 5, 5]]],
    edge: [[[]]],
    generate: (r) => [nums(r, r.int(0, 15), 0, 9)],
    js: "  const vistos = new Set();\n  const saida = [];\n  for (const n of numeros) {\n    if (!vistos.has(n)) {\n      vistos.add(n);\n      saida.push(n);\n    }\n  }\n  return saida;",
    py: "    vistos = set()\n    saida = []\n    for n in numeros:\n        if n not in vistos:\n            vistos.add(n)\n            saida.append(n)\n    return saida",
    hints: ["Guarde os números já vistos num Set (JS) ou set (Python).", "Só adicione na saída quando o número ainda não foi visto."],
  },
  {
    id: "segundo-maior",
    difficulty: "medio",
    title: "Segundo maior",
    statement: "Escreva `segundoMaior(numeros)` que devolve o segundo maior valor **distinto** da lista.\n\nEm `[5, 9, 9, 2]` a resposta é `5`. A lista sempre tem pelo menos dois valores diferentes.",
    topics: ["arrays", "ordenação"],
    fn: "segundoMaior",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number",
    examples: [[[5, 9, 9, 2]], [[1, 2]]],
    edge: [[[-1, -1, -3]]],
    generate: (r) => {
      const a = nums(r, r.int(2, 12), -40, 40);
      if (new Set(a).size < 2) a.push(a[0]! + 1);
      return [a];
    },
    js: "  const unicos = [...new Set(numeros)].sort((a, b) => b - a);\n  return unicos[1];",
    py: "    unicos = sorted(set(numeros), reverse=True)\n    return unicos[1]",
    hints: ["Tire os repetidos primeiro.", "Em JavaScript, sort() sem comparador ordena como texto: use (a, b) => b - a."],
  },
  {
    id: "capitalizar-palavras",
    difficulty: "medio",
    title: "Capitalizar palavras",
    statement: "Escreva `capitalizar(frase)` que deixa a primeira letra de cada palavra em maiúscula.\n\nAs palavras vêm em minúsculas, separadas por um espaço. Exemplo: `\"ola mundo\"` vira `\"Ola Mundo\"`.",
    topics: ["strings", "arrays"],
    fn: "capitalizar",
    params: [{ name: "frase", type: "string" }],
    returns: "string",
    examples: [["ola mundo"], ["programacao do zero"]],
    edge: [[""], ["a"]],
    generate: (r) => [frase(r, r.int(1, 5))],
    js: '  return frase\n    .split(" ")\n    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))\n    .join(" ");',
    py: '    return " ".join(p[:1].upper() + p[1:] for p in frase.split(" "))',
    hints: ["Separe a frase em palavras com split(\" \").", "Junte de novo com join(\" \") depois de transformar cada uma."],
  },
  {
    id: "soma-dos-digitos",
    difficulty: "medio",
    title: "Soma dos dígitos",
    statement: "Escreva `somaDigitos(n)` que devolve a soma dos dígitos de um inteiro não negativo.\n\nExemplo: `4071` dá `4 + 0 + 7 + 1 = 12`. Tente resolver com matemática (`% 10` e divisão inteira) em vez de converter para texto.",
    topics: ["matemática", "laços"],
    fn: "somaDigitos",
    params: [{ name: "n", type: "number" }],
    returns: "number",
    examples: [[4071], [9]],
    edge: [[0]],
    generate: (r) => [r.int(0, 9_999_999)],
    js: "  let soma = 0;\n  while (n > 0) {\n    soma += n % 10;\n    n = Math.floor(n / 10);\n  }\n  return soma;",
    py: "    soma = 0\n    while n > 0:\n        soma += n % 10\n        n //= 10\n    return soma",
    hints: ["n % 10 dá o último dígito.", "Math.floor(n / 10) (ou n // 10 em Python) remove o último dígito."],
  },
  {
    id: "anagramas",
    difficulty: "medio",
    title: "São anagramas?",
    statement: "Escreva `saoAnagramas(a, b)` que devolve `true` se as duas palavras usam exatamente as mesmas letras, nas mesmas quantidades (como `\"amor\"` e `\"roma\"`).\n\nAs palavras vêm em minúsculas e sem espaços.",
    topics: ["strings", "ordenação"],
    fn: "saoAnagramas",
    params: [{ name: "a", type: "string" }, { name: "b", type: "string" }],
    returns: "boolean",
    examples: [["amor", "roma"], ["gato", "toga"], ["casa", "cassa"]],
    edge: [["", ""], ["aab", "abb"]],
    generate: (r) => {
      const a = word(r, 2, 7);
      const shuffled = [...a].sort(() => (r.bool() ? 1 : -1)).join("");
      if (r.bool()) return [a, shuffled];
      return [a, r.bool() ? shuffled + r.pick([...LETRAS]) : word(r, a.length, a.length)];
    },
    js: '  const ordenar = (s) => s.split("").sort().join("");\n  return ordenar(a) === ordenar(b);',
    py: "    return sorted(a) == sorted(b)",
    hints: ["Se você ordenar as letras das duas, anagramas ficam iguais.", "Tamanhos diferentes já mostram que não são anagramas."],
  },
  {
    id: "contar-palavras",
    difficulty: "medio",
    title: "Contar palavras",
    statement: "Escreva `contarPalavras(frase)` que devolve quantas palavras a frase tem.\n\nPode haver **vários espaços** entre as palavras e espaços no começo ou no fim. Frase só com espaços tem 0 palavras.",
    topics: ["strings"],
    fn: "contarPalavras",
    params: [{ name: "frase", type: "string" }],
    returns: "number",
    examples: [["  ola   mundo "], ["um dois tres"]],
    edge: [[""], ["     "]],
    generate: (r) => {
      const sp = () => " ".repeat(r.int(1, 3));
      const ws = Array.from({ length: r.int(0, 6) }, () => r.pick(PALAVRAS));
      return [(r.bool() ? sp() : "") + ws.join(sp()) + (r.bool() ? sp() : "")];
    },
    js: '  return frase.split(" ").filter((p) => p !== "").length;',
    py: "    return len(frase.split())",
    hints: ["Separar por um espaço gera pedaços vazios quando há espaços seguidos.", "Filtre os pedaços vazios antes de contar."],
  },
  {
    id: "rotacionar-lista",
    difficulty: "medio",
    title: "Rotacionar a lista",
    statement: "Escreva `rotacionar(numeros, k)` que move cada elemento `k` posições para a direita; quem sai do fim volta para o começo.\n\n`rotacionar([1, 2, 3, 4], 1)` dá `[4, 1, 2, 3]`. O `k` pode ser maior que o tamanho da lista. Lista vazia devolve `[]`.",
    topics: ["arrays", "resto da divisão"],
    fn: "rotacionar",
    params: [{ name: "numeros", type: "number[]" }, { name: "k", type: "number" }],
    returns: "number[]",
    examples: [[[1, 2, 3, 4], 1], [[1, 2, 3], 5]],
    edge: [[[], 3], [[7, 8], 0]],
    generate: (r) => [nums(r, r.int(0, 8), 0, 50), r.int(0, 20)],
    js: "  const n = numeros.length;\n  if (n === 0) return [];\n  const passo = k % n;\n  return [...numeros.slice(n - passo), ...numeros.slice(0, n - passo)];",
    py: "    n = len(numeros)\n    if n == 0:\n        return []\n    passo = k % n\n    return numeros[n - passo:] + numeros[:n - passo]",
    hints: ["Rotacionar n vezes devolve a lista original: use k % tamanho.", "Os últimos `passo` elementos vão para a frente."],
  },

  // ---------------- DIFÍCIL ----------------
  {
    id: "parenteses-balanceados",
    difficulty: "dificil",
    title: "Parênteses balanceados",
    statement: "Escreva `balanceado(texto)` que devolve `true` se todos os `()`, `[]` e `{}` do texto abrem e fecham na ordem certa.\n\n`\"{[()]}\"` é balanceado; `\"([)]\"` e `\"((\"` não são. O texto só tem esses seis caracteres.",
    topics: ["pilha", "strings"],
    fn: "balanceado",
    params: [{ name: "texto", type: "string" }],
    returns: "boolean",
    examples: [["{[()]}"], ["([)]"], ["(("]],
    edge: [[""], [")("]],
    generate: (r) => {
      const pares = ["()", "[]", "{}"];
      let s = "";
      const build = (d: number): string => (d <= 0 || r.int(0, 3) === 0 ? "" : (() => { const p = r.pick(pares); return p[0] + build(d - 1) + p[1] + build(d - 1); })());
      s = build(4);
      if (r.bool() && s.length > 0) {
        const i = r.int(0, s.length - 1);
        s = s.slice(0, i) + r.pick([..."()[]{}"]) + s.slice(i + 1);
      }
      return [s];
    },
    js: '  const pilha = [];\n  const par = { ")": "(", "]": "[", "}": "{" };\n  for (const c of texto) {\n    if ("([{".includes(c)) pilha.push(c);\n    else if (pilha.pop() !== par[c]) return false;\n  }\n  return pilha.length === 0;',
    py: '    pilha = []\n    par = {")": "(", "]": "[", "}": "{"}\n    for c in texto:\n        if c in "([{":\n            pilha.append(c)\n        elif not pilha or pilha.pop() != par[c]:\n            return False\n    return len(pilha) == 0',
    hints: ["Use uma pilha: empilhe quem abre, desempilhe quando fechar.", "No fim, a pilha precisa estar vazia."],
  },
  {
    id: "primos-ate-n",
    difficulty: "dificil",
    title: "Primos até N",
    statement: "Escreva `primosAte(n)` que devolve, em ordem crescente, todos os números primos de `2` até `n` (inclusive).\n\nPrimo é o número maior que 1 que só é divisível por 1 e por ele mesmo. Para `n < 2`, devolva `[]`.",
    topics: ["matemática", "laços aninhados"],
    fn: "primosAte",
    params: [{ name: "n", type: "number" }],
    returns: "number[]",
    examples: [[10], [2]],
    edge: [[1], [0]],
    generate: (r) => [r.int(0, 300)],
    js: "  const primos = [];\n  for (let i = 2; i <= n; i++) {\n    let primo = true;\n    for (let d = 2; d * d <= i; d++) {\n      if (i % d === 0) {\n        primo = false;\n        break;\n      }\n    }\n    if (primo) primos.push(i);\n  }\n  return primos;",
    py: "    primos = []\n    for i in range(2, n + 1):\n        primo = True\n        d = 2\n        while d * d <= i:\n            if i % d == 0:\n                primo = False\n                break\n            d += 1\n        if primo:\n            primos.append(i)\n    return primos",
    hints: ["Para saber se i é primo, basta testar divisores até a raiz quadrada de i.", "Ou pesquise o Crivo de Eratóstenes."],
  },
  {
    id: "dois-numeros-soma",
    difficulty: "dificil",
    title: "Dois números que somam o alvo",
    statement: "Escreva `doisNumeros(numeros, alvo)` que devolve as posições `[i, j]` (com `i < j`) de dois números cuja soma é `alvo`.\n\nSe houver vários pares, devolva o de menor `i` e, empatando, o de menor `j`. Se não houver, devolva `[]`.",
    topics: ["arrays", "laços aninhados"],
    fn: "doisNumeros",
    params: [{ name: "numeros", type: "number[]" }, { name: "alvo", type: "number" }],
    returns: "number[]",
    examples: [[[2, 7, 11, 15], 9], [[3, 3], 6], [[1, 2], 10]],
    edge: [[[], 0]],
    generate: (r) => {
      const a = nums(r, r.int(2, 10), -10, 20);
      const alvo = r.bool() ? a[r.int(0, a.length - 1)]! + a[r.int(0, a.length - 1)]! : r.int(-20, 40);
      return [a, alvo];
    },
    js: "  for (let i = 0; i < numeros.length; i++) {\n    for (let j = i + 1; j < numeros.length; j++) {\n      if (numeros[i] + numeros[j] === alvo) return [i, j];\n    }\n  }\n  return [];",
    py: "    for i in range(len(numeros)):\n        for j in range(i + 1, len(numeros)):\n            if numeros[i] + numeros[j] == alvo:\n                return [i, j]\n    return []",
    hints: ["Dois laços: i de 0 até o fim, j começando em i + 1.", "Devolva assim que achar o primeiro par."],
  },
  {
    id: "maior-sequencia-crescente",
    difficulty: "dificil",
    title: "Maior subida seguida",
    statement: "Escreva `maiorSubida(numeros)` que devolve o tamanho do maior trecho **seguido** em que cada número é estritamente maior que o anterior.\n\nEm `[1, 3, 5, 4, 7]` a resposta é `3` (`1, 3, 5`). Lista vazia dá `0`; um número sozinho dá `1`.",
    topics: ["arrays", "contadores"],
    fn: "maiorSubida",
    params: [{ name: "numeros", type: "number[]" }],
    returns: "number",
    examples: [[[1, 3, 5, 4, 7]], [[5, 4, 3]]],
    edge: [[[]], [[2, 2, 2]]],
    generate: (r) => [nums(r, r.int(0, 15), 0, 20)],
    js: "  if (numeros.length === 0) return 0;\n  let melhor = 1;\n  let atual = 1;\n  for (let i = 1; i < numeros.length; i++) {\n    atual = numeros[i] > numeros[i - 1] ? atual + 1 : 1;\n    if (atual > melhor) melhor = atual;\n  }\n  return melhor;",
    py: "    if not numeros:\n        return 0\n    melhor = 1\n    atual = 1\n    for i in range(1, len(numeros)):\n        atual = atual + 1 if numeros[i] > numeros[i - 1] else 1\n        melhor = max(melhor, atual)\n    return melhor",
    hints: ["Guarde o tamanho da subida atual e o melhor visto.", "Quando a subida quebra, a atual volta para 1."],
  },
  {
    id: "comprimir-texto",
    difficulty: "dificil",
    title: "Comprimir texto",
    statement: "Escreva `comprimir(texto)` que troca cada sequência de letras iguais pela letra seguida da quantidade.\n\n`\"aaabcc\"` vira `\"a3b1c2\"`. Texto vazio devolve `\"\"`.",
    topics: ["strings", "contadores"],
    fn: "comprimir",
    params: [{ name: "texto", type: "string" }],
    returns: "string",
    examples: [["aaabcc"], ["abc"]],
    edge: [[""], ["zzzzzzzzzzzz"]],
    generate: (r) => [Array.from({ length: r.int(0, 6) }, () => r.pick([..."abcxyz"]).repeat(r.int(1, 5))).join("")],
    js: '  let saida = "";\n  let i = 0;\n  while (i < texto.length) {\n    let j = i;\n    while (j < texto.length && texto[j] === texto[i]) j++;\n    saida += texto[i] + (j - i);\n    i = j;\n  }\n  return saida;',
    py: '    saida = ""\n    i = 0\n    while i < len(texto):\n        j = i\n        while j < len(texto) and texto[j] == texto[i]:\n            j += 1\n        saida += texto[i] + str(j - i)\n        i = j\n    return saida',
    hints: ["Use dois índices: i marca o começo da sequência, j anda enquanto a letra for igual.", "Depois de anotar, continue a partir de j."],
  },
  {
    id: "numeros-romanos",
    difficulty: "dificil",
    title: "Números romanos",
    statement: "Escreva `paraRomano(n)` que converte um inteiro de `1` a `3999` para algarismos romanos.\n\nExemplos: `4` é `\"IV\"`, `9` é `\"IX\"`, `14` é `\"XIV\"`, `1994` é `\"MCMXCIV\"`.",
    topics: ["arrays", "laços", "matemática"],
    fn: "paraRomano",
    params: [{ name: "n", type: "number" }],
    returns: "string",
    examples: [[4], [14], [1994]],
    edge: [[1], [3999]],
    generate: (r) => [r.int(1, 3999)],
    js: '  const tabela = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];\n  let saida = "";\n  for (const [valor, simbolo] of tabela) {\n    while (n >= valor) {\n      saida += simbolo;\n      n -= valor;\n    }\n  }\n  return saida;',
    py: '    tabela = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]\n    saida = ""\n    for valor, simbolo in tabela:\n        while n >= valor:\n            saida += simbolo\n            n -= valor\n    return saida',
    hints: ["Monte uma tabela do maior para o menor valor, incluindo 900, 400, 90, 40, 9 e 4.", "Enquanto n couber no valor, escreva o símbolo e subtraia."],
  },
];

// ---------------- SQL ----------------
/** Esquema usado em todos os desafios de SQL (SQLite rodando no navegador). */
export const SQL_SCHEMA = `create table clientes (id integer primary key, nome text not null, cidade text not null, idade integer not null);
create table produtos (id integer primary key, nome text not null, categoria text not null, preco real not null);
create table pedidos (id integer primary key, cliente_id integer not null references clientes(id), produto_id integer not null references produtos(id), quantidade integer not null);`;

const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Heitor", "Iara", "João", "Kátia", "Lucas", "Marina", "Nina", "Otávio", "Paula", "Rafael", "Sofia", "Tiago", "Vitória"];
const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Recife", "Salvador"];
const PRODUTOS: Array<[string, string]> = [
  ["Livro de lógica", "Livros"], ["Romance policial", "Livros"], ["HQ de heróis", "Livros"], ["Guia de SQL", "Livros"],
  ["Fone sem fio", "Eletrônicos"], ["Teclado mecânico", "Eletrônicos"], ["Mouse gamer", "Eletrônicos"], ["Monitor 24\"", "Eletrônicos"],
  ["Luminária", "Casa"], ["Jogo de panelas", "Casa"], ["Almofada", "Casa"],
  ["Bola de futebol", "Esportes"], ["Tênis de corrida", "Esportes"], ["Garrafa térmica", "Esportes"],
  ["Quebra-cabeça", "Brinquedos"], ["Blocos de montar", "Brinquedos"],
];

const sq = (v: string) => `'${v.replace(/'/g, "''")}'`;

/** Gera dados aleatórios (e válidos) para o esquema. */
export function sqlDataset(r: Rng): string {
  const nomes = [...NOMES].sort(() => (r.bool() ? 1 : -1)).slice(0, r.int(10, 14));
  const clientes = nomes.map((nome, i) => `(${i + 1}, ${sq(nome)}, ${sq(r.pick(CIDADES))}, ${r.int(16, 70)})`);
  const prods = [...PRODUTOS].sort(() => (r.bool() ? 1 : -1)).slice(0, r.int(10, 14));
  const precos = new Set<number>();
  const produtos = prods.map(([nome, cat], i) => {
    let p = 0;
    do p = r.int(1500, 90000) / 100;
    while (precos.has(p));
    precos.add(p);
    return `(${i + 1}, ${sq(nome)}, ${sq(cat)}, ${p.toFixed(2)})`;
  });
  // Uns 3 clientes ficam sem pedido, para os desafios de LEFT JOIN.
  const compradores = Math.max(1, nomes.length - r.int(2, 4));
  const pedidos = Array.from({ length: r.int(15, 25) }, (_, i) => `(${i + 1}, ${r.int(1, compradores)}, ${r.int(1, prods.length)}, ${r.int(1, 5)})`);
  return [
    SQL_SCHEMA,
    `insert into clientes values ${clientes.join(", ")};`,
    `insert into produtos values ${produtos.join(", ")};`,
    `insert into pedidos values ${pedidos.join(", ")};`,
  ].join("\n");
}

export const sqlChallenges: readonly SqlChallenge[] = [
  {
    id: "sql-clientes-de-sao-paulo",
    difficulty: "facil",
    title: "Clientes de São Paulo",
    statement: "Liste `nome` e `idade` dos clientes da cidade `'São Paulo'`, em ordem alfabética de nome.",
    topics: ["SELECT", "WHERE", "ORDER BY"],
    ordered: true,
    solution: "select nome, idade\nfrom clientes\nwhere cidade = 'São Paulo'\norder by nome;",
    hints: ["Filtre com WHERE cidade = 'São Paulo'.", "Ordene com ORDER BY nome."],
  },
  {
    id: "sql-contar-livros",
    difficulty: "facil",
    title: "Quantos livros?",
    statement: "Quantos produtos existem na categoria `'Livros'`? Devolva uma única coluna com o total.",
    topics: ["COUNT", "WHERE"],
    ordered: false,
    solution: "select count(*) as total\nfrom produtos\nwhere categoria = 'Livros';",
    hints: ["COUNT(*) conta as linhas.", "Use WHERE para ficar só com os livros."],
  },
  {
    id: "sql-tres-mais-caros",
    difficulty: "facil",
    title: "Os 3 mais caros",
    statement: "Mostre `nome` e `preco` dos 3 produtos mais caros, do mais caro para o mais barato.",
    topics: ["ORDER BY", "LIMIT"],
    ordered: true,
    solution: "select nome, preco\nfrom produtos\norder by preco desc\nlimit 3;",
    hints: ["ORDER BY preco DESC ordena do maior para o menor.", "LIMIT 3 fica com as 3 primeiras linhas."],
  },
  {
    id: "sql-clientes-jovens",
    difficulty: "facil",
    title: "Clientes de 18 a 25 anos",
    statement: "Liste o `nome` dos clientes com idade entre 18 e 25 anos (incluindo 18 e 25). A ordem não importa.",
    topics: ["WHERE", "BETWEEN"],
    ordered: false,
    solution: "select nome\nfrom clientes\nwhere idade between 18 and 25;",
    hints: ["BETWEEN inclui as duas pontas.", "Também dá para usar idade >= 18 AND idade <= 25."],
  },
  {
    id: "sql-clientes-por-cidade",
    difficulty: "medio",
    title: "Clientes por cidade",
    statement: "Para cada cidade, mostre `cidade` e quantos clientes ela tem (`total`). Ordene do maior total para o menor; em empate, pela cidade em ordem alfabética.",
    topics: ["GROUP BY", "COUNT", "ORDER BY"],
    ordered: true,
    solution: "select cidade, count(*) as total\nfrom clientes\ngroup by cidade\norder by total desc, cidade;",
    hints: ["GROUP BY cidade junta as linhas de cada cidade.", "ORDER BY aceita mais de um critério: total DESC, cidade."],
  },
  {
    id: "sql-preco-medio-categoria",
    difficulty: "medio",
    title: "Preço médio por categoria",
    statement: "Mostre `categoria` e o preço médio dos produtos dela, arredondado para 2 casas (`round(..., 2)`). Ordene pela categoria.",
    topics: ["GROUP BY", "AVG", "ROUND"],
    ordered: true,
    solution: "select categoria, round(avg(preco), 2) as media\nfrom produtos\ngroup by categoria\norder by categoria;",
    hints: ["AVG(preco) calcula a média do grupo.", "Envolva com ROUND(AVG(preco), 2)."],
  },
  {
    id: "sql-quem-comprou-o-que",
    difficulty: "medio",
    title: "Quem comprou o quê",
    statement: "Para cada pedido, mostre o nome do cliente e o nome do produto (nessa ordem de colunas). A ordem das linhas não importa.",
    topics: ["JOIN"],
    ordered: false,
    solution: "select c.nome, p.nome\nfrom pedidos pe\njoin clientes c on c.id = pe.cliente_id\njoin produtos p on p.id = pe.produto_id;",
    hints: ["Junte pedidos com clientes pela coluna cliente_id.", "Faça um segundo JOIN com produtos por produto_id."],
  },
  {
    id: "sql-clientes-sem-pedido",
    difficulty: "medio",
    title: "Clientes que nunca compraram",
    statement: "Liste o `nome` dos clientes que não têm nenhum pedido. A ordem não importa.",
    topics: ["LEFT JOIN", "IS NULL", "NOT EXISTS"],
    ordered: false,
    solution: "select c.nome\nfrom clientes c\nleft join pedidos pe on pe.cliente_id = c.id\nwhere pe.id is null;",
    hints: ["LEFT JOIN mantém os clientes mesmo sem pedido (as colunas do pedido ficam NULL).", "Outra saída: WHERE NOT EXISTS (SELECT 1 FROM pedidos ...)."],
  },
  {
    id: "sql-grandes-compradores",
    difficulty: "dificil",
    title: "Grandes compradores",
    statement: "Mostre `nome` e o total gasto (`quantidade * preco` somado) de cada cliente que gastou **mais de 500**. Arredonde o total para 2 casas. Ordene do maior total para o menor; em empate, por nome.",
    topics: ["JOIN", "GROUP BY", "HAVING"],
    ordered: true,
    solution: "select c.nome, round(sum(pe.quantidade * p.preco), 2) as total\nfrom pedidos pe\njoin clientes c on c.id = pe.cliente_id\njoin produtos p on p.id = pe.produto_id\ngroup by c.id, c.nome\nhaving sum(pe.quantidade * p.preco) > 500\norder by total desc, c.nome;",
    hints: ["Filtro sobre um valor agregado vai no HAVING, não no WHERE.", "Agrupe por cliente (id e nome)."],
  },
  {
    id: "sql-categoria-campea",
    difficulty: "dificil",
    title: "Categoria campeã de vendas",
    statement: "Qual categoria mais faturou (`quantidade * preco` somado)? Devolva uma linha com `categoria` e o faturamento arredondado para 2 casas. Em empate, a categoria que vem primeiro no alfabeto.",
    topics: ["JOIN", "GROUP BY", "ORDER BY", "LIMIT"],
    ordered: true,
    solution: "select p.categoria, round(sum(pe.quantidade * p.preco), 2) as faturamento\nfrom pedidos pe\njoin produtos p on p.id = pe.produto_id\ngroup by p.categoria\norder by sum(pe.quantidade * p.preco) desc, p.categoria\nlimit 1;",
    hints: ["Agrupe por categoria somando quantidade * preco.", "Ordene do maior para o menor e pegue só a primeira linha."],
  },
  {
    id: "sql-mais-velho-por-cidade",
    difficulty: "dificil",
    title: "O mais velho de cada cidade",
    statement: "Para cada cidade que tem clientes, mostre `cidade` e o `nome` do cliente mais velho. Em empate de idade, o nome que vem primeiro no alfabeto. Ordene por cidade.",
    topics: ["subconsulta", "funções de janela"],
    ordered: true,
    solution: "select cidade, nome\nfrom (\n  select cidade, nome,\n         row_number() over (partition by cidade order by idade desc, nome) as pos\n  from clientes\n)\nwhere pos = 1\norder by cidade;",
    hints: ["ROW_NUMBER() OVER (PARTITION BY cidade ORDER BY idade DESC, nome) numera cada cidade.", "Fique com as linhas de posição 1."],
  },
];

export const CHALLENGE_LABEL: Record<ChallengeDifficulty, string> = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
