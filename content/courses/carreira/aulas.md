<!-- aula: portfolio-que-mostra-o-que-voce-sabe -->
## Por que isso importa

Para quem está começando, o portfólio substitui a experiência que ainda não existe no currículo. Recrutadores e pessoas técnicas olham poucos minutos para cada candidato: um portfólio com dois ou três projetos bem feitos e bem explicados vale mais do que vinte tutoriais copiados. Esta aula mostra como escolher, construir e apresentar esses projetos.

## Conceitos fundamentais

- **Qualidade acima de quantidade**: 2 a 4 projetos completos, publicados e documentados.
- **Projetos que resolvem um problema**: um controle de gastos, um agendamento para um salão, um painel de tarefas com login. Problemas reais (mesmo pequenos) mostram raciocínio de produto.
- **Varie o que você demonstra**: um projeto de front-end caprichado, um com API e banco de dados, um com autenticação, testes ou integração externa.
- **Saia do tutorial**: se seguiu um curso, **mude** o projeto: novas funcionalidades, outro tema, outra regra de negócio. Diga no README o que foi seu.
- **Publicado e funcionando**: link para testar (GitHub Pages, Vercel, Render) e dados de exemplo para quem visitar não encontrar uma tela vazia.
- **Sinais de qualidade**: README claro, commits com mensagens descritivas, código organizado, tratamento de erros, responsividade, pelo menos alguns testes.
- **Honestidade**: não apresente como seu um projeto que você não entende. Na entrevista, perguntarão sobre ele.

## Exemplo prático

Uma forma de planejar um projeto de portfólio antes de escrever código:

```texto
Projeto: Agenda Fácil (agendamento para pequenos negócios)

Problema: um salão de bairro marca horários pelo WhatsApp e perde horários
por esquecimento.

Funcionalidades essenciais (versão 1):
- Cliente escolhe serviço, dia e horário livre
- Dono vê a agenda do dia e cancela horários
- Não permite dois agendamentos no mesmo horário (regra testada)

O que esse projeto demonstra:
- Front-end responsivo (React)
- API com validação (Node + Zod) e banco relacional com restrição única
- Autenticação do dono e regras de acesso
- Testes da regra de conflito de horário

Fora do escopo da versão 1 (vira "Próximos passos" no README):
- Lembretes automáticos, pagamentos, vários profissionais
```

## Explicando o código

- O problema concreto dá um motivo para cada funcionalidade, e isso rende uma boa história na entrevista.
- A lista "o que demonstra" liga o projeto às vagas: você escolhe as funcionalidades pensando nas habilidades que quer provar.
- Uma **regra de negócio testada** (sem conflito de horário) diferencia o projeto de um CRUD comum.
- Limitar o escopo da versão 1 faz o projeto **terminar**. Projetos inacabados não ajudam.

## Erros comuns

- **Dezenas de projetos de tutorial** idênticos aos de milhares de pessoas.
- **Projeto sem link funcionando** ou que quebra ao abrir.
- **Escopo enorme** que nunca termina.
- **Não saber explicar** decisões do próprio projeto.

## Resumo

- Poucos projetos completos, publicados e documentados.
- Problemas reais, variedade de habilidades e uma regra de negócio testada.
- Escopo pequeno para terminar; honestidade sobre o que é seu.

## Próximo passo

Um bom projeto precisa ser bem apresentado. A próxima aula mostra como deixar o **GitHub** com cara profissional.

<!-- aula: github-como-vitrine -->
## Por que isso importa

Na trilha de Git você aprendeu a versionar e publicar. Aqui o foco é outro: o GitHub como **vitrine**. Muitas vagas pedem o link do perfil, e quem avalia abre os repositórios fixados e lê o README. Um perfil organizado mostra cuidado; um perfil bagunçado esconde até os bons projetos.

## Conceitos fundamentais

- **Foto, nome e bio**: o que você faz e o que está estudando, em uma linha.
- **README de perfil**: um repositório com o **mesmo nome do seu usuário** vira a página inicial do perfil. Use para uma apresentação curta e links.
- **Repositórios fixados** (*pinned*): escolha até seis; coloque os melhores projetos em primeiro lugar.
- **README de cada projeto**: o que é, link para testar, imagem ou GIF, tecnologias, como rodar localmente, decisões e próximos passos.
- **Descrição e tópicos**: preencha a descrição curta e os *topics* (react, nodejs, supabase) de cada repositório.
- **Histórico de commits**: mensagens descritivas e commits pequenos contam a história do projeto. Um único commit "projeto pronto" não mostra o processo.
- **Nada de segredos**: confira que `.env` e chaves nunca foram para o repositório (se foram, troque a chave: apagar o arquivo não apaga o histórico).
- **Contribuições**: issues bem escritas, correções de documentação e pequenos PRs em projetos abertos também contam.

