-- Batalha de Código: modo multiplayer competitivo com arenas e troféus.
-- Separado do XP: nada aqui lê ou altera xp_events, xp_sources ou o ranking de XP.
--
-- Segurança:
--  * todas as tabelas têm RLS e nenhuma permissão direta para anon/authenticated;
--  * o navegador só chama funções; quem registra e corrige envios é a Edge Function
--    battle-submit, com a chave service_role (funções liberadas só para service_role);
--  * o relógio é o do banco (now()); o navegador só exibe a contagem;
--  * toda função que muda uma partida trava a linha dela (FOR UPDATE), então envios e
--    resultados simultâneos são processados um de cada vez, em ordem determinística.

-- ---------------------------------------------------------------------------
-- Configuração (preenchida por supabase/battle-config.sql, gerado do código)
-- ---------------------------------------------------------------------------
create table public.battle_arenas (
  id integer primary key,
  slug text not null unique,
  name text not null,
  min_trophies integer not null unique check (min_trophies >= 0),
  tier integer not null check (tier between 1 and 20),
  duration_sec integer not null check (duration_sec between 60 and 1800),
  win integer not null check (win between 1 and 100),
  loss integer not null check (loss between 0 and 100),
  floor_protected boolean not null default false
);

create table public.battle_rules (
  id boolean primary key default true check (id),
  countdown_sec integer not null,
  diff_step integer not null check (diff_step > 0),
  diff_cap integer not null check (diff_cap >= 0),
  abandon_extra_loss integer not null check (abandon_extra_loss >= 0),
  abandon_after_sec integer not null check (abandon_after_sec >= 10),
  max_submissions integer not null check (max_submissions >= 1),
  min_seconds_between integer not null check (min_seconds_between >= 0),
  max_code_bytes integer not null check (max_code_bytes between 100 and 100000),
  judge_grace_sec integer not null check (judge_grace_sec >= 0),
  window_base integer not null check (window_base >= 0),
  window_per_sec integer not null check (window_per_sec >= 0),
  queue_stale_sec integer not null check (queue_stale_sec >= 5)
);

-- Parte PÚBLICA dos desafios (enunciado, exemplos, assinatura). Testes ocultos e
-- soluções ficam só dentro da Edge Function.
create table public.battle_challenges (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tier integer not null,
  title text not null,
  public_data jsonb not null check (jsonb_typeof(public_data) = 'object'),
  enabled boolean not null default true
);
create index battle_challenges_tier_idx on public.battle_challenges (tier) where enabled;

create table public.battle_seasons (
  id integer primary key,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

-- ---------------------------------------------------------------------------
-- Estado do jogo
-- ---------------------------------------------------------------------------
create table public.battle_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  trophies integer not null default 0 check (trophies >= 0),
  best_trophies integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  abandons integer not null default 0,
  streak integer not null default 0,
  best_streak integer not null default 0,
  last_match_at timestamptz
);

create table public.battle_queue (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  lang text not null check (lang in ('javascript', 'python', 'java', 'c')),
  trophies integer not null,
  joined_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);

create table public.battle_matches (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null references public.battle_challenges (id),
  arena_id integer not null references public.battle_arenas (id),
  season_id integer references public.battle_seasons (id),
  status text not null default 'pronta' check (status in ('pronta', 'em_andamento', 'finalizada', 'cancelada')),
  result text check (result in ('vitoria', 'tempo_esgotado', 'abandono', 'cancelada')),
  winner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  finished_at timestamptz,
  check (ends_at > starts_at),
  check ((status in ('finalizada', 'cancelada')) = (result is not null))
);
create index battle_matches_active_idx on public.battle_matches (status, ends_at) where status in ('pronta', 'em_andamento');

create table public.battle_participants (
  match_id uuid not null references public.battle_matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lang text not null check (lang in ('javascript', 'python', 'java', 'c')),
  trophies_before integer not null,
  trophy_delta integer,
  activity text not null default 'conectado' check (activity in ('conectado', 'resolvendo', 'desistiu')),
  last_seen timestamptz not null default now(),
  active boolean not null default true,
  primary key (match_id, user_id)
);
-- Uma pessoa só pode estar em uma partida ativa por vez (evita partidas duplicadas).
create unique index battle_participants_one_active on public.battle_participants (user_id) where active;
create index battle_participants_user_idx on public.battle_participants (user_id, match_id);

