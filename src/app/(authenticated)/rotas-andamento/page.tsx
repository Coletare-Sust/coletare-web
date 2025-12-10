"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  OverlayView,
  OverlayViewF
} from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import Title from "@/components/atoms/Title/title";

import { ref, onValue, off, getDatabase } from "firebase/database";
import firebaseApp from "@/config/firebase";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useRoutes from "@hooks/queries/useAllRoutes";

import { decodePolyline } from "@utils/decodePolyline";

interface LiveTruck {
  id: string;
  lat: number;
  lng: number;
  carPlate: string;
  vehicleName: string;
  routeId: string;
}

const mapCenter = {
  lat: -8.3369,
  lng: -36.4251
};

const RotasAndamento = () => {
  const [, setMap] = useState<google.maps.Map>();

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const [trucks, setTrucks] = useState<LiveTruck[]>([]);

  const [hoveredTruck, setHoveredTruck] = useState<LiveTruck | null>(null);

  const cityId = user?.cityId;
  const { data: allRoutes } = useRoutes(cityId!);

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const routesMap = useMemo(() => {
    if (!allRoutes) return {};

    return allRoutes.reduce((acc: any, route: any) => {
      acc[route.id] = route;
      return acc;
    }, {});
  }, [allRoutes]);

  useEffect(() => {
    if (!user?.cityId) return;

    const liveMapRef = ref(
      getDatabase(firebaseApp),
      `live_map_data/${user.cityId}`
    );
    console.log(`Iniciando monitoramento em: live_map_data/${user.cityId}`);

    const unsubscribe = onValue(liveMapRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const trucksArray = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            ...value
          })
        );
        setTrucks(trucksArray);
      } else {
        setTrucks([]);
      }
    });

    return () => off(liveMapRef);
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
            <LoadScript
              googleMapsApiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
              }
              libraries={["places", "geometry"]}
              loadingElement={
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <p>Carregando Mapa...</p>
                </div>
              }
            >
              <GoogleMap
                onLoad={onMapLoad}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={14}
                center={mapCenter}
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
            </LoadScript>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RotasAndamento;
