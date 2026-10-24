<!-- aula: o-que-e-supabase -->
## Por que isso importa

Construir um back-end completo (banco, login, armazenamento de arquivos, API) do zero leva semanas. O **Supabase** entrega tudo isso pronto em cima do PostgreSQL, com um plano gratuito que atende projetos pessoais e de portfólio. Este próprio site usa Supabase para login, ranking e a Batalha de Código. Entender como ele funciona, e principalmente **onde fica a segurança**, permite lançar projetos reais sem pagar servidor.

## Conceitos fundamentais

- **Supabase** é uma plataforma de back-end (BaaS, *backend as a service*) de código aberto. Cada projeto tem:
  - **Database**: um PostgreSQL de verdade (tudo que você aprendeu de SQL vale aqui).
  - **Auth**: cadastro e login (e-mail, Google, GitHub...).
  - **API automática** (PostgREST): cada tabela vira um endpoint REST.
  - **Storage**: arquivos (imagens, PDFs) com regras de acesso.
  - **Edge Functions**: funções em TypeScript (Deno) que rodam no servidor.
  - **Realtime**: avisos ao vivo quando dados mudam.
- **Chaves de API**:
  - **publishable/anon**: pública, vai no front-end. Sozinha não dá acesso a nada além do que as regras permitem.
  - **secret/service_role**: ignora todas as regras de segurança. **Nunca** vai para o navegador nem para o repositório.
- A segurança vem do **banco**: regras de **Row Level Security (RLS)** e funções. Como a chave pública é pública, quem protege os dados é o PostgreSQL.
- **Plano gratuito**: tem limites de banco, usuários, armazenamento e chamadas, e pausa projetos sem uso por um período. Confira os números atuais na página de preços do Supabase antes de planejar o projeto.

## Exemplo prático

Fluxo para começar um projeto:

```texto
1. supabase.com/dashboard → New project (plano Free, região São Paulo)
2. Guarde a senha do banco num gerenciador de senhas
3. Project Settings → API: copie a Project URL e a chave publishable/anon
4. No seu projeto front-end, crie .env.local (fora do Git):
     NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
5. SQL Editor: crie as tabelas e LIGUE o RLS em cada uma
```

E a criação do cliente no navegador:

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
```

## Explicando o código

- A URL e a chave **publishable/anon** vão para o front-end porque precisam: o navegador conversa direto com o Supabase.
- Por isso, **sem RLS**, qualquer pessoa com a chave pública conseguiria ler e alterar suas tabelas. O passo 5 não é opcional.
- O `.env.local` fica fora do Git por organização; mas lembre: o que vai para o navegador **não é segredo**.
- A chave **service_role** só aparece em código de servidor (Edge Functions, back-end próprio), e lá ela vem de variáveis de ambiente.

## Erros comuns

- **Colocar a service_role no front-end** "porque o erro de permissão sumiu": você acabou de dar acesso total ao banco para qualquer visitante.
- **Criar tabela sem ligar o RLS**.
- **Esquecer que o projeto gratuito pausa** sem uso: basta reativar no painel; os dados não se perdem.
- **Confiar que "ninguém vai achar a URL"**: a URL e a chave pública estão no código do site.

## Resumo

- Supabase = PostgreSQL + Auth + API + Storage + Edge Functions, com plano gratuito.
- Chave publishable/anon é pública; service_role é secreta e ignora as regras.
- A segurança fica no banco: RLS em todas as tabelas.

## Próximo passo

Na próxima aula você vai ler e gravar dados com o **supabase-js**.

<!-- aula: crud-com-supabase-js -->
## Por que isso importa

A biblioteca **supabase-js** transforma chamadas como `.from("tarefas").select()` em requisições para a API do seu banco. Com ela, um front-end em React ou HTML puro consegue fazer um CRUD completo sem você escrever um servidor. Saber tratar os erros e os filtros é o que faz a tela funcionar de verdade.

## Conceitos fundamentais

- **Ler**: `supabase.from("tabela").select("colunas")`, com filtros `.eq()`, `.neq()`, `.gt()`, `.ilike()`, `.in()`, ordenação `.order()` e limite `.limit()`/`.range()`.
- **Criar**: `.insert({...})`; **alterar**: `.update({...}).eq("id", id)`; **apagar**: `.delete().eq("id", id)`.
- Todo resultado vem como **`{ data, error }`**. A biblioteca **não lança erro**: confira `error` sempre.
- `.select()` depois de `insert`/`update` devolve as linhas afetadas.
- `.single()` espera exatamente uma linha; `.maybeSingle()` aceita zero ou uma.
- **Relacionamentos**: `select("id, titulo, autor(nome)")` traz dados da tabela ligada pela chave estrangeira.
- Tudo passa pelas regras de **RLS**: se a política não permitir, você recebe lista vazia ou erro, não os dados.

## Exemplo prático

```js
import { supabase } from "./supabase.js";

