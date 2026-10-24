<!-- aula: primeiros-passos-com-sql -->
## Por que isso importa

SQL é a linguagem usada para conversar com bancos de dados relacionais há mais de 40 anos, e continua em toda parte: em sistemas de bancos, lojas virtuais, aplicativos e ferramentas de análise. Saber escrever consultas é útil para quem desenvolve, para quem analisa dados e até para quem trabalha com produto. E o mesmo SQL que você aprende aqui funciona no Supabase, que usa PostgreSQL.

## Conceitos fundamentais

- Um banco relacional guarda dados em **tabelas**, com **linhas** (registros) e **colunas** (campos).
- **`SELECT`** escolhe as colunas; **`FROM`** diz de qual tabela. `SELECT *` traz todas as colunas (bom para explorar, ruim em código de produção).
- **`ORDER BY`** ordena (`ASC` crescente, `DESC` decrescente). Sem `ORDER BY`, **a ordem não é garantida**.
- **`LIMIT`** limita a quantidade de linhas.
- **`AS`** dá um apelido a uma coluna ou expressão.
- Dá para calcular na consulta: `preco * 0.9 AS preco_com_desconto`.
- Palavras do SQL não diferenciam maiúsculas de minúsculas (`select` = `SELECT`); textos entre aspas simples sim (`'Ana'` ≠ `'ana'`).
- Para praticar de graça: o **SQL Editor** do Supabase, o PostgreSQL instalado localmente, ou o jogo e os desafios de SQL deste site.

## Exemplo prático

Um pequeno catálogo de livros:

```sql
create table livro (
  id integer primary key,
  titulo text not null,
  autor text not null,
  ano integer,
  preco numeric(8, 2) not null
);

insert into livro (id, titulo, autor, ano, preco) values
  (1, 'Dom Casmurro', 'Machado de Assis', 1899, 29.90),
  (2, 'Vidas Secas', 'Graciliano Ramos', 1938, 34.50),
  (3, 'A Hora da Estrela', 'Clarice Lispector', 1977, 39.90),
  (4, 'Quarto de Despejo', 'Carolina Maria de Jesus', 1960, 44.00),
  (5, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 1881, 27.00);

-- Todos os livros, do mais caro para o mais barato
select titulo, autor, preco
from livro
order by preco desc;

-- Os 3 mais antigos, com o preço com 10% de desconto
select titulo, ano, round(preco * 0.9, 2) as preco_promocional
from livro
order by ano
limit 3;
```

## Explicando o código

- `create table` define a estrutura; `insert into ... values` coloca linhas (vários livros de uma vez, separados por vírgula).
- A primeira consulta escolhe três colunas e ordena por preço decrescente: `Quarto de Despejo` aparece primeiro.
- A segunda calcula um valor novo (`preco * 0.9`), arredonda com `round(..., 2)` e dá o nome `preco_promocional`.
- `order by ano` sem `desc` é crescente: os mais antigos primeiro. `limit 3` fica só com três linhas.
- Comentários de uma linha começam com `--`.

## Erros comuns

- **Aspas duplas para texto** (`"Ana"`): no PostgreSQL, aspas duplas são para **nomes** de colunas e tabelas. Texto usa aspas simples.
- **Esperar uma ordem sem `ORDER BY`**: o banco pode devolver em qualquer ordem.
- **`SELECT *` em produção**: traz colunas que você não precisa (e às vezes dados sensíveis).
- **Esquecer o ponto e vírgula** entre comandos quando roda vários de uma vez.

## Resumo

- `SELECT colunas FROM tabela` é a base de tudo.
- `ORDER BY` ordena, `LIMIT` limita, `AS` dá apelido; dá para calcular nas colunas.
- Texto entre aspas simples; ordem só é garantida com `ORDER BY`.

## Próximo passo

Agora vamos escolher **quais linhas** trazer com o `WHERE`.

<!-- aula: filtrando-com-where -->
## Por que isso importa

Tabelas reais têm milhares ou milhões de linhas, e quase toda pergunta de negócio é sobre um pedaço delas: os pedidos de hoje, os clientes de uma cidade, os produtos sem estoque. O `WHERE` é como você faz essas perguntas.

## Conceitos fundamentais

