<!-- aula: estrutura-do-documento -->
## Por que isso importa

Toda página da web começa como um arquivo HTML. O navegador lê esse arquivo e decide o que mostrar. Se a estrutura básica estiver errada, acentos aparecem quebrados, a página fica minúscula no celular e mecanismos de busca não entendem o conteúdo. Acertar a base evita esses problemas desde o início.

## Conceitos fundamentais

**HTML** (HyperText Markup Language) é uma linguagem de **marcação**: ela não calcula nada, apenas descreve o que cada parte do conteúdo é — um título, um parágrafo, um link.

Um documento HTML mínimo tem:

- `<!DOCTYPE html>`: avisa ao navegador que é HTML moderno.
- `<html lang="pt-BR">`: o elemento raiz, com o idioma da página (leitores de tela usam essa informação para a pronúncia).
- `<head>`: informações **sobre** a página, que não aparecem no corpo: codificação, título da aba, descrição.
- `<body>`: tudo o que aparece na tela.

Duas linhas do `<head>` são indispensáveis:

- `<meta charset="UTF-8">`: garante que "ação" e "você" apareçam corretamente.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`: faz a página se ajustar à largura do celular.

## Exemplo prático

Crie um arquivo chamado `index.html` em um editor de código (como o VS Code), cole o conteúdo abaixo e abra o arquivo no navegador com um duplo clique:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Minha primeira página</title>
  </head>
  <body>
    <h1>Olá! Esta é minha primeira página.</h1>
    <p>Estou aprendendo HTML na Programação do Zero.</p>
  </body>
</html>
```

## Explicando o código

- O texto de `<title>` aparece na aba do navegador, não na página.
- `<h1>` é o título principal; `<p>` é um parágrafo.
- O recuo (indentação) não muda o resultado, mas mostra quem está dentro de quem. Isso é a **hierarquia** do documento: `<head>` e `<body>` são "filhos" de `<html>`.

## Erros comuns

- **Esquecer o `charset`**: acentos viram símbolos estranhos.
- **Esquecer o `viewport`**: no celular, a página aparece reduzida como se fosse uma tela de computador.
- **Colocar conteúdo visível no `<head>`**: textos ali não são exibidos.
- **Salvar o arquivo com extensão errada**, como `index.html.txt`. Ative a exibição de extensões no seu sistema.

## Resumo

- HTML descreve o significado do conteúdo.
- Todo documento tem `<!DOCTYPE html>`, `<html>`, `<head>` e `<body>`.
- `charset` e `viewport` são obrigatórios na prática.

## Próximo passo

Na próxima aula você vai conhecer as tags de texto: títulos, parágrafos, ênfase e quebras.

<!-- aula: titulos-paragrafos-e-textos -->
## Por que isso importa

A maior parte da web é texto. Organizar esse texto com os elementos certos deixa a página fácil de ler, de navegar com leitor de tela e de ser encontrada em buscadores. Escolher a tag pelo **significado**, e não pela aparência, é o hábito mais importante de quem escreve HTML.

## Conceitos fundamentais

Um **elemento** HTML normalmente tem:

- **Tag de abertura**: `<p>`
- **Conteúdo**: o texto
- **Tag de fechamento**: `</p>`

Alguns elementos não têm conteúdo nem fechamento, como `<br>` (quebra de linha) e `<img>`.

**Atributos** adicionam informações à tag de abertura: `<p lang="en">`.

Tags de texto essenciais:

- `<h1>` a `<h6>`: títulos em níveis. Use um `<h1>` por página e não pule níveis (de `<h2>` direto para `<h4>`).
- `<p>`: parágrafo.
- `<strong>`: importância forte (geralmente exibido em negrito).
- `<em>`: ênfase (geralmente em itálico).
- `<br>`: quebra de linha dentro de um mesmo bloco, como em endereços e poemas.

**Elementos de bloco** (como `<h1>` e `<p>`) ocupam a linha inteira; **elementos em linha** (como `<strong>`) ficam dentro do texto.

## Exemplo prático

