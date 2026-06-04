import { RouteEntity } from "@/common/entities/route";

const API_BASE =
  process.env.NEXT_PUBLIC_API_ROUTES_URL || "http://localhost:8080/api/rotas";

async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const createRoute = async (data: RouteEntity) => {
  try {
    await http<RouteEntity>(API_BASE, { method: "POST", body: JSON.stringify(data) });
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
};

export const getRoutes = async (cityId: string): Promise<RouteEntity[]> => {
  try {
    return await http<RouteEntity[]>(`${API_BASE}?cityId=${encodeURIComponent(cityId)}`);
  } catch (e: any) {
    console.error(e);
    return [];
  }
};

export const deleteRoute = async (routeId: string) => {
  try {
    const res = await fetch(`${API_BASE}/${routeId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
};

export const getRoute = async (routeId: string): Promise<RouteEntity | null> => {
  try {
    return await http<RouteEntity>(`${API_BASE}/${routeId}`);
  } catch (e: any) {
    console.error(e);
    return null;
  }
};

export const updateRouteDoc = async (uid: string, data: Partial<RouteEntity>) => {
  try {
    const res = await fetch(`${API_BASE}/${uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update failed");
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
};
