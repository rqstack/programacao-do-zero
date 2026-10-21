## Visão geral

Dados abertos do governo (dados.gov.br, IBGE, portais de prefeituras) são enormes, gratuitos e cheios de perguntas interessantes. Este projeto mostra que você sabe **fazer perguntas, consultar com SQL e comunicar a resposta**, que é o dia a dia de vagas de dados, de back-end e até de produto.

Pré-requisitos: trilhas de **SQL** e **Modelagem de Dados**.

## Requisitos

- Escolher um conjunto de dados público e citar a fonte e a data do download.
- Importar para um banco (SQLite, PostgreSQL local ou Supabase).
- Responder pelo menos 5 perguntas com consultas SQL salvas em arquivos `.sql`.
- Mostrar cada resposta num gráfico ou tabela com uma frase de conclusão.
- Explicar no README o que os dados **não** permitem concluir.

## Etapas

1. Escolha um tema que te interesse (transporte, saúde, educação, clima da sua cidade).
2. Abra o arquivo numa planilha primeiro e anote colunas, tipos e problemas (vazios, datas em formatos diferentes).
3. Crie as tabelas e importe; trate os problemas que você anotou.
4. Escreva as perguntas em português antes de escrever o SQL.
5. Faça as consultas, confira algumas à mão e monte os gráficos.
6. Escreva o README como um relatório curto.

## Código de partida

```sql
-- Exemplo com uma tabela de atendimentos por município (adapte ao seu conjunto)
create table atendimentos (
  id integer primary key,
  municipio text not null,
  uf text not null,
  data date not null,
  tipo text not null,
  quantidade integer not null check (quantidade >= 0)
);

-- Pergunta: quais 10 municípios tiveram mais atendimentos em 2025?
select municipio, uf, sum(quantidade) as total
from atendimentos
where data between '2025-01-01' and '2025-12-31'
group by municipio, uf
order by total desc
limit 10;

-- Pergunta: quais tipos passaram de 1000 atendimentos no mês?
select strftime('%Y-%m', data) as mes, tipo, sum(quantidade) as total
from atendimentos
group by mes, tipo
having sum(quantidade) > 1000
order by mes, total desc;
```

## Melhorias opcionais

- Painel interativo com filtro por estado.
- Atualização automática quando sair um arquivo novo (um script agendado).
- Comparar dois anos e calcular a variação percentual.

## Como apresentar no currículo

Mostre a pergunta e a resposta, não só a tecnologia.

> **Análise de dados públicos de [tema] (SQL + gráficos)** — importei e limpei [N mil] registros do [fonte], respondi 5 perguntas com consultas SQL (JOIN, GROUP BY, HAVING, funções de data) e publiquei um painel com as conclusões. [link] · [repositório]

No LinkedIn, um post com **um gráfico e uma descoberta** ("a cidade X teve o dobro de...") costuma ter muito mais alcance do que "terminei um curso de SQL".