```html
<h1>Receita de pão caseiro</h1>
<p>Um pão simples para fazer em casa, com <strong>apenas quatro ingredientes</strong>.</p>

<h2>Modo de preparo</h2>
<p>Misture tudo e <em>sove bem</em> por dez minutos.</p>

<h2>Onde comprar</h2>
<p>Mercado Central<br>Rua das Flores, 100</p>
```

## Explicando o código

- O `<h1>` diz do que trata a página; os `<h2>` dividem as seções. Leitores de tela permitem pular de título em título, então essa hierarquia funciona como um sumário.
- `<strong>` destaca uma informação importante; `<em>` muda a ênfase da frase.
- `<br>` separa linhas do endereço sem criar um novo parágrafo.

## Erros comuns

- **Escolher título pelo tamanho**: usar `<h4>` só porque a letra é menor. O tamanho se ajusta com CSS; a tag indica o nível.
- **Usar vários `<br>` para criar espaço**: espaçamento é papel do CSS.
- **Esquecer de fechar tags**: o navegador tenta corrigir, mas o resultado pode ser inesperado.
- **Aninhar errado**: `<p><strong>texto</p></strong>` fecha na ordem errada. O correto é fechar primeiro o que abriu por último.

## Resumo

- Elementos têm abertura, conteúdo e fechamento; atributos ficam na abertura.
- Títulos formam a hierarquia da página: um `<h1>`, sem pular níveis.
- Escolha tags pelo significado, não pela aparência.

## Próximo passo

A seguir, você vai conectar páginas com links e exibir imagens com textos alternativos.

<!-- aula: links-e-imagens -->
## Por que isso importa

A web é uma rede de documentos ligados entre si. Links são o que transforma páginas soltas em um site navegável. Imagens deixam o conteúdo mais claro — desde que todo mundo consiga entendê-las, inclusive quem usa leitor de tela.

## Conceitos fundamentais

**Links** usam o elemento `<a>` com o atributo `href` (o destino):

- **Absoluto**: endereço completo, `https://developer.mozilla.org`.
- **Relativo**: caminho a partir do arquivo atual, `contato.html` ou `paginas/sobre.html`.
- **Âncora**: leva a uma parte da mesma página, `#precos`, apontando para um elemento com `id="precos"`.
- **E-mail**: `mailto:contato@exemplo.com`.

Para abrir em nova aba, use `target="_blank"` junto com `rel="noopener noreferrer"`, que impede a nova página de controlar a anterior.

**Imagens** usam `<img>`, que não tem fechamento:

- `src`: o caminho do arquivo.
- `alt`: o **texto alternativo**, lido por leitores de tela e exibido se a imagem não carregar.
- `width` e `height`: reservam o espaço da imagem e evitam que o layout "pule" durante o carregamento.

Como escrever um bom `alt`: descreva a **função** da imagem no contexto. Imagens puramente decorativas recebem `alt=""` (vazio), para serem ignoradas pelo leitor de tela.

## Exemplo prático

```html
<nav>
  <a href="index.html">Início</a>
  <a href="#contato">Contato</a>
  <a href="https://developer.mozilla.org/pt-BR/" target="_blank" rel="noopener noreferrer">Documentação MDN</a>
</nav>

<img src="imagens/bolo.jpg" alt="Bolo de cenoura com cobertura de chocolate em uma travessa" width="640" height="427">

<h2 id="contato">Contato</h2>
<p>Escreva para <a href="mailto:contato@exemplo.com">contato@exemplo.com</a>.</p>
```

## Explicando o código

- `index.html` é relativo: o navegador procura o arquivo na mesma pasta.
- `#contato` rola a página até o elemento com `id="contato"`.
- O link externo abre em nova aba com `rel` de segurança.
- O `alt` descreve o que a imagem mostra de forma útil para quem não pode vê-la.

## Erros comuns

