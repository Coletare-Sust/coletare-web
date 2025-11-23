"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Button from "@atoms/Button/button";
import { useRouter } from "next/navigation";

interface EcopontoDetailProps {
  ecoponto: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    description: string;
  };
  onDelete: (id: string) => void;
}

const EcopontoDetail = ({ ecoponto, onDelete }: EcopontoDetailProps) => {
  const router = useRouter();

  const center = {
    lat: ecoponto.lat,
    lng: ecoponto.lng
  };

  return (
    <div className="flex w-full gap-8">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-2 text-lg font-bold text-greenBlue-1000">
            Localização
          </h3>
          <p className="mb-4 text-greenDark-800">
            <strong>Lat:</strong> {ecoponto.lat} <br />
            <strong>Lng:</strong> {ecoponto.lng}
          </p>
          <p className="text-greenDark-800">{ecoponto.description}</p>
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            className="flex items-center gap-2 border border-greenBlue-800 bg-greenBebe-400 px-6 py-2 hover:bg-greenBebe-600"
            classNameText="text-greenBlue-1000 font-semibold"
            onClick={() =>
              router.push(
                `/ecopontos/criar-ecoponto?isEdit=true&ecopontoId=${ecoponto.id}`
              )
            }
          >
            Editar
          </Button>

          <Button
            className="flex items-center gap-2 border border-red-600 bg-red-500 px-6 py-2 hover:bg-red-600"
            classNameText="text-white font-semibold"
            onClick={() => onDelete(ecoponto.id)}
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="h-[300px] w-[500px] overflow-hidden rounded-xl border border-greenBlue-200 shadow-md">
        <LoadScript
          googleMapsApiKey={
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
          }
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={16}
            options={{
              disableDefaultUI: true,
              zoomControl: true
            }}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default EcopontoDetail;
