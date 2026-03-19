"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploadClient from "@/components/admin/ImageUploadClient";


type CreateProductError = {
  ok?: boolean;
  error?: string;
  laravelStatus?: number;
  laravelBody?: {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

export default function NewStoreProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [type, setType] = useState("digital");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatError(data: CreateProductError | null): string {
    if (!data) return "Errore creazione prodotto";

    if (data.laravelBody?.errors) {
      const lines = Object.entries(data.laravelBody.errors)
        .flatMap(([field, msgs]) => msgs.map((msg) => `${field}: ${msg}`))
        .join(" | ");

      if (lines) return lines;
    }

    if (data.laravelBody?.message) return data.laravelBody.message;
    if (data.error) return data.error;

    return "Errore creazione prodotto";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/store-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          base_price: basePrice,
          type,
          image_url: imageUrl.trim() || null,
          is_active: isActive,
        }),
      });

      const data: CreateProductError | null = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("CREATE PRODUCT ERROR:", data);
        setError(formatError(data));
        return;
      }

      router.push("/admin/store-products");
      router.refresh();
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      setError("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>Nuovo prodotto store</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="description">Descrizione</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="basePrice">Prezzo base</label>
          <input
            id="basePrice"
            type="number"
            step="0.01"
            min="0"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="type">Tipo</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="digital">digital</option>
            <option value="physical">physical</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Immagine prodotto</label>
          <ImageUploadClient
            value={imageUrl || null}
            onChange={(url) => setImageUrl(url ?? "")}
            target="products"
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Prodotto attivo
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Salvataggio..." : "Crea prodotto"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: 16, whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}
    </main>
  );
}
