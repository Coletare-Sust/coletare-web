export interface CollectEntity {
  id: string;
  cityId: string;
  routeId: string;
  vehicleName: string;
  carPlate: string;
  employeeId: string;
  mass: number;
  consume: number;
  emission: number;
  cost: {
    landfillDelivery: number;
    fuel: number;
  };
  kmRun: number;
  withdrawalRequestsIds: string[];
  duration: number;
  vehicleLatitude: number;
  vehicleLongitude: number;
  createdAt: string;
  hasEnded: boolean;
}
