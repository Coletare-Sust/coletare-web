import { apiFetch } from "@/utils/apiFetch";
import { CollectEntity } from "@/common/entities/Collect";
import { PageEntity } from "@/common/entities/pagination";
import { CollectOutputDTO, mapCollectOutputToEntity } from "./collect";
import { DashboardEntity } from "@/common/entities/dashboard";

interface PageOutputDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function mapCollectPageOutputToEntity(
  dto: PageOutputDTO<CollectOutputDTO>
): PageEntity<CollectEntity> {
  return {
    content: dto.content.map(mapCollectOutputToEntity),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    last: dto.last
  };
}

export const getAllCollectsByRoute = async (routeId: string) => {
  try {
    const data = await apiFetch<CollectOutputDTO[]>(
      `/collect/route/${routeId}`
    );
    return data.map(mapCollectOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getCollectsPageByRoute = async (
  routeId: string,
  page = 0,
  size = 10
) => {
  try {
    const data = await apiFetch<PageOutputDTO<CollectOutputDTO>>(
      `/collect/route/${routeId}/page?page=${page}&size=${size}`
    );
    return mapCollectPageOutputToEntity(data);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getAllCollectsByCity = async (cityId: string) => {
  try {
    const data = await apiFetch<CollectOutputDTO[]>(`/collect/${cityId}/city`);
    return data.map(mapCollectOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getCollectsPageByCity = async (
  cityId: string,
  page = 0,
  size = 10,
  filters?: {
    routeId?: string;
    residueType?: string;
    hasEnded?: boolean;
  }
) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (filters?.routeId?.trim()) {
      params.set("routeId", filters.routeId.trim());
    }

    if (filters?.residueType?.trim()) {
      params.set("residueType", filters.residueType.trim());
    }

    if (filters?.hasEnded !== undefined) {
      params.set("hasEnded", String(filters.hasEnded));
    }

    const data = await apiFetch<PageOutputDTO<CollectOutputDTO>>(
      `/collect/${cityId}/city/page?${params.toString()}`
    );
    return mapCollectPageOutputToEntity(data);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const updateCollect = async (
  id: string,
  data: Partial<CollectEntity>
) => {
  try {
    const input = {
      cityId: data.cityId,
      routeId: data.routeId,
      driverId: data.employeeId,
      vehicleId: "", // Not available in frontend entity mapped structure currently
      vehicleName: data.vehicleName,
      carPlate: data.carPlate,
      latitude: data.vehicleLatitude,
      longitude: data.vehicleLongitude,
      hasEnded: data.hasEnded,
      durationSeconds: data.duration,
      kmRun: data.kmRun,
      mass: data.mass,
      consume: data.consume,
      emission: data.emission,
      fuelCost: data.cost?.fuel,
      landfillDeliveryCost: data.cost?.landfillDelivery
    };

    const response = await apiFetch(`/collect/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
    console.log(response);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

// ---------- Dashboard ----------

// Backend response shape (DashboardDataOutputDTO / DashboardMetricDataDTO)
interface DashboardMetricDataDTO {
  year: number[];
  semester: number[];
  month: number[];
}

interface DashboardDataOutputDTO {
  landfill: DashboardMetricDataDTO;
  fuel: DashboardMetricDataDTO;
  emission: DashboardMetricDataDTO;
  mass: DashboardMetricDataDTO;
}

function mapDashboardOutputToEntity(
  dto: DashboardDataOutputDTO
): DashboardEntity {
  return {
    landfill: {
      year: dto.landfill?.year ?? [],
      semester: dto.landfill?.semester ?? [],
      month: dto.landfill?.month ?? []
    },
    fuel: {
      year: dto.fuel?.year ?? [],
      semester: dto.fuel?.semester ?? [],
      month: dto.fuel?.month ?? []
    },
    emission: {
      year: dto.emission?.year ?? [],
      semester: dto.emission?.semester ?? [],
      month: dto.emission?.month ?? []
    },
    mass: {
      year: dto.mass?.year ?? [],
      semester: dto.mass?.semester ?? [],
      month: dto.mass?.month ?? []
    }
  };
}

export const getDashboardData = async (
  cityId: string,
  routeId?: string
): Promise<DashboardEntity | null> => {
  try {
    const url = routeId
      ? `/metrics/${cityId}/dashboard?routeId=${routeId}`
      : `/metrics/${cityId}/dashboard`;
    const data = await apiFetch<DashboardDataOutputDTO>(url);
    return mapDashboardOutputToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};
