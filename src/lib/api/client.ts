import { STORAGE_KEYS } from "@/lib/storage";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api").replace(
  /\/$/,
  ""
);

const REFRESH_PATH = "/auth/refresh";

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function getAuthToken(): string | null {
  return readStorage(STORAGE_KEYS.token);
}

export function setAuthToken(token: string | null): void {
  writeStorage(STORAGE_KEYS.token, token);
}

export function getRefreshToken(): string | null {
  return readStorage(STORAGE_KEYS.refreshToken);
}

export function setRefreshToken(token: string | null): void {
  writeStorage(STORAGE_KEYS.refreshToken, token);
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const payload = (await response.json()) as {
      token?: string;
      refreshToken?: string;
    };
    if (!payload.token) return false;

    setAuthToken(payload.token);
    if (payload.refreshToken) setRefreshToken(payload.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function describeStatus(status: number, statusText: string): string {
  if (status >= 500) {
    return `Server error (HTTP ${status}). The service may be misconfigured — please try again or contact support.`;
  }
  if (status === 0) {
    return "Network error. Please check your connection and try again.";
  }
  return statusText || `Request failed (HTTP ${status})`;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    // Don't surface raw HTML error pages (e.g. a 500 page) to the user.
    if (trimmed && !trimmed.startsWith("<")) return trimmed;
    return fallback;
  }
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (cause) {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      0,
      cause
    );
  }

  if (response.status === 401 && allowRefresh && path !== REFRESH_PATH) {
    if (await ensureRefreshed()) {
      return request<T>(path, init, false);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown = null;
  if (response.status !== 204) {
    payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      setRefreshToken(null);
    }
    throw new ApiError(
      extractMessage(payload, describeStatus(response.status, response.statusText)),
      response.status,
      payload
    );
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET", cache: "no-store" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export { API_BASE_URL };
