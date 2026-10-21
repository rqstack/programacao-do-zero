<!-- aula: por-que-react -->
## Por que isso importa

Na trilha de JavaScript, cada mudança na tela exigia encontrar elementos, criar nós e lembrar de atualizar tudo. Em interfaces grandes isso vira um emaranhado. O **React** inverte a lógica: você descreve **como a tela deve ficar** para cada estado dos dados, e ele cuida de atualizar o DOM. É a biblioteca de interface mais usada no mercado.

## Conceitos fundamentais

- **Componente**: uma função que devolve um pedaço da interface. Componentes se combinam como peças: `App` contém `Cabecalho`, que contém `Menu`.
- **JSX**: uma sintaxe parecida com HTML dentro do JavaScript. `<h1>Olá</h1>` em JSX vira chamadas de função que o React entende.
- **Declarativo**: você diz *o que* mostrar; o React decide *como* atualizar.
- **Ferramenta de projeto**: o **Vite** cria um projeto React pronto em segundos. Frameworks como o **Next.js** (usado neste site) acrescentam rotas e páginas.

Diferenças do JSX para o HTML:

- `class` vira `className`; `for` vira `htmlFor`.
- Toda tag precisa fechar: `<img />`, `<br />`.
- Expressões JavaScript vão entre chaves: `{nome}`.
- Um componente devolve **um** elemento raiz (use `<>...</>`, o fragmento, para agrupar sem criar uma div).

## Exemplo prático

Crie o projeto e rode:

```bash
npm create vite@latest meu-app -- --template react
cd meu-app
npm install
npm run dev
```

Um primeiro componente:

```jsx
function Saudacao() {
  const nome = "Ana";
  const hora = new Date().getHours();
  return (
    <>
      <h1>Olá, {nome}!</h1>
      <p className="dica">{hora < 12 ? "Bom dia" : "Boa tarde ou boa noite"}.</p>
    </>
  );
}

export default function App() {
  return <Saudacao />;
}
```

## Explicando o código

- `Saudacao` é uma função comum que devolve JSX. Componentes começam com **letra maiúscula**; é assim que o React os diferencia de tags HTML.
- `{nome}` e o ternário dentro de `{ }` são JavaScript dentro do JSX.
- O fragmento `<>...</>` agrupa o `h1` e o `p` sem acrescentar elementos à página.
- `App` usa `Saudacao` como se fosse uma tag: `<Saudacao />`.

## Erros comuns

- **Componente com letra minúscula**: `<saudacao />` é tratado como uma tag HTML desconhecida.
- **Usar `class` em vez de `className`**: gera aviso e não é o padrão.
- **Devolver dois elementos soltos** sem um pai ou fragmento: erro de sintaxe.

## Resumo

- React descreve a interface como função dos dados.
- Componentes são funções com nome em maiúscula que devolvem JSX.
- JSX usa `className`, chaves para expressões e um elemento raiz.

## Próximo passo

Na próxima aula você vai passar dados de um componente para outro com props.

<!-- aula: componentes-e-props -->
## Por que isso importa

Um card de produto é igual para todos os produtos; só os dados mudam. **Props** são os parâmetros dos componentes: permitem escrever o card uma vez e usá-lo com dados diferentes, como uma função chamada com argumentos diferentes.

## Conceitos fundamentais

- **Props**: um objeto com os dados que o componente pai entrega ao filho: `<Card titulo="Teclado" preco={150} />`.
- Textos vão entre aspas; qualquer outro valor (número, booleano, objeto, função) vai entre chaves.
- O filho recebe as props como parâmetro; é comum **desestruturar**: `function Card({ titulo, preco })`.
- **Props são somente leitura**: o filho nunca altera o que recebeu.
- **`children`**: o conteúdo colocado entre a abertura e o fechamento da tag.
- **Valor padrão**: `function Botao({ tipo = "button" })`.

## Exemplo prático

```jsx
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CardProduto({ nome, preco, emPromocao = false }) {
  return (
    <article className="card">
      <h2>{nome}</h2>
      <p>{formatarPreco(preco)}</p>
      {emPromocao && <span className="selo">Promoção</span>}
    </article>
  );
}

function Painel({ titulo, children }) {
  return (
    <section>
      <h1>{titulo}</h1>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <Painel titulo="Ofertas">
      <CardProduto nome="Teclado" preco={150} emPromocao />
      <CardProduto nome="Mouse" preco={80} />
    </Painel>
  );
}
```

