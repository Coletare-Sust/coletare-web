import { useSearchParams } from "next/navigation";
import React from "react";
import Title from "@atoms/Title/title";
import useAllRoutes from "@/hooks/queries/useAllRoutes";
import { AllRoutesProps } from "./types";
import AccordionRoute from "./AccordionRoute/AccordionRoute";

const AllRoutes = ({ isAdmin }: AllRoutesProps) => {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const routeId = searchParams.get("value");
  const { data: routes } = useAllRoutes(cityId as string);
  let filteredRoutes = routes;
  if (routeId)
    filteredRoutes = filteredRoutes?.filter((route) => route.id === routeId);
  if (cityId)
    filteredRoutes = filteredRoutes?.filter((route) => route.cityId === cityId);

  return (
    <section className="space-y-8 px-36">
      {isAdmin && <Title>Todas as rotas </Title>}
      {filteredRoutes?.map((route, key) => (
        <AccordionRoute route={route} key={key} isAdmin={isAdmin} />
      ))}
      {(!filteredRoutes || filteredRoutes?.length === 0) && (
        <p className="text-center"> Sem rotas cadastradas! </p>
      )}
    </section>
  );
};

export default AllRoutes;
