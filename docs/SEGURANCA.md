# Auditoria de segurança — 28/10/2026

Feita com ferramentas gratuitas: Git, `npm audit`, testes do projeto (Vitest + Postgres embutido), consultas somente leitura ao banco de produção, API pública do Supabase e configurações do GitHub. Nenhum dado de produção foi alterado e nenhum valor de credencial foi impresso.

## A. Resumo

- **Nenhuma vulnerabilidade crítica ou alta encontrada.**
- Nenhuma credencial privada no repositório nem no histórico (62 commits, todos os ramos).
- Riscos médios: cadastro por e-mail ligado no Supabase sem uso no site; XP e conquistas dependem de correção no navegador (limitado pelo banco); webhook da Syncpay recusando avisos (segredo `SYNCPAY_WEBHOOK_TOKEN` ausente no Supabase).

## B. Segredos e arquivos

| Item | Situação |
| --- | --- |
| `.env.production` versionado | Tinha **só valores públicos** (URL do projeto e chave *publishable* do Supabase, que vão no site de qualquer forma). Mesmo assim deixou de ser versionado (`git rm --cached`; o arquivo local continua). |
| `.gitignore` | Agora ignora `.env` e `.env.*`, exceto `.env.example`. |
| `.env.example` | Só nomes e valores fictícios. |
| Histórico Git | Varredura por chave secreta do Supabase, JWT, chave privada, tokens do GitHub/Google/AWS, segredos da Syncpay/Judge0 e URLs de banco com senha: **nada real**. Só exemplos didáticos (`usuario:...@localhost`) nas aulas. |
| Site publicado | Sem sourcemaps; o JavaScript só contém a chave *publishable* (o texto `sb_secret_` que aparece é uma verificação interna da biblioteca supabase-js). |
| Banco privado da Batalha | Fora do Git e do build (`.gitignore`). |
| Credenciais a rotacionar | **Nenhuma por vazamento.** O token do webhook da Syncpay precisa ser cadastrado no Supabase, pois está ausente (ver G). |

Teste permanente: `tests/unit/repo-hygiene.test.ts` falha se algum `.env` (além do exemplo) voltar ao Git ou se algum arquivo versionado tiver padrão de credencial.

## C. Supabase

- **RLS ligada em todas as tabelas** (também conferido pelo `tests/db/security-audit.test.ts`).
- Acesso direto pela API REST como visitante: `profiles`, `user_progress`, `xp_events`, `feedback`, `battle_*`, `support_donations`, `follows` → **401 (permissão negada)** em produção.
- Escrita direta: só `user_progress` (cada pessoa a própria linha, por RLS) e colunas liberadas do próprio perfil. O resto passa por 28 funções `SECURITY DEFINER`, todas com `search_path` fixo e checando o login.
- Visitantes chamam só 13 funções de leitura pública ou com limite (lista fechada no teste de auditoria).
- Sem views, sem buckets de armazenamento. Triggers: só `updated_at` e criação de perfil no cadastro.
- Testes (Postgres real embutido, 105 passando): perfil privado de outra pessoa, progresso de outra conta, partidas sem convite, alterar resultado sem participar, relatos de terceiros, portfólio alheio, chaves de XP inventadas e repetidas.

## D. Aplicação

- **Login**: provedor Google habilitado (o erro antigo "provider is not enabled" não se repete). Provedor de e-mail também está habilitado, sem uso no site.
- **Edge Functions** (`verify_jwt` desligado de propósito, cada uma valida por conta própria):
  - `battle-submit`: confere o token do usuário no servidor, valida o formato da partida; o banco valida prazo, tamanho e ritmo antes de chamar o Judge0 (sandbox isolado).
  - `support-pix`: pagamento só é confirmado consultando a Syncpay no servidor, com conferência do valor; token do webhook comparado em tempo constante; limite por IP (hash).
- **Jogos e recompensas**: XP só para chaves cadastradas, uma vez cada, com teto de 400 XP/10 min e 1.200/dia. Limitação conhecida: a correção de quizzes e exercícios acontece no navegador (o conteúdo é público), então quem souber chamar a API pode pedir XP sem resolver, dentro desses tetos.
- **Batalha**: vencedor decidido no banco a partir do veredito do servidor; partidas amistosas não mexem em troféus. Risco: duas contas da mesma pessoa podem se enfrentar na fila ranqueada.
- **XSS**: textos de usuários são escapados pelo React; o único HTML injetado é o realce de código (biblioteca que escapa o conteúdo). Links de perfil e de projeto só aceitam `https://`.
- **Dependências**: `npm audit` sem nenhuma vulnerabilidade; sem scripts de instalação no `package.json`.

## E. Hospedagem e GitHub