## Exemplo prático

Estrutura de README para um projeto de portfólio:

```texto
# Agenda Fácil

Agendamento online para pequenos negócios: o cliente escolhe serviço e horário,
o dono gerencia a agenda do dia.

🔗 Acesse: https://seu-usuario.github.io/agenda-facil
(conta de demonstração: veja a seção "Testar")

![Tela da agenda](docs/agenda.png)

## Funcionalidades
- Agendamento sem conflito de horários (regra validada no banco e testada)
- Área do dono com login
- Layout responsivo

## Tecnologias
React, TypeScript, Node.js, Express, PostgreSQL (Supabase), Vitest

## Como rodar localmente
1. git clone ... && cd agenda-facil
2. cp .env.example .env  (preencha as variáveis)
3. npm install && npm run dev

## Decisões
- Restrição única (profissional, horário) no banco para evitar agendamento duplo,
  mesmo com dois cliques simultâneos.

## Próximos passos
- Lembretes por e-mail
- Vários profissionais por estabelecimento
```

## Explicando o código

- A primeira linha diz **o que é e para quem**: quem lê decide em segundos se continua.
- O link e a imagem logo no início permitem ver o projeto sem instalar nada.
- "Como rodar localmente" com `.env.example` mostra que você sabe lidar com configuração sem expor segredos.
- A seção **Decisões** é a mais valiosa: mostra que você pensou no problema (e rende perguntas boas na entrevista).
- "Próximos passos" mostra visão de evolução sem fingir que o projeto está completo.

## Erros comuns

- **README vazio** ou o padrão gerado pela ferramenta.
- **Repositórios fixados aleatórios** (exercícios de aula, forks sem mudanças).
- **Chaves e `.env` no histórico**.
- **Projeto sem instruções** para rodar.

## Resumo

- Perfil com bio, README de perfil e os melhores projetos fixados.
- README de projeto: o que é, link, imagem, tecnologias, como rodar, decisões e próximos passos.
- Commits descritivos e nenhum segredo no histórico.

## Próximo passo

Com projetos e GitHub prontos, vamos ao **currículo**.

<!-- aula: curriculo-de-dev-iniciante -->
## Por que isso importa

O currículo passa primeiro por filtros (sistemas de triagem e recrutadores que leem dezenas por dia) antes de chegar a uma pessoa técnica. Um currículo claro, objetivo e alinhado à vaga aumenta muito a chance de ser chamado, mesmo sem experiência formal na área.

## Conceitos fundamentais

- **Uma página** para quem está começando. Formato simples (PDF), sem colunas complicadas, tabelas ou ícones no lugar de texto, que confundem os sistemas de triagem (ATS).
- **Cabeçalho**: nome, cidade/estado (não precisa do endereço completo), e-mail profissional, telefone, links de **GitHub**, **LinkedIn** e portfólio.
- **Resumo** de 2 a 3 linhas: o que você busca e o que já sabe fazer.
- **Projetos** (para iniciantes, vêm **antes** de experiências fora da área): nome, link, uma linha sobre o problema e o que você construiu, tecnologias.
- **Habilidades**: só o que você consegue usar e explicar. Separe por grupos (front-end, back-end, ferramentas).
- **Experiência**: inclusive fora da TI. Destaque o que é transferível: atendimento, organização, resolução de problemas, trabalho em equipe.
- **Formação e cursos**: curso técnico, faculdade (em andamento vale), cursos relevantes, sem listar dezenas.
- **Verbos de ação e resultados**: "desenvolvi", "automatizei", "reduzi"; números quando houver.
- **Adapte para cada vaga**: use as palavras da descrição (se forem verdade para você).
- **Não inclua**: foto (em geral), CPF, RG, estado civil, idade, "pretensão salarial" sem pedirem.

## Exemplo prático

