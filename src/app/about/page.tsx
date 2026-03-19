import type { Metadata } from "next";
import styles from "./page.module.css";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Discover the vision behind Team Letizia and the journey that drives our craft.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <AboutClient />
    </div>
  );
}
