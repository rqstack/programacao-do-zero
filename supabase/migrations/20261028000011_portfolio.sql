-- Portfólio público do aluno.
--  * Perfis NOVOS passam a nascer privados (antes nasciam públicos). Os perfis que já
--    existem ficam como estão: mudar a escolha de quem já usa o site seria alterar dados
--    sem a pessoa pedir. Quem quiser pode tornar o perfil privado no próprio perfil.
--  * O que aparece no portfólio vem do que o SERVIDOR registrou (xp_events), não do que o
--    navegador diz: aulas, projetos e desafios só aparecem se estão em xp_events.
--  * A pessoa escolhe as seções em `portfolio` (jsonb); o que estiver oculto nem sai do banco.
--  * Nunca sai e-mail, id, anotações, favoritos nem dados de partidas além de vitórias e troféus.

alter table public.profiles alter column is_public set default false;

alter table public.profiles add column if not exists portfolio jsonb not null default '{}'::jsonb
  check (jsonb_typeof(portfolio) = 'object' and pg_column_size(portfolio) <= 2000);
grant update (portfolio) on public.profiles to authenticated;

-- Seção visível? Só um "false" explícito esconde (padrão: visível).
create or replace function public.portfolio_shows(p_prefs jsonb, p_key text)
returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(p_prefs ->> p_key, 'true') <> 'false';
$$;

create or replace function public.get_portfolio(p_username text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with t as (
    select p.* from public.profiles p
    where p.username = lower(p_username) and (p.is_public or p.id = auth.uid())
  ),
  ev as (
    select split_part(e.source_key, ':', 1) as kind, split_part(e.source_key, ':', 2) as slug, e.created_at
    from public.xp_events e, t where e.user_id = t.id
  )
  select jsonb_build_object(
    'prefs', jsonb_build_object(
      'show_xp', public.portfolio_shows(t.portfolio, 'show_xp'),
      'show_trails', public.portfolio_shows(t.portfolio, 'show_trails'),
      'show_projects', public.portfolio_shows(t.portfolio, 'show_projects'),
      'show_achievements', public.portfolio_shows(t.portfolio, 'show_achievements'),
      'show_challenges', public.portfolio_shows(t.portfolio, 'show_challenges'),
      'show_battle', public.portfolio_shows(t.portfolio, 'show_battle')),
    -- Contagens por tipo de atividade (base para as conquistas verificáveis).
    'counts', case when public.portfolio_shows(t.portfolio, 'show_achievements') or public.portfolio_shows(t.portfolio, 'show_xp') then
      coalesce((select jsonb_object_agg(kind, n) from (select kind, count(*) as n from ev group by kind) c), '{}'::jsonb) end,
    'xp', case when public.portfolio_shows(t.portfolio, 'show_xp') then
      (select coalesce(sum(amount), 0)::integer from public.xp_events where user_id = t.id) end,
    'lessons', case when public.portfolio_shows(t.portfolio, 'show_trails') then
      coalesce((select jsonb_agg(slug order by slug) from ev where kind = 'lesson'), '[]'::jsonb) end,
    -- Projetos concluídos (registrados no servidor). O link só sai se for https e curto.
    'projects', case when public.portfolio_shows(t.portfolio, 'show_projects') then
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'slug', ev.slug,
          'at', ev.created_at,
          'url', (select case when u.url ~ '^https://[^\s<>"'']{4,200}$' then u.url end
                  from (select up.data -> 'projects' -> ev.slug ->> 'url' as url from public.user_progress up where up.user_id = t.id) u)
        ) order by ev.created_at desc)
        from ev where ev.kind = 'project'
      ), '[]'::jsonb) end,
    'challenges', case when public.portfolio_shows(t.portfolio, 'show_challenges') then
      coalesce((select jsonb_agg(slug order by slug) from ev where kind = 'challenge'), '[]'::jsonb) end,
    'battle', case when public.portfolio_shows(t.portfolio, 'show_battle') then
      (select jsonb_build_object('trophies', bp.trophies, 'best_trophies', bp.best_trophies, 'wins', bp.wins)
       from public.battle_profiles bp where bp.user_id = t.id and bp.wins + bp.losses + bp.draws > 0) end
  )
  from t;
$$;

revoke all on function public.portfolio_shows(jsonb, text), public.get_portfolio(text) from public, anon, authenticated;
grant execute on function public.get_portfolio(text) to anon, authenticated;
