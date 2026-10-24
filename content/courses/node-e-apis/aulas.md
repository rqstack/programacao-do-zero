<!-- aula: como-a-web-funciona -->
## Por que isso importa

Toda vez que você abre um site, aperta "curtir" ou faz login, um computador conversa com outro pela internet. Antes de escrever um servidor, vale entender essa conversa: quem pede, quem responde, por onde a mensagem passa e o que pode dar errado no caminho. Quase todo bug de back-end fica mais fácil de achar quando você sabe em qual etapa ele aconteceu.

## Conceitos fundamentais

- **Cliente e servidor**: o cliente (navegador, app, outro programa) **pede**; o servidor **responde**. Um mesmo programa pode ser cliente de um serviço e servidor de outro.
- **URL**: o endereço do que você quer. Em `https://api.exemplo.com:443/livros?pagina=2`, temos o **protocolo** (`https`), o **domínio** (`api.exemplo.com`), a **porta** (`443`, normalmente escondida), o **caminho** (`/livros`) e a **query string** (`?pagina=2`).
- **DNS**: a "agenda de contatos" da internet. Ele traduz o domínio em um **endereço IP** (como `93.184.215.14`), que é onde o servidor realmente está.
- **TCP**: cria uma conexão confiável entre os dois computadores; os dados chegam completos e na ordem certa.
- **TLS** (o "S" de HTTPS): criptografa a conversa e prova, com um certificado, que o servidor é quem diz ser. Sem ele, qualquer um no caminho (um Wi-Fi público, por exemplo) poderia ler senhas.
- **HTTP**: o idioma da conversa. O cliente manda uma **requisição** (request) e o servidor devolve uma **resposta** (response).
- **Front-end e back-end**: o front-end roda no navegador do usuário; o back-end roda no servidor, perto do banco de dados e dos segredos (senhas, chaves de API).

## Exemplo prático

Você pode fazer uma requisição sem navegador, direto do terminal, com o `curl`. A opção `-i` mostra a resposta completa, com cabeçalhos:

```bash
curl -i https://jsonplaceholder.typicode.com/todos/1
```

A resposta tem três partes:

```texto
HTTP/2 200
content-type: application/json; charset=utf-8
cache-control: max-age=43200

{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

O mesmo pedido, feito em JavaScript:

```js
const resposta = await fetch("https://jsonplaceholder.typicode.com/todos/1");
console.log(resposta.status); // 200
const tarefa = await resposta.json();
console.log(tarefa.title);
```

## Explicando o código

- Antes de qualquer dado sair, o sistema perguntou ao **DNS** o IP de `jsonplaceholder.typicode.com`, abriu uma conexão **TCP** e negociou a criptografia **TLS**.
- A primeira linha da resposta traz a versão do protocolo e o **código de status**: `200` significa "deu certo".
- Os **cabeçalhos** (headers) descrevem a resposta: `content-type` diz que o corpo é JSON.
- Depois de uma linha em branco vem o **corpo** (body): os dados em si.
- No JavaScript, `fetch` devolve a resposta e `resposta.json()` transforma o corpo em objeto.

## Erros comuns

- **Achar que "a internet caiu" é sempre o servidor**: o erro pode estar no DNS (domínio digitado errado), na rede, no certificado ou no próprio código do cliente. Leia a mensagem de erro com calma.
- **Confundir domínio com caminho**: `exemplo.com/api` e `api.exemplo.com` são lugares diferentes.
- **Colocar segredos no front-end**: tudo que vai para o navegador pode ser visto pelo usuário. Chaves privadas ficam no back-end.
- **Usar `http://` em produção**: sem TLS, senhas trafegam como texto puro.

## Resumo

- Cliente pede, servidor responde; HTTP é o idioma dessa conversa.
- URL = protocolo + domínio + porta + caminho + query string.
- DNS acha o IP, TCP cria a conexão, TLS protege a conversa.
- Toda resposta HTTP tem status, cabeçalhos e corpo.

## Próximo passo

Agora que você viu o caminho de uma requisição, a próxima aula entra no HTTP: métodos, códigos de status e cabeçalhos que você vai usar o tempo todo.

