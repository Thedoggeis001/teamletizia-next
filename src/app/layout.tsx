import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocaleFromCookies } from "@/i18n/lang.server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Team Letizia", template: "%s | Team Letizia" },
  description: "Team Letizia – Visual novels and JRPG-inspired projects. Discover games, news and updates.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Team Letizia",
    title: "Team Letizia",
    description: "Visual novels and JRPG-inspired projects. Discover games, news and updates.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Team Letizia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Letizia",
    description: "Visual novels and JRPG-inspired projects. Discover games, news and updates.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocaleFromCookies();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <I18nProvider initialLocale={locale}>
          <div className="app-shell">
            <Navbar />
            <main id="main-content" className="site-main">
              {children}
            </main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}