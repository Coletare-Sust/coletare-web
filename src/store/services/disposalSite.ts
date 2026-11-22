import { apiFetch } from "@/utils/apiFetch";
import { PageEntity } from "@/common/entities/pagination";

// ---------- Backend DTOs (DisposalSiteOutputDTO) ----------

export type DisposalSiteType =
  | "LANDFILL"
  | "COMPOSTING"
  | "BIODIGESTER"
  | "SORTING_CENTER"
  | "OTHER";

interface DisposalSiteOutputDTO {
  id: string;
  cityId: string;
  name: string;
  type: DisposalSiteType;
  active: boolean;
  address: {
    fullAddress: string;
    location: { latitude: number; longitude: number };
  };
}

interface PageOutputDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---------- Frontend entity ----------

export type DisposalSite = {
  id: string;
  cityId: string;
  name: string;
  type: DisposalSiteType;
  active: boolean;
  address: string;
  lat: number;
  lng: number;
};

export type DisposalSiteInput = {
  name: string;
  type: DisposalSiteType;
  active: boolean;
  address: {
    fullAddress: string;
    location: { latitude: number; longitude: number };
  };
};

export type DisposalSiteFilters = {
  name?: string;
  type?: DisposalSiteType;
  active?: boolean;
};

function mapOutputToEntity(dto: DisposalSiteOutputDTO): DisposalSite {
  return {
    id: dto.id,
    cityId: dto.cityId,
    name: dto.name,
    type: dto.type,
    active: dto.active,
    address: dto.address?.fullAddress ?? "",
    lat: dto.address?.location?.latitude ?? 0,
    lng: dto.address?.location?.longitude ?? 0
  };
}

// ---------- Services ----------

export const getDisposalSitesByCity = async (
  cityId: string
): Promise<DisposalSite[]> => {
  const data = await apiFetch<DisposalSiteOutputDTO[]>(
    `/disposal-site/${cityId}/city`
  );
  return data.map(mapOutputToEntity);
};

export const getDisposalSitesPage = async (
  cityId: string,
  page = 0,
  size = 10,
  filters?: DisposalSiteFilters
): Promise<PageEntity<DisposalSite> | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    if (filters?.name?.trim()) params.set("name", filters.name.trim());
    if (filters?.type) params.set("type", filters.type);
    if (filters?.active !== undefined) {
      params.set("active", String(filters.active));
    }

    const data = await apiFetch<PageOutputDTO<DisposalSiteOutputDTO>>(
      `/disposal-site/${cityId}/city/page?${params.toString()}`
    );

    return {
      content: data.content.map(mapOutputToEntity),
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getDisposalSiteById = async (
  id: string
): Promise<DisposalSite | null> => {
  try {
    const data = await apiFetch<DisposalSiteOutputDTO>(`/disposal-site/${id}`);
    return mapOutputToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createDisposalSite = async (
  cityId: string,
  input: DisposalSiteInput
): Promise<DisposalSite> => {
  const result = await apiFetch<DisposalSiteOutputDTO>(
    `/disposal-site/${cityId}/city`,
    { method: "POST", body: JSON.stringify(input) }
  );
  return mapOutputToEntity(result);
};

export const updateDisposalSite = async (
  id: string,
  input: Partial<DisposalSiteInput>
): Promise<DisposalSite> => {
  const result = await apiFetch<DisposalSiteOutputDTO>(`/disposal-site/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
  return mapOutputToEntity(result);
};

export const deleteDisposalSite = async (id: string): Promise<true> => {
  await apiFetch(`/disposal-site/${id}`, { method: "DELETE" });
  return true;
};
