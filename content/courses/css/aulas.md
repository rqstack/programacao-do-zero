<!-- aula: seletores-e-cascata -->
## Por que isso importa

HTML descreve **o que** é cada conteúdo; CSS define **como** ele aparece: cores, tamanhos, espaços e posição. Entender seletores e cascata é o que separa "o estilo não pega e eu não sei por quê" de controlar a aparência com confiança.

## Conceitos fundamentais

**Formas de aplicar CSS**: a recomendada é um arquivo separado, ligado no `<head>`:

```html
<link rel="stylesheet" href="estilos.css">
```

**Anatomia de uma regra**:

```css
seletor {
  propriedade: valor;
}
```

**Seletores básicos**:

- Elemento: `p` (todos os parágrafos).
- Classe: `.destaque` (elementos com `class="destaque"`). É o seletor mais usado.
- ID: `#topo` (o elemento com `id="topo"`).
- Descendente: `nav a` (links dentro de `nav`).
- Grupo: `h1, h2` (os dois).

**Cascata**: quando várias regras disputam a mesma propriedade, o navegador decide por três critérios, nesta ordem:

1. **Origem e importância** (estilos do navegador, seus estilos, `!important`).
2. **Especificidade** do seletor (tema da próxima aula).
3. **Ordem**: com empate, vence a regra que aparece **por último**.

**Herança**: algumas propriedades, como `color` e `font-family`, passam de pai para filho. Outras, como `border` e `margin`, não.

## Exemplo prático

```html
<p>Parágrafo comum.</p>
<p class="destaque">Parágrafo em destaque.</p>
```

```css
body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

p {
  color: #374151;
}

.destaque {
  color: #1d4ed8;
  font-weight: 700;
}

p {
  line-height: 1.6;
}
```

## Explicando o código

- `font-family` e `color` no `body` são herdados por todos os elementos dentro dele.
- `p` sobrescreve a cor herdada para parágrafos.
- `.destaque` é mais específico do que `p`, então o segundo parágrafo fica azul e em negrito.
- A segunda regra `p` não conflita com a primeira: ela só acrescenta `line-height`.

## Erros comuns

- **Esquecer o ponto da classe**: `destaque { }` procura um elemento `<destaque>`, que não existe.
- **Caminho errado no `<link>`**: o CSS simplesmente não carrega. Confira na aba Rede (Network) das ferramentas do navegador.
- **Esquecer o ponto e vírgula** entre declarações: a declaração seguinte é ignorada.

## Resumo

- Regras CSS têm seletor, propriedade e valor.
- Classes são o seletor mais usado e reutilizável.
- A cascata decide conflitos por importância, especificidade e ordem.

## Próximo passo

Na próxima aula você vai entender a especificidade e trabalhar com cores e unidades de medida.

<!-- aula: especificidade-cores-e-unidades -->
## Por que isso importa

"Mudei o CSS e nada aconteceu" quase sempre tem a mesma causa: outra regra mais específica está vencendo. Saber calcular especificidade e escolher boas unidades evita gambiarras como `!important` espalhado pelo código.

## Conceitos fundamentais

**Especificidade** é um "placar" com três colunas: **(IDs, classes/atributos/pseudoclasses, elementos)**.

- `p` → (0, 0, 1)
- `.card p` → (0, 1, 1)
- `#menu a` → (1, 0, 1)
- `.card .titulo` → (0, 2, 0)

Compara-se da esquerda para a direita: qualquer ID vence qualquer quantidade de classes. Estilos inline (`style="..."`) vencem seletores, e `!important` vence quase tudo — por isso deve ser evitado.

Boa prática: estilize principalmente com **classes**, mantendo a especificidade baixa e parecida.

**Cores**:

- Nomes: `red`, `white`.
- Hexadecimal: `#1d4ed8`.
- `rgb(29 78 216)` e com transparência: `rgb(29 78 216 / 0.5)`.
- `hsl(224 76% 48%)`: matiz, saturação e luminosidade, prático para criar variações.

