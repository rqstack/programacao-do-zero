## Visão geral

Vagas de back-end quase sempre pedem uma API com autenticação no teste técnico. Este projeto é esse teste, feito com calma e do jeito certo: senha com hash, token com validade, validação de entrada, testes automatizados e documentação.

Pré-requisitos: trilhas de **Node.js e APIs**, **SQL** e **TypeScript**.

## Requisitos

- `POST /auth/cadastro` e `POST /auth/login` (devolve um token JWT com validade curta).
- Rotas de um recurso à sua escolha (ex.: `/livros`) com listar, criar, editar e apagar, só para quem está logado.
- Cada usuário só mexe nos próprios registros.
- Validação de entrada com Zod e respostas de erro padronizadas.
- Testes automatizados e documentação OpenAPI em `/docs`.

## Etapas

1. Crie o projeto com Express e TypeScript e uma rota `GET /saude`.
2. Modele as tabelas `usuarios` e do seu recurso no PostgreSQL.
3. Implemente o cadastro com hash da senha e o login gerando o token.
4. Escreva o middleware que confere o token e coloca o usuário na requisição.
5. Faça o CRUD do recurso com validação.
6. Escreva os testes (Vitest + Supertest) e a documentação OpenAPI.

## Código de partida

```ts
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const app = express();
app.use(express.json());
const SEGREDO = process.env.JWT_SEGREDO ?? "";
if (SEGREDO.length < 32) throw new Error("Defina JWT_SEGREDO com pelo menos 32 caracteres no .env");

const credenciais = z.object({ email: z.string().email(), senha: z.string().min(8) });

// Em memória só para começar; troque pelo PostgreSQL na etapa 2.
const usuarios = new Map<string, { id: number; hash: string }>();

app.post("/auth/cadastro", async (req, res) => {
  const dados = credenciais.safeParse(req.body);
  if (!dados.success) return res.status(400).json({ erro: "E-mail ou senha inválidos" });
  if (usuarios.has(dados.data.email)) return res.status(409).json({ erro: "E-mail já cadastrado" });
  const hash = await bcrypt.hash(dados.data.senha, 12);
  usuarios.set(dados.data.email, { id: usuarios.size + 1, hash });
  return res.status(201).json({ ok: true });
});

app.post("/auth/login", async (req, res) => {
  const dados = credenciais.safeParse(req.body);
  const usuario = dados.success ? usuarios.get(dados.data.email) : undefined;
  // Mesma mensagem para e-mail inexistente e senha errada: não revela quem tem conta.
  if (!dados.success || !usuario || !(await bcrypt.compare(dados.data.senha, usuario.hash))) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }
  const token = jwt.sign({ sub: usuario.id }, SEGREDO, { expiresIn: "15m" });
  return res.json({ token });
});

export function exigeLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  try {
    res.locals.usuarioId = Number(jwt.verify(token ?? "", SEGREDO).sub);
    next();
  } catch {
    res.status(401).json({ erro: "Faça login" });
  }
}

export default app;
```

## Melhorias opcionais

- Limite de tentativas de login por IP (rate limiting).
- Refresh token com rotação.
- Rodar a API e o banco com Docker Compose e publicar num serviço gratuito.

## Como apresentar no currículo

Para back-end, mostre que você pensa em segurança e em qualidade.

> **API REST de [recurso] (Node.js + Express + PostgreSQL)** — autenticação com JWT e senhas com bcrypt, validação com Zod, autorização por dono do registro, testes automatizados com Supertest e documentação OpenAPI. [documentação] · [repositório]

No README, inclua uma seção "Decisões de segurança" listando o que você fez e por quê (hash, mensagem de erro genérica no login, validade curta do token). Poucos candidatos fazem isso.
