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
insert into public.battle_events (id, slug, name, description, metric, tiers, starts_at, ends_at) values
  (1, 'semana-das-condicionais', 'Semana das condicionais', 'Partidas do Terminal Inicial: if, else e comparações. Vence quem somar mais vitórias.', 'vitorias', '{1}', '2026-10-26T00:00:00-03:00', '2026-11-02T00:00:00-03:00'),
  (2, 'desafio-dos-lacos', 'Desafio dos laços', 'Partidas do Vale dos Laços. Conta cada partida em que você teve uma solução aceita, mesmo que o outro tenha sido mais rápido.', 'resolvidos', '{2}', '2026-11-02T00:00:00-03:00', '2026-11-09T00:00:00-03:00'),
  (3, 'evento-de-velocidade', 'Evento de velocidade', 'Qualquer arena. Vale o seu menor tempo entre o início da partida e a primeira solução aceita.', 'velocidade', '{1,2,3,4,5,6,7,8,9}', '2026-11-09T00:00:00-03:00', '2026-11-16T00:00:00-03:00'),
  (4, 'semana-das-listas', 'Semana das listas', 'Biblioteca das Listas e Fábrica de Funções: arrays, funções e manipulação de dados. Conta partidas resolvidas.', 'resolvidos', '{3,4}', '2026-11-16T00:00:00-03:00', '2026-11-23T00:00:00-03:00'),
  (5, 'semana-de-algoritmos', 'Semana de algoritmos', 'Torre dos Algoritmos e Núcleo do Kernel. Vence quem somar mais vitórias.', 'vitorias', '{5,6}', '2026-11-23T00:00:00-03:00', '2026-11-30T00:00:00-03:00'),
  (6, 'desafio-de-logica', 'Desafio de lógica', 'Todas as arenas. Conta cada partida em que você teve uma solução aceita.', 'resolvidos', '{1,2,3,4,5,6,7,8,9}', '2026-11-30T00:00:00-03:00', '2026-12-07T00:00:00-03:00'),
  (7, 'semana-dos-grafos', 'Semana dos grafos', 'Labirinto dos Grafos: grades, buscas e conexões. Conta partidas resolvidas.', 'resolvidos', '{7}', '2026-12-07T00:00:00-03:00', '2026-12-14T00:00:00-03:00'),
  (8, 'semana-da-memoria', 'Semana da memória', 'Câmara da Memória e Trono do Compilador: programação dinâmica e otimização. Vence quem somar mais vitórias.', 'vitorias', '{8,9}', '2026-12-14T00:00:00-03:00', '2026-12-21T00:00:00-03:00')
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, metric = excluded.metric,
  tiers = excluded.tiers, starts_at = excluded.starts_at, ends_at = excluded.ends_at;
commit;
