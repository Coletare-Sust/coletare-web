"use client";

import Select from "@atoms/Select/select";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AccordionChildren } from "@atoms/Accordion/accordion";
import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import usePaginatedRoutes from "@/hooks/queries/usePaginatedRoutes";
import useRoute from "@/hooks/queries/useRoute";
import { weekDays } from "@molecules/CreateRoute/constants";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { wrapper } from "@/common/constants/wrapper";
import {
  RESIDUE_TYPE_LABELS,
  getResidueTypeLabel
} from "@/common/mappers/backendEnums";
import { hasPermission } from "@/common/accessControl/permissions";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";

import RouteComponent from "./components/RouteComponent/routeComponent";

const Rotas = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = searchParams.get("city");
  const routeId = searchParams.get("value");
  const [page, setPage] = useState(0);
  const [routeName, setRouteName] = useState("");
  const [routeResidueType, setRouteResidueType] = useState("");
  const currentCityId = cityId ?? (user?.id as string);
  const pageSize = 10;
  const {
    data: routesPage,
    isLoading,
    isFetching
  } = usePaginatedRoutes(currentCityId, page, pageSize, {
    name: routeName,
    residueType: routeResidueType || undefined
  });
  const routes = routesPage?.content ?? [];
  const { data: selectedRoute } = useRoute(routeId as string);
  const displayedRoutes =
    routeId && selectedRoute && !("error" in selectedRoute)
      ? [selectedRoute]
      : routes;
  const [openItem, setOpenItem] = useState("");
  const canCreateRoute = hasPermission(user, "ROUTE_CREATE");

  useEffect(() => {
    setPage(0);
  }, [currentCityId, routeName, routeResidueType]);

  const closeItem = () => {
    setOpenItem("");
  };

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
        <Title>Todas as rotas</Title>
        {canCreateRoute && (
          <Button
            classNameText="flex items-center gap-2"
            onClick={() => router.push("/criar-rota")}
          >
            <Image
              src="/icon-plus-white.svg"
              alt="Ícone de mais"
              width={26}
              height={26}
            />
            Criar nova rota
          </Button>
        )}
      </div>
      <div className="mb-8 grid w-full max-w-[900px] grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-greenBlue-1000">
            Filtrar por nome da rota
          </label>
          <input
            className="rounded-lg border border-greenBlue-400 bg-white-1000 px-4 py-3 outline-none focus:border-greenBlue-1000"
            placeholder="Digite o nome da rota"
            value={routeName}
            onChange={(event) => setRouteName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-greenBlue-1000">
            Filtrar por tipo de residuo
          </label>
          <Select
            value={routeResidueType}
            onChange={setRouteResidueType}
            options={[
              { value: "", label: "Todos os tipos" },
              ...Object.entries(RESIDUE_TYPE_LABELS).map(([value, label]) => ({
                value,
                label
              }))
            ]}
          />
        </div>
      </div>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          {" "}
          <div>
            {displayedRoutes.length === 0 && (
              <p className="text-lg font-medium">Não há rotas criadas.</p>
            )}
          </div>
          <div>
            <AccordionChildren
              openItem={openItem}
              setOpenItem={setOpenItem}
              items={
                displayedRoutes?.map((route) => {
                  let period = "";

                  switch (route.period) {
                    case "morning":
                      period = "Turno da manha";
                      break;
                    case "afternoon":
                      period = "Turno da tarde";
                      break;
                    case "night":
                      period = "Turno da noite";
                      break;
                    default:
                      period = "Sem turno definido";
                  }

                  const routeDays = route.days
                    .map((day, index) => {
                      if (day) {
                        return weekDays[index].label;
                      } else {
                        return null;
                      }
                    })
                    .filter((day) => day !== null)
                    .join(", ");
                  return {
                    title: route.name,
                    properties: [
                      { prop: "Funcionamento", answer: period },
                      { prop: "Dias", answer: routeDays },
                      {
                        prop: "Tipo de residuo",
                        answer: getResidueTypeLabel(route.residueType)
                      }
                    ],
                    children: (
                      <RouteComponent
                        closeItem={closeItem}
                        route={route}
                        routeDays={routeDays}
                        isAdmin={user?.role === "platformAdmin"}
                      />
                    )
                  };
                }) ?? []
              }
              itemClassName="mb-10"
              triggerClassName="bg-white-1000 border border-greenBlue-400 py-4 data-[state=open]:opacity-0 data-[state=open]:h-0 grid grid-cols-[1fr_1fr_1fr_1fr_auto] place-items-between"
              contentClassName="bg-white-800 border border-greenBlue-400 py-8 px-6 rounded-lg"
            />
            <PaginationControls
              page={page}
              totalPages={routesPage?.totalPages}
              isLoading={isFetching}
              onPageChange={setPage}
            />
          </div>{" "}
        </>
      )}
    </div>
  );
};

export default Rotas;
