-- XP com limite de ritmo por pessoa.
--
-- Problema corrigido: award_xp aceitava qualquer lista de atividades cadastradas de uma vez,
-- então quem chamasse a função direto (sem usar o site) conseguia todo o XP do site num
-- único pedido e subir no ranking. As respostas de aulas e quizzes são conferidas no
-- navegador e o conteúdo é público, então o banco não tem como provar que alguém estudou;
-- o que ele garante é:
--   * só atividades cadastradas, com o valor do banco, uma vez por pessoa (como antes);
--   * no máximo 1.200 XP por dia (horário de Brasília) e 400 XP a cada 10 minutos;
--   * as atividades entram na ordem em que vieram (o site manda da mais antiga para a mais
--     nova); o que passar do limite fica para depois e entra quando o site sincronizar de novo;
--   * pedidos simultâneos da mesma pessoa são processados um de cada vez (trava por usuário),
--     então não dá para furar o limite disparando vários pedidos ao mesmo tempo.
-- Nada é apagado: o XP já registrado continua igual.

create or replace function public.award_xp(p_keys text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_day_cap constant integer := 1200;
  c_burst_cap constant integer := 400;
  c_burst_window constant interval := interval '10 minutes';
  v_uid uuid := auth.uid();
  v_total integer;
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_day_start timestamptz := (v_today::timestamp) at time zone 'America/Sao_Paulo';
  v_budget integer;
  v_key text;
  v_day date;
  v_src record;
begin
  if v_uid is null then
    raise exception 'login necessário' using errcode = '42501';
  end if;
  if p_keys is null or cardinality(p_keys) > 1000 then
    raise exception 'lista de atividades inválida' using errcode = '22023';
  end if;

  -- Um pedido por vez para cada pessoa.
  perform pg_advisory_xact_lock(hashtext('award_xp'), hashtext(v_uid::text));

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

  select least(
           c_day_cap - coalesce(sum(e.amount) filter (where e.created_at >= v_day_start), 0),
           c_burst_cap - coalesce(sum(e.amount) filter (where e.created_at >= now() - c_burst_window), 0)
         )::integer
    into v_budget
    from public.xp_events e
   where e.user_id = v_uid;

  for v_src in
    select s.key, s.amount
      from public.xp_sources s
     where s.key = any (p_keys)
       and not exists (select 1 from public.xp_events e where e.user_id = v_uid and e.source_key = s.key)
     order by array_position(p_keys, s.key), s.key
  loop
    exit when v_budget <= 0;
    continue when v_src.amount > v_budget;
    insert into public.xp_events (user_id, source_key, amount)
    values (v_uid, v_src.key, v_src.amount)
    on conflict (user_id, source_key) do nothing;
    if found then
      v_budget := v_budget - v_src.amount;
    end if;
  end loop;

  select coalesce(sum(amount), 0)::integer into v_total from public.xp_events where user_id = v_uid;
  return v_total;
end;
$$;

revoke all on function public.award_xp(text[]) from public, anon;
grant execute on function public.award_xp(text[]) to authenticated;
