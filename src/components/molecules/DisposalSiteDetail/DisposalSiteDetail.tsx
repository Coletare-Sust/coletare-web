"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import Button from "@atoms/Button/button";
import { getDisposalSiteTypeLabel } from "@/common/mappers/backendEnums";
import type { DisposalSite } from "@/store/services/disposalSite";

interface DisposalSiteDetailProps {
  site: DisposalSite;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

// Fora do componente: objeto novo a cada render faria o mapa reaplicar as opções.
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true
};

const DisposalSiteDetail = ({
  site,
  canUpdate,
  canDelete,
  onEdit,
  onToggleActive,
  onDelete
}: DisposalSiteDetailProps) => {
  const center = { lat: site.lat, lng: site.lng };

  return (
    <div className="flex w-full gap-8">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-2 text-lg font-bold text-greenBlue-1000">
            Localização
          </h3>
          <p className="mb-4 text-greenDark-800">
            <strong>Tipo:</strong> {getDisposalSiteTypeLabel(site.type)}
            <br />
            <strong>Situação:</strong> {site.active ? "Ativo" : "Inativo"}
          </p>
          <p className="text-greenDark-800">{site.address}</p>
        </div>

        {(canUpdate || canDelete) && (
          <div className="mt-8 flex gap-4">
            {canUpdate && (
              <>
                <Button
                  className="flex items-center gap-2 border border-greenBlue-800 bg-greenBebe-400 px-6 py-2 hover:bg-greenBebe-600"
                  classNameText="text-greenBlue-1000 font-semibold"
                  onClick={() => onEdit(site.id)}
                >
                  Editar
                </Button>
                <Button
                  className="flex items-center gap-2 border border-greenBlue-800 bg-greenBebe-400 px-6 py-2 hover:bg-greenBebe-600"
                  classNameText="text-greenBlue-1000 font-semibold"
                  onClick={() => onToggleActive(site.id, site.active)}
                >
                  {site.active ? "Desativar" : "Ativar"}
                </Button>
              </>
            )}
            {canDelete && (
              <Button
                className="flex items-center gap-2 border border-red-600 bg-red-500 px-6 py-2 hover:bg-red-600"
                classNameText="text-white font-semibold"
                onClick={() => onDelete(site.id)}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="h-[300px] w-[500px] overflow-hidden rounded-xl border border-greenBlue-200 shadow-md">
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

export default DisposalSiteDetail;
