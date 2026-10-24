<!-- aula: como-um-site-vai-ao-ar -->
## Por que isso importa

Um projeto que só roda no seu computador não pode ser visto por um recrutador, um cliente ou um amigo. Publicar (fazer o **deploy**) é a etapa que transforma código em produto. Entender o que acontece nesse caminho ajuda a escolher a hospedagem certa e a resolver os problemas mais comuns: página em branco, link quebrado, "funciona aqui e não lá".

## Conceitos fundamentais

- **Build**: o processo que transforma seu código-fonte no que vai para o ar (junta arquivos, converte TypeScript em JavaScript, otimiza imagens). Comando comum: `npm run build`.
- **Site estático**: só arquivos prontos (HTML, CSS, JS, imagens). Qualquer servidor de arquivos entrega. Barato (muitas vezes gratuito) e rápido.
- **Aplicação com servidor**: precisa de um processo rodando (Node, Python...) para responder a cada requisição. Exige uma hospedagem que mantenha esse processo vivo.
- **Back-end como serviço** (Supabase, Firebase): o site estático conversa direto com um serviço pronto. Une o baixo custo do estático com dados e login.
- **Domínio e DNS**: o nome (`meusite.com.br`) aponta, via DNS, para o servidor da hospedagem. Você pode usar o endereço gratuito da hospedagem (`usuario.github.io`) ou registrar um domínio próprio (que tem custo anual).
- **HTTPS**: as hospedagens modernas emitem o certificado automaticamente. Nunca publique um formulário de login sem HTTPS.
- **Ambientes**: **desenvolvimento** (seu computador), **teste/staging** (uma cópia para conferir) e **produção** (o que as pessoas usam).

## Exemplo prático

O caminho de um projeto React/Vite até o ar, em um site estático:

```bash
npm run build        # gera a pasta dist/ com os arquivos finais
npx serve dist       # testa localmente o que vai para o ar, antes de publicar
```

Comparando opções para cada tipo de projeto:

```texto
Tipo de projeto                     Onde costuma ir (planos gratuitos, confira os limites atuais)
----------------------------------  -------------------------------------------------------------
HTML/CSS/JS, React, Vue (estático)  GitHub Pages, Netlify, Vercel, Cloudflare Pages
Estático + login e banco            Site estático + Supabase (ou Firebase)
API em Node/Express                 Render, Railway, Fly.io, Koyeb (planos e regras mudam com frequência)
Banco PostgreSQL                    Supabase, Neon
```

## Explicando o código

- `npm run build` gera os arquivos finais; é **esse** resultado que vai para o ar, não a pasta `src/`.
- `npx serve dist` sobe um servidor local só com os arquivos do build. Muitos problemas (caminhos errados, variável faltando) aparecem aqui antes de chegarem ao público.
- A tabela mostra que a primeira pergunta não é "qual empresa", e sim "meu projeto precisa de um processo rodando o tempo todo?". Se não precisa, ele é estático, e hospedar costuma ser gratuito.
- Os planos gratuitos mudam: antes de escolher, leia a página de preços (limites de uso, se o serviço "dorme" sem acesso, se exige cartão).

## Erros comuns

- **Publicar sem testar o build localmente**.
- **Achar que o servidor de desenvolvimento (`npm run dev`) é o que vai para o ar**.
- **Escolher uma hospedagem de servidor para um site que é estático**, pagando ou lidando com limites à toa.
- **Cadastrar cartão num plano "gratuito" sem ler as regras** de cobrança por excesso.

## Resumo

- Build gera os arquivos finais; teste-os antes de publicar.
- Estático é simples e barato; servidor exige processo rodando; BaaS une os dois mundos.
- DNS liga o domínio ao servidor; HTTPS é obrigatório.

## Próximo passo

Na próxima aula você vai publicar um site estático no **GitHub Pages**, de graça.

<!-- aula: sites-estaticos-e-github-pages -->
## Por que isso importa

O GitHub Pages hospeda sites estáticos de graça direto do seu repositório público, com HTTPS. É o caminho mais simples para colocar um portfólio ou projeto no ar e ter um link para o currículo. Este próprio site, a Programação do Zero, é publicado assim.

## Conceitos fundamentais