- **`WHERE condição`** mantém só as linhas em que a condição é verdadeira.
- Comparações: `=`, `<>` (diferente), `<`, `>`, `<=`, `>=`.
- Combinações: `AND` (as duas), `OR` (pelo menos uma), `NOT`. Use **parênteses** quando misturar `AND` e `OR`.
- **`IN (...)`**: está em uma lista. **`BETWEEN a AND b`**: entre dois valores, **incluindo** as pontas.
- **`LIKE`** busca padrões em texto: `%` = qualquer sequência, `_` = um caractere. **`ILIKE`** (PostgreSQL) ignora maiúsculas.
- **`NULL`** significa "valor desconhecido/ausente". Nada é igual a `NULL`, nem o próprio `NULL`: use **`IS NULL`** e **`IS NOT NULL`**.
- **`DISTINCT`** remove linhas repetidas do resultado.

## Exemplo prático

```sql
create table cliente (
  id integer primary key,
  nome text not null,
  cidade text not null,
  idade integer,
  email text
);

insert into cliente values
  (1, 'Ana Souza', 'Recife', 28, 'ana@exemplo.com'),
  (2, 'Bruno Lima', 'São Paulo', 17, null),
  (3, 'Carla Dias', 'Recife', 35, 'carla@exemplo.com'),
  (4, 'Diego Alves', 'Curitiba', 42, 'diego@exemplo.com'),
  (5, 'Elisa Rocha', 'São Paulo', 23, null),
  (6, 'ana paula', 'Salvador', null, 'anapaula@exemplo.com');

-- Clientes de Recife ou Salvador com 18 anos ou mais
select nome, cidade, idade
from cliente
where cidade in ('Recife', 'Salvador')
  and idade >= 18;

-- Clientes sem e-mail cadastrado
select nome from cliente where email is null;

-- Nomes que começam com "ana", sem diferenciar maiúsculas
select nome from cliente where nome ilike 'ana%';

-- Entre 20 e 30 anos (inclui 20 e 30)
select nome, idade from cliente where idade between 20 and 30 order by idade;

-- Quais cidades aparecem (sem repetir)
select distinct cidade from cliente order by cidade;
```

## Explicando o código

- A primeira consulta usa `IN` para duas cidades e `AND` para a idade. "ana paula" **não** aparece: a idade dela é `NULL`, e `NULL >= 18` não é verdadeiro.
- `email is null` encontra quem não tem e-mail. Escrever `email = null` não traria ninguém.
- `ilike 'ana%'` encontra "Ana Souza" e "ana paula".
- `between 20 and 30` inclui as pontas: Elisa (23) e Ana (28).
- `distinct` lista cada cidade uma vez.

## Erros comuns

- **`= NULL`** em vez de `IS NULL`.
- **Misturar `AND` e `OR` sem parênteses**: `a OR b AND c` é `a OR (b AND c)`. Na dúvida, coloque parênteses.
- **`LIKE` sem curinga** (`like 'ana'`) funciona como `=`.
- **Esquecer que `BETWEEN` inclui as pontas** em datas e valores.

## Resumo

- `WHERE` filtra linhas; combine com `AND`, `OR`, `NOT` e parênteses.
- `IN`, `BETWEEN`, `LIKE`/`ILIKE` e `DISTINCT` resolvem a maioria dos filtros.
- `NULL` exige `IS NULL` / `IS NOT NULL`.

## Próximo passo

Até aqui você só leu dados. Na próxima aula você vai **criar tabelas** e **inserir, alterar e apagar** registros com segurança.

<!-- aula: criando-e-alterando-dados -->
## Por que isso importa

Toda tela de cadastro, edição e exclusão de um sistema termina em `INSERT`, `UPDATE` ou `DELETE`. Esses comandos mudam os dados de verdade, e um `UPDATE` sem `WHERE` pode estragar a tabela inteira em um segundo. Escrever com cuidado, com restrições no banco e dentro de transações, é o que separa um sistema confiável de um desastre.

## Conceitos fundamentais

