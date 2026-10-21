import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "css",
  title: "CSS: estilo, layout e responsividade",
  description:
    "Do seletor ao layout responsivo: cascata, especificidade, box model, tipografia, Flexbox, Grid, estados e animações acessíveis.",
  category: "web",
  level: "iniciante",
  modules: [
    {
      title: "Fundamentos do CSS",
      lessons: [
        {
          slug: "seletores-e-cascata",
          title: "Seletores, cascata e herança",
          objective: "Aplicar estilos com seletores de elemento, classe e descendente e prever o resultado da cascata.",
          summary: "Como o navegador decide qual regra vence e por que classes são o seletor mais útil.",
          minutes: 14,
          exercise: {
            prompt: "Escreva o seletor CSS que seleciona todos os elementos com `class=\"alerta\"`.",
            hint: "Classes começam com ponto.",
            accepted: [".alerta"],
            explanation: "`.alerta` seleciona qualquer elemento que tenha a classe alerta.",
          },
          quiz: [
            {
              prompt: "Duas regras com a mesma especificidade definem a mesma propriedade. Qual vence?",
              options: ["A que aparece por último", "A primeira", "A mais curta", "Nenhuma"],
              correct: 0,
              explanation: "Em empate de importância e especificidade, vale a ordem: a última vence.",
            },
            {
              prompt: "Qual propriedade é herdada pelos elementos filhos?",
              options: ["color", "border", "margin", "padding"],
              correct: 0,
              explanation: "Propriedades de texto, como color e font-family, são herdadas.",
            },
            {
              kind: "find_bug",
              prompt: "Por que este estilo não se aplica a `<p class=\"nota\">`?",
              lang: "css",
              code: "nota {\n  color: red;\n}",
              options: ["Falta o ponto antes de nota", "red não é uma cor válida", "Falta !important", "color não funciona em parágrafos"],
              correct: 0,
              explanation: "Sem o ponto, o seletor procura um elemento <nota>.",
            },
          ],
        },
        {
          slug: "especificidade-cores-e-unidades",
          title: "Especificidade, cores e unidades",
          objective: "Calcular a especificidade de seletores, escolher formatos de cor e usar unidades relativas e variáveis CSS.",
          summary: "Entenda por que um estilo não pega e use rem, %, vw e variáveis CSS com segurança.",
          minutes: 15,
          exercise: {
            prompt: "Se o `font-size` da raiz é 16px, quantos pixels valem `2rem`?",
            hint: "rem multiplica o tamanho da fonte raiz.",
            accepted: ["32", "32px"],
            explanation: "2 × 16px = 32px.",
          },
          quiz: [
            {
              prompt: "Qual seletor tem maior especificidade?",
              options: ["#menu a", ".menu .link", ".menu a", "a"],
              correct: 0,
              explanation: "Qualquer ID vence qualquer quantidade de classes: #menu a é (1,0,1).",
            },
            {
              prompt: "Por que preferir rem para tamanhos de fonte?",
              options: ["Respeita a preferência de tamanho de fonte da pessoa usuária", "É mais rápido", "Funciona só no celular", "Deixa o texto colorido"],
              correct: 0,
              explanation: "rem é relativo à fonte raiz, que acompanha a configuração do navegador.",
            },
            {
              prompt: "Como usar a variável `--cor-primaria`?",
              options: ["var(--cor-primaria)", "$cor-primaria", "--cor-primaria()", "@cor-primaria"],
              correct: 0,
              explanation: "Propriedades personalizadas são lidas com var().",
            },
          ],
        },
        {
          slug: "box-model",
          title: "Box model e espaçamentos",
          objective: "Calcular o tamanho de caixas com padding, borda e margem e usar box-sizing: border-box.",
          summary: "Por que larguras não batem e como deixar o espaçamento previsível.",
          minutes: 14,
          exercise: {
            prompt: "Com `box-sizing: content-box`, `width: 200px`, `padding: 10px` e `border: 1px`, qual é a largura total ocupada? (em px)",
            hint: "Some padding e borda dos dois lados.",
            accepted: ["222", "222px"],
            explanation: "200 + 10 + 10 + 1 + 1 = 222px.",
          },
          quiz: [
            {
              prompt: "Qual camada recebe a cor de fundo do elemento?",
              options: ["Padding (e o conteúdo)", "Margin", "Apenas a borda", "Nenhuma"],
              correct: 0,
              explanation: "O fundo pinta conteúdo e padding; a margem é transparente.",
            },
            {
              prompt: "O que `margin: 0 auto` faz em um bloco com largura definida?",
              options: ["Centraliza horizontalmente", "Remove o bloco", "Centraliza verticalmente", "Cria uma borda"],
              correct: 0,
              explanation: "Margens laterais automáticas dividem o espaço sobrando igualmente.",
            },
            {
              prompt: "Dois blocos empilhados têm margin-bottom: 20px e margin-top: 30px. Qual é a distância entre eles?",
              options: ["30px", "50px", "20px", "10px"],
              correct: 0,
              explanation: "Margens verticais adjacentes colapsam: vale a maior.",
            },
          ],
        },
      ],
    },
    {
      title: "Texto e posicionamento",
      lessons: [
        {
          slug: "tipografia",
          title: "Tipografia para a web",
          objective: "Definir fontes, tamanhos, altura de linha e largura de leitura confortáveis e fluidas.",
          summary: "font-family com reservas, rem, line-height, ch e clamp().",
          minutes: 14,
          exercise: {
            prompt: "Qual unidade CSS se baseia na largura do caractere \"0\" e é útil para limitar a largura da linha?",
            hint: "São duas letras.",
            accepted: ["ch"],
            explanation: "`max-width: 70ch` limita a linha a cerca de 70 caracteres.",
          },
          quiz: [
            {
              prompt: "Qual faixa de line-height é confortável para textos corridos?",
              options: ["1.4 a 1.7", "0.8 a 1", "3 a 4", "Sempre 20px"],
              correct: 0,
              explanation: "Valores sem unidade entre 1.4 e 1.7 funcionam bem para leitura.",
            },
            {
              prompt: "O que `clamp(1.5rem, 4vw, 3rem)` faz?",
              options: ["Tamanho fluido entre 1,5rem e 3rem", "Fixa em 4vw", "Usa sempre 3rem", "Esconde o texto"],
              correct: 0,
              explanation: "clamp limita um valor fluido entre um mínimo e um máximo.",
            },
            {
              prompt: "Por que terminar font-family com uma família genérica?",
              options: ["Garante uma fonte de reserva se as outras falharem", "É obrigatório para cores", "Deixa a fonte em negrito", "Não faz diferença"],
              correct: 0,
              explanation: "Se as fontes listadas não estiverem disponíveis, o navegador usa a genérica.",
            },
          ],
        },
        {
          slug: "display-e-position",
          title: "Display e position",
          objective: "Controlar o fluxo com display e posicionar elementos com relative, absolute, fixed e sticky.",
          summary: "Selos em cantos, cabeçalhos fixos e por que o span ignora width.",
          minutes: 15,
          exercise: {
            prompt: "Qual valor de `position` faz um cabeçalho rolar normalmente e depois grudar no topo?",
            hint: "Significa 'grudento'.",
            accepted: ["sticky"],
            explanation: "`position: sticky` com `top: 0` gruda o elemento ao atingir o topo.",
          },
          quiz: [
            {
              prompt: "Um elemento absolute é posicionado em relação a quê?",
              options: ["Ao ancestral posicionado mais próximo", "Sempre à janela", "Ao irmão anterior", "Ao body, sempre"],
              correct: 0,
              explanation: "Por isso o pai costuma receber position: relative.",
            },
            {
              prompt: "Por que width não funciona em um <span> comum?",
              options: ["Ele é inline por padrão", "span não aceita CSS", "Falta !important", "width só funciona em imagens"],
              correct: 0,
              explanation: "Elementos inline ignoram largura e altura; use inline-block ou block.",
            },
            {
              prompt: "display: none faz o quê?",
              options: ["Remove o elemento da página e dos leitores de tela", "Deixa transparente, mas ocupando espaço", "Muda a cor", "Fixa o elemento"],
              correct: 0,
              explanation: "O elemento deixa de existir na renderização.",
            },
          ],
        },
      ],
    },
    {
      title: "Layouts modernos",
      lessons: [
        {
          slug: "flexbox",
          title: "Flexbox",
          objective: "Alinhar e distribuir itens em uma dimensão com Flexbox.",
          summary: "Barras de navegação, centralização perfeita e espaçamentos com gap.",
          minutes: 18,
          exercise: {
            prompt: "Qual propriedade do contêiner flex distribui os itens no eixo principal?",
            hint: "justify-...",
            accepted: ["justify-content"],
            explanation: "`justify-content` controla o eixo principal; `align-items`, o cruzado.",
          },
          quiz: [
            {
              prompt: "Como centralizar um item nos dois eixos com Flexbox?",
              options: ["justify-content: center e align-items: center no contêiner", "text-align: center no item", "margin: 50%", "position: center"],
              correct: 0,
              explanation: "As duas propriedades no contêiner centralizam horizontal e verticalmente.",
            },
            {
              prompt: "Quem vira item flex?",
              options: ["Apenas os filhos diretos do contêiner", "Todos os descendentes", "Só o primeiro filho", "Só imagens"],
              correct: 0,
              explanation: "display: flex afeta os filhos diretos.",
            },
            {
              prompt: "O que `flex: 1` faz em um item?",
              options: ["Faz o item crescer para ocupar o espaço disponível", "Esconde o item", "Fixa a largura em 1px", "Coloca o item em primeiro"],
              correct: 0,
              explanation: "flex: 1 permite que o item cresça proporcionalmente.",
            },
          ],
        },
        {
          slug: "grid",
          title: "CSS Grid",
          objective: "Construir layouts em duas dimensões com fr, repeat, minmax, auto-fit e áreas nomeadas.",
          summary: "Galerias responsivas sem media queries e layouts de página legíveis.",
          minutes: 18,
          exercise: {
            prompt: "Escreva o valor de `grid-template-columns` para três colunas iguais usando repeat.",
            hint: "repeat(quantidade, tamanho) com a unidade fr.",
            accepted: ["repeat(3, 1fr)", "repeat(3,1fr)"],
            explanation: "`repeat(3, 1fr)` cria três colunas que dividem o espaço igualmente.",
          },
          quiz: [
            {
              prompt: "O que a unidade fr representa?",
              options: ["Uma fração do espaço disponível", "Um pixel", "Um caractere", "A altura da tela"],
              correct: 0,
              explanation: "fr divide o espaço livre do grid.",
            },
            {
              prompt: "Para que serve `repeat(auto-fit, minmax(220px, 1fr))`?",
              options: ["Criar quantas colunas couberem, com no mínimo 220px", "Fixar 220 colunas", "Esconder colunas pequenas", "Criar linhas de 220px"],
              correct: 0,
              explanation: "É uma galeria responsiva sem media queries.",
            },
            {
              prompt: "Quando preferir Grid a Flexbox?",
              options: ["Quando é preciso controlar linhas e colunas ao mesmo tempo", "Para alinhar dois botões", "Nunca", "Só para textos"],
              correct: 0,
              explanation: "Grid brilha em layouts bidimensionais.",
            },
          ],
        },
        {
          slug: "responsividade",
          title: "Responsividade e mobile first",
          objective: "Adaptar layouts a qualquer tela com mobile first, media queries, imagens fluidas e áreas de toque adequadas.",
          summary: "O mesmo HTML funcionando bem do celular ao monitor largo.",
          minutes: 16,
          exercise: {
            prompt: "Qual declaração impede que imagens fiquem mais largas que o contêiner? (propriedade e valor)",
            hint: "max-...",
            accepted: ["max-width: 100%", "max-width:100%"],
            explanation: "`max-width: 100%` com `height: auto` mantém imagens fluidas.",
          },
          quiz: [
            {
              prompt: "Na abordagem mobile first, as media queries normalmente usam:",
              options: ["min-width", "max-width", "orientation sempre", "print"],
              correct: 0,
              explanation: "Escreve-se o estilo do celular e acrescentam-se ajustes a partir de larguras maiores.",
            },
            {
              prompt: "Como escolher breakpoints?",
              options: ["Pelos pontos onde o conteúdo quebra", "Pelo modelo de celular mais vendido", "Sempre 1000px", "Aleatoriamente"],
              correct: 0,
              explanation: "Breakpoints devem servir ao conteúdo, não a aparelhos específicos.",
            },
            {
              prompt: "Qual é uma causa comum de rolagem horizontal no celular?",
              options: ["Larguras fixas maiores que a tela", "Usar rem", "Usar Flexbox", "Ter muitos parágrafos"],
              correct: 0,
              explanation: "Larguras fixas e imagens sem max-width transbordam a tela.",
            },
          ],
        },
        {
          slug: "estados-transicoes-e-animacoes",
          title: "Estados, transições e animações acessíveis",
          objective: "Estilizar estados com pseudoclasses e criar transições e animações performáticas que respeitam movimento reduzido.",
          summary: ":hover, :focus-visible, transições, @keyframes e prefers-reduced-motion.",
          minutes: 16,
          exercise: {
            prompt: "Qual media query detecta quem pediu menos animações ao sistema? Escreva a condição entre parênteses.",
            hint: "prefers-...",
            accepted: ["(prefers-reduced-motion: reduce)", "prefers-reduced-motion: reduce"],
            explanation: "`@media (prefers-reduced-motion: reduce)` permite desativar ou suavizar animações.",
          },
          quiz: [
            {
              prompt: "Quais propriedades são mais baratas de animar?",
              options: ["transform e opacity", "width e height", "top e left", "margin e padding"],
              correct: 0,
              explanation: "Elas não forçam o recálculo do layout.",
            },
            {
              prompt: "Por que preferir :focus-visible a :focus para o contorno?",
              options: ["Mostra o contorno principalmente na navegação por teclado", "É mais colorido", "Funciona só no celular", "Remove o foco"],
              correct: 0,
              explanation: ":focus-visible evita contornos em cliques de mouse, mas mantém para teclado.",
            },
            {
              kind: "true_false",
              prompt: "Remover o contorno de foco com outline: none sem alternativa prejudica quem usa teclado.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Sem foco visível, a pessoa não sabe onde está na página.",
            },
          ],
        },
      ],
    },
  ],
};
