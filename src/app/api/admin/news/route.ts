import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminForApi } from "@/lib/admin-auth";
import { AdminNewsCreateSchema } from "@/lib/validators/admin-news";
import { generateUniqueSlug } from "@/lib/slug";

export const runtime = "nodejs";

const QuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  q: z.string().optional(),
});

export async function GET(req: Request) {
  const { res } = await requireAdminForApi();
  if (res) return res;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    take: url.searchParams.get("take") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid query" }, { status: 400 });
  }

  const { take, cursor, q } = parsed.data;

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const rows = await prisma.news.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const pageRows = rows.slice(0, take);
  const nextCursor = rows.length > take ? pageRows[pageRows.length - 1]?.id ?? null : null;

  return NextResponse.json({ ok: true, items: pageRows, nextCursor });
}

export async function POST(req: Request) {
  const { admin, res } = await requireAdminForApi();
  if (res) return res;

  const body = await req.json().catch(() => null);
  const parsed = AdminNewsCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Validation error" }, { status: 400 });
  }

  const data = parsed.data;
  const slug = await generateUniqueSlug(data.title);

  const created = await prisma.news.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      imageUrl: data.imageUrl ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
    select: { id: true, slug: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "NEWS_CREATE",
      targetType: "News",
      targetId: created.id,
    },
  });

  return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
}
