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
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-white/70">Caricamento ordini...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Login richiesto</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Effettua il login nello shop per visualizzare i tuoi ordini, i dettagli
          dei prodotti acquistati e le eventuali key digitali.
        </p>

        <Link
          href="/shop"
          className="mt-5 inline-flex rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-500/20"
        >
          Vai allo shop
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-2xl font-bold text-white">Ordini non disponibili</h2>
        <p className="mt-3 text-red-300">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
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
          className="group relative overflow-hidden rounded-[28px] border border-pink-500/18 bg-[#0f0f12] p-6 shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-[0_22px_44px_rgba(0,0,0,0.36),0_0_34px_rgba(233,30,99,0.10)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,30,99,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_22%)]" />
          <div className="absolute inset-[1px] rounded-[27px] border border-white/5" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-white">Ordine #{order.id}</h3>

                <span
                  className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    order.status === "paid"
                      ? "border border-green-400/20 bg-green-500/10 text-green-300"
                      : "border border-pink-400/20 bg-pink-500/10 text-pink-200"
                  }`}
                >
                  {order.status ?? "-"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Totale
                  </p>
                  <p className="mt-1 text-lg font-semibold text-pink-200">
                    {formatOrderPrice(order.total_amount)}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Creato
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/72">
                    {formatOrderDate(order.created_at)}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Stato ordine
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/72">
                    {order.status ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex rounded-2xl border border-pink-500/35 bg-pink-500/10 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(233,30,99,0.16)] transition hover:bg-pink-500/20"
              >
                Vedi dettaglio
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}