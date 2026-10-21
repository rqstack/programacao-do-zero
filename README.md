# Programação do Zero

**Do primeiro código aos seus próprios projetos.**

Uma plataforma gratuita para aprender programação passo a passo: aulas progressivas, exercícios, quizzes, jogos, um laboratório de código e projetos guiados. Sem cadastro, sem plano pago — todo o conteúdo é aberto.

> ### 🤖 Um projeto de vibe coding
>
> Este é um projeto pessoal de estudo. Ele foi construído com **vibe coding**: eu descrevo o que quero, uma IA (Claude) escreve boa parte do código e do conteúdo, e eu reviso, testo e decido os rumos.
>
> Estou estudando inteligência artificial justamente para **entender** como ela funciona, onde ajuda e onde erra. Por isso o projeto é público: para mostrar o processo de forma transparente. Os commits feitos com ajuda da IA trazem a linha `Co-Authored-By: Claude`.
>
> Se encontrar um erro em alguma aula, abra uma *issue* — revisar o que a IA produz faz parte do aprendizado.

## O que tem aqui

- **Trilhas** com aulas que seguem sempre a mesma estrutura: objetivo, por que importa, conceitos, exemplo prático, código explicado, erros comuns, resumo, exercício e quiz.
- **Quizzes** de revisão por aula e um desafio final por trilha, com explicação em cada resposta.
- **9 jogos**: desafio de lógica, caça aos bugs, monte o código, quiz relâmpago, memória, desafio SQL, missões full stack, corrida de digitação e seletor CSS.
- **Laboratório** para escrever HTML, CSS e JavaScript e ver o resultado na hora, isolado em um `iframe` com sandbox.
- **Projetos guiados**, do primeiro site ao Tarefas+ com API, React, banco de dados, login e IA.
- **Progresso, XP, níveis, conquistas e sequência de dias**, salvos só no navegador (`localStorage`), com backup para exportar e importar.

## Tecnologias

Next.js 16 (App Router, exportação estática) · React 19 · TypeScript estrito · Tailwind CSS 4 · Zod · GSAP · Vitest · ESLint.

O site é 100% estático: não há servidor, banco de dados nem coleta de dados.

## Rodando localmente

Requer Node.js 20.9 ou mais recente.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os testes (regras de progresso, correção de quizzes e jogos, validação de todo o conteúdo e da sintaxe dos códigos das aulas) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Gera o site estático na pasta `out/` |
| `npm run check` | Tudo acima, em sequência |

## Publicação

O site é publicado no **GitHub Pages** pela branch `gh-pages`:

```bash
npm run deploy
```

O script gera o build com o subcaminho do repositório (`NEXT_PUBLIC_BASE_PATH=/programacao-do-zero`) e envia a pasta `out/` para a branch `gh-pages`.

Para publicar automaticamente a cada push, há um workflow pronto em `docs/deploy-workflow.yml`: copie-o para `.github/workflows/deploy.yml` (o token do GitHub precisa da permissão `workflow`) e, nas configurações do repositório, mude a fonte do Pages para "GitHub Actions".

## Estrutura

```
content/            conteúdo educacional
  courses/<trilha>/ course.ts (metadados, exercícios, quizzes) + aulas.md (texto das aulas)
  games/            rodadas dos jogos
  projects.ts       projetos guiados (texto em content/projetos/*.md)
src/app/            páginas
src/components/     interface
src/lib/            regras: progresso, XP, correção de quizzes e motor dos jogos
tests/              testes automatizados
```

Para adicionar uma aula, escreva o texto em `aulas.md` (separado por `<!-- aula: slug -->`) e os metadados em `course.ts`. Os testes acusam seções faltando, slugs repetidos, gabaritos inválidos e erros de sintaxe nos blocos de JavaScript.

## Créditos e referências

- A estrutura das trilhas segue o sumário do e-book *O Próximo Nível da Programação*, do mesmo autor.
- A trilha de Modelagem de Dados (em construção) acompanha os temas estudados na disciplina de Modelagem de Dados da faculdade; o texto e os exemplos são próprios.
- A trilha de Java e Orientação a Objetos (em construção) cobre os temas clássicos de livros introdutórios da linguagem, com texto e exemplos próprios.
- Documentações oficiais (MDN, Node.js, React, PostgreSQL, Supabase e outras) são a fonte de verdade: quando algo divergir, vale a documentação.
