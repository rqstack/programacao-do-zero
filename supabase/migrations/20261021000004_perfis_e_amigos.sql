-- Perfis públicos (usuário, bio, GitHub, LinkedIn, site) e "adicionar" pessoas (seguir).
-- Tudo que é público sai por funções que escolhem as colunas; as tabelas continuam fechadas.

-- ---------------------------------------------------------------------------
-- Campos novos do perfil
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column username text,
  add column headline text not null default '' check (char_length(headline) <= 60),
  add column bio text not null default '' check (char_length(bio) <= 280),
  add column github text check (github is null or github ~ '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$'),
  add column linkedin text check (linkedin is null or linkedin ~ '^[A-Za-z0-9_%-]{3,100}$'),
  add column website text check (website is null or (char_length(website) <= 200 and website ~ '^https://[^\s<>"]+$')),
  add column is_public boolean not null default true;

-- Usuário inicial: dev_ + 8 caracteres aleatórios (a pessoa troca depois).
update public.profiles set username = 'dev_' || substr(md5(id::text || random()::text), 1, 8) where username is null;
alter table public.profiles
  alter column username set default ('dev_' || substr(md5(random()::text), 1, 8)),
  alter column username set not null,
  add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  add constraint profiles_username_key unique (username);

grant update (username, headline, bio, github, linkedin, website, is_public) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Seguir
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

-- Sem políticas: ninguém lê nem grava direto. Só pelas funções abaixo.
alter table public.follows enable row level security;
revoke all on public.follows from anon, authenticated;

