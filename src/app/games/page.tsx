import type { Metadata } from "next";
import styles from "./page.module.css";
import GamesClient from "./games-client";

export const metadata: Metadata = {
  title: "Games",
  description: "Visual novels and JRPGs inspired by Japanese aesthetics.",
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return (
    <div className={styles.page}>
      <GamesClient />
    </div>
  );
}
