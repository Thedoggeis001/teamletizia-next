import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const SESSION_DAYS = 7;

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function getAdminFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = sha256(token);

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { tokenHash } }).catch(() => {});
    return null;
  }

  return session.adminUser;
}

export async function requireAdminForPage() {
  const admin = await getAdminFromSession();

  if (!admin) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdminForApi() {
  const admin = await getAdminFromSession();

  if (!admin) {
    return {
      admin: null,
      res: NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      ),
    } as const;
  }

  return { admin, res: null } as const;
}

export async function createAdminSession(adminUserId: string) {
  const token = newToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.adminSession.create({
    data: {
      tokenHash,
      expiresAt,
      adminUserId,
    },
  });

  return { token, expiresAt };
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return;

  const tokenHash = sha256(token);

  await prisma.adminSession.delete({
    where: { tokenHash },
  }).catch(() => {});
}

export function setAdminCookie(
  res: NextResponse,
  token: string,
  expiresAt: Date
) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
