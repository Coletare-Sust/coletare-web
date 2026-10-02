"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { wrapper } from "@/common/constants/wrapper";
import { Timestamp } from "@/common/entities/timestamp";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";
import Title from "@atoms/Title/title";
import useCollect from "@/hooks/queries/useCollect";
import useRoute from "@/hooks/queries/useRoute";
import { timestampToDate } from "@/utils/timestampToDate";
import InfoCard from "@molecules/InfoCard/infoCard";
import DataCarousel from "@molecules/DataCarousel/dataCarousel";
import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import ChartComponent from "@molecules/ChartComponent/ChartComponent";
import useCity from "@/hooks/queries/useCity";
import useProfile from "@/hooks/queries/useProfile";
import { formatFloatToMMSS } from "./utils";
import { exportExcel } from "@/store/services/exportExcel";
import LoadingComponent from "@/components/atoms/Loading/loading";
import {
  costsRelation,
  collectedMass,
  emissionsData
} from "@/components/organisms/ChartsSection/constants";
import {
  getDays,
  getYear,
  getSemester
} from "@/components/organisms/ChartsSection/functions";
import useAllDashboardByRoutes from "@/hooks/queries/useAllDashboardDataByRoute";
import useAllCollectsByRoute from "@/hooks/queries/useAllCollectsByRoute";
import { formatTime } from "@/utils/formatTime";

