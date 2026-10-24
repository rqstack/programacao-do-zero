<!-- aula: requisitos-e-regras-de-negocio -->
## Por que isso importa

Antes de criar uma tabela, alguém precisa responder: **o que o sistema precisa guardar e por quê?** Um banco de dados mal planejado aparece no pior momento: relatórios que não fecham, dados duplicados, regras que o sistema deixa quebrar. Modelar começa com conversa, não com código. Quem sabe levantar requisitos evita retrabalho e entende o negócio que está automatizando.

## Conceitos fundamentais

- **Requisito** é algo que o sistema precisa fazer ou atender. Ele nasce de conversas com quem usa o sistema, de documentos, formulários e planilhas que já existem.
- **Requisito funcional (RF)**: uma ação ou informação que o sistema oferece. Exemplo: "cadastrar alunos", "emitir a lista de presença de uma turma".
- **Requisito não funcional (RNF)**: uma qualidade ou restrição de como o sistema funciona. Exemplo: "a consulta de notas deve responder em até 2 segundos", "os dados pessoais ficam criptografados", "funcionar no celular".
- **Regra de negócio**: uma política da organização que os dados precisam respeitar. Exemplo: "um aluno pode se matricular em no máximo 6 disciplinas por semestre", "um livro só pode ser emprestado se não houver outro empréstimo em aberto dele".
- Regras de negócio viram, mais tarde, **restrições no banco** (chaves, `NOT NULL`, `UNIQUE`, `CHECK`) e validações no código.
- **Minimundo**: a parte do mundo real que o sistema representa. Você não modela "a escola inteira", só o que o sistema precisa.

## Exemplo prático

Imagine uma biblioteca de bairro. Depois de conversar com a bibliotecária, você anota:

```texto
Minimundo: biblioteca comunitária do bairro

Requisitos funcionais
RF01  Cadastrar leitores (nome, telefone, e-mail, data de nascimento).
RF02  Cadastrar livros (título, autores, ano, editora) e seus exemplares.
RF03  Registrar empréstimo e devolução de um exemplar.
RF04  Listar empréstimos atrasados com o telefone do leitor.

Requisitos não funcionais
RNF01  Funcionar no navegador do computador e do celular.
RNF02  Só funcionários logados podem registrar empréstimos.

Regras de negócio
RN01  Um leitor pode ter no máximo 3 empréstimos em aberto.
RN02  O prazo de devolução é de 14 dias.
RN03  Um exemplar não pode estar em dois empréstimos abertos ao mesmo tempo.
RN04  Leitores menores de 12 anos precisam de um responsável cadastrado.
```

## Explicando o código

- Cada requisito tem um **código** (RF01, RN02...). Isso permite citar o requisito em conversas, no modelo e nos testes ("este teste verifica a RN03").
- Os RFs dizem **quais dados existem**: leitor, livro, exemplar, empréstimo. Eles já sugerem as futuras entidades.
- Os RNFs não criam tabelas, mas influenciam decisões (login, desempenho, privacidade).
- As regras de negócio dizem **como os dados se relacionam e quais limites existem**. A RN03, por exemplo, mostra que "livro" e "exemplar" são coisas diferentes: a biblioteca pode ter três exemplares do mesmo livro.

## Erros comuns

- **Pular a conversa e ir direto para as tabelas**: você modela o que imagina, não o que o negócio precisa.
- **Misturar requisito com solução**: "usar PostgreSQL" não é um requisito de negócio; "guardar o histórico de empréstimos por 5 anos" é.
- **Regras implícitas**: "todo mundo sabe que o prazo é 14 dias" — se não estiver escrito, o sistema não vai saber.
- **Requisitos vagos**: "o sistema deve ser rápido" não dá para testar; "responder em até 2 segundos" dá.

## Resumo

- Modelagem começa pelos requisitos: funcionais (o que faz), não funcionais (como funciona) e regras de negócio (o que precisa ser respeitado).
- Requisitos com código e redação clara viram referência para o modelo, o código e os testes.
- As regras de negócio vão virar restrições no banco de dados.

## Próximo passo

