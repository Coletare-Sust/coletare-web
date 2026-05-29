import { StandaloneSearchBox } from "@react-google-maps/api";
import { useState } from "react";
import InputField from "@molecules/InputField/inputField";

interface EcopontoAddressInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const EcopontoAddressInput = ({
  label,
  value,
  onChange,
  onLocationSelect
}: EcopontoAddressInputProps) => {
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);

  const onLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (!searchBox) return;

    const places = searchBox.getPlaces();
    const place = places?.[0];

    if (place && place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "";
      onLocationSelect(lat, lng, address);
    }
  };

  return (
    <div className="relative">
      <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
        <InputField
          label={label}
          placeholder="Digite o endereço para buscar..."
          name="address-search"
          value={value}
          onChange={onChange}
        />
      </StandaloneSearchBox>
    </div>
  );
};

export default EcopontoAddressInput;
