<!-- aula: o-que-e-programacao -->
## Por que isso importa

Todo aplicativo que você usa — o banco no celular, o mapa, a rede social — é um conjunto de instruções escritas por pessoas. Programar é escrever essas instruções de forma tão precisa que um computador consiga segui-las sem adivinhar nada. Entender isso muda o jeito de olhar para a tecnologia: em vez de "mágica", você passa a enxergar passos.

## Conceitos fundamentais

**Programa** é uma sequência de instruções que o computador executa em ordem. **Linguagem de programação** é o idioma que usamos para escrever essas instruções: JavaScript, Python, Java e muitas outras. Cada linguagem tem regras de escrita, chamadas de **sintaxe**.

O computador é rápido, mas literal. Ele não entende intenções, só comandos. Se você disser a uma pessoa "faz um café", ela preenche as lacunas sozinha. Um computador precisaria de algo como:

1. Encher a chaleira com água.
2. Ligar o fogo.
3. Esperar a água ferver.
4. Colocar o pó no filtro.
5. Despejar a água sobre o pó.

Essa lista ordenada e sem ambiguidade já é um **algoritmo** — o assunto da próxima aula.

Outros termos que você vai encontrar:

- **Código-fonte**: o texto do programa, escrito por pessoas.
- **Executar** (ou rodar): pedir ao computador que siga as instruções.
- **Saída**: o resultado que o programa mostra, como um texto na tela.

## Exemplo prático

Neste curso usamos **JavaScript**, que roda direto no navegador. Abra qualquer site, pressione `F12` (ou `Ctrl + Shift + J` no Chrome e no Edge; no Safari, ative antes o menu Desenvolvedor) e procure a aba **Console**. Digite a linha abaixo e pressione Enter:

```js
console.log("Olá, mundo!");
```

O console vai exibir:

```texto
Olá, mundo!
```

## Explicando o código

- `console` é uma ferramenta do navegador para exibir mensagens.
- `.log(...)` é a ação de "registrar" (mostrar) algo.
- O que está entre aspas, `"Olá, mundo!"`, é um **texto**. As aspas dizem ao computador onde o texto começa e termina.
- O ponto e vírgula `;` marca o fim da instrução. Em JavaScript ele costuma ser opcional, mas usá-lo deixa o código mais claro.

## Erros comuns

- **Esquecer as aspas**: `console.log(Olá)` gera erro, porque o computador procura algo chamado `Olá` em vez de mostrar o texto.
- **Trocar maiúsculas e minúsculas**: `Console.log` não funciona. JavaScript diferencia `c` de `C`.
- **Achar que errar é sinal de que programação "não é para você"**: mensagens de erro fazem parte do trabalho de qualquer pessoa que programa. Elas são pistas, não broncas.

## Resumo

- Programar é escrever instruções precisas para um computador.
- Linguagens de programação têm sintaxe própria; o computador segue tudo literalmente.
- `console.log("...")` mostra um texto no console do navegador.

## Próximo passo

Na próxima aula você vai aprender a transformar um problema do dia a dia em um algoritmo, dividindo-o em partes menores.

<!-- aula: algoritmos-e-decomposicao -->
## Por que isso importa

Quase ninguém trava em programação por não saber digitar código. Trava por não saber **por onde começar**. Algoritmos e decomposição são as ferramentas para sair desse bloqueio: você aprende a quebrar um problema grande em passos pequenos que consegue resolver.

## Conceitos fundamentais

Um **algoritmo** é uma sequência finita de passos, sem ambiguidade, que resolve um problema. Três características ajudam a reconhecer um bom algoritmo:

- **Finito**: termina em algum momento.
- **Preciso**: cada passo tem um único significado.
- **Eficaz**: os passos realmente levam ao resultado.

**Decomposição** é dividir um problema em subproblemas menores. "Organizar uma festa" é grande demais; "fazer a lista de convidados", "definir o cardápio" e "calcular o orçamento" são tarefas que você consegue começar hoje.

Todo algoritmo tem três partes:

1. **Entrada**: os dados de que ele precisa.
2. **Processamento**: o que é feito com esses dados.
3. **Saída**: o resultado.

## Exemplo prático

Problema: calcular a média de duas notas de um aluno e dizer se ele foi aprovado (média maior ou igual a 7).

Decompondo:

1. Obter a primeira nota.
2. Obter a segunda nota.
3. Somar as duas notas.
4. Dividir a soma por 2.
5. Se a média for maior ou igual a 7, informar "Aprovado"; caso contrário, "Reprovado".

