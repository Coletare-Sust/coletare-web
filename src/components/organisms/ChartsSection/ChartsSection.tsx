"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import ChartComponent from "@molecules/ChartComponent/ChartComponent";
import { monthsArray } from "@/common/constants/chartData";
import { wrapper } from "@/common/constants/wrapper";
import { errorToast } from "@/hooks/useAppToast";
import useAllCities from "@/hooks/queries/useAllCities";

import useAllRoutes from "@/hooks/queries/useAllRoutes";
import useAllCollectsByCity from "@/hooks/queries/useAllCollectsByCity";
import { exportExcel } from "@/store/services/exportExcel";
import useAllDashboard from "@/hooks/queries/useDashboardData";
import { collectedMass, costsRelation, emissionsData } from "./constants";
import { getDays, getSemester, getYear } from "./functions";
import { formatTime } from "@/utils/formatTime";

const ChartsSection = () => {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("city");
  const { data: cities, isLoading: isLoadingCities } = useAllCities();
  const cityName = cities?.find((c) => c.id === cityId)?.name as string;

  const { data: dashboardData, isLoading } = useAllDashboard(cityId as string);

  const [costsChartData, setCostsChartData] = useState(
    costsRelation(
      dashboardData?.landfill?.year as number[],
      dashboardData?.fuel?.year as number[]
    )
  );
  const [massChartData, setMassChartData] = useState(
    collectedMass(dashboardData?.mass?.year as number[])
  );
  const [emissionsChartData, setEmissionsChartData] = useState(
    emissionsData(dashboardData?.emission?.year as number[])
  );

  const days = getDays();
  const lastSemester = getSemester();
  const lastYear = getYear();

  const { data: routes } = useAllRoutes(cityId as string);
  const { data: collects } = useAllCollectsByCity(cityId as string);

  const handleExport = () => {
    const finalJSON: any = [];

    const orderedCollects = collects?.sort((a, b) => a.id.localeCompare(b.id));
    orderedCollects?.forEach((collect) => {
      const collectRoute = routes?.find((r) => r.id === collect.routeId);
      const createdAtDate = new Date(collect.createdAt);
      const auxMinutesW2Algs =
        createdAtDate.getMinutes() <= 9
          ? "0" + createdAtDate.getMinutes().toString()
          : createdAtDate.getMinutes().toString();
      const createdAtHour = createdAtDate.getHours() + ":" + auxMinutesW2Algs;
      const fuelConsume =
        collect.consume && collect.kmRun
          ? (collect.consume * collect.kmRun).toFixed(2)
          : undefined;
      const finalEmission =
        fuelConsume && collect.emission
          ? (parseFloat(fuelConsume) * collect.emission).toFixed(2)
          : undefined;
      const finalCost =
        collect.consume &&
        collect.kmRun &&
        collect.cost.fuel &&
        collect.mass &&
        collect.cost.landfillDelivery
          ? collect.consume * collect.kmRun * collect.cost.fuel +
            collect.cost.landfillDelivery * collect.mass
          : undefined;

      const aux = {
        Rota: collectRoute?.name ?? "[APAGADA]",
        "Tipo de resíduo": collectRoute?.residueType,
        Data: format(new Date(collect.createdAt), "P", { locale: ptBR }),
        "Horário de partida": createdAtHour,
        "Km Rodados (km)": collect.kmRun,
        "Duração (horas)": formatTime(collect.duration),
        "Massa coletada (ton)": collect.mass,
        "Emissão específica (kgCO2eq/L)": collect.emission,
        "Consumo específico (L/km)": collect.consume,
        "Custo entrega no aterro (R$/ton)": collect.cost?.landfillDelivery,
        "Custo de combustível (R$/L)": collect.cost?.fuel,
        "Velocidade média (km/h)": (
          collect.kmRun /
          (collect.duration / 60)
        ).toFixed(2),
        "Emissões (kgCO2eq)": finalEmission,
        "Consumo de combustível (L)": fuelConsume,
        "Custo (R$)": finalCost
      };
      finalJSON.push(aux);
    });

    exportExcel(finalJSON, `Relatório - ${cityName}`);
  };

  useEffect(() => {
    setMassChartData(collectedMass(dashboardData?.mass?.year as number[]));
    setEmissionsChartData(
      emissionsData(dashboardData?.emission?.year as number[])
    );
    setCostsChartData(
      costsRelation(
        dashboardData?.landfill?.year as number[],
        dashboardData?.fuel?.year as number[]
      )
    );
  }, [dashboardData]);

  if (isLoading || isLoadingCities) {
    return (
      <div className="absolute flex h-[50%] w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <section style={wrapper} className="py-[88px]">
      <div className="flex items-center justify-between">
        <Title>Visão Geral {cityName}</Title>
        <MoreDropdown
          options={[
            { label: "Extrair informação", onClick: () => handleExport() }
          ]}
        />
      </div>

      {dashboardData &&
        costsChartData &&
        massChartData &&
        emissionsChartData && (
          <div className="mt-[56px] space-y-[56px]">
            <ChartComponent
              title="Relação de custos (R$)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () => {
                    if (lastYear) {
                      setCostsChartData({
                        ...costsRelation(
                          dashboardData?.landfill?.year as number[],
                          dashboardData?.fuel?.year as number[]
                        ),
                        labelsX: lastYear
                      });
                    } else {
                      errorToast("Ainda não há último ano pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise Semestral",
                  onClick: () => {
                    if (lastSemester) {
                      setCostsChartData({
                        ...costsRelation(
                          dashboardData?.landfill?.semester as number[],
                          dashboardData?.fuel?.semester as number[]
                        ),
                        labelsX: lastSemester
                      });
                    } else {
                      errorToast("Ainda não há último semestre pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise  Mensal",
                  onClick: () => {
                    if (days) {
                      setCostsChartData({
                        ...costsRelation(
                          dashboardData?.landfill?.month as number[],
                          dashboardData?.fuel?.month as number[]
                        ),
                        labelsX: days
                      });
                    } else {
                      errorToast("Ainda não há último semestre pra avaliar.");
                    }
                  }
                }
              ]}
              stackedChartData={{
                ...costsChartData,
                className: "pl-16",
                barThickness: monthsArray.includes(costsChartData.labelsX[0])
                  ? 50
                  : 25
              }}
            />
            <ChartComponent
              title="Massa coletada (ton)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () => {
                    if (lastYear) {
                      setMassChartData({
                        ...collectedMass(dashboardData?.mass?.year as number[]),
                        labelsX: lastYear
                      });
                    } else {
                      errorToast("Ainda não há último ano pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise Semestral",
                  onClick: () => {
                    if (lastSemester) {
                      setMassChartData({
                        ...collectedMass(
                          dashboardData?.mass?.semester as number[]
                        ),
                        labelsX: lastSemester
                      });
                    } else {
                      errorToast("Ainda não há último semestre pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise Mensal",
                  onClick: () => {
                    if (days) {
                      setMassChartData({
                        ...collectedMass(
                          dashboardData?.mass?.month as number[]
                        ),
                        labelsX: days
                      });
                    } else {
                      errorToast("Ainda não há mês pra avaliar.");
                    }
                  }
                }
              ]}
              barChartData={{
                barLabel: "Massa coletada",
                ...massChartData,
                className: "w-[70%] m-auto",
                barThickness: monthsArray.includes(massChartData.labelsX[0])
                  ? 50
                  : 30
              }}
            />
            <ChartComponent
              title="Emissões (kgCO2eq/L)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () => {
                    if (lastYear) {
                      setEmissionsChartData({
                        ...emissionsData(
                          dashboardData?.emission?.year as number[]
                        ),
                        labelsX: lastYear
                      });
                    } else {
                      errorToast("Ainda não há último ano pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise Semestral",
                  onClick: () => {
                    if (lastSemester) {
                      setEmissionsChartData({
                        ...emissionsData(
                          dashboardData?.emission?.semester as number[]
                        ),
                        labelsX: lastSemester
                      });
                    } else {
                      errorToast("Ainda não há último semestre pra avaliar.");
                    }
                  }
                },
                {
                  label: "Análise Mensal",
                  onClick: () => {
                    if (days) {
                      setEmissionsChartData({
                        ...emissionsData(
                          dashboardData?.emission?.month as number[]
                        ),
                        labelsX: days
                      });
                    } else {
                      errorToast("Ainda não há último mês pra avaliar.");
                    }
                  }
                }
              ]}
              barChartData={{
                barLabel: "Emissões",
                ...emissionsChartData,
                className: "w-[70%] m-auto",
                barThickness: monthsArray.includes(
                  emissionsChartData.labelsX[0]
                )
                  ? 50
                  : 30
              }}
            />
          </div>
        )}

      {!dashboardData && (
        <p className="mt-20 text-center"> Ainda não há dados pra mostrar! </p>
      )}
    </section>
  );
};

export default ChartsSection;