- **Endereços**: um repositório chamado `usuario.github.io` vira `https://usuario.github.io/`; qualquer outro repositório vira `https://usuario.github.io/nome-do-repo/`.
- **Fonte da publicação** (Settings → Pages):
  - **Uma branch** (por exemplo `gh-pages` ou a pasta `/docs` da `main`), com os arquivos já prontos; ou
  - **GitHub Actions**, que roda o build e publica a cada push.
- **Subcaminho (base path)**: num projeto em `/nome-do-repo/`, links como `/imagem.png` apontam para a raiz errada. Ferramentas como Vite (`base`) e Next.js (`basePath`) precisam saber o subcaminho.
- **Arquivo `.nojekyll`**: desliga o processamento Jekyll do GitHub, que esconderia pastas começando com `_` (como `_next/`).
- **Rotas em apps de página única (SPA)**: o Pages não conhece suas rotas. Ao recarregar `/sobre`, ele procura um arquivo `sobre/index.html`. Gere uma página por rota (exportação estática) ou use roteamento por hash.
- **Limites**: o GitHub documenta limites de tamanho do site e de banda. Para projetos pessoais costuma sobrar, mas o Pages não é feito para lojas ou serviços comerciais grandes.

## Exemplo prático

Publicando um projeto Vite no subcaminho `/meu-portfolio/`:

```js
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/meu-portfolio/", // nome do repositório
});
```

```bash
npm run build
touch dist/.nojekyll
npx gh-pages -d dist --dotfiles   # envia a pasta dist para a branch gh-pages
```

Depois, em **Settings → Pages**, escolha a branch `gh-pages` e a pasta `/ (root)`. Em um ou dois minutos, o site aparece em `https://usuario.github.io/meu-portfolio/`.

## Explicando o código

- `base: "/meu-portfolio/"` faz o Vite gerar os caminhos dos arquivos com o subcaminho certo; sem isso, a página carrega em branco porque não acha o JavaScript.
- `.nojekyll` evita que o GitHub esconda pastas começando com `_`.
- O pacote `gh-pages` publica o conteúdo de `dist/` numa branch separada; `--dotfiles` inclui o `.nojekyll`.
- A alternativa é um workflow do GitHub Actions que faz o build e publica automaticamente a cada push (você verá CI/CD daqui a duas aulas).

## Erros comuns

- **Página em branco** com erros 404 para `.js` e `.css` no console: falta configurar o `base`/`basePath`.
- **Recarregar uma rota dá 404**: o Pages procura um arquivo para aquela rota.
- **Repositório privado** num plano gratuito: confira se o seu plano permite Pages em repositórios privados.
- **Publicar a pasta errada** (`src/` em vez de `dist/`).

## Resumo

- GitHub Pages hospeda sites estáticos de graça com HTTPS.
- Configure o subcaminho, inclua `.nojekyll` e publique a pasta do build.
- Rotas precisam existir como arquivos (ou usar hash).

## Próximo passo

Sites de verdade dependem de configurações diferentes em cada ambiente. A próxima aula mostra **variáveis de ambiente** e como proteger segredos.

<!-- aula: variaveis-de-ambiente-e-segredos -->
## Por que isso importa

Endereço da API, chave do banco, token de pagamento: esses valores mudam entre desenvolvimento e produção, e alguns são **secretos**. Colocá-los no código é o erro de segurança mais comum em projetos de iniciantes. Robôs varrem o GitHub o tempo todo atrás de chaves vazadas, e uma chave de serviço pago exposta pode gerar cobranças.

## Conceitos fundamentais

- **Variável de ambiente**: um valor que o programa lê do ambiente onde roda, não do código (`process.env.NOME` no Node, `Deno.env.get("NOME")` no Deno).
- **Arquivo `.env`**: guarda as variáveis no seu computador. Fica **fora do Git** (`.gitignore`). Publique um **`.env.example`** com os nomes e valores de exemplo.
- **Públicas × secretas**:
  - Variáveis que vão para o **navegador** (prefixos `NEXT_PUBLIC_`, `VITE_`) **não são segredo**: qualquer pessoa vê no código do site. Só coloque ali o que pode ser público (URL da API, chave publishable do Supabase).
  - **Segredos** (senha do banco, chave secreta de API, token de webhook) ficam só no servidor: nos *secrets* da hospedagem, das Edge Functions ou do GitHub Actions.
- **Valide as variáveis na inicialização**: se faltar uma obrigatória, o programa deve parar com uma mensagem clara, e não quebrar no meio de uma requisição.
- **Vazou?** Trocar (rotacionar) a chave imediatamente é o único remédio. Apagar o commit não basta: o histórico e as cópias continuam existindo.

