"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Error from "next/error";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import LoadingComponent from "@atoms/Loading/loading";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import { wrapper } from "@/common/constants/wrapper";
import useAllCities from "@/hooks/queries/useAllCities";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";
import { UserEntity } from "@/common/entities/user";
import { deleteUser } from "@/store/services/user";
import { queryClient } from "@/store/providers/queryClient";
import { deleteImage } from "@/store/services/firebaseStorage";

const Municipios = () => {
  const router = useRouter();
  const { deleteUserAuth } = useAuth();
  const { data: cities } = useAllCities();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickedCity, setClickedCity] = useState<UserEntity>();

  const mutationDelete = useMutation(
    async (data: UserEntity) => {
      const { error: errorUser } = await deleteUser(data.id);
      if (errorUser) {
        throw new Error(errorUser);
      }
      const { error: errorAuth } = await deleteUserAuth(data.id);
      if (errorAuth) {
        throw new Error(errorUser);
      }
      const { error: errorDeleteImage } = await deleteImage(data.image);
      if (errorDeleteImage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(errorDeleteImage as any);
      }
    },
    {
      onSuccess: () => {
        successToast("Município excluído com sucesso!");
        queryClient.invalidateQueries(["cities"]);
      },
      onError: () => {
        errorToast("Não foi possível excluir o município");
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const handleDelete = async (data: UserEntity | undefined) => {
    setOpenDeleteModal(false);
    if (!data) return;
    setLoading(true);
    await mutationDelete.mutateAsync(data);
  };

  return (
    <section style={wrapper} className="space-y-[64px] pb-16">
      <div className="flex items-center justify-between">
        <Title>Municípios</Title>
        <Button onClick={() => router.push("/municipios/cadastrar")}>
          <div className="flex items-center gap-2">
            <Image
              src="/icon-plus-white.svg"
              width={22}
              height={22}
              alt="Icone de Adicionar"
            />
            <span>Cadastrar Novo</span>
          </div>
        </Button>
      </div>
      {loading ? (
        <div className="flex h-[200px] items-center">
          <LoadingComponent />
        </div>
      ) : (
        cities?.map((city, key) => (
          <div
            className="flex items-center justify-between rounded-[8px] border border-greenBlue-600 px-4 py-6"
            key={key}
          >
            <div className="flex items-center gap-16">
              <Image
                src={city.image ?? "/random-img.png"}
                width={300}
                height={90}
                alt="Imagem do município"
                className="h-[90px] w-[300px] object-contain"
                unoptimized
              />
              <p className="text-[20px] font-medium text-greenBlue-1000">
                {city.name}
              </p>
            </div>
            <div className="flex items-center">
              <div className="grid w-[700px] grid-cols-3">
                <div className="flex flex-col gap-6 overflow-hidden">
                  <span className="font-medium">Login</span>
                  <span className="text-[14px]">
                    {" "}
                    {city.email?.slice(0, 18)}
                    {city.email && city.email.length > 18 && "..."}
                  </span>
                </div>
                <div className="flex flex-col gap-6 overflow-hidden">
                  <span className="font-medium">Facilitador</span>
                  <span className="text-[14px]">
                    {" "}
                    {city.facilitatorName?.slice(0, 18)}
                    {city.facilitatorName &&
                      city.facilitatorName.length > 18 &&
                      "..."}
                  </span>
                </div>
                <div className="flex flex-col gap-6 overflow-hidden">
                  <span className="font-medium">Email de contato</span>
                  <span className="text-[14px]">
                    {city.supportEmail?.slice(0, 18)}
                    {city.supportEmail &&
                      city.supportEmail.length > 18 &&
                      "..."}
                  </span>
                </div>
              </div>
              <MoreDropdown
                options={[
                  {
                    label: "Editar",
                    onClick: () => {
                      router.push(`/municipios/cadastrar?id=${city.id}`);
                    }
                  },
                  {
                    label: "Excluir",
                    onClick: () => {
                      setOpenDeleteModal(true);
                      setClickedCity(city);
                    }
                  }
                ]}
              />
            </div>
          </div>
        ))
      )}
      {(!cities || cities?.length === 0) && (
        <p className="text-center text-sm">
          Não há cidades cadastradas ainda ...
        </p>
      )}
      <ConfirmationModal
        title="Excluir município"
        description="Tem certeza de deseja excluir esse município? Todos os dados relativos a ele serão excluídos e não poderão ser recuperados."
        isOpen={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onConfirm={() => handleDelete(clickedCity)}
      />
    </section>
  );
};

export default Municipios;
