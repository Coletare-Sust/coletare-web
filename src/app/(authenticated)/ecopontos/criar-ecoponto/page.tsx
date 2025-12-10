"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Libraries
} from "@react-google-maps/api"; // Importamos LoadScript e Libraries

import Title from "@atoms/Title/title";
import InputField from "@molecules/InputField/inputField";
import Dropdown from "@atoms/Dropdown/dropdown";
import Button from "@atoms/Button/button";
import FormErrorLabel from "@atoms/FormError/formError";
import { successToast, errorToast } from "@/hooks/useAppToast";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";

import useCreateEcoponto from "@/hooks/queries/ecoponto/useCreateEcoponto";
import useUpdateEcoponto from "@/hooks/queries/ecoponto/useUpdateEcoponto";
import useGetEcopontoById from "@/hooks/queries/ecoponto/useGetEcopontoById";
import EcopontoAddressInput from "@/components/atoms/EcopontoAddressInput/EcopontoAddressInput";

const residuesTypesOptions = [
  "Recicláveis",
  "Orgânicos",
  "Especiais",
  "Resíduo Comum"
];

const initialCenter = {
  lat: -8.05224,
  lng: -34.928612
};

// --- IMPORTANTE: Definir fora do componente para evitar recarregamento infinito ---
const libraries: Libraries = ["places"];

const CriarEcopontoPage = () => {
  // Removemos o useJsApiLoader daqui

  const router = useRouter();
  const params = useSearchParams();

  const isEdit = params.get("isEdit") === "true";
  const ecopontoId = params.get("ecopontoId");

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const cityId =
    (user &&
      ((user as any).cityId ?? (user as any).city?.id ?? (user as any).id)) ||
    undefined;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [residueType, setResidueType] = useState<string[]>([
    residuesTypesOptions[0]
  ]);
  const [error, setError] = useState("");

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);

  const { data: ecopointToEdit, isLoading: loadingEcopoint } =
    useGetEcopontoById(ecopontoId!, {
      enabled: isEdit && !!ecopontoId
    });

  const { mutateAsync: createEcopoint, isLoading: isCreating } =
    useCreateEcoponto(cityId ?? "");

  const { mutateAsync: updateEcopoint, isLoading: isUpdating } =
    useUpdateEcoponto(cityId ?? "");

  useEffect(() => {
    if (isEdit && ecopointToEdit) {
      setName(ecopointToEdit.name);
      setDescription(ecopointToEdit.description);
      setLat(String(ecopointToEdit.lat));
      setLng(String(ecopointToEdit.lng));
      setResidueType(ecopointToEdit.residueType);
      setMarkerPosition({ lat: ecopointToEdit.lat, lng: ecopointToEdit.lng });
    }
  }, [isEdit, ecopointToEdit]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      setLat(String(clickedLat));
      setLng(String(clickedLng));
      setMarkerPosition({ lat: clickedLat, lng: clickedLng });
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const dropdownOptions = residuesTypesOptions.map((resType) => ({
    id: resType,
    label: resType,
    onClick: () => setResidueType([resType])
  }));

  async function handleSubmit() {
    setError("");
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!cityId) {
      const msg = "cityId não encontrado — não é possível salvar.";
      errorToast(msg);
      return setError(msg);
    }

    if (
      !name ||
      !description ||
      isNaN(latNum) ||
      isNaN(lngNum) ||
      residueType.length === 0
    ) {
      const msg = "Preencha todos os campos obrigatórios.";
      errorToast(msg);
      return setError(msg);
    }

    const payload = {
      cityId,
      name,
      description,
      residueType,
      lat: latNum,
      lng: lngNum,
      isActive: true
    };

    try {
      if (isEdit) {
        await updateEcopoint({ id: ecopontoId!, body: payload });
        successToast("Ecoponto atualizado com sucesso!");
      } else {
        await createEcopoint(payload);
        successToast("Ecoponto criado com sucesso!");
      }
      router.replace("/ecopontos");
    } catch (err: any) {
      const msg = err?.message ?? "Erro ao salvar.";
      errorToast(msg);
      setError(msg);
    }
  }

  const handleAddressSelect = (
    newLat: number,
    newLng: number,
    newAddress: string
  ) => {
    setLat(String(newLat));
    setLng(String(newLng));
    setDescription(newAddress);

    const newPos = { lat: newLat, lng: newLng };
    setMarkerPosition(newPos);
    map?.panTo(newPos);
    map?.setZoom(17);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* O LoadScript envolve TUDO que depende do Google Maps */}
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
        libraries={libraries}
        loadingElement={
          <div className="flex h-screen w-full items-center justify-center">
            Carregando Mapa...
          </div>
        }
      >
        <div className="absolute inset-0 h-full w-full">
          <GoogleMap
            onLoad={onMapLoad}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={initialCenter}
            zoom={15}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true
            }}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>

        <div className="absolute left-8 top-8 z-10 h-[calc(100vh-64px)] w-full max-w-[520px]">
          <div
            className={twMerge(
              "h-full w-full overflow-y-auto rounded-xl",
              "bg-white-1000 p-8 font-medium shadow-2xl"
            )}
          >
            <Title className="mb-8 flex items-center gap-2 text-2xl">
              <Image
                src="/icon-left-arrow.svg"
                height={20}
                width={13}
                alt="Seta"
                onClick={() => router.back()}
                className="cursor-pointer"
              />
              {isEdit ? "Editar Ecoponto" : "Novo Ecoponto"}
            </Title>

            {isEdit && loadingEcopoint ? (
              <p className="text-center text-gray-500">Carregando dados...</p>
            ) : (
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <p className="text-sm text-gray-500">
                  Clique no mapa para definir a localização ou preencha
                  manualmente.
                </p>

                <InputField
                  label="Nome do Ecoponto"
                  placeholder="Digite o nome"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Este componente agora está seguro pois só renderiza após o LoadScript terminar */}
                <EcopontoAddressInput
                  label="Endereço / Buscar Local"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onLocationSelect={handleAddressSelect}
                />

                <div className="flex flex-col gap-4">
                  <InputField
                    label="Latitude"
                    placeholder="-8.2826"
                    name="lat"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      const l = parseFloat(e.target.value);
                      const g = parseFloat(lng);
                      if (!isNaN(l) && !isNaN(g))
                        setMarkerPosition({ lat: l, lng: g });
                    }}
                  />
                  <InputField
                    label="Longitude"
                    placeholder="-35.9753"
                    name="lng"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      const l = parseFloat(lat);
                      const g = parseFloat(e.target.value);
                      if (!isNaN(l) && !isNaN(g))
                        setMarkerPosition({ lat: l, lng: g });
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-greenDark-800">
                    Tipo de Resíduo
                  </label>
                  <Dropdown
                    options={dropdownOptions}
                    className="w-full border border-greenBlue-800 bg-greenBebe-200 px-2 py-2 text-greenBlue-1000"
                    value={residueType[0]}
                  />
                </div>

                <FormErrorLabel>{error}</FormErrorLabel>

                <Button
                  className="mt-4 w-full self-center"
                  loading={isCreating || isUpdating}
                  disabled={isCreating || isUpdating}
                  buttonType="submit"
                >
                  {isEdit ? "Salvar Alterações" : "Criar Ecoponto"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </LoadScript>
    </div>
  );
};

export default CriarEcopontoPage;
