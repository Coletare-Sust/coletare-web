import {
  get,
  getDatabase,
  orderByChild,
  ref,
  set,
  equalTo,
  query as queryDatabase,
  remove,
  update
} from "firebase/database";

import firebaseApp from "@/config/firebase";
import { RouteEntity } from "@/common/entities/route";

const database = getDatabase(firebaseApp);

const API_BASE =
  process.env.NEXT_PUBLIC_API_ROUTES_URL ||
  "http://localhost:8080/api/rotas";

async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const createRoute = async (data: RouteEntity) => {
  if (API_BASE) {
    return http<{ error: null }>(`${API_BASE}`, {
      method: "POST",
      body: JSON.stringify(data)
    }).then((r) => ({ error: null })).catch((e) => ({ error: e.message }));
  }

  try {
    set(ref(database, "routes/" + data.id), data);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoutes = async (cityId: string) => {
  if (API_BASE) {
    const url = `${API_BASE}?cityId=${encodeURIComponent(cityId)}`;
    return http<RouteEntity[]>(url).catch((e) => {
      console.error(e);
      return [] as RouteEntity[];
    });
  }

  const query = queryDatabase(
    ref(getDatabase(), `routes`),
    orderByChild("cityId"),
    equalTo(cityId)
  );
  return get(query)
    .then((snapshot) => {
      const routesObj = snapshot.val();
      if (!routesObj || routesObj.length === 0) return [];
      const response = Object.keys(routesObj).map((key) => routesObj[key]);
      return response ?? [];
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};

export const deleteRoute = async (routeId: string) => {
  if (API_BASE) {
    return fetch(`${API_BASE}/${routeId}`, { method: "DELETE" }).then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      return { error: null };
    }).catch((e) => ({ error: e.message }));
  }

  try {
    const routeRef = ref(database, `routes/${routeId}`);
    await remove(routeRef);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoute = async (routeId: string) => {
  if (API_BASE) {
    return http<RouteEntity>(`${API_BASE}/${routeId}`).catch((e) => ({ error: e.message } as any));
  }

  try {
    const routeRef = ref(database, `routes/${routeId}`);
    const snapshot = await get(routeRef);

    if (snapshot.exists()) {
      return { id: routeId, ...snapshot.val() };
    } else {
      return { error: "Route not found" };
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateRouteDoc = async (
  uid: string,
  data: Partial<RouteEntity>
) => {
  if (API_BASE) {
    return fetch(`${API_BASE}/${uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((res) => {
      if (!res.ok) throw new Error("Update failed");
      return { error: null };
    }).catch((e) => ({ error: e.message }));
  }

  try {
    const userRef = ref(database, `routes/${uid}`);
    await update(userRef, data);
    return { error: null };
  } catch (error: any) {
    console.log(error);
    return { error: error.message };
  }
};
