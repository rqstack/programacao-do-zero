<!-- aula: js-variaveis-tipos-e-strings -->
## Por que isso importa

Na trilha de lógica você usou JavaScript para aprender a pensar. Agora ele passa a ser uma ferramenta de trabalho: a linguagem que dá comportamento às páginas. Começamos ligando o JavaScript a um HTML e dominando o tipo de dado mais usado em interfaces: o texto.

## Conceitos fundamentais

**Ligando o script à página**: coloque o arquivo no fim do `<body>` ou use `defer` no `<head>`, para que o HTML seja lido antes de o script rodar:

```html
<script src="app.js" defer></script>
```

**Revisão rápida**: `const` por padrão, `let` quando o valor muda; tipos primitivos `string`, `number`, `boolean`, `undefined`, `null` (e também `bigint` e `symbol`, menos comuns).

**Strings** têm métodos úteis — funções que você chama com ponto:

- `texto.length`: quantidade de caracteres.
- `texto.toUpperCase()` / `toLowerCase()`: maiúsculas/minúsculas.
- `texto.trim()`: remove espaços das pontas.
- `texto.includes("abc")`: contém o trecho?
- `texto.startsWith("a")`, `endsWith("z")`.
- `texto.replace("a", "b")` e `replaceAll`.
- `texto.split(",")`: quebra em um array.
- `texto.slice(0, 3)`: recorta um trecho.

Strings são **imutáveis**: os métodos devolvem uma nova string, sem alterar a original.

## Exemplo prático

```js
const entrada = "  Maria Clara Souza  ";
const nome = entrada.trim();

const partes = nome.split(" ");
const primeiroNome = partes[0];
const iniciais = partes.map((p) => p[0]).join("");

console.log(nome.length);          // 17
console.log(primeiroNome);         // "Maria"
console.log(iniciais);             // "MCS"
console.log(nome.toUpperCase());   // "MARIA CLARA SOUZA"
console.log(`Olá, ${primeiroNome}!`);
```

## Explicando o código

- `trim()` remove os espaços extras digitados por engano — algo muito comum em formulários.
- `split(" ")` cria o array `["Maria", "Clara", "Souza"]`.
- `p[0]` acessa o primeiro caractere de cada parte; `map` aplica isso a cada item e `join("")` junta tudo. Você vai estudar `map` em detalhes na aula de métodos de array.
- `entrada` continua com os espaços: os métodos não alteram a string original.

## Erros comuns

- **Esperar que `nome.toUpperCase()` altere `nome`**: guarde o resultado em uma variável.
- **Esquecer os parênteses**: `nome.toUpperCase` (sem `()`) é a função, não o resultado.
- **Comparar textos sem normalizar**: `"Ana" === "ana"` é `false`. Use `toLowerCase()` nos dois lados quando a diferença de maiúsculas não importar.

## Resumo

- Ligue scripts com `defer` ou no fim do `<body>`.
- Strings têm métodos como `trim`, `split`, `includes` e `slice`.
- Métodos de string devolvem novas strings.

## Próximo passo

A seguir: decisões em JavaScript com valores "truthy" e "falsy", ternário, `switch`, `?.` e `??`.

<!-- aula: js-condicionais-e-operadores -->
## Por que isso importa

Em interfaces reais, os dados chegam incompletos: um usuário sem foto, um produto sem desconto, uma resposta de API sem certo campo. JavaScript tem operadores feitos para lidar com isso de forma segura e curta, evitando o famoso erro "Cannot read properties of undefined".

## Conceitos fundamentais

**Truthy e falsy**: em uma condição, todo valor é convertido para verdadeiro ou falso. Os valores **falsy** são: `false`, `0`, `""` (texto vazio), `null`, `undefined` e `NaN`. Todo o resto é **truthy** — inclusive `"0"`, `[]` e `{}`.

**Operadores para valores ausentes**:

- `a ?? b` (coalescência nula): usa `b` **apenas** se `a` for `null` ou `undefined`.
- `a || b`: usa `b` se `a` for **qualquer** falsy (inclusive `0` e `""`).
- `obj?.prop` (encadeamento opcional): se `obj` for `null`/`undefined`, devolve `undefined` em vez de lançar erro.

**Ternário**: `condicao ? seVerdadeiro : seFalso`.

**`switch`**: compara um valor com vários casos usando `===`. Cada caso precisa de `break`, senão a execução "cai" no próximo.

## Exemplo prático

