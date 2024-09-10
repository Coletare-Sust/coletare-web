/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  LoadScript,
  DirectionsService,
  DirectionsRenderer
} from "@react-google-maps/api";

import CreateRoute from "@/components/molecules/CreateRoute/createRoute";
import { useSearchParams } from "next/navigation";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import { errorToast } from "@/hooks/useAppToast";

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
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(
    null
  );

  const isEdit = useSearchParams().get("isEdit");
  const routeId = useSearchParams().get("routeId");

  const isSpecial = useSearchParams().get("especial") === "true";

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const directionsServiceOptions =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useMemo<google.maps.DirectionsRequest>(() => {
      return {
        origin: waypoints[0],
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(1, waypoints.length - 1).map((waypoint) => {
          return {
            location: waypoint,
            stopover: true
          };
        }),
        travelMode: "DRIVING"
      };
    }, [waypoints]);

  const directionsCallback = useCallback((res: any) => {
    if (res !== null && res.status === "OK") {
      setResponse(res);
    } else {
      console.error(res);
    }
  }, []);

  const directionsRendererOptions: google.maps.DirectionsRendererOptions =
    React.useMemo(() => {
      return {
        directions: response
      };
    }, [response]);

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
      setResponse(null);
    }
  };

  return (
    <div className="h-[calc(100vh-76px)] w-full">
      <div className="h-full w-full">
        <LoadScript
          googleMapsApiKey={
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
          }
          libraries={["places"]}
        >
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
              response={response}
              isEdit={isEdit === "true"}
              routeId={routeId}
              setAdresses={setAdresses}
              isSpecial={isSpecial}
              activeSuggestions={activeSuggestions}
              setActiveSuggestions={setActiveSuggestions}
            />
            {!response &&
              waypoints.length > 0 &&
              waypoints.map((waypoint, index) => (
                <Marker key={index} position={waypoint} />
              ))}
            {waypoints.length > 1 && (
              <DirectionsService
                options={directionsServiceOptions}
                callback={directionsCallback}
              />
            )}
            {response && directionsRendererOptions && waypoints.length > 1 && (
              <DirectionsRenderer options={directionsRendererOptions} />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default CriarRota;