Com os requisitos em mãos, o próximo passo é identificar as **entidades** e os **atributos** que o sistema precisa guardar.

<!-- aula: entidades-e-atributos -->
## Por que isso importa

Entidades e atributos são o vocabulário do seu banco de dados. Escolher bem o que é uma entidade e quais atributos ela tem decide se o banco vai ser fácil de consultar e de manter ou se vai virar uma planilha gigante e confusa.

## Conceitos fundamentais

- **Entidade**: algo do minimundo sobre o qual precisamos guardar informações e que tem existência própria. Pode ser concreto (Leitor, Livro) ou abstrato (Empréstimo, Matrícula).
- **Ocorrência** (ou instância): um elemento da entidade. "Maria Silva" é uma ocorrência de Leitor.
- **Atributo**: uma característica da entidade (nome, telefone, data de nascimento).
- **Identificador**: o atributo (ou conjunto de atributos) que distingue uma ocorrência das outras. Vai virar a chave primária.
- **Tipos de atributo**:
  - **Simples**: não se divide. Ex.: `data_nascimento`.
  - **Composto**: formado por partes que fazem sentido sozinhas. Ex.: `endereço` = rua + número + bairro + CEP.
  - **Multivalorado**: pode ter vários valores para a mesma ocorrência. Ex.: os vários `telefones` de um leitor.
  - **Derivado**: calculado a partir de outros. Ex.: `idade` (vem da data de nascimento), `quantidade de empréstimos em aberto`.
  - **Opcional ou obrigatório**: o e-mail pode ser opcional; o nome, obrigatório.
- Dica para achar entidades nos requisitos: **substantivos** costumam ser entidades ou atributos; **verbos** costumam ser relacionamentos ("leitor **pega emprestado** exemplar").

## Exemplo prático

Entidades da biblioteca e seus atributos, em notação textual:

```texto
LEITOR
  - id (identificador)
  - nome                 obrigatório, simples
  - data_nascimento      obrigatório, simples
  - idade                DERIVADO (calculado da data de nascimento; não guardamos)
  - email                opcional
  - telefones            MULTIVALORADO (um leitor pode ter vários)
  - endereco             COMPOSTO: rua, numero, bairro, cep

LIVRO
  - id (identificador)
  - titulo
  - ano_publicacao
  - autores              MULTIVALORADO

EXEMPLAR
  - id (identificador)
  - codigo_tombo         código colado no livro físico
  - estado               "bom", "danificado" ou "perdido"
```

## Explicando o código

- **Idade** não é guardada: ela muda todo ano. Guardamos a data de nascimento e calculamos a idade quando precisar. Guardar valores derivados cria o risco de ficarem desatualizados.
- **Telefones** e **autores** são multivalorados. No banco relacional, cada célula guarda um valor só, então eles vão virar **tabelas separadas** (ou, no caso de autores, uma nova entidade com relacionamento). Você verá isso na aula sobre o DER para tabelas.
- **Endereço** composto vira várias colunas (`rua`, `numero`, `bairro`, `cep`). Assim dá para filtrar por bairro, por exemplo.
- **Livro** e **Exemplar** são entidades diferentes: o título pertence ao livro; o estado de conservação pertence a cada cópia física.

## Erros comuns

- **Atributo multivalorado numa coluna só** (`telefones = "1199..., 1198..."`): impossível buscar ou validar cada telefone.
- **Guardar atributos derivados** sem necessidade: idade, total de itens, saldo calculável.
- **Tratar uma característica como entidade** (ou o contrário): "cor do livro" é atributo; "editora" pode ser entidade se você precisar guardar dados dela (CNPJ, cidade).
- **Não definir o identificador**: sem ele, duas pessoas com o mesmo nome viram uma confusão.

## Resumo

- Entidade = algo com existência própria sobre o qual guardamos dados; atributo = característica dela.
- Atributos podem ser simples, compostos, multivalorados ou derivados, e obrigatórios ou opcionais.
- Multivalorados viram tabelas separadas; derivados normalmente são calculados, não guardados.

## Próximo passo

Entidades não vivem sozinhas: leitores fazem empréstimos de exemplares. A próxima aula mostra os **relacionamentos** e como ler a **cardinalidade** no DER.

