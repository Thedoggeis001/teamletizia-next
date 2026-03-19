"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UserOrder,
  formatOrderDate,
  formatOrderPrice,
  getOrders,
} from "@/lib/orders";
import { isStoreLoggedIn } from "@/lib/storeAuth";

export default function OrdersClient() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loggedIn = isStoreLoggedIn();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      if (!loggedIn) {
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getOrders();
        if (mounted) setOrders(data);
      } catch (err) {
        if (mounted) {
          setOrders([]);
          setError(err instanceof Error ? err.message : "Errore caricamento ordini");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [loggedIn]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-white/70">Caricamento ordini...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white">Login richiesto</h2>
          <p className="mt-3 text-white/70">
            Effettua il login nello shop per visualizzare i tuoi ordini e i dettagli dei
            tuoi acquisti digitali.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-500/20"
          >
            Vai allo shop
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-2xl font-bold text-white">Ordini non disponibili</h2>
        <p className="mt-3 text-red-300">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <h2 className="text-3xl font-bold text-white">Nessun ordine</h2>
        <p className="mt-3 text-white/70">Non hai ancora completato acquisti.</p>
        <Link
          href="/shop"
          className="mt-5 inline-flex rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-500/20"
        >
          Vai allo shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Ordine #{order.id}</h3>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/75">
                  Stato: {order.status ?? "-"}
                </span>

                <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-200">
                  Totale: {formatOrderPrice(order.total_amount)}
                </span>
              </div>

              <p className="mt-4 text-sm text-white/55">
                Creato: {formatOrderDate(order.created_at)}
              </p>
            </div>

            <Link
              href={`/account/orders/${order.id}`}
              className="inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Vedi dettaglio
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}