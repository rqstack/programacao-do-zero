<!-- aula: nuvem-e-conta-aws -->
## Por que isso importa

Grande parte dos sistemas que você usa roda na nuvem, e a AWS (Amazon Web Services) é o maior provedor. Entender como a nuvem funciona abre vagas em desenvolvimento, infraestrutura e DevOps. Mas a nuvem cobra pelo uso: um recurso esquecido ligado vira uma fatura no cartão. Por isso, esta trilha começa pelo mais importante: **proteger a conta e controlar os custos** antes de criar qualquer coisa.

## Conceitos fundamentais

- **Computação em nuvem**: alugar servidores, armazenamento e bancos de dados sob demanda, pagando pelo que usar, em vez de comprar máquinas.
- **Modelos**: **IaaS** (você gerencia a máquina virtual, como no EC2), **PaaS** (o provedor cuida da infraestrutura e você só envia a aplicação) e **SaaS** (software pronto, como o Gmail).
- **Regiões e zonas de disponibilidade**: uma região (como `sa-east-1`, em São Paulo, ou `us-east-1`, na Virgínia) tem várias **zonas de disponibilidade** (data centers separados). Os preços mudam de região para região; São Paulo costuma ser mais cara.
- **Modelo de responsabilidade compartilhada**: a AWS protege a infraestrutura física; **você** protege o que configura (permissões, portas abertas, dados públicos, senhas).
- **Plano gratuito (Free Tier)**: a AWS mudou as regras em julho de 2025. Contas novas recebem **créditos promocionais** por alguns meses e podem escolher um plano gratuito, e alguns serviços têm uma cota mensal sempre gratuita. As regras e os valores mudam: **confira a página oficial do Free Tier antes de usar qualquer serviço.** O cadastro pede um cartão de crédito.
- **Usuário raiz (root)**: o e-mail do cadastro tem poder total, inclusive sobre a cobrança. Use-o só para tarefas de conta, com **MFA** (autenticação em dois fatores) ligado, e crie outro acesso para o dia a dia.
- **Controle de custos**: crie um **orçamento (AWS Budgets) com alerta por e-mail** logo no primeiro dia; acompanhe o **Billing and Cost Management**; apague o que não estiver usando.
- **Formas de acesso**: o **Console** (site), a **AWS CLI** (terminal) e os **SDKs** (código). Em produção, a infraestrutura costuma ser descrita em código (CloudFormation, Terraform, CDK).

## Exemplo prático

Um checklist para o primeiro dia de uma conta de estudos, antes de criar qualquer recurso:

```texto
Primeiro dia na AWS (conta de estudos)
[ ] Ativar MFA no usuário raiz (aplicativo autenticador) e guardar a senha em um gerenciador de senhas
[ ] Criar um orçamento mensal baixo (ex.: o equivalente a US$ 1) com alertas por e-mail em 50%, 80% e 100%
[ ] Ativar os alertas do plano gratuito (Free Tier usage alerts) nas preferências de cobrança
[ ] Criar um usuário para o dia a dia (IAM Identity Center ou usuário IAM) com MFA, e parar de usar o raiz
[ ] Escolher UMA região para estudar e usar sempre a mesma (fica mais fácil achar o que ficou ligado)
[ ] Anotar tudo o que criar; ao terminar o estudo do dia, apagar (terminate/delete), não só parar
```

Depois de instalar a AWS CLI e entrar com o seu usuário do dia a dia, este comando mostra **quem** está autenticado. Ele só lê informações e não cria nada:

```bash
aws configure sso          # configura o login pelo IAM Identity Center (recomendado)
aws sts get-caller-identity
```

Os comandos desta trilha são exemplos para estudo e **não são executados pelo site**: precisam de uma conta AWS e podem gerar custos. Confira os preços antes de rodar qualquer um.

## Explicando o código

