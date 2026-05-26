export type BffLoginResponse = {
  error: string | null;
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    roles?: string[];
  };
};

export const bffLogin = async (email: string, password: string): Promise<BffLoginResponse> => {
  const response = await fetch("/api/bff/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

export const bffMe = async () => {
  const response = await fetch("/api/bff/auth/me", { method: "GET" });
  return response.json();
};

export const bffLogout = async () => {
  const response = await fetch("/api/bff/auth/logout", { method: "POST" });
  return response.json();
};

export const bffRefresh = async () => {
  const response = await fetch("/api/bff/auth/refresh", { method: "POST" });
  return response.json();
};