const Rota = () => {
  const router = useRouter();
  const { id } = useParams();

  // Queries
  const { data: collect, isLoading: loadingCollect } = useCollect(id as string);
  const { data: route } = useRoute(collect?.routeId as string);
  const { data: city } = useCity(route?.cityId as string);
  const { data: employee } = useProfile(collect?.employeeId as string);
  const { data: routeCollects } = useAllCollectsByRoute(route?.id as string);

  const { data: dashboardData, isLoading: loadingDash } =
    useAllDashboardByRoutes(route?.cityId as string, route?.id as string);

  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);

  // Estados dos Gráficos
  const [costsChartData, setCostsChartData] = useState<any>(null);
  const [massChartData, setMassChartData] = useState<any>(null);
  const [emissionsChartData, setEmissionsChartData] = useState<any>(null);

  useEffect(() => {
    if (dashboardData) {
      // Mandamos os dados brutos. A formatação de 2 casas decimais
      // agora é feita pelos componentes BarChart e StackedChart.
      setMassChartData(collectedMass(dashboardData.mass.year));
      setEmissionsChartData(emissionsData(dashboardData.emission.year));
      setCostsChartData(
        costsRelation(dashboardData.landfill.year, dashboardData.fuel.year)
      );
    }
  }, [dashboardData]);

  useEffect(() => {
    if (!route) return;

    if (route.polylinePoints && route.polylinePoints.length > 0) {
      setPath(route.polylinePoints);
      return;
    }

    if (
      route.polyline &&
      (route.waypoints?.length ?? 0) <= 27 &&
      typeof google !== "undefined" &&
      google.maps?.geometry?.encoding
    ) {
      const decodedPath = google.maps.geometry.encoding.decodePath(
        route.polyline
      );
      setPath(decodedPath.map((p) => ({ lat: p.lat(), lng: p.lng() })));
      return;
    }

    setPath([]);
  }, [route]);

  if (loadingCollect || !collect) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  const collectDate = collect?.createdAt
    ? timestampToDate(collect.createdAt as Timestamp).toLocaleDateString()
    : "";
  const collectTime = collect?.duration
    ? formatFloatToMMSS(collect.duration / 60)
    : "--:--";

  const days = getDays();
  const lastSemester = getSemester();
  const lastYear = getYear();

  const handleExport = () => {
    if (!routeCollects) return;
    const finalJSON: any = [];
    routeCollects.forEach((c) => {
      const date = new Date(c.createdAt.seconds * 1000);
      finalJSON.push({
        Rota: route?.name ?? "N/A",
        Data: format(date, "P", { locale: ptBR }),
        "Km Rodados": c.kmRun,
        "Massa (ton)": c.mass,
        "Custo (R$)":
          c.consume && c.kmRun && c.cost?.fuel
            ? (c.consume * c.kmRun * c.cost.fuel).toFixed(2)
            : "0"
      });
    });
    exportExcel(finalJSON, `Relatório - ${route?.name}`);
  };

  return (
    <div style={wrapper} className="py-14">
      <Title className="mb-14 flex items-center gap-2">
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Voltar"
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {route?.name || "Carregando..."} - {collectDate}
      </Title>

      <BackgroundWrapper className="mb-24">
        <div className="mb-28 grid grid-cols-5 justify-center gap-28">
          <div className="col-span-3 h-96 w-full">
            <>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={path[0] || { lat: -8.047, lng: -34.945 }}
                zoom={15}
              >
                {path.length > 0 && (
                  <Polyline
                    path={path}
                    options={{ strokeColor: "#00ADB4", strokeWeight: 4 }}
                  />
                )}
                {route?.waypoints?.map((w: any, i: number) => (
                  <Marker
                    key={i}
                    position={w}
                    label={{ text: String(i + 1), color: "white" }}
                  />
                ))}
              </GoogleMap>
            </>
          </div>
          <div className="col-span-2 flex flex-col items-center gap-8">
            <p className="text-[24px] font-semibold text-greenBlue-1000">
              Informações
            </p>
            <InfoCard
              infos={[
                {
                  label: "Colaborador",
                  value:
                    employee?.name || collect?.employeeId || "Não encontrado"
                },
                {
                  label: "Veículo",
                  value: collect?.vehicleName || "Não encontrado"
                },
                {
                  label: "Placa",
                  value: collect?.carPlate || "Não encontrado"
                },
                {
                  label: "km rodados",
                  value: `${collect?.kmRun?.toFixed(2)} km`
                },
                { label: "Tempo de rota", value: collectTime }
              ]}
            />
          </div>
        </div>

        <div>
          <p className="mb-14 text-[24px] font-semibold text-greenBlue-1000">
            Dados da coleta
          </p>
          <DataCarousel
            className="w-full"
            itemClassName="basis-[26%]"
            cardsInfo={[
              { title: "Massa coletada (ton)", data: collect?.mass || 0 },
              {
                title: "Consumo específico (L/km)",
                data: collect?.consume || 0
              },
              {
                title: "Emissão específica (kgCO2eq/L)",
                data: collect?.emission || 0
              },
              {
                title: "Custo de entrega no aterro (R$)",
                data: collect?.cost?.landfillDelivery || 0
              }
            ]}
          />
        </div>
      </BackgroundWrapper>

      <div>
        <div className="mb-8 flex items-center justify-between">
          <Title>Visão geral da {route?.name || "rota"} </Title>
          <MoreDropdown
            options={[{ label: "Extrair informação", onClick: handleExport }]}
          />
        </div>

        {dashboardData &&
        costsChartData &&
        massChartData &&
        emissionsChartData ? (
          <div className="mt-[56px] space-y-[56px]">
            <ChartComponent
              title="Relação de custos (R$)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () =>
                    setCostsChartData({
                      ...costsRelation(
                        dashboardData.landfill.year,
                        dashboardData.fuel.year
                      ),
                      labelsX: lastYear
                    })
                },
                {
                  label: "Análise Semestral",
                  onClick: () =>
                    setCostsChartData({
                      ...costsRelation(
                        dashboardData.landfill.semester,
                        dashboardData.fuel.semester
                      ),
                      labelsX: lastSemester
                    })
                },
                {
                  label: "Análise Mensal",
                  onClick: () =>
                    setCostsChartData({
                      ...costsRelation(
                        dashboardData.landfill.month,
                        dashboardData.fuel.month
                      ),
                      labelsX: days
                    })
                }
              ]}
              stackedChartData={{
                ...costsChartData,
                className: "pl-16",
                barThickness: 30
              }}
            />

            <ChartComponent
              title="Massa coletada (ton)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () =>
                    setMassChartData({
                      ...collectedMass(dashboardData.mass.year),
                      labelsX: lastYear
                    })
                },
                {
                  label: "Análise Semestral",
                  onClick: () =>
                    setMassChartData({
                      ...collectedMass(dashboardData.mass.semester),
                      labelsX: lastSemester
                    })
                },
                {
                  label: "Análise Mensal",
                  onClick: () =>
                    setMassChartData({
                      ...collectedMass(dashboardData.mass.month),
                      labelsX: days
                    })
                }
              ]}
              barChartData={{
                barLabel: "Massa coletada",
                ...massChartData,
                className: "w-[70%] m-auto",
                barThickness: 30
              }}
            />

            <ChartComponent
              title="Emissões (kgCO2eq)"
              dropdownOptions={[
                {
                  label: "Análise Anual",
                  onClick: () =>
                    setEmissionsChartData({
                      ...emissionsData(dashboardData.emission.year),
                      labelsX: lastYear
                    })
                },
                {
                  label: "Análise Semestral",
                  onClick: () =>
                    setEmissionsChartData({
                      ...emissionsData(dashboardData.emission.semester),
                      labelsX: lastSemester
                    })
                },
                {
                  label: "Análise Mensal",
                  onClick: () =>
                    setEmissionsChartData({
                      ...emissionsData(dashboardData.emission.month),
                      labelsX: days
                    })
                }
              ]}
              barChartData={{
                barLabel: "Emissões",
                ...emissionsChartData,
                className: "w-[70%] m-auto",
                barThickness: 30
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center py-20">
            {loadingDash ? (
              <LoadingComponent />
            ) : (
              <p>Ainda não há dados suficientes para os gráficos.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rota;