- O MFA no raiz impede que uma senha vazada dê acesso total à sua conta e ao seu cartão.
- O orçamento não bloqueia gastos, mas **avisa por e-mail** quando o valor previsto ou o real passa do limite. Configure valores baixos numa conta de estudos.
- Usar sempre a mesma região evita o susto clássico: um servidor esquecido em outra região, que você não vê no console.
- `aws configure sso` usa login temporário, sem chaves fixas guardadas no computador. `aws sts get-caller-identity` confirma a conta e o usuário em uso.

## Erros comuns

- **Usar o usuário raiz no dia a dia** ou sem MFA.
- **Não criar alerta de orçamento** e descobrir o gasto só na fatura.
- **Achar que "parar" uma instância zera o custo**: discos, IPs públicos e snapshots continuam sendo cobrados.
- **Supor que tudo é gratuito** no Free Tier: muitos serviços e configurações ficam fora dele.

## Resumo

- Nuvem é infraestrutura sob demanda, cobrada pelo uso, organizada em regiões e zonas.
- Responsabilidade compartilhada: a segurança do que você configura é sua.
- Primeiro dia: MFA no raiz, orçamento com alertas, usuário do dia a dia e uma região só.

## Próximo passo

Com a conta protegida, a próxima aula aprofunda as **permissões com o IAM**, a base da segurança na AWS.

<!-- aula: iam-e-seguranca -->
## Por que isso importa

A maioria dos incidentes na nuvem não vem de ataques sofisticados, e sim de permissões amplas demais e chaves vazadas: uma chave de acesso publicada no GitHub pode ser encontrada por robôs em minutos e usada para criar servidores de mineração na sua conta. O IAM (Identity and Access Management) define **quem** pode fazer **o quê** em **quais** recursos.

## Conceitos fundamentais

- **Usuários** (pessoas ou sistemas), **grupos** (conjuntos de usuários com as mesmas permissões) e **funções** (*roles*: permissões assumidas temporariamente por um serviço, como um servidor EC2, ou por uma pessoa).
- **Políticas** são documentos JSON com `Effect` (`Allow` ou `Deny`), `Action` (o que pode fazer, como `s3:GetObject`), `Resource` (em quê, identificado por um **ARN**) e, opcionalmente, `Condition`.
- **Tudo começa negado**: só é permitido o que uma política liberar, e um `Deny` explícito sempre vence.
- **Menor privilégio**: dê só as ações e os recursos necessários. Comece restrito e libere aos poucos.
- **Credenciais temporárias** em vez de chaves fixas: pessoas entram pelo **IAM Identity Center** (SSO), e aplicações na AWS usam **roles** (o EC2 e o Lambda recebem credenciais automáticas e temporárias).
- **Chaves de acesso** (*access keys*) são como senhas: nunca no código, no `.env` versionado ou no Git. Se precisar delas, rotacione e apague as antigas. Se uma vazar, **desative na hora** pelo console.
- **MFA** para todos os usuários humanos.
- **Ferramentas de verificação**: o IAM Access Analyzer aponta recursos compartilhados com o mundo; o CloudTrail registra quem fez cada ação na conta.

## Exemplo prático

