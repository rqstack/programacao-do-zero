/**
 * Campos do perfil público: normaliza o que a pessoa cola (URL inteira, @usuario...)
 * para o formato que o banco aceita. As mesmas regras estão nas restrições do banco.
 */
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const GITHUB_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const LINKEDIN_RE = /^[A-Za-z0-9_%-]{3,100}$/;

export type FieldResult = { ok: true; value: string | null } | { ok: false; error: string };

export function normalizeUsername(input: string): FieldResult {
  const v = input.trim().replace(/^@/, "").toLowerCase();
  if (!USERNAME_RE.test(v)) return { ok: false, error: "Use de 3 a 20 caracteres: letras minúsculas, números e _." };
  return { ok: true, value: v };
}

export function normalizeGithub(input: string): FieldResult {
  let v = input.trim();
  if (!v) return { ok: true, value: null };
  v = v.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0] ?? "";
  if (!GITHUB_RE.test(v)) return { ok: false, error: "Informe seu usuário do GitHub (ex.: octocat) ou o link do perfil." };
  return { ok: true, value: v };
}

export function normalizeLinkedin(input: string): FieldResult {
  let v = input.trim();
  if (!v) return { ok: true, value: null };
  const m = /linkedin\.com\/in\/([^/?#]+)/i.exec(v);
  if (m) v = m[1]!;
  v = v.replace(/^@/, "");
  if (!LINKEDIN_RE.test(v)) return { ok: false, error: "Cole o link do seu perfil (linkedin.com/in/...) ou só a parte depois de /in/." };
  return { ok: true, value: v };
}

export function normalizeWebsite(input: string): FieldResult {
  const v = input.trim();
  if (!v) return { ok: true, value: null };
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "https:") return { ok: false, error: "Use um link com https://." };
    const s = u.toString();
    if (s.length > 200 || /[\s<>"]/.test(s)) return { ok: false, error: "Link inválido." };
    return { ok: true, value: s };
  } catch {
    return { ok: false, error: "Link inválido." };
  }
}

export const githubUrl = (user: string) => `https://github.com/${user}`;
export const linkedinUrl = (slug: string) => `https://www.linkedin.com/in/${slug}`;
