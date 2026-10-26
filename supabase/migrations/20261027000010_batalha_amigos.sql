-- Batalha de Código: desafiar amigos (convite com código), revanche, histórico detalhado,
-- revisão pós-partida, sorteio que evita repetir desafios e eventos semanais.
--
-- Compatível com os dados atuais: só adiciona tabelas, colunas e funções; as funções
-- existentes são substituídas mantendo os mesmos parâmetros (battle_history ganha colunas).
-- Segurança: mesmas regras da migração da Batalha (RLS, nenhuma permissão direta nas
-- tabelas, tudo por funções com trava). Partidas entre amigos e revanches são AMISTOSAS:
-- não mexem em troféus, vitórias do perfil, temporada nem eventos (evita combinar
-- resultados entre contas conhecidas).

alter table public.battle_challenges add column if not exists review_data jsonb check (review_data is null or jsonb_typeof(review_data) = 'object');
alter table public.battle_matches add column if not exists kind text not null default 'ranqueada' check (kind in ('ranqueada', 'amistosa'));
alter table public.battle_matches add column if not exists rematch_of uuid references public.battle_matches (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Eventos semanais (configuração em battle-sql.ts → battle-config.sql)
-- ---------------------------------------------------------------------------
create table public.battle_events (
  id integer primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) <= 80),
  description text not null check (char_length(description) <= 400),
  metric text not null check (metric in ('vitorias', 'resolvidos', 'velocidade')),
  tiers integer[] not null check (cardinality(tiers) between 1 and 20),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);
alter table public.battle_events enable row level security;
revoke all on public.battle_events from anon, authenticated;
grant select on public.battle_events to anon, authenticated;
create policy battle_events_read on public.battle_events for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Convites (amigos e revanches)
-- ---------------------------------------------------------------------------
create table public.battle_invites (
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  host_id uuid not null references public.profiles (id) on delete cascade,
  -- Revanche: o convidado já é definido. Convite de amigo: preenchido ao aceitar.
  guest_id uuid references public.profiles (id) on delete cascade,
  host_lang text not null check (public.battle_lang_ok(host_lang)),
  guest_lang text check (guest_lang is null or public.battle_lang_ok(guest_lang)),
  rematch_of uuid references public.battle_matches (id) on delete cascade,
  status text not null default 'aberto' check (status in ('aberto', 'aceito', 'recusado', 'cancelado')),
  match_id uuid references public.battle_matches (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);
-- Um convite de amigo aberto por pessoa e um pedido de revanche por partida.
create unique index battle_invites_one_open on public.battle_invites (host_id) where status = 'aberto' and rematch_of is null;
create unique index battle_invites_one_rematch on public.battle_invites (rematch_of) where rematch_of is not null;
create index battle_invites_host_idx on public.battle_invites (host_id, created_at);
alter table public.battle_invites enable row level security;
revoke all on public.battle_invites from anon, authenticated;

-- Código de 8 caracteres sem 0/O/1/I, a partir de bytes aleatórios de gen_random_uuid().
create or replace function public.battle_new_code()
returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b bytea;
  v text;
begin
  loop
    b := uuid_send(gen_random_uuid());
    v := '';
    for i in 0..7 loop
      v := v || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.battle_invites where code = v);
  end loop;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- Sorteio do desafio: evita os que um dos dois jogou nos últimos 30 dias.
-- ---------------------------------------------------------------------------
create or replace function public.battle_pick_challenge(p_tier integer, p_a uuid, p_b uuid)
returns text
language sql volatile security definer set search_path = '' as $$
  select c.id
  from public.battle_challenges c
  where c.enabled and c.tier <= p_tier
  order by
    (c.tier = p_tier) desc,
    (select count(*) from public.battle_participants bp join public.battle_matches m on m.id = bp.match_id
      where m.challenge_id = c.id and bp.user_id in (p_a, p_b) and m.created_at > now() - interval '30 days'),
    c.tier desc,
    random()
  limit 1;
$$;

