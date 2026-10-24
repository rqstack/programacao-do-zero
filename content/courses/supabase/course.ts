import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "supabase",
  title: "Supabase, autenticação e segurança",
  description: "Back-end sem servidor próprio: PostgreSQL, supabase-js, login com Google, Row Level Security, funções seguras, Storage, Edge Functions e um checklist de segurança.",
  category: "backend",
  level: "intermediario",
  modules: [
    {
      title: "Primeiros passos",
      lessons: [
        {
          slug: "o-que-e-supabase",
          title: "O que é o Supabase e onde fica a segurança",
          objective: "Entender os serviços do Supabase, a diferença entre as chaves e por que a segurança fica no banco.",
          summary: "A chave pública vai no site; quem protege os dados é a RLS.",
          minutes: 12,
          exercise: {
            prompt: "Qual chave do Supabase ignora todas as regras de segurança e NUNCA pode ir para o navegador? (nome da chave)",
            hint: "É a chave de \"papel de serviço\".",
            accepted: ["service_role", "service role", "secret", "chave secreta", "service_role key"],
            explanation: "A service_role (secret) ignora a RLS. Só em código de servidor, vinda de variáveis de ambiente.",
          },
          quiz: [
            {
              prompt: "A chave publishable/anon está no código do site. Isso é um problema?",
              options: ["Não, ela é pública por natureza; a segurança vem da RLS", "Sim, qualquer um terá acesso total", "Sim, ela precisa ser trocada todo dia", "Não, porque ninguém olha o código"],
              correct: 0,
              explanation: "A chave pública só permite o que as políticas permitem.",
            },
            {
              prompt: "Qual destes serviços NÃO faz parte do Supabase?",
              options: ["Hospedagem do front-end do seu site", "Banco PostgreSQL", "Autenticação", "Storage de arquivos"],
              correct: 0,
              explanation: "O site estático fica em outro lugar (como GitHub Pages); o Supabase é o back-end.",
            },
            {
              kind: "true_false",
              prompt: "Uma tabela sem RLS ligada pode ser lida por qualquer pessoa que tenha a chave pública.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Por isso o RLS deve ser ligado em toda tabela do esquema public.",
            },
          ],
        },
        {
          slug: "crud-com-supabase-js",
          title: "CRUD com supabase-js",
          objective: "Ler, criar, alterar e apagar registros com o supabase-js, tratando erros e filtros.",
          summary: "Sempre confira { data, error } e filtre updates e deletes.",
          minutes: 14,
          exercise: {
            prompt: "O supabase-js devolve um objeto com duas propriedades em cada chamada. Quais? (no formato a e b)",
            hint: "Uma traz os dados, a outra o problema.",
            accepted: ["data e error", "data, error", "{ data, error }", "error e data", "data error"],
            explanation: "Cada chamada devolve { data, error }; a biblioteca não lança exceção, então confira error.",
          },
          quiz: [
            {
              kind: "find_bug",
              prompt: "Qual é o risco deste código?",
              code: "await supabase.from(\"tarefas\").delete();",
              options: ["Sem filtro, apaga todas as linhas que a RLS permitir", "delete não existe", "Falta await", "Precisa de select antes"],
              correct: 0,
              explanation: "Sempre filtre: .delete().eq(\"id\", id).",
            },
            {
              prompt: "Uma consulta volta com lista vazia, sem erro, mas há dados na tabela. Causa provável?",
              options: ["As políticas de RLS não permitem que esse usuário veja as linhas", "O banco apagou os dados", "O supabase-js está quebrado", "Falta CSS"],
              correct: 0,
              explanation: "A RLS filtra silenciosamente as linhas que a pessoa não pode ver.",
            },
            {
              prompt: "O que `.insert({...}).select().single()` devolve?",
              options: ["A linha criada, com o id gerado", "Todas as linhas da tabela", "Só true ou false", "Nada"],
              correct: 0,
              explanation: "select() após insert devolve as linhas afetadas; single() espera exatamente uma.",
            },
          ],
        },
      ],
    },
    {
      title: "Autenticação e regras de acesso",
      lessons: [
        {
          slug: "autenticacao-com-supabase",
          title: "Autenticação: e-mail, Google e sessões",
          objective: "Configurar provedores de login, URLs de redirecionamento e usar a sessão no front-end.",
          summary: "Provedor ativo, callback exato e URLs autorizadas: sem isso o login não funciona.",
          minutes: 16,
          exercise: {
            prompt: "Em `supabase.auth.signInWithOAuth({ provider: ___ })`, que texto vai no lugar do ___ para entrar com Google? (sem aspas)",
            hint: "É o nome do provedor, em minúsculas.",
            accepted: ["google", "\"google\"", "'google'"],
            explanation: "provider: \"google\". Além disso, o provedor precisa estar ativado no painel; senão o Supabase responde \"provider is not enabled\".",
          },
          quiz: [
            {
              prompt: "Qual URI de redirecionamento vai no console do Google para o login via Supabase?",
              options: ["https://SEU-PROJETO.supabase.co/auth/v1/callback", "https://seusite.com", "http://localhost", "A página inicial do Google"],
              correct: 0,
              explanation: "O Google devolve para o Supabase, que cria a sessão e depois manda para o seu site.",
            },
            {
              prompt: "Onde fica o Client Secret do Google?",
              options: ["Só no painel do Supabase", "No .env do front-end", "No README", "No código JavaScript do botão"],
              correct: 0,
              explanation: "Segredos nunca vão para o site nem para o repositório.",
            },
            {
              prompt: "Para que serve `onAuthStateChange`?",
              options: ["Avisar quando a pessoa entra, sai ou a sessão é renovada", "Trocar a senha", "Criar tabelas", "Apagar a conta"],
              correct: 0,
              explanation: "É onde a interface reage ao login e ao logout.",
            },
          ],
        },
        {
          slug: "row-level-security",
          title: "Row Level Security na prática",
          objective: "Escrever políticas de RLS para leitura, criação, alteração e exclusão, e testá-las com dois usuários.",
          summary: "RLS ligada sem política nega tudo; cada política libera uma operação.",
          minutes: 20,
          exercise: {
            prompt: "Qual função do Supabase devolve o id do usuário logado dentro de uma política? (escreva a chamada)",
            hint: "Fica no esquema auth.",
            accepted: ["auth.uid()", "auth.uid", "(select auth.uid())"],
            explanation: "auth.uid() devolve o id do usuário da requisição; use (select auth.uid()) nas políticas.",
          },
          quiz: [
            {
              prompt: "Uma tabela tem RLS ligada e nenhuma política. Quem consegue ler os dados pelo front-end?",
              options: ["Ninguém", "Todo mundo", "Só quem está logado", "Só visitantes"],
              correct: 0,
              explanation: "O padrão da RLS é negar. Só a service_role (servidor) passa.",
            },
            {
              prompt: "Em uma política de INSERT, qual cláusula valida a linha que vai ser gravada?",
              options: ["with check", "using", "where", "order by"],
              correct: 0,
              explanation: "using filtra linhas existentes; with check valida o que será gravado.",
            },
            {
              kind: "find_bug",
              lang: "sql",
              prompt: "O que há de errado com esta política numa tabela de mensagens privadas?",
              code: "create policy \"ler\" on mensagens\n  for select to authenticated\n  using (true);",
              options: ["Qualquer usuário logado lê as mensagens de todos", "Faltou o with check", "Políticas não aceitam true", "Nada, está correta"],
              correct: 0,
              explanation: "using (true) libera todas as linhas. O certo seria comparar o dono com auth.uid().",
            },
            {
              kind: "true_false",
              prompt: "Testar as políticas com uma única conta é suficiente para garantir que não há vazamento.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Vazamentos aparecem quando outra pessoa acessa: teste com duas contas.",
            },
          ],
        },
        {
          slug: "funcoes-e-regras-no-servidor",
          title: "Funções no banco e regras no servidor",
          objective: "Criar funções seguras (security definer) para regras que não podem ficar no navegador, como pontos e prêmios.",
          summary: "O navegador diz o que aconteceu; o servidor decide quanto vale.",
          minutes: 18,
          exercise: {
            prompt: "Qual método do supabase-js chama uma função do banco? (uma palavra)",
            hint: "Remote procedure call.",
            accepted: ["rpc", "rpc()", "supabase.rpc", ".rpc"],
            explanation: "supabase.rpc(\"nome\", { parametros }) chama uma função do PostgreSQL.",
          },
          quiz: [
            {
              prompt: "Por que o navegador não deve mandar o total de pontos para o banco?",
              options: ["Porque qualquer pessoa pode alterar o valor no console", "Porque fica lento", "Porque o banco não aceita números", "Pode mandar, sem problema"],
              correct: 0,
              explanation: "O valor deve vir de uma tabela no servidor; o navegador só informa a atividade.",
            },
            {
              prompt: "O que `security definer` faz?",
              options: ["Executa com as permissões do dono da função, ignorando a RLS", "Executa sem nenhuma permissão", "Criptografa a função", "Deixa a função pública"],
              correct: 0,
              explanation: "Por isso a função precisa validar tudo e restringir quem pode executá-la.",
            },
            {
              prompt: "O que garante que uma atividade dê XP uma única vez, mesmo com cliques repetidos?",
              options: ["Uma chave primária (user_id, chave) com on conflict do nothing", "Um if no front-end", "Um setTimeout", "Desabilitar o botão"],
              correct: 0,
              explanation: "A unicidade no banco vale mesmo com duas abas ou requisições simultâneas.",
            },
          ],
        },
      ],
    },
    {
      title: "Arquivos, funções e publicação segura",
      lessons: [
        {
          slug: "storage-e-edge-functions",
          title: "Storage e Edge Functions",
          objective: "Guardar arquivos com políticas por pasta e criar Edge Functions que usam secrets e verificam o usuário.",
          summary: "Arquivos com regras por dono; segredos só em secrets do servidor.",
          minutes: 17,
          exercise: {
            prompt: "Em uma Edge Function, qual chamada lê um secret cadastrado no painel? (escreva a chamada sem o nome do secret, ex.: algo.algo.get)",
            hint: "As funções rodam no Deno.",
            accepted: ["Deno.env.get", "Deno.env.get()", "deno.env.get"],
            explanation: "Deno.env.get(\"NOME\") lê o secret; ele nunca aparece no navegador.",
          },
          quiz: [
            {
              prompt: "Onde guardar documentos pessoais enviados pelos usuários?",
              options: ["Em bucket privado, com políticas ou URLs assinadas", "Em bucket público", "No localStorage", "No repositório Git"],
              correct: 0,
              explanation: "Bucket público é acessível a qualquer pessoa com o link.",
            },
            {
              prompt: "Por que usar caminhos como `avatares/<user_id>/foto.png`?",
              options: ["Para a política conferir que a pasta pertence a quem está enviando", "Por estética", "Porque o Storage exige", "Para o arquivo ficar menor"],
              correct: 0,
              explanation: "A política compara a primeira pasta do caminho com auth.uid().",
            },
            {
              prompt: "Qual destes é um bom uso de Edge Function?",
              options: ["Receber o webhook de um provedor de pagamento", "Guardar o CSS do site", "Mostrar um botão", "Substituir o banco de dados"],
              correct: 0,
              explanation: "Edge Functions servem para lógica no servidor com segredos e serviços externos.",
            },
          ],
        },
        {
          slug: "checklist-de-seguranca",
          title: "Checklist de segurança antes de publicar",
          objective: "Revisar chaves, RLS, funções, dados pessoais e migrations antes de publicar um projeto com Supabase.",
          summary: "Quase todo vazamento é um esquecimento; o checklist evita.",
          minutes: 12,
          exercise: {
            prompt: "Qual área do painel do Supabase aponta tabelas sem RLS e funções inseguras? (uma palavra, em inglês)",
            hint: "Fica em Database, ao lado de Performance e Security.",
            accepted: ["Advisors", "advisors", "advisor", "Security Advisor", "security advisor"],
            explanation: "Os Advisors listam problemas de segurança e desempenho do projeto.",
          },
          quiz: [
            {
              kind: "code_reading",
              lang: "sql",
              prompt: "O que esta consulta lista?",
              code: "select c.relname\nfrom pg_class c join pg_namespace n on n.oid = c.relnamespace\nwhere n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;",
              options: ["Tabelas do esquema public sem RLS ligada", "Todos os usuários", "Funções inseguras", "Índices faltando"],
              correct: 0,
              explanation: "relrowsecurity indica se a RLS está ligada; o ideal é a consulta voltar vazia.",
            },
            {
              prompt: "Segundo a LGPD e boas práticas, que dados pessoais você deve guardar?",
              options: ["Só os necessários para o funcionamento, explicando o uso", "Todos que conseguir, para usar depois", "CPF de todo mundo, por precaução", "Nenhum, nunca"],
              correct: 0,
              explanation: "Minimização: guarde o necessário e permita apagar a conta.",
            },
            {
              kind: "true_false",
              prompt: "Mudanças no banco devem ficar em migrations versionadas no repositório.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Assim dá para revisar, testar e repetir as mudanças com segurança.",
            },
          ],
        },
      ],
    },
  ],
};