- **Links com o texto "clique aqui"**: quem navega pela lista de links ouve só "clique aqui, clique aqui". O texto do link deve dizer para onde ele leva.
- **Esquecer o `alt`** ou escrever `alt="imagem"`, que não informa nada.
- **Caminho errado da imagem**: confira pastas, maiúsculas e extensão (`.JPG` é diferente de `.jpg` em muitos servidores).
- **Imagens enormes**: fotos de vários megabytes deixam a página lenta. Redimensione antes de publicar.

## Resumo

- `<a href="...">` cria links absolutos, relativos, âncoras e de e-mail.
- `<img>` precisa de `src`, `alt` e, de preferência, `width` e `height`.
- O texto do link e o `alt` devem fazer sentido sozinhos.

## Próximo passo

Na próxima aula você vai organizar informações com listas e tabelas.

<!-- aula: listas-e-tabelas -->
## Por que isso importa

Passos de uma receita, itens de um menu, preços de planos, horários de aula: muito conteúdo tem estrutura de lista ou de tabela. Usar os elementos corretos faz o navegador e as tecnologias assistivas entenderem essa estrutura — por exemplo, anunciando "lista com 5 itens".

## Conceitos fundamentais

**Listas**:

- `<ul>`: lista não ordenada (a ordem não importa).
- `<ol>`: lista ordenada (a ordem importa, como passos).
- `<li>`: cada item, dentro de `<ul>` ou `<ol>`.
- Listas podem ser aninhadas: um `<li>` pode conter outra lista.

**Tabelas** servem para **dados tabulares**, nunca para montar o layout da página:

- `<table>`: a tabela.
- `<caption>`: título da tabela.
- `<thead>`, `<tbody>`: cabeçalho e corpo.
- `<tr>`: linha.
- `<th>`: célula de cabeçalho; `scope="col"` ou `scope="row"` diz se ela titula uma coluna ou uma linha.
- `<td>`: célula de dados.

## Exemplo prático

```html
<h2>Como fazer café coado</h2>
<ol>
  <li>Ferva a água.</li>
  <li>Coloque o pó no filtro.</li>
  <li>Despeje a água aos poucos.</li>
</ol>

<table>
  <caption>Horário das aulas</caption>
  <thead>
    <tr>
      <th scope="col">Dia</th>
      <th scope="col">Assunto</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Segunda</th>
      <td>HTML</td>
    </tr>
    <tr>
      <th scope="row">Quarta</th>
      <td>CSS</td>
    </tr>
  </tbody>
</table>
```

## Explicando o código

- A receita usa `<ol>` porque a ordem dos passos importa.
- `<caption>` dá um nome à tabela, anunciado por leitores de tela.
- Os `<th scope="col">` titulam as colunas; os `<th scope="row">` titulam cada linha. Assim, ao chegar na célula "CSS", o leitor de tela pode anunciar "Quarta, Assunto: CSS".

## Erros comuns

- **Colocar texto solto dentro de `<ul>`**: só `<li>` pode ser filho direto de `<ul>` e `<ol>`.
- **Usar tabela para posicionar elementos na página**: layout é papel do CSS (Flexbox e Grid).
- **Usar `<td>` em negrito no lugar de `<th>`**: visualmente parece cabeçalho, mas a estrutura se perde.

## Resumo

- `<ol>` quando a ordem importa, `<ul>` quando não importa; itens sempre em `<li>`.
- Tabelas são para dados, com `<caption>`, `<th>` e `scope`.
- Estrutura correta é lida pelas tecnologias assistivas.

## Próximo passo

A seguir, você vai coletar dados com formulários acessíveis.

<!-- aula: formularios -->
## Por que isso importa

Cadastro, login, busca, contato, compra: quase toda interação com um site passa por um formulário. Um formulário bem construído é mais fácil de preencher, funciona no teclado e no celular e reduz erros antes mesmo de os dados chegarem ao servidor.

## Conceitos fundamentais

