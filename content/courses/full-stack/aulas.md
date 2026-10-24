<!-- aula: arquitetura-full-stack -->
## Por que isso importa

Até aqui você aprendeu as peças separadas: HTML, CSS, JavaScript, React, Node, SQL, Supabase. **Full stack** é saber como elas se encaixam, por onde passa cada requisição e onde cada responsabilidade deve ficar. É isso que permite construir um produto inteiro sozinho e conversar com qualquer parte de um time.

## Conceitos fundamentais

- **Camadas de uma aplicação web**:
  - **Front-end** (navegador): telas, formulários, estados de carregamento e erro. Nunca é confiável: o usuário pode alterar tudo.
  - **Back-end** (API própria ou BaaS): regras de negócio, autorização, validação, integração com serviços externos.
  - **Banco de dados**: guarda os dados e garante integridade com chaves e restrições.
  - **Serviços externos**: pagamentos, e-mail, armazenamento de arquivos, IA.
- **Duas arquiteturas comuns e baratas**:
  1. **Front estático + BaaS** (Supabase): o navegador fala direto com o banco; a segurança fica em RLS e funções. Pouco código de servidor.
  2. **Front + API própria (Node/Express) + banco**: mais controle e mais código; a API é a única que fala com o banco.
- **Onde fica cada regra**: validação **no front** melhora a experiência; validação **no servidor** garante a regra. Pontos, preços, permissões e pagamentos: sempre no servidor.
- **Contrato da API**: combine formato de requisição, resposta e erros (`{ "erro": "mensagem" }`, status HTTP). Front e back trabalham em paralelo a partir dele.
- **Estado**: o que está no servidor (dados) é diferente do que está na tela (formulário sendo digitado, filtro escolhido).

## Exemplo prático

O caminho de "marcar tarefa como feita" numa aplicação com API própria:

```texto
[Navegador / React]
  clique em "concluir"
  → PATCH /api/tarefas/42   Authorization: Bearer <token>   body: { "feita": true }
[API / Express]
  1. confere o token → quem é o usuário?            (autenticação)
  2. a tarefa 42 é desse usuário?                    (autorização)
  3. o corpo é válido? (Zod)                         (validação)
  4. UPDATE tarefas SET feita = true WHERE id = 42 AND user_id = $1
[Banco / PostgreSQL]
  restrições e chaves garantem a integridade
[API]
  → 200 { "id": 42, "titulo": "...", "feita": true }   ou 401 / 403 / 404 / 400
[Navegador]
  atualiza a tela; em caso de erro, mostra a mensagem e desfaz a mudança visual
```

## Explicando o código

- Cada etapa da API tem uma pergunta diferente: **quem é** (autenticação), **pode** (autorização), **está certo** (validação).
- O `WHERE id = 42 AND user_id = $1` é uma segunda barreira: mesmo que a checagem anterior falhe, o banco só altera tarefas do próprio usuário.
- O front trata **todos** os resultados possíveis, não só o 200.
- Na arquitetura com Supabase, os passos 1 a 4 acontecem no banco: o token vai junto da requisição e a política de RLS faz a autorização.

## Erros comuns

- **Regras importantes só no front-end**.
- **Front e back sem contrato definido**: cada um imagina um formato e nada encaixa.
- **API que confia no `user_id` enviado no corpo** em vez de pegar do token.
- **Começar pelo visual** sem saber quais dados e regras existem.

## Resumo

- Front (experiência), back (regras), banco (integridade), serviços externos.
- Front estático + BaaS ou front + API própria: escolha pelo controle que precisa.
- Autenticação, autorização e validação sempre no servidor.

## Próximo passo

Antes de programar, vamos **planejar** um projeto full stack: requisitos, escopo mínimo, dados e telas.

<!-- aula: planejando-o-projeto -->
## Por que isso importa

Projetos pessoais costumam morrer pela metade porque o escopo cresceu demais ou porque a estrutura não aguentou as mudanças. Uma hora de planejamento economiza dias de retrabalho e gera material para o README e para entrevistas ("como você decidiu o que construir?").

