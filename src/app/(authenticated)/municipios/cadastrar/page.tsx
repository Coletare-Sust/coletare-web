"use client";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import EcopontoAddressInput from "@/components/atoms/EcopontoAddressInput/EcopontoAddressInput";

import Title from "@atoms/Title/title";
import Button from "@atoms/Button/button";
import LoadingComponent from "@atoms/Loading/loading";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";
import InputField from "@molecules/InputField/inputField";
import AddCitySchema from "@/validations/AddCity";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useCity from "@/hooks/queries/useCity";
import { wrapper } from "@/common/constants/wrapper";
import { createUser, updateUser } from "@/store/services/user";
import { queryClient } from "@/store/providers/queryClient";
import { ColorsOptions } from "@/common/entities/colors";

import { colors, inputsData } from "./constants";
import Radio from "@/components/atoms/Radio/Radio";

type AddCityForm = z.infer<typeof AddCitySchema>;

const Cadastrar = () => {
  const statusOptions = [
    { id: "ativo", text: "Ativo", value: "Ativo" },
    { id: "inativo", text: "Inativo", value: "Inativo" }
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const toEditCityId = searchParams.get("id");

  const { data: city, isLoading: isLoadingCities } = useCity(toEditCityId);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<AddCityForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(AddCitySchema),
    values: city
      ? {
          name: city?.name ?? "",
          password: "asdfasdf1" ?? "",
          facilitatorName: city?.facilitatorName ?? "",
          email: city?.email ?? "",
          supportEmail: city?.supportEmail ?? "",
          landfillDelivery: city?.calcData?.landfillDelivery?.toString() ?? "",
          fuel: city?.calcData?.fuel?.toString() ?? "",
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          status: city.status!
        }
      : undefined
  });
  const [color, setColor] = useState<ColorsOptions>();
  const [image, setImage] = useState<string>();
  const [imageFile, setImageFile] = useState<File>();
  const [fullAddress, setFullAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const downloadInput = useRef<HTMLInputElement | null>(null);

  const mutationCreate = useMutation(
    async ({
      data,
      color,
      imageFile,
      fullAddress,
      latitude,
      longitude
    }: {
      data: AddCityForm;
      color: ColorsOptions;
      imageFile: File;
      fullAddress: string;
      latitude: number | null;
      longitude: number | null;
    }) => {
      await createUser(
        {
          name: data.name,
          role: "admin",
          email: data.email,
          image: null,
          supportEmail: data.supportEmail,
          facilitatorName: data.facilitatorName,
          color,
          consume: null,
          emission: null,
          carPlate: null,
          cpf: null,
          fullAddress: fullAddress || null,
          latitude: latitude || null,
          longitude: longitude || null,
          calcData: {
            initialDate: null as any,
            landfillDelivery: parseFloat(data.landfillDelivery),
            fuel: parseFloat(data.fuel)
          },
          status: data.status,
          // password é acessado via (data as any).password no createUser
          ...(data as any)
        } as any,
        imageFile
      );
    },
    {
      onSuccess: () => {
        successToast("Município cadastrado com sucesso!");
        queryClient.invalidateQueries(["cities"]);
        reset();
        router.push("/municipios");
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Não foi possível cadastrar o município.");
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  // PUT /user/{id} (UpdateUserInput) só altera nome e e-mail de uma cidade; o backend ainda
  // não tem endpoint para imagem, cor, endereço, status, facilitador ou dados de cálculo.
  const mutationUpdate = useMutation(
    async ({ data }: { data: AddCityForm }) => {
      await updateUser(toEditCityId as string, { name: data.name });
    },
    {
      onSuccess: () => {
        successToast("Nome do município atualizado com sucesso!");
        queryClient.invalidateQueries(["cities"]);
        queryClient.invalidateQueries(["city", toEditCityId]);
        router.back();
        setImageFile(undefined);
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Não foi possível editar o município.");
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const handleForm = async (data: AddCityForm, type: "create" | "edit") => {
    setLoading(true);
    if (!color) {
      errorToast("Escolha uma cor");
      setLoading(false);
      return;
    }
    if (type === "create" && !imageFile) {
      errorToast("Escolha uma imagem");
      setLoading(false);
      return;
    }
    if (type === "create" && imageFile) {
      mutationCreate.mutate({
        data,
        color,
        imageFile,
        fullAddress,
        latitude,
        longitude
      });
    }
    if (type === "edit") {
      mutationUpdate.mutate({ data });
    }
  };

  useEffect(() => {
    if (city) {
      setColor(city.color as ColorsOptions);
      setImage(city.image as string);
      setFullAddress(city.fullAddress || "");
      setLatitude(city.latitude || null);
      setLongitude(city.longitude || null);
    }
  }, [city]);

  return (
    <section style={wrapper} className="space-y-[32px] ">
      <Title>
        <div
          className="flex cursor-pointer items-center gap-2 text-greenDark-1000 hover:underline"
          onClick={() => router.back()}
        >
          <ChevronLeft size={32} />
          {city ? "Editar município" : "Cadastrar novo município"}
        </div>
      </Title>
      <BackgroundWrapper>
        {toEditCityId && isLoadingCities ? (
          <div className="flex h-[300px] items-center">
            <LoadingComponent size={40} />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((data) =>
              handleForm(data, city ? "edit" : "create")
            )}
            className="flex flex-col items-center justify-center gap-8"
          >
            <div className="flex w-full max-w-[724px] flex-col items-center gap-8 md:flex-row md:justify-between">
              <div className="w-full space-y-[64px] md:w-1/2">
                <div className="relative flex flex-col items-center gap-8">
                  <Image
                    src={image ?? "/random-img.svg"}
                    width={200}
                    height={200}
                    alt="Imagem do município"
                    unoptimized
                  />

                  <Button
                    className="relative"
                    buttonType="button"
                    onClick={() => downloadInput.current?.click()}
                  >
                    Escolher imagem
                    <input
                      ref={downloadInput}
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImage(URL.createObjectURL(e.target.files[0]));
                          setImageFile(e.target.files[0]);
                        }
                      }}
                      className="absolute left-0 top-0 hidden h-full w-full"
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <p> Definir cor para o município </p>
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map((item, key) => (
                      <div
                        key={key}
                        className={`rounded-md border-2 ${
                          color === item.name
                            ? " border-black/40"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          onClick={() => setColor(item.name)}
                          style={{ backgroundColor: item.hex }}
                          className={`m-[2px] h-[46px] w-[46px] cursor-pointer rounded-md`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full space-y-8 md:w-1/2">
                {(city
                  ? inputsData.filter(
                      (item) =>
                        item.name !== "email" && item.name !== "password"
                    )
                  : inputsData
                ).map((item, index) => {
                  if (item.name === "status") {
                    return (
                      <div key={index} className="space-y-6">
                        <EcopontoAddressInput
                          label="Endereço do Município / Buscar Local"
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                          onLocationSelect={(lat, lng, address) => {
                            setLatitude(lat);
                            setLongitude(lng);
                            setFullAddress(address);
                          }}
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Status
                          </p>
                          <Radio
                            value={watch("status")}
                            onValueChange={(value) => setValue("status", value)}
                            options={statusOptions}
                          />
                          {errors.status && (
                            <span className="text-sm text-red-500">
                              {errors.status.message?.toString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <InputField
                      key={index}
                      label={item.label}
                      name={item.name}
                      placeholder=""
                      type={item.label === "Senha" ? "password" : "text"}
                      formRegister={register}
                      formErrors={errors}
                    />
                  );
                })}
              </div>
            </div>
            {city && (
              <p className="max-w-[724px] text-center text-sm text-greenDark-800">
                Por enquanto a edição salva apenas o nome do município. Imagem,
                cor, endereço, status, facilitador e custos ainda não podem ser
                alterados por aqui.
              </p>
            )}
            <Button loading={loading}>{city ? "Editar" : "Cadastrar"}</Button>
          </form>
        )}
      </BackgroundWrapper>
    </section>
  );
};

export default Cadastrar;
