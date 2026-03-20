import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type NewsListItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | null;
  createdAt: Date;
};

function formatDate(value: Date | null) {
  if (!value) return "Bozza";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminNewsPage() {
  const items: NewsListItem[] = await prisma.news.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>News</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7 }}>
            Gestione articoli news lato admin.
          </p>
        </div>

        <Link
          href="/admin/news/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderRadius: 12,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Nuova news
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          Nessuna news presente.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((n: NewsListItem) => (
            <div
              key={n.id}
              className="admin-card"
              style={{
                padding: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                className="admin-card-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>{n.title}</h2>
                  <div style={{ marginTop: 8, opacity: 0.75 }}>
                    slug: {n.slug}
                  </div>
                  <div style={{ marginTop: 6, opacity: 0.65, fontSize: 14 }}>
                    Pubblicazione: {formatDate(n.publishedAt)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Link
                    href={`/admin/news/${n.id}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Apri
                  </Link>

                  <Link
                    href={`/admin/news/${n.id}/edit`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Modifica
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}