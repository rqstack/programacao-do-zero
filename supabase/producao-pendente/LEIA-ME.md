# Alterações pendentes no banco de produção

Nada nesta pasta foi aplicado no projeto `kaylnsleygeysszomudd`. Aplique só com autorização do dono, nesta ordem.

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

## Como conferir depois de aplicar (somente leitura)

```sql
select count(*) from public.xp_sources;                       -- esperado: 546
select position('c_day_cap' in prosrc) > 0 as tem_limite
  from pg_proc where proname = 'award_xp';                   -- esperado: true
```

## Como desfazer

- Atividades: não é preciso desfazer (são só cadastros). Se quiser remover, apague as 69 chaves de `xp_sources`; isso apaga também o XP que alguém já tenha ganhado nelas.
- Limite do XP: reaplique a função `award_xp` de `20261021000002_liga_e_treino.sql`.
