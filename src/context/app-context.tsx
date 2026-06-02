"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  translate: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("bhatha_locale", l);
      document.documentElement.lang = l === "ur" ? "ur" : "en";
      document.documentElement.dir = l === "ur" ? "rtl" : "ltr";
    }
  }, []);

  // Hydrate saved locale after mount (client-only)
  React.useEffect(() => {
    const saved = localStorage.getItem("bhatha_locale") as Locale | null;
    if (saved === "en" || saved === "ur") {
      document.documentElement.lang = saved === "ur" ? "ur" : "en";
      document.documentElement.dir = saved === "ur" ? "rtl" : "ltr";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage once on mount
      setLocaleState(saved);
    }
  }, []);

  const translate = useCallback((key: TranslationKey) => t(locale, key), [locale]);

  return (
    <AppContext.Provider value={{ locale, setLocale, translate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
