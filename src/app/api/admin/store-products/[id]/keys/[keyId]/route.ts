import { NextRequest, NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-auth";

export const runtime = "nodejs";

function getApiConfig() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  const adminToken = process.env.LARAVEL_ADMIN_TOKEN?.trim();

  if (!apiBase) {
    return {
      error: NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_API_URL mancante" },
        { status: 500 }
      ),
    };
  }

  if (!adminToken) {
    return {
      error: NextResponse.json(
        { ok: false, error: "LARAVEL_ADMIN_TOKEN mancante" },
        { status: 500 }
      ),
    };
  }

  return { apiBase, adminToken, error: null };
}

async function parseLaravelResponse(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ keyId: string }> }
) {
  const { res } = await requireAdminForApi();
  if (res) return res;

  const config = getApiConfig();
  if (config.error) return config.error;

  const { keyId } = await context.params;

  try {
    const laravelRes = await fetch(`${config.apiBase}/api/admin/keys/${keyId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.adminToken}`,
      },
      cache: "no-store",
    });

    const data = await parseLaravelResponse(laravelRes);

    if (!laravelRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Laravel request failed",
          laravelStatus: laravelRes.status,
          laravelBody: data,
        },
        { status: laravelRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("DELETE PRODUCT KEY PROXY ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Errore interno route proxy" },
      { status: 500 }
    );
  }
}