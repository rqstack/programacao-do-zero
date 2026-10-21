# Programação do Zero

**Do primeiro código aos seus próprios projetos.**

Uma plataforma gratuita para aprender programação passo a passo: aulas progressivas, exercícios, quizzes, jogos, treino diário no estilo Duolingo, ranking, laboratório de código e projetos guiados. Sem plano pago — todo o conteúdo é aberto.

**Acesse:** https://rqstack.github.io/programacao-do-zero/

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
- **Treino diário estilo Duolingo**: 10 perguntas, 3 vidas, revisão das perguntas erradas, meta diária de XP e ofensiva (dias seguidos).
- **Níveis com títulos**, de *Dev Bebê* a *Dev Lendário*, além de conquistas.
- **Login com Google (opcional)**: o XP passa a contar no **ranking geral** e na **liga da semana**, e o progresso sincroniza entre aparelhos. Sem login, tudo fica salvo no navegador.

## Tecnologias

Next.js 16 (App Router, exportação estática) · React 19 · TypeScript estrito · Tailwind CSS 4 · Supabase (Auth + PostgreSQL) · Zod · GSAP · Vitest · PGlite · ESLint.

O site é estático e hospedado de graça no GitHub Pages. O login e o ranking usam o plano gratuito do Supabase, com todas as regras de segurança no próprio banco (RLS e funções). Configuração passo a passo: [docs/CONFIGURACAO.md](docs/CONFIGURACAO.md).

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
| `npm test` | Roda os testes: progresso, correção de quizzes e jogos, validação do conteúdo e da sintaxe dos códigos, e as regras de segurança do banco (RLS, XP e ranking) em um Postgres real embutido |
| `npm run db:seed` | Gera `supabase/seed.sql` com as atividades que valem XP |
| `npm run deploy` | Gera o site, confere os links e publica no GitHub Pages |
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
src/lib/            regras: progresso, XP, treino, correção de quizzes, motor dos jogos e login
supabase/           migrations do banco e seed das atividades
tests/              testes automatizados
```

Para adicionar uma aula, escreva o texto em `aulas.md` (separado por `<!-- aula: slug -->`) e os metadados em `course.ts`. Os testes acusam seções faltando, slugs repetidos, gabaritos inválidos e erros de sintaxe nos blocos de JavaScript.

## Créditos e referências

- A estrutura das trilhas segue o sumário do e-book *O Próximo Nível da Programação*, do mesmo autor.
- A trilha de Modelagem de Dados (em construção) acompanha os temas estudados na disciplina de Modelagem de Dados da faculdade; o texto e os exemplos são próprios.
- A trilha de Java e Orientação a Objetos (em construção) cobre os temas clássicos de livros introdutórios da linguagem, com texto e exemplos próprios.
- Documentações oficiais (MDN, Node.js, React, PostgreSQL, Supabase e outras) são a fonte de verdade: quando algo divergir, vale a documentação.