```js
const usuario = {
  nome: "Leo",
  endereco: null,
  preferencias: { tema: "escuro", volume: 0 },
};

const cidade = usuario.endereco?.cidade ?? "Cidade não informada";
const volumeErrado = usuario.preferencias.volume || 50;
const volumeCerto = usuario.preferencias.volume ?? 50;

console.log(cidade);        // "Cidade não informada"
console.log(volumeErrado);  // 50
console.log(volumeCerto);   // 0

const status = "pago";
switch (status) {
  case "pendente":
    console.log("Aguardando pagamento");
    break;
  case "pago":
    console.log("Pagamento confirmado");
    break;
  default:
    console.log("Status desconhecido");
}
```

## Explicando o código

- `usuario.endereco?.cidade`: como `endereco` é `null`, o resultado é `undefined`, sem erro; o `??` troca por um texto padrão.
- O volume configurado é `0`. Com `||`, ele é tratado como "ausente" e vira 50 — um bug. Com `??`, o 0 é respeitado.
- O `switch` executa o caso `"pago"` e para no `break`.

## Erros comuns

- **Usar `||` para valores padrão quando 0 ou "" são válidos**: prefira `??`.
- **Achar que `[]` é falsy**: um array vazio é truthy. Para verificar se está vazio, use `lista.length === 0`.
- **Esquecer o `break`** no `switch`.

## Resumo

- Falsy: `false`, `0`, `""`, `null`, `undefined`, `NaN`.
- `??` para valores padrão; `?.` para acessar propriedades que podem não existir.
- `switch` compara com `===` e precisa de `break`.

## Próximo passo

Na próxima aula você vai repetir tarefas sobre listas de dados com laços e arrays em JavaScript.

<!-- aula: js-lacos-e-arrays -->
## Por que isso importa

Listas de produtos, mensagens, tarefas, resultados de busca: quase toda interface exibe coleções. Saber percorrer e modificar arrays é o que permite transformar dados em conteúdo na tela.

## Conceitos fundamentais

**Laços em JavaScript**:

- `for (let i = 0; i < lista.length; i++)`: quando você precisa do índice.
- `for (const item of lista)`: o mais legível para percorrer itens.
- `while`: repete enquanto uma condição for verdadeira.
- `break` sai do laço; `continue` pula para a próxima volta.

**Operações essenciais em arrays**:

- Adicionar: `push` (fim), `unshift` (início).
- Remover: `pop` (fim), `shift` (início), `splice(indice, quantidade)` (do meio).
- Buscar: `indexOf(valor)` (devolve -1 se não achar), `includes(valor)`.
- Copiar: `[...lista]` (spread) ou `lista.slice()`.

`push`, `pop`, `shift`, `unshift` e `splice` **alteram** o array original. Isso importa muito em React, como você verá no curso dedicado.

## Exemplo prático

```js
const tarefas = ["Estudar CSS", "Fazer exercícios", "Revisar Git"];

tarefas.push("Ler documentação");
tarefas.shift();

for (let i = 0; i < tarefas.length; i++) {
  console.log(`${i + 1}. ${tarefas[i]}`);
}

const indice = tarefas.indexOf("Revisar Git");
if (indice !== -1) {
  tarefas.splice(indice, 1);
}

console.log(tarefas); // ["Fazer exercícios", "Ler documentação"]
```

Saída do laço:

```texto
1. Fazer exercícios
2. Revisar Git
3. Ler documentação
```

## Explicando o código

- `push` adiciona ao fim e `shift` remove "Estudar CSS" do início.
- O `for` com índice permite numerar a lista começando em 1 (`i + 1`).
- `indexOf` encontra a posição; a verificação `!== -1` evita remover o item errado quando ele não existe — `splice(-1, 1)` removeria o **último** item!

## Erros comuns

- **Não checar o `-1` do `indexOf`** antes de usar `splice`.
- **Remover itens dentro de um `for` crescente**: os índices "andam" e itens são pulados. Prefira criar um novo array filtrado (próximas aulas).
- **Copiar com `const copia = lista`**: isso copia a referência; alterar a "cópia" altera o original. Use `[...lista]`.

## Resumo

- Use `for...of` para itens e `for` clássico quando precisar do índice.
- Conheça os métodos que alteram o array original.
- Copie arrays com spread para não alterar o original sem querer.

## Próximo passo

A seguir, funções em profundidade: arrow functions, parâmetros padrão, callbacks e funções puras.

<!-- aula: js-funcoes -->
## Por que isso importa

