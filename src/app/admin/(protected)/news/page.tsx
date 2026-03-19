import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "./[id]/edit/delete-button";

export const runtime = "nodejs";

export default async function AdminNewsListPage() {
  const items = await prisma.news.findMany({
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Dashboard · News</h1>
          <p className="admin-subtitle">Create, edit, publish and delete articles.</p>
        </div>

        {/* ✅ UNICO bottone create */}
        <Link className="btn btn-primary" href="/admin/news/new">
          + New
        </Link>
      </div>

      <div className="admin-list">
        {items.map((n) => (
          <div key={n.id} className="admin-card">
            <div className="admin-card-row">
              <div>
                <div className="admin-card-title">{n.title}</div>
                <div className="admin-card-meta">
                  <span className={`pill ${n.publishedAt ? "pill-ok" : "pill-draft"}`}>
                    {n.publishedAt ? "Published" : "Draft"}
                  </span>
                  <span className="dot">•</span>
                  <span className="mono">slug: {n.slug}</span>
                  <span className="dot">•</span>
                  <span>updated {new Date(n.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="admin-actions">
                <Link className="btn btn-ghost" href={`/admin/news/${encodeURIComponent(String(n.id))}/edit`}>
                  Edit
                </Link>

                <Link className="btn btn-ghost" href={`/news/${n.slug}`} target="_blank">
                  View
                </Link>

                <DeleteButton id={String(n.id)} />
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 ? <div className="admin-empty">Nessuna news ancora.</div> : null}
      </div>
    </div>
  );
}
