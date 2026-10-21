## Visão geral

Um quiz como os desta plataforma: as perguntas ficam em dados (não no HTML), cada resposta recebe uma explicação e o resultado aparece no final. O foco é separar **dados**, **regras** e **interface**.

Pré-requisitos: **JavaScript** até módulos.

## Requisitos

- Perguntas em um array de objetos com enunciado, alternativas, índice da correta e explicação.
- Uma pergunta por vez, com indicação "2 de 5".
- Ao responder, mostrar se acertou e a explicação; só então liberar a próxima.
- Tela final com pontuação e botão para recomeçar.

## Etapas

1. Crie `perguntas.js` exportando os dados.
2. Crie `quiz.js` com funções puras: `responder(estado, indice)` e `resultado(estado)`.
3. Crie `interface.js`, que só lê o estado e desenha a tela.
4. Ligue tudo em `main.js` com `<script type="module">`.
5. Teste as regras no console, sem a interface.

## Código de partida

```js
export const perguntas = [
  {
    enunciado: "Qual é o resultado de 2 + 3 * 4?",
    alternativas: ["20", "14", "24"],
    correta: 1,
    explicacao: "A multiplicação vem antes da soma: 3 * 4 = 12; 2 + 12 = 14.",
  },
];

export function criarEstado() {
  return { atual: 0, acertos: 0, respondida: null };
}

export function responder(estado, indice, lista) {
  if (estado.respondida !== null) return estado;
  const acertou = lista[estado.atual].correta === indice;
  return { ...estado, respondida: indice, acertos: estado.acertos + (acertou ? 1 : 0) };
}

export function avancar(estado) {
  return { ...estado, atual: estado.atual + 1, respondida: null };
}
```

## Melhorias opcionais

- Embaralhar perguntas e alternativas.
- Um cronômetro por pergunta.
- Guardar o melhor resultado no `localStorage`.