- `<form>`: agrupa os campos. `action` é o endereço que recebe os dados; `method` é como eles são enviados (`get` ou `post`).
- `<label>`: o rótulo do campo. Ligue-o ao campo com `for` igual ao `id` do campo. Clicar no rótulo foca o campo, e o leitor de tela anuncia o rótulo.
- `<input>`: o campo. O atributo `type` muda o comportamento: `text`, `email`, `password`, `number`, `date`, `checkbox`, `radio`...
- `name`: o nome com que o valor é enviado.
- `<textarea>`: texto longo. `<select>` com `<option>`: lista de opções.
- `<button type="submit">`: envia o formulário.

**Validação nativa**: `required` (obrigatório), `minlength`, `maxlength`, `min`, `max` e o próprio `type="email"` fazem o navegador conferir os dados antes de enviar.

> Importante: validação no navegador melhora a experiência, mas **não é segurança**. Qualquer pessoa pode burlá-la. O servidor sempre precisa validar de novo — você verá isso no curso de back-end.

## Exemplo prático

```html
<form action="/inscricao" method="post">
  <label for="nome">Nome completo</label>
  <input id="nome" name="nome" type="text" required minlength="3" autocomplete="name">

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="nivel">Seu nível</label>
  <select id="nivel" name="nivel">
    <option value="zero">Nunca programei</option>
    <option value="basico">Já fiz algum curso</option>
  </select>

  <fieldset>
    <legend>Como prefere estudar?</legend>
    <input id="manha" type="radio" name="turno" value="manha">
    <label for="manha">Manhã</label>
    <input id="noite" type="radio" name="turno" value="noite">
    <label for="noite">Noite</label>
  </fieldset>

  <button type="submit">Quero me inscrever</button>
</form>
```

## Explicando o código

- Cada `<label for>` aponta para o `id` do campo correspondente.
- `type="email"` mostra o teclado com "@" no celular e confere o formato.
- `autocomplete` ajuda o navegador a preencher dados conhecidos.
- `<fieldset>` com `<legend>` agrupa os botões de rádio sob uma pergunta comum. Rádios com o mesmo `name` permitem escolher apenas um.

## Erros comuns

- **Usar `placeholder` no lugar de `<label>`**: o texto some ao digitar e muitos leitores de tela não o anunciam como rótulo.
- **Esquecer o `name`**: o valor não é enviado.
- **Confiar só na validação do navegador**.
- **Botões sem texto claro**: "Enviar" é genérico; diga o que acontece, como "Criar conta".

## Resumo

- Todo campo precisa de um `<label>` ligado por `for`/`id`.
- O `type` certo melhora validação e teclado no celular.
- Validação no navegador ajuda, mas o servidor sempre valida de novo.

## Próximo passo

Na próxima aula você vai estruturar páginas inteiras com elementos semânticos.

<!-- aula: html-semantico -->
## Por que isso importa

Uma página feita só com `<div>` até pode ficar bonita, mas não diz nada sobre o próprio conteúdo. Elementos semânticos informam ao navegador, aos buscadores e aos leitores de tela onde está o menu, o conteúdo principal e o rodapé. Isso melhora acessibilidade, SEO e manutenção.

## Conceitos fundamentais

Elementos de estrutura (os **landmarks**):

- `<header>`: cabeçalho da página ou de uma seção.
- `<nav>`: um grupo de links de navegação.
- `<main>`: o conteúdo principal. Use **um** por página.
- `<section>`: uma seção temática, normalmente com título.
- `<article>`: conteúdo independente, que faria sentido sozinho (um post, um card de produto, um comentário).
- `<aside>`: conteúdo complementar (dicas, links relacionados).
- `<footer>`: rodapé da página ou de uma seção.

Outros elementos semânticos úteis: `<figure>` e `<figcaption>` para imagens com legenda, `<time datetime="2026-10-15">` para datas, `<address>` para contato.

`<div>` e `<span>` continuam úteis, mas apenas como "caixas neutras" quando nenhum elemento semântico se aplica.

## Exemplo prático

