-- Apoio voluntário via Pix (Syncpay). Sem relação com XP, troféus ou contas:
-- não guarda dados pessoais (nem nome, nem CPF); só valor, estado e um hash do IP
-- para limitar abusos. Acesso apenas pela Edge Function support-pix (service_role).
create table public.support_donations (
  id uuid primary key,
  idempotency_key uuid not null unique,
  amount_cents bigint not null check (amount_cents >= 500),
  provider_id text unique,
  pix_code text,
  status text not null default 'aguardando' check (status in ('aguardando', 'confirmado', 'expirado', 'falhou', 'estornado')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  last_checked_at timestamptz,
  ip_hash text not null check (char_length(ip_hash) between 8 and 128),
  check (status <> 'confirmado' or confirmed_at is not null)
);
create index support_donations_ip_idx on public.support_donations (ip_hash, created_at);

alter table public.support_donations enable row level security;
revoke all on public.support_donations from anon, authenticated;
