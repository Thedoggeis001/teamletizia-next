"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export default function HomeClient() {
  const { t } = useI18n();

  const title = t?.home?.title ?? "Creating Worlds Inspired by Japanese Aesthetics";
  const fullSubtitle = useMemo(
    () =>
      t?.home?.subtitle ??
      "Visual Novels, JRPGs, anime-style universes, and emotional stories.",
    [t]
  );

  const featuredTitle = t?.home?.featuredTitle ?? "Featured Games";
  const inDevelopment = t?.home?.inDevelopment ?? "IN DEVELOPMENT";
  const pleaseWait = t?.home?.pleaseWait ?? "Please wait patiently";

  const [subtitle, setSubtitle] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setSubtitle("");
    setDone(false);

    const timer = window.setInterval(() => {
      i += 1;
      if (i <= fullSubtitle.length) {
        setSubtitle(fullSubtitle.slice(0, i));
      } else {
        setDone(true);
        window.clearInterval(timer);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [fullSubtitle]);

  return (
    <>
      <section className="hero">
        <h1>{title}</h1>
        <p>
          {subtitle}
          {!done && <span className="typewriter-cursor" />}
        </p>
      </section>

      <section className="featured-games">
        <h2>{featuredTitle}</h2>
        <div className="game-list">
          <a href="NEWS_ENG/next_project.html" className="game-card">
            <h3>{inDevelopment}</h3>
            <p>{pleaseWait}</p>
          </a>
        </div>
      </section>
    </>
  );
}
