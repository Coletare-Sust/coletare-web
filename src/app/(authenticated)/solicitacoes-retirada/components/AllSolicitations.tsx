"use client";
import React, { useState } from "react";
import { ListFilter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Subtitle from "@atoms/Subtitle/subtitle";
import LoadingComponent from "@atoms/Loading/loading";
import RadioDropdown from "@atoms/RadioDropdown/radioDropdown";
import InfoTable from "@molecules/InfoTable/infoTable";
import usePaginatedWithdrawalsRequests from "@/hooks/queries/usePaginatedWithdrawalsRequests";
import { residuesTypes } from "@common/constants/residuesTypes";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";

const AllSolicitations = () => {
  const [activeResidue, setActiveResidue] = useState("");
  const [page, setPage] = useState(0);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const pageSize = 10;
  const {
    data: solicitationsPage,
    isLoading: isLoadingSolicitationsData,
    isFetching,
  } = usePaginatedWithdrawalsRequests(cityId as string, page, pageSize, {
    residueType: activeResidue || undefined,
  });
  const solicitationsData = solicitationsPage?.content;

  React.useEffect(() => {
    setPage(0);
  }, [activeResidue, cityId]);

  const filteredData = solicitationsData?.sort((a, b) => {
    if (a.isResolved === b.isResolved) {
      return 0;
    } else if (a.isResolved) {
      return -1;
    } else {
      return 1;
    }
  });

  const functionalData = filteredData?.map((item) => ({
    ...item,
    onClick: () => {
      router.push(
        `/solicitacoes-retirada?garbagePoint=${item.id}&city=${cityId}`,
        {
          scroll: false,
        },
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  }));

  return (
    <section className="my-[64px] space-y-8">
      <div className="flex items-center justify-between">
        <Subtitle>Todas as solicitações</Subtitle>
        <RadioDropdown
          options={residuesTypes}
          active={activeResidue}
          setActive={setActiveResidue}
          open={isFilterDropdownOpen}
          onOpenChange={() => setIsFilterDropdownOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-3">
            Filtrar por <br /> resíduo
            <ListFilter size={24} />
          </span>
        </RadioDropdown>
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