<!-- aula: protocolo-http -->
## Por que isso importa

APIs são construídas em cima do HTTP. Escolher o método certo e devolver o código de status certo é o que faz sua API ser previsível: quem a usa sabe o que esperar sem ler seu código. E, na hora de depurar, a aba **Rede** do navegador mostra exatamente esses detalhes.

## Conceitos fundamentais

- **Métodos** dizem a intenção da requisição:
  - `GET` lê um recurso (não deve alterar nada).
  - `POST` cria um recurso novo.
  - `PUT` substitui um recurso inteiro; `PATCH` altera só alguns campos.
  - `DELETE` remove.
- **Idempotência**: repetir a mesma requisição dá o mesmo resultado. `GET`, `PUT` e `DELETE` são idempotentes; `POST` não (dois `POST` criam dois registros).
- **Códigos de status**, por faixa:
  - `2xx` sucesso: `200 OK`, `201 Created`, `204 No Content`.
  - `3xx` redirecionamento: `301`, `304 Not Modified`.
  - `4xx` erro de quem pediu: `400 Bad Request`, `401 Unauthorized` (não se identificou), `403 Forbidden` (identificado, mas sem permissão), `404 Not Found`, `409 Conflict`, `422`, `429 Too Many Requests`.
  - `5xx` erro do servidor: `500 Internal Server Error`, `503 Service Unavailable`.
- **Cabeçalhos** importantes: `Content-Type` (formato do corpo), `Authorization` (credencial, como `Bearer <token>`), `Accept`, `Cache-Control`, `Location` (onde está o recurso criado).
- **JSON** é o formato mais comum de corpo em APIs: texto com objetos, listas, números, textos, `true`, `false` e `null`.
- **HTTP não guarda estado**: cada requisição é independente. Por isso o cliente envia a credencial em toda chamada (cookie ou cabeçalho `Authorization`).

## Exemplo prático

Criando uma tarefa com `POST`, enviando JSON:

```js
const resposta = await fetch("https://jsonplaceholder.typicode.com/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Estudar HTTP", completed: false, userId: 1 }),
});

if (!resposta.ok) {
  throw new Error(`A API respondeu ${resposta.status}`);
}

const criada = await resposta.json();
console.log(resposta.status, criada.id); // 201 e o id novo
```

A mesma requisição com `curl`:

```bash
curl -i -X POST https://jsonplaceholder.typicode.com/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudar HTTP","completed":false,"userId":1}'
```

## Explicando o código

- `method: "POST"` diz que queremos **criar** algo.
- O cabeçalho `Content-Type: application/json` avisa o servidor de que o corpo é JSON. Sem ele, muitos servidores não leem o corpo.
- `JSON.stringify` transforma o objeto em texto, porque o corpo viaja como texto.
- `resposta.ok` é verdadeiro para status de 200 a 299. **`fetch` não lança erro para 404 ou 500**: você precisa conferir.
- O status `201 Created` indica que um recurso novo foi criado.

## Erros comuns

- **Usar `GET` para apagar ou alterar** (por exemplo `GET /apagar?id=3`): robôs e pré-carregamento de links podem disparar a ação sem querer.
- **Responder `200` para tudo**, inclusive erros, com `{ "erro": true }` no corpo. O cliente perde a chance de tratar pelo status.
- **Confundir 401 com 403**: 401 é "não sei quem você é"; 403 é "sei quem você é, mas você não pode".
- **Esquecer o `Content-Type`** ao enviar JSON.

## Resumo

- O método diz a intenção; o status diz o resultado; os cabeçalhos dão o contexto; o corpo traz os dados.
- `2xx` deu certo, `4xx` o pedido está errado, `5xx` o servidor falhou.
- `fetch` só rejeita por falha de rede: confira `resposta.ok`.

## Próximo passo

Você já sabe conversar em HTTP como cliente. Agora vamos para o outro lado: rodar JavaScript fora do navegador com o **Node.js**.

<!-- aula: node-fundamentos -->
## Por que isso importa

O Node.js permite usar JavaScript no servidor, em scripts de automação e em ferramentas de linha de comando. É o mesmo idioma que você já usa no front-end, o que facilita muito começar no back-end. Boa parte das ferramentas de desenvolvimento web (Vite, ESLint, Next.js) também roda em Node.