Em JavaScript, funções são valores: podem ser guardadas em variáveis, passadas para outras funções e devolvidas como resultado. Esse recurso está por trás de eventos, métodos de array, Promises e React. Dominar funções é dominar o estilo da linguagem.

## Conceitos fundamentais

Formas de criar funções:

```js
function somar(a, b) { return a + b; }        // declaração
const subtrair = function (a, b) { return a - b; }; // expressão
const multiplicar = (a, b) => a * b;          // arrow function
```

- Arrow functions com uma única expressão devolvem o valor sem `return`.
- **Parâmetros padrão**: `function saudar(nome = "visitante")`.
- **Rest parameters**: `function somarTodos(...numeros)` recebe quantos argumentos vierem, em um array.
- **Callback**: função passada como argumento para outra função chamar depois.
- **Função pura**: com as mesmas entradas, devolve sempre a mesma saída e não altera nada fora dela. É mais fácil de testar e de reutilizar.

Declarações com `function` podem ser chamadas antes da linha em que aparecem (**hoisting**); funções em `const` não.

## Exemplo prático

```js
const formatarPreco = (valor, moeda = "BRL") =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: moeda });

function somarTodos(...numeros) {
  let total = 0;
  for (const n of numeros) total += n;
  return total;
}

function aplicarAosItens(itens, transformar) {
  const resultado = [];
  for (const item of itens) {
    resultado.push(transformar(item));
  }
  return resultado;
}

console.log(somarTodos(10, 20, 5));                  // 35
console.log(aplicarAosItens([1, 2, 3], (n) => n * 10)); // [10, 20, 30]
console.log(formatarPreco(1999.9));                  // "R$ 1.999,90"
```

## Explicando o código

- `formatarPreco` usa `toLocaleString` para formatar no padrão brasileiro; `moeda` tem valor padrão.
- `...numeros` junta os argumentos em um array.
- `aplicarAosItens` recebe uma função (`transformar`) e a chama para cada item: isso é um callback. É exatamente o que `map` faz por baixo dos panos.
- As três funções são puras: não alteram nada externo.

> Observação: a formatação de moeda usa um espaço especial (não separável) entre "R$" e o número, então comparar esse texto com um que tenha espaço comum pode dar diferente.

## Erros comuns

- **Arrow function com chaves sem `return`**: `(n) => { n * 2 }` devolve `undefined`. Use `(n) => n * 2` ou escreva o `return`.
- **Passar o resultado em vez da função**: `aplicarAosItens(lista, dobrar())` chama `dobrar` na hora. O correto é `aplicarAosItens(lista, dobrar)`.
- **Funções que fazem coisas demais**: divida em funções menores com nomes claros.

## Resumo

- Funções são valores: podem ser passadas e devolvidas.
- Arrow functions, parâmetros padrão e rest deixam o código conciso.
- Prefira funções puras sempre que possível.

## Próximo passo

Na próxima aula você vai usar os métodos de array que recebem callbacks: `map`, `filter`, `reduce` e companhia.

<!-- aula: metodos-de-array -->
## Por que isso importa

Filtrar produtos por categoria, calcular o total de um carrinho, transformar dados de uma API no formato que a tela precisa: os métodos de array resolvem isso em poucas linhas, sem alterar o array original. Eles são onipresentes em código JavaScript profissional e no React.

## Conceitos fundamentais

- `map(fn)`: **transforma** cada item; devolve um array do mesmo tamanho.
- `filter(fn)`: **seleciona** os itens para os quais `fn` devolve verdadeiro.
- `find(fn)`: devolve o **primeiro** item que atende à condição (ou `undefined`).
- `some(fn)` / `every(fn)`: algum / todos atendem?
- `reduce(fn, inicial)`: **acumula** tudo em um único valor.
- `sort(fn)`: ordena — e **altera** o array original. `toSorted(fn)` devolve uma cópia ordenada (disponível nos navegadores atuais).
- `forEach(fn)`: só percorre; não devolve nada.

Esses métodos podem ser **encadeados**: o resultado de um é o array do próximo.

## Exemplo prático

