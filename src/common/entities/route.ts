export interface RouteEntity {
  id: string;
  name: string;
  period: "morning" | "afternoon" | "night";
  days: boolean[];
  residueType: string;
  cityId: string;
  waypoints: { lat: number; lng: number; wasChecked: boolean }[];
  polyline: string;
  /**
   * Decoded lat/lng path merged from all direction chunks.
   * Populated on creation so display screens can render the full route
   * as a plain <Polyline> without any extra API calls.
   */
  polylinePoints?: { lat: number; lng: number }[];
  wasChecked: boolean;
  withdrawalRequestsIds: string[];
  isSpecial: boolean;
}
