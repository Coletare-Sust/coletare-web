"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DirectionsRenderer,
  DirectionsService,
  Marker,
  Polyline
} from "@react-google-maps/api";
import { splitWaypointsIntoChunks } from "@/utils/routeChunks";
import { decodePolyline } from "@/utils/decodePolyline";

interface RouteMapDisplayProps {
  waypoints: google.maps.LatLngLiteral[];
  /**
   * Pre-decoded path saved on route creation.
   * When provided, renders a plain <Polyline> with zero API cost.
   */
  polylinePoints?: { lat: number; lng: number }[];
  /**
   * Legacy encoded polyline string (stored before polylinePoints existed).
   * Will be decoded locally (free) when polylinePoints is absent.
   * Only falls back to the paid Directions API if both are absent/invalid.
   */
  encodedPolyline?: string;
  showMarkers?: boolean;
  strokeColor?: string;
  strokeWeight?: number;
}

// ─── Shared markers renderer ──────────────────────────────────────────────────

const WaypointMarkers = ({
  waypoints
}: {
  waypoints: google.maps.LatLngLiteral[];
}) => (
  <>
    {waypoints.map((wp, i) => (
      <Marker
        key={`wm-${i}`}
        position={wp}
        label={{ text: String(i + 1), color: "white", fontSize: "12px" }}
        zIndex={10 + i}
      />
    ))}
  </>
);

// ─── Free path A: pre-decoded points from DB ──────────────────────────────────

const StaticPolyline = ({
  path,
  waypoints,
  showMarkers,
  strokeColor,
  strokeWeight
}: {
  path: { lat: number; lng: number }[];
  waypoints: google.maps.LatLngLiteral[];
  showMarkers?: boolean;
  strokeColor?: string;
  strokeWeight?: number;
}) => (
  <>
    <Polyline
      path={path}
      options={{ strokeColor, strokeWeight, strokeOpacity: 1 }}
    />
    {showMarkers && <WaypointMarkers waypoints={waypoints} />}
  </>
);

// ─── Paid fallback: Directions API chunks (only for corrupted legacy routes) ──

const DirectionsFallback = ({
  waypoints,
  showMarkers,
  strokeColor,
  strokeWeight
}: Omit<RouteMapDisplayProps, "polylinePoints" | "encodedPolyline">) => {
  const [responses, setResponses] = useState<
    (google.maps.DirectionsResult | null)[]
  >([]);

  const waypointChunks = useMemo(
    () => splitWaypointsIntoChunks(waypoints),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(waypoints)]
  );

  const directionsRequests = useMemo<google.maps.DirectionsRequest[]>(
    () =>
      waypointChunks
        .filter((chunk) => chunk.length >= 2)
        .map((chunk) => ({
          origin: chunk[0],
          destination: chunk[chunk.length - 1],
          waypoints: chunk.slice(1, chunk.length - 1).map((wp) => ({
            location: wp,
            stopover: true
          })),
          travelMode: "DRIVING" as google.maps.TravelMode
        })),
    [waypointChunks]
  );

  useEffect(() => {
    setResponses([]);
  }, [waypointChunks]);

  const makeCallback = useCallback(
    (index: number) => (res: google.maps.DirectionsResult | null) => {
      if (res && (res as any).status === "OK") {
        setResponses((prev) => {
          const next = [...prev];
          next[index] = res;
          return next;
        });
      }
    },
    []
  );

  return (
    <>
      {directionsRequests.map((opts, i) => (
        <DirectionsService
          key={`ds-fb-${i}-${opts.origin?.toString()}`}
          options={opts}
          callback={makeCallback(i)}
        />
      ))}
      {responses.map(
        (res, i) =>
          res && (
            <DirectionsRenderer
              key={`dr-fb-${i}`}
              options={{
                directions: res,
                preserveViewport: true,
                suppressMarkers: true,
                polylineOptions: { strokeColor, strokeWeight, strokeOpacity: 1 }
              }}
            />
          )
      )}
      {showMarkers && <WaypointMarkers waypoints={waypoints} />}
    </>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────

// Google Directions API limit: 25 intermediate waypoints = 27 total per request.
const MAX_WAYPOINTS_PER_CHUNK = 27;

const RouteMapDisplay = ({
  waypoints,
  polylinePoints,
  encodedPolyline,
  showMarkers = true,
  strokeColor = "#00ADB4",
  strokeWeight = 4
}: RouteMapDisplayProps) => {
  if (waypoints.length < 2) return null;

  // 1. Best case: pre-decoded points saved in DB — zero cost.
  if (polylinePoints && polylinePoints.length > 0) {
    return (
      <StaticPolyline
        path={polylinePoints}
        waypoints={waypoints}
        showMarkers={showMarkers}
        strokeColor={strokeColor}
        strokeWeight={strokeWeight}
      />
    );
  }

  // 2. Legacy routes with ≤27 waypoints: the stored encoded polyline was
  //    produced by a SINGLE Directions API call → the string is valid.
  //    Decode it locally (pure JS, zero API cost) and render directly.
  //
  //    Routes with 28+ waypoints had their polyline produced by CONCATENATING
  //    multiple encoded strings. Concatenation breaks the delta-encoding format,
  //    so the result is always corrupted — skip to the paid fallback immediately.
  //    (Geographic-range checks are NOT reliable here because corrupted delta
  //     sums can still land within ±90/±180.)
  if (encodedPolyline && waypoints.length <= MAX_WAYPOINTS_PER_CHUNK) {
    const decoded = decodePolyline(encodedPolyline);
    if (decoded.length > 0) {
      return (
        <StaticPolyline
          path={decoded}
          waypoints={waypoints}
          showMarkers={showMarkers}
          strokeColor={strokeColor}
          strokeWeight={strokeWeight}
        />
      );
    }
  }

  // 3. Fallback: either a legacy route with 28+ waypoints (corrupted polyline
  //    and no polylinePoints yet), or a route with no stored polyline at all.
  //    Re-chunk the waypoints and call the Directions API to render correctly.
  return (
    <DirectionsFallback
      waypoints={waypoints}
      showMarkers={showMarkers}
      strokeColor={strokeColor}
      strokeWeight={strokeWeight}
    />
  );
};

export default RouteMapDisplay;
