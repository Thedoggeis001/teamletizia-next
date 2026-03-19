"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadClient from "@/components/admin/ImageUploadClient";

type Initial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null; // ISO
};

export default function NewsFormClient({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [published, setPublished] = useState(Boolean(initial?.publishedAt));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      excerpt: excerpt ? excerpt : null,
      content,
      imageUrl,
      publishedAt: published ? new Date().toISOString() : null,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/news/${initial!.id}` : "/api/admin/news", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Request failed");

      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <div className="form-grid">
        <label className="field">
          <span className="label">Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label className="field">
          <span className="label">
            Excerpt <span className="hint">(max 280)</span>
          </span>
          <input
            className="input"
            value={excerpt}
            maxLength={280}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary…"
          />
        </label>
      </div>

      <label className="field">
        <span className="label">Content (Markdown)</span>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          required
          placeholder="Write your article…"
        />
      </label>

      <div className="field">
        <span className="label">Cover image</span>
        <ImageUploadClient value={imageUrl} onChange={setImageUrl} />
        <div className="hint">Upload an image → it will save the URL in the DB.</div>
      </div>

      <label className="switch-row">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        <span>Published (off = Draft)</span>
      </label>

      {error ? <div className="error">{error}</div> : null}

      <div className="actions-row">
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create"}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push("/admin/news")}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
