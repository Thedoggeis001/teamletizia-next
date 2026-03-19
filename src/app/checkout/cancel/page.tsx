import Link from "next/link";

export default function CheckoutCancelPage() {
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
        <h1 style={{ marginTop: 0 }}>Pagamento annullato</h1>
        <p>Il pagamento è stato annullato. Il tuo ordine è ancora pending.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link href="/cart" className="btn btn-primary">
            Torna al carrello
          </Link>

          <Link href="/checkout" className="btn">
            Riprova checkout
          </Link>
        </div>
      </section>
    </div>
  );
}