export async function listarTarefas() {
  const { data, error } = await supabase
    .from("tarefas")
    .select("id, titulo, feita, criada_em")
    .order("criada_em", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Não foi possível carregar as tarefas: ${error.message}`);
  return data;
}

export async function criarTarefa(titulo) {
  const texto = titulo.trim();
  if (!texto) throw new Error("Escreva um título.");
  const { data, error } = await supabase.from("tarefas").insert({ titulo: texto }).select().single();
  if (error) throw new Error(`Não foi possível salvar: ${error.message}`);
  return data;
}

export async function concluirTarefa(id) {
  const { error } = await supabase.from("tarefas").update({ feita: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function apagarTarefa(id) {
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

## Explicando o código

- `.select("id, titulo, feita, criada_em")` pede só as colunas usadas na tela (mais rápido e não vaza o que não precisa).
- `.order(..., { ascending: false })` e `.limit(50)` evitam trazer milhares de linhas.
- Cada função confere `error` e transforma em uma mensagem que a interface pode mostrar.
- `criarTarefa` valida o texto antes de enviar, mas o banco também precisa validar (com `check` e RLS), porque o navegador pode ser manipulado.
- `.insert(...).select().single()` devolve a tarefa criada, com o `id` gerado pelo banco.
- `.eq("id", id)` no `update` e no `delete` é essencial: sem filtro, a operação valeria para todas as linhas que a RLS permitir.

## Erros comuns

- **Não conferir `error`** e mostrar uma lista vazia como se não houvesse dados.
- **Achar que lista vazia é bug**: muitas vezes é a RLS bloqueando (o que é bom).
- **`update`/`delete` sem filtro**.
- **Validar só no front-end**.

## Resumo

- `from().select/insert/update/delete` com filtros encadeados.
- Sempre trate `{ data, error }`.
- RLS decide o que cada pessoa vê e altera; o front-end só pede.

## Próximo passo

Para a RLS saber "quem é quem", o usuário precisa estar logado. A próxima aula mostra a **autenticação**.

<!-- aula: autenticacao-com-supabase -->
## Por que isso importa

Login é uma das partes mais delicadas de um sistema: senhas, sessões, tokens, recuperação de conta. Fazer isso do zero é arriscado. O Supabase Auth cuida da parte difícil e entrega uma sessão com um token que o banco reconhece. Você precisa saber configurar, usar e testar o fluxo.

## Conceitos fundamentais

- **Provedores**: e-mail e senha, link mágico, e OAuth (Google, GitHub...). Cada provedor precisa ser **ativado** no painel (Authentication → Sign In / Providers). Se não estiver, o Supabase responde `provider is not enabled`.
- **OAuth** (ex.: Google): você cria um "cliente OAuth" no console do Google, com a URL de callback do Supabase, e cola o **Client ID** e o **Client Secret** no painel do Supabase. O secret fica só lá.
- **URLs de redirecionamento**: o Supabase só devolve o usuário para endereços cadastrados em *URL Configuration* (Site URL e Redirect URLs).
- **Sessão**: depois do login, o navegador guarda um **access token (JWT)** curto e um **refresh token**. O supabase-js renova sozinho.
- **PKCE**: o fluxo recomendado para sites; troca um código por sessão na volta do provedor.
- **`onAuthStateChange`**: avisa quando a pessoa entra, sai ou a sessão é renovada.
- No banco, **`auth.uid()`** devolve o id do usuário da requisição; é a base da RLS.
- **Perfil**: dados extras (nome público, foto) ficam numa tabela `profiles` ligada a `auth.users`, criada por um gatilho no primeiro login.

## Exemplo prático

```js
import { supabase } from "./supabase.js";

export async function entrarComGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/entrar/` },
  });
  if (error) throw error;
}

export async function sair() {
  await supabase.auth.signOut();
}

// Reage a login, logout e renovação de sessão
supabase.auth.onAuthStateChange((evento, sessao) => {
  if (evento === "SIGNED_IN") console.log("Entrou:", sessao.user.email);
  if (evento === "SIGNED_OUT") console.log("Saiu");
});

// Na carga da página: já existe sessão?
const { data } = await supabase.auth.getSession();
console.log(data.session ? "logado" : "visitante");
```

Checklist do OAuth com Google:

```texto
Google Cloud Console → Credenciais → ID do cliente OAuth (Aplicativo da Web)
  Origens JavaScript autorizadas: https://seusite.com
  URI de redirecionamento: https://SEU-PROJETO.supabase.co/auth/v1/callback
Supabase → Authentication → Sign In / Providers → Google: ativar + Client ID + Client Secret
Supabase → Authentication → URL Configuration:
  Site URL: https://seusite.com
  Redirect URLs: https://seusite.com/entrar/ e http://localhost:3000/entrar/
Google → Tela de permissão OAuth: publicar o app (em modo Teste só entram e-mails de teste)
```

## Explicando o código

- `signInWithOAuth` leva a pessoa para o Google; na volta, o Supabase cria a sessão e redireciona para `redirectTo`, que precisa estar na lista de URLs permitidas.
- `onAuthStateChange` é o lugar para atualizar a interface (mostrar o avatar, carregar dados do usuário).
- `getSession` lê a sessão salva, então quem recarrega a página continua logado.
- No checklist, cada item corresponde a um erro comum: provedor desativado, callback errado, URL não autorizada, app do Google em modo de teste.

## Erros comuns

- **`Unsupported provider: provider is not enabled`**: o provedor não foi ativado no painel do Supabase.
- **`redirect_uri_mismatch`** no Google: o callback cadastrado no Google não é exatamente o do Supabase.
- **Voltar para a página inicial em vez da página de login**: `redirectTo` fora das Redirect URLs.
- **Colocar o Client Secret no front-end ou no repositório**.

## Resumo

- Ative cada provedor no painel; OAuth precisa de Client ID e Secret do provedor.
- Configure Site URL, Redirect URLs e o callback exato.
- `auth.uid()` liga a sessão às regras do banco.

## Próximo passo

Com usuários identificados, vem a parte mais importante: escrever regras de **Row Level Security**.

<!-- aula: row-level-security -->
## Por que isso importa

No Supabase, o navegador fala direto com o banco usando uma chave pública. A única coisa que impede uma pessoa de ler as tarefas de outra é a **Row Level Security**. Uma política errada é um vazamento de dados; uma tabela sem RLS é uma porta aberta. Esta é a aula mais importante da trilha.

## Conceitos fundamentais

- `alter table ... enable row level security;` liga a RLS. **Com RLS ligada e nenhuma política, ninguém acessa nada** (fora a service_role): o padrão é negar.
- **Política** (`create policy`) define, para uma operação, quais linhas são permitidas:
  - `for select ... using (condição)`: quais linhas a pessoa **vê**.
  - `for insert ... with check (condição)`: quais linhas ela pode **criar**.
  - `for update ... using (...) with check (...)`: o que pode alterar e como a linha precisa ficar depois.
  - `for delete ... using (...)`: o que pode apagar.
- `to authenticated` / `to anon` restringe a política a logados ou visitantes.
- A condição mais comum: `user_id = (select auth.uid())`. O `select` em volta faz o PostgreSQL calcular o id uma vez por consulta (mais rápido).
- **Permissões de coluna** (`grant update (titulo, feita) on ...`) impedem alterar colunas sensíveis mesmo nas linhas permitidas.
- **Teste** as políticas com dois usuários diferentes: o que um vê, o outro não pode ver.

## Exemplo prático

```pgsql
create table public.tarefas (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  feita boolean not null default false,
  criada_em timestamptz not null default now()
);

alter table public.tarefas enable row level security;

-- Cada pessoa vê só as próprias tarefas
create policy "ver as próprias" on public.tarefas
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Só cria tarefas em seu próprio nome
create policy "criar as próprias" on public.tarefas
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Só altera as próprias, e não pode "doar" a tarefa para outra pessoa
create policy "alterar as próprias" on public.tarefas
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "apagar as próprias" on public.tarefas
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Mesmo nas próprias linhas, só estas colunas podem ser alteradas
revoke update on public.tarefas from authenticated;
grant update (titulo, feita) on public.tarefas to authenticated;
```

## Explicando o código

- `user_id ... default auth.uid()` preenche o dono automaticamente com quem está logado.
- Sem as políticas, a RLS ligada bloquearia tudo; cada política abre exatamente uma operação.
- O `with check` no insert impede alguém de criar uma tarefa com o `user_id` de outra pessoa.
- No update, `using` diz quais linhas pode alterar e `with check` garante que, depois da alteração, a linha continua sendo dela.
- `grant update (titulo, feita)` impede mudar `user_id` ou `criada_em` diretamente, mesmo nas próprias tarefas.
- Visitantes (`anon`) não têm nenhuma política: não veem nada.

## Erros comuns

- **`using (true)`** em uma tabela com dados pessoais: todo mundo vê tudo.
- **Esquecer o `with check`** no insert/update.
- **Confiar em uma coluna que o próprio usuário pode alterar** (como `role = 'admin'` na tabela de perfis sem restringir quem altera).
- **Testar só com um usuário**: o vazamento aparece quando outra pessoa acessa.

## Resumo

- RLS ligada + nenhuma política = acesso negado. Cada política libera uma operação.
- `using` filtra o que se vê/altera; `with check` valida o que se grava.
- Use `(select auth.uid())`, permissões de coluna e teste com duas contas.

## Próximo passo

Algumas regras não cabem em uma política (dar XP só uma vez, decidir o vencedor de uma partida). Para isso existem **funções no banco**.

<!-- aula: funcoes-e-regras-no-servidor -->
## Por que isso importa

Se a regra "cada aula dá XP uma única vez" estivesse só no navegador, bastaria abrir o console para ganhar XP infinito. Regras que envolvem pontos, dinheiro, estoque ou permissões precisam rodar no **servidor**. No Supabase, a forma mais direta é uma **função no PostgreSQL** chamada pelo front-end via `rpc()`.

## Conceitos fundamentais

- **Função** (`create function ... language plpgsql`) roda dentro do banco, perto dos dados, numa transação.
- **`security invoker`** (padrão): roda com as permissões de quem chamou (a RLS continua valendo).
- **`security definer`**: roda com as permissões do dono da função, **ignorando a RLS**. Poderosa e perigosa: use para operações controladas, validando tudo dentro dela.
- Boas práticas em funções `security definer`:
  - `set search_path = ''` e nomes completos (`public.tabela`), para ninguém trocar uma tabela por outra.
  - Conferir `auth.uid()` e recusar se for nulo.
  - Validar cada parâmetro.
  - `revoke execute ... from public, anon` e liberar só para quem precisa.
- No front-end: `supabase.rpc("nome_da_funcao", { parametro: valor })`.
- **Edge Functions** (próxima aula) servem para lógica que precisa de segredos ou serviços externos.

## Exemplo prático

Um sistema de XP em que o navegador só diz **o que** foi concluído, e o banco decide **quanto** vale e se já foi contado (é a ideia usada neste site):

```pgsql
create table public.xp_fontes (
  chave text primary key,              -- ex.: 'aula:variaveis'
  pontos integer not null check (pontos between 1 and 500)
);

create table public.xp_eventos (
  user_id uuid not null references auth.users (id) on delete cascade,
  chave text not null references public.xp_fontes (chave),
  pontos integer not null,
  ganho_em timestamptz not null default now(),
  primary key (user_id, chave)         -- cada atividade conta uma vez por pessoa
);

alter table public.xp_fontes enable row level security;
alter table public.xp_eventos enable row level security;
create policy "ver o próprio xp" on public.xp_eventos
  for select to authenticated using (user_id = (select auth.uid()));
-- Nenhuma política de insert: ninguém grava XP direto.

create or replace function public.ganhar_xp(p_chaves text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_total integer;
begin
  if v_uid is null then
    raise exception 'login necessário';
  end if;
  if p_chaves is null or cardinality(p_chaves) > 500 then
    raise exception 'lista inválida';
  end if;

  insert into public.xp_eventos (user_id, chave, pontos)
  select v_uid, f.chave, f.pontos
  from public.xp_fontes f
  where f.chave = any (p_chaves)
  on conflict (user_id, chave) do nothing;

  select coalesce(sum(pontos), 0)::integer into v_total
  from public.xp_eventos where user_id = v_uid;
  return v_total;
end;
$$;

revoke execute on function public.ganhar_xp(text[]) from public, anon;
grant execute on function public.ganhar_xp(text[]) to authenticated;
```

No front-end:

```js
const { data: total, error } = await supabase.rpc("ganhar_xp", { p_chaves: ["aula:variaveis"] });
```

## Explicando o código

- O navegador manda só a **chave** da atividade; o **valor** vem da tabela `xp_fontes`. Mandar `{ pontos: 99999 }` não tem efeito.
- Chaves que não existem em `xp_fontes` são ignoradas pelo `where f.chave = any (...)`.
- A chave primária `(user_id, chave)` + `on conflict do nothing` garantem que cada atividade conta **uma vez**, mesmo com cliques repetidos ou duas abas.
- Não há política de insert em `xp_eventos`: o único caminho é a função, que roda como `security definer` e faz as validações.
- `set search_path = ''` e nomes `public.` completos evitam que alguém crie uma tabela falsa com o mesmo nome em outro esquema.

## Erros comuns

- **Calcular pontos no navegador e mandar o total para o banco**.
- **`security definer` sem conferir `auth.uid()`**: qualquer visitante executa.
- **Esquecer o `revoke ... from public`**: no PostgreSQL, funções nascem executáveis por todos.
- **Não ter restrição de unicidade** e confiar só em um `if` no código.

## Resumo

- Regras de pontos, dinheiro e permissões rodam no servidor.
- Funções `security definer` contornam a RLS; valide tudo e restrinja quem executa.
- `supabase.rpc()` chama a função; unicidade no banco impede recompensas duplicadas.

## Próximo passo

Na próxima aula: **Storage** para arquivos e **Edge Functions** para lógica com segredos e serviços externos.

<!-- aula: storage-e-edge-functions -->
## Por que isso importa

Fotos de perfil, PDFs de comprovante, imagens de produtos: quase todo app guarda arquivos. E quase todo app precisa, em algum momento, falar com um serviço externo usando uma chave secreta (pagamentos, e-mail, IA). **Storage** e **Edge Functions** resolvem essas duas necessidades sem você manter um servidor.

## Conceitos fundamentais

- **Storage** organiza arquivos em **buckets**:
  - **Público**: qualquer pessoa com o link vê (bom para imagens de produtos).
  - **Privado**: o acesso passa por políticas RLS na tabela `storage.objects`, ou por **URLs assinadas** que expiram.
- Boa prática de caminho: `avatares/<user_id>/foto.png`, para a política conferir que a pasta é do próprio usuário.
- Valide **tipo** e **tamanho** dos arquivos (o bucket permite limitar).
- **Edge Functions** são funções em TypeScript que rodam no Deno, nos servidores do Supabase:
  - Recebem requisições HTTP (`Deno.serve`).
  - Leem **secrets** com `Deno.env.get(...)`; os secrets ficam no painel, nunca no código.
  - Conferem o usuário pelo token enviado no cabeçalho `Authorization`.
  - Bons usos: webhooks de pagamento, envio de e-mail, chamadas a APIs de IA, correção de código em serviço isolado (como a Batalha deste site).
- Lembre de **CORS** quando o navegador chama a função, e de limitar abusos (quantidade de chamadas por pessoa).

## Exemplo prático

Upload de avatar no navegador:

```js
export async function enviarAvatar(supabase, userId, arquivo) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(arquivo.type)) throw new Error("Use PNG, JPG ou WEBP.");
  if (arquivo.size > 2 * 1024 * 1024) throw new Error("A imagem deve ter até 2 MB.");
  const caminho = `${userId}/avatar`;
  const { error } = await supabase.storage.from("avatares").upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("avatares").getPublicUrl(caminho).data.publicUrl;
}
```

Política para cada pessoa só gravar na própria pasta:

```pgsql
create policy "avatar na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
```

Uma Edge Function que usa um segredo e só atende usuários logados:

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return new Response(JSON.stringify({ erro: "faça login" }), { status: 401 });

  const chave = Deno.env.get("MINHA_API_KEY"); // secret cadastrado no painel
  if (!chave) return new Response(JSON.stringify({ erro: "servidor sem configuração" }), { status: 500 });

  return new Response(JSON.stringify({ ok: true, usuario: data.user.id }), { headers: { "Content-Type": "application/json" } });
});
```

## Explicando o código

- O upload valida tipo e tamanho antes de enviar, e o bucket pode reforçar esses limites no servidor.
- O caminho começa com o `userId`; a política confere que a **primeira pasta** do caminho é o id de quem está enviando.
- `upsert: true` substitui o avatar anterior em vez de criar outro arquivo.
- A Edge Function cria um cliente com o token de quem chamou e usa `getUser()` para saber quem é; sem usuário, responde 401.
- O segredo vem de `Deno.env.get("MINHA_API_KEY")`, cadastrado no painel (Edge Functions → Secrets). Ele nunca aparece no navegador.

## Erros comuns

- **Bucket público para documentos pessoais**.
- **Política de Storage sem conferir a pasta do usuário**: qualquer pessoa sobrescreve o arquivo dos outros.
- **Segredo escrito no código da função** (e no repositório).
- **Função sem verificar o usuário** ou sem limite de uso: alguém pode gastar sua cota de um serviço externo.

## Resumo

- Storage: buckets públicos ou privados, políticas por pasta, validação de tipo e tamanho.
- Edge Functions: código no servidor com secrets, verificação do usuário e CORS.
- Segredos sempre em secrets, nunca no front-end ou no Git.

## Próximo passo

Para fechar: um **checklist de segurança** para revisar antes de publicar qualquer projeto com Supabase.

<!-- aula: checklist-de-seguranca -->
## Por que isso importa

A maior parte dos vazamentos em projetos pequenos não vem de ataques sofisticados, mas de esquecimentos: uma tabela sem RLS, uma chave secreta no repositório, um bucket público. Um checklist simples, revisado antes de cada publicação, evita quase todos esses problemas. E mostrar esse cuidado no README do projeto impressiona em entrevistas.

## Conceitos fundamentais

- **Chaves**: só a publishable/anon no front-end; service_role e outros segredos só em secrets do servidor.
- **RLS em todas as tabelas** do esquema `public`, com políticas testadas por dois usuários.
- **Advisors** do Supabase (Database → Advisors / Security): apontam tabelas sem RLS, funções inseguras e índices faltando.
- **Funções `security definer`**: `search_path` vazio, validação, `revoke` de `public` e `anon`.
- **Dados pessoais (LGPD)**: guarde o mínimo necessário, explique o uso numa página de privacidade, permita que a pessoa apague a conta.
- **Limites**: tamanho de entrada (`check`), quantidade de chamadas por pessoa em funções caras.
- **Backups e migrações**: mudanças de esquema em arquivos versionados (migrations), testadas antes; cópia antes de operações arriscadas.
- **Monitoramento**: logs do Supabase para erros de autenticação e de funções.

## Exemplo prático

Consulta para encontrar tabelas do esquema `public` **sem** RLS (rode no SQL Editor):

```sql
create table public.exemplo_sem_rls (id integer primary key);
create table public.exemplo_com_rls (id integer primary key);
alter table public.exemplo_com_rls enable row level security;

