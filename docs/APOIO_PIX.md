# Apoio voluntário via Pix (Syncpay)

Status: **ativo desde 25/10/2026**. Chave de API com permissões só de Consulta e Venda (sem Saque), secrets `SYNCPAY_CLIENT_ID`, `SYNCPAY_CLIENT_SECRET` e `PIX_IP_SALT` cadastrados e webhook "Recebimento - Cash in" apontando para a função. Receber Pix não exige IP liberado (a restrição de IP da Syncpay vale só para saques). Nenhum plano ou cartão foi contratado.

> **Pendente (30/10/2026):** `SYNCPAY_WEBHOOK_TOKEN` **não está cadastrado** no Supabase (os logs da função mostram `webhook_token_configurado: false`), por isso todo aviso da Syncpay recebe 401. Enquanto isso, a doação só é confirmada pela tela de quem pagou (que consulta a Syncpay a cada 5 s). Passo a passo em "Cadastrar o token do webhook", abaixo.

## O que a documentação oficial da Syncpay informa (consultada em out/2026)

Fontes: [documentação da API](https://syncpay.apidog.io/) e [site da Syncpay](https://syncpayments.com.br/).

| Ponto | Informação |
| --- | --- |
| Mensalidade / adesão | Nenhuma ("sem mensalidade, adesão ou taxa escondida") |
| Tarifa por Pix | R$ 0,75 por venda (há um asterisco cuja nota não aparece na página — confirme no painel) |
| Taxa de saque | Não informada — confirme antes de ativar |
| Ambiente de testes | Não existe; só produção (`https://api.syncpayments.com.br/api/partner/v1`) |
| Conta | Precisa estar aprovada (contas não aprovadas recebem erro 422) |
| IP | A cobrança "exige IP e chave autorizados". As Edge Functions do Supabase não têm IP fixo: **confirme com a Syncpay** se é preciso liberar IP; se for, esta arquitetura gratuita não atende e o recurso deve continuar desligado |
| Dados do pagador | Opcionais. O site **não** pede nome nem CPF |
| Webhook | Autenticado só com `Authorization: Bearer <token do webhook>` ("sem assinatura HMAC"). O token aparece **uma única vez**, na criação do webhook; se perdeu, gere outro com "rotacionar segredo" (`POST /webhooks/{id}/rotate-secret`), que invalida o anterior |
| Notificação no celular | O site não depende de push. Avisos do app/painel da Syncpay são separados do webhook |

Exemplo: um apoio de R$ 5,00 deixa R$ 4,25 líquidos (antes de eventual taxa de saque).

## Como funciona

1. A pessoa escolhe o valor (mínimo R$ 5,00, sem teto definido pelo projeto) em `/apoiar`.
2. A Edge Function `support-pix` valida o valor no servidor, limita a 5 cobranças por hora por IP (guardado só como hash) e cria a cobrança na Syncpay.
3. O site mostra o QR Code (gerado no navegador a partir do Copia e Cola) e consulta o status a cada 5 s.
4. A confirmação vem sempre de uma consulta do **servidor** à Syncpay (`GET /transaction/{id}`), conferindo que o valor pago é o valor cobrado. O corpo do webhook nunca é usado como prova.
5. Chave de idempotência por tentativa: clique duplo ou recarregar não cria cobrança duplicada.
6. Sem resposta em 30 minutos, a tela mostra "expirado" (a Syncpay não documenta expiração); se o pagamento chegar depois, ele ainda é confirmado.

Nenhum XP, troféu, conteúdo ou vantagem é concedido por apoiar.

## Para ativar (feito por você, no painel)

1. Crie e aprove a conta na Syncpay; gere **Client ID** e **Client Secret** (o secret aparece uma vez).
2. Pergunte à Syncpay se a API exige IP liberado. Se exigir, pare aqui.
3. No Supabase → Edge Functions → **Secrets** (vale para o projeto todo, não por função), cadastre:
   - `SYNCPAY_CLIENT_ID`
   - `SYNCPAY_CLIENT_SECRET`
   - `PIX_IP_SALT` (um texto aleatório longo)
4. Crie o webhook na Syncpay (painel ou `POST /webhooks`) com evento `cashin` e URL:
   `https://kaylnsleygeysszomudd.supabase.co/functions/v1/support-pix?webhook=1`
   e cadastre o token devolvido como secret `SYNCPAY_WEBHOOK_TOKEN` (não precisa publicar a função de novo).
5. Teste com um Pix pequeno seu (R$ 5,00) e confira em `/apoiar` a mudança para "confirmado".

## Cadastrar o token do webhook (sem compartilhar o valor com ninguém)

1. Syncpay → Webhooks: confira que existe **um** webhook com URL `https://kaylnsleygeysszomudd.supabase.co/functions/v1/support-pix?webhook=1` e evento `cashin` ("Recebimento - Cash in").
2. Se você não tem o token guardado (ele só aparece na criação), use a opção de rotacionar/gerar novo segredo desse webhook, ou exclua e crie de novo com a mesma URL e evento. Copie o token que aparecer.
3. Supabase → Edge Functions → Secrets (`https://supabase.com/dashboard/project/kaylnsleygeysszomudd/functions/secrets`): se já existir `SYNCPAY_WEBHOOK_TOKEN`, edite; senão, adicione com esse nome exato. Cole o token sem espaços nem `Bearer` e salve.
4. Teste seguro, no seu terminal (o id não existe, então nada muda): veja `docs/SEGURANCA.md`, seção H, item 2. Esperado: `{"ok":true,"message":"ignorado"}`.

## Testes feitos

- `tests/unit/pix.test.ts` (15 testes, Syncpay simulada): valores inválidos/negativos/manipulados, mínimo, geração, idempotência, limite por IP, falha de comunicação, pendente, expirado, confirmação só com valor correto, pagamento após expiração, webhook sem token/token errado/repetido/corpo falso.
- `tests/db/support.test.ts`: tabela fechada para o navegador, valor mínimo e chave única no banco.
- Navegador: página desativada sem botões mortos; com a função simulada, valor baixo recusado, QR + Copia e Cola, confirmação automática.
- Produção: função publicada responde `enabled: false` e recusa criação e webhook (503).
- **Não testado:** a API real da Syncpay (sem credenciais e sem ambiente de testes). Nenhum pagamento real foi feito.
