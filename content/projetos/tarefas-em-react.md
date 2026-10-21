## Visão geral

A interface do Tarefas+ refeita em **React**, agora conversando com a API do projeto anterior. Você vai dividir a tela em componentes, controlar estado e tratar o ciclo de uma requisição.

Pré-requisitos: trilha de **React** e o projeto **API do Tarefas+**.

## Requisitos

- Componentes: `App`, `FormularioTarefa`, `ListaTarefas` e `ItemTarefa`.
- Carregar as tarefas da API ao abrir.
- Criar, concluir e remover pela API, atualizando a tela.
- Telas de carregando, vazio e erro com "Tentar novamente".
- Endereço da API vindo de variável de ambiente (`import.meta.env.VITE_API_URL` no Vite).

## Etapas

1. Crie o projeto com `npm create vite@latest` e o modelo React.
2. Monte os componentes com dados fixos primeiro; depois troque pela API.
3. Crie um módulo `api.js` com as funções de requisição, separado dos componentes.
4. Use `useEffect` para carregar ao montar e trate o cancelamento.
5. Habilite CORS na API apenas para o endereço do front-end.

## Código de partida

```jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export function App() {
  const [tarefas, setTarefas] = useState([]);
  const [estado, setEstado] = useState("carregando");

  async function carregar() {
    setEstado("carregando");
    try {
      const resposta = await fetch(`${API}/tarefas`);
      if (!resposta.ok) throw new Error(String(resposta.status));
      setTarefas(await resposta.json());
      setEstado("pronto");
    } catch {
      setEstado("erro");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (estado === "carregando") return <p>Carregando tarefas...</p>;
  if (estado === "erro") {
    return (
      <p>
        Não foi possível carregar. <button onClick={carregar}>Tentar novamente</button>
      </p>
    );
  }
  if (tarefas.length === 0) return <p>Nenhuma tarefa ainda. Adicione a primeira!</p>;

  return (
    <ul>
      {tarefas.map((t) => (
        <li key={t.id}>{t.texto}</li>
      ))}
    </ul>
  );
}
```

## Melhorias opcionais

- Atualização otimista: mostrar a tarefa antes de a API responder e desfazer se falhar.
- Um hook próprio `useTarefas` concentrando a lógica.
- Testes de componente com Testing Library.