<!-- aula: relacionamentos-e-cardinalidade -->
## Por que isso importa

O valor de um banco relacional está nas **ligações** entre os dados: quais exemplares um leitor pegou, quais turmas um professor dá. A cardinalidade diz quantas ocorrências podem estar ligadas, e é ela que decide onde as chaves estrangeiras vão ficar. Errar a cardinalidade é errar a estrutura inteira.

## Conceitos fundamentais

- **Relacionamento**: uma associação entre entidades, normalmente nomeada por um verbo ("leitor **faz** empréstimo", "professor **ministra** disciplina").
- **DER (Diagrama Entidade-Relacionamento)**: o desenho do modelo. Na notação clássica, entidades são retângulos, relacionamentos são losangos e atributos são elipses. Ferramentas como brModelo (gratuita) ou draw.io ajudam a desenhar.
- **Cardinalidade (mínima, máxima)**: para cada lado do relacionamento, quantas ocorrências da outra entidade podem se ligar a uma ocorrência desta.
  - **Mínima 0**: participação opcional. **Mínima 1**: obrigatória.
  - **Máxima 1** ou **N** (muitos).
- **Tipos de relacionamento** pela cardinalidade máxima:
  - **1:1** — um cidadão tem um título de eleitor.
  - **1:N** — um departamento tem vários funcionários; cada funcionário está em um departamento.
  - **N:N** — um aluno cursa várias disciplinas; uma disciplina tem vários alunos.
- **Como ler**: pergunte nos dois sentidos. "Um leitor pode ter quantos empréstimos? (0,N)". "Um empréstimo pertence a quantos leitores? (1,1)".

## Exemplo prático

Relacionamentos da biblioteca, com a cardinalidade escrita perto da entidade **do outro lado** (a forma de ler mais comum):

```texto
LEITOR (1,1) ──── faz ──── (0,N) EMPRESTIMO
  "Um leitor faz de 0 a N empréstimos."
  "Um empréstimo é feito por exatamente 1 leitor."

EXEMPLAR (1,1) ──── é emprestado em ──── (0,N) EMPRESTIMO
  "Um exemplar aparece em 0 a N empréstimos (ao longo do tempo)."
  "Um empréstimo é de exatamente 1 exemplar."

LIVRO (1,1) ──── possui ──── (1,N) EXEMPLAR
  "Um livro tem pelo menos 1 exemplar."
  "Um exemplar é de exatamente 1 livro."

LIVRO (1,N) ──── escrito por ──── (1,N) AUTOR      ← N:N
  "Um livro tem 1 ou mais autores; um autor escreveu 1 ou mais livros."
```

## Explicando o código

- Em "Leitor faz Empréstimo", o leitor pode existir sem nenhum empréstimo (mínima **0**), mas um empréstimo **não existe** sem leitor (mínima **1**).
- Leitor–Empréstimo é **1:N**: olhando as máximas, 1 de um lado e N do outro. Em 1:N, a chave estrangeira fica no lado N (o empréstimo vai guardar `leitor_id`).
- Livro–Autor é **N:N**: as duas máximas são N. Esse tipo não cabe em uma coluna e precisará de uma tabela no meio, assunto da próxima aula.
- A regra de negócio RN01 (no máximo 3 empréstimos **em aberto**) não muda a cardinalidade do modelo (ao longo do tempo são N empréstimos); ela vira uma validação.

## Erros comuns

- **Ler a cardinalidade de um lado só**: sempre faça a pergunta nos dois sentidos.
- **Confundir mínima com máxima**: (0,N) quer dizer "opcional, podendo ser muitos".
- **Usar 1:1 sem necessidade**: muitas vezes é só um conjunto de atributos da mesma entidade.
- **Esconder N:N como 1:N** porque "por enquanto só tem um autor": o modelo quebra no primeiro livro com dois autores.

## Resumo

- Relacionamentos ligam entidades; o DER é o desenho do modelo.
- Cardinalidade (mín,máx) em cada lado: mínima 0 ou 1 (opcional ou obrigatório), máxima 1 ou N.
- 1:1, 1:N e N:N decidem onde as chaves estrangeiras vão ficar.

