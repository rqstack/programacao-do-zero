import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "git-e-github",
  title: "Git e GitHub: versionar e publicar",
  description:
    "Controle de versão do zero: commits, branches, merge, conflitos, repositórios remotos, pull requests e publicação gratuita com o GitHub Pages.",
  category: "web",
  level: "iniciante",
  modules: [
    {
      title: "Git no seu computador",
      lessons: [
        {
          slug: "controle-de-versao",
          title: "Controle de versão, Git e GitHub",
          objective: "Entender o que é controle de versão, diferenciar Git de GitHub e configurar o Git pela primeira vez.",
          summary: "Chega de projeto-final-2-agora-vai.html: instale e configure o Git.",
          minutes: 12,
          exercise: {
            prompt: "Qual comando cria um repositório Git na pasta atual?",
            hint: "São duas palavras: git e...",
            accepted: ["git init"],
            explanation: "`git init` cria a pasta oculta `.git`, onde fica o histórico.",
          },
          quiz: [
            {
              prompt: "Qual a diferença entre Git e GitHub?",
              options: ["Git é a ferramenta de versão; GitHub é um serviço que hospeda repositórios Git", "São a mesma coisa", "GitHub roda só offline", "Git é um site"],
              correct: 0,
              explanation: "O Git funciona sozinho no seu computador; o GitHub hospeda e adiciona colaboração.",
            },
            {
              prompt: "Para que serve `git config --global user.email`?",
              options: ["Definir o e-mail gravado nos seus commits", "Criar uma conta no GitHub", "Enviar um e-mail", "Proteger o repositório com senha"],
              correct: 0,
              explanation: "Nome e e-mail identificam a autoria de cada commit.",
            },
            {
              kind: "true_false",
              prompt: "Apagar a pasta oculta .git apaga o histórico do projeto.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Todo o histórico local fica dentro de .git.",
            },
          ],
        },
        {
          slug: "commits",
          title: "Commits: o ciclo editar, preparar e registrar",
          objective: "Registrar mudanças com git add e git commit, consultar o histórico e ignorar arquivos com .gitignore.",
          summary: "Working directory, staging e histórico, com mensagens que fazem sentido.",
          minutes: 15,
          exercise: {
            prompt: "Qual comando mostra o histórico de commits de forma compacta, uma linha por commit?",
            hint: "git log com uma opção.",
            accepted: ["git log --oneline"],
            explanation: "`git log --oneline` mostra o hash curto e a mensagem de cada commit.",
          },
          quiz: [
            {
              lang: "bash",
              kind: "code_reading",
              prompt: "Depois destes comandos, o arquivo b.txt entra no commit?",
              code: "git add a.txt\ngit commit -m \"Atualiza arquivos\"",
              options: ["Não, só o a.txt foi preparado", "Sim, o commit pega tudo", "Só se b.txt for novo", "Gera um erro"],
              correct: 0,
              explanation: "Só entra no commit o que foi preparado com git add.",
            },
            {
              prompt: "Qual mensagem de commit é a melhor?",
              options: ["\"Adiciona validação do e-mail no formulário\"", "\"mudanças\"", "\"asdf\"", "\"commit 3\""],
              correct: 0,
              explanation: "Boas mensagens dizem o que mudou, de forma curta e no imperativo.",
            },
            {
              prompt: "Para que serve o arquivo .gitignore?",
              options: ["Listar arquivos que o Git não deve versionar", "Apagar o histórico", "Ignorar erros do Git", "Esconder o repositório"],
              correct: 0,
              explanation: "Use para node_modules/, arquivos .env e outros que não devem ir para o repositório.",
            },
          ],
        },
        {
          slug: "branches-e-merge",
          title: "Branches e merge",
          objective: "Trabalhar em linhas paralelas com branches e integrar o trabalho com merge.",
          summary: "Experimente sem medo de quebrar a versão principal.",
          minutes: 15,
          exercise: {
            prompt: "Qual comando cria a branch `feature/menu` e já muda para ela?",
            hint: "git switch com a opção -c.",
            accepted: ["git switch -c feature/menu", "git checkout -b feature/menu"],
            explanation: "`git switch -c` cria e troca de branch em um comando (o antigo `git checkout -b` também funciona).",
          },
          quiz: [
            {
              prompt: "Você está na main e roda `git merge feature/rodape`. O que acontece?",
              options: ["Os commits de feature/rodape são trazidos para a main", "A main vai para dentro de feature/rodape", "A branch feature/rodape é apagada", "Nada"],
              correct: 0,
              explanation: "O merge traz a branch informada para a branch atual.",
            },
            {
              prompt: "O que é um merge fast-forward?",
              options: ["Quando a branch de destino só avança o ponteiro, porque não mudou", "Um merge com conflitos", "Um merge forçado", "Um merge remoto"],
              correct: 0,
              explanation: "Sem commits novos no destino, não há o que combinar: o ponteiro avança.",
            },
            {
              prompt: "Por que manter branches curtas?",
              options: ["Quanto mais tempo separadas, mais difícil e arriscado juntar", "Branches longas deixam o Git lento", "O GitHub apaga branches antigas", "Não faz diferença"],
              correct: 0,
              explanation: "Integrar com frequência evita conflitos grandes.",
            },
          ],
        },
        {
          slug: "conflitos",
          title: "Resolvendo conflitos",
          objective: "Ler os marcadores de conflito, decidir o conteúdo final e concluir o merge com segurança.",
          summary: "Conflito não é erro: é o Git pedindo para você decidir.",
          minutes: 12,
          exercise: {
            prompt: "Qual comando desiste de um merge em andamento e volta ao estado anterior?",
            hint: "git merge com uma opção.",
            accepted: ["git merge --abort"],
            explanation: "`git merge --abort` cancela o merge, útil quando você quer recomeçar com calma.",
          },
          quiz: [
            {
              prompt: "Quando o Git gera um conflito?",
              options: ["Quando a mesma linha foi alterada nas duas branches", "Sempre que há um merge", "Quando o arquivo é grande", "Quando a internet cai"],
              correct: 0,
              explanation: "Mudanças em linhas diferentes são combinadas automaticamente.",
            },
            {
              prompt: "No marcador de conflito, o que vem logo depois de `<<<<<<< HEAD`?",
              options: ["A versão da branch em que você está", "A versão que está chegando", "O nome do autor", "O hash do commit"],
              correct: 0,
              explanation: "HEAD é a branch atual; a versão que chega fica entre ======= e >>>>>>>.",
            },
            {
              prompt: "Depois de editar o arquivo em conflito, qual é o próximo passo?",
              options: ["git add no arquivo e git commit", "git push --force", "Apagar a pasta .git", "git init"],
              correct: 0,
              explanation: "git add marca como resolvido; o commit conclui o merge.",
            },
          ],
        },
      ],
    },
    {
      title: "GitHub e colaboração",
      lessons: [
        {
          slug: "github-e-repositorios-remotos",
          title: "GitHub e repositórios remotos",
          objective: "Ligar um repositório local ao GitHub e sincronizar com push, pull e clone.",
          summary: "Backup na nuvem, portfólio público e colaboração.",
          minutes: 14,
          exercise: {
            prompt: "Qual comando baixa um repositório inteiro do GitHub, com o histórico? Escreva só o comando, sem a URL.",
            hint: "git ...",
            accepted: ["git clone"],
            explanation: "`git clone URL` baixa o repositório e já configura o remoto origin.",
          },
          quiz: [
            {
              prompt: "O push foi rejeitado porque o remoto tem commits que você não tem. O que fazer?",
              options: ["git pull, resolver conflitos se houver e então git push", "git push --force sempre", "Apagar o repositório", "Criar outro repositório"],
              correct: 0,
              explanation: "Traga as mudanças primeiro; --force pode apagar o trabalho de outras pessoas.",
            },
            {
              prompt: "O que `-u` faz em `git push -u origin main`?",
              options: ["Liga a main local à main remota para os próximos push/pull", "Desfaz o último commit", "Atualiza o Git", "Envia sem autenticar"],
              correct: 0,
              explanation: "Depois disso basta git push e git pull.",
            },
            {
              prompt: "Como se autenticar no GitHub pelo terminal?",
              options: ["GitHub CLI (gh auth login), token de acesso ou chave SSH", "Com a senha da conta", "Não é preciso autenticar", "Pelo e-mail"],
              correct: 0,
              explanation: "O GitHub não aceita a senha da conta em operações do Git.",
            },
          ],
        },
        {
          slug: "pull-requests-e-colaboracao",
          title: "Pull requests, issues e colaboração",
          objective: "Propor mudanças com pull requests, revisar código e organizar o trabalho com issues.",
          summary: "O fluxo usado por equipes e projetos de código aberto.",
          minutes: 14,
          exercise: {
            prompt: "Qual palavra, seguida do número, fecha uma issue automaticamente quando o PR é aceito? Exemplo: ___ #12",
            hint: "Em inglês, \"fecha\".",
            accepted: ["Closes", "closes", "Fixes", "fixes", "Resolves", "resolves"],
            explanation: "Palavras como Closes, Fixes e Resolves seguidas de #número fecham a issue no merge.",
          },
          quiz: [
            {
              prompt: "O que é um pull request?",
              options: ["Um pedido para juntar uma branch em outra, com revisão", "Um download do repositório", "Um comando para apagar commits", "Um tipo de issue"],
              correct: 0,
              explanation: "O PR reúne descrição, discussão, revisão e testes antes do merge.",
            },
            {
              prompt: "Quando usar um fork?",
              options: ["Para contribuir com um repositório em que você não tem permissão de escrita", "Para apagar branches", "Para resolver conflitos", "Nunca"],
              correct: 0,
              explanation: "Você trabalha na sua cópia e abre o PR para o repositório original.",
            },
            {
              prompt: "O que torna um PR fácil de revisar?",
              options: ["Ser pequeno e ter uma descrição com contexto e como testar", "Ter muitas mudanças juntas", "Não ter descrição", "Ter commits com a mensagem \"ajustes\""],
              correct: 0,
              explanation: "Revisões boas dependem de mudanças focadas e bem explicadas.",
            },
          ],
        },
        {
          slug: "publicando-com-github-pages",
          title: "Publicando com o GitHub Pages",
          objective: "Publicar um site estático de graça com o GitHub Pages, usando caminhos que funcionam no subcaminho do repositório.",
          summary: "Do repositório para um link público em poucos minutos.",
          minutes: 12,
          exercise: {
            prompt: "Qual arquivo, na raiz do repositório, é a página aberta no endereço principal do GitHub Pages?",
            hint: "É a página inicial padrão de qualquer site.",
            accepted: ["index.html"],
            explanation: "O servidor entrega o index.html quando o endereço termina na pasta.",
          },
          quiz: [
            {
              prompt: "O CSS não carrega depois de publicar no GitHub Pages. Qual é uma causa comum?",
              options: ["Caminhos começando com / apontam para fora do repositório", "O GitHub não aceita CSS", "Falta o arquivo .gitignore", "O site é grande demais"],
              correct: 0,
              explanation: "O site fica em /nome-do-repositorio/; use caminhos relativos como css/estilo.css.",
            },
            {
              prompt: "O GitHub Pages publica:",
              options: ["Sites estáticos (HTML, CSS, JS)", "Servidores Node.js", "Bancos de dados", "Qualquer programa"],
              correct: 0,
              explanation: "Não há código rodando no servidor: ele só entrega arquivos.",
            },
            {
              kind: "true_false",
              prompt: "Em um repositório público, qualquer pessoa pode ver os arquivos versionados.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Por isso segredos nunca devem ser commitados.",
            },
          ],
        },
      ],
    },
  ],
};
