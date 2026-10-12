import { apiFetch } from "@/utils/apiFetch";
import { RouteEntity } from "@/common/entities/route";
import { PageEntity } from "@/common/entities/pagination";
import {
  getResidueTypeLabel,
  toResidueTypeKey
} from "@/common/mappers/backendEnums";

// Backend Types
interface WaypointDTO {
  checked: boolean;
  location: { latitude: number; longitude: number; altitude?: number };
}

interface RouteOutputDTO {
  id: string;
  name: string;
  cityId: string;
  period: string;
  days: string[];
  isSpecial: boolean;
  residueType: string;
  polyline: string;
  polylinePoints?: { lat: number; lng: number }[] | null;
  waypoints: WaypointDTO[];
}

interface PageOutputDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const DEFAULT_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

export function mapRouteOutputToEntity(dto: RouteOutputDTO): RouteEntity {
  const daysEntity = DEFAULT_DAYS.map(
    (day) => dto.days?.includes(day) || false
  );
  return {
    id: dto.id,
    name: dto.name,
    cityId: dto.cityId,
    period: (dto.period?.toLowerCase() || "morning") as any,
    days: daysEntity,
    isSpecial: dto.isSpecial,
    residueType: getResidueTypeLabel(dto.residueType),
    polyline: dto.polyline || "",
    polylinePoints: dto.polylinePoints ?? null,
    wasChecked: false,
    withdrawalRequestsIds: [],
    waypoints: (dto.waypoints || []).map((wp) => ({
      lat: wp.location.latitude,
      lng: wp.location.longitude,
      wasChecked: wp.checked
    }))
  };
}

export function mapEntityToRouteInput(entity: Partial<RouteEntity>) {
  const daysSet: string[] = [];
  if (entity.days) {
    entity.days.forEach((isActive, index) => {
      if (isActive) daysSet.push(DEFAULT_DAYS[index]);
    });
  }

  return {
    name: entity.name,
    period: entity.period?.toUpperCase(),
    days: entity.days ? daysSet : undefined,
    isSpecial: entity.isSpecial,
    residueType: toResidueTypeKey(entity.residueType) ?? entity.residueType,
    polyline: entity.polyline,
    polylinePoints: entity.polylinePoints ?? null,
    waypoints: entity.waypoints?.map((wp) => ({
      checked: wp.wasChecked,
      location: { latitude: wp.lat, longitude: wp.lng }
    }))
  };
}

export const createRoute = async (data: RouteEntity) => {
  try {
    const input = mapEntityToRouteInput(data);
    await apiFetch(`/route/${data.cityId}/city`, {
      method: "POST",
      body: JSON.stringify(input)
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoutes = async (cityId: string) => {
  try {
    const data = await apiFetch<RouteOutputDTO[]>(`/route/${cityId}/city`);
    return data.map(mapRouteOutputToEntity);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getRoutesPage = async (
  cityId: string,
  page = 0,
  size = 10,
  filters?: {
    name?: string;
    residueType?: string;
  }
): Promise<PageEntity<RouteEntity> | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (filters?.name?.trim()) {
      params.set("name", filters.name.trim());
    }

    if (filters?.residueType?.trim()) {
      params.set("residueType", filters.residueType.trim());
    }

    const data = await apiFetch<PageOutputDTO<RouteOutputDTO>>(
      `/route/${cityId}/city/page?${params.toString()}`
    );

    return {
      content: data.content.map(mapRouteOutputToEntity),
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

export const deleteRoute = async (routeId: string) => {
  try {
    await apiFetch(`/route/${routeId}`, {
      method: "DELETE"
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoute = async (routeId: string, init?: RequestInit) => {
  try {
    const data = await apiFetch<RouteOutputDTO>(`/route/${routeId}`, init);
    return mapRouteOutputToEntity(data);
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateRouteDoc = async (
  uid: string,
  data: Partial<RouteEntity>
) => {
  try {
    const input = mapEntityToRouteInput(data);
    await apiFetch(`/route/${uid}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
    return { error: null };
  } catch (error: any) {
    console.log(error);
    return { error: error.message };
  }
};
