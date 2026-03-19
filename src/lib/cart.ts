import { clearStoreToken, getStoreToken } from "@/lib/storeAuth";

const CART_ORDER_KEY = "store_cart_order_id";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

export type CartVariant = {
  id: number;
  name: string;
  price?: number | string | null;
  additional_cost?: number | string | null;
};

export type CartProduct = {
  id: number;
  name: string;
  description?: string | null;
  base_price?: number | string | null;
  price?: number | string | null;
  image_url?: string | null;
  type?: string | null;
};

export type CartItem = {
  id: number;
  quantity: number;
  unit_price?: number | string | null;
  subtotal?: number | string | null;
  product?: CartProduct | null;
  variant?: CartVariant | null;
};

export type CartOrder = {
  id: number;
  status?: string | null;
  total_amount?: number | string | null;
  payment_reference?: string | null;
  items?: CartItem[];
};

type CartApiResponse =
  | CartOrder
  | {
      success?: boolean;
      message?: string;
      data?: CartOrder | null;
      order?: CartOrder | null;
    };

function getApiBase() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL mancante");
  }

  return API_URL;
}

function getAuthHeaders() {
  const token = getStoreToken();

  if (!token) {
    throw new Error("Devi effettuare il login per usare il carrello.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    clearStoreToken();
    clearStoredCartOrderId();
    throw new Error("Sessione scaduta. Effettua di nuovo il login.");
  }

  if (!res.ok) {
    const message = data?.message || data?.error || "Errore richiesta carrello";
    throw new Error(message);
  }

  return data as T;
}

export function getStoredCartOrderId(): number | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(CART_ORDER_KEY);
  if (!value) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function setStoredCartOrderId(orderId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_ORDER_KEY, String(orderId));
}

export function clearStoredCartOrderId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_ORDER_KEY);
}

function isCartOrder(value: unknown): value is CartOrder {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "number"
  );
}

function extractOrder(payload: CartApiResponse | null): CartOrder | null {
  if (!payload) return null;
  if (isCartOrder(payload)) return payload;
  if ("data" in payload && payload.data && isCartOrder(payload.data)) return payload.data;
  if ("order" in payload && payload.order && isCartOrder(payload.order)) return payload.order;
  return null;
}

export function getCartItemUnitPrice(item: CartItem): number {
  const directUnit = item.unit_price;

  if (directUnit !== null && directUnit !== undefined && directUnit !== "") {
    const numeric = typeof directUnit === "string" ? Number(directUnit) : directUnit;
    if (!Number.isNaN(numeric)) return numeric;
  }

  const variantPrice = item.variant?.price;
  if (variantPrice !== null && variantPrice !== undefined && variantPrice !== "") {
    const numeric = typeof variantPrice === "string" ? Number(variantPrice) : variantPrice;
    if (!Number.isNaN(numeric)) return numeric;
  }

  const basePrice = item.product?.price ?? item.product?.base_price ?? 0;
  const additionalCost = item.variant?.additional_cost ?? 0;

  const base = typeof basePrice === "string" ? Number(basePrice) : Number(basePrice);
  const extra = typeof additionalCost === "string" ? Number(additionalCost) : Number(additionalCost);

  return (Number.isNaN(base) ? 0 : base) + (Number.isNaN(extra) ? 0 : extra);
}

export function getCartItemSubtotal(item: CartItem): number {
  if (item.subtotal !== undefined && item.subtotal !== null && item.subtotal !== "") {
    const numeric = Number(item.subtotal);
    if (!Number.isNaN(numeric)) return numeric;
  }

  return getCartItemUnitPrice(item) * Number(item.quantity || 0);
}

export function getCartTotals(order: CartOrder | null) {
  const items = order?.items ?? [];
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = items.reduce((sum, item) => sum + getCartItemSubtotal(item), 0);

  return { quantity, total };
}

export async function createCart(): Promise<CartOrder> {
  const result = await apiFetch<CartApiResponse>("/api/cart", { method: "POST" });
  const order = extractOrder(result);

  if (!order?.id) {
    throw new Error("Impossibile creare il carrello.");
  }

  setStoredCartOrderId(order.id);
  return order;
}

export async function getCart(orderId: number): Promise<CartOrder> {
  const result = await apiFetch<CartApiResponse>(`/api/cart/${orderId}`, { method: "GET" });
  const order = extractOrder(result);

  if (!order?.id) {
    throw new Error("Carrello non trovato.");
  }

  return order;
}

export async function ensureCart(): Promise<CartOrder> {
  const storedId = getStoredCartOrderId();

  if (storedId) {
    try {
      return await getCart(storedId);
    } catch {
      clearStoredCartOrderId();
    }
  }

  return createCart();
}

export async function addCartItem(params: {
  productId: number;
  quantity?: number;
  variantId?: number | null;
}): Promise<CartOrder> {
  const cart = await ensureCart();

  const result = await apiFetch<CartApiResponse>(`/api/cart/${cart.id}/items`, {
    method: "POST",
    body: JSON.stringify({
      product_id: params.productId,
      quantity: params.quantity ?? 1,
      variant_id: params.variantId ?? null,
    }),
  });

  const order = extractOrder(result);

  if (!order?.id) {
    throw new Error("Impossibile aggiungere il prodotto.");
  }

  setStoredCartOrderId(order.id);
  return order;
}

export async function removeCartItem(orderId: number, itemId: number): Promise<CartOrder> {
  const result = await apiFetch<CartApiResponse>(`/api/cart/${orderId}/items/${itemId}`, {
    method: "DELETE",
  });

  const order = extractOrder(result);

  if (!order?.id) {
    throw new Error("Impossibile rimuovere il prodotto.");
  }

  setStoredCartOrderId(order.id);
  return order;
}

export async function checkoutCart(
  orderId: number,
  paymentReference: string
): Promise<CartOrder> {
  const result = await apiFetch<CartApiResponse>(`/api/cart/${orderId}/checkout`, {
    method: "POST",
    body: JSON.stringify({
      payment_reference: paymentReference,
    }),
  });

  const order = extractOrder(result);

  if (!order?.id) {
    throw new Error("Checkout fallito.");
  }

  clearStoredCartOrderId();
  return order;
}