```texto
ANA SOUZA
São Paulo, SP · ana.souza.dev@email.com · (11) 90000-0000
github.com/anasouza · linkedin.com/in/anasouza · anasouza.dev

RESUMO
Desenvolvedora front-end em início de carreira, buscando vaga de estágio ou júnior.
Construo interfaces responsivas em React e TypeScript e APIs simples em Node.js.

PROJETOS
Agenda Fácil — agenda online para pequenos negócios · anasouza.dev/agenda
  React, TypeScript, Node.js, PostgreSQL. Regra de horários sem conflito garantida
  no banco e coberta por testes automatizados (Vitest).
Controle de Gastos — app de finanças pessoais com gráficos · anasouza.dev/gastos
  React, Supabase (autenticação e RLS). Importação de extrato CSV.

HABILIDADES
Front-end: HTML, CSS, JavaScript, TypeScript, React, Tailwind
Back-end: Node.js, Express, SQL (PostgreSQL), Supabase
Ferramentas: Git e GitHub, Vitest, Vercel

EXPERIÊNCIA
Atendente — Loja X (2023–atual)
  Atendimento a cerca de 40 clientes por dia; criei uma planilha de controle de
  estoque usada por toda a equipe.

FORMAÇÃO
Análise e Desenvolvimento de Sistemas — Faculdade Y (em andamento, previsão 2027)
```

## Explicando o código

- O cabeçalho tem tudo para contato e avaliação técnica, sem dados pessoais desnecessários.
- O resumo diz o **tipo de vaga** e as **tecnologias principais** em duas linhas.
- Projetos vêm antes da experiência porque, para a vaga de dev, são a prova mais forte. Cada um tem link, tecnologias e um detalhe que se destaca (regra testada, RLS).
- A experiência fora da área mostra uma habilidade transferível com número ("40 clientes por dia") e uma iniciativa técnica (a planilha).
- Formato de texto simples: passa por sistemas de triagem e é fácil de ler.

## Erros comuns

- **Listar 30 tecnologias** que você viu uma vez.
- **Currículo de três páginas** sem projetos.
- **Mesmo currículo para todas as vagas**.
- **Links quebrados** para GitHub ou projetos.
- **Mentir**: a entrevista técnica descobre.

## Resumo

- Uma página, formato simples, links funcionando.
- Projetos em destaque, habilidades reais, experiência transferível com resultados.
- Adapte para cada vaga sem inventar.

## Próximo passo

Agora, onde e como procurar vagas: **LinkedIn e estratégias de busca**.

<!-- aula: linkedin-e-busca-de-vagas -->
## Por que isso importa

Muitas vagas de estágio e júnior são preenchidas por indicação ou por recrutadores que buscam perfis no LinkedIn. Enviar currículo para tudo sem estratégia gera frustração. Um perfil bem preenchido, uma busca organizada e algumas conexões certas fazem mais diferença do que centenas de candidaturas automáticas.

## Conceitos fundamentais

- **Perfil do LinkedIn**: foto clara, **título** que diz o que você faz ("Desenvolvedor Front-end | React | TypeScript"), seção "Sobre" curta, projetos em "Destaques", habilidades e o link do GitHub.
- **Ative "Aberto a trabalho"** com os cargos que procura (pode ser visível só para recrutadores).
- **Onde procurar**: LinkedIn Vagas, sites de vagas e carreiras das empresas, programas de estágio e trainee, comunidades de tecnologia, eventos e meetups.
- **Leia a vaga direito**: requisitos obrigatórios versus desejáveis. Se você atende boa parte do essencial, candidate-se: ninguém atende 100%.
- **Cuidado com golpes**: vaga que pede pagamento, "taxa de cadastro", curso obrigatório pago ou dados bancários antes da contratação é golpe.
- **Organize as candidaturas**: uma planilha com empresa, vaga, data, link, status e próximo passo evita se perder e permite acompanhar.
- **Networking sem forçar**: comente com conteúdo em publicações técnicas, participe de comunidades, compartilhe o que aprendeu (um projeto novo, um problema que resolveu).
- **Mensagem para recrutadores**: curta, personalizada e com o link da vaga.

## Exemplo prático

Mensagem para uma pessoa que trabalha na empresa da vaga:

```texto
Olá, Carla! Vi a vaga de Desenvolvedor(a) Front-end Júnior na Empresa Z
(link da vaga) e me interessei pelo produto de agendamentos de vocês.

Sou desenvolvedor iniciante e construí um projeto parecido, uma agenda online
com React e Node, com regra de horários sem conflito testada:
seu-usuario.github.io/agenda-facil

Você poderia me contar como é o dia a dia do time ou se há algo que eu deveria
reforçar antes de me candidatar? Obrigado pela atenção!
```

Planilha simples de acompanhamento:

```texto
Empresa   | Vaga                 | Data   | Status            | Próximo passo
Empresa Z | Front-end Júnior     | 03/11  | Candidatura feita | Mensagem para recrutador dia 10/11
Empresa W | Estágio Dev          | 05/11  | Teste técnico     | Entregar até 12/11
Empresa K | Suporte Técnico N1   | 06/11  | Recusado          | Pedir feedback
```

