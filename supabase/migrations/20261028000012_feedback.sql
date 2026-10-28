-- Relatos dos alunos (problemas, respostas erradas, aulas confusas, sugestões, jogos e batalhas).
-- Só entram pela função submit_feedback; ninguém lê pelo site (o dono lê no painel do Supabase).
-- Sem dados pessoais obrigatórios: com login, guarda só o id da conta (para limitar abuso).
-- Limites: 5 relatos por hora e 20 por dia por conta; sem login, 20 por hora no site todo.

create table public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles (id) on delete set null,
  category text not null check (category in ('problema_tecnico', 'resposta_errada', 'aula_confusa', 'sugestao_conteudo', 'jogo_ou_batalha', 'outro')),
  message text not null check (char_length(message) between 10 and 2000),
  page text check (page is null or (char_length(page) <= 200 and page ~ '^/[A-Za-z0-9/_?=&.#%-]*$')),
  status text not null default 'novo' check (status in ('novo', 'lido', 'resolvido'))
);
create index feedback_user_idx on public.feedback (user_id, created_at);
create index feedback_created_idx on public.feedback (created_at);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

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

  -- Uma checagem de limite por vez (evita passar do limite com envios simultâneos).
  perform pg_advisory_xact_lock(hashtext('submit_feedback'), hashtext(coalesce(v_uid::text, 'anon')));
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