- **`CREATE TABLE`** com **tipos** adequados: `integer`, `numeric(p, s)` para dinheiro (nunca `float`), `text`/`varchar(n)`, `boolean`, `date`, `timestamptz` (data e hora com fuso).
- **Restrições**: `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK` e `REFERENCES` (chave estrangeira). Elas fazem o próprio banco recusar dados inválidos.
- **`INSERT INTO tabela (colunas) VALUES (...)`**: sempre liste as colunas.
- **`UPDATE tabela SET coluna = valor WHERE ...`**: altera as linhas filtradas.
- **`DELETE FROM tabela WHERE ...`**: apaga as linhas filtradas.
- **`RETURNING`** (PostgreSQL) devolve as linhas afetadas, útil para pegar o `id` criado.
- **Transação**: `BEGIN` ... `COMMIT` agrupa comandos que precisam acontecer juntos; `ROLLBACK` desfaz tudo se algo der errado.
- **`ALTER TABLE`** muda a estrutura (adicionar coluna, nova restrição).

## Exemplo prático

```sql
create table produto (
  id integer generated always as identity primary key,
  nome text not null unique,
  preco numeric(10, 2) not null check (preco > 0),
  estoque integer not null default 0 check (estoque >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

insert into produto (nome, preco, estoque) values
  ('Caderno', 18.90, 40),
  ('Caneta azul', 2.50, 200),
  ('Mochila', 129.00, 5)
returning id, nome;

-- Reajuste de 10% só nos cadernos
update produto set preco = round(preco * 1.10, 2) where nome = 'Caderno';

-- Venda de 2 mochilas: baixa o estoque e registra, tudo ou nada
create table venda (
  id integer generated always as identity primary key,
  produto_id integer not null references produto (id),
  quantidade integer not null check (quantidade > 0),
  vendida_em timestamptz not null default now()
);

begin;
update produto set estoque = estoque - 2 where nome = 'Mochila';
insert into venda (produto_id, quantidade)
  select id, 2 from produto where nome = 'Mochila';
commit;

-- Em vez de apagar, desativa (mantém o histórico de vendas)
update produto set ativo = false where nome = 'Caneta azul';

-- Nova coluna depois que a tabela já existe
alter table produto add column descricao text;

select nome, preco, estoque, ativo from produto order by id;
```

## Explicando o código

- As restrições (`check (preco > 0)`, `check (estoque >= 0)`, `unique`) fazem o banco recusar dados absurdos, mesmo se o código tiver um bug.
- `returning id, nome` devolve os ids gerados, sem precisar de outra consulta.
- O `update` tem `where`: só os cadernos mudam (18.90 vira 20.79).
- A venda usa uma **transação**: se o `insert` falhasse, o `rollback` (automático em caso de erro) devolveria o estoque. Nunca fica "estoque baixado sem venda registrada".
- Se o estoque ficasse negativo, o `check` cancelaria a transação inteira.
- Apagar produtos que já foram vendidos quebraria o histórico (a FK impediria); por isso usamos `ativo = false` (exclusão lógica).

## Erros comuns

- **`UPDATE` ou `DELETE` sem `WHERE`**: afeta todas as linhas. Rode antes um `SELECT` com o mesmo `WHERE` para conferir.
- **`float` para dinheiro**: `0.1 + 0.2` não dá `0.3` exato. Use `numeric`.
- **`INSERT` sem listar as colunas**: quebra quando a tabela ganha uma coluna nova.
- **Operações relacionadas fora de transação**: metade acontece, metade não.

## Resumo

- Crie tabelas com tipos certos e restrições que protegem os dados.
- `INSERT`, `UPDATE` e `DELETE` sempre com cuidado no `WHERE`; `RETURNING` ajuda.
- Transações garantem "tudo ou nada"; exclusão lógica preserva o histórico.

## Próximo passo

Com dados na tabela, vamos resumi-los: totais, médias e contagens por grupo com **funções de agregação**.

<!-- aula: agregacao-e-group-by -->
## Por que isso importa

"Quanto vendemos este mês?", "qual produto mais saiu?", "qual a média de nota por turma?". Perguntas de negócio quase sempre pedem **resumos**, não linhas soltas. Funções de agregação com `GROUP BY` respondem isso direto no banco, muito mais rápido do que trazer tudo para o código.

## Conceitos fundamentais