- GitHub Pages serve só arquivos estáticos: não permite cabeçalhos de segurança (CSP, HSTS próprios, X-Frame-Options). As proteções reais ficam no Supabase.
- Situação em 28/10 (antes da segunda rodada): sem workflows, `main` sem proteção e Dependabot desligado. **Tudo isso foi resolvido na seção G** e reconferido na seção J.
- O deploy continua local (`npm run deploy`); o único workflow é o de testes.
- Varredura de segredos e proteção de push do GitHub: **ligadas**.

## G. Segunda rodada (28/10/2026, à noite)

Feito e verificado:
- **Dependabot**: alertas e atualizações de segurança **ligados** (conferido pela API); `.github/dependabot.yml` com atualização semanal do npm (menores agrupadas) e mensal das Actions. Nada é mesclado sozinho.
- **CI gratuito**: `.github/workflows/testes.yml` roda tipos, lint e testes em todo PR (inclusive do Dependabot) e em push na `main`; permissão só de leitura, sem segredos, ações oficiais fixadas por commit. Simulado sem o banco privado da Batalha (como no CI): tipos e testes passam.
- **Branch `main` protegida**: sem force push e sem exclusão; sem exigir PR (o seu fluxo de push direto continua). `gh-pages` fica livre de propósito (o deploy faz push forçado nela).
- **Actions**: só ações da própria GitHub; token dos workflows só leitura.
- **`support-pix` v4 publicada em 29/10/2026** (com autorização): registra nos logs privados só "configurado: sim/não" de cada segredo e, sem `PIX_IP_SALT`, usa um valor derivado de um segredo existente (nunca um padrão público). Depois da publicação: GET responde `enabled: true`; sem token, com token errado e com corpo falso de "pago" → 401.
- **Webhook da Syncpay — causa confirmada**: os logs da v4 mostram `webhook_token_configurado: false`. O segredo `SYNCPAY_WEBHOOK_TOKEN` **não existe (ou está vazio)** no Supabase, então todo aviso real é recusado com 401. Os pagamentos continuam seguros: a confirmação só acontece consultando a Syncpay no servidor (a tela de doação faz isso sozinha), o webhook só acelera.
- **PIX_IP_SALT**: `ip_salt_configurado: true` (já existe; nada a fazer).

## H. Pendências que dependem de você (todas gratuitas)

1. ~~Autorizar a publicação da nova `support-pix`~~ — feito em 29/10/2026.
2. **Cadastrar o token do webhook da Syncpay** (está ausente no Supabase):
   1. Painel da Syncpay → Webhooks → o webhook "Recebimento - Cash in" que aponta para `.../functions/v1/support-pix?webhook=1` → copie o token (ou gere um novo).
   2. Supabase → Edge Functions → Secrets → `SYNCPAY_WEBHOOK_TOKEN` → cole o mesmo valor, sem espaços, e salve.
   3. Teste seguro (não mexe em nenhuma doação: o id não existe), no seu terminal, digitando o token quando pedir:
      ```bash
      read -rs -p "Token do webhook: " T; echo; curl -s -X POST "https://kaylnsleygeysszomudd.supabase.co/functions/v1/support-pix?webhook=1" -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{"id":"teste-rotacao-inexistente"}'; unset T
      ```
      Esperado: `{"ok":true,"message":"ignorado"}`. Se vier `não autorizado`, o valor salvo não é o mesmo.
3. ~~`PIX_IP_SALT`~~ — já configurado (conferido pelos logs da v4).
4. **Supabase → Authentication → Providers → Email: desligar** (o site só usa Google).
5. **Supabase → Authentication → URL Configuration**: Site URL e Redirect URLs só com `https://rqstack.github.io/programacao-do-zero/**` e `http://localhost:3000/**`.
6. **Testes com duas contas**: seguir `docs/TESTE-DUAS-CONTAS.md`.

## I. Orçamento

Nenhuma compra, assinatura, upgrade ou recurso pago foi ativado. Tudo acima é gratuito.

## J. Auditoria final (30/10/2026)

Escopo: código do site, Edge Functions (`support-pix`, `battle-submit`), RLS e funções do banco, autenticação, configuração, workflows e o site publicado. Tudo gratuito. Nenhum pagamento real, nenhum valor de segredo lido ou impresso, nenhum dado de produção alterado (as 2 doações de produção continuam como estavam: `aguardando`, última consulta em 28/10).

### J.1 Problemas encontrados e corrigidos (no código; ver J.4 sobre publicação)