## Próximo passo

Relacionamentos N:N precisam de um tratamento especial. Na próxima aula você vai resolvê-los com a **entidade associativa**.

<!-- aula: relacionamento-n-para-n -->
## Por que isso importa

Muitos dos relacionamentos mais importantes de um sistema são N:N: alunos e disciplinas, produtos e pedidos, atores e filmes. E, quase sempre, esse relacionamento tem **dados próprios** (a nota do aluno na disciplina, a quantidade do produto no pedido). Saber transformar N:N em uma entidade associativa é uma das habilidades centrais da modelagem.

## Conceitos fundamentais

- Em um banco relacional, uma coluna guarda **um** valor. Por isso um N:N não pode ser representado com uma chave estrangeira em uma das tabelas.
- A solução é criar uma **entidade associativa** (também chamada de tabela de ligação, de junção ou intermediária) que fica "no meio" e transforma o N:N em **dois relacionamentos 1:N**.
- A entidade associativa guarda:
  - a referência às duas entidades (as duas chaves estrangeiras);
  - os **atributos do relacionamento** — dados que não pertencem a nenhuma das duas sozinha.
- Pergunta-chave para achar atributos do relacionamento: "este dado é do aluno, da disciplina ou **do aluno naquela disciplina**?" A nota final é do aluno naquela disciplina.
- O par das chaves estrangeiras costuma ser **único** (o mesmo aluno não se matricula duas vezes na mesma disciplina no mesmo semestre) ou formar a própria chave primária composta.

## Exemplo prático

Pedidos de uma loja: um pedido tem vários produtos, e um produto aparece em vários pedidos.

```texto
Antes (N:N, não implementável diretamente):

PEDIDO (0,N) ──── contém ──── (1,N) PRODUTO

Depois (entidade associativa ITEM_PEDIDO):

PEDIDO (1,1) ──── (1,N) ITEM_PEDIDO (0,N) ──── (1,1) PRODUTO

ITEM_PEDIDO
  - pedido_id        → PEDIDO
  - produto_id       → PRODUTO
  - quantidade       atributo do relacionamento
  - preco_unitario   preço NO MOMENTO da compra
```

Já em tabelas (SQL), para ver como fica:

```sql
create table pedido (
  id integer primary key,
  data_pedido date not null
);

create table produto (
  id integer primary key,
  nome text not null,
  preco_atual numeric(10, 2) not null
);

create table item_pedido (
  pedido_id integer not null references pedido (id),
  produto_id integer not null references produto (id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null,
  primary key (pedido_id, produto_id)
);
```

## Explicando o código

- O N:N virou dois 1:N: um pedido tem vários itens; um produto aparece em vários itens.
- `quantidade` não é do pedido (cada produto tem a sua) nem do produto (cada pedido pede uma quantidade diferente): é **do relacionamento**.
- `preco_unitario` guarda o preço **na hora da compra**. Se o produto ficar mais caro amanhã, o pedido antigo não pode mudar de valor. Por isso não basta olhar `produto.preco_atual`.
- `primary key (pedido_id, produto_id)` é uma **chave primária composta**: impede o mesmo produto duas vezes no mesmo pedido (se comprar mais, aumenta a quantidade).
- `check (quantidade > 0)` transforma uma regra de negócio em restrição do banco.

## Erros comuns

- **Guardar listas em texto** (`produtos = "3,7,12"`): não dá para fazer JOIN, contar ou garantir que os produtos existem.
- **Colocar o atributo do relacionamento na entidade errada** (quantidade dentro de produto).
- **Esquecer a restrição de unicidade** no par de chaves: o mesmo aluno matriculado duas vezes na mesma turma.
- **Copiar o preço atual em vez de guardar o histórico**: relatórios antigos mudam sozinhos.

## Resumo

- N:N não cabe em uma chave estrangeira: vira uma entidade associativa com dois 1:N.
- A entidade associativa guarda as duas chaves e os atributos do relacionamento.
- O par de chaves costuma ser único (ou a própria chave primária composta).

## Próximo passo