- **Funções de agregação** transformam várias linhas em um valor: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
- `COUNT(*)` conta linhas; `COUNT(coluna)` conta só os valores **não nulos**; `COUNT(DISTINCT coluna)` conta valores diferentes.
- **`GROUP BY`** separa as linhas em grupos e calcula a agregação **por grupo**.
- Regra de ouro: no `SELECT`, cada coluna precisa estar no `GROUP BY` **ou** dentro de uma agregação.
- **`HAVING`** filtra **grupos** depois da agregação; **`WHERE`** filtra **linhas** antes dela.
- A ordem lógica de execução: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`.

## Exemplo prático

```sql
create table venda (
  id integer primary key,
  vendedor text not null,
  categoria text not null,
  valor numeric(10, 2) not null,
  data_venda date not null
);

insert into venda values
  (1, 'Ana', 'Livros', 120.00, '2026-09-01'),
  (2, 'Ana', 'Jogos', 300.00, '2026-09-03'),
  (3, 'Bruno', 'Livros', 80.00, '2026-09-03'),
  (4, 'Bruno', 'Livros', 45.50, '2026-09-10'),
  (5, 'Carla', 'Jogos', 520.00, '2026-09-12'),
  (6, 'Ana', 'Livros', 60.00, '2026-10-01');

-- Resumo geral
select count(*) as vendas, sum(valor) as total, round(avg(valor), 2) as ticket_medio
from venda;

-- Total por vendedor, do maior para o menor
select vendedor, count(*) as vendas, sum(valor) as total
from venda
group by vendedor
order by total desc;

-- Categorias com faturamento acima de 300 em setembro
select categoria, sum(valor) as total
from venda
where data_venda between '2026-09-01' and '2026-09-30'
group by categoria
having sum(valor) > 300
order by total desc;
```

## Explicando o código

- A primeira consulta resume a tabela inteira em uma linha: 6 vendas, total 1125.50, ticket médio 187.58.
- `group by vendedor` cria um grupo para Ana, Bruno e Carla; `sum(valor)` soma dentro de cada grupo. Ana: 480.00; Carla: 520.00; Bruno: 125.50.
- Na terceira, o `where` tira a venda de outubro **antes** de agrupar; o `having` mantém só os grupos com total acima de 300. Jogos (820.00) aparece; Livros de setembro (245.50) não.
- `round(avg(valor), 2)` arredonda a média para centavos.

## Erros comuns

- **Coluna fora do `GROUP BY`** sem agregação: `select vendedor, categoria, sum(valor) ... group by vendedor` dá erro.
- **Usar `WHERE` para filtrar agregações** (`where sum(valor) > 300`): o certo é `HAVING`.
- **`AVG` ignorando nulos sem você perceber**: valores `NULL` não entram na média.
- **`COUNT(coluna)` achando que conta todas as linhas**: nulos ficam de fora.

## Resumo

- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` resumem linhas.
- `GROUP BY` calcula por grupo; colunas do `SELECT` precisam estar no grupo ou agregadas.
- `WHERE` filtra antes de agrupar; `HAVING` filtra depois.

## Próximo passo

Os dados de verdade ficam espalhados em várias tabelas. A próxima aula junta tudo com **JOIN**.

<!-- aula: juntando-tabelas-com-join -->
## Por que isso importa

Um banco bem modelado guarda cada informação em um lugar: clientes numa tabela, pedidos em outra, produtos em outra. Para responder "o que a Ana comprou?", você precisa **juntar** as tabelas. JOIN é provavelmente o assunto de SQL mais cobrado em entrevistas e testes técnicos.

## Conceitos fundamentais

- **`INNER JOIN ... ON condição`**: combina linhas das duas tabelas que satisfazem a condição. Linhas sem par **somem** do resultado.
- **`LEFT JOIN`**: mantém **todas** as linhas da tabela da esquerda; quando não há par, as colunas da direita vêm `NULL`. Ótimo para achar "quem não tem" (clientes sem pedido).
- A condição normalmente liga a **chave estrangeira** à **chave primária**: `pedido.cliente_id = cliente.id`.
- **Apelidos de tabela** (`from pedido p`) deixam a consulta mais curta e clara.
- Dá para encadear vários JOINs: pedido → cliente, pedido → item → produto.
- JOIN + `GROUP BY` responde perguntas como "total gasto por cliente".
- Também existem `RIGHT JOIN` e `FULL JOIN`, menos usados no dia a dia.

