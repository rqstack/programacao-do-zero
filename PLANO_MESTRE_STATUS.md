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

## Próximo passo exato
Fase 3: seção do ebook na página inicial (link https://o-proximo-nivel-da-programacao.vercel.app/).