Você já usou `primary key` e `references`. A próxima aula aprofunda as **chaves**: primária, estrangeira, composta e substituta.

<!-- aula: chaves-primarias-e-estrangeiras -->
## Por que isso importa

Chaves são o que mantém um banco de dados **íntegro**: sem chave primária, você não sabe qual registro alterar; sem chave estrangeira, um empréstimo pode apontar para um leitor que não existe. Elas também são a base de todo JOIN que você vai escrever em SQL.

## Conceitos fundamentais

- **Chave primária (PK)**: identifica cada linha de forma **única** e **nunca é nula**. Uma tabela tem uma só chave primária (que pode ter mais de uma coluna).
- **Chave candidata**: qualquer coluna (ou conjunto) que poderia ser a PK, como CPF ou e-mail. Uma é escolhida como primária; as outras recebem `UNIQUE`.
- **Chave estrangeira (FK)**: uma coluna que referencia a chave primária de outra tabela (ou da mesma). O banco recusa valores que não existem lá: isso é a **integridade referencial**.
- **Chave composta**: PK formada por mais de uma coluna, comum em entidades associativas (`pedido_id, produto_id`).
- **Chave natural**: vem do mundo real (CPF, ISBN, placa do carro).
- **Chave substituta (surrogate key)**: um identificador artificial, sem significado no negócio, gerado pelo banco (número sequencial ou UUID). É a escolha mais comum hoje, porque chaves naturais podem mudar, ter erro de digitação ou ser dados pessoais.
- **Ações referenciais**: o que acontece com as linhas filhas quando a linha mãe é apagada: `restrict` (impede), `cascade` (apaga junto), `set null` (deixa a referência vazia).

## Exemplo prático

```sql
create table leitor (
  id integer generated always as identity primary key,  -- chave substituta
  cpf char(11) unique,                                   -- chave candidata, opcional
  nome text not null,
  data_nascimento date not null
);

create table livro (
  id integer generated always as identity primary key,
  isbn char(13) unique,
  titulo text not null
);

create table exemplar (
  id integer generated always as identity primary key,
  livro_id integer not null references livro (id) on delete restrict,
  codigo_tombo text not null unique
);

create table emprestimo (
  id integer generated always as identity primary key,
  leitor_id integer not null references leitor (id) on delete restrict,
  exemplar_id integer not null references exemplar (id) on delete restrict,
  retirado_em date not null default current_date,
  devolver_ate date not null,
  devolvido_em date,
  check (devolver_ate > retirado_em)
);

insert into livro (isbn, titulo) values ('9788535914849', 'Dom Casmurro');
insert into exemplar (livro_id, codigo_tombo) values (1, 'BIB-0001');
-- Isto FALHA: não existe livro com id 99 (integridade referencial).
-- insert into exemplar (livro_id, codigo_tombo) values (99, 'BIB-0002');
```

## Explicando o código

- `generated always as identity` faz o banco criar o número da chave substituta sozinho.
- `cpf` é chave candidata: `unique` impede repetição, mas ele não é a PK (pode não ser informado e é dado pessoal sensível).
- `livro_id ... references livro (id)` é a chave estrangeira: um exemplar só existe se o livro existir.
- `on delete restrict` impede apagar um livro que ainda tem exemplares; o histórico de empréstimos fica protegido.
- O `check` em `emprestimo` garante que a data de devolução vem depois da retirada.
- Repare que **exemplar** guarda `livro_id` porque o relacionamento é 1:N e a FK vai no lado N.

## Erros comuns

- **Tabela sem chave primária**: duplicatas e atualizações que atingem a linha errada.
- **Usar dados que mudam como PK** (e-mail, telefone): quando mudar, todas as referências precisam mudar junto.
- **Esquecer a FK** "porque o código já cuida": basta um script ou bug para criar referências quebradas.
- **`on delete cascade` sem pensar**: apagar um leitor apagaria todo o histórico de empréstimos dele.

## Resumo

- PK identifica cada linha: única e não nula. FK aponta para a PK de outra tabela e garante integridade.
- Chaves compostas aparecem em entidades associativas; chaves substitutas são as mais usadas.
- Escolha a ação referencial (`restrict`, `cascade`, `set null`) conforme a regra de negócio.

