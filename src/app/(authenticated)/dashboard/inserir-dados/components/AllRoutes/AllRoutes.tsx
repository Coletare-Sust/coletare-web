import Select from "@atoms/Select/select";
import { useSearchParams } from "next/navigation";
import React from "react";
import Title from "@atoms/Title/title";
import useAllRoutes from "@/hooks/queries/useAllRoutes";
import { RESIDUE_TYPE_LABELS } from "@/common/mappers/backendEnums";
import { AllRoutesProps } from "./types";
import AccordionRoute from "./AccordionRoute/AccordionRoute";

const AllRoutes = ({ isAdmin }: AllRoutesProps) => {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const routeId = searchParams.get("value");
  const [residueType, setResidueType] = React.useState("");
  const { data: routes } = useAllRoutes(cityId as string);
  let filteredRoutes = routes;
  if (routeId)
    filteredRoutes = filteredRoutes?.filter((route) => route.id === routeId);
  if (cityId)
    filteredRoutes = filteredRoutes?.filter((route) => route.cityId === cityId);
  if (residueType)
    filteredRoutes = filteredRoutes?.filter(
      (route) => route.residueType === RESIDUE_TYPE_LABELS[residueType]
    );

  return (
    <section className="space-y-8 px-0 lg:px-12 xl:px-36">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {isAdmin && <Title>Todas as rotas </Title>}
        <div className="flex w-full max-w-[360px] flex-col gap-2">
          <label className="text-sm font-medium text-greenBlue-1000">
            Filtrar coletas por tipo de residuo
          </label>
          <Select
            value={residueType}
            onChange={setResidueType}
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