## Conceitos fundamentais

- **Node.js** é um *runtime*: o motor V8 (o mesmo do Chrome) mais bibliotecas para acessar arquivos, rede e processos. Não existe `document` nem `window`: não há página.
- **Versão LTS**: instale sempre a versão de suporte longo (LTS) do site oficial nodejs.org. Confira com `node --version`.
- **npm** é o gerenciador de pacotes. `npm init -y` cria o `package.json`, que guarda o nome do projeto, os scripts e as dependências.
- **Dependências**: `npm install express` baixa o pacote para `node_modules/` e anota em `package.json`. O `package-lock.json` trava as versões exatas. `node_modules/` **não** vai para o Git.
- **Módulos ES**: com `"type": "module"` no `package.json`, você usa `import` e `export`, igual ao navegador. Módulos nativos do Node têm o prefixo `node:` (`node:fs`, `node:path`).
- **Event loop**: o Node faz uma coisa por vez, mas não fica parado esperando disco ou rede. Operações demoradas são **assíncronas** (Promises e `await`), e enquanto isso ele atende outras tarefas.
- **`process`**: dá acesso aos argumentos (`process.argv`), às variáveis de ambiente (`process.env`) e ao código de saída.
- **`node --watch arquivo.js`** reinicia o programa sempre que você salva.

## Exemplo prático

Um script que lê um arquivo JSON de tarefas e mostra quantas faltam. Estrutura:

```texto
meu-projeto/
  package.json      ← com "type": "module"
  tarefas.json
  contar.js
```

```js
// contar.js
import { readFile } from "node:fs/promises";

const caminho = process.argv[2] ?? "tarefas.json";

try {
  const texto = await readFile(caminho, "utf8");
  const tarefas = JSON.parse(texto);
  const pendentes = tarefas.filter((t) => !t.feita);
  console.log(`${pendentes.length} de ${tarefas.length} tarefas pendentes`);
} catch (erro) {
  console.error(`Não consegui ler ${caminho}: ${erro.message}`);
  process.exitCode = 1;
}
```

Rodando:

```bash
node contar.js tarefas.json
```

## Explicando o código

- `import { readFile } from "node:fs/promises"` traz a versão com Promises da leitura de arquivos.
- `process.argv[2]` é o primeiro argumento depois do nome do script; se não vier, usamos um padrão com `??`.
- `await readFile(...)` lê o arquivo sem travar o programa. O `await` direto no arquivo funciona porque é um módulo ES.
- `JSON.parse` transforma o texto em lista de objetos.
- Erros (arquivo inexistente, JSON quebrado) caem no `catch`. `process.exitCode = 1` avisa ao terminal que o script falhou, o que é útil em automações.

## Erros comuns

- **`SyntaxError: Cannot use import statement outside a module`**: falta `"type": "module"` no `package.json` (ou o arquivo precisa terminar em `.mjs`).
- **`ReferenceError: document is not defined`**: código de navegador rodando no Node.
- **Usar `readFileSync` dentro de um servidor**: a versão síncrona trava todas as outras requisições enquanto lê.
- **Commitar `node_modules/`**: deixe no `.gitignore`; quem clonar roda `npm install`.

## Resumo

- Node.js roda JavaScript fora do navegador, com acesso a arquivos, rede e processos.
- `package.json` descreve o projeto; `npm install` instala dependências.
- Use módulos ES (`import`) e APIs assíncronas para não travar o programa.

## Próximo passo

Com Node instalado e entendido, vamos criar um servidor HTTP de verdade, sem nenhuma biblioteca, para ver o que acontece por baixo dos frameworks.

<!-- aula: servidor-http-com-node -->
## Por que isso importa

Frameworks como o Express escondem muitos detalhes. Escrever um servidor "na mão", só com o módulo `node:http`, mostra o que todo servidor faz: receber a requisição, olhar método e caminho, montar a resposta com status, cabeçalhos e corpo. Depois disso, o Express deixa de parecer mágica.

## Conceitos fundamentais

