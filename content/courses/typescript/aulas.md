<!-- aula: por-que-typescript -->
## Por que isso importa

Em JavaScript, muitos erros só aparecem quando o programa roda: uma propriedade escrita errado, um número chegando como texto, uma função chamada com argumentos faltando. **TypeScript** encontra boa parte desses erros enquanto você escreve, antes de o código chegar ao usuário. Por isso ele virou padrão em projetos profissionais com React e Node.js.

## Conceitos fundamentais

- **TypeScript** é JavaScript com **tipos**: anotações que descrevem que tipo de valor cada coisa pode ter.
- O navegador não entende TypeScript. Um **compilador** (`tsc`, ou ferramentas como Vite e Next.js) verifica os tipos e gera JavaScript comum.
- **Os tipos somem na execução**: eles existem só para a verificação. Dados que chegam de fora (formulários, APIs) ainda precisam ser validados no código.
- **Verificação estática**: análise feita sem executar o programa.
- O editor (como o VS Code) usa os tipos para autocompletar e mostrar erros com sublinhado vermelho.

Para experimentar sem instalar nada, use o playground oficial em typescriptlang.org/play. Para um projeto local:

```bash
npm install --save-dev typescript
npx tsc --init
npx tsc
```

## Exemplo prático

```ts
function calcularTotal(preco: number, quantidade: number): number {
  return preco * quantidade;
}

calcularTotal(10, 3);
// calcularTotal("10", 3);
// Erro: o argumento do tipo 'string' não pode ser atribuído ao parâmetro do tipo 'number'.
```

## Explicando o código

- `preco: number` diz que o parâmetro precisa ser um número.
- `): number` depois dos parênteses é o tipo do **retorno**.
- A chamada com `"10"` (texto) é recusada **antes** de rodar. Em JavaScript puro, ela devolveria `30`, porque `*` converte o texto para número — mas com `+` o resultado seria `"103"`. O TypeScript elimina essa classe de surpresa.

## Erros comuns

- **Achar que TypeScript valida dados em tempo de execução**: se uma API devolver algo diferente do esperado, o TypeScript não vê. Valide entradas externas.
- **Usar `any` para "calar" erros**: `any` desliga a verificação e esconde bugs. Prefira `unknown` e verifique antes de usar.
- **Desistir pelos primeiros erros**: as mensagens parecem longas, mas costumam dizer exatamente o que está errado. Leia do fim para o começo.

## Resumo

- TypeScript adiciona tipos ao JavaScript e encontra erros antes da execução.
- O código é compilado para JavaScript; os tipos não existem em tempo de execução.
- Evite `any`; dados externos ainda precisam de validação.

## Próximo passo

Na próxima aula você vai conhecer os tipos básicos e deixar o TypeScript deduzi-los sozinho.

<!-- aula: tipos-basicos-e-inferencia -->
## Por que isso importa

Você não precisa anotar tipo em tudo: o TypeScript deduz muita coisa sozinho. Saber quando anotar e quando confiar na **inferência** deixa o código limpo e, ao mesmo tempo, seguro.

## Conceitos fundamentais

Tipos primitivos: `string`, `number`, `boolean`, `null`, `undefined`.

Outros tipos úteis:

- **Arrays**: `string[]` ou `Array<string>`.
- **Tuplas**: arrays de tamanho e tipos fixos, como `[string, number]`.
- **`unknown`**: "pode ser qualquer coisa, mas verifique antes de usar".
- **`any`**: desliga a verificação (evite).
- **`void`**: função que não devolve nada.

**Inferência**: em `const nome = "Ana"`, o TypeScript já sabe que `nome` é texto. Anote tipos principalmente em **parâmetros de função** e em **dados vindos de fora**.

**`const` x `let`**: com `const`, o tipo inferido pode ser o próprio valor literal (`"Ana"`); com `let`, é o tipo geral (`string`), porque o valor pode mudar.

## Exemplo prático

