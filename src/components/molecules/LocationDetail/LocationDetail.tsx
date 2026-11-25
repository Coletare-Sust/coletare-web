"use client";

import { ReactNode } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

// Fora do componente: um objeto novo a cada render faria o mapa reaplicar as opções.
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true
};

interface LocationDetailProps {
  lat: number;
  lng: number;
  address: string;
  /** Linha extra acima do endereço (tipo, situação...). */
  info?: ReactNode;
  /** Mostra latitude/longitude em texto (os ecopontos ainda mostram). */
  showCoordinates?: boolean;
  /** Botões de ação (Editar, Excluir...). */
  actions?: ReactNode;
}

const LocationDetail = ({
  lat,
  lng,
  address,
  info,
  showCoordinates = true,
  actions
}: LocationDetailProps) => {
  const center = { lat, lng };

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-2 text-lg font-bold text-greenBlue-1000">
            Localização
          </h3>
          {info}
          {showCoordinates && (
            <p className="mb-4 text-greenDark-800">
              <strong>Lat:</strong> {lat} <br />
              <strong>Lng:</strong> {lng}
            </p>
          )}
          <p className="text-greenDark-800">{address}</p>
        </div>

        {actions && (
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            {actions}
          </div>
        )}
      </div>

      <div className="h-[240px] w-full overflow-hidden rounded-xl border border-greenBlue-200 shadow-md sm:h-[300px] lg:w-[500px] lg:shrink-0">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={16}
          options={mapOptions}
        >
          <Marker position={center} />
        </GoogleMap>
      </div>
    </div>
  );
};

export default LocationDetail;
