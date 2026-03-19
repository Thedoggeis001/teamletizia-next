import en from "../dictionaries/en.json";
import es from "../dictionaries/es.json";
import pt from "../dictionaries/pt.json";
import ja from "../dictionaries/ja.json";
import zhCN from "../dictionaries/zh-CN.json";

export const locales = ["en", "es", "pt", "ja", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const cookieName = "tl_lang";

const DICTS: Record<Locale, any> = {
  en,
  es,
  pt,
  ja,
  "zh-CN": zhCN,
};

function isPlainObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// Merge profondo: base (EN) + override (locale)
// Se una key manca nel locale → resta EN
function deepMerge<T extends Record<string, any>>(base: T, override: any): T {
  const out: any = { ...base };
  if (!isPlainObject(override)) return out;

  for (const k of Object.keys(override)) {
    const bv = (base as any)[k];
    const ov = (override as any)[k];

    if (isPlainObject(bv) && isPlainObject(ov)) out[k] = deepMerge(bv, ov);
    else if (ov !== undefined && ov !== null) out[k] = ov;
  }

  return out;
}

function flattenKeys(obj: any, prefix = ""): string[] {
  if (!isPlainObject(obj)) return [];
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.push(path);
    keys.push(...flattenKeys(obj[k], path));
  }
  return keys;
}

// warn “una volta sola” per evitare spam in console
const warned = new Set<string>();
function devWarnOnce(msg: string) {
  if (process.env.NODE_ENV !== "development") return;
  if (warned.has(msg)) return;
  warned.add(msg);
  // eslint-disable-next-line no-console
  console.warn(msg);
}

// cache per non rifare merge + warn ad ogni render
const MERGED_CACHE: Partial<Record<Locale, any>> = {};

export function getDictionary(locale: Locale) {
  const safeLocale: Locale = (DICTS[locale] ? locale : defaultLocale);

  if (safeLocale === "en") return DICTS.en;

  // cache
  if (MERGED_CACHE[safeLocale]) return MERGED_CACHE[safeLocale];

  const base = DICTS.en;
  const current = DICTS[safeLocale];

  const merged = deepMerge(base, current);
  MERGED_CACHE[safeLocale] = merged;

  // ✅ DEV WARNING: key EN mancanti nel locale + key extra nel locale
  if (process.env.NODE_ENV === "development") {
    const enKeys = new Set(flattenKeys(base));
    const curKeys = new Set(flattenKeys(current));

    for (const k of enKeys) {
      if (!curKeys.has(k)) {
        devWarnOnce(`[i18n] Missing key "${k}" in locale "${safeLocale}" → fallback EN`);
      }
    }

    for (const k of curKeys) {
      if (!enKeys.has(k)) {
        devWarnOnce(`[i18n] Extra key "${k}" in locale "${safeLocale}" (not in EN)`);
      }
    }
  }

  return merged;
}
