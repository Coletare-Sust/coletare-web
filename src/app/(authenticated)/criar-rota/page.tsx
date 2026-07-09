/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer
} from "@react-google-maps/api";

import CreateRoute from "@/components/molecules/CreateRoute/createRoute";
import { useSearchParams } from "next/navigation";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { errorToast } from "@/hooks/useAppToast";
import {
  getWaypointLabel,
  mergePolylines,
  mergeDecodedPolylines,
  splitWaypointsIntoChunks
} from "@/utils/routeChunks";

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

  // Multiple responses — one per chunk when waypoints exceed the API limit.
  const [responses, setResponses] = useState<
    (google.maps.DirectionsResult | null)[]
  >([]);

  const isEdit = useSearchParams().get("isEdit");
  const routeId = useSearchParams().get("routeId");
  const isSpecial = useSearchParams().get("especial") === "true";

  const onMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  /** Chunks derived from the current waypoints list. */
  const waypointChunks = useMemo(
    () => splitWaypointsIntoChunks(waypoints),
    [waypoints]
  );

  /**
   * One DirectionsRequest per chunk. Each entry is only created when the chunk
   * has at least 2 points (origin + destination).
   */
  const directionsServiceOptionsList = useMemo<
    google.maps.DirectionsRequest[]
  >(() => {
    return waypointChunks
      .filter((chunk) => chunk.length >= 2)
      .map((chunk) => ({
        origin: chunk[0],
        destination: chunk[chunk.length - 1],
        waypoints: chunk.slice(1, chunk.length - 1).map((wp) => ({
          location: wp,
          stopover: true
        })),
        travelMode: "DRIVING" as google.maps.TravelMode
      }));
  }, [waypointChunks]);

  /**
   * Returns a callback for a specific chunk index.
   * Each callback updates only its own slot in the responses array.
   */
  const makeDirectionsCallback = useCallback(
    (chunkIndex: number) => (res: google.maps.DirectionsResult | null) => {
      if (res !== null && (res as any).status === "OK") {
        setResponses((prev) => {
          const next = [...prev];
          next[chunkIndex] = res;
          return next;
        });
      } else {
        console.error(`Directions chunk ${chunkIndex} failed:`, res);
      }
    },
    []
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
        errorToast("Adicione um endereço antes selecionar uma localização.");
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
      setResponses([]);
    }
  };

  /** Keyboard shortcut: Ctrl + Alt + = (or +) → add new waypoint input */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // key "=" is the unshifted "+" on most keyboards; also handle "+"
      if (e.ctrlKey && e.altKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setCount((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /** True only when ALL chunks have a successful response. */
  const allResponsesReady =
    responses.length === directionsServiceOptionsList.length &&
    directionsServiceOptionsList.length > 0 &&
    responses.every(Boolean);

  /**
   * Merged polyline string for persistence.
   * Passed down so CreateRoute can save the full multi-chunk route.
   */
  const mergedPolyline = useMemo(
    () => mergePolylines(responses),
    [responses]
  );

  /**
   * Decoded merged path — saved in Firebase so display screens can render
   * the full multi-chunk route as a plain <Polyline> with zero API cost.
   */
  const mergedPolylinePoints = useMemo(
    () => (allResponsesReady ? mergeDecodedPolylines(responses) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allResponsesReady, responses]
  );

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
              response={responses[0] ?? null}
              mergedPolyline={mergedPolyline}
              mergedPolylinePoints={mergedPolylinePoints}
              isEdit={isEdit === "true"}
              routeId={routeId}
              setAdresses={setAdresses}
              isSpecial={isSpecial}
              activeSuggestions={activeSuggestions}
              setActiveSuggestions={setActiveSuggestions}
            />

            {/* Custom sequential markers — shown while route is calculating or always visible */}
            {waypoints.map((waypoint, index) => (
              <Marker
                key={index}
                position={waypoint}
                // Hide default pin during rendering to avoid duplicate pins with DirectionsRenderer
                // We always keep our custom labeled markers visible for a consistent UX
                label={{
                  text: getWaypointLabel(index),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "11px"
                }}
                // Render above the DirectionsRenderer route line
                zIndex={10 + index}
              />
            ))}

            {/* One DirectionsService per chunk — each calls its own callback */}
            {waypoints.length > 1 &&
              directionsServiceOptionsList.map((opts, i) => (
                <DirectionsService
                  key={`ds-${i}-${opts.origin?.toString()}`}
                  options={opts}
                  callback={makeDirectionsCallback(i)}
                />
              ))}

            {/* One DirectionsRenderer per chunk — route line only, no default markers */}
            {responses.map(
              (res, i) =>
                res &&
                waypoints.length > 1 && (
                  <DirectionsRenderer
                    key={`dr-${i}`}
                    options={{
                      directions: res,
                      // Prevent each renderer from auto-fitting/panning the map
                      preserveViewport: true,
                      // Hide the default A/B/C markers — we draw our own above
                      suppressMarkers: true
                    }}
                  />
                )
            )}
          </GoogleMap>
        </>
      </div>
    </div>
  );
};

export default CriarRota;