**Unidades**:

- `px`: pixels; bons para bordas finas.
- `rem`: relativo ao tamanho de fonte da raiz (normalmente 16px). Respeita a preferência de tamanho de fonte de quem usa o navegador. Ótimo para fontes e espaçamentos.
- `em`: relativo à fonte do próprio elemento.
- `%`: relativo ao elemento pai.
- `vw` e `vh`: porcentagem da largura e da altura da janela.

**Variáveis CSS** (propriedades personalizadas) centralizam valores:

```css
:root {
  --cor-primaria: #1d4ed8;
}
```

## Exemplo prático

```css
:root {
  --cor-primaria: #1d4ed8;
  --espaco: 1rem;
}

.botao {
  background: var(--cor-primaria);
  color: #ffffff;
  padding: calc(var(--espaco) * 0.75) var(--espaco);
  font-size: 1rem;
  border-radius: 8px;
}

#cabecalho .botao {
  background: #111827;
}
```

## Explicando o código

- `var(--cor-primaria)` reutiliza a cor; mudar o valor em `:root` atualiza o site inteiro.
- `calc()` faz contas com unidades: 0,75rem de espaço vertical.
- O botão dentro de `#cabecalho` fica escuro porque `#cabecalho .botao` (1, 1, 0) vence `.botao` (0, 1, 0).

## Erros comuns

- **Usar `!important` para "consertar"**: resolve agora e cria um problema maior depois.
- **Usar IDs para estilizar**: a especificidade alta torna difícil sobrescrever.
- **Fontes em `px` fixos**: ignoram a preferência de tamanho de fonte da pessoa usuária. Prefira `rem`.

## Resumo

- Especificidade: IDs > classes > elementos.
- Estilize com classes e evite `!important`.
- Prefira `rem` para fontes e espaços; use variáveis CSS para valores repetidos.

## Próximo passo

Na próxima aula você vai entender o box model, a base de todo espaçamento em CSS.

<!-- aula: box-model -->
## Por que isso importa

Para o navegador, **todo elemento é uma caixa**. Entender como o tamanho dessa caixa é calculado explica por que elementos "estouram" a largura esperada, por que margens às vezes "somem" e como criar espaçamentos consistentes.

## Conceitos fundamentais

Cada caixa tem quatro camadas, de dentro para fora:

1. **Content**: o conteúdo (texto, imagem).
2. **Padding**: espaço interno, entre o conteúdo e a borda. Recebe a cor de fundo.
3. **Border**: a borda.
4. **Margin**: espaço externo, que afasta a caixa das vizinhas. É transparente.

**`box-sizing`**:

- `content-box` (padrão): `width` define só o conteúdo. Padding e borda são **somados** por fora.
- `border-box`: `width` inclui conteúdo, padding e borda. É muito mais previsível.

Por isso, quase todo projeto começa com:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**Atalhos**: `padding: 8px 16px` (vertical, horizontal); `margin: 0 auto` centraliza horizontalmente um bloco com largura definida.

**Colapso de margens**: margens **verticais** de blocos vizinhos não se somam; vale a maior. Duas margens de 20px e 30px resultam em 30px de distância.

## Exemplo prático

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

