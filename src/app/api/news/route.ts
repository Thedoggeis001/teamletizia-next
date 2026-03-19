import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// query params: /api/news?take=10&cursor=...
const QuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(20).default(10),
  cursor: z.string().optional(),
});

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string; // ISO
};

// rate limit semplice in memoria (ok per Step 6)
const WINDOW_MS = 60_000; // 1 minuto
const MAX_REQ = 60; // 60 richieste/min per IP
const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function rateLimit(req: Request) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQ - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQ) return { ok: false, remaining: 0, resetAt: entry.resetAt };

  entry.count += 1;
  store.set(ip, entry);
  return { ok: true, remaining: MAX_REQ - entry.count, resetAt: entry.resetAt };
}

export async function GET(req: Request) {
  // rate limit
  const rl = rateLimit(req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // parse + validate query
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    take: url.searchParams.get("take") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }
  const { take, cursor } = parsed.data;

  // only published
  const now = new Date();

  const rows = await prisma.news.findMany({
    where: {
      publishedAt: { not: null, lte: now },
    },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  const pageRows = rows.slice(0, take);
  const nextCursor = rows.length > take ? pageRows[pageRows.length - 1]?.id ?? null : null;

  const items: NewsItem[] = pageRows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? null,
    publishedAt: r.publishedAt!.toISOString(),
  }));

  const res = NextResponse.json({ items, nextCursor }, { status: 200 });

  // caching “soft” (utile su CDN)
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.headers.set("X-RateLimit-Remaining", String(rl.remaining));

  return res;
}
