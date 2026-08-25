"use client";

import {
  GoogleMap,
  Marker,
  Polyline,
  OverlayView,
  OverlayViewF
} from "@react-google-maps/api";
import { useEffect, useState, useMemo, useRef } from "react";
import Title from "@/components/atoms/Title/title";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useCity from "@/hooks/queries/useCity";
import useRoutes from "@hooks/queries/useAllRoutes";
import useAllCollectsByCity from "@/hooks/queries/useAllCollectsByCity";
import { successToast } from "@/hooks/useAppToast";

import { decodePolyline } from "@utils/decodePolyline";
import { CollectEntity } from "@/common/entities/Collect";
import { RouteEntity } from "@/common/entities/route";

interface RoutePoint {
  lat: number;
  lng: number;
}

interface LiveTruck {
  id: string;
  lat: number;
  lng: number;
  carPlate: string;
  vehicleName: string;
  routeId: string;
  routePath: RoutePoint[];
}

interface LiveLocationPayload {
  collectId: string;
  vehicleId: string;
  vehicleName: string;
  carPlate: string;
  routeId: string;
  latitude: number;
  longitude: number;
  routePath?: {
    latitude: number;
    longitude: number;
  }[];
  hasEnded: boolean;
}

const defaultMapCenter = {
  lat: -8.3369,
  lng: -36.4251
};