.cartao {
  width: 300px;
  padding: 24px;
  border: 2px solid #d1d5db;
  margin: 0 auto 32px;
  background: #ffffff;
}
```

## Explicando o código

- Com `border-box`, o cartão ocupa exatamente 300px de largura: o conteúdo fica com 300 − 48 (padding) − 4 (bordas) = 248px.
- Com `content-box`, ele ocuparia 300 + 48 + 4 = 352px, o que costuma quebrar layouts.
- `margin: 0 auto 32px` significa: 0 em cima, `auto` nas laterais (centraliza) e 32px embaixo.

## Erros comuns

- **Esquecer o `border-box`** e brigar com larguras que nunca batem.
- **Usar margin para espaço interno**: fundo e área clicável não crescem com margin, só com padding.
- **Estranhar o colapso de margens**: ele é comportamento esperado em blocos verticais.

## Resumo

- Toda caixa tem content, padding, border e margin.
- `box-sizing: border-box` torna as larguras previsíveis.
- Margens verticais adjacentes colapsam.

## Próximo passo

Na próxima aula você vai trabalhar a tipografia: fontes, tamanhos, altura de linha e legibilidade.

<!-- aula: tipografia -->
## Por que isso importa

Na web, a maior parte do conteúdo é texto. Tipografia bem cuidada deixa a leitura confortável e a página com aparência profissional; tipografia descuidada cansa os olhos e afasta as pessoas, mesmo com um conteúdo excelente.

## Conceitos fundamentais

- **`font-family`**: a família de fontes, com alternativas separadas por vírgula. Termine sempre com uma família genérica (`sans-serif`, `serif`, `monospace`).
- **`font-size`**: o tamanho. Use `rem` para respeitar as preferências da pessoa usuária.
- **`font-weight`**: o peso (400 normal, 700 negrito).
- **`line-height`**: altura da linha. Entre 1.4 e 1.7 funciona bem para textos corridos. Use números sem unidade.
- **Largura da linha**: linhas muito longas cansam. Algo entre 60 e 80 caracteres por linha é confortável; a unidade `ch` ajuda (`max-width: 70ch`).
- **Escala tipográfica**: tamanhos que seguem uma proporção (por exemplo, multiplicar por 1,25 a cada nível) criam hierarquia consistente.
- **`clamp(min, ideal, máx)`**: tamanhos fluidos que crescem com a tela, mas dentro de limites.

**Fontes da web**: serviços como o Google Fonts fornecem fontes via `<link>`. Use `font-display: swap` para o texto aparecer com uma fonte de reserva enquanto a fonte final carrega, e carregue só os pesos que vai usar.

## Exemplo prático

```css
:root {
  font-size: 100%;
}

body {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
}

h1 {
  font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
  line-height: 1.15;
  font-weight: 700;
}

.artigo {
  max-width: 70ch;
  margin-inline: auto;
}
```

## Explicando o código

- `font-size: 100%` na raiz respeita o tamanho de fonte que a pessoa configurou no navegador.
- Se a fonte "Inter" não carregar, o navegador usa a fonte do sistema.
- O título nunca fica menor que 1,75rem nem maior que 3rem, e cresce suavemente com a largura da tela.
- `max-width: 70ch` limita a largura da linha; `margin-inline: auto` centraliza o bloco.

## Erros comuns

- **Texto cinza-claro sobre fundo branco**: contraste insuficiente.
- **Carregar muitos pesos de fonte**: cada peso é um arquivo a mais para baixar.
- **`line-height` com unidade fixa** (`20px`): não acompanha mudanças de tamanho de fonte.

## Resumo

- Use `rem`, `line-height` sem unidade e linhas de 60 a 80 caracteres.
- Sempre ofereça fontes de reserva.
- `clamp()` cria títulos fluidos com limites.

## Próximo passo

A seguir, você vai controlar como os elementos se comportam e se posicionam com `display` e `position`.

<!-- aula: display-e-position -->
## Por que isso importa

Por que um `<span>` ignora a largura que você definiu? Como fixar um cabeçalho no topo? Como colocar um selo no canto de um card? As propriedades `display` e `position` respondem a essas perguntas e são a base dos layouts.

## Conceitos fundamentais

**`display`** define como a caixa participa do fluxo:

- `block`: ocupa a linha inteira e aceita largura e altura (ex.: `div`, `p`).
- `inline`: flui com o texto e ignora largura/altura (ex.: `span`, `a`).
- `inline-block`: flui com o texto, mas aceita largura, altura e padding vertical.
- `none`: remove o elemento da página (também para leitores de tela).
- `flex` e `grid`: ativam os sistemas de layout das próximas aulas.

**`position`**:

- `static` (padrão): segue o fluxo normal.
- `relative`: continua no fluxo, mas pode ser deslocado com `top`/`left`; também vira **referência** para filhos absolutos.
- `absolute`: sai do fluxo e é posicionado em relação ao ancestral posicionado mais próximo.
- `fixed`: posicionado em relação à janela; não rola com a página.
- `sticky`: comporta-se como relativo até atingir um limite durante a rolagem e então "gruda".

**`z-index`** controla o que fica por cima quando elementos posicionados se sobrepõem.

## Exemplo prático

```css
.cabecalho {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
}

