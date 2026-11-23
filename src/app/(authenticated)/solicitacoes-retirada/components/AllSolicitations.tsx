"use client";

import Select from "@atoms/Select/select";
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
          <Select
            aria-label="Filtrar por tipo de residuo"
            className="sm:w-56"
            value={residueType}
            onChange={setResidueType}
            options={[
              { value: "", label: "Todos os residuos" },
              ...Object.entries(RESIDUE_TYPE_LABELS).map(([value, label]) => ({
                value,
                label
              }))
            ]}
          />
          <Select
            aria-label="Filtrar por status da solicitacao"
            className="sm:w-56"
            value={status}
            onChange={(value) => setStatus(value as "" | "open" | "closed")}
            options={[
              { value: "", label: "Todas as solicitacoes" },
              { value: "open", label: "Abertas" },
              { value: "closed", label: "Fechadas" }
            ]}
          />
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
