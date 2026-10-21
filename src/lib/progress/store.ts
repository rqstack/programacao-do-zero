"use client";

import { useSyncExternalStore } from "react";
import { applyProgress, emptyProgress, parseProgress, type ProgressAction, type ProgressState, type Reward } from "./model";

const KEY = "pdz-progresso-v1";
const BACKUP_KEY = "pdz-progresso-backup";

type Listener = () => void;
const listeners = new Set<Listener>();
const rewardListeners = new Set<(r: Reward) => void>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  if (cache) return cache;
  let state: ProgressState | null = null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      state = parseProgress(JSON.parse(raw));
      // Dados corrompidos: guarda uma cópia antes de recomeçar, para não perder nada.
      if (!state) window.localStorage.setItem(BACKUP_KEY, raw);
    }
  } catch {
    state = null;
  }
  cache = state ?? emptyProgress(new Date());
  return cache;
}

function write(state: ProgressState) {
  cache = state;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Armazenamento cheio ou bloqueado (ex.: navegação privada): o progresso vale só nesta aba.
  }
  for (const l of listeners) l();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Estado vazio estável para a renderização no servidor e antes da hidratação. */
const SERVER_SNAPSHOT = emptyProgress(new Date(0));

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
}

/** true só depois da hidratação: evita mostrar "0 XP" antes de ler o navegador. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function dispatchProgress(action: ProgressAction): Reward {
  const { state, reward } = applyProgress(read(), action, new Date());
  write(state);
  if (reward.xp > 0 || reward.achievements.length > 0) {
    for (const l of rewardListeners) l(reward);
  }
  return reward;
}

export function onReward(listener: (r: Reward) => void) {
  rewardListeners.add(listener);
  return () => {
    rewardListeners.delete(listener);
  };
}

export function exportProgress(): string {
  return JSON.stringify(read(), null, 2);
}

export function importProgress(text: string): boolean {
  try {
    const parsed = parseProgress(JSON.parse(text));
    if (!parsed) return false;
    write(parsed);
    return true;
  } catch {
    return false;
  }
}

/** Substitui todo o progresso (usado pela sincronização com a conta). */
export function replaceProgress(state: ProgressState) {
  write(state);
}

/** Leitura direta, fora de componentes. */
export function getProgress(): ProgressState {
  return read();
}

export function resetProgress() {
  write(emptyProgress(new Date()));
}
