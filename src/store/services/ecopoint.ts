import { apiFetch } from "@/utils/apiFetch";

// ---------- Backend DTOs (EcopointOutputDTO) ----------

interface AddressDTO {
  fullAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface EcopointOutputDTO {
  id: string;
  cityId: string;
  name: string;
  isActive: boolean;
  residueTypes: string[];
  address: AddressDTO;
}

// ---------- Frontend entity ----------

export type Ecoponto = {
  id: string;
  cityId: string;
  name: string;
  description: string;
  residueType: string[];
  lat: number;
  lng: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEcopontoDTO = {
  cityId: string;
  name: string;
  isActive: boolean;
  residueTypes: string[];
  address: {
    fullAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
};

export type UpdateEcopontoDTO = Partial<CreateEcopontoDTO>;

// ---------- Mapper ----------

function mapEcopointOutputToEntity(dto: EcopointOutputDTO): Ecoponto {
  return {
    id: dto.id,
    cityId: dto.cityId,
    name: dto.name,
    description: dto.address?.fullAddress ?? "",
    residueType: dto.residueTypes ?? [],
    lat: dto.address?.location?.latitude ?? 0,
    lng: dto.address?.location?.longitude ?? 0,
    isActive: dto.isActive,
    createdAt: "",
    updatedAt: "",
  };
}

// ---------- Services ----------

export const getEcopontosByCity = async (cityId: string): Promise<Ecoponto[]> => {
  try {
    const data = await apiFetch<EcopointOutputDTO[]>(`/ecopoint/${cityId}/city`);
    return data.map(mapEcopointOutputToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getEcopontoById = async (id: string): Promise<Ecoponto | null> => {
  try {
    const data = await apiFetch<EcopointOutputDTO>(`/ecopoint/${id}`);
    return mapEcopointOutputToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createEcoponto = async (data: CreateEcopontoDTO): Promise<Ecoponto> => {
  console.log("Enviando dados para criação:", data);
  const { cityId, ...input } = data;
  const result = await apiFetch<EcopointOutputDTO>(`/ecopoint/${cityId}/city`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapEcopointOutputToEntity(result);
};

export const updateEcoponto = async (
  id: string,
  data: UpdateEcopontoDTO
): Promise<Ecoponto> => {
  const { cityId, ...input } = data;
  const result = await apiFetch<EcopointOutputDTO>(`/ecopoint/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapEcopointOutputToEntity(result);
};

export const deleteEcoponto = async (id: string): Promise<true> => {
  await apiFetch(`/ecopoint/${id}`, { method: "DELETE" });
  return true;
};
