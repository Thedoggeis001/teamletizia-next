import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <section
        className="card"
        style={{
          padding: 24,
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Pagamento completato</h1>
        <p>
          Stripe ha completato il pagamento. Il tuo ordine verrà aggiornato
          automaticamente appena il webhook verrà ricevuto dal backend.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link href="/shop" className="btn btn-primary">
            Torna allo shop
          </Link>

          <Link href="/account/orders" className="btn">
            Vai ai tuoi ordini
          </Link>
        </div>
      </section>
    </div>
  );
}