- **`http.createServer(handler)`** cria um servidor; o `handler` recebe dois objetos a cada requisição:
  - `req` (requisição): `req.method`, `req.url`, `req.headers` e o corpo, que chega aos pedaços.
  - `res` (resposta): `res.statusCode`, `res.setHeader()` e `res.end(corpo)`.
- **Porta**: o servidor "escuta" em uma porta (por exemplo `3000`). Em `http://localhost:3000`, `localhost` é o seu próprio computador.
- **Roteamento**: decidir o que fazer conforme **método + caminho** (`GET /tarefas`, `POST /tarefas`).
- **Corpo da requisição**: chega como fluxo (*stream*) de pedaços. É preciso juntá-los antes de usar `JSON.parse`.
- **Toda requisição precisa de uma resposta**: se você esquecer o `res.end()`, o cliente fica esperando até desistir.

## Exemplo prático

```js
// servidor.js
import { createServer } from "node:http";

const tarefas = [{ id: 1, titulo: "Estudar HTTP", feita: false }];

function enviarJson(res, status, dados) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(dados));
}

async function lerCorpo(req) {
  let texto = "";
  for await (const pedaco of req) {
    texto += pedaco;
    if (texto.length > 1e6) throw new Error("corpo grande demais");
  }
  return texto ? JSON.parse(texto) : {};
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/tarefas") {
    return enviarJson(res, 200, tarefas);
  }

  if (req.method === "POST" && url.pathname === "/tarefas") {
    try {
      const corpo = await lerCorpo(req);
      if (typeof corpo.titulo !== "string" || corpo.titulo.trim() === "") {
        return enviarJson(res, 400, { erro: "Informe um título" });
      }
      const nova = { id: tarefas.length + 1, titulo: corpo.titulo.trim(), feita: false };
      tarefas.push(nova);
      return enviarJson(res, 201, nova);
    } catch {
      return enviarJson(res, 400, { erro: "JSON inválido" });
    }
  }

  enviarJson(res, 404, { erro: "Rota não encontrada" });
});

servidor.listen(3000, () => console.log("Servidor em http://localhost:3000"));
```

Testando em outro terminal:

```bash
curl http://localhost:3000/tarefas
curl -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d '{"titulo":"Aprender Node"}'
```

## Explicando o código

- `new URL(req.url, ...)` separa caminho e query string; `req.url` sozinho vem como `/tarefas?x=1`.
- `enviarJson` concentra o que se repete: status, cabeçalho `Content-Type` e o corpo em texto.
- `lerCorpo` junta os pedaços com `for await` e recusa corpos enormes, uma proteção simples contra abuso.
- Cada `if` é uma rota: método + caminho. O `return` evita responder duas vezes.
- Qualquer outra combinação cai no `404` no fim.
- As tarefas ficam em uma lista na memória: ao reiniciar o servidor, elas somem. Mais adiante entra o banco de dados.

## Erros comuns

- **`EADDRINUSE`**: a porta já está ocupada (provavelmente por outro servidor seu). Feche o outro ou use outra porta.
- **Responder duas vezes** (`res.end` chamado duas vezes): erro `ERR_STREAM_WRITE_AFTER_END`. Use `return` depois de responder.
- **Confiar no corpo recebido**: qualquer pessoa pode mandar qualquer coisa. Valide tipo e conteúdo antes de usar.
- **Esquecer o `Content-Type`** na resposta: o cliente pode não interpretar como JSON.

## Resumo

- `createServer` recebe `req` e `res`; você decide a resposta por método + caminho.
- Toda resposta tem status, cabeçalhos e corpo, e termina com `res.end()`.
- O corpo da requisição chega aos pedaços e precisa ser validado.

## Próximo passo

Fazer tudo na mão funciona, mas cresce rápido. Na próxima aula, o **Express** organiza rotas, leitura de JSON e tratamento de erros.

<!-- aula: express-rotas-e-middlewares -->
## Por que isso importa

O Express é o framework web mais usado com Node.js há mais de uma década, e as ideias dele (rotas e middlewares) aparecem em quase todos os outros (Fastify, Koa, Hono, NestJS). Aprendendo bem o Express, você entende a maioria das APIs Node que vai encontrar no trabalho.

## Conceitos fundamentais

