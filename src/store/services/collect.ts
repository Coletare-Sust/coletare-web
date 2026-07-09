import { apiFetch } from "@/utils/apiFetch";
import { CollectEntity } from "@/common/entities/Collect";

export interface LocationDTO {
  latitude: number;
  longitude: number;
}

export interface CollectOutputDTO {
  id: string;
  cityId: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  legacy: {
    vehicleName: string;
    carPlate: string;
  };
  realTimePosition: LocationDTO[];
  hasEnded: boolean;
  metrics: {
    durationSeconds: number;
    kmRun: number;
  };
  environmentalData: {
    mass: number;
    consume: number;
    emission: number;
  };
  cost: {
    fuel: number;
    landfillDelivery: number;
  };
  createdAt?: string;
}

export function mapCollectOutputToEntity(dto: CollectOutputDTO): CollectEntity {
  const lastPosition = dto.realTimePosition?.length
    ? dto.realTimePosition[dto.realTimePosition.length - 1]
    : { latitude: 0, longitude: 0 };

  return {
    id: dto.id,
    cityId: dto.cityId,
    routeId: dto.routeId,
    employeeId: dto.driverId || "",
    vehicleName: dto.legacy?.vehicleName || "",
    carPlate: dto.legacy?.carPlate || "",
    mass: dto.environmentalData?.mass || 0,
    consume: dto.environmentalData?.consume || 0,
    emission: dto.environmentalData?.emission || 0,
    cost: {
      landfillDelivery: dto.cost?.landfillDelivery || 0,
      fuel: dto.cost?.fuel || 0,
    },
    kmRun: dto.metrics?.kmRun || 0,
    withdrawalRequestsIds: [],
    duration: dto.metrics?.durationSeconds || 0,
    vehicleLatitude: lastPosition.latitude,
    vehicleLongitude: lastPosition.longitude,
    createdAt: dto.createdAt
      ? ({ seconds: Math.floor(new Date(dto.createdAt).getTime() / 1000), nanoseconds: 0 } as any)
      : ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any),
    hasEnded: dto.hasEnded,
  };
}

export const getCollect = async (collectId: string) => {
  try {
    const data = await apiFetch<CollectOutputDTO>(`/collect/${collectId}`);
    return mapCollectOutputToEntity(data);
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getAllCollects = async () => {
  // O Backend atual não tem um endpoint genérico getAll (sem cityId) 
  // Retornando array vazio para não quebrar a aplicação.
  return [];
};
