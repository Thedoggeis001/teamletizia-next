import { cookieName, defaultLocale, locales, type Locale } from "./index";

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${cookieName}=${encodeURIComponent(
    locale
  )}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function safeLocale(val: string | null | undefined): Locale {
  if (!val) return defaultLocale;
  const decoded = decodeURIComponent(val);
  if ((locales as readonly string[]).includes(decoded)) return decoded as Locale;
  return defaultLocale;
}
/**
 * ============================================================================
 * I18N SYSTEM ARCHITECTURE – Runtime Flow Explanation
 * ============================================================================
 *
 * This project implements a custom internationalization (i18n) system using:
 * - JSON dictionaries
 * - A technical cookie (tl_lang)
 * - Server-side locale detection
 * - A React Context provider
 * - Automatic English fallback
 *
 * ----------------------------------------------------------------------------
 * 1️⃣ FIRST VISIT – Server-Side Locale Resolution
 * ----------------------------------------------------------------------------
 *
 * File: src/i18n/lang.server.ts
 *
 * When a request reaches the server:
 *
 *   const cookieStore = await cookies();
 *   const val = cookieStore.get(cookieName)?.value;
 *
 * - If the cookie "tl_lang" does not exist → defaultLocale ("en") is returned.
 * - If the cookie exists but is invalid → defaultLocale is returned.
 * - If valid → the selected locale is returned.
 *
 * The layout then uses this value:
 *
 * File: src/app/layout.tsx
 *
 *   const locale = await getLocaleFromCookies();
 *   <html lang={locale}>
 *   <I18nProvider initialLocale={locale}>
 *
 * Result:
 * - The correct language is applied during the initial server render.
 * - No language flash occurs.
 * - HTML <lang> attribute is correct for SEO.
 *
 * ----------------------------------------------------------------------------
 * 2️⃣ CLIENT INITIALIZATION – React State & Dictionary Creation
 * ----------------------------------------------------------------------------
 *
 * File: src/i18n/I18nProvider.tsx
 *
 *   const [locale, setLocaleState] = useState(initialLocale);
 *
 * The provider initializes React state using the server-detected locale.
 *
 * Then it generates the translation dictionary:
 *
 *   const t = useMemo(() => getDictionary(locale), [locale]);
 *
 * File: src/i18n/index.ts
 *
 * getDictionary(locale):
 * - Selects the correct JSON dictionary.
 * - Uses English as the base dictionary.
 * - Performs a deep merge:
 *
 *     merged = deepMerge(EN, currentLocale)
 *
 * This guarantees:
 * - All keys always exist.
 * - Missing translations fall back to English.
 * - No undefined UI text.
 *
 * The provider exposes:
 *
 *   <I18nContext.Provider value={{ locale, setLocale, t }}>
 *
 * Components consume translations via:
 *
 *   const { t } = useI18n();
 *
 * Result:
 * - All visible text reflects the active locale.
 *
 * ----------------------------------------------------------------------------
 * 3️⃣ USER CHANGES LANGUAGE (Client-Side Update)
 * ----------------------------------------------------------------------------
 *
 * The Navbar calls:
 *
 *   setLocale("ja");
 *
 * File: src/i18n/I18nProvider.tsx
 *
 *   setLocaleState(l);        // Immediate UI update
 *   setLocaleCookie(l);       // Persist selection
 *
 * File: src/i18n/lang.client.ts
 *
 *   document.cookie = "tl_lang=ja; path=/; max-age=...; samesite=lax";
 *
 * Result:
 * - React re-renders instantly with new translations.
 * - The selected language is stored in a cookie.
 *
 * ----------------------------------------------------------------------------
 * 4️⃣ PAGE REFRESH OR FUTURE VISITS
 * ----------------------------------------------------------------------------
 *
 * On the next request:
 *
 * - lang.server.ts reads the cookie again.
 * - layout.tsx passes it to I18nProvider.
 * - getDictionary() rebuilds the correct dictionary.
 *
 * The user experiences persistent language preference.
 *
 * ----------------------------------------------------------------------------
 * QUALITY & ROBUSTNESS FEATURES
 * ----------------------------------------------------------------------------
 *
 * ✔ Cookie validation:
 *   Invalid values default safely to English.
 *
 * ✔ Automatic fallback:
 *   Missing locale keys fall back to English via deepMerge().
 *
 * ✔ Development warnings:
 *   Missing or extra keys are logged in development mode.
 *
 * ✔ Dictionary caching:
 *   Merged dictionaries are cached for performance optimization.
 *
 * ----------------------------------------------------------------------------
 * SUMMARY
 * ----------------------------------------------------------------------------
 *
 * Server:
 *   - Reads locale from cookie (lang.server.ts)
 *   - Sets initial HTML language
 *
 * Client:
 *   - Manages locale state (I18nProvider)
 *   - Generates merged dictionary (index.ts)
 *   - Updates UI instantly
 *   - Writes cookie when language changes (lang.client.ts)
 *
 * The result is a fully synchronized server-client i18n system
 * with persistence, fallback safety, and development diagnostics.
 *
 * ============================================================================
 */
