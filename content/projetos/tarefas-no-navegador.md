## Visão geral

O **Tarefas+** é o fio condutor dos projetos: ele começa aqui, como uma página que roda só no navegador, e depois ganha API, React, banco de dados, login e um assistente de IA. Nesta primeira versão, as tarefas ficam salvas no `localStorage`.

Pré-requisitos: **JavaScript** até DOM e eventos.

## Requisitos

- Adicionar uma tarefa pelo formulário.
- Marcar como concluída e desmarcar.
- Remover uma tarefa.
- Filtrar por todas, pendentes e concluídas.
- Manter as tarefas depois de recarregar a página.
- Mostrar um estado vazio útil.

## Etapas

1. **Modele os dados**: cada tarefa é um objeto `{ id, texto, feita }` dentro de um array.
2. **Escreva funções puras** para adicionar, alternar e remover; elas recebem a lista e devolvem uma nova lista.
3. **Renderize** a lista inteira a partir do array sempre que algo mudar (uma única função `renderizar`).
4. **Persista**: salve com `localStorage.setItem` e carregue com `JSON.parse` ao abrir, tratando dados inválidos.
5. **Use delegação de eventos** na lista para os botões de concluir e remover.
6. **Teste** cada função no console e todo o fluxo pelo teclado.

## Código de partida

```js
const CHAVE = "tarefas-plus";

export function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    return Array.isArray(salvo) ? salvo : [];
  } catch {
    return [];
  }
}

export function salvar(tarefas) {
  localStorage.setItem(CHAVE, JSON.stringify(tarefas));
}

export function adicionar(tarefas, texto) {
  const limpo = texto.trim();
  if (!limpo) return tarefas;
  return [...tarefas, { id: crypto.randomUUID(), texto: limpo, feita: false }];
}

export function alternar(tarefas, id) {
  return tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t));
}

export function remover(tarefas, id) {
  return tarefas.filter((t) => t.id !== id);
}

export function filtrar(tarefas, filtro) {
  if (filtro === "pendentes") return tarefas.filter((t) => !t.feita);
  if (filtro === "concluidas") return tarefas.filter((t) => t.feita);
  return tarefas;
}
```

## Melhorias opcionais

- Editar o texto de uma tarefa com duplo clique.
- Contador de pendentes ("3 tarefas restantes").
- Exportar as tarefas para um arquivo JSON.