.card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.card .selo {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.75rem;
}
```

## Explicando o código

- O cabeçalho rola normalmente até encostar no topo (`top: 0`) e então fica preso.
- `.card` recebe `position: relative` só para servir de referência.
- `.selo` é absoluto em relação ao card, no canto superior direito. Sem o `relative` no card, ele se posicionaria em relação à página inteira.

## Erros comuns

- **Esquecer o `relative` no pai** de um elemento absoluto.
- **Usar `position: absolute` para montar o layout inteiro**: tudo quebra em outras telas. Use Flexbox e Grid.
- **`z-index` sem efeito**: ele só funciona em elementos posicionados (ou itens de flex/grid).
- **`sticky` que não gruda**: falta `top`, ou um ancestral tem `overflow: hidden`.

## Resumo

- `display` define o comportamento da caixa no fluxo.
- `relative` cria referência; `absolute` posiciona em relação a ela.
- `sticky` e `fixed` mantêm elementos visíveis durante a rolagem.

## Próximo passo

Na próxima aula você vai aprender Flexbox, a ferramenta mais usada para alinhar elementos.

<!-- aula: flexbox -->
## Por que isso importa

Centralizar um elemento, colocar itens lado a lado, distribuir espaço entre botões: antes do Flexbox isso exigia truques. Hoje é questão de duas ou três propriedades. Flexbox é a ferramenta do dia a dia para layouts em **uma dimensão** — uma linha ou uma coluna.

## Conceitos fundamentais

Aplicar `display: flex` em um elemento transforma-o em **contêiner flex**, e seus filhos diretos viram **itens flex**.

- **Eixo principal**: definido por `flex-direction` (`row`, o padrão, ou `column`).
- **Eixo cruzado**: perpendicular ao principal.

No contêiner:

- `justify-content`: distribui os itens no eixo principal (`flex-start`, `center`, `space-between`, `space-around`).
- `align-items`: alinha no eixo cruzado (`stretch`, `center`, `flex-start`).
- `gap`: espaço entre os itens.
- `flex-wrap: wrap`: permite quebrar em várias linhas.

Nos itens:

- `flex: 1`: o item cresce para ocupar o espaço disponível.
- `flex-shrink: 0`: impede o item de encolher.

## Exemplo prático

```html
<header class="barra">
  <a class="logo" href="/">Loja</a>
  <nav class="menu">
    <a href="/produtos">Produtos</a>
    <a href="/contato">Contato</a>
  </nav>
</header>
```

```css
.barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.menu {
  display: flex;
  gap: 1.5rem;
}

.centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

## Explicando o código

- Na `.barra`, o logo vai para a esquerda e o menu para a direita (`space-between`), ambos centralizados verticalmente.
- O `.menu` também é flex, organizando os links em linha com espaço entre eles.
- `.centralizado` centraliza qualquer conteúdo nos dois eixos — a famosa centralização perfeita.

## Erros comuns

- **Aplicar propriedades de contêiner nos itens**: `justify-content` vai no pai, não no filho.
- **Esquecer que só os filhos diretos são itens flex**.
- **Usar margens para espaçar itens** quando `gap` resolve de forma mais limpa.
- **Itens que transbordam no celular**: use `flex-wrap: wrap`.

## Resumo

- Flexbox organiza itens em uma dimensão.
- `justify-content` no eixo principal; `align-items` no cruzado.
- `gap` espaça, `flex: 1` faz crescer, `flex-wrap` permite quebrar.

## Próximo passo

