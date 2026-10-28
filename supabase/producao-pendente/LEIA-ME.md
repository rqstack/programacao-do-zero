# Alterações pendentes no banco de produção

**Aplicado em 26/10/2026** no projeto `kaylnsleygeysszomudd`, com autorização do dono (conferido: 546 atividades e `award_xp` com limite). Mantido como registro e para recriar o banco do zero, na ordem abaixo.

## 1. Limite de ritmo do XP

Arquivo: `supabase/migrations/20261026000008_xp_limites.sql`

- Substitui a função `award_xp` (mesmos parâmetros e permissões). Nenhuma tabela ou dado é alterado ou apagado.
- Efeito: cada pessoa ganha no máximo 400 XP a cada 10 minutos e 1.200 XP por dia; o restante entra nas sincronizações seguintes.
- Teste: `tests/db/xp-limits.test.ts`.

## 2. Atividades das trilhas Python, C# e AWS

Arquivo: `2026-10-26_atividades_python_csharp_aws.sql` (69 linhas em `xp_sources`).

- Só insere ou atualiza atividades (`on conflict do update`); pode rodar mais de uma vez.
- Sem isso, concluir aulas dessas trilhas não soma XP no ranking (o resto do site funciona).
- Teste: `tests/db/pending-production.test.ts`.

## 3. Missões (PENDENTE — ainda não aplicado)

Arquivo: `2026-10-27_missoes.sql` (equivale à migração `20261027000009_missoes.sql` + 8 linhas em `xp_sources`).

- Só amplia a regra de formato das chaves de XP para aceitar `mission:` e cadastra as 8 missões (30 a 50 XP cada). Nenhum dado existente muda.
- Sem isso, o site funciona normalmente, mas o XP das missões fica só no navegador e não entra no ranking.
- Teste: `tests/db/missions.test.ts` e `tests/db/pending-production.test.ts`.
- Depois de aplicar: `select count(*) from public.xp_sources;` deve dar 554.

## 4. Batalha com amigos, revanche, eventos (PENDENTE — ainda não aplicado)

Aplicar NESTA ORDEM, antes de publicar o site novo (o site novo chama funções que só existem depois disso):

1. `supabase/migrations/20261027000010_batalha_amigos.sql` — novas tabelas (`battle_invites`, `battle_events`), colunas (`kind`, `rematch_of`, `review_data`) e funções. Não apaga nem altera dados; partidas antigas ficam como "ranqueada".
2. `supabase/battle-config.sql` — agora também cadastra os 8 eventos semanais.
3. `supabase/battle-challenges.sql` — agora também grava a revisão de cada desafio (`review_data`).

A Edge Function `battle-submit` não muda. Testes: `tests/db/battle-friends.test.ts` (14) e `tests/db/battle.test.ts`.

## 5. Portfólio público (PENDENTE — ainda não aplicado)

Arquivo: `supabase/migrations/20261028000011_portfolio.sql`. Aplicar antes de publicar o site novo (a página de perfil lê a coluna `portfolio`).

- Contas NOVAS passam a nascer com perfil privado. As que já existem continuam como estão.
- Adiciona `profiles.portfolio` (preferências das seções) e a função `get_portfolio`.
- Teste: `tests/db/portfolio.test.ts` (e `tests/db/profiles.test.ts` atualizado).

## Como conferir depois de aplicar (somente leitura)

```sql
select count(*) from public.xp_sources;                       -- esperado: 546
select position('c_day_cap' in prosrc) > 0 as tem_limite
  from pg_proc where proname = 'award_xp';                   -- esperado: true
```

## Como desfazer

- Atividades: não é preciso desfazer (são só cadastros). Se quiser remover, apague as 69 chaves de `xp_sources`; isso apaga também o XP que alguém já tenha ganhado nelas.
- Limite do XP: reaplique a função `award_xp` de `20261021000002_liga_e_treino.sql`.
