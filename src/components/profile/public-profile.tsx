"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Code, Globe, Lock, Pencil, Rocket, Trophy, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { levelFromXp, levelTitle } from "@/lib/gamification/rules";
import { getFollowList, getPublicProfile, type PersonRow, type PublicProfile } from "@/lib/profiles/api";
import { githubUrl, linkedinUrl } from "@/lib/profiles/fields";
import { Alert, cx, EmptyState, ProgressBar, Spinner } from "@/components/ui/primitives";
import { Avatar } from "./avatar";
import { FollowButton } from "./follow-button";
import { PeopleList } from "./profile-editor";

function GithubMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
function LinkedinMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function PublicProfileView() {
  const params = useSearchParams();
  const username = (params.get("n") ?? "").trim().toLowerCase();
  const { configured, session } = useAuth();
  const [data, setData] = useState<PublicProfile | null | "erro" | undefined>(undefined);
  const [tab, setTab] = useState<"seguindo" | "seguidores" | null>(null);
  const [list, setList] = useState<PersonRow[] | null>(null);

  useEffect(() => {
    if (!configured || !username) return;
    let alive = true;
    getPublicProfile(username).then((r) => alive && setData(r));
    return () => {
      alive = false;
    };
    // session: recarrega para mostrar "Adicionado" depois do login
  }, [configured, username, session?.user.id]);

  useEffect(() => {
    if (!tab || !username) return;
    let alive = true;
    getFollowList(username, tab).then((r) => alive && setList(r));
    return () => {
      alive = false;
    };
  }, [tab, username]);

  if (!configured) return <Alert tone="warning" title="Perfis indisponíveis nesta cópia do site">O perfil precisa do Supabase configurado.</Alert>;
  if (!username) return <EmptyState title="Qual perfil?">Abra o perfil de alguém pelo ranking ou pela busca em “Meu perfil”.</EmptyState>;
  if (data === undefined) return <Spinner label="Carregando perfil" />;
  if (data === "erro") return <Alert tone="error" title="Não foi possível carregar o perfil">Verifique sua conexão e tente de novo.</Alert>;
  if (data === null) {
    return (
      <EmptyState title="Perfil não encontrado" action={<Link href="/ranking" className="underline">Ver o ranking</Link>}>
        Não existe um perfil público com o usuário @{username}. Ele pode ter mudado de nome ou deixado o perfil privado.
      </EmptyState>
    );
  }

  const p = data;
  const lvl = levelFromXp(p.xp);
  const stats = [
    { icon: BookOpen, label: "aulas", value: p.lessons },
    { icon: Code, label: "desafios", value: p.challenges },
    { icon: Rocket, label: "projetos", value: p.projects },
    { icon: Trophy, label: "troféus", value: p.trophies },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="h-fit space-y-5 rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6">
        <Avatar name={p.display_name} url={p.avatar_url} size={96} className="ring-4 ring-electric/30" />
        <div>
          <h1 className="text-2xl font-bold">{p.display_name}</h1>
          <p className="font-mono text-sm text-muted">@{p.username}</p>
          {!p.is_public && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-warn">
              <Lock aria-hidden className="size-3.5" /> Perfil privado: só você vê
            </p>
          )}
        </div>
        {p.headline && <p className="font-medium">{p.headline}</p>}
        {p.bio && <p className="whitespace-pre-line text-sm text-muted">{p.bio}</p>}

        {(p.github || p.linkedin || p.website) && (
          <ul className="space-y-2 text-sm">
            {p.github && (
              <li>
                <a href={githubUrl(p.github)} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2 hover:text-electric-hi">
                  <GithubMark /> github.com/{p.github}
                </a>
              </li>
            )}
            {p.linkedin && (
              <li>
                <a href={linkedinUrl(p.linkedin)} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2 hover:text-electric-hi">
                  <LinkedinMark /> linkedin.com/in/{p.linkedin}
                </a>
              </li>
            )}
            {p.website && (
              <li>
                <a href={p.website} target="_blank" rel="noopener noreferrer nofollow me" className="inline-flex items-center gap-2 break-all hover:text-electric-hi">
                  <Globe aria-hidden className="size-4 shrink-0" /> {p.website.replace(/^https:\/\//, "").replace(/\/$/, "")}
                </a>
              </li>
            )}
          </ul>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <button type="button" onClick={() => setTab("seguidores")} className="hover:underline">
            <strong>{p.followers}</strong> <span className="text-muted">seguidores</span>
          </button>
          <button type="button" onClick={() => setTab("seguindo")} className="hover:underline">
            <strong>{p.following}</strong> <span className="text-muted">adicionados</span>
          </button>
        </div>

        {p.is_me ? (
          <Link href="/perfil" className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong px-4 text-sm font-semibold hover:border-muted">
            <Pencil aria-hidden className="size-4" /> Editar perfil
          </Link>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <FollowButton key={`${p.username}-${p.i_follow}`} username={p.username} initial={p.i_follow} size="md" onChange={(f) => setData({ ...p, i_follow: f, followers: p.followers + (f ? 1 : -1) })} />
            {p.follows_me && <span className="text-xs text-muted">Adicionou você</span>}
          </div>
        )}
        <p className="text-xs text-subtle">Estuda aqui desde {new Date(p.joined_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
      </aside>

      <div className="space-y-8">
        <section aria-label="Nível" className="rounded-[var(--radius-lg)] border border-line p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-subtle">Nível {lvl.level}</p>
              <p className="text-2xl font-bold">{levelTitle(lvl.level)}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-amber">{p.xp} XP</p>
              <p className="text-xs text-muted">
                +{p.weekly_xp} nesta semana{p.rank ? ` · ${p.rank}º no ranking geral` : ""}
              </p>
            </div>
          </div>
          <ProgressBar className="mt-4" value={lvl.progress} label={`Progresso para o nível ${lvl.level + 1}`} />
        </section>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-4">
              <s.icon aria-hidden className="size-5 text-electric-hi" />
              <p className="mt-2 font-mono text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </li>
          ))}
        </ul>

        {tab && (
          <section aria-labelledby="lista-pessoas">
            <div className="flex items-center justify-between gap-3">
              <h2 id="lista-pessoas" className="flex items-center gap-2 font-semibold">
                <Users aria-hidden className="size-4" /> {tab === "seguidores" ? "Seguidores" : "Pessoas adicionadas"}
              </h2>
              <div role="tablist" className="inline-flex rounded-full border border-line-strong p-1 text-sm">
                {(["seguidores", "seguindo"] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx("min-h-8 rounded-full px-3", tab === t ? "bg-electric text-white" : "text-muted")}>
                    {t === "seguidores" ? "Seguidores" : "Adicionados"}
                  </button>
                ))}
              </div>
            </div>
            {!list ? <Spinner label="Carregando" /> : list.length === 0 ? <p className="mt-3 text-sm text-muted">Ninguém por aqui ainda.</p> : <PeopleList people={list} />}
          </section>
        )}
      </div>
    </div>
  );
}
