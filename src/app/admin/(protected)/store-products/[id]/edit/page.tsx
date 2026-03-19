import { notFound } from "next/navigation";
import { requireAdminForPage } from "@/lib/admin-auth";
import EditStoreProductForm from "./EditStoreProductForm";
import ProductKeysManager from "./ProductKeysManager";
import ProductVariantsManager from "./ProductVariantsManager";

type ProductVariant = {
  id: number;
  name: string;
  price?: string | number | null;
  additional_cost?: string | number | null;
};

type Product = {
  id: number | string;
  name: string;
  description?: string | null;
  base_price: string | number;
  type: string;
  image_url?: string | null;
  is_active: boolean;
  variants?: ProductVariant[];
};

type LaravelSingleProductResponse = {
  success?: boolean;
  message?: string;
  data?: Product | null;
};

async function getProduct(id: string): Promise<Product | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  const adminToken = process.env.LARAVEL_ADMIN_TOKEN?.trim();

  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL mancante");
  if (!adminToken) throw new Error("LARAVEL_ADMIN_TOKEN mancante");

  const res = await fetch(`${apiBase}/api/admin/products/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    cache: "no-store",
  });

  const data: LaravelSingleProductResponse | null = await res.json().catch(() => null);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(data?.message || "Errore caricamento prodotto");
  }

  return data?.data ?? null;
}

export default async function EditStoreProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminForPage();

  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px" }}>
      <h1>Modifica prodotto</h1>

      <EditStoreProductForm product={product} />

      <ProductVariantsManager
        productId={product.id}
        initialVariants={product.variants ?? []}
      />

      <ProductKeysManager
        productId={product.id}
        productType={product.type}
      />
    </main>
  );
}