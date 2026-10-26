# Plano Mestre — acompanhamento

Arquivo para retomar o trabalho se a sessão acabar. Sem segredos aqui.
Legenda: ✅ concluído e testado · 🟡 implementado, teste incompleto · ⛔ bloqueado por configuração externa · ⬜ não implementado

## Auditoria (2026-10-23)

- Stack: Next.js 16 (export estático) no GitHub Pages; Supabase Free (Auth, Postgres, Edge Functions, pg_cron) projeto `kaylnsleygeysszomudd`; Judge0 público para a Batalha.
- Auth: só Google via Supabase (PKCE). Google **ligado** em 25/10/2026.
- Banco: migrations 001–005 aplicadas; tabelas com RLS; XP só via `award_xp`.

## Fase 1 — Login com Google

- ✅ Provedor Google ligado (25/10/2026): cliente OAuth criado no Google Cloud, app publicado, Site URL e Redirect URLs no Supabase. Páginas /privacidade e /termos criadas (exigidas pelo Google).
- ✅ Site agora checa `/auth/v1/settings` antes de redirecionar e mostra aviso claro; volta do Google com `?error=` mostra mensagem (testado no navegador).
- ✅ Login real testado no site publicado: volta do Google com sessão ativa (provider google), conta e perfil criados no banco. ⬜ Ainda não testados: logout e novo login.

## Fase 2 — Trilha Node.js
- ✅ 3 módulos e 8 aulas aparecem (navegador). Exercício testado: errado recusado, certo aceito, XP uma vez.
- ✅ Código × banco idênticos: 288 atividades, mesma impressão md5; 0 eventos órfãos, 0 duplicados, 0 usuários (ninguém conseguiu logar ainda).
- ✅ Exemplos executados de verdade (Express 5.3, Zod 4.6): servidor node:http (201/400/404), Express + log, CRUD, erros/CORS e os 3 testes `node --test` passam.

## Fase 3 — Ebook
- ✅ Seção na home (antes do FAQ) com os textos pedidos, capa oficial copiada do site do ebook (`public/ebook-capa.webp`), botão para o link oficial em nova aba. Conferido no celular e desktop, sem rolagem lateral.

## Fase 4 — Apoio via Pix (Syncpay)
- ✅ Ativo desde 25/10/2026 (Edge Function `support-pix`, tabela `support_donations`, página `/apoiar`). Secrets e webhook configurados; função responde `enabled: true` e recusa webhook sem token. ⬜ Falta um Pix real de teste feito pelo dono.
- ✅ Testado com Syncpay simulada (15 testes) + banco (3) + navegador.
- ⛔ Ativação depende de: conta Syncpay aprovada, confirmar exigência de IP fixo, secrets no Supabase, webhook cadastrado.

## Fase 5 — Batalha de Código
- ✅ Em produção: pg_cron rodando (6.302 execuções, 0 falhas), 20 desafios, 6 arenas. Adicionada limpeza diária do histórico do cron (evita estourar o plano gratuito).
- ⬜ Teste com duas contas reais: login já funciona, falta o dono jogar com uma segunda conta. Testes locais/E2E com Judge0 real: OK (ver docs/BATALHA.md).

## Fase 6 — Trilhas
Inventário existente: Lógica (15), HTML (8), CSS (9), JavaScript (12, inclui Promises/fetch), Git (7), TypeScript (6), React (8), Node/APIs (8).
- ✅ Modelagem de Dados (8 aulas) — blocos SQL executados no PGlite; comportamentos (FK, índice parcial) conferidos.
- ✅ SQL e Banco de Dados (8 aulas) — blocos SQL executados e números das explicações conferidos (1 erro corrigido).
- Teste novo: todo bloco ```sql de qualquer trilha roda no PGlite.
- ✅ Supabase, autenticação e segurança (7 aulas) — exemplos de RLS e funções executados com dois usuários (tests/db/lessons-supabase.test.ts).
- ✅ Testes, depuração e qualidade (6 aulas) — exemplos rodados com Vitest (20 testes passando); 2 imprecisões minhas corrigidas.
- ✅ Deploy, hospedagem e variáveis de ambiente (6 aulas) — exemplos Node executados (config falha cedo, /saude responde).
- ✅ Full Stack com projetos (6 aulas) — limitador de tentativas da aula executado (200,200,200,429,429).
- ✅ Java e Orientação a Objetos (7 aulas) — os 7 programas compilados e executados no Judge0 (JDK 17), saídas conferidas (scripts/check-java-blocks.mts).
- ✅ IA aplicada à programação (6 aulas, inclui n8n e "praticar com IA sem depender dela") — exemplos JS (classificador com Zod e nó Code do n8n) executados no Node.
- ✅ Portfólio, Currículo, GitHub e Entrevistas (`carreira`, 6 aulas).
- Banco de produção sincronizado: 477 atividades.
- ⬜ Opcionais: (JS assíncrono dedicado — hoje coberto por 1 aula na trilha JavaScript), AWS, Canvas.

## Como sincronizar o XP de uma trilha nova
`npx tsx scripts/seed-for-course.mts <slug>` gera o SQL; aplique no SQL Editor (ou MCP). Conferir com `select count(*) from xp_sources` = total do `npm run db:seed`.

## Próximo passo exato
Ação do dono no painel: rotacionar o segredo do webhook na Syncpay (pelo Chrome, onde o copiar funciona) e salvar em SYNCPAY_WEBHOOK_TOKEN no Supabase. Depois, fazer um Pix de R$ 5 de teste e conferir a aba "Entregas" do webhook na Syncpay.

## Sessão 26/10/2026 (publicada com autorização)
- ✅ Trilhas Python (8 aulas), C# (7) e AWS (7). Exemplos de Python e C# executados localmente (scripts/check-local-blocks.mts); WinForms/WPF, EF Core e comandos AWS marcados como não executados.
- ✅ XP com limite de ritmo no banco (400/10 min, 1.200/dia) + testes. Aplicado em produção em 26/10/2026.
- ✅ Webhook Pix: tolera espaços no token e acha a doação pelo pix_code; navegador não consegue confirmar pagamento. Função support-pix publicada (v3) em 26/10/2026.

