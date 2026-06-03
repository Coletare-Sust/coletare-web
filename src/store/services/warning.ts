import { WarningEntity } from "@/common/entities/Warning";
import { WarningDTO } from "@/common/dtos/WarningDTO";

const API_BASE =
  process.env.NEXT_PUBLIC_API_WARNINGS_URL || "http://localhost:8080/bff/avisos";

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

interface BackendAviso {
  id: string;
  cityId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

function toWarningEntity(a: BackendAviso): WarningEntity {
  return {
    id: a.id,
    cityId: a.cityId,
    title: a.title,
    description: a.description,
    image: a.imageUrl ?? null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  };
}

export const createWarningService = async (warning: WarningDTO): Promise<WarningEntity> => {
  // Upload de imagem para MinIO ainda não implementado — imageUrl fica null por ora
  const payload = {
    cityId: warning.cityId,
    title: warning.title,
    description: warning.description,
    imageUrl: null
  };
  const created = await http<BackendAviso>(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return toWarningEntity(created);
};

export const getAllWarningService = async (cityId: string): Promise<WarningEntity[]> => {
  const avisos = await http<BackendAviso[]>(
    `${API_BASE}?cityId=${encodeURIComponent(cityId)}`
  );
  return avisos.map(toWarningEntity);
};

export const getWarningService = async (warningId: string): Promise<WarningEntity | null> => {
  try {
    const aviso = await http<BackendAviso>(`${API_BASE}/${warningId}`);
    return toWarningEntity(aviso);
  } catch {
    return null;
  }
};

export const updateWarningService = async (
  warningId: string,
  data: { title: string; description: string; image?: File | string | null }
): Promise<WarningEntity | null> => {
  const imageUrl = typeof data.image === "string" ? data.image : null;
  const current = await getWarningService(warningId);
  const payload = {
    cityId: current?.cityId ?? "",
    title: data.title,
    description: data.description,
    imageUrl: imageUrl ?? current?.image ?? null
  };
  const updated = await http<BackendAviso>(`${API_BASE}/${warningId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  return toWarningEntity(updated);
};

export const deleteWarningService = async (warningId: string): Promise<{ error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE}/${warningId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { error: null };
  } catch (err: any) {
    console.error("Erro ao deletar aviso:", err);
    return { error: err.message ?? "Não foi possível deletar o aviso" };
  }
};
