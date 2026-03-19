"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploadClient from "@/components/admin/ImageUploadClient";


type Product = {
  id: number | string;
  name: string;
  description?: string | null;
  base_price: string | number;
  type: string;
  image_url?: string | null;
  is_active: boolean;
};

type UpdateProductError = {
  ok?: boolean;
  error?: string;
  laravelStatus?: number;
  laravelBody?: {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

export default function EditStoreProductForm({ product }: { product: Product }) {
  const router = useRouter();

  const [name, setName] = useState(product.name ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product.base_price ?? ""));
  const [type, setType] = useState(product.type ?? "digital");
  const [imageUrl, setImageUrl] = useState(product.image_url ?? "");
  const [isActive, setIsActive] = useState(!!product.is_active);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatError(data: UpdateProductError | null): string {
    if (!data) return "Errore aggiornamento prodotto";

    if (data.laravelBody?.errors) {
      const lines = Object.entries(data.laravelBody.errors)
        .flatMap(([field, msgs]) => msgs.map((msg) => `${field}: ${msg}`))
        .join(" | ");

      if (lines) return lines;
    }

    if (data.laravelBody?.message) return data.laravelBody.message;
    if (data.error) return data.error;

    return "Errore aggiornamento prodotto";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/${product.id}`, {
        method: "PUT",
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

      const data: UpdateProductError | null = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("UPDATE PRODUCT ERROR:", data);
        setError(formatError(data));
        return;
      }

      setMessage("Prodotto aggiornato con successo");
      router.refresh();
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      setError("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
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
        {loading ? "Salvataggio..." : "Salva modifiche"}
      </button>

      {message && <p style={{ color: "green", marginTop: 16 }}>{message}</p>}
      {error && (
        <p style={{ color: "crimson", marginTop: 16, whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}
    </form>
  );
}
