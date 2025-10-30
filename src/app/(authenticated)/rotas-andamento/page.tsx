"use client";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useState } from "react";
import Title from "@/components/atoms/Title/title";

const mapCenter = {
  lat: -8.3369,
  lng: -36.4251
};

const RotasAndamento = () => {
  const [, setMap] = useState<google.maps.Map>();

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  return (
    <div className="flex min-h-screen w-3/4 flex-col">
      <header className="bg-white mt-2 w-full p-6 shadow-sm">
        <Title>Monitoramento de Rotas</Title>
        <p className="mt-1 text-base text-gray-500">
          Visualize todas as coletas em andamento em tempo real.
        </p>
      </header>

      <main className="flex-1 p-6">
        <div className="h-[80vh] w-full overflow-hidden rounded-xl shadow-lg">
          <LoadScript
            googleMapsApiKey={
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
            }
            libraries={["places", "geometry"]}
            loadingElement={
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <p>Carregando Mapa...</p>
              </div>
            }
          >
            <GoogleMap
              onLoad={onMapLoad}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              zoom={14}
              center={mapCenter}
              options={{
                disableDefaultUI: true,
                zoomControl: true
              }}
            ></GoogleMap>
          </LoadScript>
        </div>
      </main>
    </div>
  );
};

export default RotasAndamento;
