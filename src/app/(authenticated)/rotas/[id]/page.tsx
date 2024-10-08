"use client";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";

import Title from "@atoms/Title/title";
import ChartComponent from "@molecules/ChartComponent/ChartComponent";
import { errorToast } from "@/hooks/useAppToast";
import { monthsArray } from "@/common/constants/chartData";
import { wrapper } from "@/common/constants/wrapper";
import MoreDropdown from "@/components/atoms/MoreDropdown/moreDropdown";
import { exportExcel } from "@/store/services/exportExcel";
import LoadingComponent from "@/components/atoms/Loading/loading";
import {
  costsRelation,
  collectedMass,
  emissionsData
} from "@/components/organisms/ChartsSection/constants";
import {
  getDays,
  getSemester,
  getYear
} from "@/components/organisms/ChartsSection/functions";
import useAllDashboardByRoutes from "@/hooks/queries/useAllDashboardDataByRoute";
import useRoute from "@/hooks/queries/useRoute";
import useAllCollectsByRoute from "@/hooks/queries/useAllCollectsByRoute";
import useCity from "@/hooks/queries/useCity";
import { formatTime } from "@/utils/formatTime";

const DetalhesDaRota = () => {
  const router = useRouter();
  const { id } = useParams();
  const { data: route } = useRoute(id as string);
  const { data: city } = useCity(route?.cityId as string);
  const { data: routeCollects } = useAllCollectsByRoute(route?.id as string);

  const { data: dashboardData, isLoading } = useAllDashboardByRoutes(
    route?.cityId as string,
    route?.id as string
  );

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

  const handleExport = () => {
    const finalJSON: any = [];

    routeCollects?.forEach((collect) => {
      const createdAtDate = new Date(collect.createdAt.seconds * 1000);
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
        Rota: route?.name ?? "[APAGADA]",
        "Tipo de resíduo": route?.residueType,
        Data: format(collect.createdAt.seconds * 1000, "P", { locale: ptBR }),
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

    exportExcel(finalJSON, `Relatório - ${route?.name} - ${city?.name}`);
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

  if (isLoading) {
    return (
      <div className="absolute flex h-[50%] w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <section style={wrapper} className="py-[83px]">
      <div>
        <Title
          className="mb-20 flex cursor-pointer items-center gap-2 text-black hover:underline"
          onClick={() => router.back()}
        >
          <ChevronLeft size={32} /> Detalhes da {route?.name}{" "}
        </Title>
        <div className="flex items-center justify-between">
          <Title>Visão geral da {route?.name} </Title>
          <div className="mb-8 flex items-center justify-end">
            {" "}
            <MoreDropdown
              options={[
                {
                  label: "Extrair informação",
                  onClick: handleExport
                }
              ]}
            />
          </div>
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
                          ...collectedMass(
                            dashboardData?.mass?.year as number[]
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
      </div>
    </section>
  );
};

export default DetalhesDaRota;
