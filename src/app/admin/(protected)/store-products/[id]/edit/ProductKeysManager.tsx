"use client";

import { useEffect, useMemo, useState } from "react";

type ProductKey = {
  id: number;
  key_value: string;
  is_used: boolean;
  used_at?: string | null;
  order_id?: number | null;
};

type LaravelPaginatedKeys = {
  current_page?: number;
  data?: ProductKey[];
  total?: number;
};

type KeysResponse = {
  success?: boolean;
  message?: string;
  data?: LaravelPaginatedKeys | null;
  errors?: Record<string, string[]> | null;
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

export default function ProductKeysManager({
  productId,
  productType,
}: {
  productId: number | string;
  productType: string;
}) {
  const [keys, setKeys] = useState<ProductKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSingle, setSavingSingle] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [singleKey, setSingleKey] = useState("");
  const [bulkKeys, setBulkKeys] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDigital = productType === "digital";

  async function loadKeys() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/${productId}/keys`, {
        method: "GET",
      });

      const data: KeysResponse | null = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Errore caricamento keys");
      }

      setKeys(data?.data?.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento keys");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isDigital) {
      setLoading(false);
      return;
    }

    loadKeys();
  }, [productId, isDigital]);

  const stats = useMemo(() => {
    const total = keys.length;
    const used = keys.filter((key) => key.is_used || key.order_id != null).length;
    const available = total - used;

    return { total, used, available };
  }, [keys]);

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    setSavingSingle(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/store-products/${productId}/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key_value: singleKey.trim(),
        }),
      });

      const data: ErrorResponse | null = await res.json().catch(() => null);

      if (!res.ok) {
        setError(formatError(data));
        return;
      }

      setSingleKey("");
      setMessage("Key aggiunta con successo");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore aggiunta key");
    } finally {
      setSavingSingle(false);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImporting(true);
    setMessage(null);
    setError(null);

    try {
      const keysToImport = bulkKeys
        .split(/\r?\n/)
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/store-products/${productId}/keys/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keys: keysToImport,
        }),
      });

      const data: ErrorResponse | null = await res.json().catch(() => null);

      if (!res.ok) {
        setError(formatError(data));
        return;
      }

      setBulkKeys("");
      setMessage("Keys importate con successo");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore import keys");
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete(keyId: number) {
    const confirmed = window.confirm("Vuoi eliminare questa key?");
    if (!confirmed) return;

    setDeletingId(keyId);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/store-products/${productId}/keys/${keyId}`,
        {
          method: "DELETE",
        }
      );

      const data: ErrorResponse | null = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("DELETE KEY ERROR:", data);
        setError(formatError(data));
        return;
      }

      setMessage("Key eliminata");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore eliminazione key");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isDigital) {
    return (
      <section
        style={{
          marginTop: 28,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Product keys</h2>
        <p style={{ marginBottom: 0, opacity: 0.75 }}>
          Le keys sono disponibili solo per prodotti digitali.
        </p>
      </section>
    );
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
      <h2 style={{ marginTop: 0 }}>Product keys</h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <Badge label={`Totali: ${stats.total}`} />
        <Badge label={`Disponibili: ${stats.available}`} />
        <Badge label={`Usate/assegnate: ${stats.used}`} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <form
          onSubmit={handleAddSingle}
          style={{
            display: "grid",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>Aggiungi key singola</h3>

          <input
            value={singleKey}
            onChange={(e) => setSingleKey(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX"
            required
          />

          <button type="submit" disabled={savingSingle}>
            {savingSingle ? "Salvataggio..." : "Aggiungi key"}
          </button>
        </form>

        <form
          onSubmit={handleImport}
          style={{
            display: "grid",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>Import massivo</h3>

          <textarea
            rows={8}
            value={bulkKeys}
            onChange={(e) => setBulkKeys(e.target.value)}
            placeholder={"Una key per riga\nAAAA-BBBB-CCCC\nDDDD-EEEE-FFFF"}
            required
          />

          <button type="submit" disabled={importing}>
            {importing ? "Importazione..." : "Importa keys"}
          </button>
        </form>
      </div>

      {message ? <p style={{ color: "green", marginTop: 16 }}>{message}</p> : null}
      {error ? <p style={{ color: "crimson", marginTop: 16 }}>{error}</p> : null}

      <div style={{ marginTop: 20 }}>
        <h3>Lista keys</h3>

        {loading ? (
          <p>Caricamento keys...</p>
        ) : keys.length === 0 ? (
          <p style={{ opacity: 0.75 }}>Nessuna key presente per questo prodotto.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {keys.map((key) => {
              const isLocked = key.is_used || key.order_id != null;

              return (
                <article
                  key={key.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, wordBreak: "break-all" }}>
                      {key.key_value}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.75, fontSize: 14 }}>
                      Stato: {isLocked ? "Usata / assegnata" : "Disponibile"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(key.id)}
                    disabled={Boolean(isLocked) || deletingId === key.id}
                  >
                    {deletingId === key.id ? "Eliminazione..." : "Elimina"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {label}
    </span>
  );
}