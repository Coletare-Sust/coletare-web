"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline
} from "@react-google-maps/api";
import { format } from "date-fns";

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
import { errorToast } from "@/hooks/useAppToast";
import { monthsArray } from "@/common/constants/chartData";
import useCity from "@/hooks/queries/useCity";
import useProfile from "@/hooks/queries/useProfile";
import { formatFloatToMMSS } from "./utils";
import { exportExcel } from "@/store/services/exportExcel";
import { ptBR } from "date-fns/locale";
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

const mapsLib = ["places", "geometry"];

const Rota = () => {
  const router = useRouter();
  const { id } = useParams();
  const { data: collect } = useCollect(id as string);
  const { data: route } = useRoute(collect?.routeId as string);
  const { data: city } = useCity(route?.cityId as string);
  const { data: employee } = useProfile(collect?.employeeId as string);
  const { data: routeCollects } = useAllCollectsByRoute(route?.id as string);
  const [, setMap] = useState<google.maps.Map>();
  const [path, setPath] = useState<google.maps.LatLng[]>([]);

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

  if (!collect || !employee) {
    return;
  }
  const collectDate = timestampToDate(
    collect.createdAt as Timestamp
  ).toLocaleDateString();

  const collectTime = formatFloatToMMSS(collect.duration / 60);

  const days = getDays();
  const lastSemester = getSemester();
  const lastYear = getYear();
  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    const polyline = route?.polyline;
    const decodedPath = google.maps.geometry.encoding.decodePath(
      polyline as string
    );
    setPath(decodedPath);
  };

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
        "Duração (horas)": (collect.duration / 60).toFixed(2),

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

  if (isLoading) {
    return (
      <div className="absolute flex h-[50%] w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div style={wrapper} className="py-14">
      <Title className="mb-14 flex items-center gap-2">
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Seta para esquerda"
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {route?.name} - {collectDate}
      </Title>
      <BackgroundWrapper className="mb-24">
        <div className="mb-28 grid grid-cols-5 justify-center gap-28">
          <div className="col-span-3 h-96 w-full">
            <LoadScript
              googleMapsApiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              libraries={mapsLib as any[]}
            >
              <GoogleMap
                onLoad={onMapLoad}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={path[0]}
                zoom={15}
              >
                <Polyline
                  path={path}
                  options={{
                    strokeColor: "#00ADB4",
                    strokeOpacity: 1,
                    strokeWeight: 4
                  }}
                />
                {route?.waypoints.map((waypoint, index) => (
                  <Marker
                    key={index}
                    position={waypoint}
                    label={{
                      text: String(index + 1),
                      color: "white",
                      fontSize: "12px"
                    }}
                    // icon={{
                    //   url: "/map-marker.svg",
                    //   scaledSize: new google.maps.Size(30, 30)
                    // }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
          <div className="col-span-2 flex flex-col items-center gap-8">
            <p className="text-[24px] font-semibold text-greenBlue-1000">
              Informações
            </p>
            <InfoCard
              infos={[
                {
                  label: "Colaborador",
                  value: employee.name || "Não encontrado"
                },
                {
                  label: "Veículo",
                  value: collect.vehicleName || "Não encontrado"
                },
                { label: "Placa", value: collect.carPlate || "Não encontrado" },
                {
                  label: "km rodados",
                  value: `${collect.kmRun.toFixed(2)} km` || "Não encontrado"
                },
                {
                  label: "Tempo de rota",
                  value: collectTime || "Não encontrado"
                }
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
              { title: "Massa coletada (ton)", data: collect.mass || null },
              {
                title: "Consumo específico (L/km)",
                data: collect.consume || null
              },
              {
                title: "Emissão específica (kgCO2eq/L)",
                data: collect.emission || null
              },
              {
                title: "Custo de entrega no aterro (R$)",
                data: collect.cost?.landfillDelivery || null
              }
            ]}
          />
        </div>
      </BackgroundWrapper>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <Title>Visão geral da {route?.name} </Title>
          <MoreDropdown
            options={[
              {
                label: "Extrair informação",
                onClick: handleExport
              }
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
                title="Emissões (kgCO2eq)"
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
    </div>
  );
};

export default Rota;