Em JavaScript, você vai conseguir escrever isso daqui a algumas aulas:

```js
const nota1 = 8;
const nota2 = 6;
const media = (nota1 + nota2) / 2;
console.log(media); // 7
```

## Explicando o código

- As duas primeiras linhas são a **entrada**: guardam as notas.
- A terceira linha é o **processamento**: soma e divide. Os parênteses garantem que a soma aconteça antes da divisão.
- `console.log(media)` é a **saída**: mostra `7`.
- O texto depois de `//` é um **comentário**: o computador ignora, mas ele explica o código para pessoas.

## Erros comuns

- **Pular passos "óbvios"**: o computador não deduz nada. Se você não mandou somar antes de dividir, ele não soma.
- **Esquecer os parênteses**: `nota1 + nota2 / 2` divide só a segunda nota, porque a divisão acontece antes da soma. O resultado seria `11`, não `7`.
- **Tentar resolver tudo de uma vez**: escreva os passos em português primeiro. O código vem depois.

## Resumo

- Algoritmo é uma sequência finita e precisa de passos.
- Decompor é dividir o problema em partes que você consegue resolver.
- Pense sempre em entrada, processamento e saída.

## Próximo passo

A seguir, você vai aprender a escrever algoritmos em pseudocódigo, um meio-termo entre o português e o código.

<!-- aula: pseudocodigo-e-raciocinio -->
## Por que isso importa

Pensar direto em código mistura duas dificuldades: descobrir a lógica e lembrar a sintaxe. O **pseudocódigo** separa essas duas coisas. Você resolve o problema em uma linguagem simples e só depois traduz para JavaScript.

## Conceitos fundamentais

Pseudocódigo não tem regras oficiais; o importante é ser claro e estruturado. Usaremos estas palavras:

- `LEIA` para receber uma entrada.
- `ESCREVA` para mostrar uma saída.
- `SE ... ENTÃO ... SENÃO ... FIM SE` para decisões.
- `ENQUANTO ... FAÇA ... FIM ENQUANTO` para repetições.
- `←` para guardar um valor ("recebe").

Junto com o pseudocódigo, use o **teste de mesa**: simule o algoritmo à mão, linha por linha, anotando o valor de cada informação. É assim que você descobre erros antes de escrever código.

## Exemplo prático

Problema: descobrir o maior entre dois números.

```pseudo
LEIA a
LEIA b
SE a > b ENTÃO
    ESCREVA a
SENÃO
    ESCREVA b
FIM SE
```

Teste de mesa com `a = 4` e `b = 9`:

| Linha | a | b | Saída |
|---|---|---|---|
| LEIA a | 4 | – | – |
| LEIA b | 4 | 9 | – |
| SE 4 > 9? Não | 4 | 9 | – |
| ESCREVA b | 4 | 9 | 9 |

A tradução para JavaScript fica assim:

```js
const a = 4;
const b = 9;
if (a > b) {
  console.log(a);
} else {
  console.log(b);
}
```

## Explicando o código

- `LEIA a` virou `const a = 4`: por enquanto, escrevemos o valor direto no código.
- `SE ... ENTÃO` virou `if (...) { }` e `SENÃO` virou `else { }`.
- As chaves `{ }` delimitam o bloco de instruções de cada caminho.

## Erros comuns

- **Testar só um caso**: o algoritmo acima funciona para `4` e `9`, mas e se os números forem iguais? Ele mostra `b`, o que está correto, mas vale anotar esse cenário no teste de mesa.
- **Escrever pseudocódigo vago**: "verifique os números" não é um passo. "SE a > b" é.
- **Pular o teste de mesa**: dois minutos de simulação economizam muito tempo de depuração.

## Resumo

- Pseudocódigo descreve a lógica sem se preocupar com sintaxe.
- Teste de mesa é simular o algoritmo à mão para encontrar erros.
- Teste também casos-limite, como valores iguais ou zero.

## Próximo passo

Agora que você sabe planejar, vai aprender a guardar informações no programa com variáveis e constantes.

<!-- aula: variaveis-e-constantes -->
## Por que isso importa

Programas trabalham com informações: o nome de quem está usando, o total de uma compra, a pontuação de um jogo. Para usar uma informação mais de uma vez, ou alterá-la, você precisa guardá-la com um nome. É para isso que servem as variáveis.

## Conceitos fundamentais

Uma **variável** é um nome que aponta para um valor guardado na memória. Em JavaScript moderno, há duas formas principais de criar uma:

- `let`: o valor **pode** mudar depois.
- `const`: o valor **não pode** ser reatribuído.

