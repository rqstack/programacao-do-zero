<p align="center"><img src="public/logo.png" alt="Logo da Programação do Zero" width="120"></p>

# Programação do Zero

**Do primeiro código aos seus próprios projetos.**

Uma plataforma gratuita para aprender programação passo a passo: aulas progressivas, exercícios, quizzes, jogos, desafios de código, **Batalha de Código multiplayer**, treino diário no estilo Duolingo, ranking, perfis, laboratório e projetos de portfólio. Sem plano pago — todo o conteúdo é aberto.

**Acesse:** https://rqstack.github.io/programacao-do-zero/

> ### 🤖 Um projeto de vibe coding
>
> Este é um projeto pessoal de estudo. Ele foi construído com **vibe coding**: eu descrevo o que quero, uma IA (Claude) escreve boa parte do código e do conteúdo, e eu reviso, testo e decido os rumos.
>
> Estou estudando inteligência artificial justamente para **entender** como ela funciona, onde ajuda e onde erra. Por isso o projeto é público: para mostrar o processo de forma transparente. Os commits feitos com ajuda da IA trazem a linha `Co-Authored-By: Claude`.
>
> Se encontrar um erro em alguma aula, abra uma *issue* — revisar o que a IA produz faz parte do aprendizado.

## O que tem aqui

- **20 trilhas** com aulas que seguem sempre a mesma estrutura: objetivo, por que importa, conceitos, exemplo prático, código explicado, erros comuns, resumo, exercício e quiz.
  Lógica de programação, HTML, CSS, JavaScript, Git e GitHub, TypeScript, React, Node.js e APIs, Modelagem de dados, SQL, Supabase (autenticação e segurança), Testes e depuração, Deploy e hospedagem, Full Stack, Java e Orientação a Objetos, Python do zero, C# e .NET para desktop, AWS (computação em nuvem com foco em segurança e custo zero), IA aplicada à programação (com n8n) e Portfólio, currículo e entrevistas.
  Os exemplos de código das trilhas de Python, C# e Java são executados de verdade na conferência; os que dependem de janelas do Windows, de pacotes externos ou de uma conta na AWS estão marcados na própria aula como não executados automaticamente.
- **Quizzes** de revisão por aula e um desafio final por trilha, com explicação em cada resposta.
- **9 jogos**: robô programador, caça aos bugs, monte o código, chuva de código, memória, construtor SQL, missões full stack, corrida de digitação e seletor CSS ao vivo. A cada partida (inclusive em "Jogar de novo") as fases são sorteadas de novo, misturando as cadastradas com fases geradas na hora (novos trechos de digitação, labirintos, consultas SQL, bugs, cartas e seletores), sempre com a mesma quantidade de fases e a mesma pontuação.
- **Desafios de código** em 11 linguagens: escolha a linguagem e a dificuldade; o site sorteia um problema e testa sua solução com casos gerados na hora. JavaScript, TypeScript, Python e SQL rodam no navegador (Web Worker isolado, Pyodide e sql.js); Java, C, C++, C#, Go, Rust e PHP são compilados no Judge0.
- **Batalha de Código (multiplayer)**: duas pessoas reais, o mesmo problema e o mesmo tempo; vence quem enviar primeiro uma solução correta, corrigida no servidor em sandbox (Judge0) com testes ocultos. Dez linguagens (JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust e PHP). Nove arenas, do Terminal Inicial ao Trono do Compilador (grafos, programação dinâmica e otimização), com troféus, temporadas e ranking próprio. Detalhes em [docs/BATALHA.md](docs/BATALHA.md).
- **Laboratório** para escrever HTML, CSS e JavaScript e ver o resultado na hora, isolado em um `iframe` com sandbox.
- **Projetos guiados** (19), do primeiro site a projetos de portfólio para vagas (loja, API com autenticação, agendamento, kanban em tempo real...), cada um com dicas de como apresentar no currículo e no LinkedIn.
- **Videoaulas gratuitas** recentes (até 1 ano) do YouTube indicadas em cada trilha.
- **Treino diário estilo Duolingo**: 10 perguntas, 3 vidas, revisão das perguntas erradas, meta diária de XP e ofensiva (dias seguidos).
- **Níveis com títulos**, de *Dev Bebê* a *Dev Lendário*, além de conquistas.
- **Login com Google (opcional)**: o XP passa a contar no **ranking geral** e na **liga da semana**, e o progresso sincroniza entre aparelhos. Sem login, tudo fica salvo no navegador. Por segurança, o banco registra no ranking no máximo 400 XP a cada 10 minutos e 1.200 XP por dia por pessoa; o restante entra nas sincronizações seguintes.
- **Perfil público** com GitHub, LinkedIn e site, **adicionar colegas** e **liga dos amigos**.
- **Apoio voluntário por Pix** (a partir de R$ 5, sem nenhuma vantagem no site e sem login), com confirmação feita no servidor. Ativo; detalhes em [docs/APOIO_PIX.md](docs/APOIO_PIX.md).
- **E-book do autor**, *O Próximo Nível da Programação*, na página `/ebook` e no menu (todo o conteúdo do site continua gratuito).
- **Política de Privacidade** e **Termos de Uso** em linguagem simples, nas páginas `/privacidade` e `/termos`.

