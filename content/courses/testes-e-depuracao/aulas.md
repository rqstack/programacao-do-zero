<!-- aula: depurando-com-devtools -->
## Por que isso importa

Todo programador passa boa parte do tempo descobrindo **por que** algo não funciona. Quem depura com método (lê o erro, reproduz, isola, verifica) resolve em minutos o que outros levam horas tentando no chute. As ferramentas do navegador e do editor mostram exatamente o que o código está fazendo, sem adivinhação.

## Conceitos fundamentais

- **Leia a mensagem de erro inteira**: o tipo (`TypeError`, `ReferenceError`), a mensagem e o **stack trace** (a pilha de chamadas, de onde o erro veio). A primeira linha que aponta para o **seu** arquivo costuma ser o lugar certo para começar.
- **Reproduza** o problema de forma confiável antes de tentar corrigir.
- **Isole**: diminua o caso até o mínimo que ainda falha.
- **DevTools do navegador** (F12):
  - **Console**: erros, avisos e `console.log`.
  - **Sources**: **breakpoints** param o código numa linha; você inspeciona variáveis e avança passo a passo.
  - **Network** (Rede): cada requisição, com status, cabeçalhos, corpo e tempo. Essencial para APIs.
  - **Application**: localStorage, cookies, cache.
- A instrução **`debugger;`** no código pausa ali quando o DevTools está aberto.
- **`console.table`** mostra listas de objetos em tabela; `console.error` destaca problemas.
- **Hipótese → teste**: "acho que o valor chega como texto" → confira com `typeof` ou um breakpoint, em vez de mudar o código no escuro.

## Exemplo prático

Um carrinho mostra total errado. O código:

```js
function totalDoCarrinho(itens) {
  let total = 0;
  for (const item of itens) {
    total += item.preco * item.quantidade;
  }
  return total;
}

// Os dados vêm de um formulário (inputs devolvem TEXTO)
const itens = [
  { nome: "Caderno", preco: "18.90", quantidade: "2" },
  { nome: "Caneta", preco: "2.50", quantidade: "3" },
];

console.table(itens);
console.log(totalDoCarrinho(itens)); // 45.3 — parece certo...

// ...mas em outro ponto o total é montado com +
let soma = "0";
for (const item of itens) soma += item.preco;
console.log(soma); // "018.902.50" — concatenou textos!
```

Correção: converter na entrada e conferir.

```js
function lerItem(campos) {
  const preco = Number(campos.preco);
  const quantidade = Number.parseInt(campos.quantidade, 10);
  if (!Number.isFinite(preco) || !Number.isInteger(quantidade)) {
    throw new Error(`Item inválido: ${JSON.stringify(campos)}`);
  }
  return { nome: campos.nome, preco, quantidade };
}

const corrigidos = [
  { nome: "Caderno", preco: "18.90", quantidade: "2" },
  { nome: "Caneta", preco: "2.50", quantidade: "3" },
].map(lerItem);

const total = corrigidos.reduce((s, i) => s + i.preco * i.quantidade, 0);
console.log(total.toFixed(2)); // "45.30"
```

## Explicando o código

- `console.table(itens)` mostra na hora que `preco` e `quantidade` são **textos** (aparecem entre aspas).
- A multiplicação converte texto em número sozinha (por isso o primeiro total "funciona"), mas o `+` com texto **concatena**. É um bug que aparece em um lugar e não em outro.
- A correção converte os dados **na entrada** (`lerItem`) e falha cedo com uma mensagem clara se algo vier errado.
- `toFixed(2)` só formata para exibir; o cálculo continua com números.
- No navegador, um breakpoint dentro do `for` mostraria `soma` crescendo como texto a cada volta.

## Erros comuns

- **Mudar várias coisas ao mesmo tempo** "para ver se resolve": você não sabe o que corrigiu nem o que quebrou.
- **Ignorar o stack trace** e procurar o erro no arquivo errado.
- **Deixar `console.log` e `debugger` espalhados** no código publicado.
- **Não olhar a aba Rede** quando a tela "não carrega": às vezes a API respondeu 401 ou 500.

## Resumo

- Leia o erro, reproduza, isole, levante hipóteses e confirme.
- Use Console, breakpoints, Rede e `console.table`.
- Converta e valide dados na entrada; falhe cedo com mensagens claras.

