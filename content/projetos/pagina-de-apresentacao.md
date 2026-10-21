## Visão geral

Você vai criar e publicar uma página pessoal: quem você é, o que está estudando, dois ou três projetos (mesmo que pequenos) e um jeito de entrar em contato. É o primeiro item do seu portfólio e o lugar onde os próximos projetos vão aparecer.

Pré-requisitos: trilhas de **HTML** e **CSS** (até responsividade).

## Requisitos

- Cabeçalho com seu nome e um menu com links para as seções.
- Seções "Sobre", "Projetos" e "Contato".
- Pelo menos uma imagem com texto alternativo útil.
- Layout que funcione do celular ao computador.
- Foco visível em todos os links e botões.

## Etapas

1. **Planeje o conteúdo** antes de abrir o editor: escreva em um papel os textos de cada seção.
2. **Escreva só o HTML**, com `header`, `nav`, `main`, `section` e `footer`. Abra no navegador: a página precisa fazer sentido sem CSS.
3. **Valide** em validator.w3.org e corrija o que aparecer.
4. **Estilize com mobile first**: comece pelo celular e acrescente `@media (min-width: 768px)` para telas maiores.
5. **Teste pelo teclado**: navegue com Tab do início ao fim.
6. **Publique** no GitHub Pages (veja a trilha de Git e GitHub).

## Código de partida

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Seu nome — estudante de programação</title>
    <link rel="stylesheet" href="estilos.css">
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
      <h1>Seu nome</h1>
      <section id="sobre">
        <h2>Sobre mim</h2>
        <p>Conte em duas frases o que você estuda e por quê.</p>
      </section>
    </main>
  </body>
</html>
```

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1f2937;
}

main {
  max-width: 70ch;
  margin-inline: auto;
  padding: 1.5rem;
}

a:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
```

## Melhorias opcionais

- Um modo escuro com `prefers-color-scheme`.
- Uma pequena animação de entrada que respeite `prefers-reduced-motion`.
- Um formulário de contato (o envio pode ser feito depois, com um serviço de formulários).
