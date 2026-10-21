## Visão geral

O Tarefas+ passa a ter contas e dados permanentes. Você vai modelar as tabelas, criar o banco no **Supabase** (PostgreSQL), adicionar login e, principalmente, garantir com **Row Level Security** que cada pessoa veja e altere só as próprias tarefas.

Pré-requisitos: trilhas de **Modelagem de dados**, **SQL** e **Supabase**.

## Requisitos

- Tabela `tarefas` com dono (`usuario_id`) ligado ao usuário autenticado.
- Cadastro, login e logout.
- Políticas RLS para ler, criar, alterar e remover apenas as próprias tarefas.
- Chaves no front-end: só a chave pública (anon). A chave de serviço nunca sai do servidor.

## Etapas

1. Desenhe o modelo: quais entidades, atributos e relacionamentos existem?
2. Crie a tabela pelo editor SQL do Supabase e ative o RLS.
3. Escreva as políticas e **teste com duas contas diferentes**: uma não pode ver as tarefas da outra.
4. Ligue o front-end ao Supabase com a biblioteca oficial.
5. Revise o repositório: nenhum segredo versionado (`.env` no `.gitignore`).

## Código de partida

```sql
create table public.tarefas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 200),
  feita boolean not null default false,
  criada_em timestamptz not null default now()
);

alter table public.tarefas enable row level security;

create policy "ver as próprias tarefas" on public.tarefas
  for select to authenticated using (usuario_id = (select auth.uid()));

create policy "criar as próprias tarefas" on public.tarefas
  for insert to authenticated with check (usuario_id = (select auth.uid()));

create policy "alterar as próprias tarefas" on public.tarefas
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "remover as próprias tarefas" on public.tarefas
  for delete to authenticated using (usuario_id = (select auth.uid()));
```

## Melhorias opcionais

- Recuperação de senha por e-mail.
- Atualização em tempo real entre abas com Realtime.
- Categorias de tarefas em uma tabela própria (relacionamento 1:N).