## Próximo passo

Depurar resolve o bug de hoje. **Testes automatizados** evitam que ele volte amanhã.

<!-- aula: por-que-testes-automatizados -->
## Por que isso importa

Sem testes, cada mudança é um risco: você corrige uma coisa e quebra outra sem perceber. Testes automatizados conferem centenas de comportamentos em segundos, toda vez que você salva ou antes de publicar. Em vagas de desenvolvimento, saber escrever testes é cada vez mais exigido, e um projeto com testes se destaca no portfólio.

## Conceitos fundamentais

- **Teste automatizado**: código que executa o seu código com entradas conhecidas e confere se a saída é a esperada.
- **Tipos**:
  - **Unitário**: testa uma função ou módulo isolado. Rápido e preciso.
  - **Integração**: testa partes juntas (rota da API + banco, componente + dados).
  - **Ponta a ponta (E2E)**: usa o sistema como uma pessoa, no navegador (ferramentas como Playwright).
- **Pirâmide de testes**: muitos unitários, uma boa quantidade de integração e poucos E2E (que são mais lentos e frágeis).
- **O que testar primeiro**: regras de negócio (cálculos, permissões, validações), casos de borda e bugs que já aconteceram (para não voltarem).
- **Estrutura AAA**: **Arrange** (prepara os dados), **Act** (executa), **Assert** (confere).
- Um bom teste é **determinístico** (sempre dá o mesmo resultado), **independente** (não depende da ordem dos outros) e tem um **nome que explica o comportamento**.
- **Cobertura** mostra quais linhas os testes executam; ajuda a achar áreas esquecidas, mas 100% de cobertura não garante que tudo está certo.

## Exemplo prático

Uma regra de negócio e os testes que a descrevem (estrutura AAA):

```js
// frete.js
export function calcularFrete(subtotal, cep) {
  if (!/^\d{8}$/.test(cep)) throw new Error("CEP inválido");
  if (subtotal >= 200) return 0;               // frete grátis acima de R$ 200
  return cep.startsWith("0") ? 15 : 25;        // capital (0xxx) mais barato
}
```

```js
// frete.test.js
import { describe, expect, it } from "vitest";
import { calcularFrete } from "./frete.js";

describe("calcularFrete", () => {
  it("é grátis a partir de R$ 200", () => {
    // Arrange
    const subtotal = 200;
    // Act
    const frete = calcularFrete(subtotal, "01001000");
    // Assert
    expect(frete).toBe(0);
  });

  it("custa 15 para CEPs que começam com 0", () => {
    expect(calcularFrete(50, "01001000")).toBe(15);
  });

  it("custa 25 para os demais CEPs", () => {
    expect(calcularFrete(50, "50030000")).toBe(25);
  });

  it("recusa CEP com formato inválido", () => {
    expect(() => calcularFrete(50, "50030-000")).toThrow("CEP inválido");
  });
});
```

## Explicando o código

- Cada `it` descreve **um comportamento** em linguagem de negócio: lendo só os nomes, dá para entender a regra.
- O primeiro teste mostra o AAA explícito; os outros fazem as três etapas numa linha.
- O teste de 200 cobre o **caso de borda** (exatamente no limite). Se alguém trocar `>=` por `>`, ele falha.
- `toThrow` confere que uma entrada inválida gera erro, em vez de um frete errado silencioso.
- Rodando `npx vitest`, os quatro testes executam em milissegundos.

## Erros comuns

- **Testar só o caminho feliz**.
- **Testes que dependem de data, hora ou sorte** (`Math.random`) sem controle: falham "às vezes".
- **Nomes como `teste1`**: quando falhar, ninguém sabe o que quebrou.
- **Correr atrás de 100% de cobertura** com testes que não conferem nada importante.

## Resumo

- Testes automatizados conferem comportamentos a cada mudança.
- Pirâmide: muitos unitários, alguns de integração, poucos E2E.
- AAA, nomes claros, casos de borda e testes determinísticos.

## Próximo passo

Na próxima aula você vai instalar o **Vitest** e escrever testes unitários de verdade, com os principais tipos de verificação.

<!-- aula: testes-unitarios-com-vitest -->
## Por que isso importa

