<!-- aula: controle-de-versao -->
## Por que isso importa

Quem nunca salvou arquivos como `projeto-final.html`, `projeto-final-2.html` e `projeto-final-agora-vai.html`? Controle de versão resolve isso: guarda cada etapa do projeto, mostra o que mudou e permite voltar atrás sem medo. É uma das primeiras ferramentas que qualquer vaga de desenvolvimento espera que você conheça.

## Conceitos fundamentais

- **Controle de versão**: registro do histórico de mudanças de um conjunto de arquivos.
- **Git**: o sistema de controle de versão mais usado no mundo. Ele roda no seu computador e funciona até sem internet.
- **GitHub**: um site que hospeda repositórios Git na nuvem e adiciona colaboração (revisões, issues, páginas). Git e GitHub são coisas diferentes: o Git é a ferramenta; o GitHub, um serviço que usa o Git.
- **Repositório**: a pasta do projeto acompanhada pelo Git, com todo o histórico.
- **Terminal**: onde você digita os comandos do Git. No Windows, o Git Bash vem junto com a instalação do Git.

Instale o Git a partir de git-scm.com e confira:

```bash
git --version
```

Antes do primeiro uso, diga ao Git quem você é. Esse nome e e-mail ficam gravados em cada registro (commit):

```bash
git config --global user.name "Seu Nome"
git config --global user.email "voce@exemplo.com"
git config --global init.defaultBranch main
```

## Exemplo prático

Crie uma pasta e transforme-a em repositório:

```bash
mkdir meu-site
cd meu-site
git init
git status
```

O Git responde que você está na branch `main` e que ainda não há commits.

## Explicando o código

- `mkdir` cria a pasta e `cd` entra nela.
- `git init` cria uma pasta oculta chamada `.git`, onde o histórico vai morar. Apagar essa pasta apaga o histórico.
- `git status` é o comando que você mais vai usar: mostra o estado atual do repositório.
- `--global` faz a configuração valer para todos os seus projetos neste computador.

## Erros comuns

- **Rodar `git init` na pasta errada**, como a pasta do usuário inteira. Confira com `pwd` (mostra onde você está) antes.
- **Confundir Git com GitHub**: dá para usar Git sem nunca abrir o GitHub.
- **Usar um e-mail que você não quer público**: em repositórios públicos, o e-mail do commit fica visível. O GitHub oferece um e-mail "noreply" para isso.

## Resumo

- Git guarda o histórico do projeto; GitHub hospeda repositórios e facilita colaborar.
- Configure nome e e-mail uma vez com `git config --global`.
- `git init` cria o repositório; `git status` mostra o estado.

## Próximo passo

Na próxima aula você vai criar os primeiros commits e entender o ciclo editar → preparar → registrar.

<!-- aula: commits -->
## Por que isso importa

O commit é a unidade básica do Git: uma foto do projeto em um momento, com uma mensagem explicando o que mudou. Um bom histórico de commits funciona como um diário do projeto e ajuda a encontrar quando um bug apareceu.

## Conceitos fundamentais

Os arquivos passam por três áreas:

1. **Diretório de trabalho**: os arquivos como estão na pasta.
2. **Área de preparação (staging)**: o que vai entrar no próximo commit. Você escolhe com `git add`.
3. **Histórico**: os commits registrados com `git commit`.

Comandos do dia a dia:

- `git add arquivo` (ou `git add .` para tudo) prepara mudanças.
- `git commit -m "mensagem"` registra.
- `git log --oneline` lista o histórico de forma compacta.
- `git diff` mostra o que mudou e ainda não foi preparado.
- `.gitignore`: arquivo que lista o que o Git deve ignorar, como `node_modules/` e arquivos `.env` com senhas.

**Boas mensagens** dizem *o que* e *por quê*, no imperativo e de forma curta: "Adiciona formulário de contato", e não "mudanças".

## Exemplo prático

```bash
echo "<h1>Olá</h1>" > index.html
git status
git add index.html
git commit -m "Cria a página inicial"

echo "<p>Bem-vindo!</p>" >> index.html
git diff
git add index.html
git commit -m "Adiciona mensagem de boas-vindas"

git log --oneline
```

## Explicando o código

