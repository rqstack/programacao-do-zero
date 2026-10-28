# Roteiro: testar com duas contas Google (gratuito)

Para validar convites, revanche e portfólio com pessoas de verdade, sem usar contas de terceiros e sem mexer nos perfis que já existem.

## Preparação (uma vez)

1. Use **duas contas Google suas** (crie uma conta de teste gratuita no Google se precisar), por exemplo "Conta A" (sua) e "Conta B" (teste).
2. Abra o site em **dois navegadores separados** (ou um normal + uma janela anônima/convidado), um para cada conta. Não use a mesma janela: a sessão é por navegador.
3. Entre com a Conta A num e com a Conta B no outro (botão **Entrar** → Google).
4. Na Conta B, vá em **Meu perfil** e confira que **"Publicar meu portfólio" está desmarcado** (contas novas nascem privadas). Não mexa nos perfis antigos.

## 1. Convite para amigo

| Passo | Onde | Esperado |
| --- | --- | --- |
| A1 | A: Batalha → Desafiar um amigo → Criar convite | Aparece um código de 8 caracteres e a contagem de 15 min |
| A2 | A: Copiar link | O link tem `?convite=CODIGO` |
| B1 | B: abrir o link | Mostra "Conta A desafiou você" |
| B2 | B: Aceitar e entrar na sala | Os dois navegadores entram na mesma sala (A entra sozinho em até ~3 s) |
| AB | Contagem de 5 s | O enunciado aparece ao mesmo tempo nos dois |
| A3 | A: envia uma solução errada | "Resposta errada"; a partida continua |
| B3 | B: envia uma solução certa | B vence; A vê "Derrota" |
| AB | Resultado | Aparece "Partida amistosa: os troféus não mudam"; troféus iguais aos de antes |
| AB | Histórico | A partida aparece com o selo "amistosa" nos dois |

Casos de erro (devem falhar com mensagem clara):
- A abre o próprio link → "Este convite é seu".
- Reabrir o link depois de usado → "Este convite já foi usado".
- Esperar 15 min sem aceitar → "Este convite expirou".
- Uma terceira pessoa com o código usado → recusado.

## 2. Revanche

| Passo | Esperado |
| --- | --- |
| Logo após uma partida, A clica **Pedir revanche** | A vê "Pedido enviado"; B vê "Conta A quer uma revanche" |
| B clica **Aceitar** | Os dois entram numa partida nova (outro problema, se houver) |
| Histórico | A partida anterior continua lá; a nova aparece separada |
| Repita e B clica **Recusar** | A vê "A revanche foi recusada" |
| B fecha a aba e A pede revanche depois de 20 s | A vê que o adversário saiu da tela |

## 3. Portfólio público e privado

| Passo | Esperado |
| --- | --- |
| B: copie o endereço do próprio perfil (`/u/?n=usuario`) | — |
| A (ou janela anônima): abrir o endereço de B com o portfólio desmarcado | "Perfil não encontrado" (privado) |
| B: marque **Publicar meu portfólio**, desmarque "Projetos concluídos", salve | — |
| A: recarregar o perfil de B | Perfil aparece, **sem** a seção de projetos |
| Janela anônima (sem login): o mesmo endereço | Mesmo conteúdo; nenhum e-mail, anotação ou favorito aparece |
| B: desmarque **Publicar** de novo | Perfil volta a "não encontrado" para A e para o anônimo |

## 4. Ao terminar

- Deixe o perfil da Conta B privado (ou apague a conta de teste em Meu progresso → Conta → Apagar conta).
- Os troféus não mudam em partidas amistosas, então o ranking não é afetado.
- Se algo falhar, use **Relatar um problema** (rodapé) e informe o passo da tabela.
