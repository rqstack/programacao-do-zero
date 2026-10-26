import type { SeedCourse } from "../../schema";

export const course: SeedCourse = {
  slug: "aws",
  title: "AWS: computação em nuvem sem susto",
  description: "Os serviços essenciais da Amazon AWS com foco em segurança e custo zero no estudo: conta protegida, IAM, S3, EC2, RDS e ElastiCache, Route 53 e CloudFront, SES, SNS e CloudWatch.",
  category: "backend",
  level: "iniciante",
  modules: [
    {
      title: "Conta, segurança e armazenamento",
      lessons: [
        {
          slug: "nuvem-e-conta-aws",
          title: "Nuvem, regiões e uma conta AWS protegida",
          objective: "Entender a nuvem e o modelo de responsabilidade compartilhada, e proteger a conta com MFA, orçamento e alertas antes de criar recursos.",
          summary: "MFA no raiz, orçamento com alertas, uma região só e apagar o que criar.",
          minutes: 14,
          exercise: {
            prompt: "Qual é a sigla da autenticação em dois fatores que deve ser ligada no usuário raiz da AWS?",
            hint: "Três letras, em inglês: multi-factor authentication.",
            accepted: ["MFA", "mfa"],
            explanation: "Com MFA, uma senha vazada sozinha não dá acesso à conta.",
          },
          quiz: [
            {
              prompt: "No modelo de responsabilidade compartilhada, quem é responsável por não deixar um bucket aberto ao público?",
              options: ["Você (o cliente)", "A AWS", "O banco do cartão", "Ninguém"],
              correct: 0,
              explanation: "A AWS protege a infraestrutura; a configuração é sua.",
            },
            {
              prompt: "O que o AWS Budgets faz quando o gasto passa do limite definido?",
              options: ["Envia um alerta (não bloqueia os gastos sozinho)", "Apaga todos os recursos", "Cancela a conta", "Nada"],
              correct: 0,
              explanation: "Por isso o alerta precisa de um valor baixo e de atenção ao e-mail.",
            },
            {
              kind: "true_false",
              prompt: "Parar (stop) uma instância EC2 zera todos os custos ligados a ela.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Discos EBS, snapshots e IPs públicos continuam sendo cobrados.",
            },
          ],
        },
        {
          slug: "iam-e-seguranca",
          title: "IAM: permissões e segurança",
          objective: "Criar políticas JSON com menor privilégio e usar credenciais temporárias em vez de chaves fixas.",
          summary: "Tudo começa negado; libere só o necessário; nada de chaves no código.",
          minutes: 15,
          exercise: {
            prompt: "Qual princípio diz para dar a cada usuário ou sistema só as permissões de que ele precisa? (três palavras)",
            hint: "Menor ...",
            accepted: ["menor privilégio", "menor privilegio", "privilégio mínimo", "least privilege"],
            explanation: "Comece restrito e libere aos poucos.",
          },
          quiz: [
            {
              prompt: "Qual destas políticas é perigosa?",
              options: ["\"Action\": \"*\" em \"Resource\": \"*\"", "s3:GetObject em um bucket específico", "Leitura de um único segredo", "Listar um prefixo de bucket"],
              correct: 0,
              explanation: "Dá poder total: se a credencial vazar, a conta inteira fica exposta.",
            },
            {
              prompt: "Como uma aplicação rodando no EC2 deve acessar o S3?",
              options: ["Por uma role da instância, com credenciais temporárias", "Com a chave de acesso escrita no código", "Com a senha do usuário raiz", "Deixando o bucket público"],
              correct: 0,
              explanation: "A role entrega credenciais que expiram, sem nada fixo no código.",
            },
            {
              prompt: "Uma chave de acesso foi publicada no GitHub. O que fazer primeiro?",
              options: ["Desativar a chave na AWS e criar outra", "Apagar o commit e pronto", "Tornar o repositório privado", "Esperar para ver se alguém usa"],
              correct: 0,
              explanation: "O histórico e os robôs já podem ter copiado a chave.",
            },
          ],
        },
        {
          slug: "amazon-s3",
          title: "Amazon S3: arquivos com segurança",
          objective: "Criar buckets, enviar e sincronizar arquivos, gerar URLs pré-assinadas e controlar custos com ciclo de vida.",
          summary: "Bloqueio de acesso público ligado, URLs pré-assinadas e limpeza ao terminar.",
          minutes: 15,
          exercise: {
            prompt: "Como se chama o link temporário que dá acesso a um arquivo privado do S3 sem tornar o bucket público? (URL ...)",
            hint: "Assinada antes, em inglês presigned.",
            accepted: ["pré-assinada", "pre-assinada", "preassinada", "presigned", "url pré-assinada", "url pre-assinada"],
            explanation: "aws s3 presign gera um link que expira no tempo definido.",
          },
          quiz: [
            {
              prompt: "O que faz aws s3 sync ./site s3://bucket/site/ --delete?",
              options: ["Envia o que mudou e apaga no bucket o que não existe mais na pasta local", "Apaga a pasta local", "Só lista os arquivos", "Cria um bucket novo"],
              correct: 0,
              explanation: "Cuidado com o --delete no sentido errado.",
            },
            {
              prompt: "Para que serve uma regra de ciclo de vida?",
              options: ["Mover ou apagar objetos automaticamente depois de um tempo", "Criptografar o bucket", "Tornar o bucket público", "Mudar a região"],
              correct: 0,
              explanation: "Evita que arquivos temporários fiquem sendo cobrados para sempre.",
            },
            {
              kind: "true_false",
              prompt: "O bloqueio de acesso público (Block Public Access) deve ser desligado para um site funcionar com o CloudFront.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Com OAC, o bucket continua privado e só o CloudFront lê.",
            },
          ],
        },
      ],
    },
    {
      title: "Servidores, bancos, rede e monitoramento",
      lessons: [
        {
          slug: "amazon-ec2",
          title: "Amazon EC2: servidores virtuais",
          objective: "Entender instâncias, AMIs, grupos de segurança, user data, discos e IPs, e encerrar tudo ao terminar.",
          summary: "Libere só 80/443, prefira o Session Manager ao SSH aberto e encerre o que não usar.",
          minutes: 16,
          exercise: {
            prompt: "Qual é o número da porta do SSH, que não deve ficar aberta para o mundo inteiro?",
            hint: "Um número de dois dígitos.",
            accepted: ["22"],
            explanation: "Use o Session Manager ou restrinja ao seu IP.",
          },
          quiz: [
            {
              prompt: "Qual é a diferença entre parar (stop) e encerrar (terminate) uma instância?",
              options: ["Stop desliga e mantém o disco; terminate apaga a instância", "São a mesma coisa", "Terminate só reinicia", "Stop apaga os dados"],
              correct: 0,
              explanation: "O disco de uma instância parada continua cobrado.",
            },
            {
              prompt: "Para que serve o user data de uma instância?",
              options: ["Rodar um script na primeira inicialização", "Guardar senhas com segurança", "Definir o preço", "Criar um bucket"],
              correct: 0,
              explanation: "Não coloque segredos nele: quem acessa a instância consegue ler.",
            },
            {
              prompt: "Qual opção roda código sob demanda sem manter um servidor ligado?",
              options: ["AWS Lambda", "EC2 sempre ligado", "Elastic IP", "EBS"],
              correct: 0,
              explanation: "O Lambda cobra pelas execuções.",
            },
          ],
        },
        {
          slug: "bancos-gerenciados-rds-e-elasticache",
          title: "Bancos gerenciados: RDS e ElastiCache",
          objective: "Usar bancos relacionais gerenciados em rede privada, guardar senhas no Secrets Manager e acelerar leituras com cache.",
          summary: "Banco sem acesso público, só para o grupo da aplicação; cache-aside com expiração.",
          minutes: 15,
          exercise: {
            prompt: "Qual serviço da AWS guarda a senha do banco com rotação automática? (duas palavras, em inglês)",
            hint: "Gerenciador de segredos.",
            accepted: ["Secrets Manager", "secrets manager", "AWS Secrets Manager"],
            explanation: "A aplicação recebe permissão para ler só aquele segredo.",
          },
          quiz: [
            {
              prompt: "De onde o grupo de segurança de um RDS deve aceitar conexões?",
              options: ["Só do grupo de segurança da aplicação, na porta do banco", "De 0.0.0.0/0", "De qualquer IP brasileiro", "De nenhum lugar"],
              correct: 0,
              explanation: "E com o acesso público do RDS desligado.",
            },
            {
              prompt: "No padrão cache-aside, o que acontece quando o dado não está no cache?",
              options: ["Busca no banco e guarda no cache com expiração", "Devolve erro", "Apaga o banco", "Espera o cache encher sozinho"],
              correct: 0,
              explanation: "As próximas leituras saem da memória até expirar.",
            },
            {
              kind: "true_false",
              prompt: "Ligar Multi-AZ num banco de estudos não altera o custo.",
              options: ["Verdadeiro", "Falso"],
              correct: 1,
              explanation: "Multi-AZ mantém uma cópia em espera e praticamente dobra o custo.",
            },
          ],
        },
        {
          slug: "dominios-e-cdn-route53-cloudfront",
          title: "Domínio e CDN: Route 53 e CloudFront",
          objective: "Configurar registros DNS, servir o site pelo CloudFront com HTTPS do ACM e manter o bucket privado com OAC.",
          summary: "Alias no domínio raiz, certificado em us-east-1, bucket privado e cache controlado.",
          minutes: 15,
          exercise: {
            prompt: "Qual tipo de registro DNS indica o servidor de e-mail de um domínio? (sigla)",
            hint: "Mail exchanger.",
            accepted: ["MX", "mx"],
            explanation: "Registros MX apontam para o provedor de e-mail.",
          },
          quiz: [
            {
              prompt: "Em qual região o certificado do ACM precisa estar para ser usado no CloudFront?",
              options: ["us-east-1", "sa-east-1", "Qualquer uma", "eu-west-1"],
              correct: 0,
              explanation: "É uma exigência do CloudFront.",
            },
            {
              prompt: "O que o OAC (Origin Access Control) garante?",
              options: ["Que só o CloudFront leia o bucket, que continua privado", "Que o bucket fique público", "HTTPS gratuito", "Registro de domínio"],
              correct: 0,
              explanation: "Acessar o S3 diretamente continua bloqueado.",
            },
            {
              prompt: "Como evitar que as pessoas vejam uma versão antiga do site depois de publicar?",
              options: ["Nomes de arquivo com versão e invalidação pontual do index.html", "Cache de 1 ano no index.html", "Desligar o CloudFront", "Apagar a zona do Route 53"],
              correct: 0,
              explanation: "Arquivos com hash no nome mudam de endereço a cada versão.",
            },
          ],
        },
        {
          slug: "mensagens-e-monitoramento",
          title: "E-mails, notificações e monitoramento",
          objective: "Enviar e-mails com SES, distribuir alertas com SNS, criar alarmes e retenção de logs no CloudWatch e limpar a conta.",
          summary: "SES com SPF/DKIM/DMARC, tópicos SNS, alarmes e logs com retenção, e o checklist de limpeza.",
          minutes: 15,
          exercise: {
            prompt: "Qual serviço da AWS coleta métricas, logs e dispara alarmes? (nome do serviço)",
            hint: "Observar a nuvem, em inglês.",
            accepted: ["CloudWatch", "cloudwatch", "Amazon CloudWatch"],
            explanation: "Alarmes do CloudWatch podem publicar num tópico SNS que envia e-mail.",
          },
          quiz: [
            {
              prompt: "Uma conta nova do SES começa no sandbox. O que isso significa?",
              options: ["Só envia para endereços verificados, com limite baixo", "Envia para qualquer um sem limite", "Não envia nada", "Só recebe e-mails"],
              correct: 0,
              explanation: "Para enviar a qualquer pessoa, peça a liberação.",
            },
            {
              prompt: "Por que definir retenção para os logs do CloudWatch?",
              options: ["Logs guardados para sempre também são cobrados", "É obrigatório para funcionar", "Para deixar os logs públicos", "Não faz diferença"],
              correct: 0,
              explanation: "Guarde só pelo tempo necessário.",
            },
            {
              prompt: "Qual destes recursos costuma gerar cobrança mesmo sem tráfego?",
              options: ["NAT Gateway", "Um tópico SNS vazio", "Uma política IAM", "Um usuário IAM"],
              correct: 0,
              explanation: "NAT Gateways e Load Balancers são cobrados por hora ligados.",
            },
          ],
        },
      ],
    },
  ],
};