```ts
const nome = "Ana";
let idade = 28;
const notas = [8, 9.5, 7];
const ativo = true;

const contato: [string, number] = ["Ana", 11999990000];

function saudar(pessoa: string): void {
  console.log(`Olá, ${pessoa}!`);
}

function tamanho(valor: unknown): number {
  if (typeof valor === "string") {
    return valor.length;
  }
  return 0;
}
```

## Explicando o código

- `nome`, `idade`, `notas` e `ativo` não têm anotação: o TypeScript infere `string`, `number`, `number[]` e `boolean`.
- `contato` é uma tupla: o primeiro item é texto e o segundo, número.
- `saudar` recebe uma `string` e não devolve valor (`void`).
- Em `tamanho`, `valor` é `unknown`: só depois do `typeof valor === "string"` o TypeScript permite usar `.length`. Isso se chama **estreitamento** (narrowing).

## Erros comuns

- **Anotar o óbvio**: `const total: number = 10` é redundante.
- **Trocar `unknown` por `any`** para não ter trabalho: perde-se a proteção.
- **Esperar que `idade = "trinta"` funcione**: `idade` foi inferida como `number`, então o TypeScript recusa.

## Resumo

- Primitivos, arrays, tuplas, `unknown`, `void`.
- Confie na inferência; anote parâmetros e dados externos.
- `unknown` obriga a verificar o tipo antes de usar.

## Próximo passo

A seguir você vai descrever a forma de objetos com `interface` e `type`.

<!-- aula: interfaces-e-types -->
## Por que isso importa

Aplicações giram em torno de objetos: usuários, produtos, pedidos. Descrever o formato desses objetos uma vez faz o editor autocompletar as propriedades, impede erros de digitação e documenta o código para quem chega depois.

## Conceitos fundamentais

- **`interface`**: descreve a forma de um objeto.
- **`type`**: dá nome a qualquer tipo (objetos, uniões, tuplas...).
- Para objetos, os dois são parecidos. Uma convenção comum: `interface` para objetos, `type` para o resto.
- **Propriedade opcional**: `telefone?: string` (pode não existir).
- **Somente leitura**: `readonly id: number`.
- **Composição**: `interface Admin extends Usuario { ... }` ou `type Admin = Usuario & { ... }`.
- **`Record<Chave, Valor>`**: objeto usado como dicionário.

## Exemplo prático

```ts
interface Produto {
  readonly id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

type EstoquePorId = Record<number, number>;

function totalCarrinho(itens: ItemCarrinho[]): number {
  return itens.reduce((soma, item) => soma + item.produto.preco * item.quantidade, 0);
}

const caneta: Produto = { id: 1, nome: "Caneta", preco: 3.5 };
const estoque: EstoquePorId = { 1: 120 };
console.log(totalCarrinho([{ produto: caneta, quantidade: 4 }])); // 14
```

## Explicando o código

- `Produto` tem `id` somente leitura e `descricao` opcional.
- `ItemCarrinho` usa `Produto` dentro dele: tipos se combinam como peças.
- `totalCarrinho` sabe que cada item tem `produto.preco` e `quantidade`; escrever `item.produto.prco` seria um erro imediato.
- `caneta` não precisa de `descricao`, porque ela é opcional.

## Erros comuns

- **Esquecer de tratar propriedades opcionais**: `caneta.descricao.length` é erro, porque `descricao` pode ser `undefined`. Use `caneta.descricao?.length`.
- **Tentar alterar uma propriedade `readonly`**: o TypeScript recusa.
- **Duplicar a mesma forma em vários lugares**: crie o tipo uma vez e reutilize.

## Resumo

- `interface` e `type` descrevem formatos de dados.
- `?` torna uma propriedade opcional; `readonly` impede alteração.
- Tipos se combinam com `extends`, `&` e uso de um dentro do outro.

## Próximo passo

Na próxima aula você vai lidar com valores que podem ter mais de um formato: uniões e estreitamento.

<!-- aula: unioes-e-estreitamento -->
## Por que isso importa

Uma requisição pode estar carregando, ter dado certo ou ter falhado. Um pagamento pode estar pendente, aprovado ou recusado. **Tipos união** descrevem exatamente essas possibilidades, e o TypeScript garante que você tratou todas — uma das maiores vantagens da linguagem em interfaces reais.

