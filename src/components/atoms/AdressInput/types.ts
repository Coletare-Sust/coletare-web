import { Dispatch, SetStateAction } from "react";

export interface AdressInputProps {
  index: number;
  waypoints: google.maps.LatLngLiteral[];
  setWaypoints: Dispatch<SetStateAction<google.maps.LatLngLiteral[]>>;
  map: google.maps.Map | undefined;
  setInitialCenter: Dispatch<SetStateAction<google.maps.LatLngLiteral>>;
  value: string | undefined;
  handleDeleteWaypoint: (index: number) => void;
}
