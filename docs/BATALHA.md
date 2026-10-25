# Batalha de Código — como funciona

Modo multiplayer competitivo: duas pessoas reais recebem o mesmo problema, com o mesmo tempo. Vence quem enviar primeiro uma solução **correta, conferida no servidor**. A progressão por arenas e troféus é inspirada nas partidas rápidas de jogos competitivos; nomes, visual e regras são próprios e voltados à programação.

A Batalha é **separada do XP**: nada nela lê ou altera o XP, os níveis ou o ranking de XP.

## Arquitetura

```
Navegador (GitHub Pages, site estático)
  │  RPC (supabase-js, login do Google)          POST /functions/v1/battle-submit
  ▼                                                 ▼
Supabase Postgres  ◄──── service_role ────  Edge Function battle-submit (Deno)
  fila, partidas, envios,                      gera testes ocultos, chama o Judge0,
  troféus, ranking, relógio                    compara a saída, grava o veredito
  pg_cron a cada 30 s (battle_sweep)                 │
                                                     ▼
                                          Judge0 (sandbox isolado: sem rede,
                                          limite de CPU, memória e tempo)
```

| Peça | Onde | O que faz |
| --- | --- | --- |
| Configuração central | `supabase/functions/_shared/battle-core.ts` | Arenas, troféus, tempos, limites, linguagens, gerador de código inicial nas 10 linguagens |
| Banco de desafios | `supabase/functions/_shared/battle-bank.ts` (**privado, fora do Git**) | Enunciados, geradores de testes ocultos, solução de referência e soluções de validação |
| Correção | `supabase/functions/_shared/battle-judge.ts` | Monta a entrada, chama o Judge0, decide o veredito |
| Edge Function | `supabase/functions/battle-submit/index.ts` | Autentica, registra, corrige e grava |
| Banco | `supabase/migrations/20261021000005_batalha.sql` | Tabelas, regras de vitória, fila, ranking, histórico |
| SQL gerado | `supabase/battle-config.sql`, `supabase/battle-challenges.sql` | Cópia da configuração e parte **pública** dos desafios (`npm run battle:config`) |
| Agendamento | `supabase/battle-cron.sql` | `pg_cron` fecha partidas vencidas mesmo sem ninguém conectado |
| Telas | `src/app/batalha`, `src/components/battle/*` | Entrada, linguagem, arenas, fila, sala, resultado, histórico e ranking |

### Por que não roda no navegador nem no servidor web

O navegador não pode decidir vitórias (dá para trapacear). E a Edge Function não executa o código do jogador: ela só repassa o código ao **Judge0**, que roda cada envio num sandbox isolado (`isolate`), **sem rede**, com limite de CPU (2–4 s), memória (128–256 MB) e tamanho de arquivo. Os testes são gerados na hora com uma semente aleatória a cada envio, então não dá para decorar a resposta.

### Por que o banco de desafios é privado

O repositório é público. Se as soluções estivessem no GitHub, daria para copiar no meio da partida. O arquivo real fica no `.gitignore` e só existe dentro da Edge Function. O repositório traz `battle-bank.example.ts` com 2 desafios para quem quiser montar a própria cópia.

## Linguagens

JavaScript (Node.js 22), TypeScript 5.6, Python 3.12, Java (JDK 17), C (GCC 14), C++ (GCC 14, `-O2`), C# (Mono 6.6), Go 1.18, Rust 1.85 (`-O`) e PHP 8.3, todas no Judge0. Cada desafio tem solução de referência validada em todas elas (o TypeScript reaproveita a de JavaScript).

Observações do Judge0 público: Go 1.22+ estoura o tempo de compilação (por isso a 1.18), e o TypeScript leva cerca de 2,5 s só para iniciar o ambiente (por isso o limite de CPU dele é de 8 s).

## Regras (configuráveis em `battle-core.ts`)

| Arena | Troféus | Nível | Tempo | Vitória | Derrota |
| --- | --- | --- | --- | --- | --- |
| Terminal Inicial | 0+ | variáveis, contas, condicionais | 3 min | +30 | 0 (protegida) |
| Vale dos Laços | 150+ | laços e strings | 3,5 min | +30 | −10 (não cai abaixo de 150) |
| Biblioteca das Listas | 400+ | arrays e funções | 4 min | +30 | −15 |
| Fábrica de Funções | 800+ | lógica elaborada | 4,5 min | +30 | −20 |
| Torre dos Algoritmos | 1300+ | algoritmos e estruturas | 5 min | +30 | −25 |
| Núcleo do Kernel | 2000+ | eficiência (entradas de 100 mil) | 5,5 min | +30 | −30 |
| Labirinto dos Grafos | 2800+ | grades, grafos e buscas (BFS, union-find) | 7 min | +30 | −35 |
| Câmara da Memória | 3700+ | programação dinâmica | 8 min | +30 | −40 |
| Trono do Compilador | 4800+ | otimização (O(n log n), somas de prefixo) | 9 min | +30 | −45 |

