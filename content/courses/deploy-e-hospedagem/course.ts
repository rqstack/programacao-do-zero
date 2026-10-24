import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "deploy-e-hospedagem",
  title: "Deploy, hospedagem e variáveis de ambiente",
  description: "Colocar projetos no ar sem custo e com segurança: build, GitHub Pages, variáveis e segredos, APIs e bancos gerenciados, CI/CD, monitoramento, custos e rollback.",
  category: "web",
  level: "intermediario",
  modules: [
    {
      title: "Publicando o front-end",
      lessons: [
        {
          slug: "como-um-site-vai-ao-ar",
          title: "Como um site vai ao ar",
          objective: "Entender build, sites estáticos, aplicações com servidor, DNS, HTTPS e ambientes.",
          summary: "Primeiro descubra se o projeto precisa de um processo rodando; se não, ele é estático.",
          minutes: 12,
          exercise: {
            prompt: "Qual comando costuma gerar os arquivos finais de um projeto JavaScript para publicar?",
            hint: "npm run ...",
            accepted: ["npm run build", "run build", "build"],
            explanation: "npm run build gera os arquivos finais (como a pasta dist/), que são o que vai para o ar.",
          },
          quiz: [
            {
              prompt: "Um portfólio em React sem back-end próprio é que tipo de projeto para hospedagem?",
              options: ["Site estático", "Aplicação que precisa de servidor rodando", "Banco de dados", "Aplicativo de celular"],
              correct: 0,
              explanation: "Depois do build, são só arquivos; qualquer hospedagem estática entrega.",
            },
            {
              prompt: "O que o DNS faz?",
              options: ["Aponta o nome do domínio para o servidor certo", "Criptografa a conexão", "Compila o código", "Guarda o banco de dados"],
              correct: 0,
              explanation: "O DNS traduz o domínio em endereço; o HTTPS cuida da criptografia.",
            },
            {
              kind: "true_false",
              prompt: "O servidor de desenvolvimento (npm run dev) é o que vai para produção.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Em produção vai o resultado do build, otimizado.",
            },
          ],
        },
        {
          slug: "sites-estaticos-e-github-pages",
          title: "Sites estáticos no GitHub Pages",
          objective: "Publicar um site estático no GitHub Pages configurando subcaminho, .nojekyll e a fonte da publicação.",
          summary: "Configure o base path, inclua .nojekyll e publique a pasta do build.",
          minutes: 14,
          exercise: {
            prompt: "Qual arquivo vazio na raiz do site impede que o GitHub Pages esconda pastas que começam com _?",
            hint: "Começa com ponto.",
            accepted: [".nojekyll", "nojekyll"],
            explanation: ".nojekyll desliga o processamento Jekyll, que ignoraria pastas como _next/.",
          },
          quiz: [
            {
              prompt: "O site publicado em /meu-portfolio/ abre em branco e o console mostra 404 nos arquivos .js. Causa provável?",
              options: ["Falta configurar o subcaminho (base/basePath)", "O GitHub está fora do ar", "Falta CSS", "O domínio expirou"],
              correct: 0,
              explanation: "Sem o subcaminho, o HTML procura os arquivos na raiz do domínio.",
            },
            {
              prompt: "Qual será o endereço de um repositório chamado `loja` do usuário `ana`?",
              options: ["https://ana.github.io/loja/", "https://loja.github.io/", "https://github.com/ana/loja.html", "https://ana.loja.com"],
              correct: 0,
              explanation: "Repositórios comuns ficam em usuario.github.io/nome-do-repo/.",
            },
            {
              kind: "true_false",
              prompt: "O GitHub Pages executa código de servidor, como uma API em Express.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "O Pages só entrega arquivos estáticos.",
            },
          ],
        },
        {
          slug: "variaveis-de-ambiente-e-segredos",
          title: "Variáveis de ambiente e segredos",
          objective: "Separar configuração do código, proteger segredos e validar variáveis na inicialização.",
          summary: "O que vai para o navegador é público; segredo fica só no servidor.",
          minutes: 14,
          exercise: {
            prompt: "Qual arquivo, com os nomes das variáveis e valores de exemplo, deve ir para o repositório no lugar do .env?",
            hint: ".env + um sufixo",
            accepted: [".env.example", "env.example", ".env.exemplo"],
            explanation: "O .env.example documenta as variáveis sem expor valores reais.",
          },
          quiz: [
            {
              prompt: "Uma variável chamada `VITE_STRIPE_SECRET` é usada no front-end. Qual é o problema?",
              options: ["Variáveis VITE_ vão para o navegador; o segredo fica exposto", "Nenhum", "O nome é muito longo", "Vite não lê variáveis"],
              correct: 0,
              explanation: "Prefixos públicos (VITE_, NEXT_PUBLIC_) são embutidos no código do site.",
            },
            {
              prompt: "Você commitou uma chave secreta. O que resolve de verdade?",
              options: ["Trocar (rotacionar) a chave imediatamente", "Apagar o arquivo no próximo commit", "Deixar o repositório privado", "Renomear a variável"],
              correct: 0,
              explanation: "O histórico e cópias já podem ter a chave; só a troca a invalida.",
            },
            {
              kind: "code_reading",
              prompt: "O que acontece se DATABASE_URL não estiver definida?",
              code: "function obrigatoria(nome) {\n  const v = process.env[nome];\n  if (!v) throw new Error(`Variável ${nome} não definida`);\n  return v;\n}\nconst url = obrigatoria(\"DATABASE_URL\");",
              options: ["O programa para na inicialização com uma mensagem clara", "Usa um banco qualquer", "Fica com url vazia e segue", "Cria a variável sozinho"],
              correct: 0,
              explanation: "Falhar cedo evita erros confusos no meio de uma requisição.",
            },
          ],
        },
      ],
    },
    {
      title: "Servidor, automação e operação",
      lessons: [
        {
          slug: "hospedando-apis-e-bancos",
          title: "Hospedando APIs e bancos de dados",
          objective: "Preparar uma API Node para plataformas de hospedagem e avaliar os limites de planos gratuitos.",
          summary: "Porta da variável PORT, health check, segredos no painel e limites lidos antes.",
          minutes: 15,
          exercise: {
            prompt: "Qual variável de ambiente a plataforma de hospedagem usa para dizer em que porta a API deve ouvir?",
            hint: "Em inglês, \"porta\".",
            accepted: ["PORT", "port", "process.env.PORT"],
            explanation: "Use Number(process.env.PORT ?? 3000).",
          },
          quiz: [
            {
              prompt: "Para que serve uma rota como GET /saude?",
              options: ["A plataforma verifica se a API está viva e reinicia se travar", "Mostrar a saúde do usuário", "Apagar o cache", "Criar tabelas"],
              correct: 0,
              explanation: "É o health check: responde 200 rápido quando tudo está bem.",
            },
            {
              prompt: "Antes de escolher um plano gratuito de hospedagem, o que conferir?",
              options: ["Se hiberna, quais limites tem, se exige cartão e se há alerta de cobrança", "Só a cor do painel", "Se o nome é bonito", "Nada, gratuito é sempre gratuito"],
              correct: 0,
              explanation: "Planos gratuitos têm regras que mudam; leia a página de preços atual.",
            },
            {
              kind: "true_false",
              prompt: "A string de conexão do banco de dados é um segredo e deve ficar nas variáveis do servidor.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Ela contém usuário e senha do banco.",
            },
          ],
        },
        {
          slug: "ci-cd-com-github-actions",
          title: "CI/CD com GitHub Actions",
          objective: "Escrever um workflow que testa cada push e publica automaticamente quando a branch principal passa.",
          summary: "Testar e fazer o build antes; publicar só da main e com permissões mínimas.",
          minutes: 16,
          exercise: {
            prompt: "Em que pasta do repositório ficam os workflows do GitHub Actions?",
            hint: "Começa com .github",
            accepted: [".github/workflows", ".github/workflows/", "github/workflows"],
            explanation: "Arquivos YAML em .github/workflows/ definem quando e o que rodar.",
          },
          quiz: [
            {
              prompt: "Como usar uma chave secreta dentro de um workflow?",
              options: ["${{ secrets.NOME }}, cadastrada em Settings → Secrets", "Escrever a chave no YAML", "Colocar no README", "Pedir no log"],
              correct: 0,
              explanation: "Secrets não aparecem nos logs nem no código.",
            },
            {
              prompt: "O que `needs: verificar` garante no job de publicação?",
              options: ["Que ele só roda se o job verificar passar", "Que roda antes dos testes", "Que roda em paralelo", "Nada"],
              correct: 0,
              explanation: "Sem needs, um código quebrado poderia ser publicado.",
            },
            {
              prompt: "Qual comando instala as dependências de forma reprodutível no CI?",
              options: ["npm ci", "npm install --force", "npm update", "npm audit fix"],
              correct: 0,
              explanation: "npm ci usa exatamente o package-lock.json.",
            },
          ],
        },
        {
          slug: "monitoramento-custos-e-rollback",
          title: "Monitoramento, custos e rollback",
          objective: "Acompanhar disponibilidade e erros, controlar limites e custos e desfazer publicações com segurança.",
          summary: "Saiba quando cai, quanto falta para o limite e como voltar atrás.",
          minutes: 13,
          exercise: {
            prompt: "Qual comando do Git desfaz um commit criando um commit novo, sem reescrever o histórico?",
            hint: "git ...",
            accepted: ["git revert", "revert"],
            explanation: "git revert é seguro em branches compartilhadas; o CI publica a correção normalmente.",
          },
          quiz: [
            {
              prompt: "O que NÃO deve aparecer nos logs da aplicação?",
              options: ["Senhas, tokens e dados pessoais", "Erros de servidor", "Tempo de resposta", "Rotas acessadas"],
              correct: 0,
              explanation: "Logs são lidos por mais gente e guardados por mais tempo.",
            },
            {
              prompt: "Por que preferir migrações de banco aditivas (adicionar antes de remover)?",
              options: ["Porque desfazer a perda de dados é muito mais difícil do que desfazer código", "Porque são mais bonitas", "Porque o SQL exige", "Não há motivo"],
              correct: 0,
              explanation: "git revert não traz de volta uma coluna apagada; backup e cuidado sim.",
            },
            {
              kind: "true_false",
              prompt: "Tarefas automáticas que gravam histórico sem parar podem encher o armazenamento de um plano gratuito.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Programe limpezas periódicas e acompanhe o tamanho do banco.",
            },
          ],
        },
      ],
    },
  ],
};
