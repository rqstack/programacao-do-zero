(()=>{"use strict";(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,9559,e=>{let a="abcdefghijklmnopqrstuvwxyz",t=["casa","codigo","dado","festa","gato","janela","livro","mesa","nuvem","ovo","pato","rede","sol","tela","uva","vento","zebra","arara","radar","osso","reviver","ana"],r=(e,t=3,r=8)=>Array.from({length:e.int(t,r)},()=>e.pick([...a])).join(""),o=(e,a,t,r)=>Array.from({length:a},()=>e.int(t,r)),n=(e,a)=>Array.from({length:a},()=>e.pick(t)).join(" "),s=[{id:"soma-da-lista",difficulty:"facil",title:"Soma da lista",statement:"Escreva `somaLista(numeros)` que devolve a soma de todos os números da lista.\n\nSe a lista estiver vazia, a soma é `0`.",topics:["laços","arrays"],fn:"somaLista",params:[{name:"numeros",type:"number[]"}],returns:"number",examples:[[[1,2,3]],[[10,-4]]],edge:[[[]]],generate:e=>[o(e,e.int(0,12),-50,100)],js:"  let soma = 0;\n  for (const n of numeros) soma += n;\n  return soma;",py:"    soma = 0\n    for n in numeros:\n        soma += n\n    return soma",hints:["Comece com uma variável valendo 0.","Percorra a lista somando cada número nessa variável."]},{id:"contar-vogais",difficulty:"facil",title:"Contar vogais",statement:'Escreva `contarVogais(texto)` que devolve quantas vogais (`a e i o u`) o texto tem.\n\nMaiúsculas também contam: `"Ola"` tem 2 vogais. O texto não tem acentos.',topics:["strings","laços"],fn:"contarVogais",params:[{name:"texto",type:"string"}],returns:"number",examples:[["programacao"],["OLA mundo"]],edge:[[""],["xyz"]],generate:e=>[Array.from({length:e.int(0,3)},()=>{let a=r(e);return e.bool()?a.toUpperCase():a}).join(" ")],js:'  let total = 0;\n  for (const letra of texto.toLowerCase()) {\n    if ("aeiou".includes(letra)) total++;\n  }\n  return total;',py:'    total = 0\n    for letra in texto.lower():\n        if letra in "aeiou":\n            total += 1\n    return total',hints:["Converta o texto para minúsculas antes de comparar.",'Para cada letra, verifique se ela está em "aeiou".']},{id:"maior-numero",difficulty:"facil",title:"Maior número",statement:"Escreva `maiorNumero(numeros)` que devolve o maior número da lista, **sem usar** `Math.max` nem `max()`.\n\nA lista sempre tem pelo menos um número.",topics:["laços","comparação"],fn:"maiorNumero",params:[{name:"numeros",type:"number[]"}],returns:"number",examples:[[[3,9,2]],[[-5,-1,-8]]],edge:[[[7]]],generate:e=>[o(e,e.int(1,12),-100,100)],js:"  let maior = numeros[0];\n  for (const n of numeros) {\n    if (n > maior) maior = n;\n  }\n  return maior;",py:"    maior = numeros[0]\n    for n in numeros:\n        if n > maior:\n            maior = n\n    return maior",hints:["Comece supondo que o primeiro é o maior.","Cuidado: começar com 0 falha quando todos são negativos."]},{id:"palindromo",difficulty:"facil",title:"É palíndromo?",statement:'Escreva `ehPalindromo(palavra)` que devolve `true` se a palavra é igual lida de trás para frente (como `"arara"`) e `false` caso contrário.\n\nAs palavras vêm em minúsculas e sem espaços.',topics:["strings"],fn:"ehPalindromo",params:[{name:"palavra",type:"string"}],returns:"boolean",examples:[["arara"],["codigo"]],edge:[[""],["a"]],generate:e=>{if(e.bool())return[e.pick(t)];let o=r(e,1,5);return[o+(e.bool()?"":e.pick([...a]))+[...o].reverse().join("")]},js:'  return palavra === palavra.split("").reverse().join("");',py:"    return palavra == palavra[::-1]",hints:["Inverta a palavra e compare com a original.",'Em JavaScript: split(""), reverse() e join("").']},{id:"fizzbuzz",difficulty:"facil",title:"FizzBuzz",statement:'Escreva `fizzBuzz(n)` que devolve:\n\n`"FizzBuzz"` se `n` for divisível por 3 e por 5; `"Fizz"` se só por 3; `"Buzz"` se só por 5; e o próprio número como texto nos outros casos (ex.: `"7"`).',topics:["condicionais","resto da divisão"],fn:"fizzBuzz",params:[{name:"n",type:"number"}],returns:"string",examples:[[15],[9],[10],[7]],edge:[[1],[30]],generate:e=>[e.int(1,300)],js:'  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);',py:'    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)',hints:["Use o operador de resto: n % 3 === 0 significa divisível por 3.","Teste o caso de 3 e 5 juntos primeiro."]},{id:"contar-pares",difficulty:"facil",title:"Quantos pares?",statement:"Escreva `contarPares(numeros)` que devolve quantos números da lista são pares.\n\nZero é par, e números negativos também podem ser pares (`-4`).",topics:["laços","resto da divisão"],fn:"contarPares",params:[{name:"numeros",type:"number[]"}],returns:"number",examples:[[[1,2,3,4]],[[0,-2,7]]],edge:[[[]]],generate:e=>[o(e,e.int(0,15),-30,30)],js:"  return numeros.filter((n) => n % 2 === 0).length;",py:"    return len([n for n in numeros if n % 2 == 0])",hints:["Um número é par quando o resto da divisão por 2 é 0.","Em JavaScript, -3 % 2 dá -1: compare com 0, não com 1."]},{id:"inverter-texto",difficulty:"facil",title:"Texto ao contrário",statement:'Escreva `inverterTexto(texto)` que devolve o texto com os caracteres na ordem inversa.\n\nExemplo: `"sol nasce"` vira `"ecsan los"`.',topics:["strings","laços"],fn:"inverterTexto",params:[{name:"texto",type:"string"}],returns:"string",examples:[["sol nasce"],["abc"]],edge:[[""]],generate:e=>[n(e,e.int(1,4))],js:'  let saida = "";\n  for (const c of texto) saida = c + saida;\n  return saida;',py:"    return texto[::-1]",hints:["Percorra o texto e coloque cada caractere na frente do resultado.","Ou percorra de trás para frente com um índice."]},{id:"media-das-notas",difficulty:"facil",title:"Média das notas",statement:"Escreva `media(notas)` que devolve a média aritmética das notas (soma dividida pela quantidade).\n\nSe a lista estiver vazia, devolva `0`. Não arredonde.",topics:["laços","divisão"],fn:"media",params:[{name:"notas",type:"number[]"}],returns:"number",decimal:!0,examples:[[[7,8,9]],[[5,10]]],edge:[[[]]],generate:e=>[o(e,e.int(0,8),0,10)],js:"  if (notas.length === 0) return 0;\n  let soma = 0;\n  for (const n of notas) soma += n;\n  return soma / notas.length;",py:"    if len(notas) == 0:\n        return 0\n    return sum(notas) / len(notas)",hints:["Trate a lista vazia antes de dividir (divisão por zero).","Média = soma / quantidade."]},{id:"letra-mais-frequente",difficulty:"medio",title:"Letra mais frequente",statement:"Escreva `letraMaisFrequente(texto)` que devolve a letra que mais aparece no texto (só letras minúsculas de `a` a `z`; ignore espaços).\n\nEm caso de empate, devolva a que vem primeiro no alfabeto. O texto tem pelo menos uma letra.",topics:["objetos/dicionários","contagem"],fn:"letraMaisFrequente",params:[{name:"texto",type:"string"}],returns:"string",examples:[["banana"],["abc cba"]],edge:[["z"]],generate:e=>[n(e,e.int(1,4))],js:'  const conta = {};\n  for (const c of texto) {\n    if (c >= "a" && c <= "z") conta[c] = (conta[c] ?? 0) + 1;\n  }\n  let melhor = "";\n  for (const c of Object.keys(conta).sort()) {\n    if (melhor === "" || conta[c] > conta[melhor]) melhor = c;\n  }\n  return melhor;',py:'    conta = {}\n    for c in texto:\n        if "a" <= c <= "z":\n            conta[c] = conta.get(c, 0) + 1\n    melhor = ""\n    for c in sorted(conta):\n        if melhor == "" or conta[c] > conta[melhor]:\n            melhor = c\n    return melhor',hints:["Conte cada letra num objeto (JS) ou dicionário (Python).","Percorra as letras em ordem alfabética e só troque quando a contagem for MAIOR."]},{id:"remover-duplicados",difficulty:"medio",title:"Remover duplicados",statement:"Escreva `removerDuplicados(numeros)` que devolve uma nova lista sem repetições, mantendo a ordem da **primeira** aparição de cada número.\n\nExemplo: `[3, 1, 3, 2, 1]` vira `[3, 1, 2]`.",topics:["arrays","Set"],fn:"removerDuplicados",params:[{name:"numeros",type:"number[]"}],returns:"number[]",examples:[[[3,1,3,2,1]],[[5,5,5]]],edge:[[[]]],generate:e=>[o(e,e.int(0,15),0,9)],js:"  const vistos = new Set();\n  const saida = [];\n  for (const n of numeros) {\n    if (!vistos.has(n)) {\n      vistos.add(n);\n      saida.push(n);\n    }\n  }\n  return saida;",py:"    vistos = set()\n    saida = []\n    for n in numeros:\n        if n not in vistos:\n            vistos.add(n)\n            saida.append(n)\n    return saida",hints:["Guarde os números já vistos num Set (JS) ou set (Python).","Só adicione na saída quando o número ainda não foi visto."]},{id:"segundo-maior",difficulty:"medio",title:"Segundo maior",statement:"Escreva `segundoMaior(numeros)` que devolve o segundo maior valor **distinto** da lista.\n\nEm `[5, 9, 9, 2]` a resposta é `5`. A lista sempre tem pelo menos dois valores diferentes.",topics:["arrays","ordenação"],fn:"segundoMaior",params:[{name:"numeros",type:"number[]"}],returns:"number",examples:[[[5,9,9,2]],[[1,2]]],edge:[[[-1,-1,-3]]],generate:e=>{let a=o(e,e.int(2,12),-40,40);return new Set(a).size<2&&a.push(a[0]+1),[a]},js:"  const unicos = [...new Set(numeros)].sort((a, b) => b - a);\n  return unicos[1];",py:"    unicos = sorted(set(numeros), reverse=True)\n    return unicos[1]",hints:["Tire os repetidos primeiro.","Em JavaScript, sort() sem comparador ordena como texto: use (a, b) => b - a."]},{id:"capitalizar-palavras",difficulty:"medio",title:"Capitalizar palavras",statement:'Escreva `capitalizar(frase)` que deixa a primeira letra de cada palavra em maiúscula.\n\nAs palavras vêm em minúsculas, separadas por um espaço. Exemplo: `"ola mundo"` vira `"Ola Mundo"`.',topics:["strings","arrays"],fn:"capitalizar",params:[{name:"frase",type:"string"}],returns:"string",examples:[["ola mundo"],["programacao do zero"]],edge:[[""],["a"]],generate:e=>[n(e,e.int(1,5))],js:'  return frase\n    .split(" ")\n    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))\n    .join(" ");',py:'    return " ".join(p[:1].upper() + p[1:] for p in frase.split(" "))',hints:['Separe a frase em palavras com split(" ").','Junte de novo com join(" ") depois de transformar cada uma.']},{id:"soma-dos-digitos",difficulty:"medio",title:"Soma dos dígitos",statement:"Escreva `somaDigitos(n)` que devolve a soma dos dígitos de um inteiro não negativo.\n\nExemplo: `4071` dá `4 + 0 + 7 + 1 = 12`. Tente resolver com matemática (`% 10` e divisão inteira) em vez de converter para texto.",topics:["matemática","laços"],fn:"somaDigitos",params:[{name:"n",type:"number"}],returns:"number",examples:[[4071],[9]],edge:[[0]],generate:e=>[e.int(0,9999999)],js:"  let soma = 0;\n  while (n > 0) {\n    soma += n % 10;\n    n = Math.floor(n / 10);\n  }\n  return soma;",py:"    soma = 0\n    while n > 0:\n        soma += n % 10\n        n //= 10\n    return soma",hints:["n % 10 dá o último dígito.","Math.floor(n / 10) (ou n // 10 em Python) remove o último dígito."]},{id:"anagramas",difficulty:"medio",title:"São anagramas?",statement:'Escreva `saoAnagramas(a, b)` que devolve `true` se as duas palavras usam exatamente as mesmas letras, nas mesmas quantidades (como `"amor"` e `"roma"`).\n\nAs palavras vêm em minúsculas e sem espaços.',topics:["strings","ordenação"],fn:"saoAnagramas",params:[{name:"a",type:"string"},{name:"b",type:"string"}],returns:"boolean",examples:[["amor","roma"],["gato","toga"],["casa","cassa"]],edge:[["",""],["aab","abb"]],generate:e=>{let t=r(e,2,7),o=[...t].sort(()=>e.bool()?1:-1).join("");return e.bool()?[t,o]:[t,e.bool()?o+e.pick([...a]):r(e,t.length,t.length)]},js:'  const ordenar = (s) => s.split("").sort().join("");\n  return ordenar(a) === ordenar(b);',py:"    return sorted(a) == sorted(b)",hints:["Se você ordenar as letras das duas, anagramas ficam iguais.","Tamanhos diferentes já mostram que não são anagramas."]},{id:"contar-palavras",difficulty:"medio",title:"Contar palavras",statement:"Escreva `contarPalavras(frase)` que devolve quantas palavras a frase tem.\n\nPode haver **vários espaços** entre as palavras e espaços no começo ou no fim. Frase só com espaços tem 0 palavras.",topics:["strings"],fn:"contarPalavras",params:[{name:"frase",type:"string"}],returns:"number",examples:[["  ola   mundo "],["um dois tres"]],edge:[[""],["     "]],generate:e=>{let a=()=>" ".repeat(e.int(1,3)),r=Array.from({length:e.int(0,6)},()=>e.pick(t));return[(e.bool()?a():"")+r.join(a())+(e.bool()?a():"")]},js:'  return frase.split(" ").filter((p) => p !== "").length;',py:"    return len(frase.split())",hints:["Separar por um espaço gera pedaços vazios quando há espaços seguidos.","Filtre os pedaços vazios antes de contar."]},{id:"rotacionar-lista",difficulty:"medio",title:"Rotacionar a lista",statement:"Escreva `rotacionar(numeros, k)` que move cada elemento `k` posições para a direita; quem sai do fim volta para o começo.\n\n`rotacionar([1, 2, 3, 4], 1)` dá `[4, 1, 2, 3]`. O `k` pode ser maior que o tamanho da lista. Lista vazia devolve `[]`.",topics:["arrays","resto da divisão"],fn:"rotacionar",params:[{name:"numeros",type:"number[]"},{name:"k",type:"number"}],returns:"number[]",examples:[[[1,2,3,4],1],[[1,2,3],5]],edge:[[[],3],[[7,8],0]],generate:e=>[o(e,e.int(0,8),0,50),e.int(0,20)],js:"  const n = numeros.length;\n  if (n === 0) return [];\n  const passo = k % n;\n  return [...numeros.slice(n - passo), ...numeros.slice(0, n - passo)];",py:"    n = len(numeros)\n    if n == 0:\n        return []\n    passo = k % n\n    return numeros[n - passo:] + numeros[:n - passo]",hints:["Rotacionar n vezes devolve a lista original: use k % tamanho.","Os últimos `passo` elementos vão para a frente."]},{id:"parenteses-balanceados",difficulty:"dificil",title:"Parênteses balanceados",statement:'Escreva `balanceado(texto)` que devolve `true` se todos os `()`, `[]` e `{}` do texto abrem e fecham na ordem certa.\n\n`"{[()]}"` é balanceado; `"([)]"` e `"(("` não são. O texto só tem esses seis caracteres.',topics:["pilha","strings"],fn:"balanceado",params:[{name:"texto",type:"string"}],returns:"boolean",examples:[["{[()]}"],["([)]"],["(("]],edge:[[""],[")("]],generate:e=>{let a=["()","[]","{}"],t="",r=t=>{let o;return t<=0||0===e.int(0,3)?"":(o=e.pick(a))[0]+r(t-1)+o[1]+r(t-1)};if(t=r(4),e.bool()&&t.length>0){let a=e.int(0,t.length-1);t=t.slice(0,a)+e.pick([..."()[]{}"])+t.slice(a+1)}return[t]},js:'  const pilha = [];\n  const par = { ")": "(", "]": "[", "}": "{" };\n  for (const c of texto) {\n    if ("([{".includes(c)) pilha.push(c);\n    else if (pilha.pop() !== par[c]) return false;\n  }\n  return pilha.length === 0;',py:'    pilha = []\n    par = {")": "(", "]": "[", "}": "{"}\n    for c in texto:\n        if c in "([{":\n            pilha.append(c)\n        elif not pilha or pilha.pop() != par[c]:\n            return False\n    return len(pilha) == 0',hints:["Use uma pilha: empilhe quem abre, desempilhe quando fechar.","No fim, a pilha precisa estar vazia."]},{id:"primos-ate-n",difficulty:"dificil",title:"Primos até N",statement:"Escreva `primosAte(n)` que devolve, em ordem crescente, todos os números primos de `2` até `n` (inclusive).\n\nPrimo é o número maior que 1 que só é divisível por 1 e por ele mesmo. Para `n < 2`, devolva `[]`.",topics:["matemática","laços aninhados"],fn:"primosAte",params:[{name:"n",type:"number"}],returns:"number[]",examples:[[10],[2]],edge:[[1],[0]],generate:e=>[e.int(0,300)],js:"  const primos = [];\n  for (let i = 2; i <= n; i++) {\n    let primo = true;\n    for (let d = 2; d * d <= i; d++) {\n      if (i % d === 0) {\n        primo = false;\n        break;\n      }\n    }\n    if (primo) primos.push(i);\n  }\n  return primos;",py:"    primos = []\n    for i in range(2, n + 1):\n        primo = True\n        d = 2\n        while d * d <= i:\n            if i % d == 0:\n                primo = False\n                break\n            d += 1\n        if primo:\n            primos.append(i)\n    return primos",hints:["Para saber se i é primo, basta testar divisores até a raiz quadrada de i.","Ou pesquise o Crivo de Eratóstenes."]},{id:"dois-numeros-soma",difficulty:"dificil",title:"Dois números que somam o alvo",statement:"Escreva `doisNumeros(numeros, alvo)` que devolve as posições `[i, j]` (com `i < j`) de dois números cuja soma é `alvo`.\n\nSe houver vários pares, devolva o de menor `i` e, empatando, o de menor `j`. Se não houver, devolva `[]`.",topics:["arrays","laços aninhados"],fn:"doisNumeros",params:[{name:"numeros",type:"number[]"},{name:"alvo",type:"number"}],returns:"number[]",examples:[[[2,7,11,15],9],[[3,3],6],[[1,2],10]],edge:[[[],0]],generate:e=>{let a=o(e,e.int(2,10),-10,20),t=e.bool()?a[e.int(0,a.length-1)]+a[e.int(0,a.length-1)]:e.int(-20,40);return[a,t]},js:"  for (let i = 0; i < numeros.length; i++) {\n    for (let j = i + 1; j < numeros.length; j++) {\n      if (numeros[i] + numeros[j] === alvo) return [i, j];\n    }\n  }\n  return [];",py:"    for i in range(len(numeros)):\n        for j in range(i + 1, len(numeros)):\n            if numeros[i] + numeros[j] == alvo:\n                return [i, j]\n    return []",hints:["Dois laços: i de 0 até o fim, j começando em i + 1.","Devolva assim que achar o primeiro par."]},{id:"maior-sequencia-crescente",difficulty:"dificil",title:"Maior subida seguida",statement:"Escreva `maiorSubida(numeros)` que devolve o tamanho do maior trecho **seguido** em que cada número é estritamente maior que o anterior.\n\nEm `[1, 3, 5, 4, 7]` a resposta é `3` (`1, 3, 5`). Lista vazia dá `0`; um número sozinho dá `1`.",topics:["arrays","contadores"],fn:"maiorSubida",params:[{name:"numeros",type:"number[]"}],returns:"number",examples:[[[1,3,5,4,7]],[[5,4,3]]],edge:[[[]],[[2,2,2]]],generate:e=>[o(e,e.int(0,15),0,20)],js:"  if (numeros.length === 0) return 0;\n  let melhor = 1;\n  let atual = 1;\n  for (let i = 1; i < numeros.length; i++) {\n    atual = numeros[i] > numeros[i - 1] ? atual + 1 : 1;\n    if (atual > melhor) melhor = atual;\n  }\n  return melhor;",py:"    if not numeros:\n        return 0\n    melhor = 1\n    atual = 1\n    for i in range(1, len(numeros)):\n        atual = atual + 1 if numeros[i] > numeros[i - 1] else 1\n        melhor = max(melhor, atual)\n    return melhor",hints:["Guarde o tamanho da subida atual e o melhor visto.","Quando a subida quebra, a atual volta para 1."]},{id:"comprimir-texto",difficulty:"dificil",title:"Comprimir texto",statement:'Escreva `comprimir(texto)` que troca cada sequência de letras iguais pela letra seguida da quantidade.\n\n`"aaabcc"` vira `"a3b1c2"`. Texto vazio devolve `""`.',topics:["strings","contadores"],fn:"comprimir",params:[{name:"texto",type:"string"}],returns:"string",examples:[["aaabcc"],["abc"]],edge:[[""],["zzzzzzzzzzzz"]],generate:e=>[Array.from({length:e.int(0,6)},()=>e.pick([..."abcxyz"]).repeat(e.int(1,5))).join("")],js:'  let saida = "";\n  let i = 0;\n  while (i < texto.length) {\n    let j = i;\n    while (j < texto.length && texto[j] === texto[i]) j++;\n    saida += texto[i] + (j - i);\n    i = j;\n  }\n  return saida;',py:'    saida = ""\n    i = 0\n    while i < len(texto):\n        j = i\n        while j < len(texto) and texto[j] == texto[i]:\n            j += 1\n        saida += texto[i] + str(j - i)\n        i = j\n    return saida',hints:["Use dois índices: i marca o começo da sequência, j anda enquanto a letra for igual.","Depois de anotar, continue a partir de j."]},{id:"numeros-romanos",difficulty:"dificil",title:"Números romanos",statement:'Escreva `paraRomano(n)` que converte um inteiro de `1` a `3999` para algarismos romanos.\n\nExemplos: `4` é `"IV"`, `9` é `"IX"`, `14` é `"XIV"`, `1994` é `"MCMXCIV"`.',topics:["arrays","laços","matemática"],fn:"paraRomano",params:[{name:"n",type:"number"}],returns:"string",examples:[[4],[14],[1994]],edge:[[1],[3999]],generate:e=>[e.int(1,3999)],js:'  const tabela = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];\n  let saida = "";\n  for (const [valor, simbolo] of tabela) {\n    while (n >= valor) {\n      saida += simbolo;\n      n -= valor;\n    }\n  }\n  return saida;',py:'    tabela = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]\n    saida = ""\n    for valor, simbolo in tabela:\n        while n >= valor:\n            saida += simbolo\n            n -= valor\n    return saida',hints:["Monte uma tabela do maior para o menor valor, incluindo 900, 400, 90, 40, 9 e 4.","Enquanto n couber no valor, escreva o símbolo e subtraia."]}],i=`create table clientes (id integer primary key, nome text not null, cidade text not null, idade integer not null);
create table produtos (id integer primary key, nome text not null, categoria text not null, preco real not null);
create table pedidos (id integer primary key, cliente_id integer not null references clientes(id), produto_id integer not null references produtos(id), quantidade integer not null);`,l=["Ana","Bruno","Carla","Diego","Elisa","Fábio","Gabi","Heitor","Iara","João","Kátia","Lucas","Marina","Nina","Otávio","Paula","Rafael","Sofia","Tiago","Vitória"],d=["São Paulo","Rio de Janeiro","Belo Horizonte","Curitiba","Recife","Salvador"],c=[["Livro de lógica","Livros"],["Romance policial","Livros"],["HQ de heróis","Livros"],["Guia de SQL","Livros"],["Fone sem fio","Eletrônicos"],["Teclado mecânico","Eletrônicos"],["Mouse gamer","Eletrônicos"],['Monitor 24"',"Eletrônicos"],["Luminária","Casa"],["Jogo de panelas","Casa"],["Almofada","Casa"],["Bola de futebol","Esportes"],["Tênis de corrida","Esportes"],["Garrafa térmica","Esportes"],["Quebra-cabeça","Brinquedos"],["Blocos de montar","Brinquedos"]],m=e=>`'${e.replace(/'/g,"''")}'`;e.s(["Q",0,{facil:"Fácil",medio:"Médio",dificil:"Difícil"},"w",0,i,"L",0,s,"u",0,[{id:"sql-clientes-de-sao-paulo",difficulty:"facil",title:"Clientes de São Paulo",statement:"Liste `nome` e `idade` dos clientes da cidade `'São Paulo'`, em ordem alfabética de nome.",topics:["SELECT","WHERE","ORDER BY"],ordered:!0,solution:"select nome, idade\nfrom clientes\nwhere cidade = 'São Paulo'\norder by nome;",hints:["Filtre com WHERE cidade = 'São Paulo'.","Ordene com ORDER BY nome."]},{id:"sql-contar-livros",difficulty:"facil",title:"Quantos livros?",statement:"Quantos produtos existem na categoria `'Livros'`? Devolva uma única coluna com o total.",topics:["COUNT","WHERE"],ordered:!1,solution:"select count(*) as total\nfrom produtos\nwhere categoria = 'Livros';",hints:["COUNT(*) conta as linhas.","Use WHERE para ficar só com os livros."]},{id:"sql-tres-mais-caros",difficulty:"facil",title:"Os 3 mais caros",statement:"Mostre `nome` e `preco` dos 3 produtos mais caros, do mais caro para o mais barato.",topics:["ORDER BY","LIMIT"],ordered:!0,solution:"select nome, preco\nfrom produtos\norder by preco desc\nlimit 3;",hints:["ORDER BY preco DESC ordena do maior para o menor.","LIMIT 3 fica com as 3 primeiras linhas."]},{id:"sql-clientes-jovens",difficulty:"facil",title:"Clientes de 18 a 25 anos",statement:"Liste o `nome` dos clientes com idade entre 18 e 25 anos (incluindo 18 e 25). A ordem não importa.",topics:["WHERE","BETWEEN"],ordered:!1,solution:"select nome\nfrom clientes\nwhere idade between 18 and 25;",hints:["BETWEEN inclui as duas pontas.","Também dá para usar idade >= 18 AND idade <= 25."]},{id:"sql-clientes-por-cidade",difficulty:"medio",title:"Clientes por cidade",statement:"Para cada cidade, mostre `cidade` e quantos clientes ela tem (`total`). Ordene do maior total para o menor; em empate, pela cidade em ordem alfabética.",topics:["GROUP BY","COUNT","ORDER BY"],ordered:!0,solution:"select cidade, count(*) as total\nfrom clientes\ngroup by cidade\norder by total desc, cidade;",hints:["GROUP BY cidade junta as linhas de cada cidade.","ORDER BY aceita mais de um critério: total DESC, cidade."]},{id:"sql-preco-medio-categoria",difficulty:"medio",title:"Preço médio por categoria",statement:"Mostre `categoria` e o preço médio dos produtos dela, arredondado para 2 casas (`round(..., 2)`). Ordene pela categoria.",topics:["GROUP BY","AVG","ROUND"],ordered:!0,solution:"select categoria, round(avg(preco), 2) as media\nfrom produtos\ngroup by categoria\norder by categoria;",hints:["AVG(preco) calcula a média do grupo.","Envolva com ROUND(AVG(preco), 2)."]},{id:"sql-quem-comprou-o-que",difficulty:"medio",title:"Quem comprou o quê",statement:"Para cada pedido, mostre o nome do cliente e o nome do produto (nessa ordem de colunas). A ordem das linhas não importa.",topics:["JOIN"],ordered:!1,solution:"select c.nome, p.nome\nfrom pedidos pe\njoin clientes c on c.id = pe.cliente_id\njoin produtos p on p.id = pe.produto_id;",hints:["Junte pedidos com clientes pela coluna cliente_id.","Faça um segundo JOIN com produtos por produto_id."]},{id:"sql-clientes-sem-pedido",difficulty:"medio",title:"Clientes que nunca compraram",statement:"Liste o `nome` dos clientes que não têm nenhum pedido. A ordem não importa.",topics:["LEFT JOIN","IS NULL","NOT EXISTS"],ordered:!1,solution:"select c.nome\nfrom clientes c\nleft join pedidos pe on pe.cliente_id = c.id\nwhere pe.id is null;",hints:["LEFT JOIN mantém os clientes mesmo sem pedido (as colunas do pedido ficam NULL).","Outra saída: WHERE NOT EXISTS (SELECT 1 FROM pedidos ...)."]},{id:"sql-grandes-compradores",difficulty:"dificil",title:"Grandes compradores",statement:"Mostre `nome` e o total gasto (`quantidade * preco` somado) de cada cliente que gastou **mais de 500**. Arredonde o total para 2 casas. Ordene do maior total para o menor; em empate, por nome.",topics:["JOIN","GROUP BY","HAVING"],ordered:!0,solution:"select c.nome, round(sum(pe.quantidade * p.preco), 2) as total\nfrom pedidos pe\njoin clientes c on c.id = pe.cliente_id\njoin produtos p on p.id = pe.produto_id\ngroup by c.id, c.nome\nhaving sum(pe.quantidade * p.preco) > 500\norder by total desc, c.nome;",hints:["Filtro sobre um valor agregado vai no HAVING, não no WHERE.","Agrupe por cliente (id e nome)."]},{id:"sql-categoria-campea",difficulty:"dificil",title:"Categoria campeã de vendas",statement:"Qual categoria mais faturou (`quantidade * preco` somado)? Devolva uma linha com `categoria` e o faturamento arredondado para 2 casas. Em empate, a categoria que vem primeiro no alfabeto.",topics:["JOIN","GROUP BY","ORDER BY","LIMIT"],ordered:!0,solution:"select p.categoria, round(sum(pe.quantidade * p.preco), 2) as faturamento\nfrom pedidos pe\njoin produtos p on p.id = pe.produto_id\ngroup by p.categoria\norder by sum(pe.quantidade * p.preco) desc, p.categoria\nlimit 1;",hints:["Agrupe por categoria somando quantidade * preco.","Ordene do maior para o menor e pegue só a primeira linha."]},{id:"sql-mais-velho-por-cidade",difficulty:"dificil",title:"O mais velho de cada cidade",statement:"Para cada cidade que tem clientes, mostre `cidade` e o `nome` do cliente mais velho. Em empate de idade, o nome que vem primeiro no alfabeto. Ordene por cidade.",topics:["subconsulta","funções de janela"],ordered:!0,solution:"select cidade, nome\nfrom (\n  select cidade, nome,\n         row_number() over (partition by cidade order by idade desc, nome) as pos\n  from clientes\n)\nwhere pos = 1\norder by cidade;",hints:["ROW_NUMBER() OVER (PARTITION BY cidade ORDER BY idade DESC, nome) numera cada cidade.","Fique com as linhas de posição 1."]}],"S",0,function(e){let a=[...l].sort(()=>e.bool()?1:-1).slice(0,e.int(10,14)),t=a.map((a,t)=>`(${t+1}, ${m(a)}, ${m(e.pick(d))}, ${e.int(16,70)})`),r=[...c].sort(()=>e.bool()?1:-1).slice(0,e.int(10,14)),o=new Set,n=r.map(([a,t],r)=>{let n=0;do n=e.int(1500,9e4)/100;while(o.has(n))return o.add(n),`(${r+1}, ${m(a)}, ${m(t)}, ${n.toFixed(2)})`}),s=Math.max(1,a.length-e.int(2,4)),u=Array.from({length:e.int(15,25)},(a,t)=>`(${t+1}, ${e.int(1,s)}, ${e.int(1,r.length)}, ${e.int(1,5)})`);return[i,`insert into clientes values ${t.join(", ")};`,`insert into produtos values ${n.join(", ")};`,`insert into pedidos values ${u.join(", ")};`].join("\n")}])},11241,e=>{var a=e.i(56420);let t={name:"arrow-left",size:24,node:[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],11241)},89664,e=>{var a=e.i(56420);let t={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],89664)},72382,e=>{var a=e.i(56420);let t={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],72382)},12010,e=>{var a=e.i(56420);let t={name:"lightbulb",size:24,node:[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],12010)},21357,e=>{var a=e.i(56420);let t={name:"play",size:24,node:[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],21357)},95925,e=>{var a=e.i(56420);let t={name:"rotate-ccw",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],95925)},30274,e=>{var a=e.i(56420);let t={name:"send",size:24,node:[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]};t.node;let r=(0,a.f)(t);e.s(["f",0,r],30274)},91635,e=>{var a=e.i(43476),t=e.i(3244),r=e.i(71645),o=e.i(11241),n=e.i(89664),s=e.i(72382),i=e.i(12010),l=e.i(21357),d=e.i(95925),c=e.i(30274),m=e.i(56420);let u={name:"shuffle",size:24,node:[["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22",key:"1ailkh"}],["path",{d:"M2 6h1.972a4 4 0 0 1 3.6 2.2",key:"km57vx"}],["path",{d:"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45",key:"os18l9"}]]};u.node;let p=(0,m.f)(u);var f=e.i(28623),g=e.i(63676),h=e.i(9559),x=e.i(22492),v=e.i(33903),b=e.i(28437),y=e.i(6363);let j=["java","c","cpp","csharp","go","rust","php"],$={number:"int",string:"str",boolean:"bool","number[]":"int[]","string[]":null};function S(e){let a=e.params.map(e=>({name:e.name,type:$[e.type]})),t="number"===e.returns&&e.decimal?"float":$[e.returns];return!t||a.some(e=>null===e.type)?null:{params:a,returns:t}}let N=e=>null!==S(e),w=e=>{let a=new TextEncoder().encode(e),t="";for(let e of a)t+=String.fromCharCode(e);return btoa(t)},_=e=>e?new TextDecoder().decode(Uint8Array.from(atob(e),e=>e.charCodeAt(0))):"",k=(e,a=1500)=>e.length>a?`${e.slice(0,a)}…`:e;async function q(e,a,t,r){let o,n=S(e);if(!n)return{ok:!1,error:"Este desafio ainda não está disponível nesta linguagem.",logs:[]};let s=y.u[a],i=new AbortController,l=setTimeout(()=>i.abort(),4e4);try{let e=await fetch("https://ce.judge0.com/submissions?base64_encoded=true&wait=true",{method:"POST",headers:{"Content-Type":"application/json"},signal:i.signal,body:JSON.stringify({language_id:s.judge0Id,source_code:w(t),stdin:w((0,y.f)(n,r)),...s.compilerOptions?{compiler_options:s.compilerOptions}:{},cpu_time_limit:s.cpuSeconds,wall_time_limit:Math.min(3*s.cpuSeconds,20),memory_limit:s.memoryKb,enable_network:!1})});if(429===e.status)return{ok:!1,error:"O servidor de execução está recebendo muitos pedidos agora. Espere alguns segundos e tente de novo.",logs:[]};if(!e.ok)return{ok:!1,error:`O servidor de execu\xe7\xe3o respondeu ${e.status}. Tente de novo em instantes.`,logs:[]};o=await e.json()}catch{return{ok:!1,error:"Não foi possível falar com o servidor de execução (Judge0). Confira sua internet e tente de novo.",logs:[]}}finally{clearTimeout(l)}let d=o.status?.id??13,c=_(o.stderr),m=c?c.replace(/\r/g,"").split("\n").filter(Boolean).slice(0,200):[];if(6===d)return{ok:!1,error:`Erro de compila\xe7\xe3o:
${k(_(o.compile_output))}`,logs:m};if(5===d)return{ok:!1,error:`Tempo esgotado: passou de ${s.cpuSeconds} s de processamento (la\xe7o infinito?).`,logs:m};if(d>=13||1===d||2===d)return{ok:!1,error:"O servidor de execução teve um problema interno. Tente de novo.",logs:m};if(d>=7)return{ok:!1,error:k(c||o.status?.description||"Erro durante a execução."),logs:m};let u=_(o.stdout).replace(/\r/g,"").split("\n");return{ok:!0,logs:m,results:r.map((e,a)=>{var t,r;let o;return a<u.length&&(a!==u.length-1||""!==u[a])?{ok:!0,value:(t=n.returns,o=(r=u[a]).trim(),"str"===t?r:"bool"===t?"true"===o||"false"!==o&&r:"int[]"===t?""===o?[]:o.split(/\s+/).map(e=>Number.isNaN(Number(e))?e:Number(e)):""===o||Number.isNaN(Number(o))?r:Number(o))}:{ok:!1,error:"o programa não imprimiu resposta para este caso"}})}}let z={javascript:"JavaScript",typescript:"TypeScript",python:"Python",sql:"SQL",java:"Java",c:"C",cpp:"C++",csharp:"C#",go:"Go",rust:"Rust",php:"PHP"};function E(e){let a=e>>>0,t=()=>{let e=a=a+0x6d2b79f5>>>0;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/0x100000000};return{int:(e,a)=>e+Math.floor(t()*(a-e+1)),pick:e=>e[Math.floor(t()*e.length)],bool:()=>.5>t()}}let C=()=>Math.floor(0x80000000*Math.random());function O(e){return e.replace(/[A-Z]/g,e=>`_${e.toLowerCase()}`)}let M={number:"number",string:"string",boolean:"boolean","number[]":"number[]","string[]":"string[]"};function T(e,a){return"python"===a?`def ${O(e.fn)}(${e.params.map(e=>O(e.name)).join(", ")}):`:"typescript"===a?`function ${e.fn}(${e.params.map(e=>`${e.name}: ${M[e.type]}`).join(", ")}): ${M[e.returns]} {`:`function ${e.fn}(${e.params.map(e=>e.name).join(", ")}) {`}function L(e,a){if(j.includes(a))return(0,y.x)(S(e),a,e.fn);return"python"===a?`${T(e,a)}
    # escreva sua solu\xe7\xe3o aqui
    pass
`:`${T(e,a)}
  // escreva sua solu\xe7\xe3o aqui

}
`}function P(e,a){return"python"===a?O(e.fn):e.fn}function R(e,a){return Function(...e.params.map(e=>e.name),e.js)(...structuredClone(a))}function A(e,a,t,r=12){let o=e.examples.map(a=>({args:a,expected:R(e,a),hidden:!1}));if("examples"===t)return o;let n=E(a);return[...o,...[...e.edge??[],...Array.from({length:r},()=>e.generate(n))].map(a=>({args:a,expected:R(e,a),hidden:!0}))]}function I(e,a){if("python"===a){if(!0===e)return"True";if(!1===e)return"False";if(null==e)return"None";if(Array.isArray(e))return`[${e.map(e=>I(e,a)).join(", ")}]`}return void 0===e?"undefined":Array.isArray(e)?`[${e.map(e=>I(e,a)).join(", ")}]`:JSON.stringify(e)}function B(e,a){return e.map(e=>I(e,a)).join(", ")}let F=e=>"number"==typeof e?Math.round(1e6*e)/1e6:e;function D(e,a,t){if(e.columns.length!==a.columns.length||e.rows.length!==a.rows.length)return!1;let r=e=>JSON.stringify(e.map(F)),o=e.rows.map(r),n=a.rows.map(r);return t||(o.sort(),n.sort()),o.every((e,a)=>e===n[a])}var J=e.i(89495),K=e.i(88626),U=e.i(74995);let G=[{id:"javascript",badge:"JS",color:"bg-[#f7df1e] text-[#1a1a1a]",note:"Roda direto no navegador."},{id:"typescript",badge:"TS",color:"bg-[#3178c6] text-white",note:"Os tipos são removidos e o código roda como JS."},{id:"python",badge:"PY",color:"bg-[#ffd43b] text-[#1f3b57]",note:"Python de verdade (Pyodide). Primeira vez baixa ~10 MB."},{id:"sql",badge:"SQL",color:"bg-[#00a1e0] text-white",note:"SQLite no navegador, com dados gerados na hora."},{id:"java",badge:"JV",color:"bg-[#e76f00] text-white",note:"JDK 17, compilado no servidor de execução."},{id:"c",badge:"C",color:"bg-[#5c6bc0] text-white",note:"GCC 14, compilado no servidor de execução."},{id:"cpp",badge:"C++",color:"bg-[#00599c] text-white",note:"GCC 14, compilado no servidor de execução."},{id:"csharp",badge:"C#",color:"bg-[#68217a] text-white",note:"Mono 6.6, compilado no servidor de execução."},{id:"go",badge:"GO",color:"bg-[#00add8] text-[#0b2733]",note:"Go 1.18, compilado no servidor de execução."},{id:"rust",badge:"RS",color:"bg-[#dea584] text-[#1a1a1a]",note:"Rust 1.85, compilado no servidor de execução."},{id:"php",badge:"PHP",color:"bg-[#777bb4] text-white",note:"PHP 8.3, executado no servidor de execução."}],W=["facil","medio","dificil"],V="pdz-desafio-pref",Q=(e,a)=>`pdz-desafio-codigo:${e}:${a}`;function H(e){try{return window.localStorage.getItem(e)}catch{return null}}function X(e,a){try{window.localStorage.setItem(e,a)}catch{}}function Y({title:e,difficulty:t,topics:r,statement:o,solved:s,langsSolved:i,children:l}){return(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,a.jsx)(v.G,{tone:"amber",children:h.Q[t]}),r.map(e=>(0,a.jsx)(v.G,{children:e},e)),s&&(0,a.jsxs)(v.G,{tone:"ok",children:[(0,a.jsx)(n.f,{"aria-hidden":!0,className:"size-3"})," resolvido em ",i.map(e=>z[e]).join(", ")]})]}),(0,a.jsx)("h2",{className:"mt-3 text-2xl font-bold",children:e}),(0,a.jsx)("div",{className:"mt-3 space-y-3 text-[0.95rem] leading-relaxed text-muted",children:o.split("\n\n").map((e,t)=>(0,a.jsx)("p",{children:(0,a.jsx)(x.f,{text:e})},t))}),l]})}function Z({hints:e,onReveal:t,revealed:o,solution:n,solved:l}){let[d,c]=(0,r.useState)(0),[m,u]=(0,r.useState)(!1),[p,f]=(0,r.useState)(!1);return(0,a.jsxs)("div",{className:"mt-6 space-y-3",children:[e.slice(0,d).map((e,t)=>(0,a.jsxs)("p",{className:"flex gap-2 rounded-[var(--radius-md)] border border-amber/30 bg-amber/[0.06] p-3 text-sm",children:[(0,a.jsx)(i.f,{"aria-hidden":!0,className:"mt-0.5 size-4 shrink-0 text-amber"}),(0,a.jsx)("span",{children:(0,a.jsx)(x.f,{text:e})})]},t)),(0,a.jsxs)("div",{className:"flex flex-wrap gap-2",children:[d<e.length&&(0,a.jsxs)(v.K,{variant:"secondary",size:"sm",onClick:()=>c(e=>e+1),children:[(0,a.jsx)(i.f,{"aria-hidden":!0,className:"size-4"})," ",0===d?"Quero uma dica":"Outra dica"]}),!p&&(0,a.jsxs)(v.K,{variant:"ghost",size:"sm",onClick:()=>{l||o?f(!0):u(!0)},children:[(0,a.jsx)(s.f,{"aria-hidden":!0,className:"size-4"})," Ver solução"]})]}),m&&!p&&(0,a.jsxs)("div",{role:"alertdialog","aria-label":"Confirmar",className:"rounded-[var(--radius-md)] border border-warn/40 bg-warn/[0.08] p-3 text-sm",children:[(0,a.jsx)("p",{children:"Se você ver a solução antes de resolver, este desafio não dá mais XP. Tem certeza?"}),(0,a.jsxs)("div",{className:"mt-3 flex gap-2",children:[(0,a.jsx)(v.K,{size:"sm",variant:"danger",onClick:()=>{t(),f(!0),u(!1)},children:"Ver mesmo assim"}),(0,a.jsx)(v.K,{size:"sm",variant:"ghost",onClick:()=>u(!1),children:"Vou tentar mais"})]})]}),p&&(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"text-xs font-semibold text-subtle",children:"Uma solução possível (existem outras):"}),(0,a.jsx)("pre",{className:"mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-[#060d1c] p-3 font-mono text-[13px] leading-6 text-[#dbe7ff]",children:n})]})]})}function ee({logs:e}){return 0===e.length?null:(0,a.jsxs)("div",{className:"rounded-[var(--radius-md)] border border-line bg-black/40 p-3",children:[(0,a.jsx)("p",{className:"text-xs font-semibold text-subtle",children:"Saída do seu código (console / print)"}),(0,a.jsx)("pre",{className:"mt-1 max-h-40 overflow-auto font-mono text-xs leading-5 text-muted",children:e.join("\n")})]})}function ea({xp:e}){return(0,a.jsxs)("div",{role:"status",className:"flex items-center gap-3 rounded-[var(--radius-lg)] border-2 border-ok/60 bg-ok/10 p-4",children:[(0,a.jsx)("span",{className:"grid size-10 place-items-center rounded-full bg-ok text-[#04130d]",children:(0,a.jsx)(n.f,{"aria-hidden":!0,className:"size-6",strokeWidth:3})}),(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"font-bold text-ok",children:"Todos os testes passaram!"}),(0,a.jsxs)("p",{className:"text-sm text-muted",children:[e>0?`+${e} XP. `:"","Tente outro problema ou resolva este em outra linguagem."]})]})]})}function et({ch:e,lang:o}){let n=(0,K._)().challenges[e.id],[s,i]=(0,r.useState)(()=>L(e,o)),[m,u]=(0,r.useState)(null),[p,f]=(0,r.useState)(null),[g,h]=(0,r.useState)("examples"),[b,y]=(0,r.useState)(null),[$,S]=(0,r.useState)([]),[N,w]=(0,r.useState)(null);function _(a){i(a),X(Q(e.id,o),a)}async function k(a){u("python"===o?"loading":j.includes(o)?"remote":"running"),y(null),w(null),h(a);let t=A(e,C(),a),r=t.map(e=>e.args),n=j.includes(o)?await q(e,o,s,r):await (0,J.c)(o,s,P(e,o),r,()=>u("running"));if(u(null),S(n.logs),!n.ok){f(null),y(n.error);return}let i=t.map((e,a)=>{let t=n.results[a]??null;return{...e,got:t,pass:!!(t&&t.ok&&!(t.undef&&null!==e.expected)&&function e(a,t){if("number"==typeof a&&"number"==typeof t)return Math.abs(a-t)<=1e-6*Math.max(1,Math.abs(a),Math.abs(t));if(Array.isArray(a)&&Array.isArray(t))return a.length===t.length&&a.every((a,r)=>e(a,t[r]));if(a&&t&&"object"==typeof a&&"object"==typeof t){let r=Object.keys(a).sort(),o=Object.keys(t).sort();return r.length===o.length&&r.every((r,n)=>r===o[n]&&e(a[r],t[r]))}return a===t}(t.value,e.expected))}});f(i),"submit"===a&&i.every(e=>e.pass)&&w((0,K.R)({type:"challenge/solve",id:e.id,title:e.title,lang:o,difficulty:e.difficulty}).xp)}(0,r.useEffect)(()=>{let a=H(Q(e.id,o));a&&i(a)},[e.id,o]);let E=p?.filter(e=>e.pass).length??0,O=p?.find(e=>e.hidden&&!e.pass);return(0,a.jsxs)("div",{className:"mt-6 grid gap-8 lg:grid-cols-2",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)(Y,{title:e.title,difficulty:e.difficulty,topics:e.topics,statement:e.statement,solved:!!n?.langs.length,langsSolved:n?.langs??[],children:[(0,a.jsx)("h3",{className:"mt-6 text-sm font-semibold text-subtle",children:"Exemplos"}),(0,a.jsx)("ul",{className:"mt-2 space-y-2",children:e.examples.map((t,r)=>(0,a.jsxs)("li",{className:"overflow-x-auto rounded-[var(--radius-md)] border border-line bg-[#060d1c] px-3 py-2 font-mono text-[13px]",children:[(0,a.jsx)("span",{className:"text-[#9cc2ff]",children:P(e,o)}),"(",B(t,o),") ",(0,a.jsx)("span",{className:"text-subtle",children:"→"})," ",(0,a.jsx)("span",{className:"text-amber",children:I(A(e,0,"examples")[r].expected,o)})]},r))})]}),(0,a.jsx)(Z,{hints:e.hints,solved:!!n?.langs.length,revealed:n?.status==="revealed",onReveal:()=>(0,K.R)({type:"challenge/reveal",id:e.id}),solution:j.includes(o)?`# Solu\xe7\xe3o de refer\xeancia em Python. A l\xf3gica \xe9 a mesma em ${z[o]}.
${T(e,"python")}
${e.py}
`:"python"===o?`${T(e,o)}
${e.py}
`:`${T(e,o)}
${e.js}
}
`})]}),(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,a.jsxs)("p",{className:"text-sm font-semibold",children:["Sua solução em ",z[o]]}),(0,a.jsxs)(v.K,{variant:"ghost",size:"sm",onClick:()=>{_(L(e,o)),f(null),y(null)},children:[(0,a.jsx)(d.f,{"aria-hidden":!0,className:"size-4"})," Recomeçar"]})]}),j.includes(o)&&(0,a.jsxs)("p",{className:"text-xs text-muted",children:["O programa completo já vem pronto: escreva só o corpo da função ",(0,a.jsx)("code",{className:"font-mono text-[#9cc2ff]",children:e.fn}),". Ele roda no Judge0, um servidor de execução gratuito e isolado; a saída padrão é usada para conferir as respostas, então para depurar escreva no erro padrão (stderr)."]}),(0,a.jsx)(U.f,{value:s,onChange:_,indent:"javascript"===o||"typescript"===o?2:4,label:`C\xf3digo em ${z[o]}`}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,a.jsxs)(v.K,{variant:"secondary",onClick:()=>k("examples"),disabled:null!==m,children:[(0,a.jsx)(l.f,{"aria-hidden":!0,className:"size-4"})," Testar exemplos"]}),(0,a.jsxs)(v.K,{onClick:()=>k("submit"),disabled:null!==m,children:[(0,a.jsx)(c.f,{"aria-hidden":!0,className:"size-4"})," Enviar solução"]})]}),(0,a.jsx)("p",{"aria-live":"polite",className:"text-sm text-muted",children:"loading"===m?"Carregando o Python no navegador (só demora na primeira vez)…":"remote"===m?"Compilando e rodando no servidor de execução (alguns segundos)…":"running"===m?"Rodando os testes…":""}),null!==N&&(0,a.jsx)(ea,{xp:N}),b&&(0,a.jsxs)("div",{role:"alert",className:"rounded-[var(--radius-md)] border border-bad/50 bg-bad/[0.08] p-3",children:[(0,a.jsx)("p",{className:"text-sm font-semibold text-bad",children:"Seu código deu erro"}),(0,a.jsx)("pre",{className:"mt-1 whitespace-pre-wrap font-mono text-xs text-[#ffd6d6]",children:b}),(0,a.jsx)(t.f,{message:b})]}),p&&(0,a.jsxs)("div",{"aria-live":"polite",children:[(0,a.jsxs)("p",{className:(0,v.P)("text-sm font-semibold",E===p.length?"text-ok":"text-bad"),children:[E,"/",p.length," testes passaram","submit"===g?" (exemplos + casos gerados agora)":""]}),(0,a.jsx)("ul",{className:"mt-2 space-y-2",children:p.filter(e=>!e.hidden).map((t,r)=>(0,a.jsx)(er,{row:t,lang:o,fn:P(e,o)},r))}),"submit"===g&&O&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("p",{className:"mt-3 text-xs text-subtle",children:"Primeiro caso gerado que falhou:"}),(0,a.jsx)("ul",{className:"mt-1",children:(0,a.jsx)(er,{row:O,lang:o,fn:P(e,o)})})]}),"examples"===g&&E===p.length&&(0,a.jsx)("p",{className:"mt-3 text-sm text-muted",children:(0,a.jsx)(x.f,{text:"Exemplos ok! Agora clique em **Enviar solução** para rodar os casos gerados."})})]}),(0,a.jsx)(ee,{logs:$})]})]})}function er({row:e,lang:t,fn:r}){let o=e.got;return(0,a.jsxs)("li",{className:(0,v.P)("rounded-[var(--radius-md)] border px-3 py-2 font-mono text-xs",e.pass?"border-ok/40 bg-ok/[0.06]":"border-bad/40 bg-bad/[0.06]"),children:[(0,a.jsxs)("p",{className:"flex items-start gap-2 overflow-x-auto",children:[e.pass?(0,a.jsx)(n.f,{"aria-label":"passou",className:"size-4 shrink-0 text-ok"}):(0,a.jsx)(g.X,{"aria-label":"falhou",className:"size-4 shrink-0 text-bad"}),(0,a.jsxs)("span",{children:[r,"(",B(e.args,t),")"]})]}),!e.pass&&(0,a.jsxs)("p",{className:"mt-1 pl-6 text-muted",children:["esperado ",(0,a.jsx)("span",{className:"text-amber",children:I(e.expected,t)})," · recebido"," ",(0,a.jsx)("span",{className:"text-[#ffb4b4]",children:o?o.ok?o.undef?"python"===t?"None (faltou o return?)":"undefined (faltou o return?)":I(o.value,t):o.error:"nada"})]})]})}let eo=h.w.split("\n").map(e=>{let a=/create table (\w+) \((.*)\);/.exec(e);return{name:a[1],cols:a[2].split(", ").map(e=>e.split(" ").slice(0,2).join(" "))}});function en({table:e,caption:t}){return(0,a.jsx)("div",{className:"overflow-x-auto rounded-[var(--radius-md)] border border-line",children:(0,a.jsxs)("table",{className:"w-full text-left font-mono text-xs",children:[(0,a.jsxs)("caption",{className:"border-b border-line px-3 py-2 text-left font-sans text-xs font-semibold text-subtle",children:[t," · ",e.rows.length," linha(s)"]}),(0,a.jsx)("thead",{className:"bg-panel-2 text-muted",children:(0,a.jsx)("tr",{children:e.columns.map((e,t)=>(0,a.jsx)("th",{className:"px-3 py-1.5 font-semibold",children:e},t))})}),(0,a.jsx)("tbody",{children:e.rows.slice(0,30).map((e,t)=>(0,a.jsx)("tr",{className:"border-t border-line",children:e.map((e,t)=>(0,a.jsx)("td",{className:"whitespace-nowrap px-3 py-1.5",children:null===e?(0,a.jsx)("span",{className:"text-subtle",children:"NULL"}):String(e)},t))},t))})]})})}function es({ch:e}){let o=(0,K._)().challenges[e.id],[n,s]=(0,r.useState)("-- escreva sua consulta aqui\nselect "),[i,d]=(0,r.useState)(null),[m,u]=(0,r.useState)(null),[f,g]=(0,r.useState)(null),[x,b]=(0,r.useState)(null),[y,j]=(0,r.useState)(null),[$,S]=(0,r.useState)(null),[N,w]=(0,r.useState)(()=>C()),_=(0,r.useMemo)(()=>(0,h.S)(E(N)),[N]);async function k(){d("loading"),b(null),j(null),S(null);let[a,t]=await (0,J.A)(_,[n,e.solution],()=>d("running"));if(d(null),t&&t.ok&&g({columns:t.columns,rows:t.rows}),!a||!a.ok){u(null),b(a&&!a.ok?a.error:"Sem resultado.");return}u({columns:a.columns,rows:a.rows}),t&&t.ok&&j({ok:D(a,t,e.ordered),passed:+!!D(a,t,e.ordered),total:1})}async function q(){d("loading"),b(null),S(null);let a=0;for(let t=0;t<3;t++){let t=(0,h.S)(E(C())),[r,o]=await (0,J.A)(t,[n,e.solution],()=>d("running"));if(!r||!r.ok){d(null),b(r&&!r.ok?r.error:"Sem resultado.");return}o&&o.ok&&D(r,o,e.ordered)&&a++}d(null),j({ok:3===a,passed:a,total:3}),3===a&&S((0,K.R)({type:"challenge/solve",id:e.id,title:e.title,lang:"sql",difficulty:e.difficulty}).xp)}return(0,r.useEffect)(()=>{let a=H(Q(e.id,"sql"));a&&s(a)},[e.id]),(0,a.jsxs)("div",{className:"mt-6 grid gap-8 lg:grid-cols-2",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)(Y,{title:e.title,difficulty:e.difficulty,topics:e.topics,statement:e.statement,solved:!!o?.langs.length,langsSolved:o?.langs??[],children:[e.ordered&&(0,a.jsx)("p",{className:"mt-3 text-xs text-subtle",children:"A ordem das linhas importa neste desafio."}),(0,a.jsx)("h3",{className:"mt-6 text-sm font-semibold text-subtle",children:"Tabelas"}),(0,a.jsx)("ul",{className:"mt-2 grid gap-2 sm:grid-cols-3",children:eo.map(e=>(0,a.jsxs)("li",{className:"rounded-[var(--radius-md)] border border-line bg-[#060d1c] p-3 font-mono text-xs",children:[(0,a.jsx)("p",{className:"font-semibold text-[#9cc2ff]",children:e.name}),(0,a.jsx)("ul",{className:"mt-1 space-y-0.5 text-muted",children:e.cols.map(e=>(0,a.jsx)("li",{children:e},e))})]},e.name))}),(0,a.jsx)("p",{className:"mt-2 text-xs text-subtle",children:"Os dados são inventados e sorteados de novo a cada envio. Para espiar, rode `select * from clientes;`."})]}),(0,a.jsx)(Z,{hints:e.hints,solved:!!o?.langs.length,revealed:o?.status==="revealed",onReveal:()=>(0,K.R)({type:"challenge/reveal",id:e.id}),solution:e.solution})]}),(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,a.jsx)("p",{className:"text-sm font-semibold",children:"Sua consulta SQL"}),(0,a.jsxs)(v.K,{variant:"ghost",size:"sm",onClick:()=>w(C()),children:[(0,a.jsx)(p,{"aria-hidden":!0,className:"size-4"})," Sortear outros dados"]})]}),(0,a.jsx)(U.f,{value:n,onChange:function(a){s(a),X(Q(e.id,"sql"),a)},indent:2,label:"Consulta SQL"}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,a.jsxs)(v.K,{variant:"secondary",onClick:k,disabled:null!==i,children:[(0,a.jsx)(l.f,{"aria-hidden":!0,className:"size-4"})," Executar"]}),(0,a.jsxs)(v.K,{onClick:q,disabled:null!==i,children:[(0,a.jsx)(c.f,{"aria-hidden":!0,className:"size-4"})," Enviar solução"]})]}),(0,a.jsx)("p",{"aria-live":"polite",className:"text-sm text-muted",children:"loading"===i?"Preparando o banco…":"running"===i?"Rodando a consulta…":""}),null!==$&&(0,a.jsx)(ea,{xp:$}),y&&!y.ok&&(0,a.jsxs)("p",{role:"status",className:"text-sm font-semibold text-bad",children:[y.total>1?`Passou em ${y.passed} de ${y.total} bancos sorteados.`:"O resultado ainda não bate com o esperado."," Compare as tabelas abaixo."]}),y?.ok&&1===y.total&&(0,a.jsx)("p",{className:"text-sm font-semibold text-ok",children:"Bateu com o esperado nestes dados! Agora envie para testar em outros bancos."}),x&&(0,a.jsxs)("div",{role:"alert",className:"rounded-[var(--radius-md)] border border-bad/50 bg-bad/[0.08] p-3",children:[(0,a.jsx)("p",{className:"text-sm font-semibold text-bad",children:"Erro na consulta"}),(0,a.jsx)("pre",{className:"mt-1 whitespace-pre-wrap font-mono text-xs text-[#ffd6d6]",children:x}),(0,a.jsx)(t.f,{message:x})]}),m&&(0,a.jsx)(en,{table:m,caption:"Seu resultado"}),f&&m&&(0,a.jsx)(en,{table:f,caption:"Resultado esperado"})]})]})}e.s(["ChallengeArena",0,function(){let e=(0,K._)(),t=(0,K.L)(),[n,s]=(0,r.useState)("javascript"),[i,l]=(0,r.useState)("facil"),[d,c]=(0,r.useState)(null);(0,r.useEffect)(()=>{let e=new URLSearchParams(window.location.search).get("id");if(!e)return;let a=h.u.find(a=>a.id===e),t=h.L.find(a=>a.id===e);a?(s("sql"),l(a.difficulty),c({kind:"sql",ch:a})):t&&(s("javascript"),l(t.difficulty),c({kind:"code",ch:t}))},[]),(0,r.useEffect)(()=>{if(new URLSearchParams(window.location.search).get("id"))return;let e=H(V);if(e)try{let a=JSON.parse(e);a.lang&&a.lang in z&&s(a.lang),a.diff&&W.includes(a.diff)&&l(a.diff)}catch{}},[]);let m=(a,t)=>!!e.challenges[a]?.langs.includes(t),u=(e,a)=>"sql"===e?h.u.filter(e=>e.difficulty===a):h.L.filter(t=>t.difficulty===a&&(!j.includes(e)||N(t)));function g(e){X(V,JSON.stringify({lang:n,diff:i}));let a=u(n,i),t=new Set(a.filter(e=>m(e.id,n)).map(e=>e.id)),r=function(e,a,t){if(0===e.length)return null;let r=e.filter(e=>!a.has(e.id)&&e.id!==t),o=r.length>0?r:e.filter(e=>e.id!==t),n=o.length>0?o:e;return n[Math.floor(Math.random()*n.length)]}(a,t,e);r&&(c("sql"===n?{kind:"sql",ch:r}:{kind:"code",ch:r}),window.scrollTo({top:0,behavior:"smooth"}))}return d?(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[(0,a.jsxs)(v.K,{variant:"ghost",size:"sm",onClick:()=>c(null),children:[(0,a.jsx)(o.f,{"aria-hidden":!0,className:"size-4"})," Trocar linguagem ou dificuldade"]}),(0,a.jsxs)(v.K,{variant:"secondary",size:"sm",onClick:()=>g(d.ch.id),children:[(0,a.jsx)(p,{"aria-hidden":!0,className:"size-4"})," Outro problema"]})]}),"code"===d.kind?(0,a.jsx)(et,{ch:d.ch,lang:n},`${d.ch.id}:${n}`):(0,a.jsx)(es,{ch:d.ch},d.ch.id)]}):(0,a.jsxs)("div",{className:"space-y-10",children:[(0,a.jsxs)("section",{"aria-labelledby":"escolha-linguagem",children:[(0,a.jsx)("h2",{id:"escolha-linguagem",className:"text-lg font-semibold",children:"1. Escolha a linguagem"}),(0,a.jsx)("div",{role:"radiogroup","aria-labelledby":"escolha-linguagem",className:"mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",children:G.map(e=>{let r,o="sql"===e.id?h.u:(r=e.id,j.includes(r))?h.L.filter(N):h.L,i=t?o.filter(a=>m(a.id,e.id)).length:0,l=n===e.id;return(0,a.jsxs)("button",{type:"button",role:"radio","aria-checked":l,onClick:()=>s(e.id),className:(0,v.P)("flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors",l?"border-electric bg-electric/10":"border-line bg-navy/60 hover:border-line-strong"),children:[(0,a.jsx)("span",{className:(0,v.P)("grid size-11 place-items-center rounded-[10px] font-mono text-sm font-black",e.color),children:e.badge}),(0,a.jsx)("span",{className:"font-semibold",children:z[e.id]}),(0,a.jsx)("span",{className:"text-xs text-muted",children:e.note}),(0,a.jsxs)("span",{className:"font-mono text-xs text-subtle",children:[i,"/",o.length," resolvidos"]})]},e.id)})})]}),(0,a.jsxs)("section",{"aria-labelledby":"escolha-dificuldade",children:[(0,a.jsx)("h2",{id:"escolha-dificuldade",className:"text-lg font-semibold",children:"2. Escolha a dificuldade"}),(0,a.jsx)("div",{role:"radiogroup","aria-labelledby":"escolha-dificuldade",className:"mt-4 grid gap-3 sm:grid-cols-3",children:W.map(e=>{let r=u(n,e),o=t?r.filter(e=>m(e.id,n)).length:0,s=i===e;return(0,a.jsxs)("button",{type:"button",role:"radio","aria-checked":s,onClick:()=>l(e),className:(0,v.P)("rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors",s?"border-amber bg-amber/10":"border-line bg-navy/60 hover:border-line-strong"),children:[(0,a.jsxs)("span",{className:"flex items-center justify-between",children:[(0,a.jsx)("span",{className:"font-semibold",children:h.Q[e]}),(0,a.jsxs)("span",{className:"font-mono text-xs text-amber",children:["+",b.B.challenge[e]," XP"]})]}),(0,a.jsx)("span",{className:"mt-2 block text-xs text-muted",children:"facil"===e?"Laços, condicionais e textos.":"medio"===e?"Listas, contagens e organização.":"Pilhas, algoritmos clássicos e consultas complexas."}),(0,a.jsxs)("span",{className:"mt-2 block font-mono text-xs text-subtle",children:[o,"/",r.length," resolvidos em ",z[n]]})]},e)})})]}),(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-4",children:[(0,a.jsxs)(v.K,{size:"lg",onClick:()=>g(),children:[(0,a.jsx)(f.f,{"aria-hidden":!0,className:"size-5"})," Gerar problema"]}),(0,a.jsx)("p",{className:"text-sm text-muted",children:"Sorteia um problema que você ainda não resolveu nessa linguagem. Os testes mudam a cada envio."})]})]})}],91635)},22492,e=>{var a=e.i(43476),t=e.i(71645);e.s(["f",0,function({text:e}){let r=e.split(/(``[^`].*?``|`[^`]+`|\*\*[^*]+\*\*)/g);return(0,a.jsx)(a.Fragment,{children:r.map((e,r)=>e.startsWith("``")&&e.endsWith("``")&&e.length>4?(0,a.jsx)("code",{className:"rounded border border-line bg-panel-2 px-1 py-0.5 font-mono text-[0.88em] text-[#cfe0ff]",children:e.slice(2,-2).trim()},r):e.startsWith("`")&&e.endsWith("`")&&e.length>2?(0,a.jsx)("code",{className:"rounded border border-line bg-panel-2 px-1 py-0.5 font-mono text-[0.88em] text-[#cfe0ff]",children:e.slice(1,-1)},r):e.startsWith("**")&&e.endsWith("**")&&e.length>4?(0,a.jsx)("strong",{className:"font-semibold text-fg",children:e.slice(2,-2)},r):(0,a.jsx)(t.Fragment,{children:e},r))})}])},3244,e=>{var a=e.i(43476),t=e.i(56420);let r={name:"circle-question-mark",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["help-circle","circle-help"]};r.node;let o=(0,t.f)(r);var n=e.i(15572);e.s(["f",0,function({message:e}){let t=(0,n.b)(e);return t?(0,a.jsxs)("div",{className:"mt-3 border-t border-bad/30 pt-3 text-sm",children:[(0,a.jsxs)("p",{className:"flex items-center gap-1.5 font-semibold text-fg",children:[(0,a.jsx)(o,{"aria-hidden":!0,className:"size-4 text-amber"})," O que isso quer dizer: ",t.title]}),(0,a.jsx)("p",{className:"mt-1 text-[#ffe3e3]",children:t.meaning}),(0,a.jsxs)("p",{className:"mt-1 text-muted",children:[(0,a.jsx)("span",{className:"font-semibold text-fg",children:"O que conferir:"})," ",t.check]})]}):null}],3244)},89495,e=>{let a="https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",t="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/",r=`
const fmt = (v) => { if (typeof v === "string") return v; try { return JSON.stringify(v); } catch (e) { return String(v); } };
self.onmessage = (e) => {
  const { id, code, fn, cases } = e.data;
  const logs = [];
  const push = (...a) => { if (logs.length < 200) logs.push(a.map(fmt).join(" ")); };
  const con = { log: push, info: push, warn: push, error: push, table: push };
  self.postMessage({ id, type: "ready" });
  let f;
  try {
    f = new Function("console", code + "\\n;return typeof " + fn + " === 'function' ? " + fn + " : undefined;")(con);
  } catch (err) {
    self.postMessage({ id, type: "done", data: { ok: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)), logs } });
    return;
  }
  if (!f) {
    self.postMessage({ id, type: "done", data: { ok: false, error: "N\xe3o achei a fun\xe7\xe3o " + fn + ". Mantenha o nome que veio no c\xf3digo inicial.", logs } });
    return;
  }
  const results = cases.map((args) => {
    try {
      const v = f(...args);
      if (v === undefined) return { ok: true, value: null, undef: true };
      return { ok: true, value: JSON.parse(JSON.stringify(v)) };
    } catch (err) {
      return { ok: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)) };
    }
  });
  self.postMessage({ id, type: "done", data: { ok: true, results, logs } });
};`,o=`
import json
__ns = {"__name__": "__main__"}
try:
    exec(__code, __ns)
    __f = __ns.get(__fn)
    if not callable(__f):
        raise NameError("N\xe3o achei a fun\xe7\xe3o " + __fn + ". Mantenha o nome que veio no c\xf3digo inicial.")
    __res = []
    for __args in json.loads(__cases):
        try:
            __v = __f(*__args)
            __res.append({"ok": True, "value": __v, "undef": __v is None})
        except Exception as __e:
            __res.append({"ok": False, "error": type(__e).__name__ + ": " + str(__e)})
    __out = json.dumps({"ok": True, "results": __res})
except Exception as __e:
    __out = json.dumps({"ok": False, "error": type(__e).__name__ + ": " + str(__e)})
__out
`,n=`
let py = null;
self.onmessage = async (e) => {
  const { id, code, fn, cases } = e.data;
  const logs = [];
  try {
    if (!py) {
      importScripts("${a}pyodide.js");
      py = await loadPyodide({ indexURL: "${a}" });
    }
    py.setStdout({ batched: (s) => { if (logs.length < 200) logs.push(s); } });
    py.setStderr({ batched: (s) => { if (logs.length < 200) logs.push(s); } });
    self.postMessage({ id, type: "ready" });
    py.globals.set("__code", code);
    py.globals.set("__fn", fn);
    py.globals.set("__cases", JSON.stringify(cases));
    const data = JSON.parse(py.runPython(${JSON.stringify(o)}));
    data.logs = logs;
    self.postMessage({ id, type: "done", data });
  } catch (err) {
    self.postMessage({ id, type: "done", data: { ok: false, error: String(err && err.message ? err.message : err).split("\\n").slice(-3).join("\\n"), logs } });
  }
};`,s=`
let SQL = null;
self.onmessage = async (e) => {
  const { id, setup, queries } = e.data;
  try {
    if (!SQL) {
      importScripts("${t}sql-wasm.js");
      SQL = await initSqlJs({ locateFile: (f) => "${t}" + f });
    }
    self.postMessage({ id, type: "ready" });
    const data = queries.map((q) => {
      const db = new SQL.Database();
      try {
        db.run(setup);
        const r = db.exec(q);
        const last = r[r.length - 1];
        return { ok: true, columns: last ? last.columns : [], rows: last ? last.values : [] };
      } catch (err) {
        return { ok: false, error: String(err && err.message ? err.message : err) };
      } finally {
        db.close();
      }
    });
    self.postMessage({ id, type: "done", data });
  } catch (err) {
    self.postMessage({ id, type: "done", data: queries.map(() => ({ ok: false, error: "N\xe3o foi poss\xedvel carregar o SQLite: " + String(err && err.message ? err.message : err) })) });
  }
};`;class i{source;bootMs;worker;seq;constructor(e,a){this.source=e,this.bootMs=a,this.worker=null,this.seq=0}run(e,a,t){if(!this.worker){let e=URL.createObjectURL(new Blob([this.source],{type:"text/javascript"}));this.worker=new Worker(e),URL.revokeObjectURL(e)}let r=this.worker,o=++this.seq;return new Promise(n=>{let s=window.setTimeout(()=>i(),this.bootMs),i=()=>{r.removeEventListener("message",l),r.terminate(),this.worker===r&&(this.worker=null),n("timeout")},l=e=>{if(e.data.id===o){if("ready"===e.data.type){window.clearTimeout(s),s=window.setTimeout(i,a),t?.();return}window.clearTimeout(s),r.removeEventListener("message",l),n(e.data.data)}};r.addEventListener("message",l),r.postMessage({id:o,...e})})}}let l=new i(r,5e3),d=new i(n,9e4),c=new i(s,45e3),m="Tempo esgotado: o código demorou demais (laço infinito?). A execução foi interrompida.";async function u(a,t,r,o,n){if("python"===a){let e=await d.run({code:t,fn:r,cases:o},6e3,n);return"timeout"===e?{ok:!1,error:m,logs:[]}:e}let s=t;if("typescript"===a)try{let{transform:a}=await e.A(72627);s=a(t,{transforms:["typescript"]}).code}catch(e){return{ok:!1,error:`Erro de sintaxe: ${e instanceof Error?e.message:String(e)}`,logs:[]}}let i=await l.run({code:s,fn:r,cases:o},3e3,n);return"timeout"===i?{ok:!1,error:m,logs:[]}:i}async function p(e,a,t){let r=await c.run({setup:e,queries:a},5e3,t);return"timeout"===r?a.map(()=>({ok:!1,error:m})):r}e.s(["c",0,u,"A",0,p])},6574,e=>{function a(e){return e.normalize("NFC").trim().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/'/g,'"').replace(/\s+/g," ").replace(/\s*([(){}[\],;:=<>+\-*/])\s*/g,"$1").replace(/[;.]+$/,"").toLowerCase()}e.s(["N",0,function(e,a,t){let r=0,o=0,n=e.map(e=>{o+=e.points;let t=a[e.id],n="number"==typeof t&&Number.isInteger(t)&&t>=0&&t<e.options.length?t:null,s=n===e.correctIndex;return s&&(r+=e.points),{questionId:e.id,selectedIndex:n,correctIndex:e.correctIndex,correct:s,explanation:e.explanation}}),s=0===o?0:Math.round(r/o*100);return{score:r,maxScore:o,percent:s,passed:o>0&&s>=t,results:n}},"g",0,function(e,t){let r=a(e);return!!r&&t.some(e=>a(e)===r)},"h",0,a])},15572,e=>{var a=e.i(6574);function t(e,a){if(e===a)return 0;if(Math.abs(e.length-a.length)>20)return 99;let t=Array.from({length:a.length+1},(e,a)=>a);for(let r=1;r<=e.length;r++){let o=t[0];t[0]=r;for(let n=1;n<=a.length;n++){let s=t[n];t[n]=Math.min(t[n]+1,t[n-1]+1,o+ +(e[r-1]!==a[n-1])),o=s}}return t[a.length]}let r=[["(",")","parênteses"],["[","]","colchetes"],["{","}","chaves"]],o=(e,a)=>e.split(a).length-1,n=[{test:/ReferenceError:?\s*(\S+) is not defined|NameError: name '([^']+)' is not defined/i,explain:e=>({title:`O nome "${e[1]??e[2]}" n\xe3o existe`,meaning:"O programa tentou usar uma variável ou função que ainda não foi criada (ou foi escrita com outro nome).",check:"Confira a digitação, maiúsculas e minúsculas, e se o nome foi declarado antes de ser usado e no mesmo bloco."})},{test:/Cannot access '([^']+)' before initialization/i,explain:e=>({title:`"${e[1]}" foi usado antes de receber um valor`,meaning:"Com let e const, a variável só existe a partir da linha em que é declarada.",check:"Mova a declaração para antes do uso, ou veja se há outra declaração com o mesmo nome dentro do bloco."})},{test:/(\S+) is not a function/i,explain:e=>({title:`"${e[1]}" n\xe3o \xe9 uma fun\xe7\xe3o`,meaning:"O código chamou com parênteses algo que não é uma função (um número, texto, undefined ou um método com nome errado).",check:"Confira o nome do método (ex.: length é propriedade, não leva parênteses) e o tipo do valor antes da chamada."})},{test:/Cannot read propert(?:y|ies) of (undefined|null)|'NoneType' object has no attribute|NullPointerException|Object reference not set/i,explain:()=>({title:"O valor está vazio (undefined, null ou None)",meaning:"O programa tentou acessar algo dentro de um valor que não existe.",check:"Descubra de onde veio esse valor: um índice fora da lista, uma função sem return ou um campo com nome errado costumam ser a causa."})},{test:/Assignment to constant variable/i,explain:()=>({title:"Tentou mudar uma constante",meaning:"Uma variável criada com const não pode receber outro valor.",check:"Use let se o valor precisa mudar, ou crie uma variável nova. Num if, compare com === em vez de =."})},{test:/Unexpected token|Unexpected end of input|missing \) after|SyntaxError|invalid syntax|expected ['"`;)]|error: ';' expected/i,explain:()=>({title:"Erro de sintaxe: o código não pôde nem ser lido",meaning:"Algum símbolo está faltando, sobrando ou fora do lugar.",check:"Procure parênteses, chaves, colchetes e aspas sem par, vírgulas a mais e a linha indicada (às vezes o problema está na linha anterior)."})},{test:/IndentationError|unexpected indent|expected an indented block/i,explain:()=>({title:"Indentação errada (Python)",meaning:"Em Python, os espaços no começo da linha definem os blocos.",check:"Use 4 espaços em cada nível e não misture tab com espaços. Depois de ':' a linha seguinte precisa estar mais à direita."})},{test:/TypeError: unsupported operand|can only concatenate str|must be str, not|cannot be applied to|incompatible types|cannot convert/i,explain:()=>({title:"Tipos que não combinam",meaning:"A operação recebeu valores de tipos diferentes, como somar texto com número.",check:"Converta antes de operar: int()/str() em Python, Number()/String() em JavaScript, ou ajuste o tipo da variável."})},{test:/IndexError|index out of range|ArrayIndexOutOfBounds|IndexOutOfRange/i,explain:()=>({title:"Posição fora da lista",meaning:"O código pediu um índice que não existe. Lembre que o primeiro item é o índice 0 e o último é tamanho - 1.",check:"Revise as condições dos laços (< em vez de <=) e listas vazias."})},{test:/KeyError: (.+)/i,explain:e=>({title:`A chave ${e[1]} n\xe3o existe no dicion\xe1rio`,meaning:"O dicionário não tem esse item.",check:"Confira o nome da chave ou use .get(chave, padrão) para ter um valor quando ela faltar."})},{test:/ZeroDivisionError|division by zero|DivideByZero/i,explain:()=>({title:"Divisão por zero",meaning:"O programa dividiu um número por 0.",check:"Trate o caso de lista vazia ou divisor zero antes de dividir."})},{test:/Maximum call stack size exceeded|RecursionError|StackOverflow/i,explain:()=>({title:"Recursão sem fim",meaning:"Uma função chamou a si mesma vezes demais.",check:"Confira o caso base (quando a função para) e se cada chamada se aproxima dele."})},{test:/Tempo limite|timed? ?out|Time limit exceeded|demorou demais/i,explain:()=>({title:"O programa demorou demais",meaning:"Provavelmente há um laço que nunca termina ou um algoritmo lento demais para entradas grandes.",check:"Veja se a variável do laço muda a cada volta e se a condição de parada é alcançada."})},{test:/no such column|column "?([a-z_]+)"? does not exist/i,explain:()=>({title:"Coluna inexistente (SQL)",meaning:"A consulta usou uma coluna que não existe nessa tabela.",check:"Confira o nome da coluna no esquema e se ela pertence à tabela do FROM (ou do JOIN)."})},{test:/no such table|relation "?([a-z_]+)"? does not exist/i,explain:()=>({title:"Tabela inexistente (SQL)",meaning:"A consulta citou uma tabela que não existe.",check:"Confira o nome da tabela no esquema mostrado no desafio."})},{test:/cannot find symbol|undeclared identifier|was not declared in this scope|does not exist in the current context|cannot find value/i,explain:()=>({title:"Nome não declarado (linguagem compilada)",meaning:"O compilador não encontrou essa variável, função ou tipo.",check:"Declare antes de usar, confira a digitação e os imports, e veja se o nome existe dentro do bloco atual."})}];e.s(["j",0,function(e,n){let s=(0,a.h)(e);if(!s)return null;let i=n.map(a.h).filter(Boolean);if(0===i.length)return null;let l=i.reduce((e,a)=>t(s,a)<t(s,e)?a:e);for(let[e,a,t]of r){let r=o(s,e),n=o(s,a);if(r!==n)return r>n?`Faltou fechar ${t}: h\xe1 ${r} "${e}" e ${n} "${a}".`:`Sobrou "${a}": h\xe1 mais ${t} fechando do que abrindo.`}if(o(s,'"')%2==1)return"Há aspas abertas sem fechar.";let d=t(s,l);if(l.startsWith(s))return"O começo está certo. Falta completar a resposta.";if(s.startsWith(l))return"A resposta certa está aí dentro, mas sobrou algo no final.";if(d<=2)return"Muito perto! A diferença é de um ou dois caracteres: confira a digitação de nomes e símbolos.";let c=e=>new Set(e.split(/[^a-z0-9_$]+/i).filter(e=>e.length>1)),m=c(l),u=c(s),p=[...m].filter(e=>u.has(e)).length;return m.size>0&&p/m.size>=.5?"Você usou boa parte das peças certas. Confira a ordem e o que está faltando.":null},"b",0,function(e){let a=e.slice(0,4e3);for(let e of n){let t=a.match(e.test);if(t)return e.explain(t)}return null}])},6363,74995,e=>{let a=[{id:1,slug:"terminal-inicial",name:"Terminal Inicial",minTrophies:0,tier:1,durationSec:180,win:30,loss:0,floorProtected:!0,topics:"Variáveis, contas e condicionais",color:"#3b82f6",reward:"Moldura Terminal"},{id:2,slug:"vale-dos-lacos",name:"Vale dos Laços",minTrophies:150,tier:2,durationSec:210,win:30,loss:10,floorProtected:!0,topics:"Laços de repetição e strings",color:"#22c55e",reward:"Moldura Laço Infinito"},{id:3,slug:"biblioteca-das-listas",name:"Biblioteca das Listas",minTrophies:400,tier:3,durationSec:240,win:30,loss:15,floorProtected:!1,topics:"Arrays, funções e manipulação de dados",color:"#eab308",reward:"Moldura Índice Zero"},{id:4,slug:"fabrica-de-funcoes",name:"Fábrica de Funções",minTrophies:800,tier:4,durationSec:270,win:30,loss:20,floorProtected:!1,topics:"Lógica elaborada e contagens",color:"#f97316",reward:"Moldura Engrenagem"},{id:5,slug:"torre-dos-algoritmos",name:"Torre dos Algoritmos",minTrophies:1300,tier:5,durationSec:300,win:30,loss:25,floorProtected:!1,topics:"Algoritmos clássicos e estruturas de dados",color:"#a855f7",reward:"Moldura Pilha"},{id:6,slug:"nucleo-do-kernel",name:"Núcleo do Kernel",minTrophies:2e3,tier:6,durationSec:330,win:30,loss:30,floorProtected:!1,topics:"Eficiência com entradas grandes",color:"#ef4444",reward:"Moldura Kernel"},{id:7,slug:"labirinto-dos-grafos",name:"Labirinto dos Grafos",minTrophies:2800,tier:7,durationSec:420,win:30,loss:35,floorProtected:!1,topics:"Grades, grafos e buscas",color:"#14b8a6",reward:"Moldura Labirinto"},{id:8,slug:"camara-da-memoria",name:"Câmara da Memória",minTrophies:3700,tier:8,durationSec:480,win:30,loss:40,floorProtected:!1,topics:"Programação dinâmica",color:"#ec4899",reward:"Moldura Memo"},{id:9,slug:"trono-do-compilador",name:"Trono do Compilador",minTrophies:4800,tier:9,durationSec:540,win:30,loss:45,floorProtected:!1,topics:"Otimização e algoritmos avançados",color:"#f59e0b",reward:"Moldura Compilador Lendário"}],t="Não precisa mexer daqui para baixo: lê a entrada e imprime a resposta.",r={int:"int",str:"String",bool:"boolean","int[]":"int[]",float:"double"},o={int:"number",str:"string",bool:"boolean","int[]":"number[]",float:"number"},n={int:"int",str:"string",bool:"bool","int[]":"vector<int>",float:"double"},s={int:"int",str:"string",bool:"bool","int[]":"int[]",float:"double"},i={int:"int",str:"string",bool:"bool","int[]":"[]int",float:"float64"},l={int:"i64",str:"String",bool:"bool","int[]":"Vec<i64>",float:"f64"};function d(e,a){if("int"===e)return"0";if("float"===e)return"rust"===a||"python"===a?"0.0":"0";if("bool"===e)return"python"===a?"False":"false";if("str"===e)return"python"===a?'""':"c"===a?"":"rust"===a?"String::new()":'""';switch(a){case"python":case"javascript":case"typescript":case"php":return"[]";case"java":case"csharp":return"new int[0]";case"c":return"0";case"cpp":return"{}";case"go":return"[]int{}";case"rust":return"Vec::new()"}}e.s(["M",0,a,"w",0,["javascript","typescript","python","java","c","cpp","csharp","go","rust","php"],"L",0,{countdownSec:5,diffStep:25,diffCap:10,abandonExtraLoss:5,abandonAfterSec:45,maxSubmissions:12,minSecondsBetweenSubmissions:5,maxCodeBytes:2e4,judgeGraceSec:60,windowBase:100,windowPerSec:20,queueStaleSec:20},"u",0,{javascript:{label:"JavaScript",judge0Id:102,version:"Node.js 22",cpuSeconds:3,memoryKb:192e3},typescript:{label:"TypeScript",judge0Id:101,version:"TypeScript 5.6",cpuSeconds:8,memoryKb:256e3,compilerOptions:"--target es2020 --lib es2020,dom"},python:{label:"Python",judge0Id:100,version:"Python 3.12",cpuSeconds:6,memoryKb:128e3},java:{label:"Java",judge0Id:91,version:"JDK 17",cpuSeconds:4,memoryKb:256e3},c:{label:"C",judge0Id:103,version:"GCC 14",cpuSeconds:2,memoryKb:128e3},cpp:{label:"C++",judge0Id:105,version:"GCC 14",cpuSeconds:2,memoryKb:128e3,compilerOptions:"-O2"},csharp:{label:"C#",judge0Id:51,version:"Mono 6.6",cpuSeconds:4,memoryKb:256e3},go:{label:"Go",judge0Id:95,version:"Go 1.18",cpuSeconds:3,memoryKb:256e3},rust:{label:"Rust",judge0Id:108,version:"Rust 1.85",cpuSeconds:3,memoryKb:256e3,compilerOptions:"--edition 2021 -O"},php:{label:"PHP",judge0Id:98,version:"PHP 8.3",cpuSeconds:4,memoryKb:256e3}},"F",0,function(e){let t=a[0];for(let r of a)e>=r.minTrophies&&(t=r);return t},"f",0,function(e,a){let t=[String(a.length)];for(let r of a)e.params.forEach((e,a)=>{let o=r[a];"int[]"===e.type?t.push(String(o.length),o.join(" ")):"bool"===e.type?t.push(o?"true":"false"):t.push(String(o))});return t.join("\n")+"\n"},"z",0,function(e,a){return"int[]"===e?a.join(" "):"bool"===e?a?"true":"false":String(a)},"x",0,function(e,a,c="resolver"){let m=function(e,a){switch(a){case"javascript":let c,m,u;return c=e.params.map(e=>e.name).join(", "),m=e.params.map(e=>"int"===e.type?`    const ${e.name} = Number(ler());`:"bool"===e.type?`    const ${e.name} = ler().trim() === "true";`:"str"===e.type?`    const ${e.name} = ler();`:`    const ${e.name} = lerLista();`).join("\n"),u="int[]"===e.returns?'r.join(" ")':"String(r)",`function resolver(${c}) {
  // escreva sua solu\xe7\xe3o aqui
  return ${d(e.returns,"javascript")};
}

// ---- ${t}
const linhas = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;
const ler = () => (linhas[pos++] ?? "").replace(/\\r$/, "");
const lerLista = () => {
  const n = Number(ler());
  const l = ler().trim();
  return n === 0 ? [] : l.split(/\\s+/).map(Number);
};
const t = Number(ler());
const saida = [];
for (let caso = 0; caso < t; caso++) {
${m}
    const r = resolver(${c});
    saida.push(${u});
}
console.log(saida.join("\\n"));
`;case"typescript":let p,f,g,h;return p=e.params.map(e=>`${e.name}: ${o[e.type]}`).join(", "),f=e.params.map(e=>e.name).join(", "),g=e.params.map(e=>"int"===e.type?`    const ${e.name} = Number(ler());`:"bool"===e.type?`    const ${e.name} = ler().trim() === "true";`:"str"===e.type?`    const ${e.name} = ler();`:`    const ${e.name} = lerLista();`).join("\n"),h="int[]"===e.returns?'r.join(" ")':"String(r)",`function resolver(${p}): ${o[e.returns]} {
  // escreva sua solu\xe7\xe3o aqui
  return ${d(e.returns,"typescript")};
}

// ---- ${t}
declare const require: any;
const linhas: string[] = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;
const ler = (): string => (linhas[pos++] ?? "").replace(/\\r$/, "");
const lerLista = (): number[] => {
  const n = Number(ler());
  const l = ler().trim();
  return n === 0 ? [] : l.split(/\\s+/).map(Number);
};
const t = Number(ler());
const saida: string[] = [];
for (let caso = 0; caso < t; caso++) {
${g}
    const r = resolver(${f});
    saida.push(${h});
}
console.log(saida.join("\\n"));
`;case"python":let x,v,b;return x=e.params.map(e=>e.name).join(", "),v=e.params.map(e=>"int"===e.type?`    ${e.name} = int(ler())`:"bool"===e.type?`    ${e.name} = ler().strip() == "true"`:"str"===e.type?`    ${e.name} = ler()`:`    ${e.name} = ler_lista()`).join("\n"),b="int[]"===e.returns?'" ".join(str(x) for x in r)':"bool"===e.returns?'"true" if r else "false"':"str(r)",`def resolver(${x}):
    # escreva sua solu\xe7\xe3o aqui
    return ${d(e.returns,"python")}


# ---- ${t}
import sys

# (nomes com _ para n\xe3o colidir com os par\xe2metros, que ficam no escopo global)
_entrada = sys.stdin.read().split("\\n")
_pos = 0


def ler():
    global _pos
    _pos += 1
    return _entrada[_pos - 1].rstrip("\\r") if _pos - 1 < len(_entrada) else ""


def ler_lista():
    n = int(ler())
    return [int(x) for x in ler().split()][:n]


_t = int(ler())
_saida = []
for _ in range(_t):
${v}
    r = resolver(${x})
    _saida.append(${b})
print("\\n".join(_saida))
`;case"java":let y,j,$,S;return y=e.params.map(e=>`${r[e.type]} ${e.name}`).join(", "),j=e.params.map(e=>e.name).join(", "),$=e.params.map(e=>"int"===e.type?`            int ${e.name} = Integer.parseInt(ler(in).trim());`:"bool"===e.type?`            boolean ${e.name} = ler(in).trim().equals("true");`:"str"===e.type?`            String ${e.name} = ler(in);`:`            int[] ${e.name} = lerLista(in);`).join("\n"),S="int[]"===e.returns?"            for (int i = 0; i < r.length; i++) { if (i > 0) out.append(' '); out.append(r[i]); }":"            out.append(r);",`import java.io.*;
import java.util.*;

public class Main {
    static ${r[e.returns]} resolver(${y}) {
        // escreva sua solu\xe7\xe3o aqui
        return ${d(e.returns,"java")};
    }

    // ---- ${t}
    static String ler(BufferedReader in) throws IOException {
        String s = in.readLine();
        return s == null ? "" : s;
    }

    static int[] lerLista(BufferedReader in) throws IOException {
        int n = Integer.parseInt(ler(in).trim());
        StringTokenizer st = new StringTokenizer(ler(in));
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = Integer.parseInt(st.nextToken());
        return v;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(ler(in).trim());
        StringBuilder out = new StringBuilder();
        for (int caso = 0; caso < t; caso++) {
${$}
            ${r[e.returns]} r = resolver(${j});
${S}
            out.append('\\n');
        }
        System.out.print(out);
    }
}
`;case"c":let N,w,_,k,q,z,E,C,O;return N=e.params.map(e=>"int"===e.type?`int ${e.name}`:"bool"===e.type?`bool ${e.name}`:"str"===e.type?`const char *${e.name}`:`int *${e.name}, int n_${e.name}`),w=e.params.map(e=>"int[]"===e.type?`${e.name}, n_${e.name}`:e.name),_="int","bool"===e.returns&&(_="bool"),"float"===e.returns&&(_="double"),"str"===e.returns&&(_="void",N.push("char *resposta"),w.push("resposta")),"int[]"===e.returns&&(N.push("int *resposta"),w.push("resposta")),k="str"===e.returns?"/* Escreva a resposta em `resposta` (já tem espaço reservado). */\n":"int[]"===e.returns?"/* Escreva os números em `resposta` e devolva quantos são. */\n":"",q=e.params.map(e=>"int"===e.type?`        int ${e.name} = atoi(ler());`:"bool"===e.type?`        bool ${e.name} = strcmp(ler(), "true") == 0;`:"str"===e.type?`        char *${e.name} = strdup(ler());`:`        int n_${e.name} = atoi(ler());
        int *${e.name} = malloc(sizeof(int) * (n_${e.name} + 1));
        char *p_${e.name} = ler();
        for (int i = 0; i < n_${e.name}; i++) ${e.name}[i] = (int) strtol(p_${e.name}, &p_${e.name}, 10);`).join("\n"),z=e.params.filter(e=>"str"===e.type||"int[]"===e.type).map(e=>`        free(${e.name});`).join("\n"),E="",E="int"===e.returns?`        printf("%d\\n", resolver(${w.join(", ")}));`:"float"===e.returns?`        printf("%.15g\\n", resolver(${w.join(", ")}));`:"bool"===e.returns?`        printf("%s\\n", resolver(${w.join(", ")}) ? "true" : "false");`:"str"===e.returns?`        resposta[0] = '\\0';
        resolver(${w.join(", ")});
        printf("%s\\n", resposta);`:`        int tam = resolver(${w.join(", ")});
        for (int i = 0; i < tam; i++) printf(i ? " %d" : "%d", resposta[i]);
        printf("\\n");`,C="str"===e.returns?"    // escreva sua solução aqui\n":`    // escreva sua solu\xe7\xe3o aqui
    return ${d(e.returns,"c")};
`,O="str"===e.returns?"static char resposta[1 << 20];\n":"int[]"===e.returns?"static int resposta[1 << 18];\n":"",`#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${k}${_} resolver(${N.join(", ")}) {
${C}}

/* ---- ${t} */
static char linha[1 << 21];
${O}
static char *ler(void) {
    if (!fgets(linha, sizeof linha, stdin)) linha[0] = '\\0';
    linha[strcspn(linha, "\\r\\n")] = '\\0';
    return linha;
}

int main(void) {
    int t = atoi(ler());
    for (int caso = 0; caso < t; caso++) {
${q}
${E}
${z}
    }
    return 0;
}
`;case"cpp":let M,T,L,P;return M=e.params.map(e=>`${n[e.type]} ${e.name}`).join(", "),T=e.params.map(e=>e.name).join(", "),L=e.params.map(e=>"int"===e.type?`        int ${e.name} = stoi(ler());`:"bool"===e.type?`        bool ${e.name} = ler() == "true";`:"str"===e.type?`        string ${e.name} = ler();`:`        vector<int> ${e.name} = lerLista();`).join("\n"),P="int[]"===e.returns?"        for (size_t i = 0; i < r.size(); i++) { if (i) saida << ' '; saida << r[i]; }":"bool"===e.returns?'        saida << (r ? "true" : "false");':"float"===e.returns?"        saida << setprecision(15) << r;":"        saida << r;",`#include <bits/stdc++.h>
using namespace std;

${n[e.returns]} resolver(${M}) {
    // escreva sua solu\xe7\xe3o aqui
    return ${d(e.returns,"cpp")};
}

// ---- ${t}
static string ler() {
    string s;
    if (!getline(cin, s)) return "";
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    return s;
}

static vector<int> lerLista() {
    int n = stoi(ler());
    istringstream in(ler());
    vector<int> v(n);
    for (int i = 0; i < n; i++) in >> v[i];
    return v;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = stoi(ler());
    ostringstream saida;
    for (int caso = 0; caso < t; caso++) {
${L}
        ${n[e.returns]} r = resolver(${T});
${P}
        saida << '\\n';
    }
    cout << saida.str();
    return 0;
}
`;case"csharp":let R,A,I,B;return R=e.params.map(e=>`${s[e.type]} ${e.name}`).join(", "),A=e.params.map(e=>e.name).join(", "),I=e.params.map(e=>"int"===e.type?`            int ${e.name} = int.Parse(Ler().Trim());`:"bool"===e.type?`            bool ${e.name} = Ler().Trim() == "true";`:"str"===e.type?`            string ${e.name} = Ler();`:`            int[] ${e.name} = LerLista();`).join("\n"),B="int[]"===e.returns?'            saida.Append(string.Join(" ", r));':"bool"===e.returns?'            saida.Append(r ? "true" : "false");':"float"===e.returns?'            saida.Append(r.ToString("R", System.Globalization.CultureInfo.InvariantCulture));':"            saida.Append(r);",`using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public class Program
{
    static ${s[e.returns]} resolver(${R})
    {
        // escreva sua solu\xe7\xe3o aqui
        return ${d(e.returns,"csharp")};
    }

    // ---- ${t}
    static string Ler()
    {
        string s = Console.In.ReadLine();
        return s == null ? "" : s.TrimEnd('\\r');
    }

    static int[] LerLista()
    {
        int n = int.Parse(Ler().Trim());
        string[] partes = Ler().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = int.Parse(partes[i]);
        return v;
    }

    public static void Main()
    {
        int t = int.Parse(Ler().Trim());
        var saida = new StringBuilder();
        for (int caso = 0; caso < t; caso++)
        {
${I}
            ${s[e.returns]} r = resolver(${A});
${B}
            saida.Append('\\n');
        }
        Console.Write(saida.ToString());
    }
}
`;case"go":let F,D,J,K;return F=e.params.map(e=>`${e.name} ${i[e.type]}`).join(", "),D=e.params.map(e=>e.name).join(", "),J=e.params.map(e=>"int"===e.type?`		${e.name}, _ := strconv.Atoi(strings.TrimSpace(ler()))`:"bool"===e.type?`		${e.name} := strings.TrimSpace(ler()) == "true"`:"str"===e.type?`		${e.name} := ler()`:`		${e.name} := lerLista()`).join("\n"),K="int[]"===e.returns?`		for i, x := range r {
			if i > 0 {
				saida.WriteByte(' ')
			}
			saida.WriteString(strconv.Itoa(x))
		}`:"bool"===e.returns?`		if r {
			saida.WriteString("true")
		} else {
			saida.WriteString("false")
		}`:"str"===e.returns?"		saida.WriteString(r)":"float"===e.returns?"		saida.WriteString(strconv.FormatFloat(r, 'g', -1, 64))":"		saida.WriteString(strconv.Itoa(r))",`package main

import (
	"bufio"
	"math"
	"os"
	"sort"
	"strconv"
	"strings"
)

func resolver(${F}) ${i[e.returns]} {
	// escreva sua solu\xe7\xe3o aqui
	return ${d(e.returns,"go")}
}

// ---- ${t}
// (math, sort e strings j\xe1 est\xe3o importados para voc\xea usar.)
var _ = math.MaxInt64
var _ = sort.Ints
var leitor = bufio.NewReaderSize(os.Stdin, 1<<20)

func ler() string {
	s, _ := leitor.ReadString('\\n')
	return strings.TrimRight(s, "\\r\\n")
}

func lerLista() []int {
	n, _ := strconv.Atoi(strings.TrimSpace(ler()))
	campos := strings.Fields(ler())
	v := make([]int, n)
	for i := 0; i < n; i++ {
		v[i], _ = strconv.Atoi(campos[i])
	}
	return v
}

func main() {
	t, _ := strconv.Atoi(strings.TrimSpace(ler()))
	var saida strings.Builder
	for caso := 0; caso < t; caso++ {
${J}
		r := resolver(${D})
${K}
		saida.WriteByte('\\n')
	}
	os.Stdout.WriteString(saida.String())
}
`;case"rust":let U,G,W,V;return U=e.params.map(e=>`${e.name}: ${l[e.type]}`).join(", "),G=e.params.map(e=>e.name).join(", "),W=e.params.map(e=>"int"===e.type?`        let ${e.name}: i64 = ler().trim().parse().unwrap();`:"bool"===e.type?`        let ${e.name}: bool = ler().trim() == "true";`:"str"===e.type?`        let ${e.name}: String = ler();`:`        let n_${e.name}: usize = ler().trim().parse().unwrap();
        let ${e.name}: Vec<i64> = ler().split_whitespace().take(n_${e.name}).map(|x| x.parse().unwrap()).collect();`).join("\n"),V="int[]"===e.returns?'        saida.push_str(&r.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(" "));':"bool"===e.returns?'        saida.push_str(if r { "true" } else { "false" });':"str"===e.returns?"        saida.push_str(&r);":"        saida.push_str(&r.to_string());",`#[allow(unused_imports)]
use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use std::io::{self, Read};

#[allow(unused_variables, unused_mut)]
fn resolver(${U}) -> ${l[e.returns]} {
    // escreva sua solu\xe7\xe3o aqui
    return ${d(e.returns,"rust")};
}

// ---- ${t}
fn main() {
    let mut entrada = String::new();
    io::stdin().read_to_string(&mut entrada).unwrap();
    let mut linhas = entrada.split('\\n').map(|l| l.trim_end_matches('\\r'));
    let mut ler = move || linhas.next().unwrap_or("").to_string();
    let t: usize = ler().trim().parse().unwrap();
    let mut saida = String::new();
    for _ in 0..t {
${W}
        let r = resolver(${G});
${V}
        saida.push('\\n');
    }
    print!("{}", saida);
}
`;case"php":let Q,H,X;return Q=e.params.map(e=>`$${e.name}`).join(", "),H=e.params.map(e=>"int"===e.type?`    $${e.name} = intval(ler());`:"bool"===e.type?`    $${e.name} = trim(ler()) === "true";`:"str"===e.type?`    $${e.name} = ler();`:`    $${e.name} = lerLista();`).join("\n"),X="int[]"===e.returns?'implode(" ", $r)':"bool"===e.returns?'($r ? "true" : "false")':"(string) $r",`<?php
function resolver(${Q}) {
    // escreva sua solu\xe7\xe3o aqui
    return ${d(e.returns,"php")};
}

// ---- ${t}
// (nomes com _ para n\xe3o colidir com os par\xe2metros, que ficam no escopo global)
$_entrada = explode("\\n", file_get_contents("php://stdin"));
$_pos = 0;

function ler() {
    global $_entrada, $_pos;
    return rtrim($_entrada[$_pos++] ?? "", "\\r");
}

function lerLista() {
    $n = intval(ler());
    $l = trim(ler());
    return $n === 0 ? [] : array_map("intval", array_slice(preg_split('/\\s+/', $l), 0, $n));
}

$_t = intval(ler());
$_saida = [];
for ($_caso = 0; $_caso < $_t; $_caso++) {
${H}
    $r = resolver(${Q});
    $_saida[] = ${X};
}
echo implode("\\n", $_saida), "\\n";
`}}(e,a);return"resolver"===c?m:m.replace(/\bresolver\(/g,`${c}(`)}],6363);var c=e.i(43476),m=e.i(71645);e.s(["f",0,function({value:e,onChange:a,indent:t,label:r}){let o=(0,m.useRef)(null),n=(0,m.useRef)(null),s=e.split("\n").length;function i(t,r,n,s){let i=o.current;a(e.slice(0,t)+n+e.slice(r)),requestAnimationFrame(()=>{i.selectionStart=i.selectionEnd=s})}return(0,c.jsxs)("div",{className:"flex overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#060d1c] focus-within:border-electric",children:[(0,c.jsx)("div",{ref:n,"aria-hidden":!0,className:"select-none overflow-hidden border-r border-line py-3 pl-2 pr-2 text-right font-mono text-[13px] leading-6 text-subtle",children:Array.from({length:s},(e,a)=>(0,c.jsx)("div",{children:a+1},a))}),(0,c.jsx)("textarea",{ref:o,value:e,onChange:e=>a(e.target.value),onKeyDown:function(a){let r=a.currentTarget,{selectionStart:o,selectionEnd:n}=r,s=" ".repeat(t);if("Escape"===a.key)return void r.blur();if("Tab"===a.key&&!a.ctrlKey&&!a.metaKey){a.preventDefault();let r=e.lastIndexOf("\n",o-1)+1;if(a.shiftKey){let a=e.slice(r,r+t),n=a.length-a.trimStart().length;n>0&&i(r,r+n,"",Math.max(r,o-n));return}i(o,n,s,o+s.length);return}if("Enter"===a.key&&!a.ctrlKey&&!a.metaKey){a.preventDefault();let t=e.lastIndexOf("\n",o-1)+1,r=e.slice(t,o),l=r.match(/^\s*/)?.[0]??"";/[{[(:]\s*$/.test(r)&&(l+=s),i(o,n,`
${l}`,o+1+l.length)}},onScroll:e=>{n.current&&(n.current.scrollTop=e.currentTarget.scrollTop)},"aria-label":r,spellCheck:!1,autoCapitalize:"off",autoComplete:"off",autoCorrect:"off",wrap:"off",rows:Math.min(24,Math.max(12,s+2)),className:"min-w-0 flex-1 resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 text-[#dbe7ff] outline-none"})]})}],74995)}])})();