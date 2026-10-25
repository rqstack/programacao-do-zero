-- Batalha de Código: 6 linguagens novas (TypeScript, C++, C#, Go, Rust e PHP).
-- Só amplia as listas de linguagens aceitas; nenhum dado existente é alterado ou apagado.
-- As 3 arenas novas (7 a 9) e os desafios delas entram por supabase/battle-config.sql e
-- supabase/battle-challenges.sql, gerados do código.

create or replace function public.battle_lang_ok(p_lang text)
returns boolean
language sql immutable set search_path = '' as $$
  select p_lang in ('javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php');
$$;

alter table public.battle_queue drop constraint if exists battle_queue_lang_check;
alter table public.battle_queue add constraint battle_queue_lang_check check (public.battle_lang_ok(lang));

alter table public.battle_participants drop constraint if exists battle_participants_lang_check;
alter table public.battle_participants add constraint battle_participants_lang_check check (public.battle_lang_ok(lang));

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
