import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { storeApiFetch } from "@/lib/storeApi";
import AddToCartButton from "@/components/shop/AddToCartButton";

type ProductVariant = {
  id: number;
  name: string;
  price?: number | string | null;
  additional_cost?: number | string | null;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  base_price?: number | string | null;
  price?: number | string | null;
  image_url?: string | null;
  type?: string | null;
  is_active?: boolean;
  has_keys?: boolean;
  variants?: ProductVariant[];
};

type ProductResponse = {
  success: boolean;
  message: string;
  errors?: unknown;
  data: Product | null;
};

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Price unavailable";
  }

  const numeric = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Product | null = null;

  try {
    const result = await storeApiFetch<ProductResponse>(`/api/products/${id}`);
    product = result.data ?? null;
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  const basePrice = product.price ?? product.base_price;
  const isAvailable = product.is_active !== false;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/shop" className="btn">
          Back to shop
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        <section
          className="card"
          style={{
            padding: 20,
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 360,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(233, 30, 99, 0.18), rgba(255,255,255,0.03))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.45)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              "Product preview"
            )}
          </div>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <p
            style={{
              margin: "0 0 10px",
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            {product.type ?? "Product"}
          </p>

          <h1 style={{ marginTop: 0, marginBottom: 14, fontSize: 38 }}>
            {product.name}
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
            }}
          >
            {product.description || "No description available."}
          </p>

          <div
            style={{
              marginTop: 24,
              marginBottom: 24,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {formatPrice(basePrice)}
          </div>

          <div
            style={{
              marginBottom: 24,
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              gap: 8,
            }}
          >
            <div>
              <strong>Status:</strong>{" "}
              {isAvailable ? "Available" : "Unavailable"}
            </div>

            <div>
              <strong>Type:</strong> {product.type ?? "N/A"}
            </div>

            <div>
              <strong>Digital keys:</strong>{" "}
              {product.has_keys ? "Included" : "No"}
            </div>
          </div>

          {product.variants && product.variants.length > 0 ? (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Variants</h2>

              <div style={{ display: "grid", gap: 12 }}>
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="card"
                    style={{
                      padding: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <strong>{variant.name}</strong>
                    </div>

                    <div>
                      {formatPrice(
                        variant.price ?? variant.additional_cost ?? basePrice
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginBottom: 24,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              No variants available for this product.
            </div>
          )}

          <AddToCartButton
            productId={product.id}
            disabled={!isAvailable}
            variants={product.variants ?? []}
          />
        </section>
      </div>
    </div>
  );
}
