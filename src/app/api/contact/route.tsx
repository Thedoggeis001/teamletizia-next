import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional().default(""), // honeypot
});

function normalizeMessage(input: string) {
  return input.replace(/\r\n/g, "\n").trim();
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, message, website } = parsed.data;

  // honeypot: se compilato, fingi success
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ✅ Next 16: cookies() spesso è async -> usiamo await
  const cookieStore = await cookies();
  const lang = cookieStore.get("tl_lang")?.value ?? null;

  const baseData: any = {
    name: name.trim(),
    email: email.trim(),
    message: normalizeMessage(message),
  };

  try {
    // Provo a salvare anche lang (se esiste nello schema)
    try {
      await prisma.contactMessage.create({
        data: { ...baseData, lang },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      // Se "lang" non esiste nel model, riprovo senza
      if (msg.includes("Unknown arg") || msg.includes("Unknown argument")) {
        await prisma.contactMessage.create({ data: baseData });
      } else {
        throw e;
      }
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    // Se Prisma sta chiedendo campi required, lo vedrai nel log del terminale
    console.error("[contact] prisma_error:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
