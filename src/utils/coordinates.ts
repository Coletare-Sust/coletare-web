export type RoutePoint = {
  lat: number;
  lng: number;
};

export type LocationPoint = {
  latitude: number;
  longitude: number;
};

export function normalizeRoutePoint(
  latitude: unknown,
  longitude: unknown
): RoutePoint | null {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }

  return { lat, lng };
}

export function normalizeLocationPoint(
  latitude: unknown,
  longitude: unknown
): LocationPoint | null {
  const point = normalizeRoutePoint(latitude, longitude);

  if (!point) return null;

  return {
    latitude: point.lat,
    longitude: point.lng
  };
}

export function isRoutePoint(point: RoutePoint | null): point is RoutePoint {
  return point !== null;
}

export function isLocationPoint(
  point: LocationPoint | null
): point is LocationPoint {
  return point !== null;
}

export function getRoutePointHeading(
  previousPoint: RoutePoint | null,
  currentPoint: RoutePoint,
  fallbackHeading = 0
) {
  if (!previousPoint) return fallbackHeading;

  const latitudeDelta = currentPoint.lat - previousPoint.lat;
  const longitudeDelta = currentPoint.lng - previousPoint.lng;

  if (
    Math.abs(latitudeDelta) < 0.000001 &&
    Math.abs(longitudeDelta) < 0.000001
  ) {
    return fallbackHeading;
  }

  const toRadians = (value: number) => (value * Math.PI) / 180;
  const toDegrees = (value: number) => (value * 180) / Math.PI;
  const previousLatitude = toRadians(previousPoint.lat);
  const currentLatitude = toRadians(currentPoint.lat);
  const longitudeDifference = toRadians(longitudeDelta);

  const y = Math.sin(longitudeDifference) * Math.cos(currentLatitude);
  const x =
    Math.cos(previousLatitude) * Math.sin(currentLatitude) -
    Math.sin(previousLatitude) *
      Math.cos(currentLatitude) *
      Math.cos(longitudeDifference);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}
