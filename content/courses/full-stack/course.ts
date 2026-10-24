import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "full-stack",
  title: "Desenvolvimento Full Stack com projetos",
  description: "Juntar front-end, API, banco e login em um produto: arquitetura, planejamento de MVP, comunicação com a API, autenticação de ponta a ponta, segurança web e publicação para o portfólio.",
  category: "web",
  level: "avancado",
  modules: [
    {
      title: "Arquitetura e planejamento",
      lessons: [
        {
          slug: "arquitetura-full-stack",
          title: "Arquitetura de uma aplicação full stack",
          objective: "Explicar o papel de cada camada e decidir onde ficam validação, autorização e regras de negócio.",
          summary: "Front para a experiência; servidor para as regras; banco para a integridade.",
          minutes: 13,
          exercise: {
            prompt: "Onde deve ficar a regra que calcula o preço final de um pedido: no front-end ou no servidor?",
            hint: "O navegador pode ser manipulado.",
            accepted: ["servidor", "no servidor", "back-end", "backend", "no back-end", "no backend"],
            explanation: "Preços, pontos e permissões são calculados no servidor; o front só exibe.",
          },
          quiz: [
            {
              prompt: "Qual pergunta a autorização responde?",
              options: ["Este usuário pode fazer esta ação neste recurso?", "Quem é o usuário?", "O JSON está bem formado?", "Qual é a cor do botão?"],
              correct: 0,
              explanation: "Autenticação = quem é; autorização = o que pode.",
            },
            {
              prompt: "Por que a API não deve usar um `user_id` enviado no corpo da requisição?",
              options: ["Porque o cliente pode trocar por outro id; o certo é usar o id do token", "Porque ids são números", "Porque o corpo é lento", "Pode usar, sem problema"],
              correct: 0,
              explanation: "O token é assinado; o corpo é controlado pelo cliente.",
            },
            {
              kind: "true_false",
              prompt: "Validar o formulário no front-end dispensa validar no servidor.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Validação no front melhora a experiência; no servidor, garante a regra.",
            },
          ],
        },
        {
          slug: "planejando-o-projeto",
          title: "Planejando o projeto: MVP, histórias e fatias",
          objective: "Definir problema, público e MVP, escrever histórias com critérios de aceite e organizar o trabalho em fatias verticais.",
          summary: "Escopo pequeno, contrato claro e uma funcionalidade completa por vez.",
          minutes: 14,
          exercise: {
            prompt: "Qual sigla descreve o menor produto que já resolve o problema principal?",
            hint: "Produto Mínimo Viável, em inglês.",
            accepted: ["MVP", "mvp"],
            explanation: "MVP (Minimum Viable Product): o resto entra numa lista de \"depois\".",
          },
          quiz: [
            {
              prompt: "Qual é a forma de uma história de usuário?",
              options: ["Como [quem], quero [o quê], para [por quê]", "Criar tabela X", "Usar React", "Deixar bonito"],
              correct: 0,
              explanation: "A história foca na necessidade de quem usa, não na solução técnica.",
            },
            {
              prompt: "O que é entregar em fatias verticais?",
              options: ["Fazer cada funcionalidade completa (tela + API + banco) antes da próxima", "Fazer todo o front e depois todo o back", "Fazer só o banco", "Entregar tudo no último dia"],
              correct: 0,
              explanation: "Assim sempre existe algo funcionando de ponta a ponta.",
            },
            {
              kind: "true_false",
              prompt: "Critérios de aceite ajudam a decidir quando uma história está pronta e viram testes.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Eles tornam o \"pronto\" verificável.",
            },
          ],
        },
        {
          slug: "front-end-conectado-a-api",
          title: "Front-end conectado à API",
          objective: "Centralizar a comunicação com a API, tratar todos os estados da tela e aplicar atualização otimista com desfazer.",
          summary: "Um módulo de API, estados explícitos e erros que o usuário entende.",
          minutes: 17,
          exercise: {
            prompt: "Que propriedade da resposta do fetch indica se o status está entre 200 e 299?",
            hint: "Duas letras.",
            accepted: ["ok", "resposta.ok", "response.ok", ".ok"],
            explanation: "resposta.ok é true para 2xx; fetch não lança erro para 4xx e 5xx.",
          },
          quiz: [
            {
              prompt: "O que é uma atualização otimista?",
              options: ["Mudar a tela antes da resposta e desfazer se o servidor recusar", "Nunca mostrar erros", "Esperar 5 segundos antes de salvar", "Salvar só no navegador"],
              correct: 0,
              explanation: "Deixa o app ágil, desde que você desfaça em caso de erro.",
            },
            {
              prompt: "Quais estados uma lista carregada da API deve tratar?",
              options: ["Carregando, erro, vazio e sucesso", "Só sucesso", "Só carregando", "Só erro"],
              correct: 0,
              explanation: "Cada estado precisa de uma resposta clara na interface.",
            },
            {
              prompt: "O front em meusite.com não consegue chamar a API em api.meusite.com, com erro de CORS. Onde se resolve?",
              options: ["Na API, permitindo a origem do front", "No CSS", "Desligando o navegador", "No banco de dados"],
              correct: 0,
              explanation: "É a API que diz quais origens podem chamá-la pelo navegador.",
            },
          ],
        },
      ],
    },
    {
      title: "Segurança e entrega",
      lessons: [
        {
          slug: "autenticacao-de-ponta-a-ponta",
          title: "Autenticação de ponta a ponta",
          objective: "Ligar login, token, middleware da API e papéis no servidor para autorizar ações com segurança.",
          summary: "A API confere o token e usa o id dele; papéis vêm do servidor.",
          minutes: 18,
          exercise: {
            prompt: "Qual status HTTP a API deve devolver quando a pessoa está logada, mas não tem permissão para a ação?",
            hint: "Não é 401.",
            accepted: ["403", "403 Forbidden", "forbidden"],
            explanation: "401: não identificado. 403: identificado, mas sem permissão.",
          },
          quiz: [
            {
              prompt: "Esconder o botão \"excluir\" para quem não é admin protege a ação?",
              options: ["Não; a API precisa recusar a ação de quem não tem permissão", "Sim, totalmente", "Sim, se o botão for vermelho", "Só no celular"],
              correct: 0,
              explanation: "Qualquer pessoa pode chamar a API direto. A proteção está no servidor.",
            },
            {
              prompt: "Por que tokens de acesso costumam ter validade curta?",
              options: ["Para limitar o estrago se forem roubados", "Para economizar espaço", "Porque o JSON exige", "Não há motivo"],
              correct: 0,
              explanation: "O refresh token renova o acesso sem pedir login de novo.",
            },
            {
              kind: "find_bug",
              prompt: "Qual é a falha desta rota?",
              code: "router.get(\"/reservas\", exigeLogin, async (req, res) => {\n  res.json(await listarReservasDe(req.query.userId));\n});",
              options: ["Usa o userId da URL em vez do id do token: qualquer um vê as reservas de outra pessoa", "Falta o método POST", "exigeLogin não deveria existir", "res.json não aceita listas"],
              correct: 0,
              explanation: "Use req.usuario.id, preenchido pelo middleware a partir do token.",
            },
          ],
        },
        {
          slug: "seguranca-em-aplicacoes-web",
          title: "Segurança em aplicações web (OWASP)",
          objective: "Reconhecer e prevenir controle de acesso quebrado, injeção, XSS, CSRF, configurações inseguras e abuso.",
          summary: "Autorização no servidor, consultas parametrizadas, saída como texto e limites.",
          minutes: 18,
          exercise: {
            prompt: "Qual propriedade do DOM exibe um texto do usuário sem interpretar HTML? (use no lugar de innerHTML)",
            hint: "Conteúdo de texto.",
            accepted: ["textContent", "textcontent", ".textContent", "innerText"],
            explanation: "textContent trata tudo como texto, evitando XSS.",
          },
          quiz: [
            {
              prompt: "Trocar /pedidos/15 por /pedidos/16 na URL mostra o pedido de outra pessoa. Qual falha é essa?",
              options: ["Controle de acesso quebrado", "XSS", "CSRF", "Injeção de SQL"],
              correct: 0,
              explanation: "A API não conferiu se o pedido pertence a quem pediu.",
            },
            {
              prompt: "Qual status HTTP indica \"muitas requisições\"?",
              options: ["429", "404", "500", "201"],
              correct: 0,
              explanation: "429 Too Many Requests, usado por limitadores de tentativas.",
            },
            {
              kind: "code_reading",
              prompt: "Em React, o que acontece com `<p>{comentario}</p>` se comentario contém `<script>`?",
              code: "const comentario = \"<script>alert(1)</script>\";\nreturn <p>{comentario}</p>;",
              lang: "jsx",
              options: ["O texto aparece literalmente, sem executar o script", "O script executa", "A página quebra", "O React apaga o texto"],
              correct: 0,
              explanation: "React escapa o conteúdo por padrão; o risco volta com dangerouslySetInnerHTML.",
            },
          ],
        },
        {
          slug: "do-mvp-ao-portfolio",
          title: "Do MVP ao portfólio",
          objective: "Publicar o projeto, escrever um README que mostra problema, decisões, qualidade e limitações, e apresentá-lo.",
          summary: "Link que funciona, README honesto e uma história técnica para contar.",
          minutes: 12,
          exercise: {
            prompt: "Qual arquivo do repositório é a \"vitrine\" do projeto, lido primeiro por quem avalia?",
            hint: "Fica na raiz e o GitHub mostra na página do repositório.",
            accepted: ["README", "README.md", "readme", "readme.md"],
            explanation: "O README.md aparece na página inicial do repositório.",
          },
          quiz: [
            {
              prompt: "O que NÃO deve aparecer no README de um projeto de portfólio?",
              options: ["Números ou depoimentos inventados", "Link do projeto publicado", "Decisões técnicas", "Limitações conhecidas"],
              correct: 0,
              explanation: "Invente nada: métricas falsas destroem a confiança.",
            },
            {
              prompt: "Qual informação mais ajuda numa entrevista sobre o projeto?",
              options: ["Por que você tomou uma decisão técnica e que problema ela resolveu", "Quantas cores o site tem", "O nome da sua IDE", "Quantas linhas de código tem"],
              correct: 0,
              explanation: "Entrevistadores querem entender seu raciocínio.",
            },
            {
              kind: "true_false",
              prompt: "Pedir para alguém usar o MVP e corrigir o que travou é uma boa história para contar em entrevistas.",
              options: ["Verdadeiro", "Falso"],
              correct: 0,
              explanation: "Mostra que você constrói pensando em pessoas reais.",
            },
          ],
        },
      ],
    },
  ],
};
