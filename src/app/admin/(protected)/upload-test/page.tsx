"use client";

import { useState } from "react";
import ImageUploadClient from "@/components/admin/ImageUploadClient";

export default function UploadTestClient() {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload test</h1>
      <ImageUploadClient value={url} onChange={setUrl} />
      {url ? (
        <p style={{ marginTop: 10 }}>
          URL salvato: <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>
      ) : null}
    </div>
  );
}
