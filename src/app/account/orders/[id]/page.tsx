import OrderDetailClient from "@/components/account/OrderDetailClient";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <section
        style={{
          marginBottom: 24,
          padding: 24,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "rgba(255,255,255,0.60)",
            fontSize: 12,
            letterSpacing: 1.6,
            textTransform: "uppercase",
          }}
        >
          Account
        </p>

        <h1 style={{ margin: "0 0 12px", fontSize: 44, lineHeight: 1.1 }}>
          Dettaglio ordine
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 760,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
          }}
        >
          Prodotti acquistati, pagamento e key digitali associate.
        </p>
      </section>

      <OrderDetailClient orderId={Number(id)} />
    </main>
  );
}