# Configurando o login com Google e o ranking (custo zero)

> **Estado do projeto `kaylnsleygeysszomudd` (out/2026):** banco, migrations 001–005, seed de XP, Batalha de Código (Edge Function + pg_cron) e `.env.production` já estão prontos.
> **Login com Google ativo desde 25/10/2026:** projeto "Programacao do Zero" no Google Cloud, app publicado (Em produção), provedor ligado no Supabase, Site URL e Redirect URLs configuradas. Páginas exigidas pelo Google: `/privacidade` e `/termos`. Os passos abaixo ficam como referência caso seja preciso refazer.
> Para conferir a qualquer momento (deve aparecer `"google": true`):
> `curl -s -H "apikey: <chave publishable>" https://kaylnsleygeysszomudd.supabase.co/auth/v1/settings`

O site funciona sem nada disso: as aulas, os jogos, o treino e o laboratório rodam no navegador. O login só é necessário para o XP contar no **ranking** e na **liga da semana**, e para sincronizar o progresso entre aparelhos.

Tudo abaixo usa planos gratuitos:

| Serviço | Para quê | Custo |
| --- | --- | --- |
| GitHub Pages | hospedar o site | grátis |
| Supabase (plano Free) | login, banco de dados e ranking | grátis (limites generosos para um projeto pessoal) |
| Google Cloud (OAuth) | botão "Entrar com Google" | grátis |

> O plano gratuito do Supabase pausa projetos que ficam uma semana sem uso. Basta reativá-lo no painel; os dados não se perdem.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e entre com sua conta.
2. Clique em **New project**, escolha a organização no plano **Free**, dê o nome `programacao-do-zero` e a região **South America (São Paulo)**.
3. Guarde a senha do banco em um gerenciador de senhas (ela não vai para o site).

## 2. Criar o banco (migrations)

No painel do projeto, abra **SQL Editor** e rode, nesta ordem, o conteúdo de:

1. `supabase/migrations/20261021000001_ranking.sql`
2. `supabase/migrations/20261021000002_liga_e_treino.sql`
3. `supabase/seed.sql` (lista de atividades que valem XP)

Sempre que o conteúdo mudar (aulas, jogos ou projetos novos), rode `npm run db:seed` e execute o `supabase/seed.sql` de novo.

## 3. Criar o login do Google

1. Acesse [console.cloud.google.com](https://console.cloud.google.com), crie um projeto e abra **APIs e serviços → Tela de permissão OAuth**. Escolha **Externo**, preencha nome do app e e-mail de suporte.
2. Em **Credenciais → Criar credenciais → ID do cliente OAuth**, escolha **Aplicativo da Web**.
3. Em **Origens JavaScript autorizadas**, adicione `https://rqstack.github.io` (e `http://localhost:3000` para testes).
   Em **URIs de redirecionamento autorizados**, adicione o callback do Supabase — neste projeto é exatamente:
   `https://kaylnsleygeysszomudd.supabase.co/auth/v1/callback`
   (o mesmo endereço aparece em **Authentication → Sign In / Providers → Google**).
4. Copie o **ID do cliente** e a **chave secreta**.
5. No Supabase, em **Authentication → Sign In / Providers → Google**, ative o provedor (**Enable Sign in with Google**), cole o **Client ID** e o **Client Secret** e clique em **Save**. A chave secreta fica só no Supabase, nunca no site nem no repositório.
6. Na **Tela de permissão OAuth**, enquanto o app estiver em modo **Teste**, só os e-mails cadastrados em "Usuários de teste" conseguem entrar. Para liberar a todos, clique em **Publicar aplicativo** (para os escopos básicos de nome, e-mail e foto não há custo nem revisão paga).

Nada disso tem custo: o OAuth do Google e o Auth do Supabase Free são gratuitos. Contas já existentes continuam as mesmas (o vínculo é pelo e-mail/ID do Google).

## 4. Endereços permitidos

No Supabase, em **Authentication → URL Configuration**:

- **Site URL:** `https://rqstack.github.io/programacao-do-zero/`
- **Redirect URLs:**
  - `https://rqstack.github.io/programacao-do-zero/entrar/`
  - `http://localhost:3000/entrar/` (para testar localmente)

## 5. Ligar o site ao projeto

Em **Project Settings → API**, copie a **Project URL** e a chave **anon / publishable**. Elas são públicas por natureza: vão dentro do site e quem protege os dados são as regras de segurança (RLS) do banco.

Crie o arquivo `.env.production` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

> Nunca coloque a chave **service_role** em nenhum arquivo do site.

Depois publique de novo:

```bash
npm run deploy
```

## 6. Testar

1. Abra o site e clique em **Entrar** → **Entrar com Google**.
2. Conclua uma aula e confira em **Meu progresso** a mensagem "Progresso salvo na conta".
3. Abra o **Ranking**: seu nome deve aparecer na liga da semana.

## Segurança: o que o banco garante

- Cada pessoa só lê e altera os próprios dados (Row Level Security).
- Ninguém insere XP diretamente: a função `award_xp` aceita apenas atividades que existem (tabela `xp_sources`), com o valor fixo de cada uma, uma única vez por pessoa. O treino diário vale XP uma vez por dia.
- O ranking expõe apenas nome, foto e XP de quem escolheu aparecer.
- Como as respostas são corrigidas no navegador, não dá para provar no servidor que alguém resolveu cada exercício; o limite acima impede que alguém ganhe mais XP do que o conteúdo oferece.
