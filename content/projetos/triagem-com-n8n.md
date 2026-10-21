## Visão geral

Uma automação que recebe mensagens (de um formulário de contato, por exemplo), usa IA para classificá-las em categorias como **dúvida**, **suporte**, **financeiro** ou **revisar**, e encaminha cada uma para o destino certo. Você vai construí-la no **n8n**, uma ferramenta de automação com interface visual que pode rodar na sua máquina.

Pré-requisitos: aula de **Automação com n8n** da trilha de IA.

## Requisitos

- Gatilho por webhook que recebe `{ nome, email, mensagem }`.
- Classificação com categorias fixas e resposta em JSON.
- Quando a IA não tiver certeza ou a resposta for inválida, a mensagem vai para "revisar", que uma pessoa confere.
- Encaminhamento por categoria (planilha, e-mail ou canal de chat).
- O fluxo exportado em JSON e um README no repositório.

## Etapas

1. Instale o n8n localmente (veja a documentação oficial em docs.n8n.io) e crie um fluxo com o nó Webhook.
2. Adicione um nó de IA com um prompt que liste as categorias e peça JSON.
3. Adicione um nó de código para validar a resposta e cair em "revisar" quando necessário.
4. Use o nó Switch para encaminhar por categoria.
5. Teste com mensagens ambíguas e com tentativas de enganar a IA.

## Código de partida

Validação para um nó de código do n8n (JavaScript):

```js
const CATEGORIAS = ["duvida", "suporte", "financeiro", "revisar"];

function classificar(respostaDaIA) {
  try {
    const dados = JSON.parse(respostaDaIA);
    const categoria = CATEGORIAS.includes(dados.categoria) ? dados.categoria : "revisar";
    const confianca = typeof dados.confianca === "number" ? dados.confianca : 0;
    return confianca >= 0.7 ? categoria : "revisar";
  } catch {
    return "revisar";
  }
}

console.log(classificar('{"categoria":"suporte","confianca":0.9}')); // "suporte"
console.log(classificar("texto solto")); // "revisar"
```

## Melhorias opcionais

- Resposta automática de recebimento para quem escreveu.
- Remover dados pessoais da mensagem antes de enviá-la à IA.
- Um painel com a contagem de mensagens por categoria.
