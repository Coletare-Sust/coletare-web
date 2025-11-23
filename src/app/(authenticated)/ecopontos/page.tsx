"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { successToast, errorToast } from "@/hooks/useAppToast";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import { wrapper } from "@/common/constants/wrapper";

import useAllEcopontos from "@/hooks/queries/ecoponto/useAllEcopontos";
import useDeleteEcoponto from "@/hooks/queries/ecoponto/useDeleteEcoponto";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import LoadingComponent from "@atoms/Loading/loading";

const residuesTypesOptions = [
  "Recicláveis",
  "Orgânicos",
  "Especiais",
  "Resíduo Comum"
];

const EcopontosPage = () => {
  const router = useRouter();

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;

  const { data: ecopoints, isLoading } = useAllEcopontos(cityId);

  const { mutateAsync: deletePoint } = useDeleteEcoponto(cityId);

  const [filter, setFilter] = useState("Todos");
  const [openItem, setOpenItem] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredPoints =
    ecopoints?.filter((point) => {
      if (filter === "Todos") return true;
      return point.residueType.includes(filter);
    }) ?? [];

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este ecoponto?")) return;

    deletePoint(id, {
      onSuccess: () => {
        successToast("Ecoponto excluído com sucesso!");
      },
      onError: (err: any) => {
        errorToast(err?.message || "Erro ao excluir ecoponto.");
      }
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
            alt="ícone"
            width={26}
            height={26}
          />
          Criar novo ecoponto
        </Button>
      </div>

      <div className="relative mb-14">
        <p className="mb-2 font-medium text-greenDark-800">
          Filtrar por tipo de resíduo:
        </p>

        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex w-64 items-center justify-between rounded-lg border border-greenBlue-800 bg-greenBebe-200 px-4 py-2 text-greenBlue-1000"
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
                key={item}
                onClick={() => {
                  setFilter(item);
                  setIsDropdownOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 hover:bg-greenBebe-200 ${
                  filter === item
                    ? "font-semibold text-greenBlue-1000"
                    : "text-greenDark-800"
                }`}
              >
                {item}
              </p>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : filteredPoints.length === 0 ? (
        <p className="text-lg font-medium text-greenDark-800">
          Nenhum ecoponto encontrado para este município.
        </p>
      ) : (
        <AccordionChildren
          openItem={openItem}
          setOpenItem={setOpenItem}
          items={filteredPoints.map((point) => ({
            title: point.name,
            properties: [
              {
                prop: "Detalhes/Endereço",
                answer: point.description || "N/A"
              },
              {
                prop: "Tipos de resíduos",
                answer: point.residueType.join(", ")
              }
            ],
            children: (
              <div className="text-greenDark-800">
                <p>
                  <strong>Latitude:</strong> {point.lat}
                </p>
                <p>
                  <strong>Longitude:</strong> {point.lng}
                </p>

                <div className="mt-6 flex gap-4">
                  <Button
                    className="flex items-center gap-2 border border-greenDark-1000 bg-greenBebe-400 px-6 py-2"
                    classNameText="text-greenDark-1000"
                    onClick={() =>
                      router.push(
                        `/ecopontos/criar-ecoponto?isEdit=true&ecopontoId=${point.id}`
                      )
                    }
                  >
                    Editar ecoponto
                  </Button>

                  <Button
                    className="flex items-center gap-2 border border-greenDark-1000 px-6 py-2"
                    classNameText="text-white"
                    onClick={() => handleDelete(point.id)}
                  >
                    Excluir ecoponto
                  </Button>
                </div>
              </div>
            )
          }))}
          itemClassName="mb-10"
          triggerClassName="bg-white-1000 border border-greenBlue-400 py-4 grid grid-cols-[1fr_1fr_1fr_auto]"
          contentClassName="bg-white-800 border border-greenBlue-400 py-8 px-6 rounded-lg"
        />
      )}
    </div>
  );
};

export default EcopontosPage;