create table public.battle_submissions (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.battle_matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lang text not null,
  code text not null,
  submitted_at timestamptz not null default now(),
  status text not null default 'julgando' check (status in ('julgando', 'aceito', 'resposta_errada', 'erro_compilacao', 'erro_execucao', 'tempo_excedido', 'erro_tecnico')),
  passed integer,
  total integer,
  message text check (message is null or char_length(message) <= 1000),
  judged_at timestamptz
);
create index battle_submissions_match_idx on public.battle_submissions (match_id, submitted_at, id);

alter table public.battle_arenas enable row level security;
alter table public.battle_rules enable row level security;
alter table public.battle_challenges enable row level security;
alter table public.battle_seasons enable row level security;
alter table public.battle_profiles enable row level security;
alter table public.battle_queue enable row level security;
alter table public.battle_matches enable row level security;
alter table public.battle_participants enable row level security;
alter table public.battle_submissions enable row level security;

revoke all on public.battle_arenas, public.battle_rules, public.battle_challenges, public.battle_seasons, public.battle_profiles,
  public.battle_queue, public.battle_matches, public.battle_participants, public.battle_submissions from anon, authenticated;

-- Arenas e temporadas são públicas (só leitura).
grant select on public.battle_arenas, public.battle_seasons to anon, authenticated;
create policy battle_arenas_read on public.battle_arenas for select to anon, authenticated using (true);
create policy battle_seasons_read on public.battle_seasons for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Regras (mesma lógica de supabase/functions/_shared/battle-core.ts)
-- ---------------------------------------------------------------------------
create or replace function public.battle_arena_for(p_trophies integer)
returns public.battle_arenas
language sql stable set search_path = '' as $$
  select a.* from public.battle_arenas a
  where a.min_trophies <= greatest(p_trophies, 0)
  order by a.min_trophies desc
  limit 1;
$$;

create or replace function public.battle_trophy_delta(p_me integer, p_opponent integer, p_outcome text)
returns integer
language plpgsql stable set search_path = '' as $$
declare
  a public.battle_arenas := public.battle_arena_for(p_me);
  r public.battle_rules;
  v_adj integer;
  v_base integer;
begin
  select * into r from public.battle_rules;
  v_adj := greatest(-r.diff_cap, least(r.diff_cap, trunc((p_opponent - p_me)::numeric / r.diff_step)::integer));
  if p_outcome = 'vitoria' then
    return greatest(5, a.win + v_adj);
  end if;
  if a.loss = 0 then
    v_base := 0;
  else
    v_base := greatest(0, a.loss - v_adj) + case when p_outcome = 'abandono' then r.abandon_extra_loss else 0 end;
  end if;
  if a.floor_protected and p_me - v_base < a.min_trophies then
    return -(p_me - a.min_trophies);
  end if;
  return -least(v_base, p_me);
end;
$$;

create or replace function public.battle_current_season()
returns integer
language sql stable set search_path = '' as $$
  select id from public.battle_seasons where now() >= starts_at and now() < ends_at order by starts_at desc limit 1;
$$;