O Vitest é um executor de testes moderno e rápido, compatível com a sintaxe do Jest (o mais usado historicamente), e integrado a projetos Vite, React e Node. Saber usá-lo bem significa conseguir testar qualquer função JavaScript ou TypeScript do seu projeto em poucos minutos.

## Conceitos fundamentais

- **Instalação**: `npm install -D vitest` e o script `"test": "vitest"` no `package.json`. Arquivos `*.test.js` (ou `.ts`) são encontrados automaticamente.
- **`describe`** agrupa testes; **`it`** (ou `test`) define um teste; **`expect(valor)`** começa uma verificação.
- **Verificações (matchers) mais usadas**:
  - `toBe` — igualdade exata (números, textos, booleanos).
  - `toEqual` — compara objetos e listas pelo conteúdo.
  - `toBeCloseTo` — números com casas decimais (evita o problema do `0.1 + 0.2`).
  - `toContain`, `toHaveLength`, `toMatch` (expressão regular).
  - `toBeNull`, `toBeUndefined`, `toBeTruthy`.
  - `toThrow` — espera que a função lance erro.
  - `.not` inverte: `expect(x).not.toBe(0)`.
- **`beforeEach`** prepara dados antes de cada teste (evita que um teste afete o outro).
- **`it.each`** roda o mesmo teste com várias entradas (tabela de casos).
- **Modo watch**: `vitest` fica observando e roda de novo os testes afetados a cada salvamento.

## Exemplo prático

```js
// carrinho.js
export function criarCarrinho() {
  const itens = new Map();
  return {
    adicionar(nome, preco, quantidade = 1) {
      if (quantidade <= 0) throw new Error("Quantidade deve ser positiva");
      const atual = itens.get(nome);
      itens.set(nome, { preco, quantidade: (atual?.quantidade ?? 0) + quantidade });
    },
    remover(nome) {
      itens.delete(nome);
    },
    total() {
      let soma = 0;
      for (const { preco, quantidade } of itens.values()) soma += preco * quantidade;
      return soma;
    },
    nomes() {
      return [...itens.keys()].sort();
    },
  };
}
```

```js
// carrinho.test.js
import { beforeEach, describe, expect, it } from "vitest";
import { criarCarrinho } from "./carrinho.js";

describe("carrinho", () => {
  let carrinho;

  beforeEach(() => {
    carrinho = criarCarrinho(); // cada teste começa com um carrinho vazio
  });

  it("começa vazio", () => {
    expect(carrinho.total()).toBe(0);
    expect(carrinho.nomes()).toEqual([]);
  });

  it("soma itens repetidos em vez de duplicar", () => {
    carrinho.adicionar("Caneta", 2.5, 2);
    carrinho.adicionar("Caneta", 2.5, 1);
    expect(carrinho.nomes()).toHaveLength(1);
    expect(carrinho.total()).toBeCloseTo(7.5);
  });

  it("calcula o total com decimais", () => {
    carrinho.adicionar("Caderno", 18.9);
    carrinho.adicionar("Lápis", 0.1, 3);
    expect(carrinho.total()).toBeCloseTo(19.2);
  });

  it("não aceita quantidade zero ou negativa", () => {
    expect(() => carrinho.adicionar("Borracha", 1, 0)).toThrow("positiva");
  });

  it.each([
    ["Caderno", 18.9, 1, 18.9],
    ["Caneta", 2.5, 4, 10],
    ["Mochila", 129, 2, 258],
  ])("%s: %d × %i dá o total certo", (nome, preco, quantidade, esperado) => {
    carrinho.adicionar(nome, preco, quantidade);
    expect(carrinho.total()).toBeCloseTo(esperado);
  });
});
```

## Explicando o código

- `beforeEach` cria um carrinho novo antes de **cada** teste: nenhum teste herda itens de outro.
- `toEqual([])` compara o conteúdo da lista; `toBe([])` falharia, porque são listas diferentes na memória.
- `toBeCloseTo(19.2)` protege contra o ponto flutuante: `0.1 * 3` dá `0.30000000000000004` em JavaScript, e somas com decimais podem sair com esse "resto". Com `toBe` o teste poderia falhar por um detalhe que não é bug.
- `toThrow("positiva")` confere que o erro contém aquele trecho da mensagem.
- `it.each` executa o mesmo teste três vezes; os marcadores `%s`, `%d` e `%i` são preenchidos na ordem com nome, preço e quantidade.

