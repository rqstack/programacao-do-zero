"use client";

import { PORTFOLIO_KEYS, PORTFOLIO_LABEL } from "@/lib/profiles/portfolio";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Search } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { getFollowList, getMyProfile, profileHref, saveMyProfile, searchProfiles, type MyProfileFields, type PersonRow } from "@/lib/profiles/api";
import { normalizeGithub, normalizeLinkedin, normalizeUsername, normalizeWebsite } from "@/lib/profiles/fields";
import { BASE_PATH } from "@/lib/supabase/client";
import { Alert, Button, EmptyState, Spinner } from "@/components/ui/primitives";
import { Avatar } from "./avatar";
import { FollowButton } from "./follow-button";

const input = "mt-1 min-h-11 w-full rounded-md border border-line-strong bg-ink px-3 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40";

interface Form {
  username: string;
  display_name: string;
  headline: string;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
  is_public: boolean;
  portfolio: Record<string, boolean>;
}

export function ProfileEditor() {
  const { configured, loading, session, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    getMyProfile(userId).then((p: MyProfileFields | null) => {
      if (!alive || !p) return;
      setForm({ username: p.username, display_name: p.display_name, headline: p.headline, bio: p.bio, github: p.github ?? "", linkedin: p.linkedin ?? "", website: p.website ?? "", is_public: p.is_public, portfolio: (p.portfolio ?? {}) as Record<string, boolean> });
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (!configured) return <Alert tone="warning" title="Perfis indisponíveis nesta cópia do site">O perfil precisa do Supabase configurado.</Alert>;
  if (loading) return <Spinner label="Carregando" />;
  if (!session) {
    return (
      <EmptyState title="Entre para criar seu perfil" action={<Link href="/entrar" className="inline-flex min-h-11 items-center rounded-md bg-electric px-4 font-semibold text-white">Entrar com Google</Link>}>
        Com o perfil você mostra seu nível, seus troféus e seus links do GitHub e do LinkedIn, e adiciona outras pessoas que estudam aqui.
      </EmptyState>
    );
  }
  if (!form) return <Spinner label="Carregando seu perfil" />;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });
  const publicUrl = typeof window === "undefined" ? "" : `${window.location.origin}${BASE_PATH}${profileHref(form.username)}`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !userId) return;
    const u = normalizeUsername(form.username);
    const g = normalizeGithub(form.github);
    const l = normalizeLinkedin(form.linkedin);
    const w = normalizeWebsite(form.website);
    const name = form.display_name.trim();
    const next: typeof errors = {};
    if (!u.ok) next.username = u.error;
    if (!g.ok) next.github = g.error;
    if (!l.ok) next.linkedin = l.error;
    if (!w.ok) next.website = w.error;
    if (name.length < 2 || name.length > 40) next.display_name = "O nome precisa ter entre 2 e 40 caracteres.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !u.ok || !g.ok || !l.ok || !w.ok) {
      setMessage({ tone: "error", text: "Confira os campos destacados." });
      return;
    }
    setSaving(true);
    const result = await saveMyProfile(userId, {
      username: u.value!,
      display_name: name,
      headline: form.headline.trim().slice(0, 60),
      bio: form.bio.trim().slice(0, 280),
      github: g.value,
      linkedin: l.value,
      website: w.value,
      is_public: form.is_public,
      // Só guarda o que foi desligado; o resto fica visível por padrão.
      portfolio: Object.fromEntries(PORTFOLIO_KEYS.filter((k) => form.portfolio[k] === false).map((k) => [k, false])),
    });
    setSaving(false);
    if (result === "usuario-em-uso") {
      setErrors({ username: "Esse usuário já está em uso. Tente outro." });
      setMessage({ tone: "error", text: "Esse usuário já está em uso." });
      return;
    }
    if (result === "erro") {
      setMessage({ tone: "error", text: "Não foi possível salvar agora. Tente de novo." });
      return;
    }
    setForm({ ...form, username: u.value!, github: g.value ?? "", linkedin: l.value ?? "", website: w.value ?? "" });
    await refreshProfile();
    setMessage({ tone: "success", text: "Perfil salvo!" });
  }

  const field = (k: keyof Form, label: string, hint: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`perfil-${k}`} className="block text-sm font-medium">
        {label}
      </label>
      <input id={`perfil-${k}`} value={String(form[k])} onChange={(e) => set(k, e.target.value as never)} aria-invalid={Boolean(errors[k])} aria-describedby={`perfil-${k}-dica`} className={input} {...props} />
      <p id={`perfil-${k}-dica`} className={errors[k] ? "mt-1 text-xs text-bad" : "mt-1 text-xs text-subtle"}>
        {errors[k] ?? hint}
      </p>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-12">
        <form onSubmit={save} className="space-y-5" noValidate>
          <h2 className="text-xl font-semibold">Seu perfil</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("display_name", "Nome", "Aparece no perfil e no ranking.", { maxLength: 40 })}
            {field("username", "Usuário", "Seu endereço: letras minúsculas, números e _.", { maxLength: 21, autoCapitalize: "off", spellCheck: false })}
          </div>
          {field("headline", "Título", "Ex.: Estudando React · Em busca do primeiro estágio", { maxLength: 60 })}
          <div>
            <label htmlFor="perfil-bio" className="block text-sm font-medium">
              Sobre você
            </label>
            <textarea id="perfil-bio" value={form.bio} maxLength={280} rows={4} onChange={(e) => set("bio", e.target.value)} className={`${input} py-2`} />
            <p className="mt-1 text-xs text-subtle">{form.bio.length}/280 · O que você estuda, o que está construindo, o que procura.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("github", "GitHub", "Seu usuário ou o link do perfil.", { placeholder: "github.com/seu-usuario", autoCapitalize: "off", spellCheck: false })}
            {field("linkedin", "LinkedIn", "O link do seu perfil.", { placeholder: "linkedin.com/in/seu-perfil", autoCapitalize: "off", spellCheck: false })}
          </div>
          {field("website", "Site ou portfólio", "Opcional. Precisa começar com https://", { placeholder: "https://seu-portfolio.dev", autoCapitalize: "off", spellCheck: false })}
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 accent-[#3d7bff]" checked={form.is_public} onChange={(e) => set("is_public", e.target.checked)} />
            <span>
              <span className="font-medium">Publicar meu portfólio</span>
              <span className="block text-muted">
                Desmarcado (padrão para contas novas), só você vê. Marcado, qualquer pessoa com o link vê o que você escolher abaixo e pode te adicionar. Seu e-mail, anotações, favoritos e erros
                nunca aparecem.
              </span>
            </span>
          </label>
          {form.is_public && (
            <fieldset className="rounded-[var(--radius-md)] border border-line p-4">
              <legend className="px-1 text-sm font-medium">O que mostrar no portfólio</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {PORTFOLIO_KEYS.map((k) => (
                  <label key={k} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[#3d7bff]"
                      checked={form.portfolio[k] !== false}
                      onChange={(e) => set("portfolio", { ...form.portfolio, [k]: e.target.checked })}
                    />
                    {PORTFOLIO_LABEL[k]}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-subtle">
                Aparece só o que o servidor registrou quando você estava com a conta conectada. Para mostrar o link do repositório de um projeto, informe-o ao concluir o projeto.
              </p>
            </fieldset>
          )}
          {message && (
            <p role="status" className={message.tone === "success" ? "text-sm text-ok" : "text-sm text-bad"}>
              {message.text}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar perfil"}
            </Button>
            <Link href={profileHref(form.username)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong px-4 font-semibold hover:border-muted">
              <ExternalLink aria-hidden className="size-4" /> Ver meu perfil
            </Link>
          </div>
        </form>

        <People username={profile?.username || form.username} />
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <p className="text-xs font-semibold text-subtle">Prévia</p>
        <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-5">
          <div className="flex items-center gap-3">
            <Avatar name={form.display_name} url={profile?.avatarUrl ?? null} size={56} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{form.display_name || "Seu nome"}</p>
              <p className="truncate font-mono text-xs text-muted">@{form.username}</p>
            </div>
          </div>
          {form.headline && <p className="mt-3 text-sm">{form.headline}</p>}
          {form.bio && <p className="mt-2 whitespace-pre-line text-sm text-muted">{form.bio}</p>}
        </div>
        {form.is_public && (
          <div className="rounded-[var(--radius-lg)] border border-line p-4">
            <p className="text-sm font-medium">Seu link</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">{publicUrl}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publicUrl);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* sem permissão para copiar */
                }
              }}
            >
              <Copy aria-hidden className="size-4" /> {copied ? "Copiado!" : "Copiar link"}
            </Button>
            <p className="mt-2 text-xs text-subtle">Coloque no LinkedIn ou no README do GitHub para mostrar sua evolução.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Buscar e adicionar pessoas + lista de quem você adicionou. */
function People({ username }: { username: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonRow[] | null>(null);
  const [mine, setMine] = useState<PersonRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    getFollowList(username, "seguindo").then((r) => alive && setMine(r));
    return () => {
      alive = false;
    };
  }, [username]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    let alive = true;
    const t = window.setTimeout(() => searchProfiles(query).then((r) => alive && setResults(r)), 300);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [query]);

  return (
    <section aria-labelledby="pessoas" className="space-y-5">
      <h2 id="pessoas" className="text-xl font-semibold">
        Adicionar pessoas
      </h2>
      <div className="relative">
        <label htmlFor="buscar-pessoas" className="sr-only">
          Buscar pessoas por nome ou usuário
        </label>
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input id="buscar-pessoas" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou @usuário" className={`${input} mt-0 pl-9`} />
      </div>
      {query.trim().length >= 2 && results && (results.length === 0 ? <p className="text-sm text-muted">Ninguém encontrado com “{query}”.</p> : <PeopleList people={results.filter((p) => p.username !== username)} />)}

      <div>
        <h3 className="text-sm font-semibold text-subtle">Quem você adicionou {mine ? `(${mine.length})` : ""}</h3>
        {!mine ? <Spinner label="Carregando" /> : mine.length === 0 ? <p className="mt-2 text-sm text-muted">Ninguém ainda. Busque colegas acima ou adicione pelo ranking.</p> : <PeopleList people={mine.map((p) => ({ ...p, i_follow: true }))} />}
      </div>
    </section>
  );
}

export function PeopleList({ people }: { people: PersonRow[] }) {
  return (
    <ul className="mt-2 divide-y divide-line rounded-[var(--radius-lg)] border border-line">
      {people.map((p) => (
        <li key={p.username} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={p.display_name} url={p.avatar_url} size={36} />
          <Link href={profileHref(p.username)} className="min-w-0 flex-1 hover:underline">
            <span className="block truncate font-medium">{p.display_name}</span>
            <span className="block truncate text-xs text-muted">
              @{p.username}
              {p.headline ? ` · ${p.headline}` : ""}
            </span>
          </Link>
          <span className="hidden font-mono text-xs text-amber sm:inline">{p.xp} XP</span>
          {p.i_follow !== undefined && <FollowButton username={p.username} initial={p.i_follow} />}
        </li>
      ))}
    </ul>
  );
}
