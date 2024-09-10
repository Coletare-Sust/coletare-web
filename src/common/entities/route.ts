export interface RouteEntity {
  id: string;
  name: string;
  period: "morning" | "afternoon" | "night";
  days: boolean[];
  residueType: string;
  cityId: string;
  waypoints: { lat: number; lng: number; wasChecked: boolean }[];
  polyline: string;
  wasChecked: boolean;
  withdrawalRequestsIds: string[];
  isSpecial: boolean;
}