- Ganhar de quem tem mais troféus vale mais e perder para quem tem menos custa mais: ±1 troféu a cada 25 de diferença, até ±10.
- O desafio é do nível da arena de quem tem **menos** troféus (justo para iniciantes).
- **Vitória**: a primeira solução **aceita**, pela ordem de chegada ao servidor (`submitted_at`, depois o id). Se um envio anterior ainda está sendo corrigido, o banco espera por ele.
- **Errado não faz perder**: dá para reenviar (até 12 envios, 5 s entre eles, código de até 20 KB).
- **Tempo esgotado** sem solução correta: ninguém ganha nem perde troféus. Envios feitos dentro do prazo ainda são corrigidos (até 60 s de tolerância).
- **Abandono**: desistir ou ficar 45 s sem sinal = derrota, com 5 troféus a mais de penalidade.
- **Falha do corretor** (Judge0 fora do ar): o envio vira "falha técnica", não conta como erro e pode ser reenviado.
- **Reconexão**: ao voltar para /batalha, a partida ativa é retomada; o rascunho do código fica salvo no navegador.

Para mudar valores: edite `battle-core.ts`, rode `npm run battle:config` e aplique `supabase/battle-config.sql` no SQL Editor. Um teste garante que o código e o SQL estão iguais, e outro compara a regra de troféus do banco com a do TypeScript.

## Segurança

- Todas as tabelas da Batalha têm RLS e **nenhuma** permissão direta para o navegador; tudo passa por funções.
- Só a Edge Function (service_role) registra envios e grava vereditos. O navegador não consegue chamar essas funções (teste automatizado).
- Toda mudança numa partida trava a linha dela (`FOR UPDATE`) e a fila usa trava global (`pg_advisory_xact_lock`), então envios simultâneos e pedidos repetidos não criam resultados duplicados nem duas partidas.
- O código do adversário só é revelado depois do fim. O enunciado só aparece quando a contagem termina, para os dois ao mesmo tempo.
- O relógio é o do banco; o navegador só exibe a contagem (corrigindo a diferença de relógio).

## Configuração necessária

Já feito no projeto `kaylnsleygeysszomudd`: migração, configuração, desafios, `pg_cron` e Edge Function `battle-submit`.

Secrets opcionais da Edge Function (Supabase → Edge Functions → battle-submit → Secrets):

| Variável | Para quê |
| --- | --- |
| `JUDGE0_URL` | Padrão `https://ce.judge0.com` (instância pública gratuita, com limite de uso). Para produção, use uma instância própria (Judge0 é open source) ou a RapidAPI |
| `JUDGE0_TOKEN` | Token da sua instância (`X-Auth-Token`) ou chave da RapidAPI |
| `JUDGE0_RAPIDAPI_HOST` | Só para RapidAPI, ex.: `judge0-ce.p.rapidapi.com` |
| `ALLOWED_ORIGINS` | Origens liberadas no CORS. Padrão: o GitHub Pages e `http://localhost:3000` |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidas automaticamente pelo Supabase. Nada disso vai para o site ou para o repositório.

### Atualizar a Edge Function

O banco privado precisa estar em `supabase/functions/_shared/battle-bank.ts`. Com a CLI do Supabase:

```bash
npx supabase functions deploy battle-submit --no-verify-jwt --project-ref kaylnsleygeysszomudd
```

(A função faz a própria autenticação; por isso `--no-verify-jwt`.)

## Como testar com duas contas reais

1. Abra o site em dois navegadores diferentes (ou um normal e uma janela anônima).
2. Entre com **duas contas Google diferentes**.
3. Nos dois, vá em **Batalha**, escolha uma linguagem (podem ser diferentes) e clique em **Procurar adversário** com poucos segundos de diferença.
4. Os dois veem o mesmo desafio depois da contagem de 5 s. Envie uma solução errada em um (aparece "Resposta errada" e a partida continua) e a certa no outro.
5. Confira: resultado nos dois lados, troféus (+30 para quem venceu na arena inicial, 0 para quem perdeu), códigos revelados, histórico e o ranking da Batalha.
6. Teste também: fechar uma das abas por mais de 45 s (abandono), deixar o tempo acabar (sem vencedor) e recarregar a página no meio (reconexão).

## Testes automatizados

```bash
npm test                                            # inclui 21 testes da Batalha no Postgres real (PGlite)
BATTLE_E2E=1 npx vitest run tests/db/battle-e2e.test.ts   # ponta a ponta com o Judge0 real (usa internet)
npm run battle:validate                             # 29 desafios × 10 linguagens no Judge0
npx tsx scripts/battle-validate.mts - rust          # só uma linguagem (ou um id de desafio no lugar do -)
```

## Ideias para melhorar

- Usar **Supabase Realtime** (broadcast) para o status do adversário em vez de consulta a cada 1,5 s.
- Subir uma **instância própria do Judge0** (por exemplo numa VM gratuita) para não depender do limite da instância pública.
- Mais desafios por nível e um sorteio que evite repetir o mesmo problema para a mesma pessoa.
- Partidas privadas com código de convite para jogar com amigos.
- Desbloquear de fato as molduras de perfil de cada arena.
- Replays: mostrar a linha do tempo dos envios de cada jogador no fim da partida.