## Explicando o código

- `CardProduto` é usado duas vezes com dados diferentes.
- `emPromocao` sem valor equivale a `emPromocao={true}`; no segundo card, vale o padrão `false`.
- `{emPromocao && <span>...}` mostra o selo só quando a condição é verdadeira.
- `Painel` recebe os cards como `children` e os coloca onde quiser.

## Erros comuns

- **Passar números como texto**: `preco="150"` entrega a string `"150"`. Use `preco={150}`.
- **Alterar uma prop dentro do filho**: crie uma variável nova a partir dela.
- **Componentes gigantes**: se um componente faz muitas coisas, divida.

## Resumo

- Props passam dados do pai para o filho e são somente leitura.
- Use chaves para valores que não são texto.
- `children` permite componentes que "envolvem" outros.

## Próximo passo

A seguir, o componente vai lembrar de coisas e reagir a cliques: estado e eventos.

<!-- aula: estado-e-eventos -->
## Por que isso importa

Props vêm de fora. Mas e quando o próprio componente precisa lembrar de algo que muda — o número de cliques, se um menu está aberto, o texto digitado? Isso é **estado**. Quando o estado muda, o React redesenha o componente com o valor novo.

## Conceitos fundamentais

- **`useState`**: um **hook** que cria uma variável de estado: `const [valor, setValor] = useState(inicial)`.
- Chamar `setValor(novo)` agenda uma nova renderização com o valor atualizado.
- **Eventos**: `onClick`, `onChange`, `onSubmit` recebem uma **função** (não a chamada da função).
- **Atualização baseada no anterior**: `setContador((c) => c + 1)` garante o valor mais recente.
- **Imutabilidade**: para arrays e objetos, crie cópias (`[...lista, novo]`, `{ ...obj, campo }`) em vez de alterar o original. O React compara referências para saber que algo mudou.
- **Regras dos hooks**: chame hooks sempre no topo do componente, nunca dentro de `if` ou laços.

## Exemplo prático

```jsx
import { useState } from "react";

export function Contador() {
  const [contador, setContador] = useState(0);
  return (
    <div>
      <p>Cliques: {contador}</p>
      <button onClick={() => setContador((c) => c + 1)}>+1</button>
      <button onClick={() => setContador(0)} disabled={contador === 0}>
        Zerar
      </button>
    </div>
  );
}

export function ListaDeCompras() {
  const [itens, setItens] = useState(["Arroz"]);

  function adicionar() {
    setItens((atual) => [...atual, `Item ${atual.length + 1}`]);
  }

  return (
    <div>
      <button onClick={adicionar}>Adicionar</button>
      <p>
        {itens.length} itens: {itens.join(", ")}
      </p>
    </div>
  );
}
```

## Explicando o código

- `useState(0)` começa o contador em zero e devolve o valor e a função que o altera.
- `onClick={() => setContador((c) => c + 1)}` passa uma função; o React a chama no clique.
- O botão "Zerar" fica desabilitado quando não há o que zerar: a interface reflete o estado.
- Em `adicionar`, `[...atual, novo]` cria uma lista nova; `atual.push(...)` alteraria a lista antiga e o React poderia não perceber a mudança.

## Erros comuns

- **`onClick={setContador(contador + 1)}`**: chama a função durante a renderização e causa um laço infinito. Passe uma função: `onClick={() => ...}`.
- **Esperar o valor novo logo após o `set`**: `setContador(5); console.log(contador)` ainda mostra o valor antigo nesta renderização.
- **Mutar arrays e objetos do estado**.

## Resumo

- `useState` guarda dados que mudam e provoca nova renderização.
- Eventos recebem funções.
- Atualize arrays e objetos criando cópias.

## Próximo passo

Na próxima aula você vai mostrar listas de dados e decidir o que aparece conforme condições.

<!-- aula: listas-e-renderizacao-condicional -->
## Por que isso importa

Quase toda tela mostra listas (produtos, mensagens, tarefas) e conteúdo que depende de condições (carregando, vazio, erro). Fazer isso direito evita bugs sutis e telas em branco.

## Conceitos fundamentais

- **Listas**: transforme arrays em elementos com `map`.
- **`key`**: cada item precisa de uma chave **única e estável** (como um `id` vindo do banco). Ela ajuda o React a saber qual item mudou, entrou ou saiu.
- Evite usar o índice como `key` quando a lista pode ser reordenada, filtrada ou ter itens removidos.
- **Renderização condicional**:
  - `if` com `return` antecipado para casos inteiros (carregando, erro).
  - Ternário `cond ? <A /> : <B />` para escolher entre dois.
  - `cond && <A />` para mostrar ou não mostrar.