- `echo ... > index.html` cria o arquivo com uma linha; `>>` acrescenta ao final.
- O primeiro `git status` mostra `index.html` como "untracked" (não acompanhado).
- `git diff` mostra a linha nova com um `+` antes de você prepará-la.
- `git log --oneline` mostra os dois commits, cada um com um código curto (o *hash*) que identifica aquele commit.

## Erros comuns

- **Commitar segredos** (senhas, chaves de API). Mesmo que você apague depois, o segredo continua no histórico. Use `.gitignore` desde o início e, se vazar, troque a chave.
- **Commits gigantes** com mudanças sem relação. Prefira commits pequenos, um assunto por vez.
- **Esquecer o `git add`**: o commit sai vazio ou sem a mudança que você queria.

## Resumo

- Ciclo: editar → `git add` → `git commit`.
- `git status`, `git diff` e `git log` mostram onde você está.
- `.gitignore` evita versionar o que não deve, como dependências e segredos.

## Próximo passo

A seguir você vai trabalhar em paralelo sem quebrar a versão principal, usando branches.

<!-- aula: branches-e-merge -->
## Por que isso importa

Imagine testar um novo layout sem correr o risco de estragar o site que já funciona. Branches são linhas de trabalho separadas: você experimenta à vontade e só junta à versão principal quando estiver pronto. É assim que equipes trabalham em várias funcionalidades ao mesmo tempo.

## Conceitos fundamentais

- **Branch**: um ponteiro para uma sequência de commits. A principal costuma se chamar `main`.
- `git switch -c nome`: cria uma branch e muda para ela.
- `git switch main`: volta para a `main`.
- `git branch`: lista as branches (a atual tem um `*`).
- **Merge**: juntar o trabalho de uma branch em outra, com `git merge nome`.
- **Fast-forward**: quando a `main` não mudou desde que a branch foi criada, o merge só "avança" o ponteiro.
- Nomes de branch descritivos: `feature/formulario-contato`, `fix/menu-mobile`.

## Exemplo prático

```bash
git switch -c feature/rodape
echo "<footer>Contato</footer>" >> index.html
git add index.html
git commit -m "Adiciona rodapé"

git switch main
git merge feature/rodape
git branch -d feature/rodape
git log --oneline --graph
```

## Explicando o código

- Na branch `feature/rodape`, o commit do rodapé não afeta a `main`.
- Ao voltar para a `main`, o `index.html` volta a não ter o rodapé: o Git troca os arquivos da pasta conforme a branch.
- `git merge feature/rodape` traz o commit para a `main`.
- `git branch -d` apaga a branch já integrada (o histórico continua).
- `--graph` desenha as linhas do histórico no terminal.

## Erros comuns

- **Trocar de branch com mudanças não salvas**: o Git avisa e pode impedir a troca. Faça commit ou use `git stash` (guarda as mudanças temporariamente).
- **Fazer merge na direção errada**: o merge traz a branch informada **para a branch em que você está**. Confira com `git branch` antes.
- **Branches que vivem demais**: quanto mais tempo separadas, mais difícil juntar.

## Resumo

- Branches isolam experimentos e funcionalidades.
- `git switch -c` cria; `git merge` junta na branch atual.
- Mantenha branches curtas e com nomes que digam o que fazem.

## Próximo passo

Na próxima aula você vai aprender a resolver o que acontece quando duas branches mudam a mesma linha: os conflitos.

<!-- aula: conflitos -->
## Por que isso importa

Conflitos assustam quem está começando, mas são normais: significam apenas que duas pessoas (ou duas branches) mudaram o mesmo trecho e o Git não sabe qual versão manter. Saber resolvê-los com calma é uma habilidade básica de quem trabalha em equipe.

## Conceitos fundamentais

- O Git junta automaticamente mudanças em **linhas diferentes**.
- Quando a **mesma linha** muda nos dois lados, ele marca um **conflito** e pausa o merge.
- O arquivo fica com marcadores:

```texto
<<<<<<< HEAD
versão da branch atual
=======
versão da branch que está chegando
>>>>>>> nome-da-branch
```

Para resolver:

1. Abra o arquivo e decida o conteúdo final (uma versão, a outra ou uma combinação).
2. Apague os três marcadores.
3. `git add arquivo` para marcar como resolvido.
4. `git commit` para concluir o merge.

`git merge --abort` desiste do merge e volta ao estado anterior. Editores como o VS Code mostram botões para aceitar uma das versões.

