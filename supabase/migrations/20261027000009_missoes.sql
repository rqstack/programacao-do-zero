-- Missões: aceita chaves "mission:<slug>" em xp_sources. As linhas das missões entram pelo
-- seed (npm run db:seed) ou, em produção, por supabase/producao-pendente/2026-10-27_missoes.sql.
-- Só amplia a regra de formato da chave; nenhum dado existente muda.
alter table public.xp_sources drop constraint xp_sources_key_check;
alter table public.xp_sources add constraint xp_sources_key_check
  check (key ~ '^(lesson|exercise|quiz|game|project|practice|challenge|mission):[a-z0-9]+(-[a-z0-9]+)*$');
