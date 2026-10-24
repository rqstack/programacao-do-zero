-- Varredura automática da Batalha de Código (só no Supabase; o PGlite dos testes não tem pg_cron).
-- Fecha partidas cujo tempo acabou mesmo que os dois jogadores tenham fechado o site,
-- e limpa a fila de quem saiu sem cancelar.
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'battle-sweep';
select cron.schedule('battle-sweep', '30 seconds', 'select public.battle_sweep()');

-- O pg_cron guarda o histórico de cada execução (cerca de 2.880 linhas/dia com a varredura
-- a cada 30 s). Para não ocupar o espaço do plano gratuito, apaga o que tiver mais de 7 dias.
select cron.unschedule(jobid) from cron.job where jobname = 'cron-history-cleanup';
select cron.schedule('cron-history-cleanup', '17 3 * * *', $$delete from cron.job_run_details where end_time < now() - interval '7 days'$$);
