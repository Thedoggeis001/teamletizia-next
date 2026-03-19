import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession, setAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const ok = bcrypt.compareSync(password, admin.passwordHash);

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const { token, expiresAt } = await createAdminSession(admin.id);

  const res = NextResponse.json({ ok: true });
  setAdminCookie(res, token, expiresAt);

  return res;
}
