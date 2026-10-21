## Visão geral

Barbearias, salões, clínicas e estúdios precisam de agenda online, e muitos ainda usam caderno e WhatsApp. Este projeto resolve um problema real, pode virar seu primeiro freela e é ótimo para entrevistas, porque está cheio de regras de negócio: duração dos serviços, intervalos, conflitos de horário e fuso.

Pré-requisitos: trilhas de **Modelagem de Dados**, **SQL**, **Supabase** e **React**.

## Requisitos

- Cadastro de serviços com nome, duração e preço.
- Horário de funcionamento por dia da semana, com intervalo de almoço.
- Tela do cliente: escolhe serviço, dia e horário livre, informa nome e telefone.
- O banco impede horários sobrepostos (restrição de exclusão no PostgreSQL).
- Painel do dono, protegido por login: agenda do dia, confirmar e cancelar.

## Etapas

1. Converse com alguém que tem um negócio assim (ou imagine um) e escreva os requisitos e as regras.
2. Faça o modelo de dados: serviços, horários de funcionamento, agendamentos.
3. Garanta no banco que dois agendamentos não se sobrepõem.
4. Escreva a função que calcula os horários livres de um dia e teste com casos difíceis (fim do expediente, intervalo).
5. Monte a tela do cliente e o painel do dono.
6. Peça para alguém usar sem sua ajuda e anote onde travou.

## Código de partida

```sql
create extension if not exists btree_gist;

create table servicos (
  id bigint generated always as identity primary key,
  nome text not null,
  duracao_min integer not null check (duracao_min between 5 and 480),
  preco_centavos integer not null check (preco_centavos >= 0)
);

create table agendamentos (
  id bigint generated always as identity primary key,
  servico_id bigint not null references servicos (id),
  cliente_nome text not null check (char_length(cliente_nome) between 2 and 80),
  cliente_telefone text not null,
  periodo tstzrange not null,
  status text not null default 'marcado' check (status in ('marcado', 'confirmado', 'cancelado')),
  -- Dois agendamentos ativos não podem se sobrepor no tempo.
  exclude using gist (periodo with &&) where (status <> 'cancelado')
);
```

```ts
/** Horários livres de um dia, em passos de 15 minutos. Datas em minutos desde 00:00 (Brasília). */
export function horariosLivres(abre: number, fecha: number, ocupados: Array<[number, number]>, duracao: number): number[] {
  const livres: number[] = [];
  for (let inicio = abre; inicio + duracao <= fecha; inicio += 15) {
    const fim = inicio + duracao;
    const conflita = ocupados.some(([a, b]) => inicio < b && fim > a);
    if (!conflita) livres.push(inicio);
  }
  return livres;
}
```

## Melhorias opcionais

- Lembrete por e-mail um dia antes (Resend ou SES têm planos gratuitos).
- Vários profissionais, cada um com sua agenda.
- Bloquear dias de folga e feriados.

## Como apresentar no currículo

Conte como um caso real, com números se tiver.

> **Sistema de agendamento para [tipo de negócio] (React + Supabase)** — agenda online com cálculo de horários livres, conflitos impedidos no banco com restrição de exclusão do PostgreSQL e painel do dono com login. Testado por [N] usuários reais. [link] · [repositório]

Se o projeto for usado por um negócio de verdade, peça autorização para citar o nome e um depoimento curto. "Está em uso por uma barbearia do meu bairro" pesa muito numa entrevista para primeira vaga.