## Conceitos fundamentais

- **União**: `string | number` aceita um ou outro.
- **Tipos literais**: `"pendente" | "pago" | "cancelado"` aceita só esses textos.
- **Estreitamento (narrowing)**: depois de um `if (typeof x === "string")`, o TypeScript sabe que `x` é texto naquele bloco. Também funciona com `===`, `in`, `instanceof` e verificações de `null`.
- **União discriminada**: objetos com uma propriedade comum (o "discriminante") que identifica o caso, como `status`.
- **Verificação exaustiva**: com `switch` e o tipo `never`, o TypeScript acusa se algum caso ficar sem tratamento.

## Exemplo prático

```ts
type EstadoRequisicao =
  | { status: "carregando" }
  | { status: "sucesso"; dados: string[] }
  | { status: "erro"; mensagem: string };

function descrever(estado: EstadoRequisicao): string {
  switch (estado.status) {
    case "carregando":
      return "Carregando...";
    case "sucesso":
      return `${estado.dados.length} itens carregados`;
    case "erro":
      return `Falhou: ${estado.mensagem}`;
    default: {
      const impossivel: never = estado;
      return impossivel;
    }
  }
}

console.log(descrever({ status: "sucesso", dados: ["a", "b"] })); // "2 itens carregados"
```

## Explicando o código

- `EstadoRequisicao` tem três formas possíveis, identificadas por `status`.
- Dentro de `case "sucesso"`, o TypeScript sabe que existe `dados`; em `case "erro"`, que existe `mensagem`. Acessar `estado.dados` no caso de erro seria recusado.
- O `default` com `never` é a rede de segurança: se alguém criar um quarto status e esquecer de tratá-lo, o código deixa de compilar.

## Erros comuns

- **Usar `string` onde só alguns valores fazem sentido**: `status: string` aceita `"pagoo"` com erro de digitação. Use tipos literais.
- **Acessar propriedades sem estreitar**: em uma união, só as propriedades comuns a todos os casos estão disponíveis diretamente.
- **Esquecer o caso `null`**: com `strict`, `string | null` obriga a tratar o `null`.

## Resumo

- Uniões e tipos literais descrevem as possibilidades reais dos dados.
- Estreitamento libera as propriedades de cada caso.
- `never` no `default` garante que todos os casos foram tratados.

## Próximo passo

A seguir você vai escrever funções e tipos reutilizáveis para qualquer tipo de dado: os generics.

<!-- aula: generics -->
## Por que isso importa

Uma função que devolve o primeiro item de uma lista deveria funcionar com lista de números, de textos ou de produtos — e continuar sabendo qual é o tipo do item. **Generics** permitem escrever código reutilizável sem perder a informação de tipo, e aparecem o tempo todo em bibliotecas (como `Array<T>`, `Promise<T>` e o `useState` do React).

## Conceitos fundamentais

- **Parâmetro de tipo**: um "tipo variável", normalmente chamado `T`, escrito entre `< >`.
- O TypeScript costuma **inferir** o `T` a partir dos argumentos.
- **Restrição** (`extends`): `T extends { id: number }` exige que o tipo tenha um `id`.
- Tipos genéricos também servem para objetos: `interface Resposta<T> { dados: T; erro: string | null }`.
- Utilitários prontos: `Partial<T>` (tudo opcional), `Pick<T, "a" | "b">`, `Omit<T, "senha">`.

## Exemplo prático

```ts
function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

const n = primeiro([10, 20, 30]); // number | undefined
const s = primeiro(["a", "b"]); // string | undefined

interface ComId {
  id: number;
}

function buscarPorId<T extends ComId>(itens: T[], id: number): T | undefined {
  return itens.find((item) => item.id === id);
}

interface Usuario {
  id: number;
  nome: string;
  senha: string;
}

type UsuarioPublico = Omit<Usuario, "senha">;

const usuarios: Usuario[] = [{ id: 1, nome: "Rui", senha: "segredo" }];
const achado = buscarPorId(usuarios, 1);
const publico: UsuarioPublico | undefined = achado ? { id: achado.id, nome: achado.nome } : undefined;
console.log(publico); // { id: 1, nome: "Rui" }
```