## Exemplo prático

```texto
# .env.example  (vai para o Git, sem valores reais)
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/app
JWT_SEGREDO=troque-por-um-texto-aleatorio-com-mais-de-32-caracteres
ORIGENS_PERMITIDAS=http://localhost:5173
```

```texto
# .gitignore
.env
.env.local
.env.*.local
```

Lendo e validando no início da aplicação Node:

```js
// config.js
function obrigatoria(nome) {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Veja o .env.example.`);
  }
  return valor;
}

export const config = {
  porta: Number(process.env.PORT ?? 3000),
  bancoUrl: obrigatoria("DATABASE_URL"),
  jwtSegredo: obrigatoria("JWT_SEGREDO"),
  origens: (process.env.ORIGENS_PERMITIDAS ?? "").split(",").filter(Boolean),
};

if (config.jwtSegredo.length < 32) {
  throw new Error("JWT_SEGREDO precisa ter pelo menos 32 caracteres.");
}
```

```bash
node --env-file=.env server.js   # o Node lê o .env sem instalar nada
```

## Explicando o código

- O `.env.example` documenta **quais** variáveis existem sem expor valores; quem clona o projeto copia para `.env` e preenche.
- O `.gitignore` impede que o `.env` real vá para o repositório. Faça isso **antes** do primeiro commit.
- `obrigatoria` falha cedo e com uma mensagem útil se algo estiver faltando.
- A checagem do tamanho do segredo evita que alguém publique com um valor fraco de teste.
- `--env-file` (Node 20.6+) carrega o arquivo; em produção, as variáveis vêm do painel da hospedagem.

## Erros comuns

- **Commitar o `.env`**. Se aconteceu, troque as chaves.
- **Colocar segredo em variável `NEXT_PUBLIC_`/`VITE_`**: ele vai parar no navegador.
- **Logar o valor dos segredos** (`console.log(process.env)`).
- **Usar a mesma chave em desenvolvimento e produção**.

## Resumo

- Configuração em variáveis de ambiente; `.env` fora do Git, `.env.example` documentando.
- Prefixos públicos vão para o navegador: nunca coloque segredos ali.
- Valide na inicialização e rotacione qualquer chave vazada.

## Próximo passo

Com as variáveis organizadas, vamos publicar o que precisa de servidor: **APIs e bancos de dados**.

<!-- aula: hospedando-apis-e-bancos -->
## Por que isso importa

Uma API em Node precisa de um processo rodando e de um banco de dados acessível. As opções gratuitas existem, mas cada uma tem regras: algumas "dormem" sem acesso, outras limitam horas de uso, outras pedem cartão. Saber ler essas regras evita surpresas (inclusive cobranças) e ajuda a explicar escolhas técnicas em entrevistas.

## Conceitos fundamentais

- **Plataformas de aplicação (PaaS)** como Render, Railway, Fly.io e Koyeb: você conecta o repositório, define o comando de início e as variáveis, e elas cuidam do servidor.
- **O que configurar**:
  - **Build command** (`npm ci && npm run build`, se houver build).
  - **Start command** (`npm start`).
  - **Porta**: use `process.env.PORT`.
  - **Variáveis de ambiente** e segredos.
  - **Health check**: uma rota como `GET /saude` que responde 200.
- **Bancos gerenciados**: Supabase e Neon oferecem PostgreSQL com plano gratuito. A string de conexão é um **segredo**.
- **Pontos de atenção em planos gratuitos** (leia sempre a página de preços atual):
  - o serviço pode **hibernar** sem acesso e demorar na primeira requisição;
  - pode haver limite de horas, memória, armazenamento ou tráfego;
  - alguns exigem **cartão** mesmo no plano gratuito; ative alertas de cobrança quando houver;
  - projetos inativos podem ser pausados.
- **Migrações**: rode as mudanças de esquema do banco de forma versionada (arquivos SQL ou ferramentas como Prisma Migrate), nunca à mão em produção.

## Exemplo prático

Uma API preparada para a hospedagem:

```js
// server.js
import express from "express";

const app = express();
app.use(express.json());

// Rota de saúde para a hospedagem saber se a API está viva
app.get("/saude", (req, res) => res.json({ ok: true, horario: new Date().toISOString() }));