## Explicando o código

- A mensagem é curta, mostra que você conhece o produto e oferece **prova** (o link do projeto relacionado).
- Ela pede uma informação, não um emprego: é mais fácil responder e abre conversa.
- A planilha transforma a busca em processo: você sabe o que acompanhar e quando.
- Pedir feedback após uma recusa às vezes traz dicas valiosas (nem sempre respondem, e tudo bem).

## Erros comuns

- **Título do LinkedIn vazio** ("Estudante") e sem link para o GitHub.
- **Mensagem genérica copiada** para dezenas de pessoas.
- **Não se candidatar** por não atender 100% dos requisitos.
- **Cair em vagas que pedem pagamento**.
- **Não acompanhar** as candidaturas feitas.

## Resumo

- Perfil completo com título claro, projetos e "Aberto a trabalho".
- Busca organizada em planilha; candidate-se mesmo sem atender tudo.
- Networking genuíno e mensagens curtas e personalizadas; fuja de vagas que cobram.

## Próximo passo

Fui chamado! E agora? A próxima aula é sobre **entrevistas técnicas e comportamentais**.

<!-- aula: entrevistas-tecnicas -->
## Por que isso importa

A entrevista é onde você mostra como pensa. Em vagas de iniciante, ninguém espera que você saiba tudo: avaliam raciocínio, comunicação, vontade de aprender e honestidade. Preparação reduz o nervosismo e evita travar em perguntas previsíveis.

## Conceitos fundamentais

- **Etapas comuns**: triagem com recrutador, teste técnico (para casa ou ao vivo), entrevista técnica, entrevista comportamental e conversa com a liderança.
- **Pense em voz alta**: no desafio ao vivo, explique o que está entendendo, as ideias e os testes que vai fazer. O processo vale tanto quanto a resposta.
- **Passos para um problema**: entender (faça perguntas, confirme exemplos), planejar, resolver de forma simples primeiro, testar com casos de borda, só depois melhorar.
- **Método STAR** para perguntas comportamentais: **S**ituação, **T**arefa, **A**ção, **R**esultado.
- **"Não sei"** dito com honestidade, seguido de como você descobriria, é muito melhor do que inventar.
- **Conheça seus projetos a fundo**: por que escolheu cada tecnologia, o que faria diferente, o maior problema que enfrentou.
- **Teste técnico para casa**: siga o enunciado, entregue no prazo, README explicando como rodar e decisões, commits organizados, testes se possível.
- **Faça perguntas no final**: como é o time, como é o processo de revisão de código, como é o acompanhamento de quem entra.

## Exemplo prático

Resposta no método STAR para "Conte sobre um problema difícil que você resolveu":

```texto
Situação: no meu projeto Agenda Fácil, às vezes dois clientes conseguiam agendar
o mesmo horário quando clicavam ao mesmo tempo.

Tarefa: garantir que nunca existissem dois agendamentos para o mesmo profissional
no mesmo horário.

Ação: primeiro reproduzi o problema com um teste que fazia duas requisições ao mesmo
tempo. Vi que a checagem só existia no código da API. Adicionei uma restrição única
no banco (profissional + horário) e tratei o erro na API para devolver 409 com uma
mensagem clara para o usuário.

Resultado: o teste passou a mostrar sempre um agendamento aceito e um recusado.
Aprendi que regras importantes devem ser garantidas no banco, não só no código.
```

Desafio ao vivo, pensando em voz alta:

```texto
Enunciado: "Retorne o primeiro caractere que não se repete numa string."

1. Entender: "Se todos se repetirem, retorno o quê? Vazio ou null?"
   Exemplo: "aabcb" → "c"
2. Plano simples: contar quantas vezes cada caractere aparece (um Map),
   depois percorrer a string de novo e devolver o primeiro com contagem 1.
3. Complexidade: duas passadas, O(n). Uma solução com dois laços aninhados
   seria O(n²).
4. Testes que vou fazer: "aabcb" → "c", "aabb" → null, "" → null, "x" → "x".
```

## Explicando o código

- A resposta STAR tem uma história concreta com começo, meio e fim, e termina com um **aprendizado**.
- A ação mostra hábitos valorizados: reproduzir com teste, achar a causa, corrigir no lugar certo e dar boa mensagem ao usuário.
- No desafio ao vivo, a primeira atitude é **perguntar** sobre o caso de borda: isso mostra maturidade.
- Explicar o plano e a complexidade antes de codar permite que a pessoa entrevistadora corrija o rumo cedo.
- Listar os testes no final mostra preocupação com qualidade, mesmo sem tempo de rodar tudo.

