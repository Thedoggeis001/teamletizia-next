import Link from "next/link";
import LogoutButton from "./logout-button";

export default function AdminDashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 48 }}>Admin</h1>
          <p style={{ marginTop: 10, opacity: 0.8 }}>
            Pannello di gestione contenuti e catalogo store.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/admin/login"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Login admin
          </Link>

          <LogoutButton />
        </div>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <AdminCard
          title="Prodotti store"
          description="Visualizza, modifica, attiva/disattiva ed elimina i prodotti."
          href="/admin/store-products"
          cta="Apri gestione prodotti"
        />

        <AdminCard
          title="Nuovo prodotto"
          description="Crea una nuova scheda prodotto con immagine e dati catalogo."
          href="/admin/store-products/new"
          cta="Crea prodotto"
        />

        <AdminCard
          title="Gestione news"
          description="Vai alla sezione news dell’admin già esistente."
          href="/admin/news"
          cta="Apri news"
        />

        <AdminCard
          title="Upload test"
          description="Area tecnica per test upload e verifiche rapide."
          href="/admin/upload-test"
          cta="Apri upload test"
        />
      </section>

      <section
        style={{
          marginTop: 28,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Accessi rapidi</h2>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <QuickLink href="/admin/store-products">Prodotti</QuickLink>
          <QuickLink href="/admin/store-products/new">Nuovo prodotto</QuickLink>
          <QuickLink href="/admin/news">News</QuickLink>
          <QuickLink href="/shop">Apri shop</QuickLink>
        </div>
      </section>
    </main>
  );
}

function AdminCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        padding: 20,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
      <p style={{ opacity: 0.8, lineHeight: 1.5, minHeight: 66 }}>
        {description}
      </p>

      <Link
        href={href}
        style={{
          display: "inline-block",
          marginTop: 8,
          padding: "10px 14px",
          border: "1px solid #ff0a78",
          borderRadius: 10,
          textDecoration: "none",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "8px 12px",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}