"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import { wrapper } from "@/common/constants/wrapper";
import useCity from "@/hooks/queries/useCity";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";

import CalcData from "./components/CalcData/CalcData";
import AllRoutes from "./components/AllRoutes/AllRoutes";

const InserirDadosRota = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const isAdmin = user?.role === "platformAdmin";
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const { data: city, isLoading: isLoadingCity } = useCity(cityId);
  const cityName = city?.name;

  if (isLoadingCity) {
    return (
      <div className="absolute flex h-[50%] w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <section style={wrapper} className="space-y-[64px] py-[77px]">
      <Title
        className={`flex cursor-pointer items-center gap-2 hover:underline ${
          isAdmin && "text-greenDark-1000"
        }`}
        onClick={() => router.back()}
      >
        <ChevronLeft size={32} /> Inserir dados de rotas - {cityName}
      </Title>
      {isAdmin && <CalcData cityId={cityId as string} />}
      <AllRoutes isAdmin={isAdmin} />
    </section>
  );
};

export default InserirDadosRota;
