import CheckoutClient from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <section
        style={{
          marginBottom: 24,
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "rgba(255,255,255,0.65)",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Team Letizia Store
        </p>

        <h1 style={{ margin: "0 0 12px", fontSize: 40 }}>Checkout</h1>

        <p
          style={{
            margin: 0,
            maxWidth: 760,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
          }}
        >
          Finalizza l’ordine pending e completa il test del flusso acquisto.
        </p>
      </section>

      <CheckoutClient />
    </div>
  );
}

