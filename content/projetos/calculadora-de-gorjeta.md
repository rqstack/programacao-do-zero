## Visão geral

Uma calculadora que recebe o valor da conta, o percentual de gorjeta e o número de pessoas, e mostra a gorjeta e quanto cada pessoa paga. Pequena, mas com tudo o que um formulário real exige: rótulos, validação, cálculo e mensagens de erro claras.

Pré-requisitos: **JavaScript** até a aula de eventos.

## Requisitos

- Campos: valor da conta, gorjeta (%) e número de pessoas.
- Resultado: valor da gorjeta, total e valor por pessoa, em reais.
- Mensagens de erro para valores vazios, zero ou negativos.
- O cálculo fica em uma função pura, separada do código que mexe na página.

## Etapas

1. Monte o formulário com `<label for>` em cada campo e `type="number"`.
2. Escreva e teste a função `calcular` no console antes de ligá-la ao formulário.
3. Ouça o evento `submit`, use `preventDefault()` e leia os campos com `Number(...)`.
4. Valide: se algo estiver errado, mostre a mensagem perto do campo e não calcule.
5. Formate com `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`.
6. Teste com valores conferidos à mão: conta de R$ 100, 10% e 4 pessoas resulta em R$ 27,50 por pessoa.

## Código de partida

```js
export function calcular(conta, percentual, pessoas) {
  if (!(conta > 0)) throw new Error("Informe um valor de conta maior que zero.");
  if (!(percentual >= 0)) throw new Error("A gorjeta não pode ser negativa.");
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new Error("Informe pelo menos 1 pessoa.");

  const gorjeta = conta * (percentual / 100);
  const total = conta + gorjeta;
  return { gorjeta, total, porPessoa: total / pessoas };
}

const reais = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

console.log(reais(calcular(100, 10, 4).porPessoa)); // "R$ 27,50"
```

## Melhorias opcionais

- Botões rápidos de 10%, 15% e 20%.
- Arredondar para cima o valor por pessoa, para não faltar dinheiro.
- Guardar o último percentual usado no `localStorage`.
