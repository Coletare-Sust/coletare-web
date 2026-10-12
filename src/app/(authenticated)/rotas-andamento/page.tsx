"use client";

import {
  GoogleMap,
  Marker,
  Polyline,
  OverlayView,
  OverlayViewF
} from "@react-google-maps/api";
import { useEffect, useState, useMemo, useRef } from "react";
import { ChevronRight, Radio, Truck } from "lucide-react";
import Title from "@/components/atoms/Title/title";

import { Client, ReconnectionTimeMode } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useCity from "@/hooks/queries/useCity";
import useRoutes from "@hooks/queries/useAllRoutes";
import { successToast } from "@/hooks/useAppToast";
import { getCollect } from "@/store/services/collect";

import { decodePolyline } from "@utils/decodePolyline";
import {
  getRoutePointHeading,
  isRoutePoint,
  normalizeRoutePoint,
  RoutePoint
} from "@/utils/coordinates";
import { RouteEntity } from "@/common/entities/route";
import { getApiUrl } from "@/config/api";
import { apiFetch, AUTHORIZATION_EXPIRED_EVENT } from "@/utils/apiFetch";

interface LiveTruck {
  id: string;
  lat: number;
  lng: number;
  carPlate: string;
  vehicleName: string;
  routeId: string;
  routePath: RoutePoint[];
  heading: number;
  lastSeenAt: number;
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
  hasEnded?: boolean | string;
  status?: string;
}

const defaultMapCenter = {
  lat: -8.3369,
  lng: -36.4251
};

const LIVE_TRUCK_TTL_MS = 2 * 60 * 1000;
const LIVE_TRUCK_CLEANUP_INTERVAL_MS = 15 * 1000;
const COLLECT_STATUS_RECONCILIATION_MS = 30 * 1000;
const FOLLOW_ZOOM = 16;
const STOMP_RECONNECT_BASE_DELAY_MS = 3000;
const STOMP_RECONNECT_MAX_DELAY_MS = 30 * 1000;
// Depois de N handshakes seguidos sem sucesso (ex.: JWT de 1 h expirou e o /ws responde 401),
// valida a sessao em /auth/me. Um 401 la dispara o evento de sessao expirada e paramos de tentar.
const STOMP_FAILURES_BEFORE_SESSION_CHECK = 5;

function parseLiveLocationPayload(body: string): LiveLocationPayload | null {
  try {
    const payload = JSON.parse(body);
    return payload && typeof payload === "object"
      ? (payload as LiveLocationPayload)
      : null;
  } catch (error) {
    console.error("Mensagem de localizacao invalida:", error);
    return null;
  }
}

function hasCollectEnded(payload: LiveLocationPayload) {
  if (
    payload.hasEnded === true ||
    payload.hasEnded?.toString().toLowerCase() === "true"
  ) {
    return true;
  }

  return ["ended", "finished", "finalized", "completed"].includes(
    payload.status?.toLowerCase() ?? ""
  );
}

const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f3f5f6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6670" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f3f5f6" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d7dde1" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#e1e6e9" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#cbd4d8" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbe9ed" }]
  }
];

