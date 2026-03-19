"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string; // ISO
};

export default function NewsClient({
  initialItems,
  initialNextCursor,
}: {
  initialItems: NewsItem[];
  initialNextCursor: string | null;
}) {
  const { t } = useI18n();

  const title = t?.news?.title ?? "Latest News";
  const subtitle =
    t?.news?.subtitle ??
    "Stay up to date with the latest announcements from Team Letizia";
  const sectionLabel = t?.news?.sectionLabel ?? "Section - News";
  const readMore = t?.news?.readMore ?? "Read more >";

  const emptyTitle = t?.news?.cardTitle ?? "No news yet";
  const emptyText =
    t?.news?.cardExcerpt ??
    "Publish your first news (publishedAt must be set), then refresh this page.";

  const [items, setItems] = useState<NewsItem[]>(initialItems ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor ?? null);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/news?take=10&cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) return;

      const data = (await res.json()) as { items: NewsItem[]; nextCursor: string | null };
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="page-header geometric-bg">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <div className="news-section-title">{sectionLabel}</div>

      <section className="news-section">
        {items.length === 0 ? (
          <div className="news-card">
            <div className="card-content">
              <h3>{emptyTitle}</h3>
              <div className="news-meta">{new Date().toLocaleDateString()}</div>
              <p>{emptyText}</p>
            </div>
            <span className="read-more">{readMore}</span>
          </div>
        ) : (
          items.map((n) => (
            <Link key={n.id} className="news-card" href={`/news/${n.slug}`}>
              <div className="card-content">
                <h3>{n.title}</h3>
                <div className="news-meta">
                  {new Date(n.publishedAt).toLocaleDateString()}
                </div>
                <p>{n.excerpt ?? ""}</p>
              </div>
              <span className="read-more">{readMore}</span>
            </Link>
          ))
        )}
      </section>

      {nextCursor && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
