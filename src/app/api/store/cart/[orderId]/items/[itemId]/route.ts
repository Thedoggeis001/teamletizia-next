import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getApiBase() {
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!api) throw new Error("NEXT_PUBLIC_API_URL mancante");
  return api.replace(/\/+$/, "");
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  try {
    const { orderId, itemId } = await context.params;
    const auth = req.headers.get("authorization");

    const res = await fetch(`${getApiBase()}/api/cart/${orderId}/items/${itemId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });

    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Store remove item proxy error",
        data: null,
        errors: null,
      },
      { status: 500 }
    );
  }
}