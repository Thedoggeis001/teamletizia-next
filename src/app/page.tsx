import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Team Letizia – Visual Novels, JRPGs, anime-style universes, and emotional stories.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient />;
}

