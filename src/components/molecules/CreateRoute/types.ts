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
  response: google.maps.DirectionsResult | null;
  isEdit: boolean;
  routeId: string | null;
  isSpecial: boolean;
  activeSuggestions: WithdrawalsRequestEntity[];
  setActiveSuggestions: Dispatch<SetStateAction<WithdrawalsRequestEntity[]>>;
}
