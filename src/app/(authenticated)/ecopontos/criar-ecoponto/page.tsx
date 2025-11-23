"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

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

const residuesTypesOptions = [
  "Recicláveis",
  "Orgânicos",
  "Especiais",
  "Resíduo Comum"
];

const CriarEcopontoPage = () => {
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
    }
  }, [isEdit, ecopointToEdit]);

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

  return (
    <div className="relative flex h-full min-h-screen w-full items-start justify-center bg-gray-100 py-10">
      <div
        className={twMerge(
          "z-10 h-full w-full max-w-[480px] overflow-y-auto rounded-lg",
          "bg-white-1000 p-8 font-medium shadow-2xl"
        )}
      >
        <Title className="mb-10 flex items-center gap-2 text-2xl">
          <Image
            src="/icon-left-arrow.svg"
            height={20}
            width={13}
            alt="Seta"
            onClick={() => router.back()}
            className="cursor-pointer"
          />
          {isEdit ? "Editar ecoponto" : "Criar novo ecoponto"}
        </Title>

        {isEdit && loadingEcopoint ? (
          <p className="text-center">Carregando dados...</p>
        ) : (
          <form
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <InputField
              label="Nome do Ecoponto"
              placeholder="Digite o nome"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <InputField
              label="Endereço / Detalhes"
              placeholder="Rua, número e detalhes"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <InputField
              label="Latitude"
              placeholder="Ex: -8.2826"
              name="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />

            <InputField
              label="Longitude"
              placeholder="Ex: -35.9753"
              name="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />

            <label className="font-medium text-greenDark-800">
              Tipo de Resíduo
            </label>
            <Dropdown
              options={dropdownOptions}
              className="w-fit border border-greenBlue-800 bg-greenBebe-200 px-2 py-2 text-greenBlue-1000"
              value={residueType[0]}
            />

            <FormErrorLabel>{error}</FormErrorLabel>

            <Button
              className="self-center px-12"
              loading={isCreating || isUpdating}
              disabled={isCreating || isUpdating}
              buttonType="submit"
            >
              {isEdit ? "Salvar alterações" : "Salvar ecoponto"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CriarEcopontoPage;
