"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { dateToTimestamp } from "@/common/entities/timestamp";
import Subtitle from "@atoms/Subtitle/subtitle";
import Button from "@atoms/Button/button";
import LateralInputField from "@molecules/LateralInputField/LateralInputField";
import DatePicker from "@molecules/DatePicker/datePicker";
import useCity from "@/hooks/queries/useCity";
import { successToast } from "@/hooks/useAppToast";
import CalcDataSchema from "@/validations/calcData";
import { updateUser } from "@/store/services/user";
import { queryClient } from "@/store/providers/queryClient";
import { CalcDataProps } from "./types";

type CalcDataForm = z.infer<typeof CalcDataSchema>;

const CalcData = ({ cityId }: CalcDataProps) => {
  const currentDate = new Date();
  const [isMainEditOpen, setIsMainEditOpen] = useState(false);
  const { data: city } = useCity(cityId);
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = useForm<CalcDataForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(CalcDataSchema),
    defaultValues: {
      fuel: (city?.calcData?.fuel ?? 0).toString(),
      landfillDelivery: (city?.calcData?.landfillDelivery ?? 0).toString()
    }
  });

  const mutationUpdate = useMutation(
    (data: CalcDataForm) => {
      return updateUser(city?.id as string, {
        calcData: {
          fuel: parseFloat(data.fuel),
          landfillDelivery: parseFloat(data.landfillDelivery),
          initialDate: dateToTimestamp(currentDate)
        }
      });
    },
    {
      onSuccess: () => {
        successToast("Dados atualizados com sucesso!");
        setDate(currentDate);
        queryClient.invalidateQueries(["city", city?.id]);
      },
      onSettled: () => {
        setLoading(false);
        setIsMainEditOpen(false);
      }
    }
  );

  const handleUpdate = async (data: CalcDataForm) => {
    setLoading(true);
    await mutationUpdate.mutateAsync(data);
  };

  useEffect(() => {
    if (city?.calcData?.initialDate) {
      setDate(new Date(city?.calcData?.initialDate.seconds * 1000));
    }
  }, [city]);

  return (
    <form
      className="space-y-12 rounded-lg bg-white-800 p-8"
      onSubmit={handleSubmit(handleUpdate)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Subtitle className="text-[28px]">Dados para cálculo</Subtitle>
          <DatePicker
            disabled
            date={date}
            setDate={setDate}
            className="text-base"
            classNameButton={`${
              !isMainEditOpen &&
              "opacity-50 cursor-not-allowed pointer-events-none"
            }`}
          />
        </div>
        {!isMainEditOpen ? (
          <Button onClick={() => setIsMainEditOpen(true)} buttonType="button">
            Atualize Valores
          </Button>
        ) : (
          <Image
            src="/icon-x.svg"
            width={32}
            height={32}
            alt="Ícone de fechar"
            className="cursor-pointer opacity-70 hover:scale-[103%] hover:opacity-100"
            onClick={() => {
              setIsMainEditOpen(false);
              reset();
            }}
          />
        )}
      </div>
      <div className="mt-4 flex gap-12">
        <LateralInputField
          label={
            <>
              Custo de entrega <br /> no aterro (R$/ton)
            </>
          }
          placeholder="Digite um valor"
          className="w-[150px] text-center"
          formErrorLabelClassName="self-end"
          name="landfillDelivery"
          formRegister={register}
          formErrors={errors}
          disabled={!isMainEditOpen}
        />
        <LateralInputField
          label={
            <>
              Custo de <br /> combustível (R$/L)
            </>
          }
          placeholder="Digite um valor"
          className="w-[150px] text-center"
          formErrorLabelClassName="self-end"
          name="fuel"
          formRegister={register}
          formErrors={errors}
          disabled={!isMainEditOpen}
        />
      </div>
      {isMainEditOpen && (
        <span className="flex w-full justify-end">
          <Button className="px-8" loading={loading}>
            Concluir
          </Button>
        </span>
      )}
    </form>
  );
};

export default CalcData;