## Conceitos fundamentais

- **Problema e público**: uma frase dizendo quem sofre de quê. "Pequenos negócios do bairro anotam agendamentos no caderno e perdem horários."
- **MVP (produto mínimo viável)**: o menor conjunto de funcionalidades que já resolve o problema. O resto vai para uma lista de "depois".
- **Histórias de usuário**: "Como **cliente**, quero **ver os horários livres**, para **marcar sem ligar**." Cada história vira uma ou mais tarefas.
- **Critérios de aceite**: como saber que a história está pronta ("não mostra horários já ocupados", "funciona no celular").
- **Modelagem** dos dados a partir das histórias (trilha de Modelagem de Dados).
- **Mapa de telas e rotas**: quais páginas existem e quais endpoints cada uma usa.
- **Backlog no GitHub**: cada tarefa vira uma *issue*; um quadro (GitHub Projects) mostra o andamento.
- **Fatias verticais**: entregue uma funcionalidade de ponta a ponta (tela + API + banco) antes de começar a próxima, em vez de "todo o front, depois todo o back".

## Exemplo prático

Planejamento de um agendador para uma barbearia:

```texto
Problema: a barbearia perde horários e clientes porque agenda por mensagem.
Público: clientes (marcar) e o dono (organizar o dia).

MVP
  H1 Como cliente, quero ver horários livres de um dia e serviço, para marcar sem ligar.
     Aceite: horários ocupados não aparecem; respeita o horário de funcionamento.
  H2 Como cliente, quero marcar informando nome e telefone.
     Aceite: dois clientes não conseguem o mesmo horário (regra no banco).
  H3 Como dono, quero ver e cancelar os agendamentos do dia, com login.
Depois: lembrete por e-mail, vários profissionais, avaliações.

Dados: servico(id, nome, duracao_min, preco), agendamento(id, servico_id, cliente_nome,
       cliente_telefone, inicio, fim, status)

Telas e endpoints
  /                 → GET /api/servicos
  /agendar/:id      → GET /api/horarios?servico=&dia=   POST /api/agendamentos
  /painel (login)   → GET /api/agendamentos?dia=        PATCH /api/agendamentos/:id

Ordem (fatias verticais): H1 completa → H2 completa → H3 completa → publicar → "Depois"
```

## Explicando o código

- O problema e o público ficam no topo: toda decisão volta a eles ("isso ajuda a barbearia a não perder horário?").
- O MVP tem só três histórias; lembretes e avaliações ficaram para depois, sem culpa.
- Os critérios de aceite já trazem regras de negócio que vão virar restrições (H2) e testes.
- O mapa de telas e endpoints é o **contrato** entre front e back.
- A ordem por fatias garante que, a cada passo, existe algo funcionando de ponta a ponta para mostrar.

## Erros comuns

- **MVP com 20 funcionalidades**.
- **Planejar só as telas** e descobrir as regras de dados no meio do caminho.
- **Fazer todo o front primeiro**: no fim, nada funciona de verdade até o back existir.
- **Não registrar decisões**: no README, uma seção "Decisões técnicas" vale ouro em entrevistas.

## Resumo

- Problema, público e MVP enxuto.
- Histórias com critérios de aceite, modelagem, mapa de telas e endpoints.
- Issues no GitHub e entregas em fatias verticais.

## Próximo passo

Com o plano pronto, vamos ligar o **front-end à API** tratando carregamento, erros e configuração por ambiente.

<!-- aula: front-end-conectado-a-api -->
## Por que isso importa

A maior parte dos bugs que o usuário vê acontece na fronteira entre o front e a API: carregamento infinito, erro escondido, dados desatualizados depois de salvar, CORS bloqueando tudo em produção. Uma camada de comunicação bem feita deixa o app confiável e fácil de manter.

## Conceitos fundamentais