Criar a variável é **declarar**; colocar um valor nela é **atribuir**. O sinal `=` em programação significa "recebe", não "é igual a".

Boas práticas de nomes:

- Use nomes que expliquem o conteúdo: `precoTotal` em vez de `x`.
- Em JavaScript, a convenção é o **camelCase**: primeira palavra minúscula, as seguintes começando com maiúscula.
- Nomes não podem começar com número nem ter espaços.

Prefira `const` por padrão e use `let` apenas quando o valor realmente precisar mudar. Isso evita alterações acidentais. Você ainda verá `var` em códigos antigos; ele tem regras de escopo confusas e não é recomendado em código novo.

## Exemplo prático

```js
const nome = "Ana";
let pontos = 0;

pontos = pontos + 10;
pontos = pontos + 5;

console.log(nome + " fez " + pontos + " pontos");
```

Saída:

```texto
Ana fez 15 pontos
```

## Explicando o código

- `const nome = "Ana"` guarda um texto que não vai mudar.
- `let pontos = 0` começa a pontuação em zero, pois ela vai mudar.
- `pontos = pontos + 10` lê o valor atual (0), soma 10 e guarda o resultado (10) de volta em `pontos`. A linha seguinte faz o mesmo e chega a 15.
- O `+` entre textos e números **concatena** (junta) tudo em um texto só.

## Erros comuns

- **Reatribuir uma constante**: `const idade = 20; idade = 21;` gera `TypeError: Assignment to constant variable.`
- **Usar uma variável antes de declará-la**: com `let` e `const`, isso gera `ReferenceError`.
- **Declarar duas vezes o mesmo nome** no mesmo bloco com `let` ou `const`: gera `SyntaxError`.

## Resumo

- Variáveis dão nome a valores guardados na memória.
- Use `const` por padrão e `let` quando o valor precisar mudar.
- `=` significa atribuição: o lado direito é calculado e guardado no lado esquerdo.

## Próximo passo

Na próxima aula você vai conhecer os tipos de dados: textos, números, booleanos e outros.

<!-- aula: tipos-de-dados -->
## Por que isso importa

O computador trata `"5"` (texto) e `5` (número) de formas diferentes. Somar dois textos junta os caracteres; somar dois números faz conta. Muitos bugs de iniciantes nascem dessa confusão. Conhecer os tipos de dados evita surpresas.

## Conceitos fundamentais

Os tipos primitivos mais usados em JavaScript:

- **string**: texto, entre aspas simples, duplas ou crases. Ex.: `"Olá"`.
- **number**: números inteiros e decimais. Ex.: `42`, `3.14` (o separador decimal é o ponto).
- **boolean**: verdadeiro ou falso — `true` ou `false`.
- **undefined**: variável declarada sem valor.
- **null**: "ausência de valor" atribuída de propósito.

O operador `typeof` informa o tipo de um valor.

**Conversão de tipos**: `Number("42")` transforma texto em número; `String(42)` faz o contrário. Se o texto não for um número válido, `Number` devolve `NaN` ("Not a Number").

## Exemplo prático

```js
console.log(typeof "Olá");  // "string"
console.log(typeof 42);     // "number"
console.log(typeof true);   // "boolean"

console.log("5" + 3);          // "53"
console.log(Number("5") + 3);  // 8
console.log(Number("abc"));    // NaN
```

## Explicando o código

- `typeof` devolve o nome do tipo como texto.
- `"5" + 3`: quando um dos lados do `+` é texto, JavaScript converte o outro para texto e concatena. Resultado: `"53"`.
- `Number("5") + 3`: agora os dois lados são números, então a soma acontece. Resultado: `8`.
- `Number("abc")` não consegue converter e devolve `NaN`, que, curiosamente, é do tipo `number`.

## Erros comuns

- **Somar valores vindos de formulários**: campos de texto sempre entregam strings. Converta com `Number(...)` antes de fazer contas.
- **Usar vírgula como decimal**: `3,5` não é um número em JavaScript. Use `3.5`.
- **Comparar com `NaN`**: `NaN === NaN` é `false`. Para verificar, use `Number.isNaN(valor)`.

## Resumo

- Os tipos principais são string, number, boolean, undefined e null.
- `typeof` revela o tipo de um valor.
- Converta textos para número com `Number()` antes de calcular.

## Próximo passo

Agora você vai aprender os operadores: aritméticos, de comparação e lógicos.

<!-- aula: operadores -->
## Por que isso importa

Operadores são os verbos da programação: somam, comparam, combinam condições. Com eles, você calcula descontos, verifica se alguém tem idade mínima ou se uma senha atende às regras.

