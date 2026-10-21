## Visão geral

Um encurtador parece simples, mas toca em quase tudo que uma vaga full stack pede: banco com restrições, autenticação, regras de acesso por usuário, validação de entrada e um pouco de segurança (não deixar o seu link virar ferramenta de golpe).

Pré-requisitos: trilhas de **SQL**, **Supabase** e **React** (ou JavaScript puro).

## Requisitos

- Login (Google ou e-mail) com o Supabase Auth.
- Criar link curto a partir de uma URL `http`/`https`, com código de 6 caracteres.
- Página `/r?c=CODIGO` (ou rota equivalente) que registra o clique e redireciona.
- Lista "Meus links" com total de cliques e botão de apagar.
- Políticas RLS: cada pessoa só lê e apaga os próprios links.

## Etapas

1. Modele as tabelas `links` e `cliques` e escreva as restrições.
2. Ative a RLS e escreva as políticas. Teste com duas contas diferentes.
3. Crie uma função no banco para registrar o clique e devolver a URL (assim ninguém precisa ler a tabela inteira).
4. Faça a tela de criar link com validação e a lista com os totais.
5. Monte o gráfico de cliques por dia.
6. Documente o modelo e as políticas no README.

## Código de partida

```sql
create table public.links (
  id bigint generated always as identity primary key,
  dono uuid not null references auth.users (id) on delete cascade,
  codigo text not null unique check (codigo ~ '^[A-Za-z0-9]{6}$'),
  url text not null check (url ~ '^https?://'),
  criado_em timestamptz not null default now()
);

create table public.cliques (
  id bigint generated always as identity primary key,
  link_id bigint not null references public.links (id) on delete cascade,
  em timestamptz not null default now()
);

alter table public.links enable row level security;
alter table public.cliques enable row level security;

create policy "dono lê os próprios links" on public.links
  for select using (dono = (select auth.uid()));
create policy "dono cria links para si" on public.links
  for insert with check (dono = (select auth.uid()));
create policy "dono apaga os próprios links" on public.links
  for delete using (dono = (select auth.uid()));

-- Visitante anônimo não lê a tabela: só chama esta função.
create function public.abrir_link(p_codigo text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_url text;
begin
  select id, url into v_id, v_url from public.links where codigo = p_codigo;
  if v_id is null then return null; end if;
  insert into public.cliques (link_id) values (v_id);
  return v_url;
end;
$$;
```

## Melhorias opcionais

- Código personalizado (`/r?c=minha-palestra`) com checagem de disponibilidade.
- Data de expiração do link.
- Bloquear domínios suspeitos usando uma lista simples.

## Como apresentar no currículo

Aqui o destaque é segurança e banco de dados.

> **Encurtador de links (Supabase + PostgreSQL)** — autenticação com Google, links com código único garantido por restrição no banco, políticas RLS testadas com múltiplos usuários e contagem de cliques via função SECURITY DEFINER. [link] · [repositório]

Se perguntarem "por que não ler a tabela direto no front?", você tem a resposta pronta: o visitante anônimo não deve conseguir listar todos os links.