| # | Gravidade | Problema | Correção | Teste que prova |
|---|---|---|---|---|
| 1 | Média | **Corrida no Pix**: uma consulta com leitura antiga (rede falhando ou atalho de 4 s) gravava `expirado` por cima de uma doação **já confirmada** em paralelo; um aviso atrasado de falha também podia sobrescrever. | Mudança de status agora é condicional e atômica no banco (`update ... where status in (...)`); se outra consulta mudou antes, vale o que está no banco. | `pix-resilience.test.ts` › "corrida entre consultas paralelas" (3 testes; falham no código antigo) |
| 2 | Média | **Sem tempo limite** nas chamadas à Syncpay: uma Syncpay travada prendia a função até o limite da plataforma. | `AbortSignal.timeout(10 s)` em toda chamada; falha vira 502 claro, sem gravar nada. | "Syncpay travada…" (no código antigo o teste trava 60 s e falha) |
| 3 | Média | **Limite por IP contornável**: o hash usa o primeiro valor de `x-forwarded-for`, que pode vir do cliente; trocando o cabeçalho, dava para gerar cobranças sem limite. | Teto geral de **60 cobranças/hora** somando todo mundo, além do limite de 5/hora por IP. | "teto geral de 60 cobranças por hora, mesmo trocando o IP" |
| 4 | Baixa | Token da Syncpay recusado (401) ficava guardado até expirar: as consultas falhavam por até 1 h. | 401 descarta o token guardado; a próxima chamada pede outro. | "token da Syncpay recusado (401)…" |
| 5 | Baixa | Valor da transação vindo como texto (`"10.00"`) travava a confirmação para sempre. | Aceita número ou texto numérico estrito; qualquer outra coisa continua sem confirmar. | "valor como texto numérico…" |
| 6 | Baixa | Erro do banco dentro do webhook não era tratado (resposta genérica da plataforma). | `try/catch`: 500 sem detalhes, nada muda. | "webhook com o banco fora…" |
| 7 | Média (estabilidade) | **Tela de doação parava de acompanhar** o pagamento depois de uma única falha de rede (o temporizador não era reagendado). | Continua tentando, espaçando 5 → 10 → 20 → 30 s. | "depois de falhas continua consultando…" (`pollDelay`) |
| 8 | Baixa (estabilidade) | Chamada ao Judge0 (Batalha) sem tempo limite. | 30 s; se estourar, vira "erro técnico" (não conta como erro do jogador). | "a chamada ao Judge0 tem tempo limite…" |
| 9 | Baixa | **Erro React #418 no console do `/ranking/`** em produção: o "a liga recomeça em N dias" era calculado no build (28/10) e diferia no navegador. | Calculado só no navegador, após carregar. | Conferido no build local: HTML estático sem número, página mostra "3 dias", console sem o erro |
| 10 | Baixa | **404 no console a cada link visível** (todas as páginas): o export do Next 16 grava `__next.x/__PAGE__.txt`, o navegador pede `__next.x.__PAGE__.txt`. O pré-carregamento não funcionava (as páginas abriam, mas recarregando tudo). | `scripts/fix-export-prefetch.mjs` roda depois do `npm run build` e cria a cópia com o nome esperado (só adiciona arquivos em `out/`). | `export-prefetch.test.ts`; no build local: 0 de 15 pedidos com 404 (antes, todos), navegação sem recarregar, inclusive em aulas |

Também: removida uma diretiva `eslint-disable` sem uso (lint agora sem avisos).

### J.2 Verificado e sem problema (com evidência)

