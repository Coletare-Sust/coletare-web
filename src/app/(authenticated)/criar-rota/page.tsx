/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

import CreateRoute from "@/components/molecules/CreateRoute/createRoute";
import { apiFetch } from "@/utils/apiFetch";
import { useSearchParams } from "next/navigation";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { errorToast } from "@/hooks/useAppToast";

const DEBOUNCE_MS = 1500;

const position = {
  lat: -8.05224,
  lng: -34.928612,
};

const CriarRota = () => {
  const [count, setCount] = useState(1);
  const [map, setMap] = React.useState<google.maps.Map>();
  const [initialCenter, setInitialCenter] = useState(position);
  const [waypoints, setWaypoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [adresses, setAdresses] = useState<{ adress: string; index: number }[]>(
    [],
  );
  const [activeSuggestions, setActiveSuggestions] = useState<
    WithdrawalsRequestEntity[]
  >([]);

  // Substitui response: DirectionsResult — agora vem do backend
  const [polylineEncoded, setPolylineEncoded] = useState<string | null>(null);
  const [decodedPath, setDecodedPath] = useState<google.maps.LatLngLiteral[]>(
    [],
  );
  const [isCalculatingPolyline, setIsCalculatingPolyline] = useState(false);
  const [polylineError, setPolylineError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEdit = useSearchParams().get("isEdit");
  const routeId = useSearchParams().get("routeId");
  const isSpecial = useSearchParams().get("especial") === "true";

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  /**
   * Chama o backend para calcular a polyline.
   * Usa AbortController para cancelar a chamada anterior se os waypoints mudarem.
   * Nunca chama o Google Maps diretamente — a chave fica no servidor.
   */
  const fetchPolyline = useCallback(
    async (wps: google.maps.LatLngLiteral[]) => {
      // Cancela a requisição anterior se ainda estiver pendente
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
          signal: controller.signal,
        });
        const encoded: string = data.polyline;

        setPolylineEncoded(encoded);

        // Decodifica para renderizar o <Polyline> — operação local, sem custo
        const path =
          data.polylinePoints && data.polylinePoints.length > 0
            ? data.polylinePoints
            : google.maps.geometry.encoding
                .decodePath(encoded)
                .map((p) => ({ lat: p.lat(), lng: p.lng() }));
        setDecodedPath(path);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Cancelado intencionalmente — não é erro
          return;
        }
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
    [],
  );

  /**
   * Debounce: só dispara a chamada ao backend após 1.5s de inatividade nos waypoints.
   * Isso evita chamadas durante interação rápida (digitação, múltiplos cliques).
   */
  useEffect(() => {
    if (waypoints.length < 2) {
      setDecodedPath([]);
      setPolylineEncoded(null);
      setPolylineError(null);
      setIsCalculatingPolyline(false);
      abortControllerRef.current?.abort();
      return;
    }

    setDecodedPath([]);
    setPolylineEncoded(null);
    setPolylineError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchPolyline(waypoints);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [waypoints, fetchPolyline]);

  const getAddressFromCoordinates = (latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results) {
          const newArray = [...adresses];
          newArray[count - 1] = {
            adress: results[0].formatted_address,
            index: count - 1,
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
        errorToast("Adicione um endereço antes selecionar uma localização.");
        return;
      }

      if (count === waypoints.length) return;

      const location = {
        lat: event.latLng!.lat(),
        lng: event.latLng!.lng(),
      };

      getAddressFromCoordinates(event.latLng!);

      const newArray = [...waypoints];
      newArray[count - 1] = location;
      setWaypoints(newArray);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, waypoints],
  );

  const handleDeleteWaypoint = (index: number) => {
    const toRemoveWaypoint = waypoints[index];

    const isSuggestion = activeSuggestions.some(
      (suggestion) =>
        suggestion.latitude === toRemoveWaypoint.lat &&
        suggestion.longitude === toRemoveWaypoint.lng,
    );

    if (isSuggestion) {
      const newActiveSuggestions = activeSuggestions.filter(
        (suggestion) =>
          suggestion.latitude !== toRemoveWaypoint.lat &&
          suggestion.longitude !== toRemoveWaypoint.lng,
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
    <div className="h-[calc(100vh-76px)] w-full">
      <div className="h-full w-full">
        <>
          <GoogleMap
            onLoad={onMapLoad}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={initialCenter}
            zoom={15}
            onClick={handleMapClick}
          >
            <CreateRoute
              className="absolute left-11 top-12 z-10"
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
              isEdit={isEdit === "true"}
              routeId={routeId}
              setAdresses={setAdresses}
              isSpecial={isSpecial}
              activeSuggestions={activeSuggestions}
              setActiveSuggestions={setActiveSuggestions}
            />

            {/* Markers enquanto a polyline ainda não foi calculada */}
            {decodedPath.length === 0 &&
              waypoints.length > 0 &&
              waypoints.map((waypoint, index) => (
                <Marker key={index} position={waypoint} />
              ))}

            {/* Polyline renderizada localmente — zero custo com Google */}
            {decodedPath.length > 1 && (
              <Polyline
                path={decodedPath}
                options={{
                  strokeColor: "#16a34a",
                  strokeWeight: 4,
                  strokeOpacity: 0.85,
                }}
              />
            )}
          </GoogleMap>
        </>
      </div>
    </div>
  );
};

export default CriarRota;
