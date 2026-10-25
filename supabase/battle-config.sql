-- GERADO AUTOMATICAMENTE por scripts/generate-battle-config.mts a partir de
-- supabase/functions/_shared/battle-core.ts — não edite à mão. Rode depois das migrations.
begin;
insert into public.battle_arenas (id, slug, name, min_trophies, tier, duration_sec, win, loss, floor_protected) values
  (1, 'terminal-inicial', 'Terminal Inicial', 0, 1, 180, 30, 0, true),
  (2, 'vale-dos-lacos', 'Vale dos Laços', 150, 2, 210, 30, 10, true),
  (3, 'biblioteca-das-listas', 'Biblioteca das Listas', 400, 3, 240, 30, 15, false),
  (4, 'fabrica-de-funcoes', 'Fábrica de Funções', 800, 4, 270, 30, 20, false),
  (5, 'torre-dos-algoritmos', 'Torre dos Algoritmos', 1300, 5, 300, 30, 25, false),
  (6, 'nucleo-do-kernel', 'Núcleo do Kernel', 2000, 6, 330, 30, 30, false),
  (7, 'labirinto-dos-grafos', 'Labirinto dos Grafos', 2800, 7, 420, 30, 35, false),
  (8, 'camara-da-memoria', 'Câmara da Memória', 3700, 8, 480, 30, 40, false),
  (9, 'trono-do-compilador', 'Trono do Compilador', 4800, 9, 540, 30, 45, false)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, min_trophies = excluded.min_trophies, tier = excluded.tier,
  duration_sec = excluded.duration_sec, win = excluded.win, loss = excluded.loss, floor_protected = excluded.floor_protected;
insert into public.battle_rules (id, countdown_sec, diff_step, diff_cap, abandon_extra_loss, abandon_after_sec, max_submissions,
  min_seconds_between, max_code_bytes, judge_grace_sec, window_base, window_per_sec, queue_stale_sec) values
  (true, 5, 25, 10, 5, 45, 12, 5, 20000, 60, 100, 20, 20)
on conflict (id) do update set countdown_sec = excluded.countdown_sec, diff_step = excluded.diff_step, diff_cap = excluded.diff_cap,
  abandon_extra_loss = excluded.abandon_extra_loss, abandon_after_sec = excluded.abandon_after_sec, max_submissions = excluded.max_submissions,
  min_seconds_between = excluded.min_seconds_between, max_code_bytes = excluded.max_code_bytes, judge_grace_sec = excluded.judge_grace_sec,
  window_base = excluded.window_base, window_per_sec = excluded.window_per_sec, queue_stale_sec = excluded.queue_stale_sec;
insert into public.battle_seasons (id, name, starts_at, ends_at) values
  (1, 'Temporada 1 · Out–Dez 2026', '2026-10-01T00:00:00-03:00', '2027-01-01T00:00:00-03:00'),
  (2, 'Temporada 2 · Jan–Mar 2027', '2027-01-01T00:00:00-03:00', '2027-04-01T00:00:00-03:00'),
  (3, 'Temporada 3 · Abr–Jun 2027', '2027-04-01T00:00:00-03:00', '2027-07-01T00:00:00-03:00'),
  (4, 'Temporada 4 · Jul–Set 2027', '2027-07-01T00:00:00-03:00', '2027-10-01T00:00:00-03:00')
on conflict (id) do update set name = excluded.name, starts_at = excluded.starts_at, ends_at = excluded.ends_at;
commit;