- **Doação sem pagamento confirmado é impossível pelo site ou pela API**: em produção, como visitante, `INSERT` de uma doação "confirmado" → 401; `PATCH` mudando status → 401; leitura → 401. Só a Edge Function (service_role) escreve, e ela só confirma depois de consultar a Syncpay no servidor com o valor batendo. Corpo do webhook nunca confirma nada (testes "não confia no corpo" e "pix_code certo com pagamento pendente não confirma").
- **Idempotência**: mesma chave → mesma cobrança, uma única chamada à Syncpay; webhook repetido não muda a data de confirmação; chave única no banco.
- **Valores**: validados no servidor (mínimo R$ 5, até 2 casas, recusa negativos, `1e3`, `NaN`, objetos, texto com SQL).
- **Webhook**: em produção, sem token, com token errado e com corpo falso de "pago" → 401 (30/10). Comparação em tempo constante.
- **Banco fora do ar**: antes de cobrar, falha sem criar cobrança; depois de cobrar, **não devolve o Copia e Cola** (ninguém paga uma cobrança sem registro). Testes em `pix-resilience.test.ts`.
- **CORS**: origem desconhecida recebe `https://rqstack.github.io` (o navegador bloqueia). Conferido em produção e no build local (porta 4321 bloqueada).
- **Banco**: 18 tabelas, 0 sem RLS; 0 funções `SECURITY DEFINER` sem `search_path`; 13 funções para visitantes (lista fechada no teste de auditoria); só `user_progress` aceita escrita direta; 0 buckets. Os avisos do Supabase Advisor ("RLS sem policy", "definer executável") são o desenho do projeto: tabelas sem policy = ninguém acessa direto; funções definer checam o login por dentro (testado em `tests/db`).
- **`battle-submit`**: confere o token no servidor (`auth.getUser`), valida `match_id`; o banco valida partida, prazo e limites; envio travado em "julgando" é encerrado pelo banco após o prazo de tolerância.
- **GitHub (30/10)**: `main` sem force push e sem exclusão; Actions só da GitHub; token dos workflows só leitura e sem aprovar PR; varredura de segredos e proteção de push ligadas; 0 alertas abertos do Dependabot e da varredura de segredos; último CI verde.
- **Workflow de testes**: `pull_request` (não `pull_request_target`), permissão só leitura, ações fixadas por commit, `persist-credentials: false`, sem segredos.
- **Dependências**: `npm audit` → 0 vulnerabilidades.
- **Build**: sem sourcemaps; JavaScript sem chave secreta nem nomes de segredos (as menções a `service_role` no HTML são o texto das aulas de Supabase).
- **Site publicado**: todas as rotas reais respondem 200; login com Google presente; `/apoiar/` carrega o formulário (função ativa). O site publicado corresponde ao código antes desta auditoria (nenhuma mudança no site depois do último deploy de 28/10).

### J.3 Testes executados (30/10/2026)

| Comando | Resultado |
|---|---|
| `npm test` | **342 passaram, 5 pulados** (33 arquivos; eram 326). 16 testes novos: 14 em `tests/unit/pix-resilience.test.ts`, 2 em `tests/unit/export-prefetch.test.ts`. Os 5 pulados dependem do banco privado da Batalha. |
| Testes novos contra o código antigo | 7 falham (corrida, tempo limite, teto geral, token 401, valor em texto) — prova de que exercitam o problema, não só o resultado esperado. |
| `npm run typecheck` / `npm run lint` | sem erros / sem avisos |
| `npm run build` (base `/programacao-do-zero`) | ok; pré-carregamento: 403 arquivos criados; varredura de segredos no `out/` limpa |
| Produção (somente leitura e escritas recusadas) | ver J.2 |

### J.4 Publicação: aguardando sua revisão

Nada desta auditoria foi publicado. Pendentes de autorização:
1. **`support-pix` v5** (correções 1–6). Diferença para a v4 publicada conferida linha a linha: só as correções acima, sem segredos no pacote.
2. **`battle-submit`** (correção 8). Precisa do banco privado no pacote, como nas publicações anteriores.
3. **Site** (correções 7, 9 e 10) via `npm run deploy`.

### J.5 Pendências que dependem de você (painéis, gratuitas)

1. **`SYNCPAY_WEBHOOK_TOKEN` continua AUSENTE no Supabase** (logs da v4: `webhook_token_configurado: false`). Sem ele, todo aviso da Syncpay é recusado com 401. Passo a passo e teste seguro na seção H, item 2. Enquanto isso, doações só são confirmadas quando a tela de quem pagou está aberta consultando.
2. **Desligar o provedor Email** (Supabase → Authentication → Providers). Também elimina o aviso do Advisor "Leaked Password Protection" (só vale para senha).
3. **Conferir Authentication → URL Configuration** (seção H, item 5).
4. **Teste com duas contas**: `docs/TESTE-DUAS-CONTAS.md`.

### J.6 Riscos que não puderam ser verificados

- **Formato real do webhook e da consulta da Syncpay**: sem token configurado, nenhum aviso real foi aceito até hoje; o código segue a documentação e aceita `id`/`pix_code` na raiz ou em `data`. Confirmar com o primeiro Pix real depois de cadastrar o token (os logs mostram se veio "processado").
- **As 2 doações de produção em `aguardando`** (de 28/10): não foram consultadas, porque a consulta altera a linha (proibido nesta auditoria). Se alguma foi paga, a próxima consulta ou aviso a confirma (o código confirma mesmo depois da expiração local).
- **Como o Supabase monta `x-forwarded-for`**: não dá para saber de fora se o primeiro valor é o do cliente; por isso o teto geral (correção 3).
- **Prazo de expiração da cobrança na Syncpay**: não documentado; o site considera 30 min.
- **Configurações de Auth no painel do Supabase** (provedores, URLs, limites de envio): a API disponível aqui não lê essas telas.
- **Cabeçalhos de segurança (CSP, X-Frame-Options)**: o GitHub Pages não permite configurar; HSTS é do próprio GitHub.