## Conceitos fundamentais

**Aritméticos**: `+` soma, `-` subtração, `*` multiplicação, `/` divisão, `%` resto da divisão, `**` potência.

**Comparação** (o resultado é sempre `true` ou `false`):

- `===` igual (valor **e** tipo) e `!==` diferente.
- `>`, `<`, `>=`, `<=`.

Evite `==` e `!=`: eles convertem tipos automaticamente e geram resultados confusos, como `"0" == 0` ser `true`.

**Lógicos**:

- `&&` (E): verdadeiro só se os dois lados forem verdadeiros.
- `||` (OU): verdadeiro se pelo menos um lado for verdadeiro.
- `!` (NÃO): inverte o valor.

**Precedência**: multiplicação e divisão acontecem antes de soma e subtração. Na dúvida, use parênteses.

## Exemplo prático

```js
const preco = 80;
const quantidade = 3;
const total = preco * quantidade;   // 240

const ehPar = total % 2 === 0;      // true
const temDesconto = total >= 200 && ehPar;

console.log(total, ehPar, temDesconto); // 240 true true
```

## Explicando o código

- `preco * quantidade` resulta em 240.
- `total % 2` é o resto da divisão de 240 por 2, que é 0. Comparar com `=== 0` diz se o número é par.
- `total >= 200 && ehPar` só é `true` porque as duas condições são verdadeiras.
- `console.log` pode receber vários valores separados por vírgula.

## Erros comuns

- **Confundir `=` com `===`**: `=` atribui, `===` compara.
- **Esquecer a precedência**: `2 + 3 * 4` é `14`, não `20`.
- **Usar `==`**: prefira sempre `===` para evitar conversões inesperadas.

## Resumo

- Aritméticos calculam, comparação devolve booleanos, lógicos combinam condições.
- Use `===` e `!==`.
- `%` é útil para saber se um número é par ou divisível por outro.

## Próximo passo

Na próxima aula, você vai receber dados do usuário e mostrar resultados: entrada e saída.

<!-- aula: entrada-e-saida -->
## Por que isso importa

Um programa útil conversa com quem o usa: recebe informações (entrada) e devolve respostas (saída). Até agora escrevemos os valores direto no código; nesta aula o programa passa a perguntar.

## Conceitos fundamentais

No navegador, duas funções simples ajudam a praticar:

- `prompt("pergunta")` abre uma caixa e **devolve o texto digitado** (ou `null` se a pessoa cancelar).
- `alert("mensagem")` mostra uma mensagem em uma caixa.
- `console.log(...)` mostra no console — melhor para depurar.

Mais adiante, no curso de JavaScript, você vai trocar `prompt` e `alert` por formulários e elementos da página, que é como aplicações reais funcionam.

**Template literals** são textos entre crases que aceitam valores embutidos com `${ }`. Eles deixam a saída muito mais legível do que concatenar com `+`.

## Exemplo prático

```js
const nome = prompt("Qual é o seu nome?");
const anoNascimento = Number(prompt("Em que ano você nasceu?"));
const anoAtual = new Date().getFullYear();
const idade = anoAtual - anoNascimento;

console.log(`${nome}, você faz ou já fez ${idade} anos em ${anoAtual}.`);
```

## Explicando o código

- `prompt` devolve **texto**. Por isso o ano passa por `Number(...)` antes da conta.
- `new Date().getFullYear()` obtém o ano atual do relógio do computador, em vez de deixá-lo fixo no código.
- A frase final usa crases e `${ }` para inserir as variáveis no texto.

## Erros comuns

- **Esquecer de converter a entrada**: sem `Number`, a subtração até funciona (JavaScript converte), mas a soma junta textos. Converter sempre é mais seguro.
- **Não tratar o cancelamento**: se a pessoa clicar em Cancelar, `prompt` devolve `null`. Programas reais validam a entrada antes de usá-la.
- **Usar aspas comuns em vez de crases** em template literals: `"${nome}"` mostra literalmente `${nome}`.

## Resumo

- Entrada é o que o programa recebe; saída é o que ele devolve.
- `prompt` sempre devolve texto (ou `null`).
- Template literals usam crases e `${ }`.

## Próximo passo

Na próxima aula você vai fazer o programa tomar decisões com condicionais.

<!-- aula: condicionais -->
## Por que isso importa

Programas precisam reagir: liberar o acesso se a senha estiver certa, mostrar frete grátis acima de certo valor, avisar quando o estoque acabar. Condicionais permitem executar caminhos diferentes conforme uma condição.

