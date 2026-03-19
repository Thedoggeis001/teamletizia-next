import { z } from "zod";

export const AdminNewsCreateSchema = z.object({
  title: z.string().min(3).max(120),
  excerpt: z.string().max(280).optional().nullable(),
  content: z.string().min(1).max(50_000),
  imageUrl: z.string().url().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(), // null => draft
});

export const AdminNewsUpdateSchema = AdminNewsCreateSchema.partial();