- Cuidado: `{lista.length && <Lista />}` mostra um **0** na tela quando a lista está vazia. Use `lista.length > 0 &&`.

## Exemplo prático

```jsx
export function ListaTarefas({ tarefas, filtro }) {
  const visiveis = tarefas.filter((t) => (filtro === "pendentes" ? !t.feita : true));

  if (tarefas.length === 0) {
    return <p>Nenhuma tarefa ainda. Que tal criar a primeira?</p>;
  }

  return (
    <>
      {visiveis.length === 0 ? (
        <p>Tudo feito por aqui!</p>
      ) : (
        <ul>
          {visiveis.map((t) => (
            <li key={t.id} className={t.feita ? "feita" : undefined}>
              {t.titulo}
            </li>
          ))}
        </ul>
      )}
      {tarefas.length > 0 && <p>{tarefas.length} tarefas no total</p>}
    </>
  );
}
```

## Explicando o código

- O `return` antecipado trata o estado vazio com uma mensagem que convida à ação.
- O ternário escolhe entre "tudo feito" e a lista filtrada.
- `key={t.id}` usa o identificador estável de cada tarefa.
- A última linha usa `tarefas.length > 0 &&`, que nunca imprime "0".

## Erros comuns

- **Esquecer a `key`**: o React avisa no console e pode trocar o estado entre itens.
- **`key` aleatória** (`Math.random()`): muda a cada renderização e recria todos os itens.
- **`{0 && ...}`** aparecendo na tela.

## Resumo

- `map` transforma dados em elementos; cada um precisa de `key` estável.
- Use `return` antecipado, ternário e `&&` conforme o caso.
- Trate sempre os estados vazio, carregando e erro.

## Próximo passo

A seguir você vai criar formulários em que o React controla cada campo.

<!-- aula: formularios-controlados -->
## Por que isso importa

Formulários são onde a pessoa conversa com a aplicação: cadastro, busca, filtros, comentários. Em React, o jeito mais comum é deixar o **estado** ser a fonte da verdade de cada campo. Assim fica fácil validar, mostrar erros e limpar o formulário.

## Conceitos fundamentais

- **Campo controlado**: o `value` vem do estado e o `onChange` atualiza o estado.
- `evento.target.value` traz o texto digitado; em checkbox, use `evento.target.checked`.
- **`onSubmit` no `<form>`** (e não só `onClick` no botão), com `evento.preventDefault()`. Assim Enter também envia.
- **Validação na interface** melhora a experiência, mas o servidor sempre valida de novo.
- **Acessibilidade**: `<label htmlFor>` em todo campo e mensagens de erro ligadas com `aria-describedby`.

## Exemplo prático

```jsx
import { useState } from "react";

export function FormularioContato({ aoEnviar }) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    if (!email.includes("@")) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (mensagem.trim().length < 10) {
      setErro("A mensagem precisa ter pelo menos 10 caracteres.");
      return;
    }
    setErro("");
    aoEnviar({ email, mensagem: mensagem.trim() });
    setMensagem("");
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="mensagem">Mensagem</label>
      <textarea
        id="mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        aria-describedby={erro ? "erro-form" : undefined}
      />

      {erro && (
        <p id="erro-form" role="alert">
          {erro}
        </p>
      )}
      <button type="submit">Enviar mensagem</button>
    </form>
  );
}
```

## Explicando o código

- Cada campo tem `value` + `onChange`: o estado e a tela ficam sempre iguais.
- `enviar` impede o recarregamento, valida e, se estiver tudo certo, chama a função recebida por props (`aoEnviar`). Quem usa o formulário decide o que fazer com os dados.
- `role="alert"` faz leitores de tela anunciarem o erro.
- `noValidate` desliga os balões nativos do navegador para usar as mensagens próprias.

## Erros comuns

- **`value` sem `onChange`**: o campo fica travado e o React avisa.
- **Validar só no clique do botão**: Enter dentro do campo envia sem passar pela validação. Use `onSubmit`.
- **Mensagem de erro solta**, sem ligação com o campo: leitores de tela não a encontram.

## Resumo

