import { NextResponse } from "next/server";
import cloudinary from "../../../../../lib/cloudinary";
import { requireAdminForApi } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = {
  news: "teamletizia/news",
  products: "teamletizia/products",
} as const;

type UploadTarget = keyof typeof ALLOWED_FOLDERS;

export async function POST(request: Request) {
  const { res } = await requireAdminForApi();
  if (res) return res;

  let body: { target?: UploadTarget } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const target = body.target ?? "products";
  const folder = ALLOWED_FOLDERS[target] ?? ALLOWED_FOLDERS.products;

  const timestamp = Math.floor(Date.now() / 1000);

  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { ok: false, error: "Missing Cloudinary env vars" },
      { status: 500 }
    );
  }

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    ok: true,
    timestamp,
    signature,
    folder,
    apiKey,
    cloudName,
  });
}
