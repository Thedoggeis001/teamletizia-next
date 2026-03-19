import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const newsId = Number(id);

  if (!Number.isFinite(newsId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
    );
  }

  const url = new URL(`/admin/news/${newsId}/edit`, request.url);
  return NextResponse.redirect(url);
}