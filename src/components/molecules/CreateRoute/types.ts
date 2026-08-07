import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { Dispatch, SetStateAction } from "react";

export interface CreateRouteProps {
  className?: string;
  waypoints: google.maps.LatLngLiteral[];
  setWaypoints: Dispatch<SetStateAction<google.maps.LatLngLiteral[]>>;
  map: google.maps.Map | undefined;
  setInitialCenter: Dispatch<SetStateAction<google.maps.LatLngLiteral>>;
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  adresses: { adress: string; index: number }[];
  setAdresses: Dispatch<SetStateAction<{ adress: string; index: number }[]>>;
  handleDeleteWaypoint: (index: number) => void;
  /** Encoded polyline retornada pelo backend — substitui DirectionsResult */
  polylineEncoded: string | null;
  polylinePoints: google.maps.LatLngLiteral[];
  isCalculatingPolyline: boolean;
  polylineError: string | null;
  onCalculatePolyline: () => void;
  isEdit: boolean;
  routeId: string | null;
  isSpecial: boolean;
  activeSuggestions: WithdrawalsRequestEntity[];
  setActiveSuggestions: Dispatch<SetStateAction<WithdrawalsRequestEntity[]>>;
}