## Exemplo prático

```sql
create table cliente (id integer primary key, nome text not null);
create table produto (id integer primary key, nome text not null, preco numeric(10, 2) not null);
create table pedido (
  id integer primary key,
  cliente_id integer not null references cliente (id),
  feito_em date not null
);
create table item_pedido (
  pedido_id integer not null references pedido (id),
  produto_id integer not null references produto (id),
  quantidade integer not null,
  primary key (pedido_id, produto_id)
);

insert into cliente values (1, 'Ana'), (2, 'Bruno'), (3, 'Carla');
insert into produto values (1, 'Teclado', 150.00), (2, 'Mouse', 80.00), (3, 'Monitor', 900.00);
insert into pedido values (10, 1, '2026-10-01'), (11, 1, '2026-10-05'), (12, 2, '2026-10-06');
insert into item_pedido values (10, 1, 1), (10, 2, 2), (11, 3, 1), (12, 2, 1);

-- Pedidos com o nome do cliente
select p.id as pedido, c.nome as cliente, p.feito_em
from pedido p
join cliente c on c.id = p.cliente_id
order by p.id;

-- Itens de cada pedido, com produto e subtotal
select p.id as pedido, pr.nome as produto, i.quantidade, i.quantidade * pr.preco as subtotal
from pedido p
join item_pedido i on i.pedido_id = p.id
join produto pr on pr.id = i.produto_id
order by p.id, pr.nome;

-- Total gasto por cliente, incluindo quem nunca comprou
select c.nome, coalesce(sum(i.quantidade * pr.preco), 0) as total_gasto
from cliente c
left join pedido p on p.cliente_id = c.id
left join item_pedido i on i.pedido_id = p.id
left join produto pr on pr.id = i.produto_id
group by c.id, c.nome
order by total_gasto desc;
```

## Explicando o código

- A primeira consulta liga cada pedido ao seu cliente pela FK `cliente_id`.
- A segunda encadeia dois JOINs para chegar ao produto de cada item e calcula o subtotal.
- A terceira usa `LEFT JOIN` a partir de **cliente**: Carla, que não tem pedidos, continua aparecendo. Como a soma dela seria `NULL`, `coalesce(..., 0)` troca por 0.
- Resultado: Ana 1210.00 (pedido 10: 150 + 2 × 80 = 310; pedido 11: 900), Bruno 80.00, Carla 0.
- Agrupamos por `c.id, c.nome` para não misturar dois clientes com o mesmo nome.

## Erros comuns

- **Esquecer a condição do JOIN** (ou errar a coluna): cada linha se combina com todas as outras (produto cartesiano) e os totais explodem.
- **Usar `INNER JOIN` quando queria `LEFT JOIN`**: quem não tem par some sem aviso.
- **Filtrar no `WHERE` a tabela da direita de um `LEFT JOIN`** (`where p.feito_em > ...`): isso descarta os `NULL` e vira um INNER JOIN disfarçado. Coloque a condição no `ON`.
- **Colunas ambíguas** (`id` existe nas duas tabelas): use o apelido (`c.id`).

## Resumo

- `JOIN ... ON` combina tabelas pela relação FK → PK.
- `INNER` mantém só os pares; `LEFT` mantém todas as linhas da esquerda.
- JOIN + `GROUP BY` + `COALESCE` respondem perguntas de negócio completas.

## Próximo passo

Algumas perguntas precisam de uma consulta dentro de outra. A próxima aula mostra **subconsultas e CTEs**.

<!-- aula: subconsultas-e-ctes -->
## Por que isso importa

"Quais produtos custam acima da média?", "quais clientes compraram mais de uma vez?", "qual o melhor vendedor de cada mês?". Essas perguntas têm etapas. Subconsultas e CTEs (`WITH`) permitem resolver em partes, deixando a consulta legível como uma receita.

## Conceitos fundamentais

