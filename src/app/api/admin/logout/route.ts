import { NextResponse } from "next/server";
import { clearAdminCookie, deleteAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  await deleteAdminSession();

  const res = NextResponse.json({ ok: true });
  clearAdminCookie(res);
  return res;
}
