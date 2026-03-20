const TOKEN_KEY = "store_token";

export type StoreUser = {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T | null;
  user?: T;
  token?: string;
  errors?: Record<string, string[]> | null;
};

type AuthPayload = {
  token?: string;
  user?: StoreUser;
};

function getApiBase() {
  return "/api/store";
}

function isBrowser() {
  return typeof window !== "undefined";
}

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(payload: any, fallback: string) {
  if (payload?.message) return payload.message;

  if (payload?.errors && typeof payload.errors === "object") {
    const firstKey = Object.keys(payload.errors)[0];
    const firstValue = firstKey ? payload.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }
  }

  return fallback;
}

function getAuthHeaders(includeJson = true): HeadersInit {
  const token = getStoreToken();

  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(!(init?.body instanceof FormData)),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = await parseJson<T & ApiEnvelope<any>>(res);

  if (res.status === 401 || res.status === 403) {
    clearStoreToken();
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, "Richiesta autenticazione fallita."));
  }

  return (payload ?? {}) as T;
}

export function getStoreToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoreToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoreToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isStoreLoggedIn(): boolean {
  return !!getStoreToken();
}

export async function storeLogin(email: string, password: string): Promise<string> {
  const result = await authFetch<ApiEnvelope<AuthPayload>>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = result.token ?? result.data?.token;

  if (!token) {
    throw new Error(getErrorMessage(result, "Login fallito: token non restituito."));
  }

  setStoreToken(token);
  return token;
}

export async function storeRegister(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
): Promise<string> {
  const result = await authFetch<ApiEnvelope<AuthPayload>>("/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation,
    }),
  });

  const token = result.token ?? result.data?.token;

  if (!token) {
    throw new Error(getErrorMessage(result, "Registrazione fallita: token non restituito."));
  }

  setStoreToken(token);
  return token;
}

export async function getStoreMe(): Promise<StoreUser> {
  const result = await authFetch<ApiEnvelope<StoreUser>>("/me", {
    method: "GET",
  });

  const user = result.user ?? result.data;

  if (!user) {
    clearStoreToken();
    throw new Error(getErrorMessage(result, "Impossibile recuperare l'utente autenticato."));
  }

  return user;
}

export async function storeLogout(): Promise<void> {
  try {
    await authFetch("/logout", {
      method: "POST",
    });
  } catch {
    // puliamo comunque il token locale
  } finally {
    clearStoreToken();
  }
}