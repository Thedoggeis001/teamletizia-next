import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import styles from "../page.module.css";

export const runtime = "nodejs";
export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const item = await prisma.news.findFirst({
    where: { slug, publishedAt: { not: null } },
    select: { title: true, excerpt: true, imageUrl: true },
  });

  if (!item) return { title: "News not found" };

  return {
    title: item.title,
    description: item.excerpt ?? undefined,
    openGraph: item.imageUrl
      ? {
          images: [{ url: item.imageUrl }],
        }
      : undefined,
  };
}

export default async function NewsDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const item = await prisma.news.findFirst({
    where: { slug, publishedAt: { not: null } },
    select: {
      title: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      publishedAt: true,
    },
  });

  if (!item) return notFound();

  return (
    <div className={styles.page}>
      <section className="page-header">
        <h1>{item.title}</h1>
        <p style={{ opacity: 0.85 }}>
          {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : ""}
        </p>
      </section>

      <section className="news-section" style={{ paddingTop: 30 }}>
        <div style={{ width: "min(900px, 100%)" }}>
          {item.imageUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                marginBottom: 18,
              }}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          ) : null}

          {item.excerpt ? (
            <p style={{ opacity: 0.85, marginTop: 0, marginBottom: 18 }}>{item.excerpt}</p>
          ) : null}

          <article
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 18,
              lineHeight: 1.7,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
          </article>
        </div>
      </section>
    </div>
  );
}
