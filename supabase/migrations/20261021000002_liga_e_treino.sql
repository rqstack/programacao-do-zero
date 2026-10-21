-- Liga semanal e XP do treino diário (estilo Duolingo)

-- Treino diário: chave practice:AAAA-MM-DD. O banco só cria a atividade para hoje ou
-- ontem (horário de Brasília), então cada pessoa ganha no máximo um treino por dia.
alter table public.xp_sources drop constraint xp_sources_key_check;
alter table public.xp_sources add constraint xp_sources_key_check
  check (key ~ '^(lesson|exercise|quiz|game|project|practice):[a-z0-9]+(-[a-z0-9]+)*$');

create or replace function public.award_xp(p_keys text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_total integer;
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_key text;
  v_day date;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if p_keys is null or cardinality(p_keys) > 1000 then
    raise exception 'lista de atividades inválida' using errcode = '22023';
  end if;

  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;

  foreach v_key in array p_keys loop
    if v_key ~ '^practice:\d{4}-\d{2}-\d{2}$' then
      begin
        v_day := substring(v_key from 10)::date;
      exception when others then
        v_day := null;
      end;
      if v_day is not null and v_day between v_today - 1 and v_today then
        insert into public.xp_sources (key, amount, label)
        values (v_key, 15, 'Treino diário ' || to_char(v_day, 'DD/MM'))
        on conflict (key) do nothing;
      end if;
    end if;
  end loop;

  insert into public.xp_events (user_id, source_key, amount)
  select v_uid, s.key, s.amount
  from public.xp_sources s
  where s.key = any (p_keys)
  on conflict (user_id, source_key) do nothing;

  select coalesce(sum(amount), 0)::integer into v_total from public.xp_events where user_id = v_uid;
  return v_total;
end;
$$;

-- Início da semana atual (segunda-feira, 00:00 em Brasília).
create or replace function public.week_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select (date_trunc('week', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
$$;

-- Liga da semana: XP ganho desde segunda-feira.
create or replace function public.get_weekly_leaderboard(p_limit integer default 50)
returns table (rank bigint, display_name text, avatar_url text, xp integer, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select e.user_id, sum(e.amount)::integer as xp, max(e.created_at) as last_at
    from public.xp_events e
    where e.created_at >= public.week_start()
    group by e.user_id
  )
  select
    rank() over (order by t.xp desc) as rank,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo') as display_name,
    p.avatar_url,
    t.xp,
    p.id = auth.uid() as is_me
  from totals t
  join public.profiles p on p.id = t.user_id
  where p.show_in_ranking and t.xp > 0
  order by t.xp desc, t.last_at asc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

revoke all on function public.award_xp(text[]), public.week_start(), public.get_weekly_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.award_xp(text[]) to authenticated;
grant execute on function public.week_start(), public.get_weekly_leaderboard(integer) to anon, authenticated;
