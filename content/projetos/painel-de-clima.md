## Visão geral

Um painel que mostra a temperatura atual de algumas cidades usando a **Open-Meteo**, uma API pública e gratuita que não exige chave. O desafio real não é buscar os dados, e sim tratar bem o que pode dar errado.

Pré-requisitos: **JavaScript** até Promises, async/await e fetch.

## Requisitos

- Pelo menos três cidades, cada uma com nome, latitude e longitude.
- Estado de carregamento visível.
- Mensagem de erro útil e botão "Tentar novamente".
- Verificar `resposta.ok` antes de ler o JSON.
- Buscar as cidades em paralelo.

## Etapas

1. Leia a documentação em open-meteo.com e teste uma URL direto no navegador.
2. Escreva `buscarTemperatura(cidade)` e teste no console.
3. Use `Promise.all` para buscar todas as cidades de uma vez.
4. Desenhe os quatro estados: carregando, sucesso, vazio e erro.
5. Desligue a internet (ou use o modo offline das ferramentas do navegador) e confira a mensagem de erro.

## Código de partida

```js
const cidades = [
  { nome: "São Paulo", lat: -23.55, lon: -46.63 },
  { nome: "Recife", lat: -8.05, lon: -34.88 },
  { nome: "Porto Alegre", lat: -30.03, lon: -51.23 },
];

async function buscarTemperatura(cidade) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&current=temperature_2m`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${cidade.nome}: ${resposta.status}`);
  }
  const dados = await resposta.json();
  return { nome: cidade.nome, temperatura: dados.current.temperature_2m };
}

export async function carregarPainel() {
  return Promise.all(cidades.map(buscarTemperatura));
}
```

## Melhorias opcionais

- Campo de busca de cidade usando a API de geocodificação da própria Open-Meteo.
- Ícone conforme o código de tempo (`weather_code`).
- Guardar a última resposta e mostrá-la quando estiver sem internet, com o horário da atualização.
