import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Postgres real (PGlite) emulando o necessário do Supabase: papéis anon/authenticated/
 * service_role, schema auth com auth.uid() lendo request.jwt.claims e privilégios padrão.
 */
const BOOTSTRAP = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;
`;

const ROOT = path.resolve(__dirname, "../..");
export const SEED_FILE = path.join(ROOT, "supabase", "seed.sql");

export async function createTestDb(options: { seed?: boolean; battle?: boolean } = {}) {
  const db = new PGlite();
  await db.exec(BOOTSTRAP);
  const dir = path.join(ROOT, "supabase", "migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    try {
      await db.exec(readFileSync(path.join(dir, file), "utf8"));
    } catch (error) {
      throw new Error(`Falha na migration ${file}: ${(error as Error).message}`);
    }
  }
  if (options.seed) await db.exec(readFileSync(SEED_FILE, "utf8"));
  if (options.battle) {
    await db.exec(readFileSync(path.join(ROOT, "supabase", "battle-config.sql"), "utf8"));
    await db.exec(readFileSync(path.join(ROOT, "supabase", "battle-challenges.sql"), "utf8"));
  }
  return db;
}

export type Role = "anon" | "authenticated" | "service_role";
type Tx = Pick<PGlite, "query" | "exec">;

/** Executa `fn` como um papel de cliente, com o JWT do usuário informado. */
export async function asRole<T>(db: PGlite, role: Role, userId: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    const claims = JSON.stringify(userId ? { sub: userId, role } : { role });
    await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    await tx.exec(`set local role ${role}`);
    return fn(tx as unknown as Tx);
  });
}

export async function createUser(db: PGlite, id: string, meta: Record<string, unknown> = { full_name: "Aluno Teste" }) {
  await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [id, `${id.slice(0, 8)}@exemplo.test`, JSON.stringify(meta)]);
}
