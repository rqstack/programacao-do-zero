-- Missões (8 chaves de XP). Aplicado em produção em 28/10/2026, com autorização.
-- Igual à migração 20261027000009_missoes.sql + as linhas das missões do seed. Idempotente.
begin;
alter table public.xp_sources drop constraint xp_sources_key_check;
alter table public.xp_sources add constraint xp_sources_key_check
  check (key ~ '^(lesson|exercise|quiz|game|project|practice|challenge|mission):[a-z0-9]+(-[a-z0-9]+)*$');
insert into public.xp_sources (key, amount, label) values
  ('mission:primeiros-passos', 30, 'Missão: Primeiros passos'),
  ('mission:explorador', 30, 'Missão: Explorador'),
  ('mission:estudante-dedicado', 30, 'Missão: Estudante dedicado'),
  ('mission:cacador-de-bugs', 40, 'Missão: Caçador de bugs'),
  ('mission:desafiante', 50, 'Missão: Desafiante'),
  ('mission:construtor', 50, 'Missão: Construtor'),
  ('mission:revisor', 50, 'Missão: Revisor'),
  ('mission:semana-de-estudo', 50, 'Missão: Semana de estudo')
on conflict (key) do update set amount = excluded.amount, label = excluded.label;
commit;
