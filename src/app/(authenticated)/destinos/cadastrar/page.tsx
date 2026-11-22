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
import {
  DISPOSAL_SITE_TYPE_LABELS,
  getDisposalSiteTypeLabel
} from "@/common/mappers/backendEnums";
import type { DisposalSiteType } from "@/store/services/disposalSite";

const initialCenter = { lat: -8.05224, lng: -34.928612 };

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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [type, setType] = useState<DisposalSiteType>("LANDFILL");
  const [error, setError] = useState("");

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);

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
      setLat(String(siteToEdit.lat));
      setLng(String(siteToEdit.lng));
      setType(siteToEdit.type);
      setMarkerPosition({ lat: siteToEdit.lat, lng: siteToEdit.lng });
    }
  }, [isEdit, siteToEdit]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setLat(String(clickedLat));
    setLng(String(clickedLng));
    setMarkerPosition({ lat: clickedLat, lng: clickedLng });

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
    setLat(String(newLat));
    setLng(String(newLng));
    setAddress(newAddress);
    const newPos = { lat: newLat, lng: newLng };
    setMarkerPosition(newPos);
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
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!cityId) {
      const msg = "Município não identificado — não é possível salvar.";
      errorToast(msg);
      return setError(msg);
    }
    if (!name.trim() || !address.trim() || isNaN(latNum) || isNaN(lngNum)) {
      const msg = "Preencha todos os campos obrigatórios.";
      errorToast(msg);
      return setError(msg);
    }

    const body = {
      name: name.trim(),
      type,
      active: isEdit ? siteToEdit?.active ?? true : true,
      address: {
        fullAddress: address.trim(),
        location: { latitude: latNum, longitude: lngNum }
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
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 h-full w-full">
        <GoogleMap
          onLoad={setMap}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={initialCenter}
          zoom={15}
          onClick={handleMapClick}
          options={{ disableDefaultUI: true, zoomControl: true }}
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
                Clique no mapa para definir a localização ou busque o endereço.
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
      </div>
    </div>
  );
};

export default CadastrarDestinoPage;
