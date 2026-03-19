import Link from "next/link";
import { requireAdminForPage } from "@/lib/admin-auth";
import DeleteProductButton from "./DeleteProductButton";
import ToggleProductActiveButton from "./ToggleProductActiveButton";

type Product = {
  id: number | string;
  name: string;
  description?: string | null;
  base_price: string | number;
  type: string;
  image_url?: string | null;
  is_active: boolean;
};

type LaravelPaginatedProducts = {
  current_page?: number;
  data?: Product[];
  total?: number;
};

type LaravelResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | null;
  data?: LaravelPaginatedProducts | Product[] | null;
};

function extractProducts(payload: LaravelResponse | null): Product[] {
  if (!payload?.data) return [];

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
}

async function getProducts(): Promise<Product[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  const adminToken = process.env.LARAVEL_ADMIN_TOKEN?.trim();

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL mancante");
  }

  if (!adminToken) {
    throw new Error("LARAVEL_ADMIN_TOKEN mancante");
  }

  const res = await fetch(`${apiBase}/api/admin/products`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    cache: "no-store",
  });

  const data: LaravelResponse | null = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("ADMIN PRODUCTS LIST ERROR:", data);
    throw new Error(data?.message || "Errore caricamento prodotti");
  }

  return extractProducts(data);
}

export default async function AdminStoreProductsPage() {
  await requireAdminForPage();

  const products = await getProducts();

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Prodotti store</h1>
          <p style={{ opacity: 0.8, marginTop: 8 }}>
            Totale prodotti: {products.length}
          </p>
        </div>

        <Link
          href="/admin/store-products/new"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            border: "1px solid #ff0a78",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          + Nuovo prodotto
        </Link>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          Nessun prodotto presente.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1080,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Immagine</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Prezzo</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Stato</th>
                <th style={thStyle}>Azioni</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={tdStyle}>{product.id}</td>

                  <td style={tdStyle}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                    ) : (
                      <span style={{ opacity: 0.6 }}>—</span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    {product.description ? (
                      <div
                        style={{
                          opacity: 0.75,
                          fontSize: 13,
                          marginTop: 4,
                          maxWidth: 280,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.description}
                      </div>
                    ) : null}
                  </td>

                  <td style={tdStyle}>€ {product.base_price}</td>
                  <td style={tdStyle}>{product.type}</td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {product.is_active ? "Attivo" : "Non attivo"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <Link href={`/shop/products/${product.id}`} style={linkStyle}>
                        Vedi
                      </Link>

                      <Link
                        href={`/admin/store-products/${product.id}/edit`}
                        style={linkStyle}
                      >
                        Modifica
                      </Link>

                      {product.type === "digital" ? (
                        <Link
                          href={`/admin/store-products/${product.id}/edit`}
                          style={linkStyle}
                        >
                          Keys
                        </Link>
                      ) : null}

                      <ToggleProductActiveButton
                        productId={product.id}
                        productName={product.name}
                        isActive={product.is_active}
                        currentDescription={product.description}
                        currentPrice={product.base_price}
                        currentType={product.type}
                        currentImageUrl={product.image_url}
                      />

                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.15)",
  padding: "12px 10px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: "12px 10px",
  verticalAlign: "middle",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 8,
  padding: "6px 10px",
};