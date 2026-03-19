import Link from "next/link";
import ShopAuthPanel from "@/components/store/ShopAuthPanel";

type Product = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | string | null;
  base_price?: number | string | null;
};

type ProductsEnvelope =
  | Product[]
  | {
      success?: boolean;
      message?: string;
      data?:
        | Product[]
        | {
            data?: Product[] | null;
            links?: unknown;
            meta?: unknown;
          }
        | null;
    };

async function getProductsSafe(): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    return [];
  }

  try {
    const res = await fetch(`${apiUrl}/api/products`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json().catch(() => null)) as ProductsEnvelope | null;

    if (!json) return [];

    // Caso 1: array diretto
    if (Array.isArray(json)) {
      return json;
    }

    // Caso 2: envelope classico { data: [...] }
    if ("data" in json && Array.isArray(json.data)) {
      return json.data;
    }

    // Caso 3: paginazione Laravel { data: { data: [...] } }
    if (
      "data" in json &&
      json.data &&
      typeof json.data === "object" &&
      "data" in json.data &&
      Array.isArray(json.data.data)
    ) {
      return json.data.data;
    }

    return [];
  } catch {
    return [];
  }
}

function formatPrice(value?: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isNaN(amount) ? 0 : amount);
}

export default async function ShopPage() {
  const products = await getProductsSafe();

  return (
    <main className="shop-page-shell">
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <p className="shop-kicker">TEAM LETIZIA STORE</p>
          <h1>Shop</h1>
          <p>
            Scopri prodotti digitali, edizioni speciali e contenuti acquistabili
            collegati al tuo account store.
          </p>
        </div>

        <div className="shop-hero-actions">
          <Link href="/cart" className="shop-cart-button">
            Vai al carrello
          </Link>
        </div>
      </section>

      <section className="shop-layout">
        <aside className="shop-auth-wrap">
          <ShopAuthPanel />
        </aside>

        <section className="shop-products-wrap">
          <div className="shop-products-head">
            <div>
              <p className="shop-products-kicker">Catalogo</p>
              <h2>Prodotti disponibili</h2>
            </div>

            <span className="shop-products-count">
              Totale prodotti: {products.length}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="shop-empty-card">
              <h3>Nessun prodotto disponibile</h3>
              <p>
                I prodotti compariranno qui appena saranno disponibili nello store.
              </p>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map((product) => {
                const href = product.slug
                  ? `/shop/products/${product.slug}`
                  : `/shop/products/${product.id}`;

                const price = product.price ?? product.base_price ?? 0;

                return (
                  <article key={product.id} className="shop-product-card">
                    <div className="shop-product-media">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="shop-product-image"
                        />
                      ) : (
                        <div className="shop-product-placeholder">
                          Product preview
                        </div>
                      )}
                    </div>

                    <div className="shop-product-body">
                      <h3>{product.name}</h3>
                      <p>{product.description || "Scopri di più su questo prodotto."}</p>

                      <div className="shop-product-footer">
                        <strong>{formatPrice(price)}</strong>

                        <Link href={href} className="shop-product-cta">
                          View product
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .shop-page-shell {
              width: 100%;
              max-width: 1280px;
              margin: 0 auto;
              padding: 34px 20px 80px;
            }

            .shop-hero {
              position: relative;
              overflow: hidden;
              display: flex;
              justify-content: space-between;
              gap: 20px;
              align-items: flex-start;
              border-radius: 32px;
              border: 1px solid rgba(233, 30, 99, 0.16);
              background:
                radial-gradient(circle at top right, rgba(233, 30, 99, 0.18), transparent 34%),
                radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.05), transparent 24%),
                linear-gradient(180deg, rgba(17, 17, 17, 0.96), rgba(10, 10, 10, 0.98));
              box-shadow:
                0 18px 40px rgba(0, 0, 0, 0.34),
                0 0 40px rgba(233, 30, 99, 0.08);
              padding: 28px 30px;
            }

            .shop-hero::after {
              content: "";
              position: absolute;
              inset: 1px;
              border-radius: 31px;
              border: 1px solid rgba(233, 30, 99, 0.12);
              pointer-events: none;
            }

            .shop-hero-copy {
              position: relative;
              z-index: 2;
              max-width: 760px;
            }

            .shop-kicker {
              margin: 0 0 10px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.48);
            }

            .shop-hero h1 {
              margin: 0;
              font-size: clamp(34px, 5vw, 52px);
              line-height: 1.05;
              color: #fff;
            }

            .shop-hero p {
              margin: 16px 0 0;
              font-size: 15px;
              line-height: 1.75;
              color: rgba(255, 255, 255, 0.72);
            }

            .shop-cart-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-height: 50px;
              padding: 0 18px;
              border-radius: 16px;
              border: 1px solid rgba(233, 30, 99, 0.35);
              background: linear-gradient(
                180deg,
                rgba(233, 30, 99, 0.24),
                rgba(233, 30, 99, 0.12)
              );
              color: #fff;
              font-weight: 700;
              text-decoration: none;
              box-shadow: 0 10px 22px rgba(233, 30, 99, 0.16);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .shop-cart-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 14px 28px rgba(233, 30, 99, 0.22);
            }

            .shop-layout {
              margin-top: 24px;
              display: grid;
              grid-template-columns: 360px minmax(0, 1fr);
              gap: 24px;
              align-items: start;
            }

            .shop-auth-wrap {
              position: sticky;
              top: 24px;
            }

            .shop-products-wrap {
              border-radius: 32px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              background:
                radial-gradient(circle at top right, rgba(233, 30, 99, 0.08), transparent 28%),
                linear-gradient(180deg, rgba(14, 14, 18, 0.96), rgba(10, 10, 10, 0.96));
              box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
              padding: 20px;
            }

            .shop-products-head {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              gap: 16px;
              margin-bottom: 18px;
            }

            .shop-products-kicker {
              margin: 0 0 8px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.42);
            }

            .shop-products-head h2 {
              margin: 0;
              font-size: 28px;
              color: #fff;
            }

            .shop-products-count {
              display: inline-flex;
              align-items: center;
              min-height: 38px;
              padding: 0 14px;
              border-radius: 999px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              background: rgba(255, 255, 255, 0.04);
              color: rgba(255, 255, 255, 0.68);
              font-size: 13px;
              font-weight: 600;
            }

            .shop-empty-card {
              border-radius: 26px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              background: linear-gradient(180deg, rgba(18, 18, 22, 0.98), rgba(11, 11, 14, 0.98));
              padding: 24px;
            }

            .shop-empty-card h3 {
              margin: 0;
              color: #fff;
            }

            .shop-empty-card p {
              margin: 12px 0 0;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.7;
            }

            .shop-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 18px;
            }

            .shop-product-card {
              position: relative;
              overflow: hidden;
              border-radius: 28px;
              border: 1px solid rgba(233, 30, 99, 0.14);
              background:
                radial-gradient(circle at top right, rgba(233, 30, 99, 0.08), transparent 30%),
                linear-gradient(180deg, rgba(18, 18, 22, 0.98), rgba(11, 11, 14, 0.98));
              box-shadow:
                0 14px 34px rgba(0, 0, 0, 0.28),
                0 0 28px rgba(233, 30, 99, 0.05);
              padding: 16px;
              transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            }

            .shop-product-card:hover {
              transform: translateY(-4px);
              border-color: rgba(233, 30, 99, 0.25);
              box-shadow:
                0 20px 42px rgba(0, 0, 0, 0.34),
                0 0 34px rgba(233, 30, 99, 0.1);
            }

            .shop-product-media {
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid rgba(233, 30, 99, 0.12);
              background: rgba(255, 255, 255, 0.02);
            }

            .shop-product-image {
              display: block;
              width: 100%;
              aspect-ratio: 16 / 10;
              object-fit: cover;
            }

            .shop-product-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              aspect-ratio: 16 / 10;
              color: rgba(255, 255, 255, 0.55);
              background:
                radial-gradient(circle at top, rgba(233, 30, 99, 0.14), transparent 48%),
                linear-gradient(180deg, rgba(62, 16, 36, 0.5), rgba(24, 24, 26, 0.9));
            }

            .shop-product-body {
              padding-top: 16px;
            }

            .shop-product-body h3 {
              margin: 0;
              font-size: 20px;
              color: #fff;
            }

            .shop-product-body p {
              margin: 10px 0 0;
              min-height: 48px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.6;
            }

            .shop-product-footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;
              margin-top: 18px;
            }

            .shop-product-footer strong {
              color: #fff;
              font-size: 28px;
              line-height: 1;
            }

            .shop-product-cta {
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
              color: #fff;
              font-weight: 700;
              text-decoration: none;
              box-shadow: 0 10px 22px rgba(233, 30, 99, 0.16);
            }

            .shop-product-cta:hover {
              box-shadow: 0 14px 28px rgba(233, 30, 99, 0.22);
            }

            /* ===== ShopAuthPanel internals ===== */

            .shop-auth-wrap section {
              position: relative !important;
              overflow: hidden !important;
              border-radius: 30px !important;
              border: 1px solid rgba(233, 30, 99, 0.18) !important;
              background:
                radial-gradient(circle at top right, rgba(233, 30, 99, 0.18), transparent 32%),
                linear-gradient(180deg, rgba(16, 16, 20, 0.98), rgba(10, 10, 12, 0.98)) !important;
              box-shadow:
                0 18px 40px rgba(0, 0, 0, 0.34),
                0 0 34px rgba(233, 30, 99, 0.08) !important;
              padding: 24px !important;
            }

            .shop-auth-wrap section::after {
              content: "";
              position: absolute;
              inset: 1px;
              border-radius: 29px;
              border: 1px solid rgba(233, 30, 99, 0.12);
              pointer-events: none;
            }

            .shop-auth-wrap section > * {
              position: relative;
              z-index: 2;
            }

            .shop-auth-wrap h3,
            .shop-auth-wrap h2 {
              color: #fff !important;
            }

            .shop-auth-wrap p,
            .shop-auth-wrap label,
            .shop-auth-wrap span,
            .shop-auth-wrap div {
              color: inherit;
            }

            .shop-auth-wrap input {
              width: 100%;
              min-height: 52px;
              border-radius: 18px !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              background: rgba(0, 0, 0, 0.28) !important;
              color: #fff !important;
              padding: 0 16px !important;
              outline: none;
            }

            .shop-auth-wrap input::placeholder {
              color: rgba(255, 255, 255, 0.3);
            }

            .shop-auth-wrap button,
            .shop-auth-wrap a {
              font-family: inherit;
            }

            .shop-auth-wrap button {
              min-height: 46px;
              border-radius: 14px !important;
            }

            .shop-auth-wrap a[href="/account/orders"] {
              display: block !important;
              width: 100% !important;
              margin-top: 14px !important;
              padding: 16px 18px !important;
              border-radius: 18px !important;
              border: 1px solid rgba(233, 30, 99, 0.35) !important;
              background: linear-gradient(
                180deg,
                rgba(233, 30, 99, 0.24),
                rgba(233, 30, 99, 0.12)
              ) !important;
              color: #fff !important;
              text-decoration: none !important;
              box-shadow: 0 10px 22px rgba(233, 30, 99, 0.16) !important;
            }

            .shop-auth-wrap a[href="/account/orders"] > * {
              color: #fff !important;
            }

            .shop-auth-wrap button[type="button"] {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 100%;
            }

            @media (max-width: 1024px) {
              .shop-layout {
                grid-template-columns: 1fr;
              }

              .shop-auth-wrap {
                position: static;
              }
            }

            @media (max-width: 768px) {
              .shop-page-shell {
                padding: 24px 14px 64px;
              }

              .shop-hero {
                flex-direction: column;
                padding: 22px 20px;
              }

              .shop-products-wrap {
                padding: 14px;
              }

              .shop-products-head {
                flex-direction: column;
                align-items: flex-start;
              }

              .shop-grid {
                grid-template-columns: 1fr;
              }

              .shop-product-footer {
                flex-direction: column;
                align-items: stretch;
              }

              .shop-product-footer strong {
                font-size: 24px;
              }
            }
          `,
        }}
      />
    </main>
  );
}