## Próximo passo

Algumas entidades dependem de outras para existir. Na próxima aula você verá entidades **fortes, fracas e associativas**.

<!-- aula: entidades-fortes-e-fracas -->
## Por que isso importa

Nem toda entidade "se sustenta sozinha". Os dependentes de um funcionário, as parcelas de uma compra, os itens de uma nota fiscal só fazem sentido ligados a outra entidade. Reconhecer isso deixa claro como identificar cada registro e o que acontece quando o "dono" é removido.

## Conceitos fundamentais

- **Entidade forte**: existe por si só e tem identificador próprio. Ex.: Funcionário, Cliente, Produto.
- **Entidade fraca**: depende de outra (a **entidade dona**) para existir e para ser identificada. Seu identificador é **parcial** e só é único dentro do dono. Ex.: a parcela 3 da compra 1520; o dependente "Ana" do funcionário 77.
- **Relacionamento identificador**: o que liga a fraca à dona. Normalmente a dona participa com (1,1) e a fraca não existe sem ela.
- **Entidade associativa**: nasce de um relacionamento N:N (aula anterior) e também depende das duas entidades que liga.
- Na implementação, a chave primária da fraca costuma ser **composta**: a chave do dono + o identificador parcial. Também é comum usar uma chave substituta e um `UNIQUE (dono_id, numero)`.
- Quando o dono é apagado, as fracas normalmente vão junto (`on delete cascade`), porque não fazem sentido sozinhas.

## Exemplo prático

Compras parceladas em uma loja:

```sql
create table compra (
  id integer generated always as identity primary key,
  cliente text not null,
  valor_total numeric(10, 2) not null check (valor_total > 0),
  feita_em date not null default current_date
);

-- PARCELA é entidade fraca: só existe dentro de uma compra.
create table parcela (
  compra_id integer not null references compra (id) on delete cascade,
  numero smallint not null check (numero >= 1),   -- identificador parcial
  vencimento date not null,
  valor numeric(10, 2) not null check (valor > 0),
  paga_em date,
  primary key (compra_id, numero)
);

insert into compra (cliente, valor_total) values ('Bruno', 300.00);
insert into parcela (compra_id, numero, vencimento, valor) values
  (1, 1, current_date + 30, 100.00),
  (1, 2, current_date + 60, 100.00),
  (1, 3, current_date + 90, 100.00);
```

## Explicando o código

- `compra` é forte: tem `id` próprio.
- `parcela` é fraca: o `numero` (1, 2, 3...) se repete em todas as compras e só identifica a parcela **junto** com `compra_id`. Por isso a PK é `(compra_id, numero)`.
- `on delete cascade`: se a compra for cancelada e apagada, as parcelas vão junto. Diferente do empréstimo de biblioteca, aqui a parcela não tem valor histórico sem a compra.
- Os `check` garantem números e valores positivos.

## Erros comuns

- **Dar à entidade fraca um identificador que não é único** sem o dono (só `numero` como PK).
- **Modelar a fraca como forte** e permitir parcelas "soltas", sem compra.
- **Usar cascade em entidades que guardam histórico importante** (pagamentos já feitos, notas fiscais emitidas): às vezes o certo é impedir a exclusão e só "cancelar" o dono.

## Resumo

- Forte existe sozinha; fraca depende de um dono para existir e ser identificada.
- A PK da fraca costuma ser composta: chave do dono + identificador parcial.
- Associativas nascem de N:N; fracas nascem da dependência de existência.

## Próximo passo

Você já conhece todas as peças. Na próxima aula vai transformar um DER completo em tabelas, passando pelos modelos **conceitual, lógico e físico**.

<!-- aula: do-der-as-tabelas -->
## Por que isso importa

O DER é para conversar com pessoas; as tabelas são para o banco de dados. Saber converter um no outro com regras claras evita improvisos. E entender os três níveis de modelo ajuda a discutir o sistema no nível certo: com o cliente, com o time e com o banco.

## Conceitos fundamentais