```html
<body>
  <header>
    <a href="/">Blog da Ana</a>
    <nav aria-label="Principal">
      <a href="/">Início</a>
      <a href="/sobre">Sobre</a>
    </nav>
  </header>

  <main>
    <article>
      <h1>Como organizei meus estudos</h1>
      <p>Publicado em <time datetime="2026-10-15">15 de outubro de 2026</time>.</p>
      <p>Comecei com metas pequenas...</p>
    </article>

    <aside>
      <h2>Leia também</h2>
      <a href="/posts/pomodoro">A técnica pomodoro</a>
    </aside>
  </main>

  <footer>
    <p>Feito por Ana, estudante de programação.</p>
  </footer>
</body>
```

## Explicando o código

- Um leitor de tela pode listar os landmarks e pular direto para o `<main>`.
- O post está em `<article>` porque faria sentido sozinho, por exemplo em um agregador.
- `aria-label="Principal"` diferencia este `<nav>` de outros menus da página.
- `<time datetime>` guarda a data em formato que máquinas entendem, enquanto o texto fica legível para pessoas.

## Erros comuns

- **"Divite"**: estruturar tudo com `<div class="header">`, `<div class="menu">`.
- **Vários `<main>`** na mesma página.
- **Usar `<section>` como caixa de estilo**: se não há um tema e um título, provavelmente é uma `<div>`.

## Resumo

- Elementos semânticos descrevem o papel de cada região.
- Um `<main>` por página; `<article>` para conteúdo independente.
- `<div>` e `<span>` só quando nada mais se aplica.

## Próximo passo

A seguir, você vai aprofundar a acessibilidade: teclado, contraste, foco e atributos ARIA.

<!-- aula: acessibilidade-em-html -->
## Por que isso importa

Pessoas navegam de formas diferentes: só pelo teclado, com leitor de tela, com zoom alto, com baixa visão para cores. Um site acessível funciona para mais gente — e acessibilidade digital também é exigida por leis em muitos países, incluindo a Lei Brasileira de Inclusão. A boa notícia: a maior parte vem de HTML bem escrito.

## Conceitos fundamentais

1. **Use o elemento nativo certo.** `<button>` já é focável, funciona com Enter e Espaço e é anunciado como botão. Uma `<div onclick>` não tem nada disso.
2. **Teclado**: tudo que funciona com mouse precisa funcionar com Tab, Shift+Tab, Enter e Espaço. A ordem do foco segue a ordem do HTML.
3. **Foco visível**: nunca remova o contorno de foco sem oferecer outro destaque.
4. **Textos alternativos e rótulos**: imagens com `alt`, campos com `<label>`, botões de ícone com nome acessível.
5. **Contraste**: texto precisa se destacar do fundo. As diretrizes WCAG recomendam contraste mínimo de 4,5:1 para texto normal.
6. **ARIA** (Accessible Rich Internet Applications): atributos que complementam o HTML, como `aria-label`, `aria-expanded` e `aria-live`. A primeira regra do ARIA é: **se existe um elemento nativo, use-o** em vez de ARIA.

Um "link para pular" no início da página permite que quem usa teclado vá direto ao conteúdo sem passar pelo menu inteiro.

## Exemplo prático

```html
<a class="pular" href="#conteudo">Pular para o conteúdo</a>

<header>
  <button type="button" aria-expanded="false" aria-controls="menu">
    Menu
  </button>
  <ul id="menu" hidden>
    <li><a href="/cursos">Cursos</a></li>
  </ul>
</header>

<main id="conteudo">
  <button type="button" aria-label="Fechar aviso">
    <svg aria-hidden="true" width="16" height="16"><!-- ícone de X --></svg>
  </button>
  <p role="status">Seu cadastro foi salvo.</p>
</main>
```

## Explicando o código

- O link "Pular para o conteúdo" leva ao `<main id="conteudo">`.
- `aria-expanded` informa se o menu está aberto; o JavaScript deve atualizá-lo ao abrir e fechar.
- O botão só tem um ícone, então `aria-label` fornece o nome "Fechar aviso". O SVG recebe `aria-hidden="true"` para não ser lido.
- `role="status"` faz leitores de tela anunciarem a mensagem quando ela aparece, sem roubar o foco.

## Erros comuns

