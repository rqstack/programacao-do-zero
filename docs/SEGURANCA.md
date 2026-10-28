# Auditoria de segurança — 28/10/2026

Feita com ferramentas gratuitas: Git, `npm audit`, testes do projeto (Vitest + Postgres embutido), consultas somente leitura ao banco de produção, API pública do Supabase e configurações do GitHub. Nenhum dado de produção foi alterado e nenhum valor de credencial foi impresso.

## A. Resumo

- **Nenhuma vulnerabilidade crítica ou alta encontrada.**
- Nenhuma credencial privada no repositório nem no histórico (62 commits, todos os ramos).
- Riscos médios: cadastro por e-mail ligado no Supabase sem uso no site; XP e conquistas dependem de correção no navegador (limitado pelo banco); webhook da Syncpay recusando avisos (token divergente).

## B. Segredos e arquivos

| Item | Situação |
| --- | --- |
| `.env.production` versionado | Tinha **só valores públicos** (URL do projeto e chave *publishable* do Supabase, que vão no site de qualquer forma). Mesmo assim deixou de ser versionado (`git rm --cached`; o arquivo local continua). |
| `.gitignore` | Agora ignora `.env` e `.env.*`, exceto `.env.example`. |
| `.env.example` | Só nomes e valores fictícios. |
| Histórico Git | Varredura por chave secreta do Supabase, JWT, chave privada, tokens do GitHub/Google/AWS, segredos da Syncpay/Judge0 e URLs de banco com senha: **nada real**. Só exemplos didáticos (`usuario:...@localhost`) nas aulas. |
| Site publicado | Sem sourcemaps; o JavaScript só contém a chave *publishable* (o texto `sb_secret_` que aparece é uma verificação interna da biblioteca supabase-js). |
| Banco privado da Batalha | Fora do Git e do build (`.gitignore`). |
| Credenciais a rotacionar | **Nenhuma por vazamento.** O token do webhook da Syncpay precisa ser reconfigurado por estar divergente (ver G). |

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
- Não há workflows do GitHub Actions (o deploy é feito pelo `npm run deploy`, local).
- Varredura de segredos e proteção de push do GitHub: **ligadas**.
- Ramo `main` sem proteção; alertas e atualizações de segurança do Dependabot desligados.

## G. Segunda rodada (28/10/2026, à noite)

Feito e verificado:
- **Dependabot**: alertas e atualizações de segurança **ligados** (conferido pela API); `.github/dependabot.yml` com atualização semanal do npm (menores agrupadas) e mensal das Actions. Nada é mesclado sozinho.
- **CI gratuito**: `.github/workflows/testes.yml` roda tipos, lint e testes em todo PR (inclusive do Dependabot) e em push na `main`; permissão só de leitura, sem segredos, ações oficiais fixadas por commit. Simulado sem o banco privado da Batalha (como no CI): tipos e testes passam.
- **Branch `main` protegida**: sem force push e sem exclusão; sem exigir PR (o seu fluxo de push direto continua). `gh-pages` fica livre de propósito (o deploy faz push forçado nela).
- **Actions**: só ações da própria GitHub; token dos workflows só leitura.
- **Webhook da Syncpay**: a autenticação recusa sem token, com token errado e com corpo falso de "pago" (401, nada muda nas doações). A causa do 401 dos avisos reais é o token salvo no Supabase não ser o que a Syncpay envia (ou estar vazio); os logs não mostram o cabeçalho, então só o painel resolve.
- **PIX_IP_SALT**: usado só no hash do IP (limite de 5 cobranças por hora). A presença não dá para ler de fora. O código novo (`support-pix`) usa um valor derivado de um segredo existente se ele faltar, e registra nos logs privados só "configurado: sim/não" de cada segredo. **Essa versão ainda não foi publicada** (aguarda sua autorização).

## H. Pendências que dependem de você (todas gratuitas)

1. **Autorizar a publicação da nova `support-pix`** (diagnóstico sim/não + salt derivado). Depois, os logs da função mostram se `SYNCPAY_WEBHOOK_TOKEN` e `PIX_IP_SALT` existem.
2. **Rotacionar o token do webhook da Syncpay**:
   1. Painel da Syncpay → Webhooks → o webhook "Recebimento - Cash in" que aponta para `.../functions/v1/support-pix?webhook=1` → copie o token (ou gere um novo).
   2. Supabase → Edge Functions → Secrets → `SYNCPAY_WEBHOOK_TOKEN` → cole o mesmo valor, sem espaços, e salve.
   3. Teste seguro (não mexe em nenhuma doação: o id não existe), no seu terminal, digitando o token quando pedir:
      ```bash
      read -rs -p "Token do webhook: " T; echo; curl -s -X POST "https://kaylnsleygeysszomudd.supabase.co/functions/v1/support-pix?webhook=1" -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{"id":"teste-rotacao-inexistente"}'; unset T
      ```
      Esperado: `{"ok":true,"message":"ignorado"}`. Se vier `não autorizado`, o valor salvo não é o mesmo.
3. **`PIX_IP_SALT`**: se não existir, crie em Supabase → Edge Functions → Secrets um valor aleatório longo (por exemplo, gerado com `openssl rand -hex 32`). Não precisa anotar.
4. **Supabase → Authentication → Providers → Email: desligar** (o site só usa Google).
5. **Supabase → Authentication → URL Configuration**: Site URL e Redirect URLs só com `https://rqstack.github.io/programacao-do-zero/**` e `http://localhost:3000/**`.
6. **Testes com duas contas**: seguir `docs/TESTE-DUAS-CONTAS.md`.

## I. Orçamento

Nenhuma compra, assinatura, upgrade ou recurso pago foi ativado. Tudo acima é gratuito.
