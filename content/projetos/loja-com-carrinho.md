## Visão geral

Loja virtual é um dos testes técnicos mais pedidos para vagas de front-end: tem listagem, filtro, detalhe, estado compartilhado (o carrinho) e formulário. Aqui você faz tudo isso sem back-end próprio, usando um JSON local ou a API pública **dummyjson.com**.

Pré-requisitos: trilhas de **TypeScript** e **React**.

## Requisitos

- Catálogo com busca por nome e filtros de categoria e faixa de preço.
- Os filtros ficam na URL (`?categoria=livros&max=100`), para dar para compartilhar o link.
- Página de produto com imagem, descrição e botão "Adicionar ao carrinho".
- Carrinho com aumentar, diminuir, remover e total; persiste ao recarregar.
- Checkout com validação de nome, e-mail e CEP, terminando numa tela de resumo. Nada de pagamento real.

## Etapas

1. Liste os produtos e mostre carregando, erro e vazio.
2. Implemente busca e filtros como funções puras e depois ligue na URL.
3. Crie o carrinho como um reducer (`adicionar`, `remover`, `alterarQuantidade`) e teste-o.
4. Guarde o carrinho no `localStorage`.
5. Faça o checkout com mensagens de erro ao lado de cada campo.
6. Teste com teclado e no celular, depois publique.

## Código de partida

```ts
export interface ItemCarrinho {
  id: number;
  nome: string;
  precoCentavos: number;
  quantidade: number;
}

type Acao =
  | { tipo: "adicionar"; item: Omit<ItemCarrinho, "quantidade"> }
  | { tipo: "remover"; id: number }
  | { tipo: "quantidade"; id: number; quantidade: number };

export function carrinhoReducer(estado: ItemCarrinho[], acao: Acao): ItemCarrinho[] {
  switch (acao.tipo) {
    case "adicionar": {
      const existe = estado.find((i) => i.id === acao.item.id);
      if (existe) return estado.map((i) => (i.id === acao.item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
      return [...estado, { ...acao.item, quantidade: 1 }];
    }
    case "remover":
      return estado.filter((i) => i.id !== acao.id);
    case "quantidade":
      if (acao.quantidade <= 0) return estado.filter((i) => i.id !== acao.id);
      return estado.map((i) => (i.id === acao.id ? { ...i, quantidade: acao.quantidade } : i));
  }
}

export const totalCentavos = (itens: ItemCarrinho[]) => itens.reduce((s, i) => s + i.precoCentavos * i.quantidade, 0);
```

## Melhorias opcionais

- Cupom de desconto com regras (valor mínimo, validade).
- Cálculo de frete por CEP com a API pública ViaCEP para preencher o endereço.
- Testes de componente com Testing Library.

## Como apresentar no currículo

Este projeto conversa direto com a vaga de front-end. Destaque as decisões, não a lista de telas.

> **Loja virtual (React + TypeScript)** — catálogo com busca e filtros sincronizados na URL, carrinho com reducer testado e persistência local, checkout acessível com validação. [link] · [repositório]

Na entrevista, prepare-se para explicar **por que o carrinho é um reducer** e **por que os filtros ficam na URL**. Saber justificar escolhas vale mais do que usar a biblioteca da moda.
