import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "carreira",
  title: "Portfólio, Currículo, GitHub e Entrevistas",
  description: "Como montar um portfólio que mostra o que você sabe, deixar o GitHub com cara profissional, escrever o currículo, buscar vagas com estratégia, se preparar para entrevistas e continuar evoluindo.",
  category: "carreira",
  level: "iniciante",
  modules: [
    {
      title: "Mostrar o que você sabe",
      lessons: [
        {
          slug: "portfolio-que-mostra-o-que-voce-sabe",
          title: "Um portfólio que mostra o que você sabe",
          objective: "Escolher, planejar e terminar poucos projetos completos que demonstram habilidades diferentes.",
          summary: "Poucos projetos completos, publicados, com problema real e regra de negócio testada.",
          minutes: 12,
          exercise: {
            prompt: "Para quem está começando, o que vale mais no portfólio: muitos projetos de tutorial ou poucos projetos completos? (responda \"poucos\" ou \"muitos\")",
            hint: "Qualidade acima de quantidade.",
            accepted: ["poucos", "poucos projetos completos", "poucos completos"],
            explanation: "Dois a quatro projetos completos, publicados e bem explicados valem mais que vinte tutoriais copiados.",
          },
          quiz: [
            {
              prompt: "Você fez um projeto seguindo um curso. Como torná-lo bom para o portfólio?",
              options: ["Mudar e ampliar: novas funcionalidades, outro tema e dizer no README o que foi seu", "Publicar igual ao do curso", "Apagar e não mostrar", "Trocar só as cores"],
              correct: 0,
              explanation: "Mostre o que você acrescentou e entende.",
            },
            {
              prompt: "Por que limitar o escopo da versão 1 do projeto?",
              options: ["Para conseguir terminar e publicar", "Porque recrutadores não gostam de funcionalidades", "Para usar menos Git", "Não é recomendado limitar"],
              correct: 0,
              explanation: "Projeto inacabado não ajuda; o resto vira \"próximos passos\".",
            },
            {
              kind: "true_false",
              prompt: "Um projeto publicado com link funcionando e dados de exemplo causa melhor impressão do que um que só roda na sua máquina.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Quem avalia quer testar em segundos, sem instalar nada.",
            },
          ],
        },
        {
          slug: "github-como-vitrine",
          title: "GitHub como vitrine",
          objective: "Organizar o perfil, os repositórios fixados e os READMEs para apresentar seus projetos.",
          summary: "Bio, README de perfil, projetos fixados e READMEs com link, decisões e como rodar.",
          minutes: 12,
          exercise: {
            prompt: "Qual nome deve ter o repositório para que o README dele apareça na página do seu perfil?",
            hint: "É o mesmo nome do seu usuário no GitHub.",
            accepted: ["o mesmo nome do usuario", "o mesmo nome do usuário", "nome do usuario", "nome do usuário", "mesmo nome do usuario", "mesmo nome do usuário", "o nome do meu usuario", "o nome do meu usuário"],
            explanation: "Um repositório chamado exatamente como o seu usuário vira o README do perfil.",
          },
          quiz: [
            {
              prompt: "Qual seção do README de um projeto costuma gerar as melhores perguntas na entrevista?",
              options: ["Decisões (por que você fez cada escolha)", "A licença", "A lista de dependências", "O nome do autor"],
              correct: 0,
              explanation: "Decisões mostram que você pensou no problema.",
            },
            {
              prompt: "Você subiu o .env com uma chave por engano. O que fazer?",
              options: ["Trocar a chave no serviço, além de remover o arquivo", "Só apagar o arquivo no próximo commit", "Tornar o repositório privado e pronto", "Nada"],
              correct: 0,
              explanation: "O histórico do Git guarda o arquivo; a chave vazada precisa ser trocada.",
            },
            {
              prompt: "Quais repositórios fixar no perfil?",
              options: ["Os melhores projetos completos", "Todos os exercícios de aula", "Forks sem mudanças", "Os mais antigos"],
              correct: 0,
              explanation: "Os fixados são a primeira coisa que quem avalia abre.",
            },
          ],
        },
        {
          slug: "curriculo-de-dev-iniciante",
          title: "Currículo de dev iniciante",
          objective: "Escrever um currículo de uma página, com projetos em destaque, habilidades reais e formato simples.",
          summary: "Uma página, links funcionando, projetos antes de experiência fora da área, adaptado para cada vaga.",
          minutes: 13,
          exercise: {
            prompt: "Quantas páginas deve ter o currículo de quem está começando?",
            hint: "Recrutadores leem dezenas por dia.",
            accepted: ["1", "uma", "uma página", "uma pagina", "1 página", "1 pagina"],
            explanation: "Uma página, objetiva e fácil de ler.",
          },
          quiz: [
            {
              prompt: "Para uma vaga de dev, sem experiência na área, o que vem antes no currículo?",
              options: ["Projetos", "Experiências fora da área", "Hobbies", "Dados pessoais completos"],
              correct: 0,
              explanation: "Projetos são a prova mais forte do que você sabe fazer.",
            },
            {
              prompt: "O que não precisa (nem deve, em geral) estar no currículo?",
              options: ["CPF, RG e estado civil", "Link do GitHub", "E-mail", "Projetos"],
              correct: 0,
              explanation: "Dados pessoais desnecessários só expõem você.",
            },
            {
              prompt: "Por que evitar colunas complicadas, tabelas e ícones no lugar de texto?",
              options: ["Sistemas de triagem (ATS) podem não ler corretamente", "Porque é proibido", "Porque deixa o arquivo grande", "Não há motivo"],
              correct: 0,
              explanation: "Formato simples passa pelos filtros e é fácil de ler.",
            },
          ],
        },
      ],
    },
    {
      title: "Conseguir a vaga e crescer",
      lessons: [
        {
          slug: "linkedin-e-busca-de-vagas",
          title: "LinkedIn e busca de vagas",
          objective: "Preparar o perfil do LinkedIn, organizar candidaturas, fazer networking e reconhecer golpes.",
          summary: "Perfil completo, busca organizada, mensagens curtas e personalizadas; vaga que cobra é golpe.",
          minutes: 12,
          exercise: {
            prompt: "Uma vaga pede que você pague uma \"taxa de cadastro\" para participar. O que é isso? (uma palavra)",
            hint: "Empresas sérias não cobram de candidatos.",
            accepted: ["golpe", "um golpe", "fraude", "golpe!"],
            explanation: "Vaga que pede pagamento, curso pago obrigatório ou dados bancários antes da contratação é golpe.",
          },
          quiz: [
            {
              prompt: "Você atende boa parte dos requisitos obrigatórios, mas não todos os desejáveis. O que fazer?",
              options: ["Candidatar-se", "Esperar atender 100%", "Desistir da área", "Mentir no currículo"],
              correct: 0,
              explanation: "Quase ninguém atende todos os itens de uma vaga.",
            },
            {
              prompt: "Qual mensagem para alguém da empresa tem mais chance de resposta?",
              options: ["Curta, personalizada, com o link da vaga e de um projeto relacionado", "\"Me arruma uma vaga?\"", "Um texto genérico enviado a 50 pessoas", "Só o currículo anexado, sem texto"],
              correct: 0,
              explanation: "Mostre interesse real e ofereça prova do que sabe fazer.",
            },
            {
              prompt: "Para que serve uma planilha de candidaturas?",
              options: ["Acompanhar status e próximos passos de cada vaga", "Enviar currículos automaticamente", "Substituir o LinkedIn", "Nada"],
              correct: 0,
              explanation: "Transforma a busca em processo acompanhável.",
            },
          ],
        },
        {
          slug: "entrevistas-tecnicas",
          title: "Entrevistas técnicas e comportamentais",
          objective: "Resolver problemas pensando em voz alta, responder com o método STAR e falar dos próprios projetos.",
          summary: "Entender, planejar, resolver simples, testar; STAR e honestidade.",
          minutes: 15,
          exercise: {
            prompt: "Qual é a sigla do método para responder perguntas comportamentais (Situação, Tarefa, Ação, Resultado)?",
            hint: "Quatro letras, em inglês significa \"estrela\".",
            accepted: ["STAR", "star"],
            explanation: "Situação, Tarefa, Ação e Resultado: uma história concreta com aprendizado.",
          },
          quiz: [
            {
              prompt: "Qual é a primeira atitude ao receber um desafio ao vivo?",
              options: ["Entender o enunciado e perguntar sobre casos de borda", "Começar a digitar imediatamente", "Ficar em silêncio pensando", "Pedir outro problema"],
              correct: 0,
              explanation: "Confirmar o que se pede evita resolver o problema errado.",
            },
            {
              prompt: "Perguntaram algo que você não sabe. Qual é a melhor resposta?",
              options: ["Dizer que não sabe e explicar como descobriria", "Inventar uma resposta confiante", "Mudar de assunto", "Encerrar a entrevista"],
              correct: 0,
              explanation: "Honestidade e método valem mais do que um chute.",
            },
            {
              kind: "code_reading",
              lang: "js",
              prompt: "Qual é a complexidade desta solução para achar o primeiro caractere que não se repete?",
              code: "const contagem = new Map();\nfor (const c of s) contagem.set(c, (contagem.get(c) ?? 0) + 1);\nfor (const c of s) if (contagem.get(c) === 1) return c;\nreturn null;",
              options: ["O(n)", "O(n²)", "O(1)", "O(log n)"],
              correct: 0,
              explanation: "Duas passadas independentes pela string: O(n).",
            },
          ],
        },
        {
          slug: "aprendizado-continuo-e-primeira-vaga",
          title: "Aprendizado contínuo e a primeira vaga",
          objective: "Montar uma rotina de estudo constante, pedir ajuda bem e se adaptar à primeira vaga.",
          summary: "Constância, prática e fundamentos; pergunte, anote e entregue em partes pequenas.",
          minutes: 11,
          exercise: {
            prompt: "O que rende mais: uma hora por dia todos os dias ou uma maratona só no fim de semana? (responda \"todos os dias\" ou \"fim de semana\")",
            hint: "Constância vence intensidade.",
            accepted: ["todos os dias", "uma hora por dia", "todo dia", "1 hora por dia"],
            explanation: "Estudo frequente fixa melhor e evita longos períodos parado.",
          },
          quiz: [
            {
              prompt: "Na primeira vaga, você recebeu muitos comentários na revisão de código. Como encarar?",
              options: ["Como aprendizado: entender, corrigir e perguntar o que não entendeu", "Como crítica pessoal", "Ignorar os comentários", "Pedir para sair do time"],
              correct: 0,
              explanation: "Revisão de código é uma das melhores formas de aprender no trabalho.",
            },
            {
              prompt: "O que dura mais na carreira?",
              options: ["Fundamentos: lógica, HTTP, SQL, Git, JavaScript", "O framework da moda", "Atalhos de um editor específico", "Uma versão de biblioteca"],
              correct: 0,
              explanation: "Frameworks mudam; fundamentos continuam valendo.",
            },
            {
              kind: "true_false",
              prompt: "Vagas de suporte técnico, QA ou freelas pequenos podem ser portas de entrada válidas na área.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Todas contam como experiência e aproximam você de times de tecnologia.",
            },
          ],
        },
      ],
    },
  ],
};
