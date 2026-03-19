import { cookies } from "next/headers";
import { cookieName, defaultLocale, locales, type Locale } from "./index";

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get(cookieName)?.value;
  if (!val) return defaultLocale;

  const decoded = decodeURIComponent(val);
  if ((locales as readonly string[]).includes(decoded)) return decoded as Locale;

  return defaultLocale;
}
