import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "html",
  title: "HTML: estrutura e semântica",
  description:
    "Construa páginas bem estruturadas: documento, textos, links, imagens, listas, tabelas, formulários, semântica e acessibilidade.",
  category: "web",
  level: "iniciante",
  modules: [
    {
      title: "Fundamentos do HTML",
      lessons: [
        {
          slug: "estrutura-do-documento",
          title: "Estrutura de um documento HTML",
          objective: "Criar um arquivo HTML válido com doctype, html, head e body, incluindo charset e viewport.",
          summary: "A base de toda página: o que vai no head, o que vai no body e por que charset e viewport são indispensáveis.",
          minutes: 12,
          exercise: {
            prompt: "Qual elemento guarda o texto exibido na aba do navegador? Escreva a tag de abertura.",
            hint: "Fica dentro do head.",
            accepted: ["<title>", "title"],
            explanation: "O conteúdo de `<title>` aparece na aba e nos resultados de busca.",
          },
          quiz: [
            {
              prompt: "Para que serve `<meta charset=\"UTF-8\">`?",
              options: ["Exibir acentos e caracteres especiais corretamente", "Deixar a página mais rápida", "Mudar a cor do texto", "Criar um link"],
              correct: 0,
              explanation: "UTF-8 garante que caracteres como ç e ã apareçam corretamente.",
            },
            {
              prompt: "O que acontece sem a meta viewport no celular?",
              options: ["A página aparece reduzida, como em uma tela de computador", "A página não abre", "Os links param de funcionar", "As imagens somem"],
              correct: 0,
              explanation: "Sem viewport, o navegador móvel simula uma tela larga e reduz tudo.",
            },
            {
              kind: "true_false",
              prompt: "Textos colocados dentro de `<head>` aparecem no corpo da página.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "O head guarda informações sobre a página; o conteúdo visível fica no body.",
            },
          ],
        },
        {
          slug: "titulos-paragrafos-e-textos",
          title: "Tags, títulos, parágrafos e ênfase",
          objective: "Usar elementos de texto pelo significado, montando uma hierarquia de títulos correta.",
          summary: "Elementos, atributos, h1 a h6, parágrafos, strong e em, e por que a tag não deve ser escolhida pela aparência.",
          minutes: 12,
          exercise: {
            prompt: "Quantos elementos `<h1>` uma página bem estruturada deve ter?",
            hint: "É o título principal da página.",
            accepted: ["1", "um", "uma"],
            explanation: "Use um único h1 como título principal e organize o restante com h2, h3...",
          },
          quiz: [
            {
              prompt: "Qual elemento indica importância forte no texto?",
              options: ["<strong>", "<b>", "<br>", "<h6>"],
              correct: 0,
              explanation: "<strong> tem significado de importância; o negrito é só a aparência padrão.",
            },
            {
              kind: "find_bug",
              prompt: "O que está errado neste trecho?",
              lang: "html",
              code: "<p><strong>Atenção</p></strong>",
              options: ["As tags foram fechadas na ordem errada", "Falta um h1", "strong não pode ficar dentro de p", "Falta o atributo alt"],
              correct: 0,
              explanation: "Feche primeiro o que abriu por último: <p><strong>Atenção</strong></p>.",
            },
            {
              prompt: "Como criar mais espaço entre parágrafos?",
              options: ["Com CSS (margin)", "Com vários <br>", "Com vários <h1>", "Com parágrafos vazios"],
              correct: 0,
              explanation: "Espaçamento é responsabilidade do CSS; o HTML descreve a estrutura.",
            },
          ],
        },
        {
          slug: "links-e-imagens",
          title: "Links e imagens acessíveis",
          objective: "Criar links absolutos, relativos e âncoras, e inserir imagens com texto alternativo adequado.",
          summary: "Conecte páginas, abra links externos com segurança e escreva bons textos alternativos.",
          minutes: 14,
          exercise: {
            prompt: "Qual atributo de `<img>` fornece o texto alternativo?",
            hint: "São três letras.",
            accepted: ["alt"],
            explanation: "`alt` é lido por leitores de tela e exibido se a imagem não carregar.",
          },
          quiz: [
            {
              prompt: "Qual `alt` é o mais adequado para uma foto de produto?",
              options: ["\"Tênis branco de corrida com detalhes azuis\"", "\"imagem\"", "\"foto.jpg\"", "Nenhum alt"],
              correct: 0,
              explanation: "O alt deve descrever a função e o conteúdo da imagem no contexto.",
            },
            {
              prompt: "Para que serve `rel=\"noopener noreferrer\"` em links com target=\"_blank\"?",
              options: ["Impedir que a nova aba controle a página original", "Deixar o link azul", "Abrir o link mais rápido", "Baixar o arquivo"],
              correct: 0,
              explanation: "noopener isola a nova aba da página de origem, uma medida de segurança.",
            },
            {
              prompt: "Qual é o problema de links com o texto \"clique aqui\"?",
              options: ["Não dizem para onde levam quando lidos fora de contexto", "Não funcionam no celular", "São proibidos", "Ficam invisíveis"],
              correct: 0,
              explanation: "Leitores de tela listam links isoladamente; o texto precisa descrever o destino.",
            },
          ],
        },
      ],
    },
    {
      title: "Organizando e coletando informações",
      lessons: [
        {
          slug: "listas-e-tabelas",
          title: "Listas e tabelas",
          objective: "Escolher entre listas ordenadas e não ordenadas e construir tabelas de dados acessíveis.",
          summary: "ol, ul, li e tabelas com caption, th e scope.",
          minutes: 14,
          exercise: {
            prompt: "Qual elemento de lista usar para os passos de uma receita? Escreva a tag de abertura.",
            hint: "A ordem dos passos importa.",
            accepted: ["<ol>", "ol"],
            explanation: "<ol> representa listas em que a ordem importa.",
          },
          quiz: [
            {
              prompt: "Qual elemento pode ser filho direto de <ul>?",
              options: ["<li>", "<p>", "<td>", "<span>"],
              correct: 0,
              explanation: "Somente <li> pode ser filho direto de <ul> e <ol>.",
            },
            {
              prompt: "Tabelas devem ser usadas para:",
              options: ["Dados tabulares", "Posicionar elementos no layout", "Criar menus", "Centralizar textos"],
              correct: 0,
              explanation: "Layout é papel do CSS. Tabelas representam dados em linhas e colunas.",
            },
            {
              prompt: "O que `scope=\"col\"` indica em um <th>?",
              options: ["Que ele é o cabeçalho de uma coluna", "Que a coluna está oculta", "Que a célula é colorida", "Que a tabela é ordenável"],
              correct: 0,
              explanation: "scope relaciona o cabeçalho às células que ele titula.",
            },
          ],
        },
        {
          slug: "formularios",
          title: "Formulários acessíveis",
          objective: "Montar formulários com labels, tipos de campo, agrupamentos e validação nativa.",
          summary: "label, input, select, fieldset, validação nativa e por que o servidor sempre valida de novo.",
          minutes: 18,
          exercise: {
            prompt: "Qual atributo torna um campo obrigatório no HTML?",
            hint: "Significa 'obrigatório' em inglês.",
            accepted: ["required"],
            explanation: "`required` impede o envio com o campo vazio — mas o servidor ainda precisa validar.",
          },
          quiz: [
            {
              prompt: "Como ligar um <label> a um <input>?",
              options: ["for do label igual ao id do input", "name do label igual ao type", "Colocando o label depois do formulário", "Usando placeholder"],
              correct: 0,
              explanation: "for/id associa rótulo e campo; clicar no rótulo foca o campo.",
            },
            {
              kind: "true_false",
              prompt: "A validação do navegador é suficiente para garantir a segurança dos dados.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Ela pode ser burlada. O servidor sempre valida os dados novamente.",
            },
            {
              prompt: "Para que servem <fieldset> e <legend>?",
              options: ["Agrupar campos relacionados sob uma pergunta comum", "Criar tabelas", "Enviar o formulário", "Esconder campos"],
              correct: 0,
              explanation: "São ideais para grupos de rádio e checkbox.",
            },
          ],
        },
      ],
    },
    {
      title: "Semântica, acessibilidade e boas práticas",
      lessons: [
        {
          slug: "html-semantico",
          title: "HTML semântico",
          objective: "Estruturar páginas com header, nav, main, section, article, aside e footer.",
          summary: "Landmarks que ajudam leitores de tela, buscadores e quem mantém o código.",
          minutes: 14,
          exercise: {
            prompt: "Qual elemento envolve o conteúdo principal da página? Escreva a tag de abertura.",
            hint: "Deve haver apenas um por página.",
            accepted: ["<main>", "main"],
            explanation: "<main> marca o conteúdo principal, e leitores de tela podem pular direto para ele.",
          },
          quiz: [
            {
              prompt: "Qual elemento usar para um post de blog que faria sentido sozinho?",
              options: ["<article>", "<aside>", "<div>", "<nav>"],
              correct: 0,
              explanation: "<article> representa conteúdo independente.",
            },
            {
              prompt: "Quando <div> é adequado?",
              options: ["Quando nenhum elemento semântico se aplica", "Sempre", "Nunca", "Só para títulos"],
              correct: 0,
              explanation: "<div> é uma caixa neutra, útil para agrupar para estilo quando não há significado específico.",
            },
            {
              prompt: "Quantos <main> uma página deve ter?",
              options: ["Um", "Dois", "Um por seção", "Nenhum"],
              correct: 0,
              explanation: "Um único <main> identifica o conteúdo principal.",
            },
          ],
        },
        {
          slug: "acessibilidade-em-html",
          title: "Acessibilidade na prática",
          objective: "Garantir navegação por teclado, foco visível, nomes acessíveis e uso correto de ARIA.",
          summary: "Elementos nativos, teclado, contraste, link para pular e ARIA sem exageros.",
          minutes: 16,
          exercise: {
            prompt: "Qual atributo ARIA dá nome a um botão que só tem um ícone?",
            hint: "aria-...",
            accepted: ["aria-label"],
            explanation: "`aria-label` fornece o nome acessível quando não há texto visível.",
          },
          quiz: [
            {
              prompt: "Qual é a primeira regra do ARIA?",
              options: ["Se existe um elemento nativo adequado, use-o", "Use role em todos os elementos", "Substitua botões por divs", "Use aria-hidden em tudo"],
              correct: 0,
              explanation: "Elementos nativos já trazem foco, teclado e semântica.",
            },
            {
              prompt: "Por que não usar <div onclick> como botão?",
              options: ["Não recebe foco nem responde ao teclado por padrão", "É mais lento", "Não pode ter texto", "É proibido pelo navegador"],
              correct: 0,
              explanation: "<button> é focável e funciona com Enter e Espaço sem código extra.",
            },
            {
              prompt: "Qual contraste mínimo as WCAG recomendam para texto normal?",
              options: ["4,5:1", "1:1", "2:1", "10:1"],
              correct: 0,
              explanation: "O nível AA pede 4,5:1 para texto normal e 3:1 para texto grande.",
            },
          ],
        },
        {
          slug: "estruturando-uma-pagina",
          title: "Estruturando uma página completa",
          objective: "Planejar e escrever uma página de apresentação completa, validada e navegável pelo teclado.",
          summary: "Do inventário de conteúdo à página pronta para receber CSS.",
          minutes: 20,
          exercise: {
            prompt: "Qual é o endereço do validador oficial de HTML do W3C?",
            hint: "validator...",
            accepted: ["validator.w3.org", "https://validator.w3.org", "https://validator.w3.org/"],
            explanation: "validator.w3.org aponta erros como tags mal fechadas.",
          },
          quiz: [
            {
              prompt: "Qual é o primeiro passo para estruturar uma página?",
              options: ["Listar o conteúdo que precisa existir", "Escolher as cores", "Escrever o CSS", "Publicar"],
              correct: 0,
              explanation: "A estrutura nasce do conteúdo.",
            },
            {
              prompt: "Como saber se a estrutura está boa antes do CSS?",
              options: ["A página faz sentido mesmo sem estilos", "Ela tem muitas divs", "Ela é colorida", "Ela tem animações"],
              correct: 0,
              explanation: "Uma boa estrutura é compreensível só com HTML.",
            },
            {
              prompt: "Onde fica a descrição usada pelos buscadores?",
              options: ["<meta name=\"description\"> no head", "No primeiro <p>", "No <footer>", "No alt das imagens"],
              correct: 0,
              explanation: "A meta description costuma aparecer nos resultados de busca.",
            },
          ],
        },
      ],
    },
  ],
};
