"use client";

import { getSupabase } from "@/lib/supabase/client";

export interface PublicProfile {
  username: string;
  display_name: string;
  avatar_url: string | null;
  headline: string;
  bio: string;
  github: string | null;
  linkedin: string | null;
  website: string | null;
  is_public: boolean;
  joined_at: string;
  xp: number;
  weekly_xp: number;
  rank: number | null;
  lessons: number;
  challenges: number;
  projects: number;
  trophies: number;
  followers: number;
  following: number;
  is_me: boolean;
  i_follow: boolean;
  follows_me: boolean;
}

export interface PersonRow {
  username: string;
  display_name: string;
  avatar_url: string | null;
  headline: string;
  xp: number;
  i_follow?: boolean;
}

export interface FriendRow {
  rank: number;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  xp: number;
  is_me: boolean;
}

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export async function getPublicProfile(username: string): Promise<PublicProfile | null | "erro"> {
  const supabase = getSupabase();
  if (!supabase) return "erro";
  const { data, error } = await supabase.rpc("get_public_profile", { p_username: username });
  if (error) return "erro";
  const row = (data as PublicProfile[] | null)?.[0];
  if (!row) return null;
  return {
    ...row,
    xp: Number(row.xp),
    weekly_xp: Number(row.weekly_xp),
    rank: num(row.rank),
    followers: Number(row.followers),
    following: Number(row.following),
    lessons: Number(row.lessons),
    challenges: Number(row.challenges),
    projects: Number(row.projects),
    trophies: Number(row.trophies),
  };
}

export async function searchProfiles(query: string): Promise<PersonRow[]> {
  const supabase = getSupabase();
  if (!supabase || query.trim().length < 2) return [];
  const { data } = await supabase.rpc("search_profiles", { p_query: query });
  return ((data ?? []) as PersonRow[]).map((r) => ({ ...r, xp: Number(r.xp) }));
}

export async function getFollowList(username: string, kind: "seguindo" | "seguidores"): Promise<PersonRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.rpc("get_follow_list", { p_username: username, p_kind: kind });
  return ((data ?? []) as PersonRow[]).map((r) => ({ ...r, xp: Number(r.xp) }));
}

export async function getFriendsLeaderboard(): Promise<FriendRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_friends_leaderboard");
  if (error) return null;
  return ((data ?? []) as FriendRow[]).map((r) => ({ ...r, rank: Number(r.rank), weekly_xp: Number(r.weekly_xp), xp: Number(r.xp) }));
}

export async function setFollow(username: string, follow: boolean): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc(follow ? "follow_user" : "unfollow_user", { p_username: username });
  return !error && data !== false;
}

export interface MyProfileFields {
  username: string;
  display_name: string;
  headline: string;
  bio: string;
  github: string | null;
  linkedin: string | null;
  website: string | null;
  is_public: boolean;
  show_in_ranking: boolean;
  /** Seções do portfólio desligadas ({ show_projects: false, ... }). */
  portfolio: Record<string, unknown>;
}

export async function getMyProfile(userId: string): Promise<MyProfileFields | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, headline, bio, github, linkedin, website, is_public, show_in_ranking, portfolio")
    .eq("id", userId)
    .maybeSingle();
  return (data as MyProfileFields | null) ?? null;
}

export async function saveMyProfile(userId: string, fields: Omit<MyProfileFields, "show_in_ranking">): Promise<"ok" | "usuario-em-uso" | "erro"> {
  const supabase = getSupabase();
  if (!supabase) return "erro";
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (!error) return "ok";
  return error.code === "23505" ? "usuario-em-uso" : "erro";
}

/** Link do perfil público (o site é estático, então o usuário vai na query string). */
export const profileHref = (username: string) => `/u/?n=${encodeURIComponent(username)}`;
