"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function GamesClient() {
  const { t } = useI18n();

  const title = t?.games?.title ?? "Our Games";
  const subtitle = t?.games?.subtitle ?? "Visual novels and JRPGs inspired by Japanese aesthetics";
  const sectionTitle = t?.games?.sectionTitle ?? "Titles";
  const status = t?.games?.status ?? "Visual novel (in development)";

  return (
    <>
      <section className="hero-section">
        <div className="page-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      <section className="games-section">
        <h2>{sectionTitle}</h2>

        <div className="games-grid">
          <a href="/NEWS_ENG/next_project.html" className="game-card">
            <div className="card-content">
              <h3>IMPERIUM EUROPAE: DIES TRISTIS</h3>
              <p>{status}</p>
            </div>
          </a>
        </div>
      </section>
    </>
  );
}
