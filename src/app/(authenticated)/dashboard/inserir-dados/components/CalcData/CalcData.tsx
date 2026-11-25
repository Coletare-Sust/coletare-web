"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Subtitle from "@atoms/Subtitle/subtitle";
import LateralInputField from "@molecules/LateralInputField/LateralInputField";
import DatePicker from "@molecules/DatePicker/datePicker";
import useCity from "@/hooks/queries/useCity";
import CalcDataSchema from "@/validations/calcData";
import { CalcDataProps } from "./types";

type CalcDataForm = z.infer<typeof CalcDataSchema>;

/**
 * Somente leitura: o backend ainda não tem endpoint para atualizar os dados de cálculo da
 * cidade (PUT /user/{id} ignora calcData), então não oferecemos uma edição que não salva.
 */
const CalcData = ({ cityId }: CalcDataProps) => {
  const { data: city } = useCity(cityId);
  const [date, setDate] = useState<Date | undefined>();

  const {
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

  useEffect(() => {
    if (city?.calcData?.initialDate) {
      setDate(new Date(city?.calcData?.initialDate.seconds * 1000));
    }
    reset({
      fuel: (city?.calcData?.fuel ?? 0).toString(),
      landfillDelivery: (city?.calcData?.landfillDelivery ?? 0).toString()
    });
  }, [city, reset]);

  return (
    <form className="space-y-12 rounded-lg bg-white-800 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-12">
          <Subtitle className="text-[28px]">Dados para cálculo</Subtitle>
          <DatePicker
            disabled
            date={date}
            setDate={setDate}
            className="text-base"
            classNameButton="opacity-50 cursor-not-allowed pointer-events-none"
          />
        </div>
        <p className="max-w-xs text-right text-sm text-greenDark-800">
          A atualização destes valores ainda não está disponível no painel.
        </p>
      </div>
      <div className="mt-4 flex gap-12">
        <LateralInputField
          label={
            <>
              Custo de entrega <br /> no aterro (R$/ton)
            </>
          }
          placeholder="Digite um valor"
          className="w-full text-center sm:w-[150px]"
          formErrorLabelClassName="self-end"
          name="landfillDelivery"
          formRegister={register}
          formErrors={errors}
          disabled
        />
        <LateralInputField
          label={
            <>
              Custo de <br /> combustível (R$/L)
            </>
          }
          placeholder="Digite um valor"
          className="w-full text-center sm:w-[150px]"
          formErrorLabelClassName="self-end"
          name="fuel"
          formRegister={register}
          formErrors={errors}
          disabled
        />
      </div>
    </form>
  );
};

export default CalcData;