## Tecnologias

Next.js 16 (App Router, exportação estática) · React 19 · TypeScript estrito · Tailwind CSS 4 · Supabase (Auth, PostgreSQL, Edge Functions, pg_cron) · Judge0 (execução isolada de código) · Zod · GSAP · Vitest · PGlite · ESLint.

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
| `npm run battle:config` | Gera o SQL de arenas, regras, temporadas e desafios da Batalha a partir do código |
| `npm run battle:validate` | Roda cada desafio da Batalha no Judge0 nas 10 linguagens (solução aceita, código inicial recusado) |
| `npx tsx scripts/check-challenges-remote.mts` | Confere os desafios de código nas linguagens compiladas no Judge0 |
| `npx tsx scripts/check-local-blocks.mts <trilha>` | Roda localmente os exemplos de Python e C# de uma trilha e compara com a saída escrita na aula (precisa de Python 3 e do .NET 10 SDK) |
| `npx tsx scripts/check-java-blocks.mts java` | Compila e roda no Judge0 os exemplos da trilha de Java |
| `npx tsx scripts/bundle-battle-submit.mts <saída.js>` | Gera o pacote da Edge Function da Batalha sem as soluções de referência |
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
src/lib/            regras: progresso, XP, treino, correção de quizzes, motor dos jogos (e gerador de fases em games/generate.ts) e login
supabase/           migrations do banco, seeds e as Edge Functions da Batalha e do Pix (functions/)
  producao-pendente/ scripts preparados para o banco de produção que ainda não foram aplicados (veja o LEIA-ME)
tests/              testes automatizados
```

Para adicionar uma aula, escreva o texto em `aulas.md` (separado por `<!-- aula: slug -->`) e os metadados em `course.ts`. Os testes acusam seções faltando, slugs repetidos, gabaritos inválidos e erros de sintaxe nos blocos de JavaScript.

Nos exemplos executáveis de Python e C#, escreva logo abaixo do bloco de código a linha `Saída:` e um bloco ```` ```texto ```` com o resultado esperado; `scripts/check-local-blocks.mts` roda o código e confere. Exemplos que não podem rodar sem internet, sem Windows ou sem uma conta externa ficam sem `Saída:` e com um aviso na aula. Depois de criar uma trilha, rode `npm run db:seed` e gere o SQL de produção da trilha com `npx tsx scripts/seed-for-course.mts <trilha>`.

## Créditos e referências

- A estrutura das trilhas segue o sumário do e-book *O Próximo Nível da Programação*, do mesmo autor.
- A trilha de Modelagem de Dados acompanha os temas estudados na disciplina de Modelagem de Dados da faculdade; o texto e os exemplos são próprios.
- A trilha de Java e Orientação a Objetos cobre os temas clássicos de livros introdutórios da linguagem, com texto e exemplos próprios.
- Documentações oficiais (MDN, Node.js, React, PostgreSQL, Supabase e outras) são a fonte de verdade: quando algo divergir, vale a documentação.
