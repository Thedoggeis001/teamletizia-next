"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: number | string;
  productName: string;
  isActive: boolean;
  currentDescription?: string | null;
  currentPrice: string | number;
  currentType: string;
  currentImageUrl?: string | null;
};

type ToggleError = {
  ok?: boolean;
  error?: string;
  laravelBody?: {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

export default function ToggleProductActiveButton({
  productId,
  productName,
  isActive,
  currentDescription,
  currentPrice,
  currentType,
  currentImageUrl,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onToggle() {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/store-products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          description: currentDescription ?? "",
          base_price: currentPrice,
          type: currentType,
          image_url: currentImageUrl ?? null,
          is_active: !isActive,
        }),
      });

      const data: ToggleError | null = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data?.laravelBody?.message ||
          data?.error ||
          "Errore aggiornamento stato prodotto";

        alert(message);
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("TOGGLE PRODUCT ACTIVE ERROR:", error);
      alert("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 8,
        padding: "6px 10px",
        background: "transparent",
        color: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Aggiornamento..." : isActive ? "Disattiva" : "Attiva"}
    </button>
  );
}
