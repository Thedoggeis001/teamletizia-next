"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n";

type NavItem = {
  href: string;
  key: "home" | "shop" | "games" | "news" | "about" | "contact";
  fallback: string;
};

const NAV: NavItem[] = [
  { href: "/", key: "home", fallback: "Home" },
  { href: "/shop", key: "shop", fallback: "Shop" },
  { href: "/games", key: "games", fallback: "Games" },
  { href: "/news", key: "news", fallback: "News" },
  { href: "/about", key: "about", fallback: "About Me" },
  { href: "/contact", key: "contact", fallback: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="site-header">
      <div className="logo-container">
        <span className="logo-icon">L</span>
        <span className="team-name">TEAM LETIZIA</span>
      </div>

      <nav className="main-nav" aria-label="Primary">
        <ul>
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const label = t?.nav?.[item.key] ?? item.fallback;

            return (
              <li key={item.href}>
                <Link href={item.href} className={active ? "active" : undefined}>
                  {label}
                </Link>
              </li>
            );
          })}

          <li>
            <Link href="/admin" className={isActive(pathname, "/admin") ? "active" : undefined}>
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      <div className="lang-selector">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label="Language"
        >
          <option value="en">EN</option>
          <option value="ja">日本語</option>
          <option value="es">ES</option>
          <option value="pt">PT</option>
          <option value="zh-CN">中文</option>
        </select>
      </div>

      <div className="nav-glow" aria-hidden="true" />
    </header>
  );
}