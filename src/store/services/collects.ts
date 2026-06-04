import { CollectEntity } from "@/common/entities/Collect";

const API_BASE =
  process.env.NEXT_PUBLIC_API_COLLECTS_URL || "http://localhost:8080/bff/coletas";

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

interface BackendColeta {
  id: string;
  cityId: string;
  routeId: string;
  vehicleName: string;
  carPlate: string;
  employeeId: string;
  mass: number | null;
  consume: number | null;
  emission: number | null;
  cost: { landfillDelivery: number | null; fuel: number | null } | null;
  kmRun: number;
  withdrawalRequestsIds: string[] | null;
  duration: number;
  vehicleLatitude: number;
  vehicleLongitude: number;
  hasEnded: boolean;
  createdAt: string;
  updatedAt: string;
}

function toTimestamp(iso: string | null | undefined) {
  if (!iso) return { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) };
  const ms = new Date(iso).getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    toDate: () => new Date(ms)
  };
}

function toEntity(c: BackendColeta): CollectEntity {
  return {
    id: c.id,
    cityId: c.cityId,
    routeId: c.routeId,
    vehicleName: c.vehicleName,
    carPlate: c.carPlate,
    employeeId: c.employeeId,
    mass: c.mass ?? 0,
    consume: c.consume ?? 0,
    emission: c.emission ?? 0,
    cost: {
      landfillDelivery: c.cost?.landfillDelivery ?? 0,
      fuel: c.cost?.fuel ?? 0
    },
    kmRun: c.kmRun,
    withdrawalRequestsIds: c.withdrawalRequestsIds ?? [],
    duration: c.duration,
    vehicleLatitude: c.vehicleLatitude,
    vehicleLongitude: c.vehicleLongitude,
    hasEnded: c.hasEnded,
    createdAt: toTimestamp(c.createdAt) as any
  };
}

export const getAllCollectsByRoute = async (routeId: string): Promise<CollectEntity[]> => {
  try {
    const coletas = await http<BackendColeta[]>(
      `${API_BASE}?routeId=${encodeURIComponent(routeId)}`
    );
    return coletas.map(toEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getAllCollectsByCity = async (cityId: string): Promise<CollectEntity[]> => {
  try {
    const coletas = await http<BackendColeta[]>(
      `${API_BASE}?cityId=${encodeURIComponent(cityId)}`
    );
    return coletas.map(toEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const updateCollect = async (
  id: string,
  data: Partial<CollectEntity>
): Promise<{ error: string | null }> => {
  try {
    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getDashboardData = async (
  cityId: string,
  routeId?: string
): Promise<import("@/common/entities/dashboard").DashboardEntity | null> => {
  try {
    const url = routeId
      ? `${API_BASE}/dashboard?cityId=${encodeURIComponent(cityId)}&routeId=${encodeURIComponent(routeId)}`
      : `${API_BASE}/dashboard?cityId=${encodeURIComponent(cityId)}`;
    return await http<import("@/common/entities/dashboard").DashboardEntity>(url);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};
