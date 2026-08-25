import { apiFetch } from "@/utils/apiFetch";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import {
  normalizeWithdrawalRequestType,
  getResidueTypeLabel
} from "@/common/mappers/backendEnums";

// ---------- Backend DTOs (WithdrawalRequestOutputDTO) ----------

interface AddressDTO {
  fullAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface WithdrawalRequestOutputDTO {
  id: string;
  cityId: string;
  requesterId: string;
  residueType: string;
  withdrawalRequestType: string;
  image: string | null;
  status: boolean;
  address: AddressDTO;
  createdAt?: string;
}

// ---------- Input types ----------

export interface CreateWithdrawalRequestInput {
  requesterId: string;
  residueType: string;
  withdrawalRequestType: string;
  addressFull: string;
  latitude: number;
  longitude: number;
}

export interface UpdateWithdrawalRequestInput {
  status?: boolean;
  residueType?: string;
  withdrawalRequestType?: string;
  address?: {
    fullAddress: string;
    location: { latitude: number; longitude: number };
  };
}

// ---------- Mapper ----------

function mapWithdrawalOutputToEntity(
  dto: WithdrawalRequestOutputDTO
): WithdrawalsRequestEntity {
  return {
    id: dto.id,
    cityId: dto.cityId,
    type: normalizeWithdrawalRequestType(dto.withdrawalRequestType),
    fullAddress: dto.address?.fullAddress ?? "",
    latitude: dto.address?.location?.latitude ?? 0,
    longitude: dto.address?.location?.longitude ?? 0,
    // ResidueType: converte enum Java para label em português
    residueType: getResidueTypeLabel(dto.residueType ?? ""),
    createdById: dto.requesterId ?? "",
    isResolved: dto.status ?? false,
    image: dto.image ?? null,
    createdAt: dto.createdAt
  };
}

// ---------- Services ----------

export const getAllWithdrawalsRequests = async (
  cityId: string
): Promise<WithdrawalsRequestEntity[]> => {
  try {
    const data = await apiFetch<WithdrawalRequestOutputDTO[]>(
      `/withdrawal-request/${cityId}/city`
    );
    return data.map(mapWithdrawalOutputToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * POST usa multipart/form-data (exigência do backend).
 * O campo "data" recebe JSON serializado e "image" (opcional) recebe o arquivo.
 */
const apiUrl = "https://api.coletapp.com/";

export const createWithdrawalRequest = async (
  cityId: string,
  input: CreateWithdrawalRequestInput,
  imageFile?: File | null
): Promise<WithdrawalsRequestEntity> => {
  const formData = new FormData();
  // "data" parte: JSON serializado como Blob com content-type application/json
  formData.append(
    "data",
    new Blob([JSON.stringify(input)], { type: "application/json" })
  );
  if (imageFile) {
    formData.append("image", imageFile);
  }

  // NÃO usar apiFetch aqui pois ele força Content-Type: application/json
  // O browser seta automaticamente multipart/form-data com o boundary correto
  const res = await fetch(
    // `${process.env.NEXT_PUBLIC_API_URL}/withdrawal-request/${cityId}/city`,
    `${apiUrl}/withdrawal-request/${cityId}/city`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  const data: WithdrawalRequestOutputDTO = await res.json();
  return mapWithdrawalOutputToEntity(data);
};

export const updateWithdrawalRequest = async (
  id: string,
  input: UpdateWithdrawalRequestInput
): Promise<WithdrawalsRequestEntity> => {
  const data = await apiFetch<WithdrawalRequestOutputDTO>(
    `/withdrawal-request/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input)
    }
  );
  return mapWithdrawalOutputToEntity(data);
};

export const deleteWithdrawalRequest = async (
  id: string
): Promise<{ error: string | null }> => {
  try {
    await apiFetch(`/withdrawal-request/${id}`, { method: "DELETE" });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getWithdrawalRequestCount = async (
  cityId: string
): Promise<number> => {
  try {
    const data = await apiFetch<{ count: number }>(
      `/withdrawal-request/${cityId}/city/count`
    );
    return data.count ?? 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
