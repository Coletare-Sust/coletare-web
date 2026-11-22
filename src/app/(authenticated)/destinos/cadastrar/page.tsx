"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { GoogleMap, Marker } from "@react-google-maps/api";

import Title from "@atoms/Title/title";
import InputField from "@molecules/InputField/inputField";
import Dropdown from "@atoms/Dropdown/dropdown";
import Button from "@atoms/Button/button";
import FormErrorLabel from "@atoms/FormError/formError";
import { successToast, errorToast } from "@/hooks/useAppToast";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useCreateDisposalSite from "@/hooks/queries/disposalSite/useCreateDisposalSite";
import useUpdateDisposalSite from "@/hooks/queries/disposalSite/useUpdateDisposalSite";
import useGetDisposalSiteById from "@/hooks/queries/disposalSite/useGetDisposalSiteById";
import EcopontoAddressInput from "@/components/atoms/EcopontoAddressInput/EcopontoAddressInput";
import MapPanel from "@/components/molecules/MapPanel/mapPanel";
import {
  DISPOSAL_SITE_TYPE_LABELS,
  getDisposalSiteTypeLabel
} from "@/common/mappers/backendEnums";
import type { DisposalSiteType } from "@/store/services/disposalSite";

const initialCenter = { lat: -8.05224, lng: -34.928612 };

// Fora do componente: um objeto novo a cada render faria o GoogleMap chamar setOptions sempre.
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true
};

const CadastrarDestinoPage = () => {
  const router = useRouter();
  const params = useSearchParams();

  const isEdit = params.get("isEdit") === "true";
  const siteId = params.get("siteId");

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = (user as any)?.cityId ?? (user as any)?.id ?? "";

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<DisposalSiteType>("LANDFILL");
  const [error, setError] = useState("");

  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Posição escolhida (clique no mapa ou busca). O usuário não digita coordenadas.
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const { data: siteToEdit, isLoading: loadingSite } = useGetDisposalSiteById(
    siteId ?? "",
    { enabled: isEdit && !!siteId }
  );

  const { mutateAsync: createSite, isLoading: isCreating } =
    useCreateDisposalSite(cityId);
  const { mutateAsync: updateSite, isLoading: isUpdating } =
    useUpdateDisposalSite(cityId);

  useEffect(() => {
    if (isEdit && siteToEdit) {
      setName(siteToEdit.name);
      setAddress(siteToEdit.address);
      setType(siteToEdit.type);
      setPosition({ lat: siteToEdit.lat, lng: siteToEdit.lng });
    }
  }, [isEdit, siteToEdit]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setPosition({ lat: clickedLat, lng: clickedLng });

    new window.google.maps.Geocoder().geocode(
      { location: { lat: clickedLat, lng: clickedLng } },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress(
            `Localização selecionada (${clickedLat.toFixed(
              4
            )}, ${clickedLng.toFixed(4)})`
          );
        }
      }
    );
  }, []);

  const handleAddressSelect = (
    newLat: number,
    newLng: number,
    newAddress: string
  ) => {
    setAddress(newAddress);
    const newPos = { lat: newLat, lng: newLng };
    setPosition(newPos);
    map?.panTo(newPos);
    map?.setZoom(17);
  };

  const typeOptions = Object.entries(DISPOSAL_SITE_TYPE_LABELS).map(
    ([key, label]) => ({
      id: key,
      label,
      onClick: () => setType(key as DisposalSiteType)
    })
  );

  async function handleSubmit() {
    setError("");

    if (!cityId) {
      const msg = "Município não identificado — não é possível salvar.";
      errorToast(msg);
      return setError(msg);
    }
    if (!name.trim() || !address.trim() || !position) {
      const msg =
        "Informe o nome e escolha o local no mapa ou pela busca de endereço.";
      errorToast(msg);
      return setError(msg);
    }

    const body = {
      name: name.trim(),
      type,
      active: isEdit ? siteToEdit?.active ?? true : true,
      address: {
        fullAddress: address.trim(),
        location: { latitude: position.lat, longitude: position.lng }
      }
    };

    try {
      if (isEdit && siteId) {
        await updateSite({ id: siteId, body });
        successToast("Destino atualizado com sucesso!");
      } else {
        await createSite(body);
        successToast("Destino cadastrado com sucesso!");
      }
      router.replace("/destinos");
    } catch (err: any) {
      const msg = err?.message ?? "Erro ao salvar.";
      errorToast(msg);
      setError(msg);
    }
  }

  return (
    <div className="relative -m-4 h-[calc(100dvh-4rem)] overflow-hidden sm:-m-6">
      <div className="absolute inset-0 h-full w-full">
        <GoogleMap
          onLoad={setMap}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={initialCenter}
          zoom={15}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {position && <Marker position={position} />}
        </GoogleMap>
      </div>

      <MapPanel
        label="formulário"
        className="lg:left-8 lg:top-8 lg:max-w-[420px]"
      >
        <div
          className={twMerge(
            "max-h-[50dvh] w-full overflow-y-auto p-5 font-medium",
            "lg:max-h-[calc(100dvh-8rem)] lg:rounded-xl lg:bg-white-1000 lg:p-6 lg:shadow-2xl"
          )}
        >
          <Title className="mb-6 flex items-center gap-2 text-2xl">
            <Image
              src="/icon-left-arrow.svg"
              height={20}
              width={13}
              alt="Seta"
              onClick={() => router.back()}
              className="cursor-pointer"
            />
            {isEdit ? "Editar destino" : "Novo destino"}
          </Title>

          {isEdit && loadingSite ? (
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
                Clique no mapa para definir o local ou busque o endereço.
              </p>

              <InputField
                label="Nome do destino"
                placeholder="Ex.: Aterro Municipal"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <EcopontoAddressInput
                label="Endereço / Buscar local"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onLocationSelect={handleAddressSelect}
              />

              <div className="flex flex-col gap-2">
                <label className="font-medium text-greenDark-800">
                  Tipo de destino
                </label>
                <Dropdown
                  options={typeOptions}
                  className="w-full border border-greenBlue-800 bg-greenBebe-200 px-2 py-2 text-greenBlue-1000"
                  value={getDisposalSiteTypeLabel(type)}
                />
              </div>

              <FormErrorLabel>{error}</FormErrorLabel>

              <Button
                className="mt-4 w-full self-center"
                loading={isCreating || isUpdating}
                disabled={isCreating || isUpdating}
                buttonType="submit"
              >
                {isEdit ? "Salvar alterações" : "Cadastrar destino"}
              </Button>
            </form>
          )}
        </div>
      </MapPanel>
    </div>
  );
};

export default CadastrarDestinoPage;
