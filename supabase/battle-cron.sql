-- Varredura automática da Batalha de Código (só no Supabase; o PGlite dos testes não tem pg_cron).
-- Fecha partidas cujo tempo acabou mesmo que os dois jogadores tenham fechado o site,
-- e limpa a fila de quem saiu sem cancelar.
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'battle-sweep';
select cron.schedule('battle-sweep', '30 seconds', 'select public.battle_sweep()');
