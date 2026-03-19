"use client";

import OrdersClient from "@/components/account/OrdersClient";

export default function AccountOrdersPage() {
  return (
    <main className="orders-page-shell">
      <section className="orders-hero">
        <div className="orders-hero-inner">
          <p className="orders-kicker">Account</p>
          <h1>I miei ordini</h1>
          <p className="orders-subtitle">
            Qui trovi tutti i tuoi acquisti, i dettagli degli ordini completati e
            le informazioni relative ai prodotti digitali acquistati.
          </p>
        </div>
      </section>

      <section className="orders-content-card">
        <OrdersClient />
      </section>

      <style jsx global>{`
        .orders-page-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 42px 20px 80px;
        }

        .orders-hero {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background:
            radial-gradient(circle at top right, rgba(233, 30, 99, 0.2), transparent 34%),
            radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.05), transparent 24%),
            linear-gradient(180deg, rgba(17, 17, 17, 0.95), rgba(10, 10, 10, 0.96));
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.34),
            0 0 40px rgba(233, 30, 99, 0.08);
        }

        .orders-hero::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 31px;
          border: 1px solid rgba(233, 30, 99, 0.12);
          pointer-events: none;
        }

        .orders-hero-inner {
          position: relative;
          z-index: 2;
          padding: 30px 32px;
        }

        .orders-kicker {
          margin: 0 0 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
        }

        .orders-hero h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.05;
          color: #fff;
        }

        .orders-subtitle {
          margin: 16px 0 0;
          max-width: 760px;
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.72);
        }

        .orders-content-card {
          margin-top: 24px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(circle at top right, rgba(233, 30, 99, 0.08), transparent 28%),
            linear-gradient(180deg, rgba(14, 14, 18, 0.96), rgba(10, 10, 10, 0.96));
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
          padding: 20px;
        }

        /* reset wrappers interni */
        .orders-content-card > div,
        .orders-content-card > section {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        /* card singolo ordine */
        .orders-content-card article {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(233, 30, 99, 0.16);
          background:
            radial-gradient(circle at top right, rgba(233, 30, 99, 0.12), transparent 30%),
            linear-gradient(180deg, rgba(18, 18, 22, 0.98), rgba(11, 11, 14, 0.98));
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.28),
            0 0 28px rgba(233, 30, 99, 0.06);
          padding: 24px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .orders-content-card article:hover {
          transform: translateY(-4px);
          border-color: rgba(233, 30, 99, 0.28);
          box-shadow:
            0 20px 42px rgba(0, 0, 0, 0.34),
            0 0 34px rgba(233, 30, 99, 0.1);
        }

        .orders-content-card article h3 {
          margin: 0;
          font-size: 29px;
          line-height: 1.1;
          color: #fff;
        }

        .orders-content-card article p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.6;
        }

        .orders-content-card article .flex.flex-wrap.gap-3,
        .orders-content-card article .mt-4.grid {
          gap: 12px !important;
        }

        .orders-content-card article .rounded-full {
          border-radius: 999px !important;
          padding: 8px 14px !important;
          font-size: 11px !important;
          letter-spacing: 0.12em !important;
        }

        .orders-content-card article .rounded-2xl,
        .orders-content-card article [class*="rounded-[20px]"] {
          border-radius: 20px !important;
        }

        .orders-content-card article .border.border-white\\/8,
        .orders-content-card article .border.border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .orders-content-card article .bg-black\\/20,
        .orders-content-card article .bg-white\\/5 {
          background: rgba(255, 255, 255, 0.035) !important;
        }

        .orders-content-card article a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 16px;
          border: 1px solid rgba(233, 30, 99, 0.35);
          background: linear-gradient(
            180deg,
            rgba(233, 30, 99, 0.24),
            rgba(233, 30, 99, 0.12)
          );
          color: #fff !important;
          font-weight: 700;
          text-decoration: none !important;
          box-shadow: 0 10px 22px rgba(233, 30, 99, 0.16);
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .orders-content-card article a:hover {
          transform: translateY(-1px);
          background: linear-gradient(
            180deg,
            rgba(233, 30, 99, 0.3),
            rgba(233, 30, 99, 0.16)
          );
          box-shadow: 0 14px 28px rgba(233, 30, 99, 0.24);
        }

        .orders-content-card h2 {
          color: #fff;
          margin: 0;
        }

        .orders-content-card .text-red-300 {
          color: #ff9cbf !important;
        }

        @media (max-width: 768px) {
          .orders-page-shell {
            padding: 28px 14px 64px;
          }

          .orders-hero-inner {
            padding: 24px 20px;
          }

          .orders-content-card {
            padding: 14px;
          }

          .orders-content-card article {
            padding: 18px;
          }

          .orders-content-card article h3 {
            font-size: 24px;
          }
        }
      `}</style>
    </main>
  );
}