## Conceitos fundamentais

A estrutura básica:

```js
if (condicao) {
  // executa se a condição for verdadeira
} else if (outraCondicao) {
  // executa se a primeira for falsa e esta verdadeira
} else {
  // executa se nenhuma for verdadeira
}
```

Somente **um** dos blocos é executado, sempre o primeiro cuja condição for verdadeira, de cima para baixo. Por isso a **ordem das condições importa**.

Para escolhas simples entre dois valores, existe o **operador ternário**: `condicao ? valorSeVerdadeiro : valorSeFalso`.

## Exemplo prático

Classificar a nota de um aluno:

```js
const nota = 7.5;
let conceito;

if (nota >= 9) {
  conceito = "A";
} else if (nota >= 7) {
  conceito = "B";
} else if (nota >= 5) {
  conceito = "C";
} else {
  conceito = "D";
}

console.log(conceito); // "B"
```

## Explicando o código

- `7.5 >= 9` é falso, então o primeiro bloco é pulado.
- `7.5 >= 7` é verdadeiro: `conceito` recebe `"B"` e **os demais blocos não são verificados**.
- Se testássemos `nota >= 5` primeiro, uma nota 9,5 cairia em `"C"`. Comece pela condição mais restrita.

## Erros comuns

- **Ordem errada das condições**: condições mais amplas antes das mais específicas "engolem" os casos.
- **Usar `=` dentro do `if`**: `if (nota = 10)` atribui 10 em vez de comparar.
- **Esquecer as chaves** em blocos com mais de uma linha: só a primeira linha fica dentro do `if`.

## Resumo

- `if`, `else if` e `else` escolhem um único caminho.
- A ordem das condições importa: da mais específica para a mais geral.
- O ternário resolve escolhas simples em uma linha.

## Próximo passo

A seguir, você vai aprender a repetir instruções sem copiar e colar código: os laços de repetição.

<!-- aula: repeticoes -->
## Por que isso importa

Imagine enviar um lembrete para mil alunos escrevendo mil linhas iguais. Laços de repetição resolvem isso: você descreve **uma vez** o que deve ser repetido e **quando parar**.

## Conceitos fundamentais

**`for`**: ideal quando você sabe quantas vezes vai repetir.

```texto
for (inicio; condicao; passo) { instruções }
```

**`while`**: repete enquanto uma condição for verdadeira; útil quando você não sabe quantas voltas serão necessárias.

Conceitos importantes:

- **Iteração**: cada volta do laço.
- **Contador**: variável que muda a cada volta, geralmente chamada `i`.
- **Acumulador**: variável que vai somando ou juntando resultados.
- **Laço infinito**: quando a condição nunca fica falsa. O programa trava.

## Exemplo prático

Somar os números de 1 a 5 e mostrar a tabuada do 3:

```js
let soma = 0;
for (let i = 1; i <= 5; i++) {
  soma = soma + i;
}
console.log(soma); // 15

let n = 1;
while (n <= 3) {
  console.log(`3 x ${n} = ${3 * n}`);
  n++;
}
```

Saída do segundo laço:

```texto
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
```

## Explicando o código

- `let i = 1` começa o contador; `i <= 5` é a condição para continuar; `i++` soma 1 a cada volta.
- `soma` é o acumulador: 0 → 1 → 3 → 6 → 10 → 15.
- No `while`, a linha `n++` é essencial. Sem ela, `n` seria sempre 1 e o laço nunca terminaria.

## Erros comuns

- **Laço infinito**: esquecer de atualizar a variável da condição.
- **Erro de "um a mais/um a menos"**: usar `<` quando deveria ser `<=` (ou o contrário) faz o laço rodar uma vez a mais ou a menos. Faça um teste de mesa nas primeiras e últimas voltas.
- **Declarar o acumulador dentro do laço**: ele seria zerado a cada volta.

## Resumo

- `for` para quantidades conhecidas; `while` para condições.
- Todo laço precisa de uma condição que um dia fique falsa.
- Acumuladores guardam resultados ao longo das voltas.

## Próximo passo

Na próxima aula você vai organizar instruções em blocos reutilizáveis: as funções.

<!-- aula: funcoes -->
## Por que isso importa

Se você calcula um desconto em cinco lugares diferentes e a regra muda, terá de corrigir cinco vezes — e provavelmente vai esquecer um. Funções dão um nome a um conjunto de instruções e permitem reutilizá-lo. Elas são a principal ferramenta para organizar código.

## Conceitos fundamentais

