"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UserOrder,
  formatOrderDate,
  formatOrderPrice,
  getOrders,
} from "@/lib/orders";
import { isStoreLoggedIn } from "@/lib/storeAuth";

type OrderDetailClientProps = {
  orderId: number;
};

type LooseRecord = Record<string, unknown>;
type LooseOrder = UserOrder & LooseRecord;

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getArray(value: unknown): LooseRecord[] {
  return Array.isArray(value) ? (value as LooseRecord[]) : [];
}

function extractItems(order: LooseOrder): LooseRecord[] {
  return (
    getArray(order.items) ||
    getArray(order.order_items) ||
    getArray(order.lines) ||
    getArray(order.products) ||
    []
  );
}

function extractKeys(order: LooseOrder): LooseRecord[] {
  return (
    getArray(order.digital_keys) ||
    getArray(order.keys) ||
    getArray(order.license_keys) ||
    []
  );
}

function itemTitle(item: LooseRecord): string {
  return (
    getString(item.product_name) ||
    getString(item.name) ||
    getString(item.title) ||
    getString(item.product_title) ||
    "Prodotto"
  );
}

function itemVariant(item: LooseRecord): string | null {
  return (
    getString(item.variant_name) ||
    getString(item.variant) ||
    getString(item.option_name) ||
    null
  );
}

function itemQuantity(item: LooseRecord): number | null {
  return (
    getNumber(item.quantity) ||
    getNumber(item.qty) ||
    null
  );
}

function itemPrice(item: LooseRecord): string | null {
  const raw =
    getNumber(item.price) ??
    getNumber(item.unit_price) ??
    getNumber(item.total_price);

  return raw !== null ? formatOrderPrice(raw) : null;
}

function keyValue(entry: LooseRecord): string | null {
  return (
    getString(entry.key) ||
    getString(entry.code) ||
    getString(entry.license_key) ||
    getString(entry.value) ||
    null
  );
}

function keyLabel(entry: LooseRecord): string {
  return (
    getString(entry.product_name) ||
    getString(entry.name) ||
    getString(entry.title) ||
    "Key digitale"
  );
}

export default function OrderDetailClient({
  orderId,
}: OrderDetailClientProps) {
  const [order, setOrder] = useState<LooseOrder | null>(null);
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
          setOrder(null);
          setLoading(false);
        }
        return;
      }

      try {
        const orders = (await getOrders()) as LooseOrder[];
        const found = orders.find((entry) => Number(entry.id) === orderId) ?? null;

        if (!mounted) return;

        if (!found) {
          setOrder(null);
          setError("Ordine non trovato.");
        } else {
          setOrder(found);
        }
      } catch (err) {
        if (!mounted) return;
        setOrder(null);
        setError(
          err instanceof Error ? err.message : "Errore caricamento dettaglio ordine"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [loggedIn, orderId]);

  const items = useMemo(() => (order ? extractItems(order) : []), [order]);
  const digitalKeys = useMemo(() => (order ? extractKeys(order) : []), [order]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-white/70">Caricamento dettaglio ordine...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Login richiesto</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Effettua il login nello shop per visualizzare il dettaglio ordine e le
          eventuali key digitali.
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

  if (error || !order) {
    return (
      <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-2xl font-bold text-white">Dettaglio non disponibile</h2>
        <p className="mt-3 text-red-300">{error ?? "Ordine non trovato."}</p>

        <Link
          href="/account/orders"
          className="mt-5 inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Torna ai miei ordini
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-pink-500/18 bg-[#0f0f12] p-6 shadow-[0_16px_38px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-white">Ordine #{order.id}</h2>

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

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
              href="/account/orders"
              className="inline-flex rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Torna agli ordini
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <h3 className="text-2xl font-bold text-white">Prodotti acquistati</h3>

        {items.length === 0 ? (
          <p className="mt-4 text-white/70">Nessun dettaglio prodotto disponibile.</p>
        ) : (
          <div className="mt-5 grid gap-4">
            {items.map((item, index) => (
              <article
                key={`${itemTitle(item)}-${index}`}
                className="rounded-[22px] border border-white/8 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {itemTitle(item)}
                    </h4>

                    {itemVariant(item) ? (
                      <p className="mt-1 text-sm text-white/65">
                        Variante: {itemVariant(item)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    {itemQuantity(item) !== null ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Qtà: {itemQuantity(item)}
                      </span>
                    ) : null}

                    {itemPrice(item) ? (
                      <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-pink-200">
                        {itemPrice(item)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
        <h3 className="text-2xl font-bold text-white">Key digitali</h3>

        {digitalKeys.length === 0 ? (
          <p className="mt-4 text-white/70">Nessuna key digitale associata a questo ordine.</p>
        ) : (
          <div className="mt-5 grid gap-4">
            {digitalKeys.map((entry, index) => (
              <article
                key={`${keyLabel(entry)}-${index}`}
                className="rounded-[22px] border border-green-500/18 bg-green-500/[0.05] p-4"
              >
                <p className="text-sm uppercase tracking-[0.16em] text-green-200/75">
                  {keyLabel(entry)}
                </p>
                <p className="mt-2 break-all rounded-xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm text-white">
                  {keyValue(entry) ?? "Key non disponibile"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}