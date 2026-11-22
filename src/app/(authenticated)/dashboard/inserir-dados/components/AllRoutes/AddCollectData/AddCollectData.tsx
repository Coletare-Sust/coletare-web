"use client";

import { MdEdit } from "react-icons/md";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import Subtitle from "@atoms/Subtitle/subtitle";
import Button from "@atoms/Button/button";
import LateralInputField from "@molecules/LateralInputField/LateralInputField";
import EditCollectDataSchema from "@/validations/EditCollectData";
import useCity from "@/hooks/queries/useCity";
import { errorToast, successToast } from "@/hooks/useAppToast";
import { updateCollect } from "@/store/services/collects";
import { CollectEntity } from "@/common/entities/Collect";
import { queryClient } from "@/store/providers/queryClient";
import { AddCollectDataProps } from "./types";
import CollectBiomassSection from "../CollectBiomassSection/CollectBiomassSection";

type EditCollectForm = z.infer<typeof EditCollectDataSchema>;

const AddCollectData = ({ collectData, isAdmin }: AddCollectDataProps) => {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city") as string;
  const { data: city } = useCity(cityId);
  const calcData = city?.calcData;
  const [loading, setLoading] = useState(false);

  const collectDate = new Date(collectData.createdAt.seconds * 1000);
  const initialDate = new Date(
    (calcData?.initialDate?.seconds as number) * 1000
  );

  const collectDateWithoutTime = new Date(
    collectDate.getFullYear(),
    collectDate.getMonth(),
    collectDate.getDate()
  );
  const initialDateWithoutTime = new Date(
    initialDate.getFullYear(),
    initialDate.getMonth(),
    initialDate.getDate()
  );

  const defaultLandfillDelivery =
    !collectData.cost?.landfillDelivery.toString() &&
    !!calcData?.initialDate?.seconds
      ? collectDateWithoutTime >= initialDateWithoutTime
        ? calcData?.landfillDelivery?.toString()
        : collectData.cost?.landfillDelivery?.toString()
      : collectData.cost?.landfillDelivery?.toString();

  const defaultValues = {
    kmRun: collectData.kmRun?.toString() ?? "0",
    mass: collectData.mass?.toString(),
    landfillDelivery: defaultLandfillDelivery ?? "0",
    fuel: collectData.cost?.fuel?.toString() ?? "0",
    consume: collectData?.consume?.toString() ?? "0",
    emission: collectData.emission?.toString() ?? "0"
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = useForm<EditCollectForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(EditCollectDataSchema),
    values: defaultValues
  });

  const [isEdit, setIsEdit] = useState(false);

  const mutationUpdate = useMutation(
    async (data: EditCollectForm) => {
      const newCollectData: Partial<CollectEntity> = {
        cost: {
          landfillDelivery: parseFloat(data.landfillDelivery),
          fuel: parseFloat(data.fuel)
        },
        mass: parseFloat(data.mass),
        emission: parseFloat(data.emission),
        consume: parseFloat(data.consume)
      };

      return updateCollect(collectData?.id, newCollectData);
    },
    {
      onSuccess: () => {
        successToast("Atualização da coleta feita com sucesso!");
        queryClient.invalidateQueries(["collects", collectData.routeId]);
        queryClient.invalidateQueries(["collects", collectData.cityId]);
        queryClient.invalidateQueries(["dashboard", collectData.cityId]);
        queryClient.invalidateQueries([
          "dashboard",
          collectData.cityId,
          collectData.routeId
        ]);
        setIsEdit(false);
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Não foi possível atualizar a coleta.");
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const handleUpdateRoute = async (data: EditCollectForm) => {
    if (data.mass.trim() === "0") {
      errorToast("Insira um valor pra massa!");
      return;
    }
    setLoading(true);
    // O erro já é exibido em onError.
    await mutationUpdate.mutateAsync(data).catch(() => undefined);
  };

  return (
    <>
      <form
        className="space-y-8 p-5"
        onSubmit={handleSubmit(handleUpdateRoute)}
      >
        <div className="flex gap-4">
          <Subtitle className="text-[20px]">Dados da coleta</Subtitle>
          {collectData.mass?.toString() && (
            <MdEdit
              color="#004A55"
              size={20}
              className="cursor-pointer opacity-70 transition-all hover:scale-[103%] hover:opacity-100"
              onClick={() => {
                if (isEdit) {
                  reset();
                }
                setIsEdit((prev) => !prev);
              }}
            />
          )}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <LateralInputField
            label={<>Km rodados (km)</>}
            name="kmRun"
            placeholder=""
            formRegister={register}
            className="w-[100px] text-center"
            disabled={true}
          />
          {collectData.mass?.toString() && (
            <LateralInputField
              label={
                <>
                  Custo de entrega <br /> no aterro (R$/ton)
                </>
              }
              name="landfillDelivery"
              placeholder=""
              className="w-[100px] text-center"
              disabled={collectData.mass?.toString() ? !isEdit : false}
              formRegister={register}
              formErrors={errors}
            />
          )}
          {collectData.mass?.toString() && (
            <LateralInputField
              label={
                <>
                  Custo de <br /> combustível (R$/L)
                </>
              }
              name="fuel"
              placeholder=""
              className="w-[100px] text-center"
              disabled={collectData.mass?.toString() ? !isEdit : false}
              formRegister={register}
              formErrors={errors}
            />
          )}
          <div className="relative">
            <span
              className={`absolute -top-5 left-[125px] text-[10px] text-greenDark-1000/80 ${
                (collectData.mass?.toString() || !isAdmin) && "hidden"
              }`}
            >
              Não preenchido pela prefeitura
            </span>
            <LateralInputField
              label={<>Massa coletada (ton)</>}
              name="mass"
              placeholder=""
              className={`w-[100px] text-center ${
                !collectData.mass && "border-[1.5px] border-error"
              }`}
              disabled={collectData.mass?.toString() ? !isEdit : false}
              formRegister={register}
              formErrors={errors}
            />
          </div>
          {collectData.mass?.toString() && (
            <LateralInputField
              label={
                <>
                  Consumo <br />
                  específico (L/km)
                </>
              }
              name="consume"
              placeholder=""
              className="w-[100px] text-center"
              disabled={!isAdmin || !isEdit}
              formRegister={register}
              formErrors={errors}
            />
          )}
          {collectData.mass?.toString() && (
            <LateralInputField
              label={
                <>
                  Emissão <br />
                  específica (kgCO2eq/L)
                </>
              }
              name="emission"
              placeholder=""
              className="w-[100px] text-center"
              disabled={!isAdmin || !isEdit}
              formRegister={register}
              formErrors={errors}
            />
          )}
          {!collectData.mass?.toString() && !isEdit && (
            <Button className="h-fit w-fit" loading={loading}>
              Finalizar
            </Button>
          )}
          <span
            className={`w-full ${
              !isEdit ? "hidden" : "flex"
            } items-center justify-between`}
          >
            <Button className="w-fit" buttonType="submit" loading={loading}>
              Editar rota
            </Button>
          </span>
        </div>
      </form>
      <CollectBiomassSection
        collectId={collectData.id}
        cityId={collectData.cityId}
        hasEnded={collectData.hasEnded}
      />
    </>
  );
};

export default AddCollectData;