## Exemplo prático

Duas branches mudaram o título:

```texto
<<<<<<< HEAD
<h1>Bem-vindo ao meu site</h1>
=======
<h1>Olá! Este é o meu portfólio</h1>
>>>>>>> feature/novo-titulo
```

Resolvendo com uma combinação:

```html
<h1>Olá! Bem-vindo ao meu portfólio</h1>
```

```bash
git add index.html
git commit -m "Resolve conflito no título"
```

## Explicando o código

- `HEAD` é a branch em que você está (aqui, a `main`).
- O trecho entre `=======` e `>>>>>>>` veio da branch `feature/novo-titulo`.
- A versão final não precisa ser nenhuma das duas: você decide o que faz sentido.
- O `git add` diz ao Git que aquele arquivo já está resolvido.

## Erros comuns

- **Commitar com os marcadores** ainda no arquivo: o site quebra. Procure por `<<<<<<<` antes de commitar.
- **Escolher uma versão sem entender a outra**: você pode apagar o trabalho de alguém. Na dúvida, converse.
- **Entrar em pânico**: `git merge --abort` sempre permite recomeçar.

## Resumo

- Conflito = mesma linha alterada dos dois lados.
- Edite, remova os marcadores, `git add` e `git commit`.
- Branches curtas e merges frequentes evitam conflitos grandes.

## Próximo passo

Agora que você domina o Git local, vai levar seus repositórios para a nuvem com o GitHub.

<!-- aula: github-e-repositorios-remotos -->
## Por que isso importa

Um repositório só no seu computador some se o disco falhar e ninguém mais consegue ver ou colaborar. O GitHub guarda uma cópia na nuvem, vira seu portfólio público e é onde a maior parte dos projetos de código aberto vive.

## Conceitos fundamentais

- **Remoto**: uma cópia do repositório em outro lugar. Por convenção, o principal se chama `origin`.
- `git remote add origin URL`: liga o repositório local a um remoto.
- `git push`: envia seus commits para o remoto.
- `git pull`: traz os commits novos do remoto e junta com os seus.
- `git clone URL`: baixa um repositório inteiro, com o histórico.
- **Autenticação**: o GitHub não aceita a senha da conta no terminal. Use a GitHub CLI (`gh auth login`), um token de acesso pessoal ou uma chave SSH.

## Exemplo prático

Depois de criar um repositório vazio no GitHub (botão **New repository**):

```bash
git remote add origin https://github.com/seu-usuario/meu-site.git
git push -u origin main
```

Em outro computador, ou para colaborar:

```bash
git clone https://github.com/seu-usuario/meu-site.git
cd meu-site
git pull
```

## Explicando o código

- `-u origin main` liga a sua `main` local à `main` do GitHub; depois disso basta `git push` e `git pull`.
- `git clone` já configura o `origin` automaticamente.
- `git pull` é, na prática, buscar (`fetch`) e juntar (`merge`).

## Erros comuns

- **`rejected` ao fazer push**: o remoto tem commits que você não tem. Faça `git pull` primeiro, resolva conflitos e tente de novo.
- **`git push --force`** sem entender: sobrescreve o histórico remoto e pode apagar o trabalho de outras pessoas. Evite em branches compartilhadas.
- **Subir arquivos enormes ou a pasta `node_modules`**: configure o `.gitignore` antes do primeiro commit.

## Resumo

- `origin` é o remoto principal; `push` envia e `pull` traz.
- `clone` baixa um repositório completo.
- Autentique com a GitHub CLI, token ou SSH.

## Próximo passo

Na próxima aula você vai colaborar como em uma equipe: pull requests, revisões e issues.

<!-- aula: pull-requests-e-colaboracao -->
## Por que isso importa

Em projetos reais, ninguém joga código direto na `main`. As mudanças chegam por **pull requests**: alguém propõe, outra pessoa revisa, os testes rodam e só então o código entra. Esse fluxo evita bugs, espalha conhecimento pelo time e é o mesmo usado em projetos de código aberto.

## Conceitos fundamentais