- Campos controlados: `value` do estado e `onChange` atualizando.
- Envie com `onSubmit` e `preventDefault`.
- Valide com mensagens acessíveis; o servidor valida de novo.

## Próximo passo

Na próxima aula você vai buscar dados de APIs com `useEffect`.

<!-- aula: useeffect-e-apis -->
## Por que isso importa

Componentes muitas vezes precisam de dados que estão em outro lugar: uma API, o `localStorage`, o tamanho da janela. O **`useEffect`** sincroniza o componente com esses sistemas externos. É também uma das partes do React em que mais se cometem erros, por isso vale entender bem.

## Conceitos fundamentais

- `useEffect(funcao, dependencias)` roda a função **depois** da renderização.
- **Dependências**: o efeito roda de novo quando algum valor da lista muda. `[]` significa "só ao montar o componente".
- **Limpeza**: a função pode devolver outra função, chamada antes de o efeito rodar de novo ou quando o componente sai da tela. Use para cancelar requisições, timers e ouvintes.
- **Condição de corrida**: se o usuário troca de página rápido, uma resposta antiga pode chegar depois da nova. O `AbortController` cancela a requisição anterior.
- **Você pode não precisar de um efeito**: valores calculados a partir de props ou estado devem ser calculados direto na renderização.
- Em projetos maiores, bibliotecas como TanStack Query cuidam de cache e recarregamento.

## Exemplo prático

```jsx
import { useEffect, useState } from "react";

export function Usuario({ id }) {
  const [estado, setEstado] = useState({ status: "carregando" });

  useEffect(() => {
    const controle = new AbortController();

    fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { signal: controle.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((dados) => setEstado({ status: "sucesso", dados }))
      .catch((erro) => {
        if (erro.name !== "AbortError") setEstado({ status: "erro" });
      });

    return () => controle.abort();
  }, [id]);

  if (estado.status === "carregando") return <p>Carregando...</p>;
  if (estado.status === "erro") return <p>Não foi possível carregar o usuário.</p>;
  return <h2>{estado.dados.name}</h2>;
}
```

## Explicando o código

- O efeito depende de `[id]`: trocar o usuário dispara uma nova busca.
- A limpeza (`controle.abort()`) cancela a busca anterior, evitando que uma resposta antiga sobrescreva a nova.
- O erro de cancelamento (`AbortError`) é ignorado de propósito; os outros viram estado de erro.
- O estado descreve as três situações, e a renderização trata cada uma.

## Erros comuns

- **Esquecer as dependências**: o efeito usa um valor antigo ou nunca atualiza.
- **Atualizar, dentro do efeito, um estado que está nas dependências** sem condição: laço infinito.
- **Usar efeito para calcular valores derivados** (como um total a partir da lista): calcule direto na renderização.

## Resumo

- `useEffect` sincroniza o componente com sistemas externos.
- Liste as dependências e limpe o que o efeito criou.
- Trate carregando, sucesso e erro; cancele requisições obsoletas.

## Próximo passo

A seguir você vai organizar o projeto: componentes reutilizáveis, hooks próprios e estrutura de pastas.

<!-- aula: organizacao-e-hooks -->
## Por que isso importa

Projetos React crescem rápido. Sem organização, a mesma lógica aparece copiada em dez componentes e ninguém sabe onde fica cada coisa. Componentes reutilizáveis e **hooks próprios** mantêm o código enxuto, e uma estrutura de pastas previsível ajuda qualquer pessoa a se achar.

## Conceitos fundamentais

- **Hook próprio**: uma função cujo nome começa com `use` e que usa outros hooks. Serve para extrair lógica com estado e reutilizá-la.
- **Componentes de apresentação** (só mostram o que recebem) e **componentes de dados** (buscam e decidem o que mostrar).
- **Elevar o estado**: quando dois componentes irmãos precisam do mesmo dado, o estado sobe para o pai comum e desce por props.
- **Context**: para dados usados em muitos lugares (tema, usuário logado), evitando passar props por vários níveis.
- **Estrutura de pastas** comum: `components/` (peças reutilizáveis), `features/` ou `pages/` (telas), `hooks/` e `lib/` ou `services/` (acesso a APIs).
- **Tratamento de erros**: um *error boundary* mostra uma tela amigável quando algo quebra durante a renderização (frameworks como o Next.js oferecem isso com arquivos `error`).

## Exemplo prático

Um hook que guarda um valor no `localStorage`:

