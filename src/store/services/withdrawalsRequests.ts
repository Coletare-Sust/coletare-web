import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";

const API_BASE =
  process.env.NEXT_PUBLIC_API_WITHDRAWALS_URL ||
  "http://localhost:8080/bff/solicitacoes-retirada";

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

interface BackendSolicitacao {
  id: string;
  cityId: string;
  createdById: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  residueType: string;
  type: string;
  isResolved: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Converte ISO string para objeto compatível com Firebase Timestamp (createdAt.seconds)
function toTimestamp(iso: string | null | undefined) {
  if (!iso) return { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) };
  const ms = new Date(iso).getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    toDate: () => new Date(ms)
  };
}

function toEntity(s: BackendSolicitacao): WithdrawalsRequestEntity {
  return {
    id: s.id,
    cityId: s.cityId,
    createdById: s.createdById,
    fullAddress: s.fullAddress,
    latitude: s.latitude,
    longitude: s.longitude,
    residueType: s.residueType,
    type: s.type as "residence" | "inappropriate-location",
    isResolved: s.isResolved,
    image: s.imageUrl ?? null,
    createdAt: toTimestamp(s.createdAt) as any
  };
}

export const getAllWithdrawalsRequests = async (
  cityId: string
): Promise<WithdrawalsRequestEntity[]> => {
  try {
    const items = await http<BackendSolicitacao[]>(
      `${API_BASE}?cityId=${encodeURIComponent(cityId)}`
    );
    return items.map(toEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getWithdrawalRequest = async (
  id: string
): Promise<WithdrawalsRequestEntity | null> => {
  try {
    const item = await http<BackendSolicitacao>(`${API_BASE}/${id}`);
    return toEntity(item);
  } catch {
    return null;
  }
};

export const resolveWithdrawalRequest = async (
  id: string
): Promise<{ error: string | null }> => {
  try {
    await fetch(`${API_BASE}/${id}/resolve`, { method: "PATCH" });
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
};
