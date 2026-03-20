import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getApiBase() {
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!api) {
    throw new Error("NEXT_PUBLIC_API_URL mancante");
  }
  return api.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const res = await fetch(`${getApiBase()}/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
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
        message: error instanceof Error ? error.message : "Store login proxy error",
        data: null,
        errors: null,
      },
      { status: 500 }
    );
  }
}