```js
const produtos = [
  { nome: "Teclado", preco: 150, categoria: "periferico", estoque: 3 },
  { nome: "Monitor", preco: 900, categoria: "tela", estoque: 0 },
  { nome: "Mouse", preco: 80, categoria: "periferico", estoque: 10 },
];

const disponiveis = produtos.filter((p) => p.estoque > 0);
const nomes = disponiveis.map((p) => p.nome);
const total = disponiveis.reduce((soma, p) => soma + p.preco, 0);
const temTela = produtos.some((p) => p.categoria === "tela");
const mouse = produtos.find((p) => p.nome === "Mouse");
const porPreco = [...produtos].sort((a, b) => a.preco - b.preco).map((p) => p.nome);

console.log(nomes);      // ["Teclado", "Mouse"]
console.log(total);      // 230
console.log(temTela);    // true
console.log(mouse.preco); // 80
console.log(porPreco);   // ["Mouse", "Teclado", "Monitor"]
```

## Explicando o código

- `filter` remove o monitor sem estoque.
- `map` transforma objetos em nomes.
- `reduce` começa com `0` e soma cada preço: 150 + 80 = 230.
- `sort((a, b) => a.preco - b.preco)` ordena do mais barato ao mais caro. A cópia com `[...produtos]` evita alterar o array original.

## Erros comuns

- **Usar `map` só para percorrer**: se não vai usar o array retornado, use `for...of` ou `forEach`.
- **Esquecer o valor inicial do `reduce`**: com array vazio, isso gera erro.
- **Ordenar números sem função de comparação**: `[10, 9, 1].sort()` resulta em `[1, 10, 9]`, porque compara como texto.
- **`sort` alterando dados sem querer**: copie antes ou use `toSorted`.

## Resumo

- `map` transforma, `filter` seleciona, `reduce` acumula, `find` busca.
- Encadeie métodos para pipelines legíveis.
- `sort` altera o original e precisa de comparador para números.

## Próximo passo

A seguir: objetos em profundidade, desestruturação, spread e JSON.

<!-- aula: objetos-e-desestruturacao -->
## Por que isso importa

Dados de APIs, configurações, estado de componentes: tudo isso chega como objetos. Desestruturação e spread deixam o código que manipula esses dados curto e claro, e JSON é o formato com que eles viajam pela internet.

## Conceitos fundamentais

- **Atalho de propriedade**: `{ nome, idade }` equivale a `{ nome: nome, idade: idade }`.
- **Métodos**: funções dentro de objetos, como `{ saudar() { ... } }`.
- **Desestruturação**: extrai propriedades para variáveis:

```js
const { nome, idade = 18 } = pessoa;
const [primeiro, segundo] = lista;
```

- **Spread em objetos**: `{ ...original, campo: novoValor }` cria uma **cópia** com alterações. A cópia é **rasa**: objetos internos continuam compartilhados.
- `Object.keys(obj)`, `Object.values(obj)`, `Object.entries(obj)`: transformam objetos em arrays para percorrer.
- **JSON** (JavaScript Object Notation): formato de texto para trocar dados. `JSON.stringify(obj)` converte objeto em texto; `JSON.parse(texto)` faz o contrário. Em JSON, as chaves usam aspas duplas e não há funções.

## Exemplo prático

```js
const pedido = {
  id: 42,
  cliente: { nome: "Rita", email: "rita@exemplo.com" },
  itens: [{ produto: "Livro", qtd: 2 }],
  status: "pendente",
};

const { id, cliente: { nome }, status } = pedido;
console.log(id, nome, status); // 42 "Rita" "pendente"

const atualizado = { ...pedido, status: "pago" };
console.log(pedido.status, atualizado.status); // "pendente" "pago"

for (const [chave, valor] of Object.entries({ a: 1, b: 2 })) {
  console.log(chave, valor);
}

const texto = JSON.stringify({ id, status: atualizado.status });
console.log(texto);                    // {"id":42,"status":"pago"}
console.log(JSON.parse(texto).status); // "pago"
```

## Explicando o código

- A desestruturação extrai `id`, `status` e, de dentro de `cliente`, o `nome`.
- O spread cria `atualizado` sem alterar `pedido` — essencial para trabalhar com estado imutável.
- `Object.entries` devolve pares `[chave, valor]`, desestruturados no próprio `for...of`.
- `JSON.stringify` gera o texto que seria enviado a uma API; `JSON.parse` lê de volta.

## Erros comuns

- **Achar que o spread copia tudo em profundidade**: `atualizado.cliente` é o mesmo objeto de `pedido.cliente`.
- **`JSON.parse` em texto inválido**: lança `SyntaxError`. Trate com `try/catch` quando o texto vier de fora.
- **Desestruturar de `undefined`**: `const { a } = undefined` gera `TypeError`. Use valor padrão: `const { a } = obj ?? {}`.

## Resumo

