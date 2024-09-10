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
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const { data: solicitationsData, isLoading: isLoadingSolicitationsData } =
    useAllWithdrawalsRequest(cityId as string);

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
          scroll: false
        }
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
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
        <InfoTable
          data={
            (activeResidue
              ? functionalData?.filter(
                  (item) => item.residueType.toLowerCase() === activeResidue
                )
              : functionalData) as []
          }
        />
      )}
    </section>
  );
};

export default AllSolicitations;
