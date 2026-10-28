-- Relatos: um clique duplo (ou reenvio da rede) gravava o mesmo relato duas vezes.
-- Agora, o mesmo texto da mesma pessoa (ou sem login) em até 2 minutos é aceito sem gravar
-- de novo. A trava por pessoa já existente garante que o segundo pedido vê o primeiro.
-- Só substitui a função (mesmos parâmetros e permissões); nenhum dado muda.
create or replace function public.submit_feedback(p_category text, p_message text, p_page text default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_msg text := trim(coalesce(p_message, ''));
  v_page text := nullif(trim(coalesce(p_page, '')), '');
begin
  if p_category not in ('problema_tecnico', 'resposta_errada', 'aula_confusa', 'sugestao_conteudo', 'jogo_ou_batalha', 'outro') then
    return jsonb_build_object('ok', false, 'error', 'Escolha o tipo do relato.');
  end if;
  if char_length(v_msg) < 10 then
    return jsonb_build_object('ok', false, 'error', 'Conte um pouco mais (pelo menos 10 caracteres).');
  end if;
  if char_length(v_msg) > 2000 then
    return jsonb_build_object('ok', false, 'error', 'O relato pode ter até 2000 caracteres.');
  end if;
  if v_page is not null and (char_length(v_page) > 200 or v_page !~ '^/[A-Za-z0-9/_?=&.#%-]*$') then
    v_page := null;
  end if;
  perform pg_advisory_xact_lock(hashtext('submit_feedback'), hashtext(coalesce(v_uid::text, 'anon')));
  -- Mesmo relato enviado de novo em pouco tempo: confirma sem duplicar.
  if exists (
    select 1 from public.feedback
    where user_id is not distinct from v_uid and message = v_msg and category = p_category and created_at > now() - interval '2 minutes'
  ) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  if v_uid is not null then
    if (select count(*) from public.feedback where user_id = v_uid and created_at > now() - interval '1 hour') >= 5
       or (select count(*) from public.feedback where user_id = v_uid and created_at > now() - interval '1 day') >= 20 then
      return jsonb_build_object('ok', false, 'error', 'Você já enviou vários relatos agora. Tente de novo mais tarde.');
    end if;
    insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;
  elsif (select count(*) from public.feedback where user_id is null and created_at > now() - interval '1 hour') >= 20 then
    return jsonb_build_object('ok', false, 'error', 'Muitos relatos sem login agora. Entre com o Google ou tente mais tarde.');
  end if;
  insert into public.feedback (user_id, category, message, page) values (v_uid, p_category, v_msg, v_page);
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_feedback(text, text, text) from public, anon, authenticated;
grant execute on function public.submit_feedback(text, text, text) to anon, authenticated;
