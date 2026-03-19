import { prisma } from "@/lib/prisma";

export function slugify(input: string) {
  const s = input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s || "news";
}

export async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let candidate = base;
  let n = 1;

  while (true) {
    const existing = await prisma.news.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
    if (excludeId && existing.id === excludeId) return candidate;

    n += 1;
    candidate = `${base}-${n}`;
  }
}
