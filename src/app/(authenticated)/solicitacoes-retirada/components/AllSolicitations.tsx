"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Subtitle from "@atoms/Subtitle/subtitle";
import LoadingComponent from "@atoms/Loading/loading";
import InfoTable from "@molecules/InfoTable/infoTable";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";
import usePaginatedWithdrawalsRequests from "@/hooks/queries/usePaginatedWithdrawalsRequests";
import { RESIDUE_TYPE_LABELS } from "@/common/mappers/backendEnums";

const PAGE_SIZE = 10;

const AllSolicitations = () => {
  const [residueType, setResidueType] = useState("");
  const [status, setStatus] = useState<"" | "open" | "closed">("");
  const [page, setPage] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");

  const filters = useMemo(
    () => ({
      residueType: residueType || undefined,
      status: status === "open" ? false : status === "closed" ? true : undefined
    }),
    [residueType, status]
  );

  const {
    data: solicitationsPage,
    isLoading: isLoadingSolicitationsData,
    isFetching
  } = usePaginatedWithdrawalsRequests(
    cityId as string,
    page,
    PAGE_SIZE,
    filters
  );
  const solicitationsData = solicitationsPage?.content ?? [];

  React.useEffect(() => {
    setPage(0);
  }, [residueType, status, cityId]);

  const functionalData = solicitationsData.map((item) => ({
    ...item,
    onClick: () => {
      router.push(
        `/solicitacoes-retirada?garbagePoint=${item.id}&city=${cityId}`,
        {
          scroll: false
        }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }));

  return (
    <section className="my-[64px] space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Subtitle>Todas as solicitacoes</Subtitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Filtrar por tipo de residuo"
            value={residueType}
            onChange={(event) => setResidueType(event.target.value)}
            className="h-11 rounded-lg border border-greenBlue-800 bg-white-1000 px-4 text-greenBlue-1000 outline-none"
          >
            <option value="">Todos os residuos</option>
            {Object.entries(RESIDUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status da solicitacao"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | "open" | "closed")
            }
            className="h-11 rounded-lg border border-greenBlue-800 bg-white-1000 px-4 text-greenBlue-1000 outline-none"
          >
            <option value="">Todas as solicitacoes</option>
            <option value="open">Abertas</option>
            <option value="closed">Fechadas</option>
          </select>
        </div>
      </div>

      {isLoadingSolicitationsData ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <LoadingComponent />
        </div>
      ) : (
        <>
          <InfoTable data={functionalData as []} />
          <PaginationControls
            page={page}
            totalPages={solicitationsPage?.totalPages}
            isLoading={isFetching}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
};

export default AllSolicitations;
