"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { successToast, errorToast } from "@/hooks/useAppToast";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import { wrapper } from "@/common/constants/wrapper";
import {
  RESIDUE_TYPE_LABELS,
  getResidueTypeLabel,
} from "@/common/mappers/backendEnums";

import usePaginatedEcopontos from "@/hooks/queries/ecoponto/usePaginatedEcopontos";
import useDeleteEcoponto from "@/hooks/queries/ecoponto/useDeleteEcoponto";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import LoadingComponent from "@atoms/Loading/loading";
import Input from "@atoms/Input/input";
import EcopontoDetail from "@/components/molecules/EcopontoDetail/EcopontoDetail";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";

const PAGE_SIZE = 10;

const residuesTypesOptions = Object.entries(RESIDUE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedResidueType =
    filter === "Todos"
      ? undefined
      : residuesTypesOptions.find((item) => item.label === filter)?.value;

  const filters = useMemo(
    () => ({
      name: nameFilter,
      residueType: selectedResidueType,
    }),
    [nameFilter, selectedResidueType],
  );

  const { data: ecopointsPage, isLoading } = usePaginatedEcopontos(
    cityId,
    page,
    PAGE_SIZE,
    filters,
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
      },
    });
  }

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-14 flex items-center justify-between">
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
            className="w-72"
          />

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex h-11 w-64 items-center justify-between rounded-lg border border-greenBlue-800 bg-greenBebe-200 px-4 py-2 text-greenBlue-1000"
            >
              {filter === "Todos" ? "Todos os tipos" : filter}
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 rounded-lg border border-greenBlue-800 bg-white-1000 shadow-md">
                <p
                  className={`cursor-pointer px-4 py-2 hover:bg-greenBebe-200 ${
                    filter === "Todos"
                      ? "font-semibold text-greenBlue-1000"
                      : "text-greenDark-800"
                  }`}
                  onClick={() => {
                    setFilter("Todos");
                    setIsDropdownOpen(false);
                  }}
                >
                  Todos
                </p>

                {residuesTypesOptions.map((item) => (
                  <p
                    key={item.value}
                    onClick={() => {
                      setFilter(item.label);
                      setIsDropdownOpen(false);
                    }}
                    className={`cursor-pointer px-4 py-2 hover:bg-greenBebe-200 ${
                      filter === item.label
                        ? "font-semibold text-greenBlue-1000"
                        : "text-greenDark-800"
                    }`}
                  >
                    {item.label}
                  </p>
                ))}
              </div>
            )}
          </div>
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
                  answer: point.description || "N/A",
                },
                {
                  prop: "Tipos de residuos",
                  answer: point.residueType.map(getResidueTypeLabel).join(", "),
                },
              ],
              children: (
                <EcopontoDetail ecoponto={point} onDelete={handleDelete} />
              ),
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
