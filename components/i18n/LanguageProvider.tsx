"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { am, en, type Dictionary } from "@/lib/i18n/dictionary";

export type Locale = "en" | "am";

type LanguageValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageValue | null>(null);
const STORAGE_KEY = "mierag-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "am" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "am" ? "am" : "en";
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<LanguageValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: locale === "am" ? am : en,
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useI18n must be used within LanguageProvider");
  return value;
}