- **Declarar** uma função é descrever o que ela faz; **chamar** é executá-la.
- **Parâmetros** são as entradas que a função recebe.
- **Argumentos** são os valores passados na chamada.
- **`return`** devolve um resultado e encerra a função.

Uma boa função faz **uma coisa** e tem um nome que descreve essa coisa, de preferência com um verbo: `calcularDesconto`, `formatarPreco`.

Também existe a sintaxe de **arrow function**, muito comum em código moderno:

```js
const dobrar = (numero) => numero * 2;
```

## Exemplo prático

```js
function calcularPrecoFinal(preco, percentualDesconto) {
  const desconto = preco * (percentualDesconto / 100);
  return preco - desconto;
}

const camiseta = calcularPrecoFinal(50, 10);
const tenis = calcularPrecoFinal(200, 25);

console.log(camiseta); // 45
console.log(tenis);    // 150
```

## Explicando o código

- `preco` e `percentualDesconto` são parâmetros.
- Na primeira chamada, os argumentos são `50` e `10`: o desconto é `5` e o retorno, `45`.
- A mesma regra serve para qualquer produto. Se a regra mudar, você altera um único lugar.
- A variável `desconto` só existe dentro da função (você vai entender o porquê na aula de escopo).

## Erros comuns

- **Esquecer o `return`**: a função executa, mas devolve `undefined`.
- **Escrever código depois do `return`**: ele nunca é executado.
- **Confundir declarar com chamar**: `calcularPrecoFinal` (sem parênteses) é a função em si; `calcularPrecoFinal(50, 10)` é a chamada.

## Resumo

- Funções agrupam instruções reutilizáveis com um nome.
- Parâmetros recebem valores; `return` devolve o resultado.
- Funções pequenas, com nomes claros, deixam o código fácil de manter.

## Próximo passo

A seguir, você vai aprender a guardar listas de valores com arrays.

<!-- aula: arrays -->
## Por que isso importa

Uma lista de compras, as notas de uma turma, as tarefas do dia: muitas informações vêm em grupos. Criar uma variável para cada item seria inviável. Arrays guardam vários valores em uma única variável, em ordem.

## Conceitos fundamentais

- Um array é escrito entre colchetes: `["arroz", "feijão", "café"]`.
- Cada item tem um **índice**, e a contagem **começa em 0**.
- `lista.length` informa quantos itens existem.
- `lista.push(item)` adiciona ao final.
- `lista.includes(item)` diz se o item está na lista.

Para percorrer todos os itens, use o laço `for...of`, que entrega um item por volta.

## Exemplo prático

```js
const notas = [8, 6.5, 9, 7];

let soma = 0;
for (const nota of notas) {
  soma = soma + nota;
}
const media = soma / notas.length;

console.log(notas[0]);      // 8
console.log(notas.length);  // 4
console.log(media);         // 7.625

notas.push(10);
console.log(notas.length);  // 5
```

## Explicando o código

- `notas[0]` acessa o **primeiro** item, porque o índice começa em 0. O último item fica em `notas[notas.length - 1]`.
- `for (const nota of notas)` percorre cada nota sem precisar de contador.
- A média divide a soma pela quantidade de itens, então funciona para listas de qualquer tamanho.
- `push` alterou o conteúdo do array mesmo ele sendo `const`: `const` impede trocar o array inteiro, não alterar seus itens.

## Erros comuns

- **Acessar `lista[lista.length]`**: esse índice não existe e devolve `undefined`.
- **Achar que o primeiro item é o índice 1**.
- **Dividir por zero com lista vazia**: `0 / 0` resulta em `NaN`. Verifique `length` antes.

## Resumo

- Arrays guardam valores em ordem; o índice começa em 0.
- `length`, `push` e `includes` são operações básicas.
- `for...of` percorre os itens de forma simples.

## Próximo passo

Na próxima aula você vai descrever coisas com várias características usando objetos.

<!-- aula: objetos -->
## Por que isso importa

Um aluno tem nome, idade e e-mail. Um produto tem nome, preço e estoque. Arrays guardam listas, mas para descrever **uma coisa com várias características**, usamos objetos. Eles são a base de como dados circulam em aplicações web.

## Conceitos fundamentais

Um objeto é um conjunto de pares **chave: valor** entre chaves:

```js
const aluno = { nome: "Bia", idade: 19 };
```

- Cada par é uma **propriedade**.
- Acesse com ponto: `aluno.nome`, ou com colchetes: `aluno["nome"]`.
- Adicione ou altere: `aluno.email = "bia@exemplo.com"`.
- Valores podem ser de qualquer tipo, inclusive arrays e outros objetos.

