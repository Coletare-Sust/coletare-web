"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AccordionChildren } from "@atoms/Accordion/accordion";
import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import useAllRoutes from "@/hooks/queries/useAllRoutes";
import { weekDays } from "@molecules/CreateRoute/constants";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { wrapper } from "@/common/constants/wrapper";
import { getResidueTypeLabel } from "@/common/mappers/backendEnums";
import { hasPermission } from "@/common/accessControl/permissions";

import RouteComponent from "./components/RouteComponent/routeComponent";

const Rotas = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = searchParams.get("city");
  const routeId = searchParams.get("value");
  const { data: routes, isLoading } = useAllRoutes(
    cityId ?? (user?.id as string),
  );
  const [openItem, setOpenItem] = useState("");
  const canCreateRoute = hasPermission(user, "ROUTE_CREATE");

  const closeItem = () => {
    setOpenItem("");
  };

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-14 flex items-center justify-between">
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
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          {" "}
          <div>
            {routes?.length === 0 && (
              <p className="text-lg font-medium">Não há rotas criadas.</p>
            )}
          </div>
          <div>
            <AccordionChildren
              openItem={openItem}
              setOpenItem={setOpenItem}
              items={
                (routeId
                  ? routes?.filter((r) => r.id === routeId)
                  : routes
                )?.map((route) => {
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
                        answer: getResidueTypeLabel(route.residueType),
                      },
                    ],
                    children: (
                      <RouteComponent
                        closeItem={closeItem}
                        route={route}
                        routeDays={routeDays}
                        isAdmin={user?.role === "platformAdmin"}
                      />
                    ),
                  };
                }) ?? []
              }
              itemClassName="mb-10"
              triggerClassName="bg-white-1000 border border-greenBlue-400 py-4 data-[state=open]:opacity-0 data-[state=open]:h-0 grid grid-cols-[1fr_1fr_1fr_1fr_auto] place-items-between"
              contentClassName="bg-white-800 border border-greenBlue-400 py-8 px-6 rounded-lg"
            />
          </div>{" "}
        </>
      )}
    </div>
  );
};

export default Rotas;