- **Subconsulta**: um `SELECT` dentro de outro, entre parênteses.
  - No `WHERE` com valor único: `where preco > (select avg(preco) from produto)`.
  - Com `IN`: `where id in (select cliente_id from pedido)`.
  - Com **`EXISTS`**: verdadeiro se a subconsulta devolver ao menos uma linha. Ótimo para "tem algum...".
  - No `FROM`: a subconsulta vira uma tabela temporária com apelido.
- **CTE** (`WITH nome AS (...)`): dá nome a uma etapa e permite usá-la logo abaixo, como variáveis em um programa. Facilita ler e testar cada parte.
- **Funções de janela** (`row_number() over (partition by ... order by ...)`) numeram ou calculam por grupo **sem juntar as linhas**. Úteis para "o primeiro de cada grupo" e rankings.

## Exemplo prático

```sql
create table produto (id integer primary key, nome text not null, categoria text not null, preco numeric(10, 2) not null);
create table venda (id integer primary key, produto_id integer not null references produto (id), quantidade integer not null, mes text not null);

insert into produto values
  (1, 'Fone', 'Áudio', 199.00), (2, 'Caixa de som', 'Áudio', 349.00),
  (3, 'Teclado', 'Periféricos', 150.00), (4, 'Mouse', 'Periféricos', 80.00),
  (5, 'Webcam', 'Periféricos', 260.00);
insert into venda values
  (1, 1, 3, '2026-09'), (2, 2, 1, '2026-09'), (3, 4, 10, '2026-09'),
  (4, 1, 1, '2026-10'), (5, 3, 4, '2026-10'), (6, 4, 2, '2026-10');

-- Produtos acima do preço médio
select nome, preco
from produto
where preco > (select avg(preco) from produto)
order by preco desc;

-- Produtos que nunca foram vendidos
select nome
from produto p
where not exists (select 1 from venda v where v.produto_id = p.id);

-- Faturamento por mês e o produto campeão de cada mês, em etapas
with faturamento as (
  select v.mes, p.nome, sum(v.quantidade * p.preco) as total
  from venda v
  join produto p on p.id = v.produto_id
  group by v.mes, p.nome
),
ranking as (
  select mes, nome, total,
         row_number() over (partition by mes order by total desc) as posicao
  from faturamento
)
select mes, nome as campeao, total
from ranking
where posicao = 1
order by mes;
```

## Explicando o código

- A média de preço é 207.60; a primeira consulta traz Caixa de som (349) e Webcam (260).
- `not exists` encontra a Webcam, que não aparece em nenhuma venda. A subconsulta "olha" para a linha de fora (`p.id`): é uma **subconsulta correlacionada**.
- A CTE `faturamento` calcula o total por mês e produto; `ranking` numera os produtos de cada mês do maior para o menor; a consulta final fica com o primeiro de cada mês.
- Setembro: Mouse (800 = 10 × 80). Outubro: Teclado (600 = 4 × 150).

## Erros comuns

- **Subconsulta que devolve várias linhas onde se espera uma** (`where preco > (select preco from produto)`): erro.
- **`NOT IN` com `NULL` na lista**: o resultado fica vazio sem você entender por quê. Prefira `NOT EXISTS`.
- **Consultas gigantes sem etapas**: use CTEs para nomear cada parte.
- **Confundir `row_number` com `rank`**: em empate, `rank` repete a posição; `row_number` sempre numera 1, 2, 3.

## Resumo

- Subconsultas resolvem perguntas em etapas; `EXISTS`/`NOT EXISTS` testam se há correspondência.
- CTEs (`WITH`) nomeiam etapas e deixam o SQL legível.
- Funções de janela calculam por grupo sem perder as linhas.

## Próximo passo

Consultas corretas também precisam ser rápidas. A próxima aula mostra **índices** e como ler o plano de execução.

<!-- aula: indices-e-desempenho -->
## Por que isso importa

Uma consulta que roda em 5 ms com mil linhas pode levar 5 segundos com dez milhões. Na maioria das vezes, a diferença entre um sistema rápido e um lento é um **índice** no lugar certo. Saber ler o plano de execução ajuda a descobrir onde o banco está perdendo tempo.

## Conceitos fundamentais

