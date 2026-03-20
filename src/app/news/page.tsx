import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const runtime = "nodejs";
export const revalidate = 60;

const PAGE_SIZE = 6;

type SearchParams = {
  page?: string;
};

type NewsListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
};

function parsePage(value?: string) {
  const parsed = Number(value ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function NewsPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = props.searchParams ? await props.searchParams : {};
  const requestedPage = parsePage(sp?.page);

  const where = {
    publishedAt: {
      not: null,
    },
  } as const;

  let total = 0;
  let totalPages = 1;
  let safePage = 1;
  let pageItems: NewsListItem[] = [];

  try {
    total = await prisma.news.count({ where });
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    safePage = Math.min(requestedPage, totalPages);

    pageItems = await prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE,
      skip: (safePage - 1) * PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to load public news page:", error);
    total = 0;
    totalPages = 1;
    safePage = 1;
    pageItems = [];
  }

  return (
    <div className={styles.page}>
      <section className="page-header">
        <h1>News</h1>
        <p>Stay up to date with the latest announcements.</p>
      </section>

      <div className="news-section-title">LATEST</div>

      <section className="news-section">
        <div style={{ width: "min(820px, 100%)", display: "grid", gap: 12 }}>
          {pageItems.map((n: NewsListItem) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="news-card">
              <div className="card-content">
                <h3>{n.title}</h3>
                <div className="news-meta">
                  {n.publishedAt
                    ? new Date(n.publishedAt).toLocaleDateString()
                    : ""}
                </div>
                <p>{n.excerpt ?? ""}</p>
              </div>
              <span className="read-more">Read →</span>
            </Link>
          ))}

          {pageItems.length === 0 ? (
            <div style={{ opacity: 0.8 }}>Nessuna news pubblicata ancora.</div>
          ) : null}

          {total > PAGE_SIZE ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <div style={{ opacity: 0.8 }}>
                Page {safePage} / {totalPages}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {safePage > 1 ? (
                  <Link
                    href={`/news?page=${safePage - 1}`}
                    style={{
                      border: "1px solid rgba(255,255,255,0.18)",
                      padding: "8px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                    }}
                  >
                    ← Prev
                  </Link>
                ) : (
                  <span style={{ opacity: 0.4, padding: "8px 12px" }}>
                    ← Prev
                  </span>
                )}

                {safePage < totalPages ? (
                  <Link
                    href={`/news?page=${safePage + 1}`}
                    style={{
                      border: "1px solid rgba(255,255,255,0.18)",
                      padding: "8px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                    }}
                  >
                    Next →
                  </Link>
                ) : (
                  <span style={{ opacity: 0.4, padding: "8px 12px" }}>
                    Next →
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}