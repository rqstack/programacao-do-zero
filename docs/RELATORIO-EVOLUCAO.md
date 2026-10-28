# Relatório da evolução (fases 1 a 5)

Situação em 28/10/2026: **publicado.** As 4 migrações foram aplicadas em produção e o site foi publicado, com autorização do dono.

## 1. Funcionalidades novas

| Área | O que foi feito | Onde |
| --- | --- | --- |
| Jogos | Fases novas a cada partida nos 9 jogos (geradas na hora + cadastradas), mesma pontuação e XP | `src/lib/games/generate.ts` |
| Busca global | Aulas, trilhas, quizzes, jogos, projetos, desafios e glossário, sem acento, índice do build | `/busca`, `src/lib/search/query.ts` |
| Favoritos e anotações | Por categoria; anotações por aula com editar/apagar; privadas (RLS) | `/salvos`, `src/components/learn/*` |
| Revisão dos erros | Refazer perguntas erradas, explicações, assuntos com mais erros, evolução semanal | `/revisao` |
| Tutor sem IA | Ajuda em 4 etapas no exercício, diagnóstico sem entregar a resposta, explicação de mensagens de erro | `src/lib/tutor/tutor.ts` |
| Missões | 9 missões com progresso; XP uma vez por chave `mission:*` | `src/lib/progress/missions.ts` |
| Metas semanais | Escolhidas pela pessoa; segunda a domingo; sem penalidade | `src/lib/progress/weekly.ts` |
| Batalha | Convite por código (15 min), revanche, partidas amistosas sem troféus, histórico com estatísticas, revisão pós-partida, sorteio sem repetição recente, eventos semanais | `supabase/migrations/20261027000010_batalha_amigos.sql`, `src/components/battle/*` |
| Minha trilha | 4 perguntas opcionais, sequência com trilhas reais na ordem dos pré-requisitos | `/comecar`, `content/paths.ts` |
| Dificuldade adaptativa | Reforço, desafio do nível certo e próximo assunto, sem usar tempo | `src/lib/path/adaptive.ts` |
| Portfólio público | Opcional, privado para contas novas, seções escolhidas, só dados registrados no servidor | `/u`, `20261028000011_portfolio.sql` |
| Relatos dos alunos | Formulário sem dados pessoais, com limite e validação no banco; só o dono lê | `/feedback`, `20261028000012_feedback.sql` |

## 2. Melhorias no que já existia

- Página inicial: para quem é, índice organizado com números reais, seção da Batalha com as 9 arenas.
- Ícones lucide no lugar de emojis nos jogos; texto dos Desafios corrigido (11 linguagens).
- Contraste AA: `subtle` e o azul dos botões ajustados; hover dos botões azuis agora escurece.
- Rodapé: aviso de progresso corrigido (com login também fica na conta) e link para relatar problema.
- Sincronização com a conta também depois de mudanças sem XP (anotações, favoritos, metas).
- Desafios aceitam link direto (`/desafios?id=`).

## 3. Migrações criadas (aplicadas em produção em 28/10/2026)

Ordem de aplicação (detalhes em `supabase/producao-pendente/LEIA-ME.md`):

1. `20261027000009_missoes.sql` + `producao-pendente/2026-10-27_missoes.sql`
2. `20261027000010_batalha_amigos.sql`, depois `supabase/battle-config.sql` e `supabase/battle-challenges.sql`
3. `20261028000011_portfolio.sql`
4. `20261028000012_feedback.sql`

Nenhuma apaga ou altera dados existentes. Conferido depois: 554 atividades de XP, 8 eventos, 29 desafios com revisão, contas novas privadas, nenhuma tabela sem RLS. A revisão dos desafios foi gravada só na coluna `review_data` (o resto de `battle-challenges.sql` já estava em produção).

## 4. Testes

`npm test`: 269 testes passando (5 ignorados de propósito: os que usam a internet). Inclui:

- banco real embutido (PGlite): dois jogadores no convite e na revanche, permissões de intrusos e de visitantes, limites de relatos, portfólio privado, XP das missões;
- auditoria do esquema inteiro (`tests/db/security-audit.test.ts`): RLS em todas as tabelas, `search_path` fixo, lista fechada do que visitantes podem chamar, nenhuma escrita direta além do próprio progresso;
- regras puras: jogos (60 partidas por jogo), busca, tutor, missões, metas, trilha, adaptativo, estatísticas da Batalha, renderização da revisão pós-partida.

Também: `tsc` sem erros, ESLint sem erros, build de produção ok, 20 páginas abertas no navegador sem erro, largura de 360–375 px sem rolagem lateral.

**Não testado de verdade** (precisa das migrações em produção e de duas contas reais): convite e revanche ponta a ponta no site publicado, placar do evento com partidas reais, portfólio com dados reais e envio de relato real.

## 5. Segurança

- Corrigido: perfis nasciam **públicos**; agora contas novas nascem privadas.
- Corrigido: o perfil público mostrava uma contagem de troféus vinda do navegador; o portfólio só mostra conquistas conferíveis pelo servidor.
- Prevenido: amistosas e revanches não mexem em troféus/eventos (evita combinar resultados entre contas).
- Prevenido: revisão dos desafios só sai do banco depois do fim da partida; o arquivo de eventos foi separado para não levar as revisões ao navegador.
- Verificado: nenhum segredo no código ou no build (só a chave pública); banco privado de desafios fora do Git e do build.
- Limitação conhecida (já existia): a correção de quizzes e exercícios é no navegador, então chaves de XP podem ser pedidas sem resolver. O banco limita o ritmo (400 XP/10 min, 1.200/dia) e só aceita chaves cadastradas.

## 6. Configurações manuais pendentes

- Rotacionar o segredo do webhook da Syncpay (pendência anterior).
- Ler os relatos: Supabase → Table Editor → `feedback` (não há tela no site, de propósito).
- Perfis antigos continuam públicos; se quiser, avise os usuários ou aplique uma mudança com o consentimento deles.

## 7. Pendências e motivo

- Reformulação visual página a página (a página inicial foi feita; as demais mantêm o visual atual consistente).
- Mais desafios na Batalha: cada um precisa ser validado nas 10 linguagens no Judge0.
- Reduzir o JavaScript base (~1 MB sem compressão, ~280 KB comprimido): exigiria trocar a biblioteca de validação.
- Teste em Safari/iPhone real: não disponível neste ambiente.

## 8. Custos

Nenhum serviço pago foi adicionado. Tudo roda no que já existia: GitHub Pages, Supabase gratuito e Judge0 público.

## 9. Como publicar

1. Aplicar as migrações na ordem da seção 3.
2. `git push` para o GitHub.
3. `npm run deploy` (ou o workflow do GitHub Pages).
4. Conferir: `/batalha` (evento e convite), `/u/?n=seu_usuario` (portfólio), `/feedback` (enviar um relato de teste).