- **Índice** é uma estrutura extra (normalmente uma árvore B) que permite achar linhas sem ler a tabela inteira, como o índice remissivo de um livro.
- Sem índice, o banco faz uma **leitura sequencial** (*Seq Scan*): olha linha por linha.
- **Chaves primárias e `UNIQUE` já criam índices** automaticamente. Chaves estrangeiras **não** (no PostgreSQL): crie índice nelas quando você filtra ou faz JOIN por elas.
- Bons candidatos: colunas usadas com frequência em `WHERE`, `JOIN` e `ORDER BY`, com muitos valores diferentes.
- **Índice composto** `(a, b)` ajuda filtros por `a` e por `a` + `b`, mas não por `b` sozinho.
- Índices **custam**: ocupam espaço e deixam `INSERT`/`UPDATE` um pouco mais lentos. Não crie índice em toda coluna.
- **`EXPLAIN`** mostra o plano que o banco escolheu; **`EXPLAIN ANALYZE`** executa e mostra o tempo real.
- Funções na coluna (`where lower(email) = ...`) não usam um índice comum em `email`; crie um índice na expressão (`create index ... (lower(email))`).

## Exemplo prático

```sql
create table acesso (
  id bigint generated always as identity primary key,
  usuario_id integer not null,
  pagina text not null,
  acessado_em timestamptz not null
);

-- 200 mil acessos de exemplo
insert into acesso (usuario_id, pagina, acessado_em)
select (random() * 5000)::int, '/aula/' || (random() * 100)::int, now() - random() * interval '90 days'
from generate_series(1, 200000);

analyze acesso;

-- Sem índice: o plano mostra "Seq Scan"
explain select count(*) from acesso where usuario_id = 42;

-- Índice para a pergunta mais comum: "acessos de um usuário, do mais recente"
create index acesso_usuario_data_idx on acesso (usuario_id, acessado_em desc);
analyze acesso;

-- Agora o plano usa o índice ("Index Only Scan" ou "Bitmap Index Scan")
explain select count(*) from acesso where usuario_id = 42;

select pagina, acessado_em
from acesso
where usuario_id = 42
order by acessado_em desc
limit 5;
```

## Explicando o código

- `generate_series` com `random()` cria 200 mil linhas rapidamente para testar.
- `analyze` atualiza as estatísticas que o banco usa para escolher o plano.
- O primeiro `explain` mostra `Seq Scan`: o banco precisa olhar as 200 mil linhas.
- O índice composto `(usuario_id, acessado_em desc)` atende o filtro por usuário **e** a ordenação por data. Depois dele, o plano passa a usar o índice e lê só as poucas linhas daquele usuário.
- Para medir o tempo de verdade, troque `explain` por `explain analyze`.

## Erros comuns

- **Indexar tudo**: escritas mais lentas e espaço desperdiçado, sem ganho real.
- **Esquecer índices em chaves estrangeiras** usadas em JOINs.
- **Coluna com poucos valores** (como `ativo` true/false): índice comum quase não ajuda.
- **Otimizar no escuro**: meça com `EXPLAIN ANALYZE` antes e depois.

## Resumo

- Índices evitam ler a tabela inteira; PK e UNIQUE já têm índice, FKs não.
- Crie índices para filtros, JOINs e ordenações frequentes; índices compostos respeitam a ordem das colunas.
- Use `EXPLAIN` / `EXPLAIN ANALYZE` para ver e medir o plano.

## Próximo passo

Para fechar a trilha: **transações, concorrência e segurança** no banco, incluindo como evitar injeção de SQL.

<!-- aula: transacoes-e-seguranca -->
## Por que isso importa

Dois clientes comprando o último ingresso ao mesmo tempo, uma transferência que cai no meio, alguém digitando `' OR 1=1 --` no campo de login. Banco de dados em produção precisa lidar com **concorrência** e com **pessoas mal-intencionadas**. Esta aula reúne as proteções que todo desenvolvedor back-end deve conhecer.

## Conceitos fundamentais

- **ACID**: transações são **A**tômicas (tudo ou nada), **C**onsistentes (respeitam as restrições), **I**soladas (uma não enxerga a metade da outra) e **D**uráveis (depois do `COMMIT`, não se perdem).
- **Condição de corrida**: duas operações leem o mesmo valor e as duas decidem com base nele (as duas veem "1 ingresso restante").
- Soluções:
  - **Atualização condicional atômica**: `update ... set estoque = estoque - 1 where id = ... and estoque > 0` e conferir quantas linhas mudaram.
  - **Trava de linha**: `select ... for update` dentro de uma transação.
  - **Restrições** (`check (estoque >= 0)`, `unique`) como última barreira.