create or replace function public.follow_user(p_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_target uuid;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  select id into v_target from public.profiles where username = lower(p_username) and is_public;
  if v_target is null or v_target = v_uid then
    return false;
  end if;
  if (select count(*) from public.follows where follower_id = v_uid) >= 1000 then
    raise exception 'limite de pessoas seguidas' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;
  insert into public.follows (follower_id, followed_id) values (v_uid, v_target) on conflict do nothing;
  return true;
end;
$$;

create or replace function public.unfollow_user(p_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  delete from public.follows f
  using public.profiles p
  where f.follower_id = auth.uid() and f.followed_id = p.id and p.username = lower(p_username);
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Leitura pública
-- ---------------------------------------------------------------------------

-- Perfil público pelo usuário. Perfil privado só aparece para a própria pessoa.
create or replace function public.get_public_profile(p_username text)
returns table (
  username text, display_name text, avatar_url text, headline text, bio text,
  github text, linkedin text, website text, is_public boolean, joined_at timestamptz,
  xp integer, weekly_xp integer, rank bigint,
  lessons integer, challenges integer, projects integer, trophies integer,
  followers bigint, following bigint, is_me boolean, i_follow boolean, follows_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with target as (
    select p.* from public.profiles p
    where p.username = lower(p_username) and (p.is_public or p.id = auth.uid())
  ),
  totals as (
    select e.user_id, sum(e.amount)::integer as xp
    from public.xp_events e join public.profiles p on p.id = e.user_id
    where p.show_in_ranking or p.id = (select id from target)
    group by e.user_id
  ),
  ranked as (select user_id, rank() over (order by xp desc) as rank from totals)
  select
    t.username,
    coalesce(nullif(t.display_name, ''), 'Dev anônimo'),
    t.avatar_url, t.headline, t.bio, t.github, t.linkedin, t.website, t.is_public, t.created_at,
    coalesce((select sum(amount) from public.xp_events where user_id = t.id), 0)::integer,
    coalesce((select sum(amount) from public.xp_events where user_id = t.id and created_at >= public.week_start()), 0)::integer,
    case when t.show_in_ranking then (select r.rank from ranked r where r.user_id = t.id) end,
    (select count(*) from public.xp_events where user_id = t.id and source_key like 'lesson:%')::integer,
    (select count(*) from public.xp_events where user_id = t.id and source_key like 'challenge:%')::integer,
    (select count(*) from public.xp_events where user_id = t.id and source_key like 'project:%')::integer,
    -- Troféus vêm do progresso salvo (jsonb); só contamos as chaves, limitado a 100.
    least(coalesce((select count(*) from public.user_progress up, jsonb_object_keys(case when jsonb_typeof(up.data -> 'achievements') = 'object' then up.data -> 'achievements' else '{}'::jsonb end) where up.user_id = t.id), 0), 100)::integer,
    (select count(*) from public.follows where followed_id = t.id),
    (select count(*) from public.follows where follower_id = t.id),
    coalesce(t.id = auth.uid(), false),
    exists (select 1 from public.follows where follower_id = auth.uid() and followed_id = t.id),
    exists (select 1 from public.follows where follower_id = t.id and followed_id = auth.uid())
  from target t;
$$;

-- Busca de pessoas por usuário ou nome (perfis públicos).
create or replace function public.search_profiles(p_query text)
returns table (username text, display_name text, avatar_url text, headline text, xp integer, i_follow boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with q as (
    select replace(replace(replace(lower(trim(coalesce(p_query, ''))), '\', '\\'), '%', '\%'), '_', '\_') as v
  )
  select
    p.username,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
    p.avatar_url,
    p.headline,
    coalesce((select sum(amount) from public.xp_events where user_id = p.id), 0)::integer as xp,
    exists (select 1 from public.follows where follower_id = auth.uid() and followed_id = p.id)
  from public.profiles p, q
  where p.is_public
    and char_length(q.v) between 2 and 40
    and (p.username like q.v || '%' or lower(p.display_name) like '%' || q.v || '%')
  order by (p.username = (select v from q)) desc, xp desc
  limit 20;
$$;

-- Quem a pessoa segue ou quem segue a pessoa (só perfis públicos aparecem na lista).
create or replace function public.get_follow_list(p_username text, p_kind text)
returns table (username text, display_name text, avatar_url text, headline text, xp integer)
language sql
stable
security definer
set search_path = ''
as $$
  with target as (
    select id from public.profiles where username = lower(p_username) and (is_public or id = auth.uid())
  )
  select
    p.username,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
    p.avatar_url,
    p.headline,
    coalesce((select sum(amount) from public.xp_events where user_id = p.id), 0)::integer as xp
  from public.follows f
  join target t on (case when p_kind = 'seguidores' then f.followed_id else f.follower_id end) = t.id
  join public.profiles p on p.id = (case when p_kind = 'seguidores' then f.follower_id else f.followed_id end)
  where p.is_public and p_kind in ('seguindo', 'seguidores')
  order by xp desc
  limit 200;
$$;

-- Liga dos amigos: você + quem você segue, com XP da semana e total.
create or replace function public.get_friends_leaderboard()
returns table (rank bigint, username text, display_name text, avatar_url text, weekly_xp integer, xp integer, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with people as (
    select auth.uid() as id
    union
    select followed_id from public.follows where follower_id = auth.uid()
  ),
  scores as (
    select p.id,
      coalesce((select sum(amount) from public.xp_events e where e.user_id = p.id and e.created_at >= public.week_start()), 0)::integer as weekly_xp,
      coalesce((select sum(amount) from public.xp_events e where e.user_id = p.id), 0)::integer as xp
    from people p
    where p.id is not null
  )
  select
    rank() over (order by s.weekly_xp desc) as rank,
    case when pr.is_public or pr.id = auth.uid() then pr.username end,
    coalesce(nullif(pr.display_name, ''), 'Dev anônimo'),
    pr.avatar_url,
    s.weekly_xp,
    s.xp,
    pr.id = auth.uid()
  from scores s
  join public.profiles pr on pr.id = s.id
  order by s.weekly_xp desc, s.xp desc
  limit 200;
$$;

-- ---------------------------------------------------------------------------
-- Rankings passam a devolver o usuário (para abrir o perfil). Mudou o retorno: recriar.
-- ---------------------------------------------------------------------------
drop function public.get_leaderboard(integer);
drop function public.get_weekly_leaderboard(integer);

create function public.get_leaderboard(p_limit integer default 50)
returns table (rank bigint, username text, display_name text, avatar_url text, xp integer, is_me boolean)
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
    case when p.is_public then p.username end,
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

create function public.get_weekly_leaderboard(p_limit integer default 50)
returns table (rank bigint, username text, display_name text, avatar_url text, xp integer, is_me boolean)
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
    case when p.is_public then p.username end,
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

revoke all on function
  public.follow_user(text), public.unfollow_user(text), public.get_public_profile(text), public.search_profiles(text),
  public.get_follow_list(text, text), public.get_friends_leaderboard(), public.get_leaderboard(integer), public.get_weekly_leaderboard(integer)
  from public, anon, authenticated;
grant execute on function public.get_public_profile(text), public.search_profiles(text), public.get_follow_list(text, text),
  public.get_leaderboard(integer), public.get_weekly_leaderboard(integer) to anon, authenticated;
grant execute on function public.follow_user(text), public.unfollow_user(text), public.get_friends_leaderboard() to authenticated;
