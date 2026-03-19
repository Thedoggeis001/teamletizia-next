import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const runtime = "nodejs";
export const revalidate = 60;

const PAGE_SIZE = 6; // <-- cambia a 8/10 se vuoi

export default async function NewsPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const sp = props.searchParams ? await props.searchParams : {};
  const pageRaw = Number(sp?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const where = { publishedAt: { not: null as any } };

  const [total, items] = await prisma.$transaction([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // se l’utente va oltre l’ultima pagina, ricarichiamo la pagina corretta
  const pageItems =
    safePage === page
      ? items
      : await prisma.news.findMany({
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

  return (
    <div className={styles.page}>
      <section className="page-header">
        <h1>News</h1>
        <p>Stay up to date with the latest announcements.</p>
      </section>

      <div className="news-section-title">LATEST</div>

      <section className="news-section">
        <div style={{ width: "min(820px, 100%)", display: "grid", gap: 12 }}>
          {pageItems.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="news-card">
              <div className="card-content">
                <h3>{n.title}</h3>
                <div className="news-meta">
                  {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : ""}
                </div>
                <p>{n.excerpt ?? ""}</p>
              </div>
              <span className="read-more">Read →</span>
            </Link>
          ))}

          {total === 0 ? <div style={{ opacity: 0.8 }}>Nessuna news pubblicata ancora.</div> : null}

          {/* PAGER */}
          {total > PAGE_SIZE ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
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
                  <span style={{ opacity: 0.4, padding: "8px 12px" }}>← Prev</span>
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
                  <span style={{ opacity: 0.4, padding: "8px 12px" }}>Next →</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