- Desestruturação extrai valores; spread copia e altera sem mutar o original.
- `Object.entries` permite percorrer objetos.
- JSON é texto: `stringify` para enviar, `parse` para ler.

## Próximo passo

Na próxima aula você vai entender escopo em profundidade e um dos conceitos mais poderosos da linguagem: closures.

<!-- aula: escopo-e-closures -->
## Por que isso importa

Closures parecem um tema avançado, mas você já as usa sem perceber em eventos, temporizadores e React. Entendê-las explica por que uma função "lembra" de valores mesmo depois de outra função ter terminado, e permite criar dados privados.

## Conceitos fundamentais

- **Escopo léxico**: o escopo de uma função é definido **onde ela foi escrita**, não onde é chamada.
- **Closure**: uma função junto com as variáveis do escopo em que foi criada. Mesmo depois de a função externa terminar, a interna continua acessando aquelas variáveis.
- **Dados privados**: variáveis dentro de uma função externa não podem ser alteradas de fora; só pelas funções internas que você devolve.
- **Fábricas de funções**: funções que criam outras funções configuradas.

## Exemplo prático

```js
function criarContador(inicial = 0) {
  let valor = inicial;
  return {
    incrementar() {
      valor += 1;
      return valor;
    },
    atual() {
      return valor;
    },
  };
}

const visitas = criarContador();
visitas.incrementar();
visitas.incrementar();
console.log(visitas.atual()); // 2

const outro = criarContador(10);
console.log(outro.incrementar()); // 11
console.log(visitas.atual());     // 2

function criarMultiplicador(fator) {
  return (numero) => numero * fator;
}
const dobrar = criarMultiplicador(2);
const triplicar = criarMultiplicador(3);
console.log(dobrar(5), triplicar(5)); // 10 15
```

## Explicando o código

- `criarContador` termina de executar, mas `incrementar` e `atual` continuam enxergando `valor`: isso é a closure.
- Cada chamada de `criarContador` cria um `valor` independente; `visitas` e `outro` não interferem um no outro.
- Não há como alterar `valor` diretamente de fora: ele é privado.
- `criarMultiplicador` é uma fábrica: cada função gerada lembra do seu `fator`.

## Erros comuns

- **Esperar que a closure "congele" o valor**: ela guarda a **variável**, não uma cópia. Se a variável mudar, a função vê o novo valor.
- **Usar `var` em laços com funções assíncronas**: todas as funções compartilham a mesma variável. Com `let`, cada volta tem a sua.
- **Criar closures sem necessidade** em código simples: use quando houver um motivo real (estado privado, configuração).

## Resumo

- O escopo é definido onde a função é escrita.
- Closures permitem que funções lembrem de variáveis externas.
- São úteis para estado privado e fábricas de funções.

## Próximo passo

Agora é hora de conectar JavaScript à página: manipulação do DOM.

<!-- aula: dom -->
## Por que isso importa

Até aqui, seus programas mostravam resultados no console. Quem usa um site, porém, só vê a página. O **DOM** é a ponte: ele permite ler e alterar o HTML com JavaScript — mostrar mensagens, criar itens de lista, trocar classes.

## Conceitos fundamentais

O **DOM** (Document Object Model) é a representação do HTML como uma árvore de objetos que o JavaScript pode manipular.

- **Selecionar**: `document.querySelector(".classe")` (primeiro elemento) e `document.querySelectorAll("li")` (todos).
- **Ler e alterar texto**: `elemento.textContent`.
- **Classes**: `elemento.classList.add("ativo")`, `remove`, `toggle`, `contains`.
- **Atributos**: `elemento.setAttribute("aria-expanded", "true")`, `elemento.hidden = true`.
- **Criar e inserir**: `document.createElement("li")` e `lista.append(item)`.
- **Remover**: `elemento.remove()`.

**Segurança**: prefira `textContent` a `innerHTML`. `innerHTML` interpreta o texto como HTML; se ele contiver dados digitados por alguém, um código malicioso pode ser executado (ataque de **XSS**).

## Exemplo prático

```html
<ul id="lista"></ul>
<p class="vazio">Nenhuma tarefa ainda.</p>
```

```js
const lista = document.querySelector("#lista");
const vazio = document.querySelector(".vazio");
const tarefas = ["Estudar DOM", "Praticar eventos"];

function renderizar() {
  lista.replaceChildren();
  for (const texto of tarefas) {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.append(item);
  }
  vazio.hidden = tarefas.length > 0;
}

renderizar();
```

## Explicando o código