## Erros comuns

- **`toBe` com objetos ou listas**: use `toEqual`.
- **`toBe` com decimais calculados**: use `toBeCloseTo`.
- **Chamar a função dentro do `expect` ao testar erro** (`expect(f()).toThrow()`): o erro acontece antes. O certo é passar uma função: `expect(() => f()).toThrow()`.
- **Estado compartilhado entre testes** sem `beforeEach`.

## Resumo

- `describe`, `it`, `expect` e os matchers certos para cada tipo de valor.
- `beforeEach` isola os testes; `it.each` testa vários casos.
- `toEqual` para conteúdo, `toBeCloseTo` para decimais, `() =>` para `toThrow`.

## Próximo passo

Na próxima aula você vai escrever o teste **antes** do código (TDD) e treinar o olhar para **casos de borda**.

<!-- aula: tdd-e-casos-de-borda -->
## Por que isso importa

Muitos bugs moram nas bordas: lista vazia, valor zero, texto com espaços, data no último dia do mês. Escrever o teste primeiro (TDD) obriga você a pensar nesses casos **antes** de programar, e o resultado costuma ser um código mais simples e mais confiável.

## Conceitos fundamentais

- **TDD (Test-Driven Development)** em três passos que se repetem:
  1. **Vermelho**: escreva um teste para o próximo comportamento; ele falha.
  2. **Verde**: escreva o código **mínimo** para passar.
  3. **Refatorar**: melhore o código com a segurança dos testes passando.
- **Casos de borda** para procurar sempre:
  - vazio (lista, texto, objeto), zero e negativos;
  - limites exatos (`>=` vs `>`), primeiro e último elemento;
  - espaços, maiúsculas, acentos;
  - valores muito grandes, `null`/`undefined`, tipos errados;
  - datas: fim de mês, ano bissexto, fuso horário.
- **Particionar entradas**: agrupe valores que se comportam igual e teste um de cada grupo, mais as bordas entre grupos.
- **Teste de regressão**: quando aparece um bug, primeiro escreva um teste que o reproduz (vermelho) e só depois corrija.

## Exemplo prático

Requisito: "gerar um slug para a URL a partir do título: minúsculas, sem acentos, palavras separadas por hífen, no máximo 60 caracteres".

Primeiro os testes (vermelho):

```js
// slug.test.js
import { describe, expect, it } from "vitest";
import { slugify } from "./slug.js";

describe("slugify", () => {
  it("troca espaços por hífen e usa minúsculas", () => {
    expect(slugify("Olá Mundo")).toBe("ola-mundo");
  });
  it("remove acentos e cedilha", () => {
    expect(slugify("Programação em Ação")).toBe("programacao-em-acao");
  });
  it("junta espaços e símbolos repetidos num hífen só", () => {
    expect(slugify("  React -- e   Node!! ")).toBe("react-e-node");
  });
  it("devolve texto vazio para entrada sem letras ou números", () => {
    expect(slugify("!!!")).toBe("");
  });
  it("corta em 60 caracteres sem deixar hífen no fim", () => {
    const longo = "palavra ".repeat(20);
    const s = slugify(longo);
    expect(s.length).toBeLessThanOrEqual(60);
    expect(s.endsWith("-")).toBe(false);
  });
});
```

Depois o código mínimo que faz todos passarem (verde):

```js
// slug.js
export function slugify(titulo) {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")     // tudo que não é letra/número vira hífen
    .replace(/^-+|-+$/g, "")         // tira hífens das pontas
    .slice(0, 60)
    .replace(/-+$/, "");              // o corte não pode terminar em hífen
}
```

## Explicando o código

- Os testes foram escritos a partir do requisito, incluindo bordas: espaços nas pontas, símbolos repetidos, entrada sem letras, texto longo.
- `normalize("NFD")` separa a letra do acento (`ç` vira `c` + cedilha), e a expressão remove os acentos.
- `[^a-z0-9]+` troca qualquer sequência de outros caracteres por **um** hífen, o que resolve espaços e símbolos repetidos de uma vez.
- O teste de 60 caracteres pegou um bug sutil: cortar o texto pode deixar um hífen no final. Por isso o último `replace` vem **depois** do `slice`.

## Erros comuns

