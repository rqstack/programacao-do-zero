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

## G. Pendências que dependem de você (todas gratuitas)

1. **Supabase → Authentication → Sign In / Providers → Email: desligar.** O site só usa Google; com e-mail ligado, dá para criar contas descartáveis pela API (farmar XP dentro dos limites, partidas ranqueadas contra si mesmo).
2. **Syncpay → webhook**: gerar um token novo no painel da Syncpay e salvar o mesmo valor em Supabase → Edge Functions → Secrets → `SYNCPAY_WEBHOOK_TOKEN`. Hoje os avisos chegam e são recusados (401); o pagamento ainda pode ser confirmado pela consulta da página, mas o aviso automático não funciona.
3. **Supabase → Edge Functions → Secrets → `PIX_IP_SALT`**: conferir se existe; se não, criar um valor aleatório (sem ele, o hash do IP usa um valor padrão público).
4. **Supabase → Authentication → URL Configuration**: conferir se o Site URL e as Redirect URLs aceitam só `https://rqstack.github.io/programacao-do-zero/**` e `http://localhost:3000/**`.
5. **GitHub → Settings → Code security**: ligar *Dependabot alerts* e *Dependabot security updates*.
6. **GitHub → Settings → Branches**: proteger o `main` (bloquear force push e exclusão).
7. **GitHub → Settings → Actions**: como não há workflows, restringir a "Allow rqstack actions" ou desativar.

## H. Orçamento

Nenhuma compra, assinatura, upgrade ou recurso pago foi ativado. Tudo acima é gratuito.
