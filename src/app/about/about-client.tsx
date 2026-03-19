"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function AboutClient() {
  const { t } = useI18n();

  const title = t?.about?.title ?? "About Me";
  const tagline =
    t?.about?.tagline ??
    "Discover the vision behind Team Letizia and the journey that drives our craft.";
  const headline = t?.about?.headline ?? "Simone, The Story Weaver";

  const p1 =
    t?.about?.p1 ??
    "Hello! I'm Simone, a dedicated developer and storyteller whose passion is to forge worlds through Visual Novels and JRPGs. My work is deeply inspired by the aesthetics and spirit of Japanese classics, always striving to infuse my creations with a unique and recognizable soul.";
  const p2 =
    t?.about?.p2 ??
    "My mission is simple: to bring epic narratives and engaging gameplay to life. Every project is a bridge to a new universe, built on challenging choices, memorable characters, and meticulous attention to the player experience.";
  const p3 =
    t?.about?.p3 ??
    "With a solid background in Game Design, Character Art, and Narrative Development, I aim to create experiences that not only entertain, but also captivate and inspire reflection.";

  return (
    <section className="about-section">
      <h1>
        <span style={{ color: "#fff", marginRight: 5 }}>⚔️</span>
        {title}
      </h1>

      <p className="tagline">{tagline}</p>

      <div className="profile-container">
        <img
          src="/profile-male.jpg"
          alt="Creator Profile Picture"
          className="profile-img"
        />
      </div>

      <h2>{headline}</h2>

      <p>{p1}</p>
      <p>{p2}</p>
      <p>{p3}</p>
    </section>
  );
}
