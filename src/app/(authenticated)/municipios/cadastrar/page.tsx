"use client";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Error from "next/error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import EcopontoAddressInput from "@/components/atoms/EcopontoAddressInput/EcopontoAddressInput";

import Title from "@atoms/Title/title";
import Button from "@atoms/Button/button";
import LoadingComponent from "@atoms/Loading/loading";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";
import InputField from "@molecules/InputField/inputField";
import AddCitySchema from "@/validations/AddCity";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";
import useCity from "@/hooks/queries/useCity";
import { wrapper } from "@/common/constants/wrapper";
import { createUser, updateUser } from "@/store/services/user";
import { deleteImage, uploadImage } from "@/store/services/firebaseStorage";
import { queryClient } from "@/store/providers/queryClient";
import { ColorsOptions } from "@/common/entities/colors";
import { sendEmail } from "@/store/services/email";

import { colors, inputsData } from "./constants";
import Radio from "@/components/atoms/Radio/Radio";

type AddCityForm = z.infer<typeof AddCitySchema>;

const Cadastrar = () => {
  const statusOptions = [
    { id: "ativo", text: "Ativo", value: "Ativo" },
    { id: "inativo", text: "Inativo", value: "Inativo" }
  ];
  const router = useRouter();
  const currentDate = new Date();
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
  const { createUserAuth } = useAuth();

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
      const { uid: authUid, error: errorAuth } = await createUserAuth(
        data.email,
        data.password
      );

      if (errorAuth || !authUid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(errorAuth as any).props;
      }

      const { error: errorUser } = await createUser(
        {
          id: authUid,
          name: data.name,
          role: "admin",
          email: data.email,
          image: null,
          supportEmail: data.supportEmail,
          cityId: authUid,
          facilitatorName: data.facilitatorName,
          color,
          consume: null,
          emission: null,
          carPlate: null,
          cpf: null,
          fullAddress: fullAddress || null,
          latitude: latitude || null,
          longitude: longitude || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          calcData: {
            initialDate: Timestamp.fromDate(currentDate),
            landfillDelivery: parseFloat(data.landfillDelivery),
            fuel: parseFloat(data.fuel)
          },
          status: data.status
        },
        imageFile
      );

      if (errorUser) {
        throw new Error(errorUser).props;
      }

      const { error: errorEmail } = await sendEmail({
        email: data.email,
        subject: `Olá, cidade de ${data.name}! Seu acesso para a plataforma Coletare é:`,
        html: `
          <p>Email: ${data.email}</p>
          <p>Senha: ${data.password}</p>
        `
      });

      if (errorEmail) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(errorEmail as any).props;
      }
    },
    {
      onSuccess: () => {
        successToast("Município cadastrado com sucesso!");
        queryClient.invalidateQueries(["cities"]);
        reset();
        router.push("/municipios");
      },
      onError: (err: string) => {
        errorToast(err ?? "Não foi possível cadastrar o município.");
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const mutationUpdate = useMutation(
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
      imageFile: File | undefined;
      fullAddress: string;
      latitude: number | null;
      longitude: number | null;
    }) => {
      const objToUpdate = {
        name: data.name,
        facilitatorName: data.facilitatorName,
        color,
        supportEmail: data.supportEmail,
        fullAddress: fullAddress || null,
        latitude: latitude || null,
        longitude: longitude || null,
        calcData: {
          initialDate: Timestamp.fromDate(currentDate),
          landfillDelivery: parseFloat(data.landfillDelivery),
          fuel: parseFloat(data.fuel)
        },
        status: data.status
      };

      if (imageFile) {
        const { error: errorDelete } = await deleteImage(city?.image);
        if (errorDelete) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(errorDelete as any).props;
        }

        const { image: imageUrl, error: errorUpload } =
          await uploadImage(imageFile);
        if (errorUpload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(errorUpload as any).props;
        }

        const { error: errorUpdate } = await updateUser(
          toEditCityId as string,
          { ...objToUpdate, image: imageUrl }
        );
        if (errorUpdate) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(errorUpdate as any).props;
        }
      } else {
        const { error: errorUpdate } = await updateUser(
          toEditCityId as string,
          objToUpdate
        );
        if (errorUpdate) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(errorUpdate as any).props;
        }
      }
    },
    {
      onSuccess: () => {
        successToast("Município editado com sucesso!");
        queryClient.invalidateQueries(["cities"]);
        queryClient.invalidateQueries(["city", toEditCityId]);
        router.back();
        setImageFile(undefined);
      },
      onError: (err: string) => {
        errorToast(err ?? "Não foi possível editar o município.");
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
      await mutationCreate.mutateAsync({
        data,
        color,
        imageFile,
        fullAddress,
        latitude,
        longitude
      });
    }
    if (type === "edit") {
      await mutationUpdate.mutateAsync({
        data,
        color,
        imageFile,
        fullAddress,
        latitude,
        longitude
      });
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
            <div className="flex w-[724px] items-center justify-between">
              <div className="w-1/2 space-y-[64px]">
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
              <div className="w-1/2 space-y-8">
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
            <Button loading={loading}>{city ? "Editar" : "Cadastrar"}</Button>
          </form>
        )}
      </BackgroundWrapper>
    </section>
  );
};

export default Cadastrar;