A seguir, você vai aprender CSS Grid, ideal para layouts em duas dimensões.

<!-- aula: grid -->
## Por que isso importa

Galerias de produtos, painéis com vários blocos, layouts de página com cabeçalho, barra lateral e conteúdo: quando você precisa controlar **linhas e colunas ao mesmo tempo**, o CSS Grid é a ferramenta certa.

## Conceitos fundamentais

- `display: grid` cria o contêiner.
- `grid-template-columns`: define as colunas. Ex.: `200px 1fr` (uma fixa e uma flexível).
- **`fr`**: fração do espaço disponível. `1fr 2fr` divide em três partes, com a segunda ocupando duas.
- `repeat(3, 1fr)`: três colunas iguais.
- `gap`: espaço entre linhas e colunas.
- `minmax(min, max)`: tamanho com limites.
- **`repeat(auto-fit, minmax(220px, 1fr))`**: cria quantas colunas couberem, cada uma com pelo menos 220px. É responsivo sem media queries.
- `grid-column: span 2`: o item ocupa duas colunas.
- `grid-template-areas`: nomeia regiões do layout de forma visual.

**Flexbox ou Grid?** Flexbox para alinhar itens em uma direção (menus, barras de botões); Grid para estruturas em duas dimensões (galerias, layouts de página). Eles também funcionam juntos.

## Exemplo prático

```css
.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.pagina {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "topo topo"
    "lateral conteudo"
    "rodape rodape";
  gap: 1rem;
  min-height: 100vh;
}

.pagina > header { grid-area: topo; }
.pagina > aside { grid-area: lateral; }
.pagina > main { grid-area: conteudo; }
.pagina > footer { grid-area: rodape; }
```

## Explicando o código

- A `.galeria` mostra 1 coluna no celular e mais colunas conforme a tela cresce, sem nenhuma media query.
- Em `.pagina`, as áreas nomeadas desenham o layout: o topo e o rodapé ocupam as duas colunas.
- Cada filho direto é colocado em sua área com `grid-area`.

## Erros comuns

- **Confundir `auto-fit` com `auto-fill`**: com poucos itens, `auto-fit` estica os itens; `auto-fill` mantém colunas vazias.
- **Áreas com formato inválido**: cada área nomeada precisa formar um retângulo.
- **Esquecer a versão móvel do layout com sidebar**: em telas pequenas, mude para uma coluna (próxima aula).

## Resumo

- Grid controla linhas e colunas simultaneamente.
- `fr`, `repeat`, `minmax` e `auto-fit` criam layouts flexíveis.
- `grid-template-areas` descreve layouts de forma legível.

## Próximo passo

Na próxima aula você vai adaptar tudo isso a diferentes tamanhos de tela: responsividade.

<!-- aula: responsividade -->
## Por que isso importa

A maior parte dos acessos à internet no Brasil acontece pelo celular. Uma página que só funciona no computador perde gente logo no primeiro acesso. Design responsivo faz o mesmo HTML se adaptar a qualquer tela.

## Conceitos fundamentais

- **Meta viewport** (no HTML): obrigatória para o celular não simular uma tela larga.
- **Mobile first**: escreva primeiro o estilo para telas pequenas e acrescente ajustes para telas maiores com `min-width`. O CSS fica mais simples.
- **Media queries**: aplicam regras sob condições.

```css
@media (min-width: 768px) {
  /* regras para telas a partir de 768px */
}
```

- **Breakpoints**: escolha pelos pontos onde **o seu conteúdo** quebra, não por modelos de aparelho.
- **Imagens fluidas**: `max-width: 100%; height: auto;` impede que imagens transbordem.
- **Unidades relativas** (`rem`, `%`, `fr`) e técnicas como `clamp()` e `auto-fit` reduzem a necessidade de media queries.
- **Áreas de toque**: botões e links com pelo menos cerca de 44×44 pixels são mais fáceis de tocar.

## Exemplo prático