-- Encerra a partida (já travada) e aplica troféus. p_winner nulo = sem vencedor.
create or replace function public.battle_finish(p_match uuid, p_winner uuid, p_result text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  p record;
  v_opp integer;
  v_delta integer;
  v_outcome text;
begin
  for p in select * from public.battle_participants where match_id = p_match loop
    select trophies_before into v_opp from public.battle_participants where match_id = p_match and user_id <> p.user_id;
    if p_winner is null then
      v_delta := 0;
      v_outcome := 'empate';
    elsif p.user_id = p_winner then
      v_delta := public.battle_trophy_delta(p.trophies_before, coalesce(v_opp, p.trophies_before), 'vitoria');
      v_outcome := 'vitoria';
    else
      v_outcome := case when p_result = 'abandono' then 'abandono' else 'derrota' end;
      v_delta := public.battle_trophy_delta(p.trophies_before, coalesce(v_opp, p.trophies_before), v_outcome);
    end if;

    update public.battle_participants set trophy_delta = v_delta, active = false where match_id = p_match and user_id = p.user_id;
    update public.battle_profiles bp set
      trophies = greatest(0, bp.trophies + v_delta),
      best_trophies = greatest(bp.best_trophies, bp.trophies + v_delta),
      wins = bp.wins + (v_outcome = 'vitoria')::integer,
      losses = bp.losses + (v_outcome in ('derrota', 'abandono'))::integer,
      draws = bp.draws + (v_outcome = 'empate')::integer,
      abandons = bp.abandons + (v_outcome = 'abandono')::integer,
      streak = case when v_outcome = 'vitoria' then bp.streak + 1 when v_outcome = 'empate' then bp.streak else 0 end,
      best_streak = greatest(bp.best_streak, case when v_outcome = 'vitoria' then bp.streak + 1 else 0 end),
      last_match_at = now()
    where bp.user_id = p.user_id;
  end loop;

  update public.battle_matches set
    status = case when p_result = 'cancelada' then 'cancelada' else 'finalizada' end,
    result = p_result,
    winner_id = p_winner,
    finished_at = now()
  where id = p_match;
end;
$$;

-- Decide o estado da partida (chamada com a linha já travada). Regras, em ordem:
--  1. vence a solução ACEITA enviada primeiro (submitted_at, depois id), desde que não
--     exista envio anterior ainda em correção (ele pode ser o vencedor);
--  2. desistência ou ausência (sem sinal por abandon_after_sec) = vitória do outro;
--  3. fim do tempo: espera a correção dos envios feitos dentro do prazo (até judge_grace_sec);
--     depois, sem solução aceita = sem vencedor ("tempo_esgotado"), sem troféus para ninguém.
create or replace function public.battle_resolve(p_match uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  m public.battle_matches;
  r public.battle_rules;
  acc public.battle_submissions;
  v_quitter uuid;
  v_other uuid;
begin
  select * into r from public.battle_rules;
  select * into m from public.battle_matches where id = p_match;
  if m.id is null or m.status in ('finalizada', 'cancelada') then
    return;
  end if;
  if m.status = 'pronta' and now() >= m.starts_at then
    update public.battle_matches set status = 'em_andamento' where id = p_match;
    m.status := 'em_andamento';
  end if;

  -- Correção que travou (mais velha que a tolerância) vira falha técnica: não bloqueia ninguém.
  update public.battle_submissions set status = 'erro_tecnico', message = 'A correção não terminou a tempo. Envie de novo.', judged_at = now()
  where match_id = p_match and status = 'julgando' and submitted_at < now() - make_interval(secs => r.judge_grace_sec);

  select * into acc from public.battle_submissions
  where match_id = p_match and status = 'aceito'
  order by submitted_at, id limit 1;
  if acc.id is not null and not exists (
    select 1 from public.battle_submissions s
    where s.match_id = p_match and s.status = 'julgando' and (s.submitted_at, s.id) < (acc.submitted_at, acc.id)
  ) then
    perform public.battle_finish(p_match, acc.user_id, 'vitoria');
    return;
  end if;

  -- Desistência explícita.
  select user_id into v_quitter from public.battle_participants where match_id = p_match and activity = 'desistiu' order by last_seen limit 1;
  if v_quitter is null and m.status = 'em_andamento' then
    -- Ausência: um sumiu e o outro continua conectado.
    select a.user_id into v_quitter
    from public.battle_participants a join public.battle_participants b on b.match_id = a.match_id and b.user_id <> a.user_id
    where a.match_id = p_match
      and a.last_seen < now() - make_interval(secs => r.abandon_after_sec)
      and b.last_seen >= now() - make_interval(secs => r.abandon_after_sec)
      and not exists (select 1 from public.battle_submissions s where s.match_id = p_match and s.user_id = a.user_id and s.status = 'julgando')
    limit 1;
  end if;
  if v_quitter is not null then
    select user_id into v_other from public.battle_participants where match_id = p_match and user_id <> v_quitter;
    perform public.battle_finish(p_match, v_other, 'abandono');
    return;
  end if;

  if now() > m.ends_at then
    if exists (select 1 from public.battle_submissions where match_id = p_match and status = 'julgando')
       and now() <= m.ends_at + make_interval(secs => r.judge_grace_sec) then
      return; -- ainda corrigindo envios feitos dentro do prazo
    end if;
    update public.battle_submissions set status = 'erro_tecnico', message = 'A correção não terminou a tempo.', judged_at = now()
    where match_id = p_match and status = 'julgando';
    select * into acc from public.battle_submissions where match_id = p_match and status = 'aceito' order by submitted_at, id limit 1;
    if acc.id is not null then
      perform public.battle_finish(p_match, acc.user_id, 'vitoria');
    else
      perform public.battle_finish(p_match, null, 'tempo_esgotado');
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fila de matchmaking
-- ---------------------------------------------------------------------------
-- Entra (ou continua) na fila. Chamada a cada poucos segundos enquanto procura: serve
-- de sinal de vida e tenta formar a partida. Nunca cria adversário falso.
create or replace function public.battle_join_queue(p_lang text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  r public.battle_rules;
  v_me public.battle_profiles;
  v_mine public.battle_queue;
  v_opp public.battle_queue;
  v_active uuid;
  v_arena public.battle_arenas;
  v_challenge text;
  v_match uuid;
  v_start timestamptz;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if p_lang not in ('javascript', 'python', 'java', 'c') then
    raise exception 'linguagem inválida' using errcode = '22023';
  end if;
  select * into r from public.battle_rules;

  -- Uma operação de fila por vez no sistema todo: impede duas partidas para a mesma pessoa.
  perform pg_advisory_xact_lock(hashtext('battle_queue'));

  select bp.match_id into v_active from public.battle_participants bp where bp.user_id = v_uid and bp.active;
  if v_active is not null then
    delete from public.battle_queue where user_id = v_uid;
    return jsonb_build_object('state', 'partida', 'match_id', v_active);
  end if;

  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;
  insert into public.battle_profiles (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into v_me from public.battle_profiles where user_id = v_uid;

  insert into public.battle_queue (user_id, lang, trophies) values (v_uid, p_lang, v_me.trophies)
  on conflict (user_id) do update set lang = excluded.lang, trophies = excluded.trophies, seen_at = now();
  select * into v_mine from public.battle_queue where user_id = v_uid;

  delete from public.battle_queue where seen_at < now() - make_interval(secs => r.queue_stale_sec);

  select q.* into v_opp from public.battle_queue q
  where q.user_id <> v_uid
    and abs(q.trophies - v_mine.trophies) <= r.window_base + r.window_per_sec * extract(epoch from now() - least(q.joined_at, v_mine.joined_at))
  order by abs(q.trophies - v_mine.trophies), q.joined_at
  limit 1;

  if v_opp.user_id is null then
    return jsonb_build_object('state', 'fila', 'waiting_sec', floor(extract(epoch from now() - v_mine.joined_at)),
      'players_in_queue', (select count(*) from public.battle_queue));
  end if;

  -- Desafio do nível da arena de quem tem MENOS troféus (justo para iniciantes).
  v_arena := public.battle_arena_for(least(v_mine.trophies, v_opp.trophies));
  select id into v_challenge from public.battle_challenges where enabled and tier = v_arena.tier order by random() limit 1;
  if v_challenge is null then
    select id into v_challenge from public.battle_challenges where enabled and tier <= v_arena.tier order by tier desc, random() limit 1;
  end if;
  if v_challenge is null then
    raise exception 'nenhum desafio cadastrado' using errcode = 'P0002';
  end if;

  v_start := now() + make_interval(secs => r.countdown_sec);
  insert into public.battle_matches (challenge_id, arena_id, season_id, starts_at, ends_at)
  values (v_challenge, v_arena.id, public.battle_current_season(), v_start, v_start + make_interval(secs => v_arena.duration_sec))
  returning id into v_match;
  insert into public.battle_participants (match_id, user_id, lang, trophies_before) values
    (v_match, v_uid, v_mine.lang, v_mine.trophies),
    (v_match, v_opp.user_id, v_opp.lang, v_opp.trophies);
  delete from public.battle_queue where user_id in (v_uid, v_opp.user_id);
  return jsonb_build_object('state', 'partida', 'match_id', v_match);
end;
$$;

create or replace function public.battle_leave_queue()
returns void
language sql security definer set search_path = '' as $$
  delete from public.battle_queue where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Estado da partida (o navegador chama a cada ~1,5 s; também é o sinal de vida)
-- ---------------------------------------------------------------------------
create or replace function public.battle_state(p_match uuid, p_activity text default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.battle_matches;
  me public.battle_participants;
  opp public.battle_participants;
  v_done boolean;
  v_started boolean;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  perform 1 from public.battle_matches where id = p_match for update;
  select * into me from public.battle_participants where match_id = p_match and user_id = v_uid;
  if me.user_id is null then
    raise exception 'partida não encontrada' using errcode = 'P0002';
  end if;

  if me.active then
    update public.battle_participants set
      last_seen = now(),
      activity = case when activity = 'desistiu' then 'desistiu' when p_activity in ('conectado', 'resolvendo') then p_activity else activity end
    where match_id = p_match and user_id = v_uid;
  end if;
  perform public.battle_resolve(p_match);

  select * into m from public.battle_matches where id = p_match;
  select * into me from public.battle_participants where match_id = p_match and user_id = v_uid;
  select * into opp from public.battle_participants where match_id = p_match and user_id <> v_uid;
  v_done := m.status in ('finalizada', 'cancelada');
  v_started := now() >= m.starts_at;

  return jsonb_build_object(
    'match_id', m.id,
    'status', m.status,
    'result', m.result,
    'winner', case when m.winner_id is null then null when m.winner_id = v_uid then 'eu' else 'adversario' end,
    'server_now', now(),
    'starts_at', m.starts_at,
    'ends_at', m.ends_at,
    'finished_at', m.finished_at,
    'arena', (select jsonb_build_object('id', a.id, 'name', a.name, 'tier', a.tier) from public.battle_arenas a where a.id = m.arena_id),
    -- O enunciado só aparece quando a contagem termina, igual para os dois.
    'challenge', case when v_started then (select c.public_data from public.battle_challenges c where c.id = m.challenge_id) end,
    'me', jsonb_build_object('lang', me.lang, 'trophies_before', me.trophies_before, 'trophy_delta', me.trophy_delta),
    'opponent', (
      select jsonb_build_object(
        'name', coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
        'username', case when p.is_public then p.username end,
        'avatar_url', p.avatar_url,
        'lang', opp.lang,
        'trophies_before', opp.trophies_before,
        'trophy_delta', opp.trophy_delta,
        'state', case
          when opp.activity = 'desistiu' then 'desistiu'
          when v_done then 'concluido'
          when exists (select 1 from public.battle_submissions s where s.match_id = p_match and s.user_id = opp.user_id and s.status = 'julgando') then 'enviando'
          when opp.last_seen < now() - interval '10 seconds' then 'desconectado'
          when opp.activity = 'resolvendo' then 'resolvendo'
          else 'conectado' end,
        'submissions', (select count(*) from public.battle_submissions s where s.match_id = p_match and s.user_id = opp.user_id),
        -- Código do adversário: só depois do fim da partida.
        'final_code', case when v_done then (select s.code from public.battle_submissions s where s.match_id = p_match and s.user_id = opp.user_id order by (s.status = 'aceito') desc, s.submitted_at desc limit 1) end
      )
      from public.profiles p where p.id = opp.user_id
    ),
    'my_submissions', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'status', s.status, 'passed', s.passed, 'total', s.total, 'message', s.message, 'submitted_at', s.submitted_at) order by s.id)
      from public.battle_submissions s where s.match_id = p_match and s.user_id = v_uid
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.battle_forfeit(p_match uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  perform 1 from public.battle_matches where id = p_match for update;
  update public.battle_participants set activity = 'desistiu'
  where match_id = p_match and user_id = auth.uid() and active;
  perform public.battle_resolve(p_match);
  return public.battle_state(p_match, null);
end;
$$;

create or replace function public.battle_my_active()
returns uuid
language sql stable security definer set search_path = '' as $$
  select match_id from public.battle_participants where user_id = auth.uid() and active limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Envios (só a Edge Function, com service_role)
-- ---------------------------------------------------------------------------
create or replace function public.battle_register_submission(p_user uuid, p_match uuid, p_code text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  r public.battle_rules;
  m public.battle_matches;
  me public.battle_participants;
  v_count integer;
  v_last timestamptz;
  v_id bigint;
begin
  select * into r from public.battle_rules;
  select * into m from public.battle_matches where id = p_match for update;
  if m.id is null then
    return jsonb_build_object('ok', false, 'error', 'partida não encontrada');
  end if;
  perform public.battle_resolve(p_match);
  select * into m from public.battle_matches where id = p_match;
  select * into me from public.battle_participants where match_id = p_match and user_id = p_user;
  if me.user_id is null then
    return jsonb_build_object('ok', false, 'error', 'você não está nesta partida');
  end if;
  if m.status <> 'em_andamento' then
    return jsonb_build_object('ok', false, 'error', case when m.status = 'pronta' then 'a partida ainda não começou' else 'a partida já terminou' end);
  end if;
  if now() > m.ends_at then
    return jsonb_build_object('ok', false, 'error', 'o tempo acabou');
  end if;
  if p_code is null or octet_length(p_code) = 0 or octet_length(p_code) > r.max_code_bytes then
    return jsonb_build_object('ok', false, 'error', format('o código precisa ter entre 1 e %s bytes', r.max_code_bytes));
  end if;
  if exists (select 1 from public.battle_submissions where match_id = p_match and user_id = p_user and status = 'julgando') then
    return jsonb_build_object('ok', false, 'error', 'espere a correção do envio anterior');
  end if;
  select count(*), max(submitted_at) into v_count, v_last from public.battle_submissions where match_id = p_match and user_id = p_user;
  if v_count >= r.max_submissions then
    return jsonb_build_object('ok', false, 'error', 'limite de envios desta partida atingido');
  end if;
  if v_last is not null and v_last > now() - make_interval(secs => r.min_seconds_between) then
    return jsonb_build_object('ok', false, 'error', format('espere %s segundos entre envios', r.min_seconds_between));
  end if;

  insert into public.battle_submissions (match_id, user_id, lang, code) values (p_match, p_user, me.lang, p_code) returning id into v_id;
  update public.battle_participants set last_seen = now() where match_id = p_match and user_id = p_user;
  return jsonb_build_object('ok', true, 'submission_id', v_id, 'challenge_id', m.challenge_id, 'lang', me.lang);
end;
$$;

create or replace function public.battle_complete_submission(p_submission bigint, p_status text, p_passed integer, p_total integer, p_message text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_match uuid;
  v_status text;
begin
  if p_status not in ('aceito', 'resposta_errada', 'erro_compilacao', 'erro_execucao', 'tempo_excedido', 'erro_tecnico') then
    raise exception 'veredito inválido' using errcode = '22023';
  end if;
  select match_id into v_match from public.battle_submissions where id = p_submission;
  if v_match is null then
    return jsonb_build_object('ok', false);
  end if;
  perform 1 from public.battle_matches where id = v_match for update;
  update public.battle_submissions set status = p_status, passed = p_passed, total = p_total, message = left(p_message, 1000), judged_at = now()
  where id = p_submission and status = 'julgando';
  perform public.battle_resolve(v_match);
  select status into v_status from public.battle_matches where id = v_match;
  return jsonb_build_object('ok', true, 'match_status', v_status);
end;
$$;

-- Varredura periódica (pg_cron): fecha partidas vencidas e limpa a fila.
create or replace function public.battle_sweep()
returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  n integer := 0;
begin
  for v_id in select id from public.battle_matches where status in ('pronta', 'em_andamento') and (ends_at < now() or starts_at < now()) for update skip locked loop
    perform public.battle_resolve(v_id);
    n := n + 1;
  end loop;
  delete from public.battle_queue where seen_at < now() - make_interval(secs => (select queue_stale_sec from public.battle_rules));
  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfil competitivo, histórico e ranking da Batalha (separado do ranking de XP)
-- ---------------------------------------------------------------------------
create or replace function public.battle_me()
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'trophies', coalesce(bp.trophies, 0), 'best_trophies', coalesce(bp.best_trophies, 0),
    'wins', coalesce(bp.wins, 0), 'losses', coalesce(bp.losses, 0), 'draws', coalesce(bp.draws, 0),
    'abandons', coalesce(bp.abandons, 0), 'streak', coalesce(bp.streak, 0), 'best_streak', coalesce(bp.best_streak, 0),
    'active_match', (select match_id from public.battle_participants where user_id = auth.uid() and active limit 1),
    'in_queue', exists (select 1 from public.battle_queue where user_id = auth.uid())
  )
  from (select auth.uid() as uid) u left join public.battle_profiles bp on bp.user_id = u.uid
  where u.uid is not null;
$$;

create or replace function public.battle_history(p_limit integer default 20)
returns table (match_id uuid, finished_at timestamptz, challenge_title text, arena_name text, my_lang text, opponent_name text, opponent_username text,
  opponent_lang text, outcome text, result text, trophy_delta integer)
language sql stable security definer set search_path = '' as $$
  select m.id, m.finished_at, c.title, a.name, me.lang,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
    case when p.is_public then p.username end,
    opp.lang,
    case when m.winner_id is null then 'empate' when m.winner_id = auth.uid() then 'vitoria' else 'derrota' end,
    m.result, me.trophy_delta
  from public.battle_participants me
  join public.battle_matches m on m.id = me.match_id
  join public.battle_challenges c on c.id = m.challenge_id
  join public.battle_arenas a on a.id = m.arena_id
  join public.battle_participants opp on opp.match_id = m.id and opp.user_id <> me.user_id
  join public.profiles p on p.id = opp.user_id
  where me.user_id = auth.uid() and m.status in ('finalizada', 'cancelada')
  order by m.finished_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

-- p_scope: 'geral' (troféus atuais) ou 'temporada' (troféus ganhos na temporada atual).
create or replace function public.battle_leaderboard(p_scope text default 'geral', p_limit integer default 50)
returns table (rank bigint, username text, display_name text, avatar_url text, trophies integer, arena_name text,
  wins integer, losses integer, win_rate integer, streak integer, best_streak integer, is_me boolean)
language sql stable security definer set search_path = '' as $$
  with season as (select public.battle_current_season() as id),
  season_stats as (
    select bp.user_id,
      sum(bp.trophy_delta)::integer as net,
      count(*) filter (where m.winner_id = bp.user_id)::integer as w,
      count(*) filter (where m.winner_id is not null and m.winner_id <> bp.user_id)::integer as l
    from public.battle_participants bp
    join public.battle_matches m on m.id = bp.match_id
    where m.status = 'finalizada' and m.season_id = (select id from season)
    group by bp.user_id
  ),
  base as (
    select b.user_id,
      case when p_scope = 'temporada' then coalesce(s.net, 0) else b.trophies end as score,
      b.trophies,
      case when p_scope = 'temporada' then coalesce(s.w, 0) else b.wins end as w,
      case when p_scope = 'temporada' then coalesce(s.l, 0) else b.losses end as l,
      b.streak, b.best_streak
    from public.battle_profiles b
    left join season_stats s on s.user_id = b.user_id
    where (p_scope = 'temporada' and s.user_id is not null) or (p_scope <> 'temporada' and b.wins + b.losses + b.draws > 0)
  )
  select
    rank() over (order by x.score desc, x.w desc),
    case when p.is_public then p.username end,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
    p.avatar_url,
    x.score,
    (public.battle_arena_for(x.trophies)).name,
    x.w, x.l,
    case when x.w + x.l = 0 then 0 else round(100.0 * x.w / (x.w + x.l))::integer end,
    x.streak, x.best_streak,
    coalesce(p.id = auth.uid(), false)
  from base x join public.profiles p on p.id = x.user_id
  where p.show_in_ranking
  order by x.score desc, x.w desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

-- ---------------------------------------------------------------------------
-- Permissões das funções
-- ---------------------------------------------------------------------------
revoke all on function
  public.battle_arena_for(integer), public.battle_trophy_delta(integer, integer, text), public.battle_current_season(),
  public.battle_finish(uuid, uuid, text), public.battle_resolve(uuid), public.battle_join_queue(text), public.battle_leave_queue(),
  public.battle_state(uuid, text), public.battle_forfeit(uuid), public.battle_my_active(),
  public.battle_register_submission(uuid, uuid, text), public.battle_complete_submission(bigint, text, integer, integer, text),
  public.battle_sweep(), public.battle_me(), public.battle_history(integer), public.battle_leaderboard(text, integer)
  from public, anon, authenticated;

grant execute on function public.battle_leaderboard(text, integer), public.battle_arena_for(integer), public.battle_trophy_delta(integer, integer, text)
  to anon, authenticated;
grant execute on function public.battle_join_queue(text), public.battle_leave_queue(), public.battle_state(uuid, text),
  public.battle_forfeit(uuid), public.battle_my_active(), public.battle_me(), public.battle_history(integer) to authenticated;
grant execute on function public.battle_register_submission(uuid, uuid, text), public.battle_complete_submission(bigint, text, integer, integer, text),
  public.battle_sweep(), public.battle_resolve(uuid) to service_role;
