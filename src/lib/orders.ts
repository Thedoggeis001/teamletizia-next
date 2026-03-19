import { clearStoreToken, getStoreToken } from "@/lib/storeAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

export type OrderProduct = {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  type?: string | null;
};

export type OrderVariant = {
  id: number;
  name: string;
  price?: number | string | null;
  additional_cost?: number | string | null;
};

export type OrderItem = {
  id: number;
  quantity: number;
  unit_price?: number | string | null;
  subtotal?: number | string | null;
  product?: OrderProduct | null;
  variant?: OrderVariant | null;
};

export type UserOrder = {
  id: number;
  status?: string | null;
  total_amount?: number | string | null;
  payment_reference?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: OrderItem[];
};

export type OrderKey = {
  id: number;
  product_id: number;
  order_id: number;
  key_value: string;
  is_used?: boolean;
  used_at?: string | null;
  created_at?: string | null;
  product?: {
    id: number;
    name: string;
  } | null;
};

type OrdersApiEnvelope<T> =
  | T
  | {
      success?: boolean;
      message?: string;
      data?: T | null;
      order?: T | null;
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
    throw new Error("Login richiesto");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function extractPayload<T>(payload: OrdersApiEnvelope<T> | null): T | null {
  if (!payload) return null;

  if (Array.isArray(payload)) return payload as T;
  if (typeof payload !== "object") return payload as T;

  if ("data" in payload && payload.data !== undefined && payload.data !== null) {
    return payload.data as T;
  }

  if ("order" in payload && payload.order !== undefined && payload.order !== null) {
    return payload.order as T;
  }

  return payload as T;
}

async function ordersFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    clearStoreToken();
    throw new Error("Sessione scaduta. Effettua di nuovo il login.");
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Errore caricamento ordini");
  }

  const extracted = extractPayload<T>(data);

  if (extracted === null || extracted === undefined) {
    throw new Error("Risposta ordini non valida.");
  }

  return extracted;
}

export async function getOrders(): Promise<UserOrder[]> {
  return ordersFetch<UserOrder[]>("/api/orders");
}

export async function getOrder(orderId: number): Promise<UserOrder> {
  return ordersFetch<UserOrder>(`/api/orders/${orderId}`);
}

export async function getOrderKeys(orderId: number): Promise<OrderKey[]> {
  return ordersFetch<OrderKey[]>(`/api/orders/${orderId}/keys`);
}

export function formatOrderPrice(value: number | string | null | undefined) {
  const numeric = typeof value === "string" ? Number(value) : Number(value ?? 0);

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isNaN(numeric) ? 0 : numeric);
}

export function formatOrderDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}