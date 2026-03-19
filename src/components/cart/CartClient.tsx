"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartItem,
  CartOrder,
  clearStoredCartOrderId,
  getCart,
  getCartItemSubtotal,
  getCartItemUnitPrice,
  getCartTotals,
  getStoredCartOrderId,
  removeCartItem,
} from "@/lib/cart";
import { isStoreLoggedIn } from "@/lib/storeAuth";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function CartClient() {
  const [cart, setCart] = useState<CartOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loggedIn = isStoreLoggedIn();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (!loggedIn) {
        setCart(null);
        setLoading(false);
        return;
      }

      const orderId = getStoredCartOrderId();

      if (!orderId) {
        setCart(null);
        setLoading(false);
        return;
      }

      try {
        const order = await getCart(orderId);
        setCart(order);
      } catch (err) {
        clearStoredCartOrderId();
        setCart(null);
        setError(err instanceof Error ? err.message : "Errore caricamento carrello");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loggedIn]);

  const items = cart?.items ?? [];
  const totals = useMemo(() => getCartTotals(cart), [cart]);

  async function onRemove(item: CartItem) {
    if (!cart?.id) return;

    setBusyItemId(item.id);
    setError(null);

    try {
      const updated = await removeCartItem(cart.id, item.id);
      setCart(updated);

      if (!updated.items || updated.items.length === 0) {
        clearStoredCartOrderId();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore rimozione articolo");
    } finally {
      setBusyItemId(null);
    }
  }

  if (loading) {
    return <p>Caricamento carrello...</p>;
  }

  if (!loggedIn) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Login richiesto</h2>
        <p>Effettua il login nello shop prima di usare il carrello.</p>
        <Link href="/shop" className="btn btn-primary">
          Vai allo shop
        </Link>
      </section>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Carrello vuoto</h2>
        <p>Non ci sono ancora articoli nel tuo ordine pending.</p>
        {error ? <p style={{ color: "#ff6b81" }}>{error}</p> : null}
        <Link href="/shop" className="btn btn-primary">
          Vai allo shop
        </Link>
      </section>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.3fr 0.7fr",
        gap: 24,
        alignItems: "start",
      }}
    >
      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 18 }}>Articoli</h2>

        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item) => {
            const product = item.product;
            const variant = item.variant;
            const unitPrice = getCartItemUnitPrice(item);
            const subtotal = getCartItemSubtotal(item);

            return (
              <article
                key={item.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px" }}>{product?.name ?? "Product"}</h3>

                    {variant ? (
                      <p style={{ margin: "0 0 6px", opacity: 0.75 }}>
                        Variante: {variant.name}
                      </p>
                    ) : null}

                    <p style={{ margin: 0, opacity: 0.75 }}>Quantità: {item.quantity}</p>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => onRemove(item)}
                    disabled={busyItemId === item.id}
                  >
                    {busyItemId === item.id ? "Rimozione..." : "Rimuovi"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    opacity: 0.9,
                  }}
                >
                  <span>Prezzo unitario: {formatPrice(unitPrice)}</span>
                  <strong>Subtotale: {formatPrice(subtotal)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 18 }}>Riepilogo</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>Articoli</span>
            <strong>{totals.quantity}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>Totale</span>
            <strong>{formatPrice(totals.total)}</strong>
          </div>
        </div>

        {error ? <p style={{ marginTop: 14, color: "#ff6b81" }}>{error}</p> : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <Link href="/checkout" className="btn btn-primary">
            Vai al checkout
          </Link>

          <Link href="/shop" className="btn">
            Continua shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
