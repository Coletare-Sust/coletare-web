/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  OverlayViewF,
  Polyline
} from "@react-google-maps/api";

import CreateRoute from "@/components/molecules/CreateRoute/createRoute";
import MapPanel from "@/components/molecules/MapPanel/mapPanel";
import { apiFetch } from "@/utils/apiFetch";
import { useSearchParams } from "next/navigation";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { errorToast } from "@/hooks/useAppToast";
import useRoute from "@/hooks/queries/useRoute";

const position = {
  lat: -8.05224,
  lng: -34.928612
};

const CriarRota = () => {
  const [count, setCount] = useState(1);
  const [map, setMap] = React.useState<google.maps.Map>();
  const [initialCenter, setInitialCenter] = useState(position);
  const [waypoints, setWaypoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [adresses, setAdresses] = useState<{ adress: string; index: number }[]>(
    []
  );
  const [activeSuggestions, setActiveSuggestions] = useState<
    WithdrawalsRequestEntity[]
  >([]);

  const [polylineEncoded, setPolylineEncoded] = useState<string | null>(null);
  const [decodedPath, setDecodedPath] = useState<google.maps.LatLngLiteral[]>(
    []
  );
  const [isCalculatingPolyline, setIsCalculatingPolyline] = useState(false);
  const [polylineError, setPolylineError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const hydratedRouteIdRef = useRef<string | null>(null);

  const isEdit = useSearchParams().get("isEdit");
  const routeId = useSearchParams().get("routeId");
  const isSpecial = useSearchParams().get("especial") === "true";
  const { data: routeToEdit } = useRoute(routeId ?? "");
  const isRouteCalculated = decodedPath.length > 1;

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const fetchPolyline = useCallback(
    async (wps: google.maps.LatLngLiteral[]) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsCalculatingPolyline(true);
      setPolylineError(null);

      try {
        const data = await apiFetch<{
          polyline: string;
          polylinePoints?: google.maps.LatLngLiteral[] | null;
        }>("/route/calculate-polyline", {
          method: "POST",
          body: JSON.stringify({ waypoints: wps }),
          signal: controller.signal
        });

        const encoded = data.polyline;
        const path =
          data.polylinePoints && data.polylinePoints.length > 0
            ? data.polylinePoints
            : google.maps.geometry.encoding
                .decodePath(encoded)
                .map((p) => ({ lat: p.lat(), lng: p.lng() }));

        setPolylineEncoded(encoded);
        setDecodedPath(path);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        setPolylineEncoded(null);
        setDecodedPath([]);
        setPolylineError("Nao foi possivel calcular o caminho da rota.");
        errorToast("Nao foi possivel calcular o caminho da rota.");
        console.error("Erro ao calcular polyline:", err);
      } finally {
        if (
          abortControllerRef.current === controller &&
          !controller.signal.aborted
        ) {
          setIsCalculatingPolyline(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    setDecodedPath([]);
    setPolylineEncoded(null);
    setPolylineError(null);
    setIsCalculatingPolyline(false);
    abortControllerRef.current?.abort();
  }, [waypoints]);

  useEffect(() => {
    if (
      isEdit !== "true" ||
      !routeId ||
      !routeToEdit ||
      hydratedRouteIdRef.current === routeId ||
      waypoints.length !== routeToEdit.waypoints.length
    ) {
      return;
    }

    const savedPath =
      routeToEdit.polylinePoints && routeToEdit.polylinePoints.length > 0
        ? routeToEdit.polylinePoints
        : routeToEdit.polyline &&
          typeof google !== "undefined" &&
          google.maps?.geometry?.encoding
        ? google.maps.geometry.encoding
            .decodePath(routeToEdit.polyline)
            .map((p) => ({ lat: p.lat(), lng: p.lng() }))
        : [];

    if (savedPath.length <= 1) return;

    setPolylineEncoded(routeToEdit.polyline);
    setDecodedPath(savedPath);
    setPolylineError(null);
    hydratedRouteIdRef.current = routeId;
  }, [isEdit, routeId, routeToEdit, waypoints.length]);

  const handleCalculatePolyline = useCallback(() => {
    if (waypoints.length <= 1) {
      errorToast("Adicione ao menos 2 enderecos para calcular a rota.");
      setPolylineError("Adicione ao menos 2 enderecos para calcular a rota.");
      return;
    }

    fetchPolyline(waypoints);
  }, [fetchPolyline, waypoints]);

  const getCalculatedWaypointIcon = (
    index: number
  ): google.maps.Symbol | undefined => {
    if (typeof google === "undefined") return undefined;

    const isEndpoint = index === 0 || index === waypoints.length - 1;

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: isEndpoint ? 7 : 6,
      fillColor: isEndpoint ? "#004A55" : "#00ADB4",
      fillOpacity: 1,
      strokeColor: "white",
      strokeWeight: isEndpoint ? 3 : 2
    };
  };

  const renderEndpointLabel = (
    position: google.maps.LatLngLiteral,
    label: string
  ) => (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height - 20
      })}
    >
      <div className="pointer-events-none flex flex-col items-center">
        <div className="relative rounded-md bg-greenBlue-1000 px-3 py-2 text-xs font-bold text-white-1000 shadow-lg">
          {label}
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-greenBlue-1000" />
        </div>
      </div>
    </OverlayViewF>
  );

  const getAddressFromCoordinates = (latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results) {
          const newArray = [...adresses];
          newArray[count - 1] = {
            adress: results[0].formatted_address,
            index: count - 1
          };
          setAdresses(newArray);
        } else {
          console.warn("No results found");
        }
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (count === 0 || count === waypoints.length) {
        errorToast("Adicione um endereco antes selecionar uma localizacao.");
        return;
      }

      if (count === waypoints.length) return;

      const location = {
        lat: event.latLng!.lat(),
        lng: event.latLng!.lng()
      };

      getAddressFromCoordinates(event.latLng!);

      const newArray = [...waypoints];
      newArray[count - 1] = location;
      setWaypoints(newArray);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, waypoints]
  );

  const handleDeleteWaypoint = (index: number) => {
    const toRemoveWaypoint = waypoints[index];

    const isSuggestion = activeSuggestions.some(
      (suggestion) =>
        suggestion.latitude === toRemoveWaypoint.lat &&
        suggestion.longitude === toRemoveWaypoint.lng
    );

    if (isSuggestion) {
      const newActiveSuggestions = activeSuggestions.filter(
        (suggestion) =>
          suggestion.latitude !== toRemoveWaypoint.lat &&
          suggestion.longitude !== toRemoveWaypoint.lng
      );
      setActiveSuggestions(newActiveSuggestions);
    }

    const newWaypointsArray = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypointsArray);
    const newAdressesArray = adresses.filter((_, i) => i !== index);
    setAdresses(newAdressesArray);

    setCount((prev) => prev - 1);

    if (newWaypointsArray.length <= 1) {
      setPolylineEncoded(null);
      setDecodedPath([]);
    }
  };

  return (
    <div className="relative -m-4 h-[calc(100dvh-4rem)] overflow-hidden sm:-m-6">
      <div className="h-full w-full">
        <>
          <GoogleMap
            onLoad={onMapLoad}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={initialCenter}
            zoom={15}
            onClick={handleMapClick}
          >
            <MapPanel
              label="painel da rota"
              className="lg:left-11 lg:top-12 lg:h-[85%]"
            >
              <CreateRoute
                className="h-auto max-h-[50dvh] rounded-none p-5 lg:h-full lg:max-h-none lg:rounded-lg lg:p-8"
                waypoints={waypoints}
                setWaypoints={setWaypoints}
                setInitialCenter={setInitialCenter}
                map={map}
                count={count}
                setCount={setCount}
                adresses={adresses}
                handleDeleteWaypoint={handleDeleteWaypoint}
                polylineEncoded={polylineEncoded}
                polylinePoints={decodedPath}
                isCalculatingPolyline={isCalculatingPolyline}
                polylineError={polylineError}
                onCalculatePolyline={handleCalculatePolyline}
                isEdit={isEdit === "true"}
                routeId={routeId}
                setAdresses={setAdresses}
                isSpecial={isSpecial}
                activeSuggestions={activeSuggestions}
                setActiveSuggestions={setActiveSuggestions}
              />
            </MapPanel>

            {isRouteCalculated && (
              <Polyline
                key={polylineEncoded ?? "calculated-route"}
                path={decodedPath}
                options={{
                  strokeColor: "#00ADB4",
                  strokeWeight: 4,
                  strokeOpacity: 1
                }}
              />
            )}

            {!isRouteCalculated &&
              waypoints.map((waypoint, index) => (
                <Marker key={index} position={waypoint} />
              ))}

            {isRouteCalculated &&
              waypoints.map((waypoint, index) => (
                <Marker
                  key={`${waypoint.lat}-${waypoint.lng}-${index}`}
                  position={waypoint}
                  icon={getCalculatedWaypointIcon(index)}
                  zIndex={
                    index === 0 || index === waypoints.length - 1 ? 11 : 10
                  }
                />
              ))}

            {isRouteCalculated &&
              waypoints[0] &&
              renderEndpointLabel(waypoints[0], "Inicio")}

            {isRouteCalculated &&
              waypoints[waypoints.length - 1] &&
              renderEndpointLabel(waypoints[waypoints.length - 1], "Fim")}
          </GoogleMap>
        </>
      </div>
    </div>
  );
};

export default CriarRota;