- **Um módulo de API** concentra as chamadas (`api.js`): URL base vinda de variável de ambiente, cabeçalhos, conversão de JSON e tratamento de erro num lugar só.
- **Estados da tela**: carregando, sucesso, vazio e erro. Mostre cada um.
- **Erros da API**: leia a mensagem que o back-end manda (`{ erro }`) e mostre algo útil; para erros de rede, uma mensagem genérica com "tentar de novo".
- **Atualização otimista**: muda a tela antes da resposta e **desfaz** se o servidor recusar. Deixa o app ágil.
- **CORS**: o navegador só deixa o front em `meusite.com` chamar a API em `api.meusite.com` se a API permitir essa origem.
- **Variáveis de ambiente do front** (`VITE_API_URL`) são públicas: servem para endereços, nunca para segredos.

## Exemplo prático

```js
// api.js — toda comunicação com o back-end passa por aqui
const BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export async function api(caminho, { metodo = "GET", corpo, token } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(0, "Sem conexão com o servidor. Verifique a internet e tente de novo.");
  }
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ErroApi(resposta.status, dados?.erro ?? `Erro ${resposta.status}`);
  return dados;
}
```

```jsx
// Tarefas.jsx
import { useEffect, useState } from "react";
import { api } from "./api.js";

export function Tarefas({ token }) {
  const [estado, setEstado] = useState({ tipo: "carregando" });

  async function carregar() {
    setEstado({ tipo: "carregando" });
    try {
      setEstado({ tipo: "ok", tarefas: await api("/api/tarefas", { token }) });
    } catch (erro) {
      setEstado({ tipo: "erro", mensagem: erro.message });
    }
  }

  useEffect(() => {
    carregar();
  }, [token]);

  async function alternar(tarefa) {
    const anterior = estado.tarefas;
    // Otimista: muda na tela já
    setEstado({ tipo: "ok", tarefas: anterior.map((t) => (t.id === tarefa.id ? { ...t, feita: !t.feita } : t)) });
    try {
      await api(`/api/tarefas/${tarefa.id}`, { metodo: "PATCH", corpo: { feita: !tarefa.feita }, token });
    } catch (erro) {
      setEstado({ tipo: "ok", tarefas: anterior, aviso: erro.message }); // desfaz
    }
  }

  if (estado.tipo === "carregando") return <p>Carregando...</p>;
  if (estado.tipo === "erro") {
    return (
      <p role="alert">
        {estado.mensagem} <button onClick={carregar}>Tentar de novo</button>
      </p>
    );
  }
  if (estado.tarefas.length === 0) return <p>Nenhuma tarefa ainda.</p>;
  return (
    <>
      {estado.aviso && <p role="alert">{estado.aviso}</p>}
      <ul>
        {estado.tarefas.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.feita} onChange={() => alternar(t)} /> {t.titulo}
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
```

## Explicando o código

- `api()` resolve, num lugar só, a URL base, o JSON, o token e os erros. As telas não repetem essa lógica.
- Falha de rede vira `ErroApi(0, ...)` com uma mensagem clara; erro da API usa a mensagem que o servidor mandou.
- O componente modela os estados explicitamente (`carregando`, `erro`, `ok`, lista vazia).
- `alternar` atualiza a tela antes da resposta e, se o servidor recusar, volta para a lista anterior e mostra o aviso.
- O botão "Tentar de novo" chama `carregar` sem recarregar a página.

## Erros comuns

- **`fetch` espalhado em todos os componentes**, cada um tratando erro de um jeito (ou não tratando).
- **Ignorar `resposta.ok`**: um 401 vira "lista vazia".
- **Atualização otimista sem desfazer**: a tela mente.
- **URL `localhost` fixa no código publicado**.

## Resumo

- Um módulo de API centraliza URL, cabeçalhos, JSON e erros.
- Telas tratam carregando, vazio, erro e sucesso.
- Atualização otimista com desfazer; CORS e variáveis de ambiente configurados por ambiente.

## Próximo passo

Agora vamos ligar o login de ponta a ponta: do botão "entrar" até a autorização no banco.

<!-- aula: autenticacao-de-ponta-a-ponta -->
## Por que isso importa