```css
img {
  max-width: 100%;
  height: auto;
}

.layout {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 240px 1fr;
    padding: 2rem;
  }
}

.botao {
  min-height: 44px;
  padding: 0.75rem 1.25rem;
}
```

## Explicando o código

- No celular, `.layout` tem uma coluna só (o padrão do grid).
- A partir de 768px, ganha a coluna lateral e mais espaçamento.
- Imagens nunca ficam mais largas que o contêiner.
- O botão tem altura mínima confortável para toque.

## Erros comuns

- **Rolagem horizontal no celular**: geralmente causada por larguras fixas (`width: 1200px`) ou imagens sem `max-width`. Use as ferramentas do navegador (modo dispositivo) para encontrar o culpado.
- **Escrever desktop first** e acumular dezenas de regras para "desfazer" estilos no celular.
- **Testar só redimensionando a janela**: teste também em um aparelho real quando possível.

## Resumo

- Comece pelo celular e expanda com `min-width`.
- Breakpoints seguem o conteúdo.
- Imagens fluidas e áreas de toque adequadas são obrigatórias.

## Próximo passo

Na última aula do curso, você vai dar vida às interfaces com estados, transições e animações acessíveis.

<!-- aula: estados-transicoes-e-animacoes -->
## Por que isso importa

Uma interface precisa responder ao que a pessoa faz: mostrar que um botão é clicável, que um campo está em foco, que algo mudou. Estados e animações sutis comunicam isso. Mas movimento em excesso distrai e pode causar mal-estar em pessoas com sensibilidade vestibular — por isso animar com responsabilidade faz parte do trabalho.

## Conceitos fundamentais

**Pseudoclasses** selecionam estados:

- `:hover`: ponteiro sobre o elemento.
- `:focus-visible`: foco vindo do teclado. Prefira-o a `:focus` para contornos de foco.
- `:active`: no momento do clique.
- `:disabled`, `:checked`, `:invalid`: estados de formulário.
- `:first-child`, `:nth-child(2n)`: posição entre irmãos.

**Pseudoelementos** criam partes "virtuais": `::before`, `::after`, `::placeholder`.

**Transições** suavizam a mudança entre dois estados:

```css
transition: background-color 150ms ease;
```

**Animações** usam `@keyframes` para sequências mais elaboradas.

**Desempenho**: anime de preferência `transform` e `opacity`; elas não forçam o navegador a recalcular o layout.

**Movimento reduzido**: a media query `prefers-reduced-motion: reduce` detecta quem pediu ao sistema operacional menos animações. Respeite essa escolha.

## Exemplo prático

```css
.botao {
  background: #1d4ed8;
  color: #ffffff;
  transition: background-color 150ms ease, transform 150ms ease;
}

.botao:hover {
  background: #1e40af;
}

.botao:active {
  transform: scale(0.98);
}

.botao:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

@keyframes aparecer {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.aviso {
  animation: aparecer 300ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .botao,
  .aviso {
    transition: none;
    animation: none;
  }
}
```

## Explicando o código

- O botão muda de cor no hover e "afunda" levemente no clique, com transições curtas.
- `:focus-visible` mostra um contorno bem visível para quem navega pelo teclado.
- O aviso aparece com um leve movimento de baixo para cima, usando apenas `opacity` e `transform`.
- Quem prefere movimento reduzido vê os mesmos estados, sem animação.

## Erros comuns

- **Remover o contorno de foco** com `outline: none` sem substituto.
- **Animar `width`, `height` ou `top`**: causa recálculo de layout e travamentos.
- **Animações longas em ações frequentes**: mais de 300ms em um botão já parece lento.
- **Ignorar `prefers-reduced-motion`**.

## Resumo

- Pseudoclasses estilizam estados; pseudoelementos criam partes extras.
- Anime `transform` e `opacity`, com durações curtas.
- Sempre respeite `prefers-reduced-motion` e mantenha o foco visível.

## Próximo passo

Você concluiu o curso de CSS. O próximo passo é o curso de **JavaScript**, onde suas páginas passam a reagir e a buscar dados.