select c.relname as tabela
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity
order by 1;
```

Checklist para colar no README:

```texto
Segurança deste projeto
[x] RLS ligada em todas as tabelas (consulta acima não retorna nada)
[x] Políticas testadas com dois usuários (um não vê os dados do outro)
[x] Só a chave publishable no front-end; secrets no painel
[x] Funções security definer com search_path vazio e execução restrita
[x] Entradas limitadas (tamanho, formato) no banco
[x] Página de privacidade e opção de apagar a conta
[x] Migrations versionadas no repositório
[x] Advisors do Supabase sem alertas de erro
```

## Explicando o código

- `pg_class.relrowsecurity` diz se a RLS está ligada; a consulta lista as tabelas `public` sem ela. No exemplo, aparece só `exemplo_sem_rls`.
- Rode essa consulta antes de cada publicação; o resultado ideal é **nenhuma linha**.
- O checklist no README mostra a quem lê (inclusive recrutadores) que segurança foi pensada, não esquecida.

## Erros comuns

- **Desligar a RLS "só para testar"** e esquecer.
- **Ignorar os avisos dos Advisors**.
- **Guardar dados que não usa** (CPF, endereço completo) "porque pode ser útil".
- **Aplicar mudanças direto no banco de produção** sem migration nem backup.

## Resumo

- Chaves certas no lugar certo, RLS em tudo, funções seguras.
- Revise com os Advisors e com a consulta de tabelas sem RLS.
- Dados mínimos, privacidade explicada, migrations versionadas e backups.

## Próximo passo

Você terminou a trilha de Supabase. Agora coloque tudo junto no projeto guiado **"Tarefas+ com banco de dados e login"** ou no **"Encurtador de links com estatísticas"**.