- **Escrever todos os testes de uma vez e depois todo o código**: o TDD funciona em passos pequenos.
- **Pular a refatoração** "porque passou".
- **Esquecer os casos vazios e os limites**.
- **Corrigir um bug sem escrever o teste que o reproduz**: ele volta.

## Resumo

- Vermelho → verde → refatorar, em passos pequenos.
- Procure bordas: vazio, zero, limites, espaços, acentos, tamanhos.
- Todo bug corrigido ganha um teste de regressão.

## Próximo passo

E quando o código depende de coisas externas (uma API, a hora atual)? A próxima aula mostra **mocks** e testes de código assíncrono.

<!-- aula: mocks-e-codigo-assincrono -->
## Por que isso importa

Código real chama APIs, lê a hora atual, espera timers. Testes que dependem da internet ou do relógio ficam lentos e falham aleatoriamente. **Mocks** substituem essas dependências por versões controladas, para você testar o **seu** código de forma rápida e previsível.

## Conceitos fundamentais

- **Mock / dublê de teste**: uma versão falsa de uma dependência, controlada pelo teste.
- **`vi.fn()`** cria uma função espiã: registra chamadas e argumentos, e você define o que ela devolve (`mockResolvedValue`, `mockReturnValue`).
- **Injeção de dependência**: em vez de a função chamar `fetch` direto, ela recebe o `fetch` como parâmetro. Assim o teste passa um falso. É a forma mais simples e clara de tornar código testável.
- **`vi.useFakeTimers()`** e **`vi.setSystemTime(data)`** controlam o relógio; `vi.advanceTimersByTime(ms)` faz o tempo passar sem esperar.
- **Testes assíncronos**: use `async` no teste e `await`; para erros, `await expect(promessa).rejects.toThrow(...)`.
- **Não exagere**: mockar tudo testa o mock, não o código. Mocke só o que é externo (rede, tempo, aleatoriedade).

## Exemplo prático

```js
// clima.js — recebe o fetch como dependência
export async function temperaturaAtual(cidade, fetcher = fetch) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&current=temperature_2m`;
  const resposta = await fetcher(url);
  if (!resposta.ok) throw new Error(`Falha ao buscar ${cidade.nome}: ${resposta.status}`);
  const dados = await resposta.json();
  return Math.round(dados.current.temperature_2m);
}

// saudacao.js — depende da hora atual
export function saudacao(agora = new Date()) {
  const h = agora.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
```

```js
// clima.test.js
import { afterEach, describe, expect, it, vi } from "vitest";
import { temperaturaAtual } from "./clima.js";
import { saudacao } from "./saudacao.js";

const recife = { nome: "Recife", lat: -8.05, lon: -34.88 };

describe("temperaturaAtual", () => {
  it("arredonda a temperatura que a API devolve", async () => {
    const falso = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ current: { temperature_2m: 27.6 } }) });
    await expect(temperaturaAtual(recife, falso)).resolves.toBe(28);
    expect(falso).toHaveBeenCalledTimes(1);
    expect(falso.mock.calls[0][0]).toContain("latitude=-8.05");
  });

  it("lança erro com o status quando a API falha", async () => {
    const falso = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(temperaturaAtual(recife, falso)).rejects.toThrow("503");
  });
});