Uma política que permite **só ler e enviar arquivos** em uma pasta de **um** bucket do S3, e nada mais:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LerEEnviarArquivosDaPastaUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::meu-app-arquivos/uploads/*"
    },
    {
      "Sid": "ListarSoAPastaUploads",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::meu-app-arquivos",
      "Condition": { "StringLike": { "s3:prefix": ["uploads/*"] } }
    }
  ]
}
```

Comparação com o que **não** fazer:

```json
{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Action": "*", "Resource": "*" }]
}
```

## Explicando o código

- A primeira declaração libera só `GetObject` (baixar) e `PutObject` (enviar) e só dentro de `uploads/` no bucket `meu-app-arquivos`. Apagar arquivos, mexer em outros buckets ou em qualquer outro serviço continua negado.
- A segunda libera listar o bucket, mas a `Condition` restringe a listagem ao prefixo `uploads/`.
- O ARN (`arn:aws:s3:::nome/caminho`) identifica exatamente o recurso.
- A segunda política (`"Action": "*"` em `"Resource": "*"`) dá poder total. Se a credencial que a usa vazar, o invasor controla a conta inteira.
- Para uma aplicação rodando no EC2, essa política seria anexada a uma **role** da instância, sem nenhuma chave fixa no código.

## Erros comuns

- **Políticas com `*` em ação e recurso** "só para funcionar logo".
- **Chave de acesso no código ou no Git**. Ativar o *secret scanning* do GitHub ajuda a detectar, mas a solução é não ter chaves fixas.
- **Compartilhar um mesmo usuário** entre várias pessoas.
- **Nunca revisar permissões** antigas e usuários que não são mais usados.

## Resumo

- IAM define quem faz o quê em quais recursos, com políticas JSON e negação por padrão.
- Menor privilégio, MFA e credenciais temporárias (Identity Center e roles).
- Chaves fixas são o maior risco: evite, rotacione e desative na hora se vazarem.

## Próximo passo

Com as permissões sob controle, vamos guardar arquivos com o **Amazon S3**.

<!-- aula: amazon-s3 -->
## Por que isso importa

Quase todo sistema guarda arquivos: fotos de perfil, notas fiscais em PDF, backups, os arquivos de um site estático. O Amazon S3 (Simple Storage Service) armazena qualquer quantidade de arquivos com altíssima durabilidade. Ele também é o serviço em que mais acontecem vazamentos de dados por configuração errada. Saber configurá-lo com segurança é obrigatório.

## Conceitos fundamentais

- **Bucket** é o "recipiente", com nome único no mundo inteiro; **objeto** é o arquivo, identificado por uma **chave** (o "caminho", como `fotos/2026/perfil.jpg`).
- **Bloqueio de acesso público** (*Block Public Access*): ligado por padrão nos buckets novos. Mantenha ligado, a menos que tenha um motivo claro.
- **Acesso controlado**: políticas do IAM (quem acessa) e **políticas de bucket** (regras no próprio bucket).
- **URLs pré-assinadas** (*presigned URLs*): links temporários para baixar ou enviar um arquivo privado, sem tornar o bucket público.
- **Classes de armazenamento**: Standard (uso frequente), Standard-IA e Glacier (mais baratas para arquivos raramente acessados, com custo para recuperar).
- **Versionamento** guarda as versões anteriores (protege contra exclusões acidentais, mas cada versão ocupa espaço e é cobrada).
- **Regras de ciclo de vida** movem ou apagam objetos automaticamente (ex.: apagar arquivos temporários depois de 30 dias).
- **Criptografia** em repouso já vem ativada por padrão nos buckets novos.
- **Site estático**: o S3 pode servir um site, e o recomendado é usá-lo junto com o CloudFront (aula 6) para ter HTTPS sem abrir o bucket ao público.
- **Custos**: espaço ocupado por mês, número de requisições e **transferência de dados para a internet**.

## Exemplo prático

Comandos da AWS CLI para estudo. Eles criam recursos e podem gerar custos (pequenos para poucos arquivos, mas confira os preços):

```bash
# cria um bucket em São Paulo (o nome precisa ser único no mundo)
aws s3 mb s3://programacao-do-zero-estudos-ana-2026 --region sa-east-1

# envia um arquivo e sincroniza uma pasta inteira
aws s3 cp relatorio.pdf s3://programacao-do-zero-estudos-ana-2026/documentos/
aws s3 sync ./site s3://programacao-do-zero-estudos-ana-2026/site/ --delete

# lista e gera um link temporário de 15 minutos para um arquivo privado
aws s3 ls s3://programacao-do-zero-estudos-ana-2026/documentos/
aws s3 presign s3://programacao-do-zero-estudos-ana-2026/documentos/relatorio.pdf --expires-in 900

# limpeza ao terminar o estudo: apaga os objetos e depois o bucket
aws s3 rm s3://programacao-do-zero-estudos-ana-2026 --recursive
aws s3 rb s3://programacao-do-zero-estudos-ana-2026
```

Uma regra de ciclo de vida que apaga, depois de 30 dias, tudo o que estiver na pasta `temporarios/`:

```json
{
  "Rules": [
    {
      "ID": "ApagarTemporariosApos30Dias",
      "Status": "Enabled",
      "Filter": { "Prefix": "temporarios/" },
      "Expiration": { "Days": 30 }
    }
  ]
}
```

## Explicando o código

- `aws s3 mb` (*make bucket*) cria o bucket; o nome inclui algo seu e o ano para ser único.
- `cp` envia um arquivo; `sync` envia só o que mudou, e com `--delete` apaga no bucket o que você removeu localmente (cuidado com esse parâmetro).
- `presign` gera uma URL que vale 900 segundos. Quem tiver o link baixa o arquivo nesse período, sem precisar tornar o bucket público.
- Os dois últimos comandos fazem a limpeza: `rm --recursive` apaga os objetos e `rb` (*remove bucket*) apaga o bucket vazio.
- A regra de ciclo de vida evita que arquivos temporários se acumulem e fiquem sendo cobrados para sempre.

## Erros comuns

- **Desligar o bloqueio de acesso público** para "facilitar" e expor documentos de clientes.
- **Guardar chaves de acesso no aplicativo** para enviar arquivos direto do navegador. Use URLs pré-assinadas geradas pelo seu servidor.
- **Esquecer o versionamento ligado** com arquivos que mudam muito: as versões antigas se acumulam na conta.
- **`sync --delete` no sentido errado**, apagando arquivos que você queria manter.

## Resumo

- Buckets guardam objetos identificados por chaves; o bloqueio de acesso público fica ligado.
- URLs pré-assinadas dão acesso temporário sem expor o bucket.
- Classes, versionamento e ciclo de vida controlam custo e proteção; limpe o que criar.

## Próximo passo

Arquivos guardados; agora vamos rodar uma aplicação em um servidor virtual com o **Amazon EC2**.

<!-- aula: amazon-ec2 -->
## Por que isso importa

O EC2 (Elastic Compute Cloud) é o servidor virtual da AWS: você escolhe o sistema, a capacidade e paga pelo tempo ligado. Ele é a base para entender o resto da nuvem (redes, discos, segurança), e muitas empresas ainda rodam aplicações assim. Também é o serviço em que mais se esquece algo ligado.

## Conceitos fundamentais

- **Instância** é o servidor virtual; **AMI** é a imagem do sistema (Amazon Linux, Ubuntu, Windows).
- **Tipo de instância** define CPU e memória (famílias `t` para uso leve com picos, `m` para uso geral, `c` para processamento). O custo é por segundo ou hora ligada.
- **Grupo de segurança** (*security group*) é o firewall da instância: libere só as portas necessárias (80 e 443 para um site) e **nunca deixe a porta 22 (SSH) aberta para o mundo** (`0.0.0.0/0`).
- **Acesso sem chave SSH exposta**: prefira o **Session Manager** (do Systems Manager) ou o **EC2 Instance Connect**. Se usar par de chaves, guarde o arquivo `.pem` só com você.
- **User data**: script que roda na primeira inicialização (instalar o servidor web, baixar a aplicação).
- **EBS** é o disco da instância (cobrado mesmo com a instância parada); **snapshots** são cópias do disco (também cobrados).
- **IP público**: endereços IPv4 públicos são cobrados por hora, inclusive o **Elastic IP** que ficar sem uso.
- **Parar vs. encerrar**: *stop* desliga e mantém o disco (o disco continua cobrado); *terminate* apaga a instância.
- **Escalabilidade**: Auto Scaling cria e remove instâncias conforme a demanda, atrás de um Load Balancer. Para tarefas curtas, o **AWS Lambda** roda código sem servidor, cobrando só pelas execuções.

## Exemplo prático

Um script de *user data* para uma instância Amazon Linux 2023, que instala o Nginx e publica uma página simples:

```bash
#!/bin/bash
dnf update -y
dnf install -y nginx
cat > /usr/share/nginx/html/index.html <<'HTML'
<!doctype html>
<html lang="pt-BR"><body><h1>Olá da AWS!</h1></body></html>
HTML
systemctl enable --now nginx
```

O grupo de segurança recomendado para esse servidor web, descrito em texto:

```texto
Regras de entrada (inbound)
  HTTP   porta 80   origem 0.0.0.0/0      (site público)
  HTTPS  porta 443  origem 0.0.0.0/0      (site público)
  SSH    porta 22   NÃO liberar           (acesso pelo Session Manager)

Regras de saída (outbound)
  Todo o tráfego, para baixar atualizações
```

Comandos de consulta e limpeza (a criação da instância costuma ser feita pelo console no início dos estudos):

```bash
# lista as instâncias da região, com estado e IP
aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress]" --output table

# encerra (apaga) a instância ao terminar o estudo
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0
```

## Explicando o código

- O script roda como administrador na primeira inicialização: atualiza os pacotes, instala o Nginx, cria a página e liga o serviço para iniciar junto com o sistema.
- O grupo de segurança libera só HTTP e HTTPS. Sem a porta 22 aberta, robôs que varrem a internet atrás de SSH não têm por onde tentar entrar; o acesso administrativo passa pelo Session Manager, autenticado pelo IAM.
- `describe-instances` com `--query` mostra só o que interessa, em tabela, e ajuda a conferir se ficou algo ligado.
- `terminate-instances` apaga a instância (o ID `i-0123...` é um exemplo). Confira também discos, snapshots e Elastic IPs que tenham sobrado.

## Erros comuns

- **SSH aberto para `0.0.0.0/0`**.
- **Parar em vez de encerrar** e continuar pagando pelo disco e pelo IP.
- **Escolher um tipo de instância grande** "para testar".
- **Guardar segredos no user data** (qualquer pessoa com acesso à instância consegue ler). Use o Secrets Manager ou o Parameter Store.

## Resumo

- Instâncias são criadas a partir de AMIs; o tipo define capacidade e custo.
- Grupos de segurança liberam só o necessário; prefira o Session Manager ao SSH aberto.
- Discos, snapshots e IPs públicos são cobrados à parte; encerre o que não usar.

## Próximo passo

A aplicação precisa guardar dados: a próxima aula mostra os **bancos gerenciados RDS e ElastiCache**.

<!-- aula: bancos-gerenciados-rds-e-elasticache -->
## Por que isso importa

Instalar um banco de dados numa instância EC2 funciona, mas você passa a cuidar de backups, atualizações, réplicas e falhas. O **Amazon RDS** faz isso por você para PostgreSQL, MySQL e outros. O **ElastiCache** guarda dados em memória para deixar respostas frequentes muito mais rápidas. São serviços caros se mal dimensionados, e perigosos se ficarem abertos na internet.

## Conceitos fundamentais

- **RDS** (Relational Database Service): banco relacional gerenciado, com backups automáticos, atualizações e restauração para um ponto no tempo. **Aurora** é a versão da própria AWS, compatível com MySQL e PostgreSQL.
- **Multi-AZ** mantém uma cópia em espera em outra zona para assumir em caso de falha (dobra o custo); **réplicas de leitura** dividem consultas pesadas.
- **Rede privada**: o banco fica em uma **sub-rede privada** da VPC, **sem acesso público**. O grupo de segurança do banco aceita conexões **só do grupo de segurança da aplicação**, na porta do banco (5432 no PostgreSQL).
- **Senhas fora do código**: guarde a senha no **Secrets Manager** (com rotação automática) ou no Parameter Store, e dê à aplicação permissão para ler só aquele segredo.
- **ElastiCache** (Redis, Valkey ou Memcached): armazenamento em memória para cache, sessões e filas simples.
- **Padrão cache-aside**: a aplicação procura no cache; se não encontrar, busca no banco e guarda no cache com um tempo de expiração (TTL).
- **Custos**: os dois são cobrados por hora ligados (além de armazenamento e backups). Instâncias pequenas e um único ambiente bastam para estudar; apague ao terminar (o RDS oferece guardar um snapshot final, que também é cobrado).

## Exemplo prático

As regras de rede de uma aplicação com banco, descritas em texto:

```texto
Grupo de segurança "sg-app" (servidores da aplicação)
  Entrada: 443 de qualquer lugar (ou só do Load Balancer)

Grupo de segurança "sg-banco" (RDS PostgreSQL)
  Entrada: 5432 SOMENTE da origem "sg-app"
  Acesso público do RDS: NÃO
  Sub-rede: privada (sem rota para a internet)
```

O padrão cache-aside em pseudocódigo:

```pseudo
função buscarProduto(id):
    chave = "produto:" + id
    produto = cache.ler(chave)
    se produto existe:
        devolva produto                     // rápido: veio da memória
    produto = banco.consultar("SELECT ... WHERE id = $1", id)
    cache.gravar(chave, produto, expira_em = 5 minutos)
    devolva produto

função atualizarProduto(id, dados):
    banco.atualizar(id, dados)
    cache.apagar("produto:" + id)           // a próxima leitura busca o valor novo
```

## Explicando o código

- O banco aceita conexões apenas de quem está no grupo `sg-app`. Mesmo que alguém descubra o endereço do banco, não consegue conectar de fora da VPC.
- "Acesso público: NÃO" e sub-rede privada são as duas travas principais. Juntas, deixam o banco invisível para a internet.
- No cache-aside, a primeira consulta vai ao banco e as seguintes saem da memória até a expiração.
- Ao atualizar, a chave do cache é apagada para ninguém ler um dado velho. A consulta ao banco usa parâmetro (`$1`), nunca texto concatenado.

## Erros comuns

- **Deixar o RDS com acesso público** e a porta liberada para `0.0.0.0/0`.
- **Senha do banco no código ou no repositório**.
- **Ligar Multi-AZ e instâncias grandes num ambiente de estudo** e ver a fatura crescer.
- **Cache sem expiração** ou sem invalidação: o sistema mostra dados desatualizados.

## Resumo

- RDS e Aurora são bancos relacionais gerenciados, com backups e alta disponibilidade.
- Banco em sub-rede privada, acessível só pelo grupo de segurança da aplicação, com senha no Secrets Manager.
- ElastiCache acelera leituras com o padrão cache-aside; desligue tudo depois de estudar.

## Próximo passo

A aplicação está no ar: agora vamos dar a ela um **domínio e uma CDN com Route 53 e CloudFront**.

<!-- aula: dominios-e-cdn-route53-cloudfront -->
## Por que isso importa

Ninguém acessa um site por um endereço IP. Um domínio próprio, HTTPS e um site rápido em qualquer lugar do país são o mínimo esperado. O **Route 53** é o DNS da AWS e o **CloudFront** é a CDN, que copia o conteúdo para servidores perto das pessoas. Juntos, também ajudam a proteger a origem (S3 ou EC2) de acessos diretos.

## Conceitos fundamentais

- **DNS** traduz nomes (`meusite.com.br`) em endereços. O Route 53 hospeda as **zonas** do seu domínio e também registra domínios (`.com`, `.net`; domínios `.br` são registrados no Registro.br e podem apontar para o Route 53).
- **Registros**: `A` (nome → IPv4), `AAAA` (IPv6), `CNAME` (nome → outro nome), `MX` (e-mail), `TXT` (verificações e SPF) e **alias** (recurso da AWS que aponta direto para CloudFront, Load Balancer ou S3, inclusive no domínio raiz).
- **Custos**: cada zona hospedada no Route 53 tem um valor mensal pequeno, e o registro de domínio é cobrado por ano. Não está no plano gratuito.
- **CloudFront**: CDN com centenas de pontos de presença. Guarda cópias em cache (respeitando o `Cache-Control`), serve com HTTPS e reduz a carga na origem.
- **Certificados HTTPS gratuitos** com o **ACM** (AWS Certificate Manager). Para o CloudFront, o certificado precisa ser criado na região `us-east-1`.
- **OAC** (*Origin Access Control*): o bucket S3 continua privado e só o CloudFront consegue ler os arquivos.
- **Invalidação**: força o CloudFront a buscar arquivos novos antes do fim do cache (prefira nomes de arquivo com versão, como `app.3f2a1.js`).
- **Segurança extra**: o **AWS WAF** bloqueia ataques comuns na frente do CloudFront (é pago à parte).

## Exemplo prático

Os registros de um site no domínio `meusite.com.br`, servido pelo CloudFront, com e-mail em outro provedor:

```texto
Zona hospedada: meusite.com.br
  meusite.com.br         A (alias)  → d1234abcd.cloudfront.net
  www.meusite.com.br     CNAME      → meusite.com.br
  meusite.com.br         MX  10     → servidor de e-mail do seu provedor
  meusite.com.br         TXT        → "v=spf1 include:provedor-de-email.exemplo ~all"
  _abc123.meusite.com.br CNAME      → validação do certificado no ACM
```

A política do bucket que deixa **só** a distribuição do CloudFront ler os arquivos (OAC):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SomenteCloudFrontLe",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::meusite-arquivos/*",
      "Condition": {
        "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/EDFDVBD6EXAMPLE" }
      }
    }
  ]
}
```

Invalidar o cache depois de publicar uma nova versão:

```bash
aws cloudfront create-invalidation --distribution-id EDFDVBD6EXAMPLE --paths "/index.html"
```

## Explicando o código

- O registro alias no domínio raiz aponta para a distribuição do CloudFront (um `CNAME` não pode ficar no raiz; o alias pode). O `www` aponta para o domínio principal.
- Os registros `MX` e `TXT` mostram que o mesmo domínio atende o site e o e-mail. O último `CNAME` prova ao ACM que você controla o domínio, para emitir o certificado.
- A política do bucket libera `GetObject` apenas para o serviço do CloudFront **e** apenas para aquela distribuição (`AWS:SourceArn`). Acessar o S3 diretamente continua bloqueado.
- A invalidação manda o CloudFront buscar o `index.html` novo; os arquivos com versão no nome não precisam disso. (Os IDs e o número da conta são exemplos.)

## Erros comuns

- **Deixar o bucket público** para o site funcionar, em vez de usar o OAC.
- **Criar o certificado do CloudFront fora da região `us-east-1`**.
- **Cache longo no `index.html`**: as pessoas continuam vendo a versão antiga.
- **Esquecer zonas hospedadas** de testes, que continuam cobradas todo mês.

## Resumo

- Route 53 é o DNS (registros A, CNAME, MX, TXT e alias); CloudFront é a CDN com HTTPS.
- Certificados gratuitos pelo ACM (em `us-east-1` para o CloudFront) e bucket privado com OAC.
- Controle o cache com nomes versionados e invalidações pontuais.

## Próximo passo

Para fechar a trilha: **e-mails, notificações e monitoramento com SES, SNS e CloudWatch**, incluindo o checklist de limpeza da conta.

<!-- aula: mensagens-e-monitoramento -->
## Por que isso importa

Um sistema em produção precisa avisar as pessoas (confirmação de cadastro, alerta de pedido) e avisar **você** quando algo dá errado (servidor fora do ar, custo subindo). O **SES** envia e-mails, o **SNS** distribui notificações e o **CloudWatch** coleta métricas, logs e dispara alarmes. Sem monitoramento, você descobre os problemas pelos clientes ou pela fatura.

## Conceitos fundamentais

- **SES** (Simple Email Service): envio de e-mails transacionais. Contas novas começam no **sandbox** (só enviam para endereços verificados, com limite baixo); para enviar para qualquer pessoa, é preciso pedir a liberação.
- **Reputação do e-mail**: verifique o domínio e configure **SPF**, **DKIM** e **DMARC** (registros no DNS) para os e-mails não caírem no spam. Trate devoluções (*bounces*) e reclamações.
- **SNS** (Simple Notification Service): um **tópico** recebe mensagens e as entrega a vários **assinantes** (e-mail, SMS, filas, funções Lambda, URLs). Ótimo para alertas e para desacoplar partes do sistema.
- **CloudWatch Metrics**: números ao longo do tempo (CPU de uma instância, erros de uma função, requisições de um balanceador).
- **CloudWatch Alarms**: disparam quando uma métrica passa de um limite, por exemplo enviando uma mensagem para um tópico SNS.
- **CloudWatch Logs**: guarda os logs das aplicações e serviços. Defina um **tempo de retenção**: logs guardados para sempre também são cobrados.
- **Alarme de cobrança**: além do AWS Budgets, dá para criar um alarme na métrica de custo estimado.
- **Limpeza**: ao terminar um estudo, apague tudo o que criou. É a principal regra para manter o custo em zero.

## Exemplo prático

Criando um tópico de alertas e um alarme de CPU alta, para estudo (alarmes e tópicos têm cota gratuita limitada; confira os preços):

```bash
# tópico de alertas e assinatura por e-mail (confirme o link que chega na caixa de entrada)
aws sns create-topic --name alertas-producao
aws sns subscribe --topic-arn arn:aws:sns:sa-east-1:111122223333:alertas-producao --protocol email --notification-endpoint voce@exemplo.com

# alarme: CPU média acima de 80% por 10 minutos seguidos avisa o tópico
aws cloudwatch put-metric-alarm \
  --alarm-name cpu-alta-servidor-web \
  --namespace AWS/EC2 --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-0123456789abcdef0 \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:sa-east-1:111122223333:alertas-producao

# guarda os logs da aplicação por só 14 dias
aws logs put-retention-policy --log-group-name /meu-app/producao --retention-in-days 14
```

O checklist de limpeza ao terminar os estudos:

```texto
Antes de fechar o console
[ ] EC2: instâncias encerradas (terminate), volumes EBS e snapshots sem uso apagados
[ ] Elastic IPs liberados (IP sem uso é cobrado)
[ ] RDS e ElastiCache apagados (decida se quer manter o snapshot final, que é cobrado)
[ ] Load Balancers e NAT Gateways apagados (são caros mesmo sem tráfego)
[ ] Buckets S3 de teste esvaziados e apagados
[ ] Zonas do Route 53 de teste apagadas
[ ] Logs do CloudWatch com retenção definida ou apagados
[ ] Conferir em mais de uma região e olhar o Billing no dia seguinte
```

## Explicando o código

- `create-topic` cria o tópico, e `subscribe` cadastra um e-mail, que só passa a receber depois de confirmar o link (a AWS evita que alguém inscreva o e-mail de outra pessoa).
- O alarme olha a média de CPU em janelas de 5 minutos (`--period 300`) e dispara após 2 janelas seguidas acima de 80%, evitando falsos alarmes por picos rápidos. A ação publica no tópico, que envia o e-mail.
- `put-retention-policy` limita os logs a 14 dias, para não acumular custo.
- O checklist reúne os recursos que mais geram cobrança esquecida: discos, IPs, bancos, balanceadores e NAT Gateways. (O número da conta, o ID da instância e o e-mail são exemplos.)

## Erros comuns

- **Não ter nenhum alarme** e só descobrir que o site caiu pelos usuários.
- **Enviar e-mails sem SPF, DKIM e DMARC** e cair no spam.
- **Logs sem retenção**, acumulando gigabytes cobrados por mês.
- **Encerrar o estudo sem conferir as outras regiões** e o Billing.

## Resumo

- SES envia e-mails (comece no sandbox e configure SPF, DKIM e DMARC); SNS distribui notificações.
- CloudWatch: métricas, alarmes e logs com retenção definida.
- Orçamento com alertas e limpeza completa mantêm a conta de estudos sem custo.

## Próximo passo

Você concluiu a trilha de AWS. Revise a trilha de **Deploy e hospedagem** para comparar com opções gratuitas (GitHub Pages, Vercel, Supabase) e, se for estudar na AWS, siga o checklist do primeiro dia e o de limpeza. Um bom próximo passo de carreira é estudar para a certificação **AWS Certified Cloud Practitioner**.