- **Injeção de SQL**: quando o texto digitado pelo usuário vira parte do comando. A defesa é **sempre** usar **parâmetros** (`$1`, `?`), nunca juntar textos para montar SQL.
- **Menor privilégio**: a aplicação conecta com um usuário que só pode o necessário (`GRANT select, insert ...`), nunca como dono do banco. No Supabase, isso é feito com **RLS** (Row Level Security): regras que dizem quais linhas cada usuário pode ver e alterar.
- **Backups**: confira se existem e se você sabe restaurar. Antes de mudanças arriscadas, faça uma cópia.

## Exemplo prático

```sql
create table ingresso (
  id integer primary key,
  evento text not null,
  disponiveis integer not null check (disponiveis >= 0)
);
create table compra (
  id integer generated always as identity primary key,
  ingresso_id integer not null references ingresso (id),
  comprador text not null
);
insert into ingresso values (1, 'Show de sábado', 1);

-- Compra segura: só baixa se ainda houver ingresso, numa única operação atômica
begin;
with baixa as (
  update ingresso
  set disponiveis = disponiveis - 1
  where id = 1 and disponiveis > 0
  returning id
)
insert into compra (ingresso_id, comprador)
select id, 'Ana' from baixa;
commit;

-- Segunda tentativa: não há mais ingresso, nada é inserido (0 linhas)
begin;
with baixa as (
  update ingresso
  set disponiveis = disponiveis - 1
  where id = 1 and disponiveis > 0
  returning id
)
insert into compra (ingresso_id, comprador)
select id, 'Bruno' from baixa;
commit;

select comprador from compra;            -- só Ana
select disponiveis from ingresso;        -- 0

-- Menor privilégio: um papel que só lê e compra
create role app_loja nologin;
grant select on ingresso to app_loja;
grant select, insert on compra to app_loja;
```

Do lado da aplicação (Node.js com a biblioteca `pg`), a consulta **com parâmetro**:

```js
// CERTO: o valor vai separado do comando; o banco nunca o interpreta como SQL.
const { rows } = await db.query("select id, nome from usuario where email = $1", [emailDigitado]);

// ERRADO: o texto digitado vira parte do SQL (injeção).
// await db.query("select id, nome from usuario where email = '" + emailDigitado + "'");
```

## Explicando o código

- O `update ... where disponiveis > 0 returning id` é **atômico**: o banco trava a linha durante a atualização, então duas compras simultâneas não conseguem baixar o mesmo ingresso. Só quem conseguiu baixar recebe o `id` e insere a compra.
- Na segunda tentativa, o `update` não encontra linha (disponíveis = 0), a CTE fica vazia e o `insert` não insere nada. Bruno recebe "esgotado" em vez de um ingresso que não existe.
- O `check (disponiveis >= 0)` é a última proteção, caso algum código esqueça a condição.
- `create role` e `grant` mostram o menor privilégio: o papel `app_loja` não pode apagar nem alterar preços.
- No JavaScript, `$1` e a lista `[emailDigitado]` mandam o valor separado do comando: mesmo que alguém digite `' OR 1=1 --`, aquilo é tratado como texto.

## Erros comuns

- **Ler, decidir no código e depois atualizar** (`select estoque` → `if > 0` → `update`): entre a leitura e a escrita, outra pessoa compra.
- **Montar SQL concatenando texto do usuário**.
- **Conectar a aplicação como superusuário** do banco.
- **Nunca testar a restauração do backup**.

## Resumo

- Transações garantem tudo ou nada; atualizações condicionais atômicas e restrições evitam condições de corrida.
- Parâmetros (`$1`) previnem injeção de SQL. Sempre.
- Menor privilégio (GRANT, RLS) e backups testados completam a segurança.

## Próximo passo

Você concluiu a trilha de SQL. Agora junte tudo: na trilha de **Supabase** você vai usar PostgreSQL com autenticação e RLS, e na de **Node.js e APIs** vai expor esses dados com segurança.