describe("saudacao", () => {
  afterEach(() => vi.useRealTimers());

  it("diz boa tarde às 15h", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 23, 15, 0));
    expect(saudacao()).toBe("Boa tarde");
  });

  it("diz bom dia às 9h (passando a data direto)", () => {
    expect(saudacao(new Date(2026, 9, 23, 9, 0))).toBe("Bom dia");
  });
});
```

## Explicando o código

- `temperaturaAtual` usa `fetch` por padrão, mas aceita outro: o teste passa `falso`, criado com `vi.fn()`.
- `mockResolvedValue` faz o falso devolver uma promessa com o objeto informado, imitando uma resposta da API.
- `resolves.toBe(28)` e `rejects.toThrow("503")` testam o resultado e o erro de funções assíncronas.
- `toHaveBeenCalledTimes` e `mock.calls` conferem **como** a dependência foi chamada (a URL certa).
- Para a hora, há duas opções: congelar o relógio com `vi.setSystemTime` ou, mais simples, passar a data como parâmetro.
- `afterEach(() => vi.useRealTimers())` devolve o relógio real para não afetar os outros testes.

## Erros comuns

- **Testes que chamam a API de verdade**: lentos, dependentes da internet e da cota da API.
- **Esquecer o `await`** num teste assíncrono: o teste termina antes da verificação e passa sem conferir nada.
- **Não restaurar o relógio** depois de `useFakeTimers`.
- **Mockar a própria função que você quer testar**.

## Resumo

- Mocks substituem dependências externas (rede, tempo, aleatoriedade).
- Injeção de dependência deixa o código testável sem truques.
- `vi.fn`, `resolves`/`rejects` e relógio falso controlado.

## Próximo passo

Testes garantem que o código funciona; a última aula mostra como manter o código **legível e consistente** com ferramentas de qualidade.

<!-- aula: qualidade-de-codigo -->
## Por que isso importa

Código é lido muito mais vezes do que é escrito. Ferramentas automáticas pegam erros bobos, padronizam o estilo e impedem que algo quebrado chegue à produção. Em times profissionais, nada entra na branch principal sem passar por elas, e o mesmo vale para projetos de portfólio bem cuidados.

## Conceitos fundamentais

- **Linter (ESLint)**: analisa o código sem executá-lo e aponta problemas: variáveis não usadas, comparações suspeitas, regras de React Hooks, promessas esquecidas.
- **Formatador (Prettier)**: deixa o estilo uniforme (aspas, espaços, quebras). Acaba com discussões sobre formatação em revisões.
- **TypeScript em modo estrito** (`"strict": true`): pega erros de tipo antes de rodar.
- **Scripts padronizados** no `package.json`: `lint`, `typecheck`, `test`, `build` e um `check` que roda todos.
- **Integração contínua (CI)**: a cada push ou pull request, um serviço (como o **GitHub Actions**, gratuito para repositórios públicos dentro dos limites do plano) roda os scripts. Se algo falhar, o PR fica marcado em vermelho.
- **Revisão de código (code review)**: outra pessoa lê o PR antes de juntar. Foque em clareza, regras de negócio, segurança e testes.
- **Commits pequenos e descritivos** contam a história do projeto e facilitam achar onde um bug entrou.
- **Nomes claros** e funções pequenas valem mais do que comentários explicando código confuso.

## Exemplo prático

Scripts no `package.json`:

```texto
"scripts": {
  "lint": "eslint .",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "check": "npm run typecheck && npm run lint && npm run test"
}
```

Um workflow do GitHub Actions que roda tudo a cada push e pull request (arquivo `.github/workflows/ci.yml`):

```texto
name: CI
on: [push, pull_request]
jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
```

Um exemplo do que o ESLint encontra:

```js
export function precoFinal(preco, cupom) {
  const desconto = cupom === "BEMVINDO" ? 0.1 : 0;
  const taxa = 0.05; // ESLint: 'taxa' é declarada mas nunca usada
  if (preco == "0") return 0; // ESLint (com a regra eqeqeq ligada): use === em vez de ==
  return Math.round(preco * (1 - desconto) * 100) / 100;
}
```

## Explicando o código

- `check` encadeia tipos, lint e testes com `&&`: se um falhar, para ali. É o comando para rodar antes de cada commit importante.
- No workflow, `npm ci` instala exatamente as versões do `package-lock.json`, e `npm run check` roda a mesma verificação que você roda localmente.
- O ESLint aponta a variável `taxa` esquecida (talvez um bug: a taxa deveria entrar no cálculo?) e, com a regra `eqeqeq` ligada na configuração, o `==`, que compara com conversão de tipo e pode esconder erros.
- Nenhuma dessas ferramentas tem custo para projetos pessoais públicos.

## Erros comuns

- **Desligar regras do linter** para o aviso sumir, sem entender o motivo.
- **Rodar os testes só "de vez em quando"**: automatize no CI.
- **PRs gigantes**, impossíveis de revisar.
- **Misturar formatação e mudança de lógica** no mesmo commit: o diff fica ilegível.

## Resumo

- ESLint pega problemas; Prettier padroniza; TypeScript estrito pega erros de tipo.
- Um script `check` local e o mesmo no CI a cada push.
- Revisão de código, commits pequenos e nomes claros.

## Próximo passo

Seu código está testado e verificado. A próxima trilha, **Deploy, hospedagem e variáveis de ambiente**, mostra como colocá-lo no ar com segurança e sem custo.
