"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  target?: "news" | "products";
};

export default function ImageUploadClient({
  value,
  onChange,
  target = "products",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const signRes = await fetch("/api/admin/cloudinary/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target }),
      });

      const sign = await signRes.json().catch(() => null);

      if (!signRes.ok || !sign?.ok) {
        throw new Error(sign?.error ?? "Sign failed");
      }

      const { timestamp, signature, folder, apiKey, cloudName } = sign as {
        timestamp: number;
        signature: string;
        folder: string;
        apiKey: string;
        cloudName: string;
      };

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      const upload = await uploadRes.json().catch(() => null);

      if (!uploadRes.ok) {
        throw new Error(upload?.error?.message ?? "Upload failed");
      }

      onChange(upload.secure_url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
        />

        {value ? (
          <button type="button" onClick={() => onChange(null)} disabled={uploading}>
            Rimuovi immagine
          </button>
        ) : null}
      </div>

      {uploading ? <p>Upload in corso...</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {value ? (
        <div style={{ width: 320 }}>
          <Image
            src={value}
            alt="Preview"
            width={640}
            height={360}
            style={{ width: "100%", height: "auto", borderRadius: 10 }}
          />
        </div>
      ) : null}
    </div>
  );
}
