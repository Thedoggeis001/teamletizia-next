const { id } = await ctx.params;
const newsId = Number(id);
if (!Number.isFinite(newsId)) {
  return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
}