É muito comum ter **arrays de objetos**: uma lista de produtos, cada um com suas propriedades.

## Exemplo prático

```js
const carrinho = [
  { produto: "Caderno", preco: 25, quantidade: 2 },
  { produto: "Caneta", preco: 3.5, quantidade: 4 },
];

let total = 0;
for (const item of carrinho) {
  total = total + item.preco * item.quantidade;
}

console.log(`Total: R$ ${total.toFixed(2)}`); // Total: R$ 64.00
```

## Explicando o código

- `carrinho` é um array; cada item é um objeto com três propriedades.
- No laço, `item.preco * item.quantidade` calcula o subtotal de cada produto: 50 e 14.
- `total.toFixed(2)` formata o número com duas casas decimais, devolvendo o texto `"64.00"`.

## Erros comuns

- **Acessar uma propriedade que não existe**: devolve `undefined`, sem erro. Confira a grafia da chave.
- **Acessar uma propriedade de `undefined`**: `item.endereco.rua` quando `endereco` não existe gera `TypeError: Cannot read properties of undefined`.
- **Esquecer a vírgula entre propriedades**: gera `SyntaxError`.

## Resumo

- Objetos agrupam características de uma coisa em pares chave: valor.
- Use ponto para acessar e alterar propriedades.
- Arrays de objetos representam coleções, como carrinhos e listas de alunos.

## Próximo passo

Na próxima aula você vai entender onde cada variável "existe": o escopo.

<!-- aula: escopo -->
## Por que isso importa

Por que uma variável criada dentro de uma função não aparece fora dela? Por que duas funções podem ter variáveis com o mesmo nome sem conflito? A resposta é **escopo**. Entender escopo evita bugs difíceis e deixa o código mais organizado.

## Conceitos fundamentais

Escopo é a região do código onde um nome (variável ou função) pode ser usado.

- **Escopo global**: declarado fora de qualquer bloco; visível em todo o arquivo.
- **Escopo de função**: declarado dentro de uma função; só existe lá dentro.
- **Escopo de bloco**: `let` e `const` declarados dentro de `{ }` (como em `if` e `for`) só existem naquele bloco.

Regra de busca: quando o código usa um nome, JavaScript procura primeiro no escopo atual e depois nos escopos de fora, até chegar ao global. O de dentro enxerga o de fora; o de fora **não** enxerga o de dentro.

## Exemplo prático

```js
const taxa = 0.1; // global

function calcularImposto(valor) {
  const imposto = valor * taxa; // enxerga "taxa" de fora
  return imposto;
}

console.log(calcularImposto(200)); // 20

if (true) {
  const mensagem = "dentro do bloco";
  console.log(mensagem); // funciona
}

// console.log(imposto);  // ReferenceError: imposto is not defined
// console.log(mensagem); // ReferenceError: mensagem is not defined
```

## Explicando o código

- `taxa` é global, então a função consegue usá-la.
- `imposto` nasce e morre dentro de `calcularImposto`.
- `mensagem` só existe dentro do bloco do `if`.
- As duas últimas linhas estão comentadas porque gerariam erro: os nomes não existem naquele ponto.

## Erros comuns

- **Depender de variáveis globais demais**: qualquer parte do código pode alterá-las, e bugs ficam difíceis de rastrear. Prefira passar valores por parâmetros.
- **Declarar o acumulador dentro do laço** e tentar usá-lo depois.
- **"Sombrear" variáveis**: declarar dentro de uma função um nome igual ao de fora esconde o de fora e confunde a leitura.

## Resumo

- Escopo define onde um nome pode ser usado.
- Escopos internos enxergam os externos, nunca o contrário.
- Prefira variáveis no menor escopo possível.

## Próximo passo

Na próxima aula você vai aprender a investigar erros de forma sistemática: depuração.

<!-- aula: depuracao -->
## Por que isso importa

Todo mundo que programa escreve bugs. O que diferencia uma pessoa experiente não é errar menos, e sim **encontrar o erro mais rápido**. Depurar é um processo, não sorte.

## Conceitos fundamentais

Existem dois grandes tipos de erro:

- **Erros de sintaxe ou execução**: o programa para e mostra uma mensagem. Ex.: `ReferenceError`, `TypeError`, `SyntaxError`.
- **Erros de lógica**: o programa roda, mas o resultado está errado. São os mais traiçoeiros.

Como ler uma mensagem de erro:

1. **Tipo do erro**: `TypeError`, `ReferenceError`...
2. **Mensagem**: o que deu errado, ex.: `x is not defined`.
3. **Local**: arquivo e número da linha.

