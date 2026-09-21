import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import Title from "@atoms/Title/title";
import useAllCollectsByRoute from "@/hooks/queries/useAllCollectsByRoute";
import usePaginatedCollectsByRoute from "@/hooks/queries/usePaginatedCollectsByRoute";
import useCity from "@/hooks/queries/useCity";

import { getProperties } from "./functions";
import AddCollectData from "../AddCollectData/AddCollectData";
import { AccordionRouteProps } from "./types";

const AccordionRoute = ({ route, isAdmin }: AccordionRouteProps) => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const { data: city } = useCity(route.cityId);
  const date = searchParams.get("date");
  const pageSize = 10;
  const { data: paginatedCollects, isFetching: isFetchingPage } =
    usePaginatedCollectsByRoute(route.id, page, pageSize, !date);
  const { data: collects } = useAllCollectsByRoute(
    route.id,
    undefined,
    Boolean(date)
  );

  useEffect(() => {
    setPage(0);
  }, [route.id, date]);

  let filteredRouteCollects = date ? collects : paginatedCollects?.content;
  if (date)
    filteredRouteCollects = filteredRouteCollects?.filter(
      (collect) =>
        format(new Date(collect.createdAt.seconds * 1000), "P", {
          locale: ptBR
        }) === date
    );

  const showPagination =
    !date && paginatedCollects?.totalPages
      ? paginatedCollects.totalPages > 1
      : false;

  return (
    <div className="space-y-8 pb-[54px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Title className="text-[28px]"> {route.name}</Title>
        {paginatedCollects && !date && (
          <p className="text-sm font-medium text-gray-500">
            {paginatedCollects.totalElements} coletas
          </p>
        )}
      </div>
      {filteredRouteCollects && filteredRouteCollects?.length !== 0 ? (
        <>
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
          {showPagination && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={page === 0 || isFetchingPage}
                className="rounded-[8px] border border-greenBlue-1000 px-4 py-2 text-sm font-medium text-greenBlue-1000 transition-all hover:bg-greenBlue-1000 hover:text-white-1000 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-500">
                {page + 1} de {paginatedCollects?.totalPages}
              </span>
              <button
                type="button"
                disabled={paginatedCollects?.last || isFetchingPage}
                className="rounded-[8px] border border-greenBlue-1000 px-4 py-2 text-sm font-medium text-greenBlue-1000 transition-all hover:bg-greenBlue-1000 hover:text-white-1000 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Proxima
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center font-medium">Não há coletas pra essa rota</p>
      )}
    </div>
  );
};

export default AccordionRoute;
