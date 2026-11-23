"use client";

import Select from "@atoms/Select/select";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "@/hooks/useAppToast";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import { wrapper } from "@/common/constants/wrapper";
import {
  RESIDUE_TYPE_LABELS,
  getResidueTypeLabel
} from "@/common/mappers/backendEnums";

import usePaginatedEcopontos from "@/hooks/queries/ecoponto/usePaginatedEcopontos";
import useDeleteEcoponto from "@/hooks/queries/ecoponto/useDeleteEcoponto";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import LoadingComponent from "@atoms/Loading/loading";
import Input from "@atoms/Input/input";
import LocationDetail from "@/components/molecules/LocationDetail/LocationDetail";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";

const PAGE_SIZE = 10;

const residuesTypesOptions = Object.entries(RESIDUE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const EcopontosPage = () => {
  const router = useRouter();

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;

  const { mutateAsync: deletePoint } = useDeleteEcoponto(cityId);

  const [filter, setFilter] = useState("Todos");
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(0);
  const [openItem, setOpenItem] = useState("");

  const selectedResidueType =
    filter === "Todos"
      ? undefined
      : residuesTypesOptions.find((item) => item.label === filter)?.value;

  const filters = useMemo(
    () => ({
      name: nameFilter,
      residueType: selectedResidueType
    }),
    [nameFilter, selectedResidueType]
  );

  const { data: ecopointsPage, isLoading } = usePaginatedEcopontos(
    cityId,
    page,
    PAGE_SIZE,
    filters
  );

  const ecopoints = ecopointsPage?.content ?? [];

  useEffect(() => {
    setPage(0);
  }, [nameFilter, selectedResidueType]);

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este ecoponto?")) return;

    deletePoint(id, {
      onSuccess: () => {
        successToast("Ecoponto excluido com sucesso!");
      },
      onError: (err: any) => {
        errorToast(err?.message || "Erro ao excluir ecoponto.");
      }
    });
  }

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
        <Title>Ecopontos</Title>

        <Button
          classNameText="flex items-center gap-2"
          onClick={() => router.push("/ecopontos/criar-ecoponto")}
        >
          <Image
            src="/icon-plus-white.svg"
            alt="icone"
            width={26}
            height={26}
          />
          Criar novo ecoponto
        </Button>
      </div>

      <div className="relative mb-14">
        <p className="mb-2 font-medium text-greenDark-800">
          Filtrar ecopontos:
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <Input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Buscar por nome"
            name="nameFilter"
            className="w-full sm:w-72"
          />

          <Select
            aria-label="Filtrar por tipo de resíduo"
            className="sm:w-64"
            value={filter === "Todos" ? "" : filter}
            onChange={(value) => setFilter(value === "" ? "Todos" : value)}
            options={[
              { value: "", label: "Todos os tipos" },
              ...residuesTypesOptions.map((item) => ({
                value: item.label,
                label: item.label
              }))
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : ecopoints.length === 0 ? (
        <p className="text-lg font-medium text-greenDark-800">
          Nenhum ecoponto encontrado para este municipio.
        </p>
      ) : (
        <>
          <AccordionChildren
            openItem={openItem}
            setOpenItem={setOpenItem}
            items={ecopoints.map((point) => ({
              title: point.name,
              properties: [
                {
                  prop: "Detalhes/Endereco",
                  answer: point.description || "N/A"
                },
                {
                  prop: "Tipos de residuos",
                  answer: point.residueType.map(getResidueTypeLabel).join(", ")
                }
              ],
              children: (
                <LocationDetail
                  lat={point.lat}
                  lng={point.lng}
                  address={point.description}
                  actions={
                    <>
                      <Button
                        className="flex items-center gap-2 border border-greenBlue-800 bg-greenBebe-400 px-6 py-2 hover:bg-greenBebe-600"
                        classNameText="text-greenBlue-1000 font-semibold"
                        onClick={() =>
                          router.push(
                            `/ecopontos/criar-ecoponto?isEdit=true&ecopontoId=${point.id}`
                          )
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        className="flex items-center gap-2 border border-red-600 bg-red-500 px-6 py-2 hover:bg-red-600"
                        classNameText="text-white-900 font-semibold"
                        onClick={() => handleDelete(point.id)}
                      >
                        Excluir
                      </Button>
                    </>
                  }
                />
              )
            }))}
            itemClassName="mb-4"
            triggerClassName={`
              bg-white-1000 border border-greenBlue-400
              py-4 px-4
              grid grid-cols-[1fr_2fr_1fr_auto] gap-4 items-center
              rounded-lg
              data-[state=open]:rounded-b-none
              data-[state=open]:border-b-0
              transition-all
            `}
            contentClassName="bg-white-800 border border-greenBlue-400 border-t-0 py-8 px-6 rounded-b-lg"
          />

          <div className="mt-8">
            <PaginationControls
              page={page}
              totalPages={ecopointsPage?.totalPages ?? 0}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EcopontosPage;
