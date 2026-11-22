"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import LoadingComponent from "@atoms/Loading/loading";
import Input from "@atoms/Input/input";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import { wrapper } from "@/common/constants/wrapper";
import usePaginatedCities from "@/hooks/queries/usePaginatedCities";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { UserEntity } from "@/common/entities/user";
import { deleteUser } from "@/store/services/user";
import { queryClient } from "@/store/providers/queryClient";
import { hasPermission } from "@/common/accessControl/permissions";

const Municipios = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const {
    data: citiesPage,
    isLoading: isLoadingCities,
    isFetching
  } = usePaginatedCities(page, 10, { name });
  const cities = citiesPage?.content ?? [];
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickedCity, setClickedCity] = useState<UserEntity>();

  React.useEffect(() => {
    setPage(0);
  }, [name]);

  const mutationDelete = useMutation(
    async (data: UserEntity) => {
      // Um único DELETE /user/{id}; a imagem fica no storage do backend.
      await deleteUser(data.id);
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
    mutationDelete.mutate(data);
  };

  const canCreateCity = hasPermission(user, "CITY_CREATE");
  const canUpdateCity = hasPermission(user, "CITY_UPDATE");
  const canDeleteCity = hasPermission(user, "USER_DELETE");

  return (
    <section style={wrapper} className="space-y-[64px] pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Title>Municípios</Title>
        {canCreateCity && (
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
        )}
      </div>
      <Input
        name="cityName"
        placeholder="Buscar por nome do municipio"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="max-w-md"
      />
      {loading || isLoadingCities ? (
        <div className="flex h-[200px] items-center">
          <LoadingComponent />
        </div>
      ) : (
        cities.map((city) => (
          <div
            className="flex flex-col gap-6 rounded-[8px] border border-greenBlue-600 px-4 py-6 lg:flex-row lg:items-center lg:justify-between"
            key={city.id}
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-16">
              <Image
                src={city.image ?? "/random-img.png"}
                width={300}
                height={90}
                alt="Imagem do município"
                className="h-[70px] w-[200px] object-contain object-left sm:h-[90px] sm:w-[300px]"
                unoptimized
              />
              <p className="text-[20px] font-medium text-greenBlue-1000">
                {city.name}
              </p>
            </div>
            <div className="flex items-start justify-between gap-3 lg:items-center">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-3 lg:w-[700px] lg:flex-none lg:gap-0">
                <div className="flex flex-col gap-1 overflow-hidden lg:gap-6">
                  <span className="font-medium">Login</span>
                  <span className="text-[14px]">
                    {" "}
                    {city.email?.slice(0, 18)}
                    {city.email && city.email.length > 18 && "..."}
                  </span>
                </div>
                <div className="flex flex-col gap-1 overflow-hidden lg:gap-6">
                  <span className="font-medium">Facilitador</span>
                  <span className="text-[14px]">
                    {" "}
                    {city.facilitatorName?.slice(0, 18)}
                    {city.facilitatorName &&
                      city.facilitatorName.length > 18 &&
                      "..."}
                  </span>
                </div>
                <div className="flex flex-col gap-1 overflow-hidden lg:gap-6">
                  <span className="font-medium">Email de contato</span>
                  <span className="text-[14px]">
                    {city.supportEmail?.slice(0, 18)}
                    {city.supportEmail &&
                      city.supportEmail.length > 18 &&
                      "..."}
                  </span>
                </div>
              </div>
              {(canUpdateCity || canDeleteCity) && (
                <MoreDropdown
                  options={[
                    ...(canUpdateCity
                      ? [
                          {
                            label: "Editar",
                            onClick: () => {
                              router.push(
                                `/municipios/cadastrar?id=${city.id}`
                              );
                            }
                          }
                        ]
                      : []),
                    ...(canDeleteCity
                      ? [
                          {
                            label: "Excluir",
                            onClick: () => {
                              setOpenDeleteModal(true);
                              setClickedCity(city);
                            }
                          }
                        ]
                      : [])
                  ]}
                />
              )}
            </div>
          </div>
        ))
      )}
      {!isLoadingCities && cities.length === 0 && (
        <p className="text-center text-sm">
          Não há cidades cadastradas ainda ...
        </p>
      )}
      <PaginationControls
        page={page}
        totalPages={citiesPage?.totalPages}
        isLoading={isFetching}
        onPageChange={setPage}
      />
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
