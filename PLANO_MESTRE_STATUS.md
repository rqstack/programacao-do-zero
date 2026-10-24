# Plano Mestre — acompanhamento

Arquivo para retomar o trabalho se a sessão acabar. Sem segredos aqui.
Legenda: ✅ concluído e testado · 🟡 implementado, teste incompleto · ⛔ bloqueado por configuração externa · ⬜ não implementado

## Auditoria (2026-10-23)

- Stack: Next.js 16 (export estático) no GitHub Pages; Supabase Free (Auth, Postgres, Edge Functions, pg_cron) projeto `kaylnsleygeysszomudd`; Judge0 público para a Batalha.
- Auth: só Google via Supabase (PKCE). Provedores ligados hoje no Supabase: **apenas e-mail**. Google **desligado** → causa do erro `provider is not enabled`.
- Banco: migrations 001–005 aplicadas; tabelas com RLS; XP só via `award_xp`.

## Fase 1 — Login com Google

- ⛔ Provedor Google desligado no painel. Código já usa `provider: "google"` corretamente. **Ação do dono:** docs/CONFIGURACAO.md, passos 3–4.
- ✅ Site agora checa `/auth/v1/settings` antes de redirecionar e mostra aviso claro; volta do Google com `?error=` mostra mensagem (testado no navegador).
- ⬜ Teste completo (login, refresh, logout, novo login) — depende do provedor ativo.

## Fase 2 — Trilha Node.js
- ✅ 3 módulos e 8 aulas aparecem (navegador). Exercício testado: errado recusado, certo aceito, XP uma vez.
- ✅ Código × banco idênticos: 288 atividades, mesma impressão md5; 0 eventos órfãos, 0 duplicados, 0 usuários (ninguém conseguiu logar ainda).
- ✅ Exemplos executados de verdade (Express 5.3, Zod 4.6): servidor node:http (201/400/404), Express + log, CRUD, erros/CORS e os 3 testes `node --test` passam.

## Fase 3 — Ebook
- ✅ Seção na home (antes do FAQ) com os textos pedidos, capa oficial copiada do site do ebook (`public/ebook-capa.webp`), botão para o link oficial em nova aba. Conferido no celular e desktop, sem rolagem lateral.

## Fase 4 — Apoio via Pix (Syncpay)
- 🟡 Implementado e publicado **desligado** (Edge Function `support-pix`, tabela `support_donations`, página `/apoiar`, link no rodapé). Detalhes e tarifas: docs/APOIO_PIX.md.
- ✅ Testado com Syncpay simulada (15 testes) + banco (3) + navegador.
- ⛔ Ativação depende de: conta Syncpay aprovada, confirmar exigência de IP fixo, secrets no Supabase, webhook cadastrado.

## Fase 5 — Batalha de Código
- ✅ Em produção: pg_cron rodando (6.302 execuções, 0 falhas), 20 desafios, 6 arenas. Adicionada limpeza diária do histórico do cron (evita estourar o plano gratuito).
- ⛔ Teste com duas contas reais depende do login Google ativo. Testes locais/E2E com Judge0 real: OK (ver docs/BATALHA.md).

## Fase 6 — Trilhas
Inventário existente: Lógica (15), HTML (8), CSS (9), JavaScript (12, inclui Promises/fetch), Git (7), TypeScript (6), React (8), Node/APIs (8).
- ✅ Modelagem de Dados (8 aulas) — blocos SQL executados no PGlite; comportamentos (FK, índice parcial) conferidos.
- ✅ SQL e Banco de Dados (8 aulas) — blocos SQL executados e números das explicações conferidos (1 erro corrigido).
- Teste novo: todo bloco ```sql de qualquer trilha roda no PGlite.
- ✅ Supabase, autenticação e segurança (7 aulas) — exemplos de RLS e funções executados com dois usuários (tests/db/lessons-supabase.test.ts).
- Banco de produção sincronizado: 360 atividades.
- ⬜ Pendentes: Supabase/Auth/Segurança, Testes e Depuração, Deploy e Variáveis de Ambiente, Full Stack, Java e OO, IA aplicada, Portfólio/Carreira, (JS assíncrono dedicado — hoje coberto por 1 aula na trilha JavaScript), AWS, Canvas.

## Como sincronizar o XP de uma trilha nova
`npx tsx scripts/seed-for-course.mts <slug>` gera o SQL; aplique no SQL Editor (ou MCP). Conferir com `select count(*) from xp_sources` = total do `npm run db:seed`.

## Próximo passo exato
Escrever as trilhas Testes e Depuração (slug `testes-e-depuracao`) e Deploy (slug `deploy-e-hospedagem`).