const RotasAndamento = () => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const { data: city } = useCity(user?.cityId ?? null);

  const [trucks, setTrucks] = useState<LiveTruck[]>([]);
  const [hoveredTruck, setHoveredTruck] = useState<LiveTruck | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const [center, setCenter] = useState(defaultMapCenter);
  const [mapZoom, setMapZoom] = useState(FOLLOW_ZOOM);
  const locationStatus = useRef<"pending" | "success" | "error">("pending");
  const selectedTruckIdRef = useRef<string | null>(null);
  const trucksRef = useRef<LiveTruck[]>([]);
  const endedCollectIdsRef = useRef(new Set<string>());

  const cityId = user?.cityId;
  const { data: allRoutes } = useRoutes(cityId ?? "");

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Guarda onde o usuário deixou o mapa, para qualquer re-render reaplicar essa posição.
  const onMapDragEnd = () => {
    const nextCenter = mapRef.current?.getCenter();

    if (nextCenter) {
      setCenter({ lat: nextCenter.lat(), lng: nextCenter.lng() });
    }
  };

  const onMapZoomChanged = () => {
    const nextZoom = mapRef.current?.getZoom();

    if (nextZoom) {
      setMapZoom(nextZoom);
    }
  };

  const routesMap = useMemo(() => {
    if (!allRoutes) return {};

    return allRoutes.reduce<Record<string, RouteEntity>>((acc, route) => {
      acc[route.id] = route;
      return acc;
    }, {});
  }, [allRoutes]);

  const selectedTruck = useMemo(
    () => trucks.find((truck) => truck.id === selectedTruckId) ?? null,
    [selectedTruckId, trucks]
  );

  const focusTruck = (truck: LiveTruck) => {
    const position = { lat: truck.lat, lng: truck.lng };

    setSelectedTruckId(truck.id);
    setCenter(position);
    mapRef.current?.panTo(position);
  };

  useEffect(() => {
    selectedTruckIdRef.current = selectedTruckId;
  }, [selectedTruckId]);

  useEffect(() => {
    trucksRef.current = trucks;
  }, [trucks]);

  useEffect(() => {
    if (navigator.geolocation && locationStatus.current === "pending") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationStatus.current = "success";
          if (selectedTruckIdRef.current) return;

          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          locationStatus.current = "error";
          if (
            !selectedTruckIdRef.current &&
            city?.latitude &&
            city?.longitude
          ) {
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
      locationStatus.current !== "success" &&
      !selectedTruckId
    ) {
      setCenter({ lat: city.latitude, lng: city.longitude });
    }
  }, [city?.latitude, city?.longitude, selectedTruckId]);

  useEffect(() => {
    if (!user?.cityId) return;

    const socketUrl = `${getApiUrl()}/ws`;
    let consecutiveFailures = 0;
    let connectedSinceLastClose = false;
    let stopped = false;

    const stompClient = new Client({
      // Cria um SockJS novo a cada (re)conexão: reutilizar uma instância fechada
      // impede o STOMP de reconectar depois de uma queda ou handshake recusado.
      webSocketFactory: () => new SockJS(socketUrl) as any,
      reconnectDelay: STOMP_RECONNECT_BASE_DELAY_MS,
      // Backoff exponencial (3 s, 6 s, 12 s...) com teto; volta ao valor base ao conectar.
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      maxReconnectDelay: STOMP_RECONNECT_MAX_DELAY_MS,
      debug: () => {
        // console.log("STOMP debug");
      },
      onConnect: () => {
        consecutiveFailures = 0;
        connectedSinceLastClose = true;
        console.log(
          `STOMP conectado, inscrevendo-se em: /topic/locations/${user.cityId}`
        );
        stompClient.subscribe(`/topic/locations/${user.cityId}`, (message) => {
          if (message.body) {
            const payload = parseLiveLocationPayload(message.body);
            if (!payload) return;

            if (hasCollectEnded(payload)) {
              if (endedCollectIdsRef.current.has(payload.collectId)) {
                return;
              }

              endedCollectIdsRef.current.add(payload.collectId);
              successToast(
                `A coleta do veículo ${payload.vehicleName} foi finalizada!`
              );
              setTrucks((prevTrucks) =>
                prevTrucks.filter((t) => t.id !== payload.collectId)
              );
              return;
            }

            if (endedCollectIdsRef.current.has(payload.collectId)) {
              return;
            }

            const currentPosition = normalizeRoutePoint(
              payload.latitude,
              payload.longitude
            );

            if (!currentPosition) {
              return;
            }

            setTrucks((prevTrucks) => {
              const routePath =
                payload.routePath
                  ?.map((position) =>
                    normalizeRoutePoint(position.latitude, position.longitude)
                  )
                  .filter(isRoutePoint) ?? [];

              const existingTruck = prevTrucks.find(
                (truck) => truck.id === payload.collectId
              );
              const previousRoutePoint = [...routePath]
                .reverse()
                .find(
                  (point) =>
                    point.lat !== currentPosition.lat ||
                    point.lng !== currentPosition.lng
                );
              const previousPoint = existingTruck
                ? { lat: existingTruck.lat, lng: existingTruck.lng }
                : previousRoutePoint ?? null;

              const newTruck: LiveTruck = {
                id: payload.collectId,
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                carPlate: payload.carPlate,
                vehicleName: payload.vehicleName,
                routeId: payload.routeId,
                routePath,
                heading: getRoutePointHeading(
                  previousPoint,
                  currentPosition,
                  existingTruck?.heading
                ),
                lastSeenAt: Date.now()
              };

              const existingIndex = prevTrucks.findIndex(
                (t) => t.id === newTruck.id
              );
              if (existingIndex >= 0) {
                const newTrucks = [...prevTrucks];
                const previousRoutePath =
                  newTrucks[existingIndex].routePath
                    ?.map((position) =>
                      normalizeRoutePoint(position.lat, position.lng)
                    )
                    .filter(isRoutePoint) ?? [];
                newTrucks[existingIndex] = {
                  ...newTruck,
                  routePath:
                    routePath.length > 0
                      ? routePath
                      : [...previousRoutePath, currentPosition]
                };
                return newTrucks;
              } else {
                return [
                  ...prevTrucks,
                  {
                    ...newTruck,
                    routePath:
                      routePath.length > 0 ? routePath : [currentPosition]
                  }
                ];
              }
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers.message);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
      onWebSocketClose: () => {
        if (connectedSinceLastClose) {
          connectedSinceLastClose = false;
          return;
        }

        consecutiveFailures += 1;
        if (
          stopped ||
          consecutiveFailures % STOMP_FAILURES_BEFORE_SESSION_CHECK !== 0
        ) {
          return;
        }

        // Um 401 aqui dispara AUTHORIZATION_EXPIRED_EVENT (tratado abaixo e pelo
        // provider de autenticacao). Outros erros (backend fora do ar) mantem o backoff.
        apiFetch("/auth/me").catch(() => undefined);
      }
    });

    const stopReconnecting = () => {
      stopped = true;
      stompClient.deactivate();
    };

    window.addEventListener(AUTHORIZATION_EXPIRED_EVENT, stopReconnecting);
    stompClient.activate();

    return () => {
      window.removeEventListener(AUTHORIZATION_EXPIRED_EVENT, stopReconnecting);
      stopReconnecting();
    };
  }, [user?.cityId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setTrucks((prevTrucks) =>
        prevTrucks.filter(
          (truck) => now - truck.lastSeenAt <= LIVE_TRUCK_TTL_MS
        )
      );
    }, LIVE_TRUCK_CLEANUP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const reconcileCollectStatuses = async () => {
      const activeTrucks = trucksRef.current;
      if (!activeTrucks.length) return;

      const endedCollectIds = (
        await Promise.all(
          activeTrucks.map(async (truck) => {
            const collect = await getCollect(truck.id);

            return "hasEnded" in collect && collect.hasEnded ? truck.id : null;
          })
        )
      ).filter((collectId): collectId is string => collectId !== null);

      if (!endedCollectIds.length) return;

      endedCollectIds.forEach((collectId) =>
        endedCollectIdsRef.current.add(collectId)
      );
      setTrucks((currentTrucks) =>
        currentTrucks.filter((truck) => !endedCollectIds.includes(truck.id))
      );
    };

    const interval = window.setInterval(
      reconcileCollectStatuses,
      COLLECT_STATUS_RECONCILIATION_MS
    );

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedTruckId((currentId) => {
      if (currentId && trucks.some((truck) => truck.id === currentId)) {
        return currentId;
      }

      return trucks[0]?.id ?? null;
    });
  }, [trucks]);

  // Centraliza apenas quando o veículo selecionado muda. Reagir a cada posição nova
  // (selectedTruck é recriado a cada mensagem) devolvia a câmera ao caminhão e
  // descartava o pan/zoom que o usuário tinha escolhido.
  useEffect(() => {
    if (!selectedTruckId) return;

    const truck = trucksRef.current.find((item) => item.id === selectedTruckId);
    if (!truck) return;

    const position = { lat: truck.lat, lng: truck.lng };
    setCenter(position);
    mapRef.current?.panTo(position);
  }, [selectedTruckId]);

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <header className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
          <Title>Monitoramento de Rotas</Title>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Radio className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            {trucks.length} veiculos ativos
          </p>
        </header>

        <main>
          <div className="relative h-[72vh] min-h-[540px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
            <div className="absolute inset-0">
              <GoogleMap
                onLoad={onMapLoad}
                onZoomChanged={onMapZoomChanged}
                onDragEnd={onMapDragEnd}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={mapZoom}
                center={center}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  minZoom: 14,
                  maxZoom: 20,
                  clickableIcons: false,
                  keyboardShortcuts: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  mapTypeControl: false,
                  gestureHandling: "greedy",
                  backgroundColor: "#dbe9ed",
                  styles: mapStyles
                }}
              >
                {selectedTruck &&
                  (() => {
                    const truck = selectedTruck;
                    const currentRoute = routesMap[truck.routeId];

                    const path = currentRoute
                      ? decodePolyline(currentRoute.polyline)
                          .map((point) =>
                            normalizeRoutePoint(point.lat, point.lng)
                          )
                          .filter(isRoutePoint)
                      : [];

                    return (
                      <div key={truck.id}>
                        {path.length > 1 && (
                          <Polyline
                            path={path}
                            options={{
                              strokeColor: "#11A8A0",
                              strokeOpacity: 0.72,
                              strokeWeight: 5,
                              zIndex: 1
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
                          currentRoute.waypoints?.map(
                            (wp: any, idx: number) => (
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
                            )
                          )}

                        <OverlayViewF
                          position={{ lat: truck.lat, lng: truck.lng }}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                          getPixelPositionOffset={(width, height) => ({
                            x: -(width / 2),
                            y: -(height / 2)
                          })}
                        >
                          <button
                            type="button"
                            aria-label={`Acompanhar ${truck.vehicleName}`}
                            onMouseEnter={() => setHoveredTruck(truck)}
                            onMouseLeave={() => setHoveredTruck(null)}
                            onClick={() => focusTruck(truck)}
                            className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center bg-transparent p-0"
                          >
                            <img
                              src="/truck-3d-top.png"
                              alt=""
                              className="h-[54px] w-[54px] select-none object-contain drop-shadow-[0_4px_4px_rgba(15,23,42,0.35)] transition-transform duration-700 ease-out"
                              style={{
                                transform: `rotate(${truck.heading}deg)`
                              }}
                            />
                          </button>
                        </OverlayViewF>

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
                              <div className="relative rounded-lg bg-slate-900 px-4 py-3 shadow-xl">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-white whitespace-nowrap text-xs font-bold">
                                    {truck.vehicleName}
                                  </span>
                                  <span className="whitespace-nowrap text-[10px] font-medium text-slate-300">
                                    {truck.carPlate}
                                  </span>
                                </div>

                                <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-slate-900"></div>
                              </div>
                            </div>
                          </OverlayViewF>
                        )}
                      </div>
                    );
                  })()}
              </GoogleMap>
            </div>

            <aside className="bg-white/95 absolute left-4 top-4 z-10 flex max-h-[calc(100%-2rem)] w-[min(21rem,calc(100%-2rem))] flex-col overflow-hidden rounded-lg border border-slate-200 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <Truck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Veiculos em rota
                  </p>
                  <p className="text-xs text-slate-500">
                    Selecione um veiculo para acompanhar
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto p-2">
                {trucks.length ? (
                  trucks.map((truck) => {
                    const isSelected = truck.id === selectedTruckId;

                    return (
                      <button
                        key={truck.id}
                        type="button"
                        onClick={() => focusTruck(truck)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors last:mb-0 ${
                          isSelected
                            ? "text-white bg-teal-700"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            isSelected ? "bg-emerald-300" : "bg-emerald-500"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {truck.vehicleName}
                          </span>
                          <span
                            className={`block truncate text-xs ${
                              isSelected ? "text-teal-100" : "text-slate-500"
                            }`}
                          >
                            {truck.carPlate}
                          </span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">
                    Nenhuma coleta ativa agora.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RotasAndamento;