const RotasAndamento = () => {
  const [, setMap] = useState<google.maps.Map>();

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const { data: city } = useCity(user?.cityId ?? null);

  const [trucks, setTrucks] = useState<LiveTruck[]>([]);
  const [hoveredTruck, setHoveredTruck] = useState<LiveTruck | null>(null);

  const [center, setCenter] = useState(defaultMapCenter);
  const locationStatus = useRef<"pending" | "success" | "error">("pending");

  const cityId = user?.cityId;
  const { data: allRoutes } = useRoutes(cityId ?? "");
  const { data: collects } = useAllCollectsByCity<CollectEntity[]>(
    cityId ?? "",
    (data) =>
      (data as CollectEntity[] | undefined)?.filter(
        (collect) => !collect.hasEnded
      ) ?? []
  );

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const routesMap = useMemo(() => {
    if (!allRoutes) return {};

    return allRoutes.reduce<Record<string, RouteEntity>>((acc, route) => {
      acc[route.id] = route;
      return acc;
    }, {});
  }, [allRoutes]);

  useEffect(() => {
    if (!collects) return;

    setTrucks(
      collects
        .filter(
          (collect) =>
            collect.vehicleLatitude !== 0 && collect.vehicleLongitude !== 0
        )
        .map((collect) => ({
          id: collect.id,
          lat: collect.vehicleLatitude,
          lng: collect.vehicleLongitude,
          carPlate: collect.carPlate,
          vehicleName: collect.vehicleName,
          routeId: collect.routeId,
          routePath:
            collect.realTimePosition?.map((position) => ({
              lat: position.latitude,
              lng: position.longitude
            })) ?? []
        }))
    );
  }, [collects]);

  useEffect(() => {
    if (navigator.geolocation && locationStatus.current === "pending") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationStatus.current = "success";
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          locationStatus.current = "error";
          if (city?.latitude && city?.longitude) {
            setCenter({ lat: city.latitude, lng: city.longitude });
          }
        }
      );
    }
  }, [city?.latitude, city?.longitude]);

  useEffect(() => {
    if (
      city?.latitude &&
      city?.longitude &&
      locationStatus.current !== "success"
    ) {
      setCenter({ lat: city.latitude, lng: city.longitude });
    }
  }, [city?.latitude, city?.longitude]);

  useEffect(() => {
    if (!user?.cityId) return;

    const socketUrl = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    }/ws`;
    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: () => {
        // console.log("STOMP debug");
      },
      onConnect: () => {
        console.log(
          `STOMP conectado, inscrevendo-se em: /topic/locations/${user.cityId}`
        );
        stompClient.subscribe(`/topic/locations/${user.cityId}`, (message) => {
          if (message.body) {
            const payload = JSON.parse(message.body) as LiveLocationPayload;

            if (payload.hasEnded) {
              successToast(
                `A coleta do veículo ${payload.vehicleName} foi finalizada!`
              );
              setTrucks((prevTrucks) =>
                prevTrucks.filter((t) => t.id !== payload.collectId)
              );
              return;
            }

            setTrucks((prevTrucks) => {
              const routePath =
                payload.routePath?.map((position) => ({
                  lat: position.latitude,
                  lng: position.longitude
                })) ?? [];

              const newTruck: LiveTruck = {
                id: payload.collectId,
                lat: payload.latitude,
                lng: payload.longitude,
                carPlate: payload.carPlate,
                vehicleName: payload.vehicleName,
                routeId: payload.routeId,
                routePath
              };

              const existingIndex = prevTrucks.findIndex(
                (t) => t.id === newTruck.id
              );
              if (existingIndex >= 0) {
                const newTrucks = [...prevTrucks];
                const previousRoutePath =
                  newTrucks[existingIndex].routePath ?? [];
                newTrucks[existingIndex] = {
                  ...newTruck,
                  routePath:
                    routePath.length > 0
                      ? routePath
                      : [
                          ...previousRoutePath,
                          { lat: payload.latitude, lng: payload.longitude }
                        ]
                };
                return newTrucks;
              } else {
                return [
                  ...prevTrucks,
                  {
                    ...newTruck,
                    routePath:
                      routePath.length > 0
                        ? routePath
                        : [{ lat: payload.latitude, lng: payload.longitude }]
                  }
                ];
              }
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers.message);
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user?.cityId]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden">
      <div className="flex w-4/5 flex-col">
        <header className="bg-white mt-2 w-full p-6 shadow-sm">
          <Title>Monitoramento de Rotas</Title>
          <p className="mt-1 text-base text-gray-500">
            Visualize todas as coletas em andamento em tempo real.
            {trucks.length > 0 && (
              <span className="ml-2 font-bold text-green-600">
                ({trucks.length} veículos ativos)
              </span>
            )}
          </p>
        </header>

        <main className="flex-1 p-6">
          <div className="h-[80vh] w-full overflow-hidden rounded-xl shadow-lg">
            <>
              <GoogleMap
                onLoad={onMapLoad}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={14}
                center={center}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true
                }}
              >
                {trucks.map((truck) => {
                  const currentRoute = routesMap[truck.routeId];

                  const path = currentRoute
                    ? decodePolyline(currentRoute.polyline)
                    : [];

                  return (
                    <div key={truck.id}>
                      {/* 1. Desenha a Linha da Rota (Polyline) */}
                      {currentRoute && (
                        <Polyline
                          path={path}
                          options={{
                            strokeColor: "#00ADB4",
                            strokeOpacity: 0.8,
                            strokeWeight: 5
                          }}
                        />
                      )}

                      {truck.routePath.length > 1 && (
                        <Polyline
                          path={truck.routePath}
                          options={{
                            strokeColor: "#1D4ED8",
                            strokeOpacity: 0.95,
                            strokeWeight: 6,
                            zIndex: 2
                          }}
                        />
                      )}

                      {currentRoute &&
                        currentRoute.waypoints?.map((wp: any, idx: number) => (
                          <Marker
                            key={`${truck.id}-wp-${idx}`}
                            position={{ lat: wp.lat, lng: wp.lng }}
                            icon={{
                              path: window.google?.maps.SymbolPath.CIRCLE,
                              scale: 5,
                              fillColor: "#004A55",
                              fillOpacity: 1,
                              strokeWeight: 1,
                              strokeColor: "white"
                            }}
                          />
                        ))}

                      <Marker
                        position={{ lat: truck.lat, lng: truck.lng }}
                        title={`${truck.vehicleName} (${truck.carPlate})`}
                        zIndex={999}
                        icon={{
                          url: "/truck.png",
                          scaledSize: window.google?.maps
                            ? new window.google.maps.Size(30, 30)
                            : undefined,
                          anchor: window.google?.maps
                            ? new window.google.maps.Point(15, 15)
                            : undefined
                        }}
                        onMouseOver={() => setHoveredTruck(truck)}
                        onMouseOut={() => setHoveredTruck(null)}
                      />

                      {hoveredTruck?.id === truck.id && (
                        <OverlayViewF
                          position={{ lat: truck.lat, lng: truck.lng }}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                          getPixelPositionOffset={(width, height) => ({
                            x: -(width / 2),
                            y: -height - 20
                          })}
                        >
                          <div className="pointer-events-none flex flex-col items-center">
                            <div className="relative rounded-lg bg-white-900 px-4 py-3 shadow-xl">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-white whitespace-nowrap text-xs font-bold">
                                  {truck.vehicleName}
                                </span>
                                <span className="whitespace-nowrap text-[10px] font-medium text-slate-300">
                                  {truck.carPlate}
                                </span>
                              </div>

                              <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white-900"></div>
                            </div>
                          </div>
                        </OverlayViewF>
                      )}
                    </div>
                  );
                })}
              </GoogleMap>
            </>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RotasAndamento;
