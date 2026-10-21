-- Desafios de código: chaves challenge:<id>, com valor fixo definido em xp_sources (seed.sql).
alter table public.xp_sources drop constraint xp_sources_key_check;
alter table public.xp_sources add constraint xp_sources_key_check
  check (key ~ '^(lesson|exercise|quiz|game|project|practice|challenge):[a-z0-9]+(-[a-z0-9]+)*$');