## Erros comuns

- **Ficar em silêncio** durante o desafio.
- **Começar a codar sem entender** o enunciado.
- **Inventar** em vez de admitir que não sabe.
- **Não conseguir explicar** o próprio projeto.
- **Não fazer nenhuma pergunta** no final.

## Resumo

- Pense em voz alta: entender, planejar, resolver simples, testar.
- STAR para perguntas comportamentais; honestidade quando não souber.
- Conheça seus projetos e prepare perguntas para a empresa.

## Próximo passo

Para fechar: como **continuar evoluindo** depois de conseguir (ou enquanto busca) a primeira vaga.

<!-- aula: aprendizado-continuo-e-primeira-vaga -->
## Por que isso importa

Tecnologia muda rápido e a primeira vaga raramente chega na primeira tentativa. Quem cresce na carreira não é quem sabe tudo, mas quem tem um **método** para aprender, pede ajuda do jeito certo e mantém constância. Esta aula fecha a trilha com hábitos que valem para o resto da carreira.

## Conceitos fundamentais

- **Constância vence intensidade**: uma hora por dia, todos os dias, rende mais do que uma maratona no fim de semana e uma semana parado.
- **Aprender construindo**: para cada assunto novo, um pequeno projeto ou exercício. Ler sem praticar é esquecido rápido.
- **Fundamentos primeiro**: lógica, JavaScript, HTTP, SQL e Git duram anos; frameworks mudam.
- **Documentação oficial** como fonte principal; vídeos e IA como apoio (lembre-se da trilha de IA aplicada).
- **Pedir ajuda bem**: o que você queria, o que aconteceu, o que já tentou, o código mínimo e o erro completo.
- **Na primeira vaga**: pergunte sem medo, anote o que aprende, leia o código existente antes de mudar, entregue em partes pequenas e aceite revisões de código como aprendizado, não como crítica pessoal.
- **Caminhos de entrada**: estágio, júnior, suporte técnico, QA (testes), freelas pequenos, vagas em empresas fora de tecnologia. Todos contam como experiência.
- **Cuide de você**: rejeições fazem parte do processo e não definem sua capacidade. Pausas e sono também são parte do estudo.

## Exemplo prático

Um plano semanal simples para quem estuda e busca vaga ao mesmo tempo:

```texto
Segunda a sexta (1h a 1h30 por dia)
  40 min  → aula ou documentação de um assunto (um tema por semana)
  30 min  → aplicar no projeto do portfólio ou em um desafio do site
  10 min  → anotar o que aprendeu (um parágrafo, com suas palavras)

Sábado (2h)
  1h      → evoluir o projeto principal (uma funcionalidade por semana)
  30 min  → Batalha de Código ou desafios de lógica
  30 min  → candidaturas + atualizar a planilha

Domingo
  Descanso. Se quiser, só revisar as anotações da semana.

Todo mês
  - Publicar uma melhoria visível (nova funcionalidade, testes, README)
  - Compartilhar algo que aprendeu (post curto no LinkedIn)
```

## Explicando o código

- O dia tem três partes: **entrada** (estudar), **prática** (aplicar) e **fixação** (anotar com suas palavras). As três juntas fazem o conhecimento ficar.
- Um tema por semana evita pular de assunto em assunto sem terminar nada.
- O sábado une evolução do portfólio, prática de problemas e busca de vagas, sem deixar a busca tomar a semana inteira.
- O descanso está no plano de propósito: constância por meses depende de não se esgotar.
- A meta mensal visível alimenta o portfólio e o LinkedIn ao mesmo tempo.

## Erros comuns

- **Trocar de tecnologia toda semana** sem terminar nada.
- **Só assistir aulas** sem construir.
- **Esperar se sentir pronto** para se candidatar.
- **Ter vergonha de perguntar** na primeira vaga.
- **Comparar seu começo** com a carreira de anos de outra pessoa.

## Resumo

- Constância, prática e fundamentos.
- Peça ajuda com contexto; na primeira vaga, pergunte, anote e entregue em partes pequenas.
- Várias portas de entrada contam; cuide da saúde ao longo do caminho.

## Próximo passo

Você concluiu a trilha de Carreira. Escolha um dos **projetos guiados de portfólio** do site, publique, escreva o README com o modelo desta trilha e atualize seu currículo e o LinkedIn com ele.