- **Instalação**: `npm install express`. A versão atual é a 5, que já repassa erros de funções `async` para o tratador de erros.
- **Rotas**: `app.get(caminho, handler)`, `app.post`, `app.put`, `app.patch`, `app.delete`.
- **Parâmetros de rota**: em `/tarefas/:id`, o valor vem em `req.params.id` (sempre como texto).
- **Query string**: `/tarefas?feita=true` chega em `req.query.feita`.
- **Corpo JSON**: o middleware `express.json()` lê e converte o corpo; o resultado fica em `req.body`.
- **Resposta**: `res.status(201).json(dados)`, `res.sendStatus(204)`.
- **Middleware** é uma função `(req, res, next)` que roda **antes** das rotas. Ela pode ler e alterar `req`, responder (e encerrar), ou chamar `next()` para seguir adiante. Usos: log, autenticação, leitura de corpo, CORS.
- **A ordem importa**: o Express executa middlewares e rotas na ordem em que foram registrados.
- **Router**: `express.Router()` agrupa rotas de um assunto em outro arquivo.

## Exemplo prático

```js
// app.js
import express from "express";

const app = express();
app.use(express.json());

// Middleware de log: mostra método, caminho e tempo de cada requisição.
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
});

const tarefas = [{ id: 1, titulo: "Estudar Express", feita: false }];

app.get("/tarefas", (req, res) => {
  const { feita } = req.query;
  const lista = feita === undefined ? tarefas : tarefas.filter((t) => String(t.feita) === feita);
  res.json(lista);
});

app.get("/tarefas/:id", (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
  res.json(tarefa);
});

export default app;
```

```js
// server.js
import app from "./app.js";

const porta = Number(process.env.PORT ?? 3000);
app.listen(porta, () => console.log(`API em http://localhost:${porta}`));
```

## Explicando o código

- `app.use(express.json())` vale para todas as rotas abaixo dele: `req.body` passa a ter o objeto enviado.
- O middleware de log chama `next()` para a requisição seguir. Ele usa o evento `finish` para medir o tempo depois que a resposta saiu.
- `req.query.feita` chega como texto (`"true"`), por isso a comparação usa `String(t.feita)`.
- `Number(req.params.id)` converte o parâmetro; sem isso, `1 === "1"` daria falso.
- Separar `app.js` (a aplicação) de `server.js` (que liga a porta) facilita os testes, como você verá na última aula.
- `process.env.PORT` permite que a hospedagem escolha a porta.

## Erros comuns

- **Registrar `express.json()` depois das rotas**: `req.body` fica `undefined`.
- **Middleware que não chama `next()` nem responde**: a requisição fica pendurada.
- **Esquecer que parâmetros e query são texto**: compare convertendo (`Number`, `=== "true"`).
- **Rota genérica antes da específica**: `/tarefas/:id` declarada antes de `/tarefas/pendentes` "engole" a palavra `pendentes` como id.

## Resumo

- Rotas = método + caminho + handler; `req.params`, `req.query` e `req.body` trazem os dados.
- Middlewares rodam em ordem e chamam `next()` para seguir.
- Separe a aplicação (`app.js`) da inicialização (`server.js`).

## Próximo passo

Com rotas e middlewares, você já pode montar uma API completa. A próxima aula organiza isso no estilo **REST**, com criar, ler, atualizar e apagar.

<!-- aula: api-rest-crud -->
## Por que isso importa

**REST** é um jeito de organizar APIs em torno de **recursos** (tarefas, usuários, pedidos) usando os métodos e códigos do HTTP. Uma API REST bem feita é previsível: quem conhece o padrão consegue usá-la quase sem documentação. CRUD (criar, ler, atualizar, apagar) é o pedido mais comum em testes técnicos de vagas de back-end.

## Conceitos fundamentais

- **Recursos no plural, sem verbos na URL**: `/tarefas` e `/tarefas/7`, e não `/criarTarefa` ou `/apagarTarefa?id=7`. O verbo é o método HTTP.
- **O mapa do CRUD**:
  - `GET /tarefas` → lista (200).
  - `GET /tarefas/:id` → uma (200, ou 404).
  - `POST /tarefas` → cria (201, com o recurso criado).
  - `PATCH /tarefas/:id` → altera campos (200, ou 404).
  - `DELETE /tarefas/:id` → apaga (204, sem corpo, ou 404).
- **Validação** na entrada: o servidor nunca confia no cliente. A biblioteca **Zod** descreve o formato esperado e devolve erros claros.
- **400 com detalhes**: quando a validação falha, diga qual campo está errado.
- **Paginação** em listas grandes: `?pagina=2&limite=20`, sempre com um limite máximo.
- **Camadas**: rota (HTTP) → validação → regra de negócio → dados. Mantenha cada parte simples e separada.

## Exemplo prático

```js
// rotas/tarefas.js
import { Router } from "express";
import { z } from "zod";