-- Cria a partida (com a fila já travada por quem chama). Amistosas não entram na temporada.
create or replace function public.battle_create_match(p_a uuid, p_a_lang text, p_b uuid, p_b_lang text, p_kind text, p_rematch_of uuid default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  r public.battle_rules;
  v_ta integer;
  v_tb integer;
  v_arena public.battle_arenas;
  v_challenge text;
  v_start timestamptz;
  v_match uuid;
begin
  select * into r from public.battle_rules;
  insert into public.profiles (id) values (p_a), (p_b) on conflict (id) do nothing;
  insert into public.battle_profiles (user_id) values (p_a), (p_b) on conflict (user_id) do nothing;
  select trophies into v_ta from public.battle_profiles where user_id = p_a;
  select trophies into v_tb from public.battle_profiles where user_id = p_b;
  -- Desafio do nível da arena de quem tem MENOS troféus (justo para iniciantes).
  v_arena := public.battle_arena_for(least(v_ta, v_tb));
  v_challenge := public.battle_pick_challenge(v_arena.tier, p_a, p_b);
  if v_challenge is null then
    raise exception 'nenhum desafio cadastrado' using errcode = 'P0002';
  end if;
  v_start := now() + make_interval(secs => r.countdown_sec);
  insert into public.battle_matches (challenge_id, arena_id, season_id, starts_at, ends_at, kind, rematch_of)
  values (v_challenge, v_arena.id, case when p_kind = 'ranqueada' then public.battle_current_season() end, v_start,
    v_start + make_interval(secs => v_arena.duration_sec), p_kind, p_rematch_of)
  returning id into v_match;
  insert into public.battle_participants (match_id, user_id, lang, trophies_before) values (v_match, p_a, p_a_lang, v_ta), (v_match, p_b, p_b_lang, v_tb);
  delete from public.battle_queue where user_id in (p_a, p_b);
  return v_match;
end;
$$;

-- Fila: mesma lógica de antes, agora com o sorteio que evita repetição.
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
  v_match uuid;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if not public.battle_lang_ok(p_lang) then
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

  v_match := public.battle_create_match(v_uid, v_mine.lang, v_opp.user_id, v_opp.lang, 'ranqueada');
  return jsonb_build_object('state', 'partida', 'match_id', v_match);
end;
$$;

-- Encerramento: igual ao anterior; partidas amistosas não mexem em troféus nem no perfil.
create or replace function public.battle_finish(p_match uuid, p_winner uuid, p_result text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  p record;
  v_opp integer;
  v_delta integer;
  v_outcome text;
  v_kind text;
begin
  select kind into v_kind from public.battle_matches where id = p_match;
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
    if v_kind = 'amistosa' then
      v_delta := 0;
    end if;

    update public.battle_participants set trophy_delta = v_delta, active = false where match_id = p_match and user_id = p.user_id;
    if v_kind = 'amistosa' then
      update public.battle_profiles set last_match_at = now() where user_id = p.user_id;
    else
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
    end if;
  end loop;

  update public.battle_matches set
    status = case when p_result = 'cancelada' then 'cancelada' else 'finalizada' end,
    result = p_result,
    winner_id = p_winner,
    finished_at = now()
  where id = p_match;
end;
$$;

-- ---------------------------------------------------------------------------
-- Revanche
-- ---------------------------------------------------------------------------
-- Disponível = viu a tela nos últimos 20 s e não está em outra partida.
create or replace function public.battle_available(p_user uuid, p_except uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.battle_participants where user_id = p_user and active and match_id <> p_except)
    and exists (select 1 from public.battle_participants where user_id = p_user and match_id = p_except and last_seen > now() - interval '20 seconds');
$$;

create or replace function public.battle_rematch_info(p_match uuid, p_uid uuid)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'status', case
      when i.code is null then 'nenhum'
      when i.status = 'aceito' then 'aceito'
      when i.status = 'recusado' then 'recusado'
      when i.status = 'cancelado' then 'cancelado'
      when i.expires_at <= now() then 'expirado'
      when i.host_id = p_uid then 'pedido_por_mim'
      else 'pedido_pelo_adversario' end,
    'match_id', case when i.status = 'aceito' then i.match_id end,
    'expires_at', case when i.status = 'aberto' then i.expires_at end,
    'opponent_available', public.battle_available((select user_id from public.battle_participants where match_id = p_match and user_id <> p_uid), p_match)
  )
  from (select 1) x left join public.battle_invites i on i.rematch_of = p_match;
$$;

create or replace function public.battle_rematch(p_match uuid, p_action text default 'pedir')
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  m public.battle_matches;
  me public.battle_participants;
  opp public.battle_participants;
  i public.battle_invites;
  v_new uuid;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if p_action not in ('pedir', 'aceitar', 'recusar') then
    raise exception 'ação inválida' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('battle_queue'));
  select * into m from public.battle_matches where id = p_match for update;
  select * into me from public.battle_participants where match_id = p_match and user_id = v_uid;
  if m.id is null or me.user_id is null then
    raise exception 'partida não encontrada' using errcode = 'P0002';
  end if;
  if m.status not in ('finalizada', 'cancelada') then
    raise exception 'a partida ainda não terminou' using errcode = '22023';
  end if;
  select * into opp from public.battle_participants where match_id = p_match and user_id <> v_uid;
  update public.battle_participants set last_seen = now() where match_id = p_match and user_id = v_uid;
  select * into i from public.battle_invites where rematch_of = p_match for update;

  if i.code is not null and i.status = 'aberto' and i.expires_at <= now() then
    -- Pedido vencido: pode ser feito de novo.
    delete from public.battle_invites where code = i.code;
    i := null;
  end if;

  if p_action = 'recusar' then
    if i.code is not null and i.status = 'aberto' and i.guest_id = v_uid then
      update public.battle_invites set status = 'recusado' where code = i.code;
    end if;
    return public.battle_rematch_info(p_match, v_uid);
  end if;

  -- "pedir" quando o outro já pediu = aceitar; "aceitar" só vale para quem foi convidado.
  if i.code is not null and i.status = 'aberto' and i.guest_id = v_uid then
    if exists (select 1 from public.battle_participants where user_id in (v_uid, i.host_id) and active) then
      return public.battle_rematch_info(p_match, v_uid) || jsonb_build_object('error', 'Um de vocês já está em outra partida.');
    end if;
    v_new := public.battle_create_match(i.host_id, i.host_lang, v_uid, me.lang, 'amistosa', p_match);
    update public.battle_invites set status = 'aceito', guest_lang = me.lang, match_id = v_new where code = i.code;
    return public.battle_rematch_info(p_match, v_uid);
  end if;

  if p_action = 'aceitar' or i.code is not null then
    return public.battle_rematch_info(p_match, v_uid);
  end if;

  if not public.battle_available(opp.user_id, p_match) then
    return public.battle_rematch_info(p_match, v_uid) || jsonb_build_object('error', 'O adversário saiu da tela da partida ou já está jogando outra.');
  end if;
  insert into public.battle_invites (code, host_id, guest_id, host_lang, rematch_of, expires_at)
  values (public.battle_new_code(), v_uid, opp.user_id, me.lang, p_match, now() + interval '90 seconds');
  return public.battle_rematch_info(p_match, v_uid);