Login atravessa todas as camadas: o front guarda a sessão, a API confere o token, o banco aplica as permissões. Uma falha em qualquer ponto vira uma brecha. Entender o fluxo completo é o que separa "o login funciona" de "o login é seguro".

## Conceitos fundamentais

- **Autenticação**: provar quem você é (senha, Google). **Autorização**: decidir o que você pode fazer.
- **Token de acesso (JWT)**: depois do login, o cliente recebe um token assinado pelo servidor de autenticação. Ele vai em cada requisição (`Authorization: Bearer ...`). O servidor confere a **assinatura** e a **validade**; ninguém consegue alterar o conteúdo sem invalidar a assinatura.
- **Token de atualização (refresh)**: renova o acesso sem pedir login de novo. Tokens de acesso curtos limitam o estrago se vazarem.
- **Onde guardar no navegador**: bibliotecas como o supabase-js guardam a sessão por você. Cookies `HttpOnly` não são lidos por JavaScript (protegem contra XSS) mas exigem cuidado com CSRF. Em qualquer caso, **evite XSS**, porque um script injetado age como o usuário.
- **Na API**: um middleware confere o token e coloca o usuário em `req`. As rotas usam **o id do token**, nunca um `user_id` vindo do corpo.
- **Papéis (roles)**: "admin", "dono", "cliente". Guarde no servidor, num lugar que o próprio usuário não consegue alterar.
- **Proteção de rotas no front** (redirecionar quem não está logado) é só conforto: a proteção de verdade é a API/banco.

## Exemplo prático

Uma API Express que aceita os tokens do Supabase Auth e aplica autorização:

```js
// auth.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function exigeLogin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ erro: "Faça login." });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  req.usuario = { id: data.user.id, email: data.user.email };
  next();
}

export function exigePapel(...papeis) {
  return async (req, res, next) => {
    const papel = await buscarPapel(req.usuario.id); // vem do banco, não da requisição
    if (!papeis.includes(papel)) return res.status(403).json({ erro: "Você não tem permissão para isso." });
    next();
  };
}

async function buscarPapel(userId) {
  // Exemplo: select papel from equipe where user_id = $1
  return userId ? "cliente" : "visitante";
}
```

```js
// rotas.js (trechos)
import { Router } from "express";
import { exigeLogin, exigePapel } from "./auth.js";

const router = Router();

router.get("/minhas-reservas", exigeLogin, async (req, res) => {
  // usa o id do TOKEN, não um id enviado pelo cliente
  res.json(await listarReservasDe(req.usuario.id));
});

router.delete("/reservas/:id", exigeLogin, exigePapel("dono", "admin"), async (req, res) => {
  await cancelarReserva(Number(req.params.id));
  res.sendStatus(204);
});

async function listarReservasDe(userId) {
  return [{ id: 1, user_id: userId }];
}
async function cancelarReserva() {}

export default router;
```

## Explicando o código

- `exigeLogin` lê o token do cabeçalho e pergunta ao Supabase Auth se ele é válido; se não for, 401.
- O usuário confirmado vai para `req.usuario`, e as rotas usam `req.usuario.id`: um cliente não consegue pedir as reservas de outra pessoa trocando um parâmetro.
- `exigePapel` busca o papel **no banco** e responde 403 para quem está logado mas não pode.
- A ordem dos middlewares importa: primeiro identifica (`exigeLogin`), depois autoriza (`exigePapel`).

## Erros comuns

- **Confiar em `req.body.userId`** ou em um campo `isAdmin` enviado pelo cliente.
- **Responder 404 e 403 de forma que revele demais** (ex.: "este e-mail existe") em telas públicas.
- **Esconder o botão "excluir" no front** achando que isso protege a ação.
- **Tokens de acesso que nunca expiram**.

## Resumo

- Autenticação diz quem é; autorização diz o que pode.
- A API confere o token e usa o id dele; papéis vêm do servidor.
- Proteção no front é conforto; a segurança está na API e no banco.

## Próximo passo

Com login funcionando, vamos revisar as principais **falhas de segurança** de aplicações web e como evitá-las.

<!-- aula: seguranca-em-aplicacoes-web -->
## Por que isso importa