Um processo de depuração em cinco passos:

1. **Reproduza** o erro de forma consistente.
2. **Leia** a mensagem inteira.
3. **Formule uma hipótese**: "acho que o valor chega como texto".
4. **Teste a hipótese** com `console.log` ou com o depurador do navegador (pontos de parada na aba *Sources/Fontes*).
5. **Corrija uma coisa por vez** e teste de novo.

## Exemplo prático

O código abaixo deveria mostrar `30`, mas mostra `1020`:

```js
const precoA = "10";
const precoB = 20;
console.log(precoA + precoB); // "1020"
```

Investigando com `console.log`:

```js
console.log(typeof precoA, typeof precoB); // "string" "number"
```

Correção:

```js
console.log(Number(precoA) + precoB); // 30
```

## Explicando o código

- A hipótese era que um dos valores fosse texto. `typeof` confirmou: `precoA` é string.
- Com um texto no `+`, JavaScript concatena em vez de somar.
- Converter com `Number` resolve a causa, não apenas o sintoma.

## Erros comuns

- **Mudar várias coisas ao mesmo tempo**: se funcionar, você não sabe o que resolveu; se piorar, não sabe o que quebrou.
- **Ignorar a linha indicada no erro**: ela é o melhor ponto de partida.
- **Deixar `console.log` de depuração no código final**: remova depois de resolver.

## Resumo

- Erros de execução mostram mensagens; erros de lógica exigem investigação.
- Leia tipo, mensagem e linha do erro.
- Depure com hipóteses e teste uma mudança por vez.

## Próximo passo

Na última aula desta trilha, você vai juntar tudo para resolver um problema completo, do enunciado ao código.

<!-- aula: resolvendo-problemas -->
## Por que isso importa

Saber cada conceito isoladamente não basta: programar é **combinar** variáveis, condicionais, laços, funções e estruturas de dados para resolver um problema real. Nesta aula, você acompanha esse processo completo.

## Conceitos fundamentais

Um roteiro para resolver qualquer problema de programação:

1. **Entenda o problema**: reescreva o enunciado com suas palavras. Quais são as entradas? Qual é a saída esperada?
2. **Crie exemplos**: escolha entradas e calcule à mão o resultado esperado, incluindo casos-limite.
3. **Decomponha**: divida em passos pequenos.
4. **Escreva pseudocódigo**.
5. **Traduza para código**, um passo por vez, testando.
6. **Revise**: o código é legível? Os nomes fazem sentido?

## Exemplo prático

**Problema**: dada uma lista de temperaturas da semana, informe a média, a maior temperatura e quantos dias passaram de 30 °C.

Exemplo à mão: para `[28, 31, 33, 25, 30]`, a média é 29,4, a maior é 33 e houve 2 dias acima de 30 (31 e 33; 30 não é *acima* de 30).

```js
function analisarTemperaturas(temperaturas) {
  if (temperaturas.length === 0) {
    return null;
  }

  let soma = 0;
  let maior = temperaturas[0];
  let diasQuentes = 0;

  for (const t of temperaturas) {
    soma = soma + t;
    if (t > maior) {
      maior = t;
    }
    if (t > 30) {
      diasQuentes++;
    }
  }

  return {
    media: soma / temperaturas.length,
    maior: maior,
    diasQuentes: diasQuentes,
  };
}

console.log(analisarTemperaturas([28, 31, 33, 25, 30]));
// { media: 29.4, maior: 33, diasQuentes: 2 }
```

## Explicando o código

- O primeiro `if` trata o caso-limite de lista vazia, evitando dividir por zero.
- `maior` começa com o **primeiro item**, e não com 0: se todas as temperaturas fossem negativas, começar em 0 daria uma resposta errada.
- Um único laço calcula as três informações.
- A função devolve um **objeto**, agrupando os três resultados com nomes claros.

## Erros comuns

- **Começar a codar antes de ter exemplos**: sem saber o resultado esperado, você não sabe se acertou.
- **Inicializar o "maior" com 0**: falha com valores negativos.
- **Ignorar casos-limite**: lista vazia, um único item, valores iguais.

## Resumo

- Entenda, crie exemplos, decomponha, escreva pseudocódigo, codifique e revise.
- Casos-limite revelam a maioria dos bugs.
- Funções que devolvem objetos organizam resultados múltiplos.

## Próximo passo

Você concluiu a base da lógica de programação. O próximo passo recomendado é o curso de **HTML**, onde você começa a construir páginas para a web.