- **Modelo conceitual**: o DER, independente de tecnologia. Fala de entidades, atributos e relacionamentos. Bom para validar com quem conhece o negócio.
- **Modelo lógico**: tabelas, colunas, chaves primárias e estrangeiras, ainda sem detalhes de um banco específico.
- **Modelo físico**: o SQL de um banco real (PostgreSQL, MySQL...), com tipos exatos, índices, restrições e nomes definitivos.
- **Regras de mapeamento**:
  1. Cada entidade vira uma tabela; o identificador vira a PK.
  2. Atributo composto vira várias colunas.
  3. Atributo multivalorado vira uma tabela própria com FK para a dona.
  4. Atributo derivado normalmente não vira coluna.
  5. Relacionamento **1:N**: FK na tabela do lado N.
  6. Relacionamento **1:1**: FK com `UNIQUE` em um dos lados (ou junte as tabelas).
  7. Relacionamento **N:N**: tabela associativa com as duas FKs e os atributos do relacionamento.
  8. Entidade fraca: PK composta com a chave do dono.
- **Normalização** (verificação final): **1FN** — nada de colunas com listas; **2FN** — em PK composta, cada coluna depende da chave inteira; **3FN** — nenhuma coluna depende de outra coluna que não seja a chave (ex.: guardar `cidade` e `estado` em cada cliente, com o estado dependendo da cidade).

## Exemplo prático

Modelo lógico da biblioteca, depois de aplicar as regras:

```texto
leitor (id PK, nome, data_nascimento, email, rua, numero, bairro, cep)
telefone_leitor (id PK, leitor_id FK → leitor, numero)          ← multivalorado
autor (id PK, nome)
livro (id PK, isbn UNIQUE, titulo, ano_publicacao)
livro_autor (livro_id FK → livro, autor_id FK → autor, PK(livro_id, autor_id))   ← N:N
exemplar (id PK, livro_id FK → livro, codigo_tombo UNIQUE, estado)               ← 1:N
emprestimo (id PK, leitor_id FK → leitor, exemplar_id FK → exemplar,
            retirado_em, devolver_ate, devolvido_em)
```

E parte do modelo físico (PostgreSQL), incluindo uma regra de negócio difícil:

```sql
create table telefone_leitor (
  id integer generated always as identity primary key,
  leitor_id integer not null,
  numero varchar(11) not null check (numero ~ '^[0-9]{10,11}$'),
  unique (leitor_id, numero)
);

create table emprestimo (
  id integer generated always as identity primary key,
  leitor_id integer not null,
  exemplar_id integer not null,
  retirado_em date not null default current_date,
  devolver_ate date not null,
  devolvido_em date
);

-- RN03: um exemplar não pode ter dois empréstimos abertos ao mesmo tempo.
create unique index um_emprestimo_aberto_por_exemplar
  on emprestimo (exemplar_id)
  where devolvido_em is null;
```

## Explicando o código

- `telefone_leitor` resolve o atributo multivalorado: cada telefone é uma linha. O `unique (leitor_id, numero)` evita o mesmo número duas vezes para a mesma pessoa.
- `livro_autor` é a associativa do N:N entre livro e autor.
- O **índice único parcial** (`where devolvido_em is null`) implementa a RN03 no próprio banco: só pode existir **um** empréstimo **aberto** por exemplar; os já devolvidos não contam. É um bom exemplo de regra de negócio que vira restrição física.
- A RN01 (no máximo 3 empréstimos abertos por leitor) é mais difícil de expressar com restrições simples; ela costuma ficar numa função do banco ou no código da API, sempre no servidor.

## Erros comuns

- **Pular o modelo conceitual** e discutir nomes de colunas com o cliente.
- **FK no lado errado** de um 1:N (no lado 1 você precisaria de uma lista).
- **Tabelas que violam a 3FN**: a mesma informação (nome da cidade, preço) repetida em muitas linhas e ficando inconsistente.
- **Deixar regras importantes só no front-end**.

## Resumo

- Conceitual (DER) → lógico (tabelas e chaves) → físico (SQL de um banco real).
- Regras de mapeamento: 1:N põe FK no lado N; N:N vira tabela associativa; multivalorado vira tabela.
- Normalize até a 3FN e transforme regras de negócio em restrições sempre que possível.

