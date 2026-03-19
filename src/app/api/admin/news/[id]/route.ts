import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForApi } from "@/lib/admin-auth";
import { AdminNewsUpdateSchema } from "@/lib/validators/admin-news";
import { generateUniqueSlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { res } = await requireAdminForApi();
  if (res) return res;

  const { id } = await ctx.params;

  const item = await prisma.news.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { admin, res } = await requireAdminForApi();
  if (res) return res;

  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = AdminNewsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Validation error" }, { status: 400 });
  }

  const patch = parsed.data;
  const data: any = {};

  if (patch.title !== undefined) {
    data.title = patch.title;
    data.slug = await generateUniqueSlug(patch.title, id);
  }
  if (patch.excerpt !== undefined) data.excerpt = patch.excerpt;
  if (patch.content !== undefined) data.content = patch.content;
  if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl;
  if (patch.publishedAt !== undefined) {
    data.publishedAt = patch.publishedAt ? new Date(patch.publishedAt) : null;
  }

  const updated = await prisma.news.update({
    where: { id },
    data,
    select: { id: true, slug: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "NEWS_UPDATE",
      targetType: "News",
      targetId: updated.id,
    },
  });

  return NextResponse.json({ ok: true, id: updated.id, slug: updated.slug });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { admin, res } = await requireAdminForApi();
  if (res) return res;

  const { id } = await ctx.params;

  await prisma.news.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "NEWS_DELETE",
      targetType: "News",
      targetId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
