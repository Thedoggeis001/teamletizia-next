"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getDictionary, type Locale } from "./index";
import { setLocaleCookie } from "./lang.client";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: any;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setLocaleCookie(l);
  }, []);

  const t = useMemo(() => getDictionary(locale), [locale]);

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