end;
$$;

-- ---------------------------------------------------------------------------
-- Convite para amigo (código para compartilhar)
-- ---------------------------------------------------------------------------
create or replace function public.battle_invite_create(p_lang text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_exp timestamptz := now() + interval '15 minutes';
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if not public.battle_lang_ok(p_lang) then
    raise exception 'linguagem inválida' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('battle_queue'));
  if exists (select 1 from public.battle_participants where user_id = v_uid and active) then
    raise exception 'termine a partida atual antes de convidar' using errcode = '22023';
  end if;
  if (select count(*) from public.battle_invites where host_id = v_uid and rematch_of is null and created_at > now() - interval '1 day') >= 30 then
    raise exception 'limite de convites por dia atingido' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;
  update public.battle_invites set status = 'cancelado' where host_id = v_uid and status = 'aberto' and rematch_of is null;
  delete from public.battle_queue where user_id = v_uid;
  v_code := public.battle_new_code();
  insert into public.battle_invites (code, host_id, host_lang, expires_at) values (v_code, v_uid, p_lang, v_exp);
  return jsonb_build_object('code', v_code, 'expires_at', v_exp, 'status', 'aberto');
end;
$$;

-- Situação do convite que EU criei por último (quem convidou acompanha até o amigo entrar).
create or replace function public.battle_invite_mine()
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', i.code,
    'status', case when i.status = 'aberto' and i.expires_at <= now() then 'expirado' else i.status end,
    'expires_at', i.expires_at,
    'match_id', i.match_id)
  from public.battle_invites i
  where i.host_id = auth.uid() and i.rematch_of is null and i.created_at > now() - interval '1 hour'
  order by i.created_at desc
  limit 1;
$$;

-- O que quem recebeu o código pode ver antes de aceitar (sem ids nem dados privados).
create or replace function public.battle_invite_peek(p_code text)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  i public.battle_invites;
  v_code text := upper(trim(coalesce(p_code, '')));
begin
  if auth.uid() is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  select * into i from public.battle_invites where code = v_code and rematch_of is null;
  if i.code is null then
    return jsonb_build_object('status', 'inexistente');
  end if;
  return jsonb_build_object(
    'status', case when i.status = 'aberto' and i.expires_at <= now() then 'expirado' when i.status = 'aceito' then 'usado' else i.status end,
    'mine', i.host_id = auth.uid(),
    'host_name', (select coalesce(nullif(p.display_name, ''), 'Dev anônimo') from public.profiles p where p.id = i.host_id),
    'host_lang', i.host_lang,
    'expires_at', i.expires_at);
