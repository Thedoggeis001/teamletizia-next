import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsFormClient from "../../news-form-client";
import DeleteButton from "./delete-button";

export const runtime = "nodejs";

export default async function AdminNewsEditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const item = await prisma.news.findUnique({
    where: { id }, // ✅ id è una STRINGA (es. seed_news_2)
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      publishedAt: true,
    },
  });

  if (!item) return notFound();

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Edit News</h1>
        <DeleteButton id={item.id} />
      </div>

      <div style={{ opacity: 0.75, marginTop: 6 }}>slug attuale: {item.slug}</div>

      <div style={{ marginTop: 16 }}>
        <NewsFormClient
          initial={{
            ...item,
            // publishedAt in client lo passiamo come stringa ISO o null
            publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
          }}
        />
      </div>
    </div>
  );
}
