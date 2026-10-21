## Visão geral

Quase toda empresa tem alguma tela de "lançamentos e totais": pedidos, notas, despesas. Um controle financeiro pessoal treina exatamente isso, com uma vantagem: você vai usar o app de verdade, e uso real revela bugs que nenhum exemplo de curso mostra.

Pré-requisitos: trilhas de **JavaScript**, **TypeScript** e **React**.

## Requisitos

- Lançamento com descrição, valor, data, categoria e tipo (entrada ou saída).
- Filtro por mês, com saldo, total de entradas e total de saídas.
- Gráfico de gastos por categoria (pode ser feito com `<canvas>`, SVG ou uma biblioteca como Recharts).
- Exportar o mês em CSV.
- Guardar os dados no `localStorage` com validação ao ler (dados corrompidos não podem quebrar a tela).

## Etapas

1. Defina o tipo `Lancamento` em TypeScript antes de escrever qualquer tela.
2. Escreva as funções puras de cálculo (`totaisDoMes`, `porCategoria`) e teste com valores conferidos à mão.
3. Monte o formulário com validação: valor maior que zero, data obrigatória.
4. Faça a lista com editar e excluir, e o estado vazio ("Nenhum lançamento neste mês").
5. Adicione o gráfico e a exportação CSV.
6. Publique e use por uma semana. Anote o que incomodou e corrija.

## Código de partida

```ts
export type Tipo = "entrada" | "saida";

export interface Lancamento {
  id: string;
  descricao: string;
  /** Em centavos, para evitar erros como 0.1 + 0.2 = 0.30000000000000004 */
  centavos: number;
  data: string; // AAAA-MM-DD
  categoria: string;
  tipo: Tipo;
}

export function totaisDoMes(lista: Lancamento[], mes: string) {
  const doMes = lista.filter((l) => l.data.startsWith(mes));
  const entradas = doMes.filter((l) => l.tipo === "entrada").reduce((s, l) => s + l.centavos, 0);
  const saidas = doMes.filter((l) => l.tipo === "saida").reduce((s, l) => s + l.centavos, 0);
  return { entradas, saidas, saldo: entradas - saidas };
}

export function emReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function paraCsv(lista: Lancamento[]): string {
  const linhas = lista.map((l) => [l.data, l.descricao.replaceAll(";", ","), l.categoria, l.tipo, (l.centavos / 100).toFixed(2)].join(";"));
  return ["data;descricao;categoria;tipo;valor", ...linhas].join("\n");
}
```

## Melhorias opcionais

- Metas de gasto por categoria com aviso quando passar de 80%.
- Lançamentos recorrentes (aluguel, assinatura).
- Sincronizar com o Supabase para usar no celular e no computador.

## Como apresentar no currículo

Recrutadores olham três coisas num projeto assim: se funciona (link), se o código é organizado (tipos e funções de cálculo separadas da tela) e se você pensou em casos difíceis (centavos, dados corrompidos, mês sem lançamentos).

Exemplo de linha para o currículo:

> **Controle financeiro (React + TypeScript)** — app publicado para registrar gastos, com gráficos por categoria e exportação CSV. Cálculos em centavos inteiros e funções puras cobertas por testes. [link] · [repositório]

No LinkedIn, publique um print ou GIF curto e conte **um problema que você resolveu** (por exemplo, o erro de arredondamento com números decimais). Isso mostra raciocínio, não só resultado.
