## Visão geral

O Tarefas+ ganha um back-end: uma **API REST** em Node.js com Express. Por enquanto os dados ficam em memória — o objetivo é dominar rotas, validação, status codes e testes antes de entrar no banco de dados.

Pré-requisitos: trilha de **Node.js, HTTP e APIs**.

## Requisitos

- `GET /tarefas` lista; `POST /tarefas` cria; `PATCH /tarefas/:id` atualiza; `DELETE /tarefas/:id` remove.
- Respostas em JSON com os status corretos: 200, 201, 204, 400 e 404.
- Validação do corpo da requisição (texto obrigatório, até 200 caracteres).
- Porta lida de variável de ambiente.
- Testes automatizados das rotas.

## Etapas

1. `npm init -y`, instale `express` e crie `app.js` (a aplicação) separado de `server.js` (quem chama `listen`). Isso facilita os testes.
2. Implemente uma rota por vez e teste com a extensão REST Client, o Insomnia ou `curl`.
3. Centralize o tratamento de erros em um middleware.
4. Escreva testes com o executor nativo do Node (`node --test`) e `fetch`.

## Código de partida

```js
import express from "express";

export function criarApp() {
  const app = express();
  app.use(express.json({ limit: "10kb" }));

  let tarefas = [];
  let proximoId = 1;

  app.get("/tarefas", (req, res) => {
    res.json(tarefas);
  });

  app.post("/tarefas", (req, res) => {
    const texto = typeof req.body?.texto === "string" ? req.body.texto.trim() : "";
    if (!texto || texto.length > 200) {
      return res.status(400).json({ erro: "O texto é obrigatório e deve ter até 200 caracteres." });
    }
    const tarefa = { id: proximoId++, texto, feita: false };
    tarefas.push(tarefa);
    res.status(201).json(tarefa);
  });

  app.delete("/tarefas/:id", (req, res) => {
    const id = Number(req.params.id);
    const antes = tarefas.length;
    tarefas = tarefas.filter((t) => t.id !== id);
    if (tarefas.length === antes) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.status(204).end();
  });

  return app;
}
```

## Melhorias opcionais

- Implementar o `PATCH` com validação dos campos permitidos.
- Paginação com `?pagina=` e `?limite=`.
- Documentar a API em um arquivo `api.http` com exemplos de requisição.