app.get("/api/mensagem", (req, res) => res.json({ texto: "Olá do servidor!" }));

const porta = Number(process.env.PORT ?? 3000);
app.listen(porta, "0.0.0.0", () => console.log(`API ouvindo na porta ${porta}`));
```

Checklist de publicação:

```texto
[ ] package.json com "start": "node server.js" e a versão do Node em "engines"
[ ] PORT lida de process.env, servidor ouvindo em 0.0.0.0
[ ] Variáveis e segredos cadastrados no painel (nunca no repositório)
[ ] Rota /saude configurada como health check
[ ] CORS liberando só o domínio do front-end publicado
[ ] Banco com migrações aplicadas e string de conexão como segredo
[ ] Página de preços lida: hiberna? limites? exige cartão? alerta de cobrança ativo?
```

## Explicando o código

- `/saude` responde rápido sem acessar nada pesado: a plataforma usa para saber se a aplicação subiu e para reiniciá-la se travar.
- `process.env.PORT` é obrigatório na maioria das plataformas, que escolhem a porta.
- Ouvir em `"0.0.0.0"` aceita conexões de fora do contêiner; `localhost` funcionaria só dentro dele.
- O checklist resume o que costuma dar errado na primeira publicação, incluindo a parte de custos.

## Erros comuns

- **Porta fixa no código**: a plataforma não consegue rotear as requisições.
- **Esquecer de cadastrar as variáveis** no painel: a API sobe e quebra.
- **CORS liberado para `*`** em uma API com login.
- **Não ler as regras do plano gratuito** e ser surpreendido por hibernação ou cobrança.

## Resumo

- PaaS para APIs: build, start, porta, variáveis e health check.
- Banco gerenciado com string de conexão secreta e migrações versionadas.
- Leia os limites do plano gratuito e ative alertas de cobrança quando houver.

## Próximo passo

Publicar à mão toda vez cansa e dá margem a erro. A próxima aula automatiza tudo com **CI/CD no GitHub Actions**.

<!-- aula: ci-cd-com-github-actions -->
## Por que isso importa

**CI** (integração contínua) roda testes e verificações a cada mudança; **CD** (entrega contínua) publica automaticamente o que passou. Com isso, publicar vira um `git push`, e nada quebrado chega à produção sem que alguém perceba. O GitHub Actions faz isso direto no repositório, com uma cota gratuita que atende bem projetos pessoais.

## Conceitos fundamentais

- **Workflow**: um arquivo YAML em `.github/workflows/` que diz **quando** rodar (`on: push`, `pull_request`) e **o que** rodar (jobs e steps).
- **Job**: um conjunto de passos numa máquina virtual (`runs-on: ubuntu-latest`). Jobs podem depender de outros (`needs`).
- **Actions prontas**: `actions/checkout` (baixa o código), `actions/setup-node` (instala o Node com cache), `actions/upload-pages-artifact` e `actions/deploy-pages` (publicam no GitHub Pages).
- **Secrets do repositório** (Settings → Secrets and variables → Actions): valores secretos usados no workflow com `${{ secrets.NOME }}`. Não aparecem nos logs.
- **Permissões**: declare só as necessárias (`permissions:`). Para publicar no Pages: `pages: write` e `id-token: write`.
- **Proteção da branch principal**: exija que o CI passe antes de juntar um pull request.

## Exemplo prático

Um workflow que testa todo push e pull request e publica no GitHub Pages quando a `main` passa nos testes:

```texto
# .github/workflows/deploy.yml
name: Testar e publicar
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}
      - uses: actions/upload-pages-artifact@v3
        if: github.ref == 'refs/heads/main'
        with:
          path: dist

  publicar:
    needs: verificar
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

## Explicando o código

- `on` dispara em push na `main` e em qualquer pull request.
- O job `verificar` instala as dependências exatas (`npm ci`), roda lint, testes e build. Se algo falhar, para ali e o PR fica marcado.
- `vars.VITE_API_URL` vem das **variables** do repositório (valores não secretos); segredos usariam `secrets.NOME`.
- O artefato do site só é enviado quando a branch é a `main`.
- O job `publicar` depende do primeiro (`needs`), só roda na `main` e tem apenas as permissões necessárias para publicar no Pages.
- Para usar este fluxo, a fonte do Pages (Settings → Pages) deve ser **GitHub Actions**.

## Erros comuns

