import { getApiUrl } from "@/config/api";

export const AUTHORIZATION_EXPIRED_EVENT = "coletare:authorization-expired";

const publicAuthPaths = [
  "/auth/login",
  "/auth/logout",
  "/auth/password-reset/request"
];

function notifyAuthorizationExpired(path: string) {
  if (typeof window === "undefined" || publicAuthPaths.includes(path)) {
    return;
  }

  window.dispatchEvent(new Event(AUTHORIZATION_EXPIRED_EVENT));
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const urlApi = getApiUrl();

  const res = await fetch(`${urlApi}${path}`, {
    ...options,
    credentials: "include",
    headers: isFormData
      ? { ...options?.headers } // Deixa o browser setar o Content-Type (multipart boundary)
      : {
          "Content-Type": "application/json",
          ...options?.headers
        }
  });

  if (!res.ok) {
    if (res.status === 401) {
      notifyAuthorizationExpired(path);
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  // Handle empty responses
  const text = await res.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    return text as unknown as T;
  }
}