- **Pull request (PR)**: pedido para juntar uma branch em outra, com descrição, discussão e revisão.
- **Revisão de código**: comentários linha a linha, sugestões e aprovação.
- **Issue**: registro de um bug, ideia ou tarefa. PRs podem fechar issues automaticamente com "Closes #12" na descrição.
- **Fork**: sua cópia de um repositório de outra pessoa, usada para contribuir quando você não tem permissão de escrita.
- **README.md**: a porta de entrada do repositório: o que é, como rodar, como contribuir.

Fluxo típico:

1. Crie uma branch para a tarefa.
2. Faça commits pequenos.
3. Envie a branch (`git push -u origin nome-da-branch`).
4. Abra o PR no GitHub explicando o quê e por quê.
5. Responda à revisão com novos commits.
6. Depois da aprovação, faça o merge e apague a branch.

## Exemplo prático

```bash
git switch -c fix/link-quebrado
# corrige o link no index.html
git add index.html
git commit -m "Corrige link do menu para a página Sobre"
git push -u origin fix/link-quebrado
gh pr create --title "Corrige link do menu" --body "O link apontava para sobre.htm. Closes #3"
```

## Explicando o código

- A branch tem um nome que descreve a correção.
- `git push -u` envia a branch nova para o GitHub.
- `gh pr create` abre o PR pela GitHub CLI; o mesmo pode ser feito pelo site, que mostra um botão "Compare & pull request".
- "Closes #3" fecha a issue 3 quando o PR for aceito.

## Erros comuns

- **PRs enormes**: ninguém consegue revisar mil linhas direito. Divida em partes.
- **Descrição vazia**: quem revisa precisa saber o contexto e como testar.
- **Levar a revisão para o lado pessoal**: comentários são sobre o código, não sobre você.

## Resumo

- PRs propõem mudanças com revisão antes do merge.
- Issues organizam bugs e tarefas; forks permitem contribuir sem permissão de escrita.
- Um bom README e boas descrições facilitam a colaboração.

## Próximo passo

Na última aula da trilha, você vai publicar um projeto na internet de graça com o GitHub Pages.

<!-- aula: publicando-com-github-pages -->
## Por que isso importa

Um projeto que só roda no seu computador é difícil de mostrar. Com o GitHub Pages, qualquer site estático (HTML, CSS e JavaScript) ganha um endereço público, de graça, atualizado a cada push. Este próprio site, a Programação do Zero, é publicado assim.

## Conceitos fundamentais

- **Site estático**: arquivos prontos (HTML, CSS, JS, imagens) que o servidor só entrega. Não há código rodando no servidor.
- **GitHub Pages**: serviço do GitHub que publica um site estático a partir de uma branch (por exemplo, `main` ou `gh-pages`) ou de uma automação (GitHub Actions).
- **Endereço**: `https://seu-usuario.github.io/nome-do-repositorio/`.
- **Caminhos**: como o site fica em um subcaminho (`/nome-do-repositorio/`), prefira links relativos (`sobre.html`, `css/estilo.css`) em vez de começar com `/`.

Para ativar: no repositório, **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`. Em um ou dois minutos o endereço aparece na mesma tela.

## Exemplo prático

Estrutura mínima de um projeto publicável:

```texto
meu-site/
├── index.html
├── sobre.html
├── css/
│   └── estilo.css
└── README.md
```

Links relativos no `index.html`:

```html
<link rel="stylesheet" href="css/estilo.css">
<a href="sobre.html">Sobre</a>
```

Para atualizar o site, basta enviar commits:

```bash
git add .
git commit -m "Atualiza a seção de projetos"
git push
```

## Explicando o código

- O `index.html` na raiz é a página aberta no endereço principal.
- `css/estilo.css` (sem barra inicial) é procurado a partir da página atual, então funciona dentro do subcaminho.
- Cada push na branch configurada dispara uma nova publicação.

## Erros comuns

- **Página sem estilo depois de publicar**: caminhos começando com `/` apontam para a raiz do domínio, fora do seu repositório. Use caminhos relativos.
- **Diferença de maiúsculas**: `Estilo.css` e `estilo.css` são arquivos diferentes no servidor.
- **Publicar segredos**: tudo no repositório público fica visível para qualquer pessoa.

## Resumo

- GitHub Pages publica sites estáticos de graça.
- Ative em Settings → Pages e use caminhos relativos.
- Cada push atualiza o site publicado.

## Próximo passo

Com o código versionado e publicado, siga para a trilha de **TypeScript** e depois **React**, para construir interfaces maiores com mais segurança.