- `querySelector` usa a mesma sintaxe de seletores do CSS.
- `replaceChildren()` limpa a lista antes de desenhar de novo, evitando itens duplicados.
- Cada tarefa vira um `<li>` criado com `createElement` e preenchido com `textContent` (seguro contra XSS).
- A mensagem "Nenhuma tarefa ainda" fica oculta quando há tarefas — um **estado vazio** bem tratado.

## Erros comuns

- **`querySelector` devolvendo `null`**: o seletor está errado ou o script rodou antes do HTML existir. Use `defer`.
- **Usar `innerHTML` com dados do usuário**: risco de XSS.
- **Esquecer de limpar antes de renderizar de novo**: itens aparecem repetidos.

## Resumo

- O DOM é o HTML como objetos manipuláveis.
- `querySelector`, `textContent`, `classList` e `createElement` resolvem a maioria dos casos.
- Prefira `textContent` para evitar XSS.

## Próximo passo

Na próxima aula você vai fazer a página reagir a cliques, digitação e envios de formulário com eventos.

<!-- aula: eventos -->
## Por que isso importa

Uma interface só é interativa porque reage ao que a pessoa faz: clicar, digitar, enviar, pressionar uma tecla. Eventos são o mecanismo que conecta essas ações ao seu código.

## Conceitos fundamentais

- `elemento.addEventListener("click", funcao)`: registra uma função para ser chamada quando o evento acontecer.
- **Objeto de evento**: a função recebe informações, como `evento.target` (onde aconteceu) e `evento.key` (tecla pressionada).
- Eventos comuns: `click`, `input` (a cada digitação), `change`, `submit`, `keydown`.
- `evento.preventDefault()`: impede o comportamento padrão, como o recarregamento da página ao enviar um formulário.
- **Propagação (bubbling)**: o evento sobe do elemento clicado até os ancestrais.
- **Delegação de eventos**: em vez de um ouvinte por item, coloque um só no pai e descubra o item clicado com `evento.target.closest(...)`. Funciona inclusive para itens criados depois.

## Exemplo prático

```html
<form id="form-tarefa">
  <label for="tarefa">Nova tarefa</label>
  <input id="tarefa" name="tarefa" required>
  <button type="submit">Adicionar</button>
</form>
<ul id="lista"></ul>
```

```js
const form = document.querySelector("#form-tarefa");
const lista = document.querySelector("#lista");

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const campo = form.elements.tarefa;
  const texto = campo.value.trim();
  if (!texto) return;

  const item = document.createElement("li");
  item.textContent = texto;
  const remover = document.createElement("button");
  remover.type = "button";
  remover.textContent = "Remover";
  remover.dataset.acao = "remover";
  item.append(" ", remover);
  lista.append(item);

  form.reset();
  campo.focus();
});

lista.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-acao='remover']");
  if (botao) {
    botao.closest("li").remove();
  }
});
```

## Explicando o código

- `preventDefault()` evita o recarregamento da página no envio.
- `trim()` impede tarefas formadas só de espaços.
- O botão "Remover" recebe `data-acao`, um atributo de dados personalizado.
- Um único ouvinte na lista atende a todos os botões, inclusive os criados depois (delegação).
- Após adicionar, o formulário é limpo e o foco volta ao campo — detalhe que melhora a experiência de quem usa teclado.

## Erros comuns

- **Chamar a função ao registrar**: `addEventListener("click", salvar())` executa `salvar` na hora. Passe `salvar`, sem parênteses.
- **Esquecer o `preventDefault()` no `submit`**: a página recarrega e os dados somem.
- **Ouvir `click` em `<div>`** em vez de usar `<button>`: perde-se a acessibilidade de teclado.

## Resumo

- `addEventListener` conecta ações a funções.
- `preventDefault` controla comportamentos padrão; `target` e `closest` identificam a origem.
- Delegação simplifica listas dinâmicas.

## Próximo passo

Seu código está crescendo. Na próxima aula você vai organizá-lo em módulos.

<!-- aula: modulos -->
## Por que isso importa

Um único arquivo com mil linhas é difícil de entender e de manter. Módulos permitem dividir o código em arquivos com responsabilidades claras, que importam apenas o que precisam. Todo projeto moderno — inclusive React e Node.js — funciona assim.

## Conceitos fundamentais

- **Exportar**: torna algo disponível para outros arquivos.
  - Nomeado: `export function formatar() {}` — pode haver vários por arquivo.
  - Padrão: `export default function App() {}` — no máximo um por arquivo.
