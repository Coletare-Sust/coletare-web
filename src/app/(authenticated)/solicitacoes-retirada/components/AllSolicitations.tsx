"use client";
import React, { useState } from "react";
import { ListFilter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Subtitle from "@atoms/Subtitle/subtitle";
import LoadingComponent from "@atoms/Loading/loading";
import RadioDropdown from "@atoms/RadioDropdown/radioDropdown";
import InfoTable from "@molecules/InfoTable/infoTable";
import useAllWithdrawalsRequest from "@/hooks/queries/useAllWithdrawalsRequests";
import { residuesTypes } from "@common/constants/residuesTypes";

const AllSolicitations = () => {
  const [activeResidue, setActiveResidue] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");

  const { data: solicitationsData, isLoading: isLoadingSolicitationsData } =
    useAllWithdrawalsRequest(cityId as string);

  const filteredData = solicitationsData?.sort((a, b) => {
    if (a.isResolved === b.isResolved) return 0;
    else if (a.isResolved) return -1;
    else return 1;
  });

  const functionalData = filteredData?.map((item) => ({
    ...item,
    onClick: () => {
      router.push(
        `/solicitacoes-retirada?garbagePoint=${item.id}&city=${cityId}`,
        { scroll: false }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }));

  const filteredByAll = functionalData?.filter((item) => {
    const matchesResidue = activeResidue
      ? (Array.isArray(item.residueType)
          ? item.residueType
          : [item.residueType]
        ).some((t) => t.toLowerCase() === activeResidue.toLowerCase())
      : true

    const matchesStatus =
      activeStatus === "em andamento"
        ? !item.isResolved
        : activeStatus === "concluído"
        ? item.isResolved
        : true

    return matchesResidue && matchesStatus
  })

  return (
    <section className="my-[64px] space-y-8">
      <div className="flex items-center justify-between">
        <Subtitle>Todas as solicitações</Subtitle>

        <div className="flex items-center gap-4">
          <RadioDropdown
            options={[...residuesTypes]}
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

          <RadioDropdown
            options={["Em andamento", "Concluído"]}
            active={activeStatus}
            setActive={setActiveStatus}
            open={isStatusDropdownOpen}
            onOpenChange={() => setIsStatusDropdownOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-3">
              Filtrar por <br /> status
              <ListFilter size={24} />
            </span>
          </RadioDropdown>
        </div>
      </div>

      {isLoadingSolicitationsData ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <LoadingComponent />
        </div>
      ) : (
        <InfoTable data={(filteredByAll ?? []) as []} />
      )}
    </section>
  );
};

export default AllSolicitations;