const router = Router();
let proximoId = 1;
const tarefas = new Map();

const criarSchema = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório").max(120),
  feita: z.boolean().default(false),
});
const alterarSchema = criarSchema.partial();

router.get("/", (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 20, 100);
  res.json([...tarefas.values()].slice(0, limite));
});

router.get("/:id", (req, res) => {
  const tarefa = tarefas.get(Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
  res.json(tarefa);
});

router.post("/", (req, res) => {
  const dados = criarSchema.safeParse(req.body);
  if (!dados.success) return res.status(400).json({ erro: "Dados inválidos", campos: dados.error.flatten().fieldErrors });
  const tarefa = { id: proximoId++, ...dados.data };
  tarefas.set(tarefa.id, tarefa);
  res.status(201).location(`/tarefas/${tarefa.id}`).json(tarefa);
});

router.patch("/:id", (req, res) => {
  const tarefa = tarefas.get(Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
  const dados = alterarSchema.safeParse(req.body);
  if (!dados.success) return res.status(400).json({ erro: "Dados inválidos", campos: dados.error.flatten().fieldErrors });
  Object.assign(tarefa, dados.data);
  res.json(tarefa);
});

router.delete("/:id", (req, res) => {
  const apagou = tarefas.delete(Number(req.params.id));
  if (!apagou) return res.status(404).json({ erro: "Tarefa não encontrada" });
  res.sendStatus(204);
});

export default router;
```

E no `app.js`: `app.use("/tarefas", tarefasRouter);`

## Explicando o código

- O `Router` agrupa as rotas de tarefas; o prefixo `/tarefas` é definido uma vez, no `app.use`.
- `criarSchema` descreve o corpo esperado: `trim()` limpa espaços e `min(1)` recusa título vazio. `partial()` cria a versão para o `PATCH`, em que todos os campos são opcionais.
- `safeParse` não lança erro: devolve `success` e os dados limpos ou os erros por campo.
- O `POST` responde `201` e o cabeçalho `Location` com o endereço do recurso novo.
- O `DELETE` responde `204` sem corpo; tentar apagar algo que não existe dá `404`.
- O `limite` da lista tem teto de 100, para ninguém pedir um milhão de registros de uma vez.

## Erros comuns

- **Verbos na URL** (`POST /tarefas/criar`): o método já diz a ação.
- **Usar `req.body` direto** sem validar: campos extras ou tipos errados entram no sistema.
- **Devolver a lista inteira** sem limite: lento e perigoso quando os dados crescem.
- **Responder 200 com corpo vazio em vez de 204**, ou 200 em vez de 201 ao criar: funciona, mas confunde quem usa a API.

## Resumo

- Recursos no plural, métodos como verbos, status que dizem o resultado.
- Valide toda entrada (Zod) e responda 400 com detalhes.
- Liste com limite e organize em camadas.

## Próximo passo

Sua API funciona quando tudo dá certo. A próxima aula cuida de quando **não** dá: erros centralizados, variáveis de ambiente, CORS e proteções básicas.

<!-- aula: erros-validacao-e-seguranca -->
## Por que isso importa

Em produção, sua API vai receber dados estranhos, tentativas de abuso e falhas de banco de dados no pior momento. Uma API profissional responde a tudo isso com mensagens claras, sem vazar detalhes internos e sem cair. Segurança não é um recurso extra: é parte de cada rota.

## Conceitos fundamentais

- **Tratador de erros central**: no Express, um middleware com **quatro** parâmetros `(erro, req, res, next)`, registrado por último, recebe qualquer erro lançado nas rotas (inclusive de funções `async`, no Express 5).
- **Não vaze detalhes**: para o cliente, `500` e uma mensagem genérica; para você, o erro completo no log.
- **Erros esperados** (recurso não existe, dado inválido) viram `4xx` com mensagem útil. Uma classe própria, como `ErroHttp`, ajuda a carregar o status.
- **Variáveis de ambiente**: senhas e chaves ficam em `process.env`, nunca no código. Localmente, um arquivo `.env` (fora do Git) carregado com `node --env-file=.env server.js`. Publique um `.env.example` sem valores reais.
- **CORS**: o navegador bloqueia chamadas de um site para uma API de outro domínio, a menos que a API permita. Libere só as origens que você conhece; nunca `*` em APIs com login.
- **Limite de requisições** (*rate limiting*): impede que alguém faça milhares de tentativas de login por minuto (status `429`).
- **Senhas**: guarde só o *hash* (bcrypt ou argon2), nunca a senha em texto.
- **Injeção de SQL**: monte consultas com parâmetros (`$1`, `?`), nunca juntando texto do usuário à consulta.

## Exemplo prático

```js
// erros.js
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function naoEncontrado(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} não existe` });
}

export function tratarErros(erro, req, res, next) {
  if (res.headersSent) return next(erro);
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  if (erro.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido" });
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno. Tente de novo em instantes." });
}
```

```js
// app.js (trechos)
import express from "express";
import cors from "cors";
import { naoEncontrado, tratarErros, ErroHttp } from "./erros.js";

const app = express();
const origens = (process.env.ORIGENS_PERMITIDAS ?? "http://localhost:5173").split(",");
app.use(cors({ origin: origens }));
app.use(express.json({ limit: "100kb" }));

app.get("/livros/:id", async (req, res) => {
  const livro = await buscarLivro(Number(req.params.id));
  if (!livro) throw new ErroHttp(404, "Livro não encontrado");
  res.json(livro);
});

app.use(naoEncontrado);
app.use(tratarErros);

async function buscarLivro(id) {
  return id === 1 ? { id: 1, titulo: "Dom Casmurro" } : null;
}

export default app;
```

```bash
# .env (NUNCA vai para o Git)
ORIGENS_PERMITIDAS=http://localhost:5173,https://meusite.com
DATABASE_URL=postgres://usuario:senha@localhost:5432/livros
```

## Explicando o código

- `ErroHttp` carrega o status; a rota só precisa de `throw new ErroHttp(404, ...)`.
- Como a rota é `async`, o Express 5 entrega o erro lançado ao `tratarErros` automaticamente.
- `naoEncontrado` vem depois de todas as rotas: se nenhuma respondeu, é 404.
- `tratarErros` fica por último e tem quatro parâmetros; é assim que o Express sabe que ele trata erros.
- Erros inesperados aparecem completos no `console.error` (o log do servidor), mas o cliente recebe só uma mensagem genérica.
- `express.json({ limit: "100kb" })` recusa corpos enormes; o pacote `cors` libera só as origens listadas na variável de ambiente.

## Erros comuns

- **Mandar o `erro.stack` para o cliente**: revela caminhos de arquivos, versões e trechos de código.
- **Commitar o `.env`**: coloque-o no `.gitignore` antes do primeiro commit. Se vazou, troque as senhas.
- **`cors({ origin: "*" })` com cookies ou login**: qualquer site pode chamar sua API em nome do usuário.
- **Tratador de erros com três parâmetros**: o Express o trata como middleware comum e ele nunca recebe os erros.

## Resumo

- Um tratador de erros central: 4xx com mensagem útil, 500 genérico e erro completo só no log.
- Segredos em variáveis de ambiente; `.env` fora do Git e `.env.example` documentando.
- CORS restrito, limite de corpo e de requisições, hash de senha e consultas parametrizadas.

## Próximo passo

Falta garantir que tudo continua funcionando a cada mudança e colocar a API no ar. A última aula mostra testes automatizados e publicação.

<!-- aula: testando-e-publicando-apis -->
## Por que isso importa

Uma API sem testes quebra em silêncio: você muda uma rota e outra para de funcionar sem ninguém perceber. Testes automatizados rodam em segundos e dão confiança para mudar o código. E uma API só vale para o portfólio quando está **publicada**, com um link que o recrutador consegue abrir.

## Conceitos fundamentais

- **Teste de integração de API**: sobe a aplicação, faz requisições de verdade e confere status e corpo.
- **`node:test`** é o executor de testes que já vem no Node: `node --test` roda os arquivos `*.test.js`. Junto com `node:assert/strict`, não precisa instalar nada.
- **Porta 0**: ao chamar `listen(0)`, o sistema escolhe uma porta livre. Assim os testes não brigam com o servidor que você deixou rodando.
- **Teste o caminho feliz e os erros**: criar com sucesso, dado inválido (400), recurso inexistente (404).
- **Health check**: uma rota simples como `GET /saude` que responde `200` ajuda a hospedagem a saber se a API está viva.
- **Publicação**: serviços como Render, Railway, Fly.io e Koyeb hospedam APIs Node a partir do repositório do GitHub. Os planos e limites gratuitos mudam com frequência: confira na página de cada um antes de escolher. Em geral você configura o comando de início (`npm start`), as variáveis de ambiente e pronto.
- **Documentação**: um README com as rotas e exemplos de `curl`, ou uma especificação OpenAPI (Swagger), ensina outros a usar sua API.

## Exemplo prático

```js
// tarefas.test.js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "./app.js";

let servidor;
let base;

before(async () => {
  servidor = app.listen(0);
  await new Promise((pronto) => servidor.once("listening", pronto));
  base = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

test("cria uma tarefa e a encontra pelo id", async () => {
  const criada = await fetch(`${base}/tarefas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: "Escrever testes" }),
  });
  assert.equal(criada.status, 201);
  const tarefa = await criada.json();

  const busca = await fetch(`${base}/tarefas/${tarefa.id}`);
  assert.equal(busca.status, 200);
  assert.equal((await busca.json()).titulo, "Escrever testes");
});

