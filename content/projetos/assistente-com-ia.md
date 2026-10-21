## Visão geral

O Tarefas+ ganha um assistente: a pessoa cola anotações soltas ("pagar luz sexta, estudar SQL 1h, ligar pro dentista") e recebe uma lista de tarefas organizadas, que ela **revisa antes de salvar**. Você vai integrar uma API de modelo de linguagem do jeito certo: chave no servidor, resposta estruturada e validada, limites e tratamento de erro.

Pré-requisitos: trilha de **Inteligência artificial aplicada** e o projeto **API do Tarefas+**.

> Custos: APIs de IA cobram por uso (tokens). Crie uma conta no provedor escolhido, defina um limite de gastos no painel dele e use modelos menores para testes.

## Requisitos

- Rota `POST /assistente` no seu servidor; o front-end nunca chama o provedor de IA diretamente.
- Chave da API em variável de ambiente.
- Pedir a resposta em JSON e **validar** antes de usar (com Zod, por exemplo).
- Limite de tamanho da entrada e de requisições por minuto.
- A interface mostra as sugestões para revisão; nada é salvo automaticamente.

## Etapas

1. Escreva o prompt com instruções claras, o formato de saída e dois exemplos.
2. Implemente a rota chamando o SDK oficial do provedor, com tempo limite.
3. Valide a resposta; se for inválida, devolva um erro amigável.
4. Teste com entradas difíceis: vazias, muito longas, em outro idioma e tentando "mandar" na IA ("ignore as instruções anteriores").
5. Documente no README os custos, os limites e que a IA pode errar.

## Código de partida

```js
import { z } from "zod";

const TarefaSugerida = z.object({
  texto: z.string().min(1).max(200),
  prazo: z.string().nullable(),
  prioridade: z.enum(["baixa", "media", "alta"]),
});
const RespostaAssistente = z.object({ tarefas: z.array(TarefaSugerida).max(20) });

export function validarResposta(textoDaIA) {
  let dados;
  try {
    dados = JSON.parse(textoDaIA);
  } catch {
    return { ok: false, erro: "A IA não devolveu um JSON válido." };
  }
  const resultado = RespostaAssistente.safeParse(dados);
  if (!resultado.success) return { ok: false, erro: "A resposta não segue o formato esperado." };
  return { ok: true, tarefas: resultado.data.tarefas };
}
```

## Melhorias opcionais

- Guardar um registro das chamadas (sem o texto da pessoa) para acompanhar custos.
- Permitir editar cada sugestão antes de salvar.
- Comparar dois prompts com um pequeno conjunto de exemplos e medir qual acerta mais.