end;
$$;

create or replace function public.battle_invite_accept(p_code text, p_lang text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  i public.battle_invites;
  v_match uuid;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if not public.battle_lang_ok(p_lang) then
    raise exception 'linguagem inválida' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('battle_queue'));
  select * into i from public.battle_invites where code = upper(trim(coalesce(p_code, ''))) and rematch_of is null for update;
  if i.code is null then
    return jsonb_build_object('ok', false, 'error', 'Convite não encontrado. Confira o código.');
  end if;
  if i.host_id = v_uid then
    return jsonb_build_object('ok', false, 'error', 'Este convite é seu. Envie o código para outra pessoa.');
  end if;
  if i.status <> 'aberto' then
    return jsonb_build_object('ok', false, 'error', case when i.status = 'aceito' then 'Este convite já foi usado.' else 'Este convite foi cancelado.' end);
  end if;
  if i.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'Este convite expirou. Peça um novo.');
  end if;
  if exists (select 1 from public.battle_participants where user_id = v_uid and active) then
    return jsonb_build_object('ok', false, 'error', 'Termine a sua partida atual antes de aceitar.');
  end if;
  if exists (select 1 from public.battle_participants where user_id = i.host_id and active) then
    return jsonb_build_object('ok', false, 'error', 'Quem convidou está em outra partida agora. Tente daqui a pouco.');
  end if;
  v_match := public.battle_create_match(i.host_id, i.host_lang, v_uid, p_lang, 'amistosa');
  update public.battle_invites set status = 'aceito', guest_id = v_uid, guest_lang = p_lang, match_id = v_match where code = i.code;
  return jsonb_build_object('ok', true, 'match_id', v_match);
end;
$$;

create or replace function public.battle_invite_cancel()
returns void
language sql security definer set search_path = '' as $$
  update public.battle_invites set status = 'cancelado' where host_id = auth.uid() and status = 'aberto' and rematch_of is null;
$$;

-- ---------------------------------------------------------------------------
-- Estado da partida: + tipo, revisão (só no fim), meu código final e revanche
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

  -- Sinal de vida (também depois do fim: serve para saber se a pessoa topa revanche).
  update public.battle_participants set
    last_seen = now(),
    activity = case when not active or activity = 'desistiu' then activity when p_activity in ('conectado', 'resolvendo') then p_activity else activity end
  where match_id = p_match and user_id = v_uid;
  perform public.battle_resolve(p_match);

  select * into m from public.battle_matches where id = p_match;
  select * into me from public.battle_participants where match_id = p_match and user_id = v_uid;
  select * into opp from public.battle_participants where match_id = p_match and user_id <> v_uid;
  v_done := m.status in ('finalizada', 'cancelada');
  v_started := now() >= m.starts_at;

  return jsonb_build_object(
    'match_id', m.id,
    'kind', m.kind,
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
    -- Revisão educativa: só depois do fim.
    'review', case when v_done then (select c.review_data from public.battle_challenges c where c.id = m.challenge_id) end,
    'me', jsonb_build_object('lang', me.lang, 'trophies_before', me.trophies_before, 'trophy_delta', me.trophy_delta,
      'final_code', case when v_done then (select s.code from public.battle_submissions s where s.match_id = p_match and s.user_id = v_uid order by (s.status = 'aceito') desc, s.submitted_at desc limit 1) end),
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
        'final_code', case when v_done then (select s.code from public.battle_submissions s where s.match_id = p_match and s.user_id = opp.user_id order by (s.status = 'aceito') desc, s.submitted_at desc limit 1) end,
        'final_accepted', case when v_done then exists (select 1 from public.battle_submissions s where s.match_id = p_match and s.user_id = opp.user_id and s.status = 'aceito') end
      )
      from public.profiles p where p.id = opp.user_id
    ),
    'my_submissions', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'status', s.status, 'passed', s.passed, 'total', s.total, 'message', s.message, 'submitted_at', s.submitted_at) order by s.id)
      from public.battle_submissions s where s.match_id = p_match and s.user_id = v_uid
    ), '[]'::jsonb),
    'rematch', case when v_done then public.battle_rematch_info(p_match, v_uid) end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Histórico com mais detalhes (troca o formato do retorno)
-- ---------------------------------------------------------------------------
drop function if exists public.battle_history(integer);
create function public.battle_history(p_limit integer default 20)
returns table (match_id uuid, finished_at timestamptz, challenge_title text, arena_name text, my_lang text, opponent_name text, opponent_username text,
  opponent_lang text, outcome text, result text, trophy_delta integer, kind text, challenge_id text, tier integer, solved boolean,
  submissions integer, solve_sec integer)
