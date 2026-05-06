import { StandaloneSearchBox } from "@react-google-maps/api";
import { useState } from "react";
import { X } from "lucide-react";

import InputField from "@molecules/InputField/inputField";

import { AdressInputProps } from "./types";

const AdressInput = ({
  index,
  setWaypoints,
  waypoints,
  map,
  setInitialCenter,
  value,
  handleDeleteWaypoint
}: AdressInputProps) => {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox>();

  const onLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (!searchBox) return;
    const places = searchBox.getPlaces();
    if (!places || places.length === 0) return;
    const place = places[0];

    const location = {
      lat: place?.geometry?.location?.lat() || 0,
      lng: place?.geometry?.location?.lng() || 0
    };

    if (waypoints.length === 0) {
      setInitialCenter(location);
      map?.panTo(location);
    }

    const newArray = [...waypoints];
    newArray[index] = location;
    setWaypoints(newArray);
  };

  return (
    <div className="group relative">
      <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
        <InputField
          label={`Endereço ${index + 1}`}
          placeholder="Digite o endereço ou clique no mapa"
          name={`address-${index}`}
          value={value}
        />
      </StandaloneSearchBox>
      <div
        onClick={() => handleDeleteWaypoint(index)}
        className="absolute right-3 top-[22%] -translate-y-1/2 transform cursor-pointer opacity-0 transition-all group-hover:opacity-100"
      >
        <X size={20} />
      </div>
    </div>
  );
};

export default AdressInput;