- **`<div>` ou `<span>` clicáveis** no lugar de `<button>` e `<a>`.
- **`outline: none`** no CSS sem alternativa de foco.
- **Informar só por cor**: "campos em vermelho estão errados" não funciona para quem não distingue cores. Inclua texto.
- **ARIA em excesso**: `role="button"` em um `<button>` é redundante; ARIA errado é pior do que nenhum.

## Resumo

- HTML nativo correto resolve a maior parte da acessibilidade.
- Tudo deve funcionar pelo teclado, com foco visível.
- Use ARIA para complementar, nunca para substituir elementos nativos.

## Próximo passo

Na última aula do curso, você vai montar uma página completa aplicando boas práticas.

<!-- aula: estruturando-uma-pagina -->
## Por que isso importa

Até aqui você estudou cada elemento separadamente. Projetos reais exigem decidir **como tudo se encaixa**: quais seções existem, em que ordem, com quais títulos. Planejar a estrutura antes de escrever deixa o CSS e o JavaScript muito mais simples depois.

## Conceitos fundamentais

Um processo para estruturar qualquer página:

1. **Liste o conteúdo** que precisa existir (textos, imagens, formulários).
2. **Agrupe por assunto** e defina as seções.
3. **Desenhe a hierarquia de títulos** como se fosse um sumário: um `<h1>`, seções em `<h2>`, subseções em `<h3>`.
4. **Escolha os landmarks**: `<header>`, `<nav>`, `<main>`, `<footer>`.
5. **Escreva o HTML sem CSS** e confira se a página faz sentido assim. Se fizer, a estrutura está boa.

Boas práticas gerais:

- Indente de forma consistente.
- Use minúsculas nas tags e aspas duplas nos atributos.
- Valide o código no validador oficial do W3C (validator.w3.org).
- Teste navegando só com o teclado.

## Exemplo prático

Estrutura de uma página de apresentação pessoal:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Carla Souza — Desenvolvedora em formação</title>
    <meta name="description" content="Projetos e estudos de Carla Souza em desenvolvimento web.">
  </head>
  <body>
    <header>
      <nav aria-label="Principal">
        <a href="#sobre">Sobre</a>
        <a href="#projetos">Projetos</a>
        <a href="#contato">Contato</a>
      </nav>
    </header>
    <main>
      <h1>Carla Souza</h1>
      <p>Estudo desenvolvimento web e gosto de transformar ideias em páginas simples e acessíveis.</p>

      <section id="sobre">
        <h2>Sobre mim</h2>
        <p>Comecei a programar em 2026, pela lógica de programação.</p>
      </section>

      <section id="projetos">
        <h2>Projetos</h2>
        <article>
          <h3>Calculadora de gorjeta</h3>
          <p>Calcula o valor por pessoa a partir do total da conta.</p>
          <a href="https://github.com/">Ver código</a>
        </article>
      </section>

      <section id="contato">
        <h2>Contato</h2>
        <p><a href="mailto:carla@exemplo.com">carla@exemplo.com</a></p>
      </section>
    </main>
    <footer>
      <p>Página feita com HTML.</p>
    </footer>
  </body>
</html>
```

## Explicando o código

- O `<title>` e a `<meta name="description">` aparecem nos resultados de busca.
- O menu leva às seções por âncoras (`#sobre`, `#projetos`).
- A hierarquia é clara: `h1` (Carla Souza) → `h2` (seções) → `h3` (cada projeto).
- Cada projeto é um `<article>` porque faria sentido sozinho.

## Erros comuns

- **Começar pelo visual**: estilizar antes de ter a estrutura gera HTML confuso.
- **Hierarquia de títulos quebrada**: um `h3` sem `h2` acima.
- **Não validar o código**: tags mal fechadas passam despercebidas até quebrar o layout.

## Resumo

- Planeje conteúdo, seções e títulos antes de escrever.
- Use landmarks e uma hierarquia de títulos consistente.
- Valide no W3C e teste pelo teclado.

## Próximo passo

Com a estrutura pronta, siga para o curso de **CSS** e aprenda a dar estilo, layout e responsividade às suas páginas.