O **OWASP Top 10** lista as falhas mais exploradas em aplicações web, e a maioria aparece em projetos pequenos: controle de acesso quebrado, injeção, XSS, configurações inseguras. Conhecer e prevenir essas falhas protege seus usuários e é tema certo em entrevistas para vagas de desenvolvimento.

## Conceitos fundamentais

- **Controle de acesso quebrado**: usuário acessa dados de outro trocando um id na URL. Defesa: autorização no servidor em toda rota, RLS no banco, ids não sequenciais quando fizer sentido.
- **Injeção (SQL e outras)**: texto do usuário vira comando. Defesa: consultas parametrizadas, nunca concatenar.
- **XSS (Cross-Site Scripting)**: o site exibe como HTML um texto que contém `<script>`. Defesa: exibir como **texto** (React já escapa por padrão), nunca `innerHTML`/`dangerouslySetInnerHTML` com conteúdo do usuário sem sanitizar, e uma política de segurança de conteúdo (CSP) quando possível.
- **CSRF**: outro site faz o navegador da vítima enviar uma requisição com os cookies dela. Defesa: cookies `SameSite`, tokens anti-CSRF ou autenticação por cabeçalho `Authorization`.
- **Falhas de autenticação**: senhas fracas sem limite de tentativas, tokens que não expiram. Defesa: provedores prontos, limite de tentativas, expiração.
- **Dados sensíveis expostos**: segredos no front ou no Git, respostas que devolvem colunas demais. Defesa: selecionar só as colunas necessárias, segredos no servidor.
- **Configuração insegura**: CORS `*`, mensagens de erro com stack trace, painéis de administração abertos.
- **Componentes vulneráveis**: dependências desatualizadas. Defesa: `npm audit`, atualizações regulares, avisos do GitHub (Dependabot).
- **Limite de requisições** contra abuso e força bruta.

## Exemplo prático

XSS na prática, e a forma segura:

```js
const comentario = '<img src=x onerror="alert(document.cookie)">';

// PERIGOSO: o navegador interpreta como HTML e executa o onerror
function mostrarInseguro(lista) {
  lista.innerHTML += `<li>${comentario}</li>`;
}

// SEGURO: textContent trata tudo como texto
function mostrarSeguro(lista) {
  const li = document.createElement("li");
  li.textContent = comentario;
  lista.append(li);
}
```

Limite simples de tentativas por IP em uma API Express (em memória, para uma instância só):

```js
const tentativas = new Map();

export function limitarTentativas({ maximo = 5, janelaMs = 15 * 60 * 1000 } = {}) {
  return (req, res, next) => {
    const agora = Date.now();
    const chave = req.ip;
    const registro = tentativas.get(chave) ?? { quantidade: 0, inicio: agora };
    if (agora - registro.inicio > janelaMs) {
      registro.quantidade = 0;
      registro.inicio = agora;
    }
    registro.quantidade += 1;
    tentativas.set(chave, registro);
    if (registro.quantidade > maximo) {
      return res.status(429).json({ erro: "Muitas tentativas. Tente de novo em alguns minutos." });
    }
    next();
  };
}
```

## Explicando o código

- No exemplo inseguro, o texto vira HTML e o atributo `onerror` executa JavaScript com acesso à página. No seguro, `textContent` mostra os caracteres literalmente.
- Em React, `{comentario}` já é seguro; o perigo volta com `dangerouslySetInnerHTML`.
- O limitador conta tentativas por IP numa janela de 15 minutos e responde **429** quando passa do máximo. Em produção com várias instâncias, o contador precisa ficar num lugar compartilhado (banco ou cache).
- Combine o limite com mensagens genéricas no login ("e-mail ou senha inválidos"), para não revelar quais e-mails existem.

## Erros comuns

- **`innerHTML` com dados de usuário**.
- **Confiar em ids na URL** sem checar o dono.
- **Expor `error.stack` nas respostas**.
- **Nunca atualizar dependências**.

## Resumo