```jsx
import { useEffect, useState } from "react";

export function useLocalStorage(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const salvo = localStorage.getItem(chave);
      return salvo !== null ? JSON.parse(salvo) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // armazenamento cheio ou bloqueado: segue só em memória
    }
  }, [chave, valor]);

  return [valor, setValor];
}

export function PreferenciaTema() {
  const [tema, setTema] = useLocalStorage("tema", "escuro");
  return <button onClick={() => setTema(tema === "escuro" ? "claro" : "escuro")}>Tema atual: {tema}</button>;
}
```

## Explicando o código

- `useLocalStorage` funciona como um `useState` que também salva no navegador.
- O estado inicial usa uma **função** (`useState(() => ...)`): ela roda só na primeira renderização, evitando ler o `localStorage` a cada render.
- Os `try/catch` protegem contra dados corrompidos e navegação privada.
- Qualquer componente pode reutilizar o hook com outra chave.

## Erros comuns

- **Hook sem o prefixo `use`**: as ferramentas não conseguem verificar as regras dos hooks.
- **Context para tudo**: cada mudança no contexto redesenha todos que o usam. Use para dados realmente globais.
- **Pastas por tipo de arquivo em projetos grandes**: agrupar por funcionalidade (`features/carrinho/`) escala melhor.

## Resumo

- Hooks próprios reutilizam lógica com estado.
- Eleve o estado quando irmãos precisam do mesmo dado; use Context com moderação.
- Uma estrutura de pastas previsível facilita a manutenção.

## Próximo passo

Na última aula da trilha, você vai garantir que seus componentes sejam acessíveis e testados.

<!-- aula: acessibilidade-e-testes -->
## Por que isso importa

Um componente bonito que não funciona pelo teclado exclui pessoas; um componente sem testes quebra em silêncio na próxima mudança. As duas práticas andam juntas: os testes mais úteis em React interagem com a tela **como uma pessoa faria**, e isso só funciona se a interface for acessível.

## Conceitos fundamentais

- **Acessibilidade em React** é a mesma do HTML: elementos nativos (`button`, `a`, `label`), foco visível, textos alternativos. Atributos ARIA usam a grafia normal (`aria-label`, `aria-expanded`).
- **Foco**: ao abrir um modal, leve o foco para dentro; ao fechar, devolva ao botão que o abriu. Use `useRef` e `.focus()`.
- **Testing Library**: testa o componente pelo que aparece na tela, buscando elementos pelo papel e pelo nome acessível (`getByRole("button", { name: "Enviar" })`).
- **Vitest** ou **Jest** executam os testes.
- Teste o **comportamento** (o que a pessoa vê e faz), não detalhes internos, como nomes de estados.

## Exemplo prático

O componente:

```jsx
import { useState } from "react";

export function Curtir() {
  const [curtido, setCurtido] = useState(false);
  return (
    <button aria-pressed={curtido} onClick={() => setCurtido((c) => !c)}>
      {curtido ? "Curtido" : "Curtir"}
    </button>
  );
}
```

O teste:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Curtir } from "./Curtir";

test("alterna entre curtir e curtido", async () => {
  render(<Curtir />);
  const botao = screen.getByRole("button", { name: "Curtir" });
  await userEvent.click(botao);
  expect(screen.getByRole("button", { name: "Curtido" })).toHaveAttribute("aria-pressed", "true");
});
```

## Explicando o código

- `aria-pressed` informa a leitores de tela que o botão funciona como um interruptor.
- O teste encontra o botão pelo **papel** (`button`) e pelo **nome** que a pessoa ouve ou lê: se o botão não fosse acessível, o teste nem o acharia.
- `userEvent.click` simula um clique real; depois, o teste confere o texto e o atributo.
- `toHaveAttribute` vem do pacote `@testing-library/jest-dom`, configurado no projeto de testes.

## Erros comuns

- **`<div onClick>` no lugar de `<button>`**: sem teclado e sem papel de botão.
- **Testar estado interno** em vez do que aparece na tela: o teste quebra em refatorações que não mudam nada para a pessoa usuária.
- **Buscar elementos por classes CSS** nos testes: prefira papéis, rótulos e textos.

## Resumo

- Acessibilidade em React segue o HTML: elementos nativos, foco e ARIA correto.
- Testing Library testa como uma pessoa usa a interface.
- Teste comportamento, não implementação.

## Próximo passo

Com o front-end dominado, siga para a trilha de **Node.js, HTTP e APIs** e construa o lado do servidor.
