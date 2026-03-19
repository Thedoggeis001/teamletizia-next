"use client";

import { useMemo, useState } from "react";

type ProductVariant = {
  id: number;
  name: string;
  price?: number | string | null;
  additional_cost?: number | string | null;
};

type ErrorResponse = {
  ok?: boolean;
  error?: string;
  laravelBody?: {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

function formatError(data: ErrorResponse | null): string {
  if (!data) return "Operazione non riuscita";

  if (data.laravelBody?.errors) {
    const lines = Object.entries(data.laravelBody.errors)
      .flatMap(([field, msgs]) => msgs.map((msg) => `${field}: ${msg}`))
      .join(" | ");

    if (lines) return lines;
  }

  if (data.laravelBody?.message) return data.laravelBody.message;
  if (data.error) return data.error;

  return "Operazione non riuscita";
}

export default function ProductVariantsManager({
  productId,
  initialVariants,
}: {
  productId: number | string;
  initialVariants: ProductVariant[];
}) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAdditionalCost, setEditAdditionalCost] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalVariants = useMemo(() => variants.length, [variants]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: price.trim() === "" ? null : price,
          additional_cost: additionalCost.trim() === "" ? null : additionalCost,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(formatError(data));
        return;
      }

      const created = data?.data;
      if (created) {
        setVariants((prev) => [...prev, created]);
      }

      setName("");
      setPrice("");
      setAdditionalCost("");
      setMessage("Variante creata con successo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione variante");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id);
    setEditName(variant.name ?? "");
    setEditPrice(variant.price != null ? String(variant.price) : "");
    setEditAdditionalCost(
      variant.additional_cost != null ? String(variant.additional_cost) : ""
    );
    setMessage(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditAdditionalCost("");
  }

  async function handleUpdate(variantId: number) {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/variants/${variantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          price: editPrice.trim() === "" ? null : editPrice,
          additional_cost:
            editAdditionalCost.trim() === "" ? null : editAdditionalCost,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(formatError(data));
        return;
      }

      const updated = data?.data;
      if (updated) {
        setVariants((prev) =>
          prev.map((variant) => (variant.id === variantId ? updated : variant))
        );
      }

      cancelEdit();
      setMessage("Variante aggiornata");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore update variante");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId: number) {
    const confirmed = window.confirm("Vuoi eliminare questa variante?");
    if (!confirmed) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/variants/${variantId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(formatError(data));
        return;
      }

      setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
      setMessage("Variante eliminata");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore delete variante");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 28,
        padding: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Varianti</h2>

      <p style={{ opacity: 0.75 }}>Totale varianti: {totalVariants}</p>

      <form
        onSubmit={handleCreate}
        style={{
          display: "grid",
          gap: 10,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 16,
          marginTop: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Nuova variante</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome variante"
          required
        />

        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prezzo override (opzionale)"
        />

        <input
          type="number"
          step="0.01"
          min="0"
          value={additionalCost}
          onChange={(e) => setAdditionalCost(e.target.value)}
          placeholder="Costo aggiuntivo (opzionale)"
        />

        <button type="submit" disabled={saving}>
          {saving ? "Salvataggio..." : "Crea variante"}
        </button>
      </form>

      {message ? <p style={{ color: "green", marginTop: 16 }}>{message}</p> : null}
      {error ? <p style={{ color: "crimson", marginTop: 16 }}>{error}</p> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {variants.length === 0 ? (
          <p style={{ opacity: 0.75 }}>Nessuna variante presente.</p>
        ) : (
          variants.map((variant) => {
            const isEditing = editingId === variant.id;

            return (
              <article
                key={variant.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome variante"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Prezzo override"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAdditionalCost}
                      onChange={(e) => setEditAdditionalCost(e.target.value)}
                      placeholder="Costo aggiuntivo"
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleUpdate(variant.id)}
                        disabled={saving}
                      >
                        Salva
                      </button>

                      <button type="button" onClick={cancelEdit} disabled={saving}>
                        Annulla
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600 }}>{variant.name}</div>
                    <div style={{ opacity: 0.75 }}>
                      Prezzo override: {variant.price ?? "—"}
                    </div>
                    <div style={{ opacity: 0.75 }}>
                      Costo aggiuntivo: {variant.additional_cost ?? "—"}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => startEdit(variant)}>
                        Modifica
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(variant.id)}
                        disabled={saving}
                      >
                        Elimina
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}