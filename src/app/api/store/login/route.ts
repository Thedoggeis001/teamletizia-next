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
  const url = `${getApiBase()}/api/login`;

  try {
    const payload = await req.json();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
    const message =
      error instanceof Error ? error.message : "Store login proxy error";

    console.error("STORE LOGIN PROXY ERROR", {
      url,
      message,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        message: message,
        data: null,
        errors: null,
      },
      { status: 500 }
    );
  }
}