language sql stable security definer set search_path = '' as $$
  select m.id, m.finished_at, c.title, a.name, me.lang,
    coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
    case when p.is_public then p.username end,
    opp.lang,
    case when m.winner_id is null then 'empate' when m.winner_id = auth.uid() then 'vitoria' else 'derrota' end,
    m.result, me.trophy_delta, m.kind, c.id, c.tier,
    exists (select 1 from public.battle_submissions s where s.match_id = m.id and s.user_id = me.user_id and s.status = 'aceito'),
    (select count(*)::integer from public.battle_submissions s where s.match_id = m.id and s.user_id = me.user_id),
    (select floor(extract(epoch from min(s.submitted_at) - m.starts_at))::integer from public.battle_submissions s
      where s.match_id = m.id and s.user_id = me.user_id and s.status = 'aceito')
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

-- ---------------------------------------------------------------------------
-- Eventos: placar calculado das partidas ranqueadas do período
-- ---------------------------------------------------------------------------
create or replace function public.battle_event_summary(p_event integer, p_limit integer default 10)
returns jsonb
language sql stable security definer set search_path = '' as $$
  with e as (select * from public.battle_events where id = p_event),
  ms as (
    select m.* from public.battle_matches m join public.battle_challenges c on c.id = m.challenge_id, e
    where m.kind = 'ranqueada' and m.status = 'finalizada' and m.starts_at >= e.starts_at and m.starts_at < e.ends_at and c.tier = any (e.tiers)
  ),
  scores as (
    select bp.user_id,
      case (select metric from e)
        when 'vitorias' then count(*) filter (where ms.winner_id = bp.user_id)
        when 'resolvidos' then count(*) filter (where exists (select 1 from public.battle_submissions s where s.match_id = ms.id and s.user_id = bp.user_id and s.status = 'aceito'))
        else min((select floor(extract(epoch from min(s.submitted_at) - ms.starts_at)) from public.battle_submissions s where s.match_id = ms.id and s.user_id = bp.user_id and s.status = 'aceito'))
      end::integer as score
    from ms join public.battle_participants bp on bp.match_id = ms.id
    group by bp.user_id
  ),
  ranked as (
    select s.user_id, s.score,
      rank() over (order by case when (select metric from e) = 'velocidade' then s.score else -s.score end) as pos
    from scores s where s.score is not null and (s.score > 0 or (select metric from e) = 'velocidade')
  )
  select jsonb_build_object(
    'event', (select jsonb_build_object('id', id, 'slug', slug, 'name', name, 'description', description, 'metric', metric, 'tiers', tiers, 'starts_at', starts_at, 'ends_at', ends_at) from e),
    'participants', (select count(*) from ranked),
    'leaders', coalesce((
      select jsonb_agg(jsonb_build_object('rank', r.pos, 'name', coalesce(nullif(p.display_name, ''), 'Dev anônimo'),
        'username', case when p.is_public then p.username end, 'avatar_url', p.avatar_url, 'score', r.score, 'is_me', r.user_id = auth.uid()) order by r.pos)
      from (select * from ranked order by pos limit least(greatest(coalesce(p_limit, 10), 1), 50)) r join public.profiles p on p.id = r.user_id
      where p.show_in_ranking or r.user_id = auth.uid()
    ), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', r.pos, 'score', r.score) from ranked r where r.user_id = auth.uid())
  )
  where exists (select 1 from e);
$$;

-- ---------------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------------
revoke all on function
  public.battle_new_code(), public.battle_pick_challenge(integer, uuid, uuid), public.battle_create_match(uuid, text, uuid, text, text, uuid),
  public.battle_join_queue(text), public.battle_finish(uuid, uuid, text), public.battle_available(uuid, uuid), public.battle_rematch_info(uuid, uuid),
  public.battle_rematch(uuid, text), public.battle_invite_create(text), public.battle_invite_mine(), public.battle_invite_peek(text),
  public.battle_invite_accept(text, text), public.battle_invite_cancel(), public.battle_state(uuid, text), public.battle_history(integer),
  public.battle_event_summary(integer, integer)
  from public, anon, authenticated;

grant execute on function public.battle_join_queue(text), public.battle_state(uuid, text), public.battle_history(integer), public.battle_rematch(uuid, text),
  public.battle_invite_create(text), public.battle_invite_mine(), public.battle_invite_peek(text), public.battle_invite_accept(text, text),
  public.battle_invite_cancel() to authenticated;
grant execute on function public.battle_event_summary(integer, integer) to anon, authenticated;