- **Importar**:
  - `import { formatar } from "./utils.js";` (nomeado, com o mesmo nome).
  - `import App from "./App.js";` (padrão, com o nome que você escolher).
  - `import * as utils from "./utils.js";` (tudo como um objeto).
- No navegador, use `<script type="module" src="main.js"></script>`. Módulos já são executados como `defer` e cada um tem seu próprio escopo.
- Os caminhos relativos precisam da extensão (`./utils.js`) no navegador.
- Módulos não funcionam abrindo o arquivo com duplo clique (`file://`); use um servidor local, como a extensão Live Server do VS Code.

## Exemplo prático

`utils.js`:

```js
export function formatarData(data) {
  return data.toLocaleDateString("pt-BR");
}

export const LIMITE_TAREFAS = 50;
```

`main.js`:

```js
import { formatarData, LIMITE_TAREFAS } from "./utils.js";

const hoje = formatarData(new Date());
console.log(`Hoje é ${hoje}. Limite: ${LIMITE_TAREFAS} tarefas.`);
```

`index.html`:

```html
<script type="module" src="main.js"></script>
```

## Explicando o código

- `utils.js` exporta uma função e uma constante; ele não sabe quem vai usá-las.
- `main.js` importa só o que precisa, pelo nome exato.
- `toLocaleDateString("pt-BR")` formata a data no padrão dia/mês/ano.

## Erros comuns

- **Esquecer `type="module"`**: o navegador acusa `Cannot use import statement outside a module`.
- **Abrir pelo `file://`**: o navegador bloqueia o carregamento por segurança (CORS).
- **Errar o nome em importações nomeadas**: `import { formatardata }` (minúsculo) não encontra nada.
- **Dependências circulares**: A importa B, que importa A. Reorganize extraindo a parte comum.

## Resumo

- `export` disponibiliza; `import` consome.
- Use `type="module"` e um servidor local.
- Cada arquivo deve ter uma responsabilidade clara.

## Próximo passo

A seguir: código assíncrono com Promises, async/await e a busca de dados em APIs com fetch.

<!-- aula: promises-async-await-e-fetch -->
## Por que isso importa

Buscar dados de um servidor leva tempo. Se o navegador parasse tudo esperando a resposta, a página congelaria. JavaScript resolve isso com código **assíncrono**: você pede os dados e continua; quando a resposta chega, seu código trata o resultado. É assim que aplicações consomem APIs.

## Conceitos fundamentais

- **API**: uma interface que um sistema oferece para outros conversarem com ele. Na web, normalmente são endereços (URLs) que devolvem dados em JSON.
- **Promise**: um objeto que representa um valor que vai chegar no futuro. Ela pode ser **resolvida** (sucesso) ou **rejeitada** (erro).
- **`async`/`await`**: forma legível de trabalhar com Promises. `await` pausa **apenas aquela função** até a Promise terminar; o resto da página continua funcionando.
- **`fetch(url)`**: faz uma requisição HTTP e devolve uma Promise com a resposta.
- `resposta.ok` é `true` para status 200–299. **O `fetch` não rejeita em erros HTTP** como 404 ou 500 — só em falhas de rede. Você precisa verificar `ok`.
- `await resposta.json()` converte o corpo em objeto.
- `Promise.all([...])` espera várias Promises em paralelo.

Estados de interface: toda busca tem **carregando**, **sucesso**, **vazio** e **erro**. Trate os quatro.

## Exemplo prático

```js
async function carregarUsuarios() {
  const status = document.querySelector("#status");
  status.textContent = "Carregando...";

  try {
    const resposta = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!resposta.ok) {
      throw new Error(`Falha na requisição: ${resposta.status}`);
    }
    const usuarios = await resposta.json();

    if (usuarios.length === 0) {
      status.textContent = "Nenhum usuário encontrado.";
      return;
    }
    status.textContent = `${usuarios.length} usuários carregados.`;
    return usuarios.map((u) => u.name);
  } catch (erro) {
    status.textContent = "Não foi possível carregar. Verifique sua conexão e tente de novo.";
    console.error(erro);
  }
}

carregarUsuarios().then((nomes) => console.log(nomes));
```

## Explicando o código

- O texto "Carregando..." aparece antes da resposta chegar.
- `await fetch(...)` espera a resposta sem travar a página. A API usada, JSONPlaceholder, é pública e serve para testes.
- Se o status não for de sucesso, o código lança um erro de propósito, para cair no `catch`.
- O `catch` trata falhas de rede e erros HTTP, mostrando uma mensagem útil para a pessoa usuária.
- Funções `async` sempre devolvem uma Promise; por isso usamos `.then` para ler o resultado de fora.

