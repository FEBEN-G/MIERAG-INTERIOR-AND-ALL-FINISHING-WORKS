"use client";

import { useSyncExternalStore } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/api/content";
import { isApiConfigured } from "@/lib/api/client";

type SettingsState = { ready: boolean; settings: SiteSettings };

const CACHE_KEY = "mierag-site-settings-v2";
const LOAD_TIMEOUT_MS = 2500;
export const EMPTY_SETTINGS: SiteSettings = {
  contact: { phone: "", email: "", address: "", companyName: "" },
  images: {},
  text: { am: {}, en: {} },
  hiddenSections: [],
  // Null means "use the built-in list"; an empty list means the admin removed every service.
  services: null,
};
// Pages are prerendered, so the server renders defaults. Without an API there is nothing to wait for.
const SERVER_STATE: SettingsState = { ready: !isApiConfigured(), settings: EMPTY_SETTINGS };

const listeners = new Set<() => void>();
let state: SettingsState | null = null;
let loadStarted = false;

function readCache(): SiteSettings | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteSettings) : null;
  } catch {
    return null;
  }
}

function currentState(): SettingsState {
  if (!state) {
    const cached = readCache();
    state = cached ? { ready: true, settings: cached } : SERVER_STATE;
  }
  return state;
}

function publish(next: SettingsState) {
  state = next;
  listeners.forEach((listener) => listener());
}

/** Shows new settings everywhere and remembers them for the next visit. */
export function applySiteSettings(settings: SiteSettings) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {}
  publish({ ready: true, settings });
}

function load() {
  if (loadStarted || !isApiConfigured()) return;
  loadStarted = true;
  // Never leave images hidden if the API is slow or down.
  const reveal = () => publish({ ready: true, settings: currentState().settings });
  const timer = window.setTimeout(reveal, LOAD_TIMEOUT_MS);
  getSiteSettings()
    .then(applySiteSettings)
    .catch(reveal)
    .finally(() => window.clearTimeout(timer));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

export function useSiteSettings() {
  return useSyncExternalStore(subscribe, currentState, () => SERVER_STATE);
}
