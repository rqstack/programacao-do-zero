-- Programação do Zero — contas, XP validado e ranking
-- O site é estático: o navegador fala direto com o Supabase usando a chave pública (anon).
-- Por isso TODA regra de segurança fica aqui, no banco:
--   * cada pessoa só lê e altera os próprios dados (RLS);
--   * ninguém insere XP diretamente: só pela função award_xp, que aceita apenas
--     atividades cadastradas em xp_sources, com o valor fixo de cada uma, uma vez por pessoa;
--   * o ranking é lido por uma função que expõe só nome, avatar e XP.

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar_url text check (avatar_url is null or (char_length(avatar_url) <= 500 and avatar_url ~ '^https://')),
  show_in_ranking boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cria o perfil no primeiro login, com nome e foto vindos do Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_avatar text;
begin
  v_name := left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), 40);
  v_avatar := coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture');
  if v_avatar is not null and (v_avatar !~ '^https://' or char_length(v_avatar) > 500) then
    v_avatar := null;
  end if;
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, v_name, v_avatar)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Atividades que rendem XP (geradas a partir do conteúdo: supabase/seed.sql)
-- ---------------------------------------------------------------------------
create table public.xp_sources (
  key text primary key check (key ~ '^(lesson|exercise|quiz|game|project):[a-z0-9]+(-[a-z0-9]+)*$'),
  amount integer not null check (amount between 1 and 500),
  label text not null default '' check (char_length(label) <= 200)
);

create table public.xp_events (
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_key text not null references public.xp_sources (key) on delete cascade,
  amount integer not null check (amount between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (user_id, source_key)
);
create index xp_events_source_idx on public.xp_events (source_key);

-- ---------------------------------------------------------------------------
-- Progresso detalhado (aulas, quizzes, conquistas...) para sincronizar aparelhos
-- ---------------------------------------------------------------------------
create table public.user_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 262144),
  updated_at timestamptz not null default now()
);

create trigger user_progress_updated_at before update on public.user_progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Privilégios e RLS
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.xp_sources, public.xp_events, public.user_progress from anon, authenticated;

grant select on public.xp_sources to anon, authenticated;
grant select on public.profiles, public.xp_events to authenticated;
grant update (display_name, show_in_ranking) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;

alter table public.profiles enable row level security;
alter table public.xp_sources enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_progress enable row level security;

create policy xp_sources_read on public.xp_sources for select to anon, authenticated using (true);

create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy xp_events_select_own on public.xp_events for select to authenticated
  using (user_id = (select auth.uid()));

create policy user_progress_select_own on public.user_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy user_progress_insert_own on public.user_progress for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy user_progress_update_own on public.user_progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_progress_delete_own on public.user_progress for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Funções expostas ao navegador
-- ---------------------------------------------------------------------------

-- Registra as atividades concluídas. Chaves desconhecidas são ignoradas, o valor vem
-- de xp_sources e cada atividade conta uma vez. Devolve o XP total da pessoa.
create or replace function public.award_xp(p_keys text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_total integer;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if p_keys is null or cardinality(p_keys) > 1000 then
    raise exception 'lista de atividades inválida' using errcode = '22023';
  end if;

  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;

  insert into public.xp_events (user_id, source_key, amount)
  select v_uid, s.key, s.amount
  from public.xp_sources s
  where s.key = any (p_keys)
  on conflict (user_id, source_key) do nothing;

  select coalesce(sum(amount), 0)::integer into v_total from public.xp_events where user_id = v_uid;
  return v_total;
end;
$$;

-- Ranking público: posição, nome, avatar e XP de quem aceitou aparecer.
create or replace function public.get_leaderboard(p_limit integer default 50)
returns table (rank bigint, display_name text, avatar_url text, xp integer, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select e.user_id, sum(e.amount)::integer as xp, max(e.created_at) as last_at
    from public.xp_events e
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

-- Posição da própria pessoa (mesmo fora do top), ou nada se não tiver XP.
create or replace function public.get_my_rank()
returns table (rank bigint, xp integer, total_players bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select e.user_id, sum(e.amount)::integer as xp
    from public.xp_events e
    join public.profiles p on p.id = e.user_id
    where p.show_in_ranking or p.id = auth.uid()
    group by e.user_id
  ),
  ranked as (
    select user_id, xp, rank() over (order by xp desc) as rank from totals
  )
  select r.rank, r.xp, (select count(*) from totals)
  from ranked r
  where r.user_id = auth.uid();
$$;

-- Exclusão da conta pela própria pessoa: remove o usuário e, em cascata, perfil, XP e progresso.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.award_xp(text[]), public.get_leaderboard(integer), public.get_my_rank(), public.delete_my_account(),
  public.handle_new_user(), public.touch_updated_at() from public, anon, authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.award_xp(text[]), public.get_my_rank(), public.delete_my_account() to authenticated;