## Explicando o código

- `primeiro<T>` funciona com qualquer lista; o retorno acompanha o tipo dos itens.
- O retorno é `T | undefined` porque a lista pode estar vazia — o TypeScript obriga a lembrar disso.
- `buscarPorId` aceita qualquer tipo que tenha `id: number` e devolve o mesmo tipo (`Usuario`), não um tipo genérico demais.
- `Omit<Usuario, "senha">` cria um tipo sem a senha, ideal para o que vai para a tela ou para uma API.

## Erros comuns

- **Usar `any[]` em vez de generics**: o retorno vira `any` e a proteção some.
- **Generics sem necessidade**: se a função só trabalha com `number`, use `number`.
- **Esquecer a restrição**: sem `extends ComId`, acessar `item.id` é um erro.

## Resumo

- Generics criam funções e tipos reutilizáveis que preservam o tipo.
- `extends` restringe o que o tipo precisa ter.
- `Partial`, `Pick` e `Omit` derivam tipos novos a partir de outros.

## Próximo passo

Na última aula da trilha, você vai configurar o TypeScript em um projeto real e validar dados que chegam de fora.

<!-- aula: typescript-na-pratica -->
## Por que isso importa

Saber os tipos é metade do caminho. A outra metade é configurar o projeto para que o TypeScript ajude de verdade (modo estrito) e lembrar que dados externos — formulários, APIs, `localStorage` — chegam sem garantia nenhuma. Juntar as duas coisas é o que dá segurança em produção.

## Conceitos fundamentais

- **`tsconfig.json`**: configuração do compilador.
- **`"strict": true`**: liga as verificações mais importantes, como tratar `null` e `undefined` e proibir `any` implícito. Use sempre em projetos novos.
- **`noUncheckedIndexedAccess`**: faz `lista[0]` ter tipo `T | undefined`, lembrando que o índice pode não existir.
- **Validação em tempo de execução**: bibliotecas como **Zod** descrevem o formato esperado, verificam os dados reais e ainda geram o tipo TypeScript a partir da mesma descrição.
- **Tipos de bibliotecas**: muitos pacotes já trazem tipos; outros têm pacotes `@types/nome`.

## Exemplo prático

`tsconfig.json` mínimo:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Validando a resposta de uma API com Zod:

```ts
import { z } from "zod";

const Tarefa = z.object({
  id: z.number(),
  titulo: z.string().min(1),
  feita: z.boolean(),
});

type Tarefa = z.infer<typeof Tarefa>;

async function carregarTarefas(): Promise<Tarefa[]> {
  const resposta = await fetch("/api/tarefas");
  if (!resposta.ok) throw new Error(`Falha: ${resposta.status}`);
  const json: unknown = await resposta.json();
  return z.array(Tarefa).parse(json);
}
```

## Explicando o código

- `strict` e `noUncheckedIndexedAccess` deixam o compilador mais exigente — e mais útil.
- `Tarefa` (Zod) descreve o formato e **verifica** os dados reais; `z.infer` gera o tipo TypeScript a partir dela, sem duplicar a definição.
- O JSON entra como `unknown`: nada é confiável até passar pelo `parse`. Se a API mudar o formato, o erro aparece na entrada, com uma mensagem clara, e não três telas depois.

## Erros comuns

- **Desligar o `strict` para os erros sumirem**: os bugs continuam lá, só que escondidos.
- **Fazer `as Tarefa[]` em dados externos**: `as` só convence o compilador; não verifica nada.
- **Duplicar tipos e validações**: com Zod, uma única definição serve para as duas coisas.

## Resumo

- Use `strict: true` e, de preferência, `noUncheckedIndexedAccess`.
- Tipos não validam dados em execução; use validação (como Zod) na entrada.
- Evite `as` em dados externos.

## Próximo passo

Agora você está pronto para a trilha de **React**, onde TypeScript ajuda a descrever props, estado e respostas de APIs.
