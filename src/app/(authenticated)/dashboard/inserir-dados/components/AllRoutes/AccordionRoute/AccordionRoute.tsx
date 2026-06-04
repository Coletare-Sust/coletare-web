import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { Timestamp } from "@/common/entities/timestamp";
import { useSearchParams } from "next/navigation";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import Title from "@atoms/Title/title";
import useAllCollectsByRoute from "@/hooks/queries/useAllCollectsByRoute";
import useCity from "@/hooks/queries/useCity";

import { getProperties } from "./functions";
import AddCollectData from "../AddCollectData/AddCollectData";
import { AccordionRouteProps } from "./types";

const AccordionRoute = ({ route, isAdmin }: AccordionRouteProps) => {
  const searchParams = useSearchParams();
  const { data: city } = useCity(route.cityId);
  const date = searchParams.get("date");
  const { data: collects } = useAllCollectsByRoute(route.id);

  let filteredRouteCollects = collects;
  if (date)
    filteredRouteCollects = filteredRouteCollects?.filter(
      (route) =>
        format(new Date(route.createdAt.seconds * 1000), "P", {
          locale: ptBR
        }) === date
    );

  return (
    <div className="space-y-8 pb-[54px]">
      <Title className="text-[28px]"> {route.name}</Title>
      {filteredRouteCollects && filteredRouteCollects?.length !== 0 ? (
        <AccordionChildren
          itemClassName="pb-2"
          items={
            filteredRouteCollects?.map((collect) => ({
              title: route.name,
              properties: getProperties(
                city?.name as string,
                collect?.createdAt as Timestamp,
                route.residueType
              ),
              children: (
                <AddCollectData collectData={collect} isAdmin={isAdmin} />
              ),
              triggerClassName: !collect.mass
                ? "border-[1.5px] border-error"
                : ""
            })) ?? []
          }
        />
      ) : (
        <p className="text-center font-medium">Não há coletas pra essa rota</p>
      )}
    </div>
  );
};

export default AccordionRoute;