test("recusa título vazio com 400", async () => {
  const resposta = await fetch(`${base}/tarefas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: "   " }),
  });
  assert.equal(resposta.status, 400);
});

test("tarefa inexistente dá 404", async () => {
  const resposta = await fetch(`${base}/tarefas/999999`);
  assert.equal(resposta.status, 404);
});
```

No `package.json`:

```texto
"scripts": {
  "start": "node server.js",
  "dev": "node --watch --env-file=.env server.js",
  "test": "node --test"
}
```

## Explicando o código

- O teste importa `app.js`, e não `server.js`: é por isso que separamos os dois na aula de Express.
- `before` sobe o servidor numa porta livre (`listen(0)`) e monta o endereço base; `after` fecha o servidor no fim.
- Cada `test` faz requisições reais com `fetch` e confere o resultado com `assert.equal`.
- Os três testes cobrem sucesso, validação e recurso inexistente: o mínimo para confiar na rota.
- Os scripts deixam claro como rodar em produção (`start`), em desenvolvimento (`dev`, com recarga automática e `.env`) e os testes (`test`).

## Erros comuns

- **Testes que dependem uns dos outros** (um apaga o que o outro criou): cada teste deve preparar os próprios dados.
- **Usar o banco de produção nos testes**: use um banco separado ou dados em memória.
- **Esquecer de configurar as variáveis de ambiente na hospedagem**: a API sobe e quebra na primeira requisição.
- **Fixar a porta no código** (`listen(3000)` em produção): use `process.env.PORT`, que a hospedagem define.

## Resumo

- Separe `app` e `server` para testar sem conflito de porta.
- `node --test` + `fetch` + `assert` testam a API sem instalar nada.
- Para publicar: script `start`, variáveis de ambiente, porta de `process.env.PORT`, rota de saúde e README.

## Próximo passo

Você fechou a trilha de Node.js e APIs. Agora seus dados precisam morar em um lugar de verdade: siga para **Modelagem de Dados** e depois **SQL**, e pratique com o projeto guiado "API REST com autenticação e testes".
