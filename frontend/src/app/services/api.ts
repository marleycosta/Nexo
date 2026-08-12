const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

function extractErrorMessage(payload: unknown) {
  let message = "Falha na requisição";
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (typeof data.message === "string") {
      message = data.message;
    } else {
      const firstKey = Object.keys(data)[0];
      const firstVal = firstKey ? data[firstKey] : null;
      if (Array.isArray(firstVal) && firstVal[0]) message = String(firstVal[0]);
      else if (typeof firstVal === "string") message = firstVal;
    }
  }
  return message;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    clearTokens();
    return null;
  }
  const data = (await response.json()) as { access: string; refresh?: string };
  setTokens(data.access, data.refresh || refresh);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && auth && retry) {
    const nextAccess = await refreshAccessToken();
    if (nextAccess) {
      return apiFetch<T>(path, options, auth, false);
    }
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload), response.status, payload);
  }

  return payload as T;
}
