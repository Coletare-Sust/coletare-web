export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
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