## Próximo passo

Falta documentar tudo isso para quem vier depois. A última aula mostra o **dicionário de dados**.

<!-- aula: dicionario-de-dados -->
## Por que isso importa

Daqui a seis meses, ninguém (nem você) vai lembrar por que `estado` só aceita três valores ou o que significa `devolvido_em` vazio. O **dicionário de dados** documenta cada tabela e coluna: tipo, obrigatoriedade, regras e significado. Ele acelera a entrada de pessoas novas no time, evita erros em relatórios e é pedido em muitos trabalhos de faculdade e projetos profissionais.

## Conceitos fundamentais

- O dicionário de dados descreve, para cada tabela: **o que ela representa** e, para cada coluna:
  - nome e **descrição** em linguagem simples;
  - **tipo** e tamanho;
  - **obrigatória** ou não (`NOT NULL`);
  - **chave** (PK, FK, UNIQUE);
  - **valores permitidos** ou formato (domínio);
  - **regra de negócio** relacionada (RN01...).
- Pode ser uma tabela em Markdown no repositório, uma planilha ou comentários no próprio banco (`comment on column`).
- Manter o dicionário **junto do código** (no repositório) ajuda a atualizá-lo a cada mudança.
- Ferramentas de modelagem (brModelo, dbdiagram.io) e o painel do Supabase mostram parte disso, mas a descrição de negócio é você quem escreve.

## Exemplo prático

Dicionário da tabela `emprestimo`:

```texto
Tabela: emprestimo
Descrição: registro de cada vez que um exemplar sai da biblioteca com um leitor.

| Coluna       | Tipo    | Obrig. | Chave           | Domínio / regra                                  | Descrição                                     |
|--------------|---------|--------|-----------------|--------------------------------------------------|-----------------------------------------------|
| id           | integer | sim    | PK              | gerado pelo banco                                | Identificador do empréstimo                   |
| leitor_id    | integer | sim    | FK → leitor     | leitor deve existir; RN01 (máx. 3 abertos)       | Quem pegou o livro                            |
| exemplar_id  | integer | sim    | FK → exemplar   | RN03 (um aberto por exemplar)                    | Qual cópia física saiu                        |
| retirado_em  | date    | sim    |                 | padrão: data de hoje                             | Dia da retirada                               |
| devolver_ate | date    | sim    |                 | retirado_em + 14 dias (RN02)                     | Prazo de devolução                            |
| devolvido_em | date    | não    |                 | vazio = empréstimo em aberto                     | Dia em que o exemplar voltou                  |
```

O mesmo conteúdo também pode morar no banco, onde ferramentas conseguem ler:

```sql
create table emprestimo (
  id integer generated always as identity primary key,
  devolvido_em date
);

comment on table emprestimo is 'Cada saída de um exemplar com um leitor.';
comment on column emprestimo.devolvido_em is 'Vazio = empréstimo em aberto; preenchido na devolução.';
```

## Explicando o código

- A coluna **Domínio / regra** liga cada campo às regras de negócio da primeira aula, fechando o ciclo requisito → modelo → banco.
- O significado de valores especiais (`devolvido_em` vazio = em aberto) é o tipo de informação que mais se perde sem documentação.
- `comment on` grava a descrição dentro do banco; ferramentas como o painel do Supabase e o `psql` (`\d+ emprestimo`) mostram esses comentários.

## Erros comuns

- **Dicionário escrito uma vez e nunca atualizado**: mantenha no repositório e revise a cada migração.
- **Descrever o óbvio** ("nome: o nome") e esquecer o importante (unidade, formato, significado de nulo).
- **Não registrar valores permitidos** de colunas de status.

## Resumo

- O dicionário de dados documenta tabelas e colunas: tipo, obrigatoriedade, chaves, domínio, regras e significado.
- Guarde-o junto do código e atualize a cada mudança; comentários no banco ajudam.
- Ele liga os requisitos ao banco que você construiu.

## Próximo passo

Seu modelo está pronto e documentado. Agora é hora de colocar dados nele e fazer perguntas: siga para a trilha de **SQL**.