## Erros comuns

- **Esquecer o `await`**: você recebe uma Promise pendente em vez dos dados.
- **Não verificar `resposta.ok`**: uma página de erro 404 é tratada como sucesso.
- **Usar `await` fora de função `async`** em scripts comuns.
- **Fazer requisições em sequência sem necessidade**: se uma não depende da outra, use `Promise.all`.

## Resumo

- Código assíncrono evita congelar a interface.
- `async/await` com `try/catch` deixa o fluxo legível.
- Verifique `resposta.ok` e trate carregando, vazio e erro.

## Próximo passo

Na última aula do curso, você vai aprofundar o tratamento de erros e a organização do código.

<!-- aula: tratamento-de-erros-e-organizacao -->
## Por que isso importa

Programas reais lidam com dados inválidos, redes instáveis e situações imprevistas. A diferença entre um sistema amador e um profissional está em **como ele falha**: com uma mensagem clara e sem perder dados, ou com uma tela branca. Organização de código é o que permite corrigir problemas rapidamente quando eles surgem.

## Conceitos fundamentais

**Erros em JavaScript**:

- `try { } catch (erro) { } finally { }`: `catch` trata o erro; `finally` executa sempre (ideal para esconder um "carregando").
- `throw new Error("mensagem")`: lança um erro de propósito quando algo inválido acontece.
- Tipos nativos: `TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`.
- **Classes de erro próprias** (`class ErroDeValidacao extends Error`) permitem tratar cada caso de forma diferente.
- Só capture erros que você sabe tratar. Um `catch` vazio esconde bugs.

**Validação**: verifique dados na **entrada** das funções (falhe cedo) em vez de deixar o erro aparecer longe da causa.

**Organização**:

- Separe **dados**, **regras** e **interface**: funções que calculam não devem mexer no DOM.
- Nomes descritivos e funções pequenas.
- Evite números e textos "mágicos": use constantes com nome.
- Ferramentas como ESLint e Prettier apontam problemas e padronizam o estilo.

## Exemplo prático

```js
class ErroDeValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "ErroDeValidacao";
  }
}

const IDADE_MINIMA = 16;

function validarCadastro({ nome, idade }) {
  if (!nome || nome.trim().length < 2) {
    throw new ErroDeValidacao("Informe um nome com pelo menos 2 letras.");
  }
  if (!Number.isInteger(idade) || idade < IDADE_MINIMA) {
    throw new ErroDeValidacao(`É preciso ter pelo menos ${IDADE_MINIMA} anos.`);
  }
  return { nome: nome.trim(), idade };
}

function enviarCadastro(dados) {
  try {
    const valido = validarCadastro(dados);
    return { ok: true, mensagem: `Bem-vindo, ${valido.nome}!` };
  } catch (erro) {
    if (erro instanceof ErroDeValidacao) {
      return { ok: false, mensagem: erro.message };
    }
    throw erro;
  }
}

console.log(enviarCadastro({ nome: "Ana", idade: 20 }));
// { ok: true, mensagem: "Bem-vindo, Ana!" }
console.log(enviarCadastro({ nome: "A", idade: 20 }));
// { ok: false, mensagem: "Informe um nome com pelo menos 2 letras." }
```

## Explicando o código

- `ErroDeValidacao` diferencia "dado inválido" (esperado, com mensagem para a pessoa usuária) de bugs inesperados.
- `validarCadastro` falha cedo, logo na entrada, e é uma função pura: fácil de testar.
- `enviarCadastro` trata apenas os erros de validação. Qualquer outro erro é relançado com `throw erro`, para não ser escondido.
- `IDADE_MINIMA` dá nome a uma regra de negócio, em vez de um número solto.

## Erros comuns

- **`catch` vazio**: o erro desaparece e o bug fica invisível.
- **Mostrar a mensagem técnica do erro para a pessoa usuária**: exiba algo útil e registre os detalhes para quem desenvolve.
- **Misturar validação, cálculo e DOM em uma só função**: fica impossível testar.

## Resumo

- Trate erros esperados com mensagens claras; relance os inesperados.
- Valide cedo e separe dados, regras e interface.
- Constantes nomeadas e funções pequenas facilitam a manutenção.

## Próximo passo

Você concluiu o curso de JavaScript. Continue com **Git e GitHub** para versionar seus projetos e, em seguida, **React** para construir interfaces com componentes.
