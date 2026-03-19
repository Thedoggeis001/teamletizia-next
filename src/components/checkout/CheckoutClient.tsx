"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartOrder,
  clearStoredCartOrderId,
  getCart,
  getCartItemSubtotal,
  getCartItemUnitPrice,
  getStoredCartOrderId,
  getCartTotals,
} from "@/lib/cart";
import { isStoreLoggedIn } from "@/lib/storeAuth";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function CheckoutClient() {
  const [cart, setCart] = useState<CartOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
        setError(err instanceof Error ? err.message : "Errore caricamento checkout");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loggedIn]);

  const totals = useMemo(() => getCartTotals(cart), [cart]);

  async function onCheckout() {
    if (!cart?.id) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem("store_token");

      if (!token) {
        throw new Error("Login richiesto");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/checkout/${cart.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Errore creazione sessione Stripe"
        );
      }

      if (!data?.url) {
        throw new Error("URL checkout Stripe mancante");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore checkout");
      setProcessing(false);
    }
  }

  if (loading) {
    return <p>Caricamento checkout...</p>;
  }

  if (!loggedIn) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Login richiesto</h2>
        <p>Effettua il login nello shop prima di completare l’ordine.</p>
        <Link href="/shop" className="btn btn-primary">
          Vai allo shop
        </Link>
      </section>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Nessun ordine da completare</h2>
        <p>Il carrello è vuoto oppure non esiste un ordine pending attivo.</p>
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
        <h2 style={{ marginTop: 0, marginBottom: 18 }}>Riepilogo ordine</h2>

        <div style={{ display: "grid", gap: 16 }}>
          {cart.items.map((item) => {
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
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{product?.name ?? "Product"}</h3>
                  {variant ? (
                    <p style={{ margin: "0 0 6px", opacity: 0.75 }}>
                      Variante: {variant.name}
                    </p>
                  ) : null}
                  <p style={{ margin: 0, opacity: 0.75 }}>Quantità: {item.quantity}</p>
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
        <h2 style={{ marginTop: 0, marginBottom: 18 }}>Conferma</h2>

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

        <p
          style={{
            marginTop: 16,
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.6,
          }}
        >
          Verrai reindirizzato su Stripe per completare il pagamento in modo sicuro.
        </p>

        {error ? <p style={{ marginTop: 14, color: "#ff6b81" }}>{error}</p> : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCheckout}
            disabled={processing}
          >
            {processing ? "Reindirizzamento..." : "Paga con Stripe"}
          </button>

          <Link href="/cart" className="btn">
            Torna al carrello
          </Link>
        </div>
      </aside>
    </div>
  );
}