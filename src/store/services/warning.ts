import { apiFetch } from "@/utils/apiFetch";
import { WarningEntity } from "@/common/entities/Warning";

// ---------- Backend DTOs (WarningOutputDTO) ----------

interface WarningOutputDTO {
  id: string;
  title: string;
  description: string;
  image: string | null;
  cityId: string;
  createdAt?: string;
}

// ---------- Input types ----------

export interface CreateWarningInput {
  title: string;
  description: string;
  image?: File | null;
}

export interface UpdateWarningInput {
  title: string;
  description: string;
  image?: string | null;
}

// ---------- Mapper ----------

function mapWarningOutputToEntity(dto: WarningOutputDTO): WarningEntity {
  return {
    id: dto.id,
    cityId: dto.cityId,
    title: dto.title,
    description: dto.description,
    image: dto.image ?? null,
    createdAt: dto.createdAt ?? "",
    updatedAt: ""
  };
}

// ---------- Services ----------

export const getAllWarningService = async (
  cityId: string
): Promise<WarningEntity[]> => {
  try {
    const data = await apiFetch<WarningOutputDTO[]>(`/warning/${cityId}/city`);
    return data.map(mapWarningOutputToEntity);
  } catch (error) {
    console.error(error);
    throw new Error(String(error));
  }
};

export const createWarningService = async (
  cityId: string,
  warning: CreateWarningInput
): Promise<WarningEntity> => {
  const formData = new FormData();
  formData.append("title", warning.title);
  formData.append("description", warning.description);
  if (warning.image instanceof File) {
    formData.append("image", warning.image);
  }

  const data = await apiFetch<WarningOutputDTO>(`/warning/${cityId}/city`, {
    method: "POST",
    body: formData,
    // Sem Content-Type: o browser define automaticamente o boundary do multipart
    headers: {}
  });
  return mapWarningOutputToEntity(data);
};

export const updateWarningService = async (
  warningId: string,
  data: UpdateWarningInput
): Promise<WarningEntity> => {
  const body = {
    title: data.title,
    description: data.description,
    image: typeof data.image === "string" ? data.image : null
  };
  const result = await apiFetch<WarningOutputDTO>(`/warning/${warningId}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
  return mapWarningOutputToEntity(result);
};

export const deleteWarningService = async (
  warningId: string
): Promise<{ error: string | null }> => {
  try {
    await apiFetch(`/warning/${warningId}`, { method: "DELETE" });
    return { error: null };
  } catch (err) {
    console.error("Erro ao deletar aviso:", err);
    return { error: "Não foi possível deletar o aviso" };
  }
};

export const getWarningService = async (
  warningId: string
): Promise<WarningEntity | null> => {
  try {
    const data = await apiFetch<WarningOutputDTO>(`/warning/${warningId}`);
    return mapWarningOutputToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};
