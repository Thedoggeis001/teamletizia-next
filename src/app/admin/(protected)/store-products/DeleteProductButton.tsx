"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteProductButtonProps = {
  productId: number | string;
  productName: string;
};

type DeleteProductError = {
  ok?: boolean;
  error?: string;
  laravelBody?: {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm(
      `Vuoi davvero eliminare il prodotto "${productName}"?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/store-products/${productId}`, {
        method: "DELETE",
      });

      const data: DeleteProductError | null = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data?.laravelBody?.message ||
          data?.error ||
          "Errore eliminazione prodotto";

        alert(message);
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      alert("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
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
      {loading ? "Eliminazione..." : "Elimina"}
    </button>
  );
}