- Controle de acesso, injeção e XSS são as falhas mais comuns.
- Autorização no servidor, consultas parametrizadas e saída como texto.
- Limite de tentativas, mensagens genéricas, segredos protegidos e dependências em dia.

## Próximo passo

Última aula: transformar o projeto em um **produto publicado e apresentável no portfólio**.

<!-- aula: do-mvp-ao-portfolio -->
## Por que isso importa

Um projeto só conta no portfólio se a pessoa que avalia consegue **abrir, entender e confiar** nele em poucos minutos. Link funcionando, README claro, testes e decisões documentadas transformam "mais um CRUD" em evidência de que você sabe construir software de verdade.

## Conceitos fundamentais

- **Publicado e estável**: link no topo do README, com dados de exemplo e, se tiver login, uma forma fácil de testar (conta de demonstração com permissões limitadas ou login social).
- **README que vende sem exagerar**:
  - o problema e para quem é;
  - imagem ou GIF curto do uso;
  - tecnologias e **por que** foram escolhidas;
  - como rodar localmente (`.env.example`, comandos);
  - decisões técnicas e limitações conhecidas;
  - seção de segurança e testes.
- **Qualidade visível**: testes no CI (selo verde), lint, commits pequenos e descritivos, issues fechadas.
- **Iteração**: publique o MVP, peça para alguém usar, anote os problemas, corrija. Registrar isso ("o que aprendi com o primeiro uso") é ótimo em entrevistas.
- **Apresentação**: post no LinkedIn com um GIF e **um** problema técnico que você resolveu; o mesmo assunto vira resposta para "me conte sobre um projeto".

## Exemplo prático

Um modelo de README para projeto full stack:

```texto
# Agenda Fácil — agendamento online para barbearias

Link: https://usuario.github.io/agenda-facil/  ·  Status: em uso por 1 barbearia do bairro

![Demonstração](docs/demo.gif)

## O problema
Agendamentos por mensagem geravam horários duplicados e esquecidos.

## O que faz
- Cliente escolhe serviço, dia e horário livre e marca sem criar conta.
- Dono vê, confirma e cancela os agendamentos do dia (com login).

## Tecnologias e decisões
- React + Vite (front estático no GitHub Pages: custo zero).
- Supabase (PostgreSQL + Auth): RLS para o painel do dono.
- Conflito de horário impedido NO BANCO com restrição de exclusão,
  não só na tela (dois clientes clicando ao mesmo tempo).

## Rodando localmente
cp .env.example .env    # preencha com a URL e a chave publishable do seu Supabase
npm ci && npm run dev

## Qualidade e segurança
- 42 testes (Vitest) no CI a cada push · lint e TypeScript estrito
- RLS em todas as tabelas, testada com duas contas
- Nenhum segredo no front-end; dados pessoais mínimos (nome e telefone)

## Limitações e próximos passos
- Um profissional por agenda; lembretes por e-mail ainda não existem.
```

## Explicando o código

- Link e status no topo: quem avalia vê o projeto funcionando antes de ler qualquer coisa.
- A seção de decisões mostra raciocínio ("por que no banco e não só na tela"), que é o que entrevistadores querem ouvir.
- "Rodando localmente" com `.env.example` mostra cuidado com segredos e facilita para quem quiser testar.
- Limitações honestas passam mais confiança do que prometer tudo.
- Os números (testes, usuários) devem ser **reais**: nunca invente métricas.

## Erros comuns

- **Link quebrado ou projeto que não abre** sem configuração.
- **README genérico** do template ("This project was bootstrapped with...").
- **Inventar números ou depoimentos**.
- **Parar no MVP sem nunca colocar alguém para usar**.

## Resumo

- Publicado, estável e fácil de testar.
- README com problema, demonstração, decisões, como rodar, qualidade e limitações.
- Itere com usuários reais e conte essa história no LinkedIn e nas entrevistas.

## Próximo passo

Você concluiu a trilha Full Stack. Escolha um dos **projetos de portfólio** (como o agendador ou o kanban em tempo real) e construa do planejamento ao README, seguindo estas aulas.
