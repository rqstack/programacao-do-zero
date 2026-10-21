## Visão geral

Ferramentas colaborativas (Trello, Notion, Jira) são o tipo de produto em que muitas empresas trabalham. Um kanban em tempo real mostra que você domina estado complexo no front, ordenação persistida, permissões por grupo e sincronização entre clientes.

Pré-requisitos: trilhas de **React**, **TypeScript** e **Supabase**.

## Requisitos

- Quadros com membros; colunas e cartões dentro de cada quadro.
- Arrastar e soltar cartões entre colunas, com alternativa pelo teclado (botões "mover para...").
- A ordem é salva no banco.
- Duas abas no mesmo quadro veem as mudanças ao vivo (Supabase Realtime).
- RLS: só membros leem e editam o quadro.

## Etapas

1. Modele `quadros`, `membros`, `colunas` e `cartoes`, com uma coluna `posicao` numérica.
2. Escreva as políticas RLS com base na tabela `membros` e teste com duas contas.
3. Faça a tela estática do quadro e depois o arrastar e soltar (a biblioteca `dnd-kit` é gratuita e acessível).
4. Ao soltar, calcule a nova posição como a média entre os vizinhos, sem renumerar tudo.
5. Assine as mudanças com o Realtime e atualize a tela.
6. Grave um GIF com duas janelas lado a lado para o README.

## Código de partida

```ts
export interface Cartao {
  id: string;
  colunaId: string;
  titulo: string;
  posicao: number;
}

/** Nova posição entre dois vizinhos: evita renumerar a coluna inteira a cada movimento. */
export function posicaoEntre(antes: number | null, depois: number | null): number {
  if (antes === null && depois === null) return 1000;
  if (antes === null) return (depois as number) - 1000;
  if (depois === null) return antes + 1000;
  return (antes + depois) / 2;
}

export function moverCartao(cartoes: Cartao[], id: string, colunaId: string, indice: number): Cartao[] {
  const destino = cartoes.filter((c) => c.colunaId === colunaId && c.id !== id).sort((a, b) => a.posicao - b.posicao);
  const antes = destino[indice - 1]?.posicao ?? null;
  const depois = destino[indice]?.posicao ?? null;
  return cartoes.map((c) => (c.id === id ? { ...c, colunaId, posicao: posicaoEntre(antes, depois) } : c));
}
```

## Melhorias opcionais

- Etiquetas, prazos e responsáveis nos cartões.
- Desfazer a última ação (Ctrl+Z).
- Indicador de quem está vendo o quadro agora (Presence do Supabase).

## Como apresentar no currículo

> **Kanban colaborativo (React + TypeScript + Supabase Realtime)** — quadros com membros e permissões via RLS, arrastar e soltar acessível, ordenação persistida sem renumeração e sincronização ao vivo entre usuários. [link] · [repositório]

O GIF com duas janelas atualizando juntas é o que faz alguém parar de rolar o seu perfil. Coloque-o no topo do README e no post do LinkedIn.