- **Segredo escrito no YAML** em vez de `secrets.NOME`.
- **Permissões amplas demais** (`write-all`).
- **Publicar sem rodar os testes antes** (`needs` ausente).
- **Ignorar o CI vermelho** e juntar o PR assim mesmo.

## Resumo

- Workflows em `.github/workflows/` rodam a cada push e PR.
- Teste e build primeiro; publique só se tudo passar e só da `main`.
- Segredos em `secrets`, permissões mínimas, branch principal protegida.

## Próximo passo

Publicado não significa terminado. A última aula mostra como **monitorar**, controlar **custos** e **voltar atrás** quando algo der errado.

<!-- aula: monitoramento-custos-e-rollback -->
## Por que isso importa

Depois do deploy, você precisa saber se o site está no ar, se há erros acontecendo com usuários e se algum serviço está perto de um limite (ou de gerar cobrança). E quando uma publicação dá errado, precisa conseguir voltar à versão anterior em minutos, sem perder dados.

## Conceitos fundamentais

- **Logs**: as hospedagens e o Supabase mostram os registros da aplicação. Registre eventos úteis (erros, falhas de login), **nunca** senhas ou tokens.
- **Monitoramento de disponibilidade (uptime)**: serviços com plano gratuito acessam sua rota `/saude` de tempos em tempos e avisam por e-mail se ela parar de responder.
- **Erros no navegador**: o console dos usuários você não vê; ferramentas de rastreamento de erros (algumas com plano gratuito) coletam essas falhas. Avalie privacidade e limites antes de usar.
- **Custos e limites**:
  - liste cada serviço usado e o limite gratuito dele (banco, armazenamento, chamadas, banda);
  - ative **alertas de cobrança** onde existirem;
  - não cadastre cartão sem necessidade; se cadastrar, entenda como funciona a cobrança por excesso;
  - cuidado com tarefas automáticas que geram dados sem parar (logs, históricos) e enchem o armazenamento.
- **Rollback** (voltar atrás):
  - no código: `git revert` do commit problemático e publicar de novo; muitas plataformas permitem reativar o deploy anterior com um clique;
  - no banco: migrações **aditivas** (adicionar colunas antes de remover as antigas) e backup antes de mudanças arriscadas, porque desfazer dados é muito mais difícil que desfazer código.

## Exemplo prático

Voltando uma publicação com problema, sem reescrever o histórico:

```bash
git log --oneline -5            # ache o commit que introduziu o problema
git revert a1b2c3d              # cria um commit novo que desfaz aquela mudança
git push                        # o CI testa e publica a versão corrigida
```

Uma planilha simples de custos e limites para manter no repositório:

```texto
Serviço          Para quê                 Plano     Limite que importa                 Alerta
---------------  -----------------------  --------  ---------------------------------  ---------------------
GitHub Pages     site estático            grátis    tamanho do site e banda mensal     —
Supabase         banco, login, funções    Free      tamanho do banco, pausa por inativ. e-mail do Supabase
Uptime (ex.)     verificar /saude         grátis    intervalo mínimo entre checagens   e-mail quando cair
Hospedagem API   Node/Express             grátis    hibernação, horas ou memória       alerta de cobrança ON
```

## Explicando o código

- `git revert` desfaz uma mudança criando um commit **novo**: o histórico continua íntegro e o CI publica normalmente. É mais seguro que `git reset` em uma branch compartilhada.
- A planilha força você a responder, para cada serviço, "qual limite pode me afetar e como vou saber". Revise sempre que adicionar um serviço novo.
- Para o banco, a estratégia é diferente: faça backup antes e prefira mudanças que não destroem dados, porque um `DROP COLUMN` não se desfaz com `git revert`.

## Erros comuns

- **Só descobrir que o site caiu quando alguém avisa**.
- **Logar dados pessoais ou segredos**.
- **Migração destrutiva sem backup**.
- **Esquecer serviços esquecidos rodando** (e consumindo cota ou dinheiro).

## Resumo

- Logs úteis e sem dados sensíveis; monitor de uptime na rota de saúde.
- Conheça os limites de cada serviço e ative alertas de cobrança.
- Rollback de código com `git revert`; no banco, backup e migrações aditivas.

## Próximo passo

Você completou a trilha de deploy. Publique um dos **projetos de portfólio** com CI, variáveis bem configuradas e o checklist de custos no README.
