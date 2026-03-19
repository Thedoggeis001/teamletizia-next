"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/lib/cart";
import { isStoreLoggedIn } from "@/lib/storeAuth";

type Variant = {
  id: number;
  name: string;
  price?: number | string | null;
  additional_cost?: number | string | null;
};

type Props = {
  productId: number;
  disabled?: boolean;
  variants?: Variant[];
};

export default function AddToCartButton({
  productId,
  disabled = false,
  variants = [],
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string>("");

  const hasVariants = variants.length > 0;

  async function onAdd() {
    setMessage(null);
    setError(null);

    if (!isStoreLoggedIn()) {
      setError("Devi effettuare il login store prima di aggiungere prodotti.");
      return;
    }

    setLoading(true);

    try {
      await addCartItem({
        productId,
        quantity: 1,
        variantId: variantId ? Number(variantId) : null,
      });

      setMessage(
        variantId
          ? "Prodotto con variante aggiunto al carrello."
          : "Prodotto aggiunto al carrello."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore carrello");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {hasVariants ? (
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="variant">Variante</label>
          <select
            id="variant"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            <option value="">Nessuna variante</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onAdd}
          disabled={disabled || loading}
        >
          {loading ? "Adding..." : "Add to cart"}
        </button>

        <Link href="/cart" className="btn">
          Vai al carrello
        </Link>
      </div>

      {message ? (
        <p style={{ margin: 0, color: "#7dff9b" }}>{message}</p>
      ) : null}

      {error ? (
        <p style={{ margin: 0, color: "#ff6b81" }}>{error}</p>
      ) : null}
    </div>
  );
}