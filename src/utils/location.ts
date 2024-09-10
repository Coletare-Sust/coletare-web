export type LatLngTuple = [number, number];

export const decodePolyline = (encodedPath: string, precision = 5) => {
  const factor = Math.pow(10, precision);

  const len = encodedPath.length;

  const path = new Array(Math.floor(encodedPath.length / 2));
  let index = 0;
  let lat = 0;
  let lng = 0;
  let pointIndex = 0;

  for (; index < len; ++pointIndex) {
    let result = 1;
    let shift = 0;
    let b: number;
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    path[pointIndex] = [lat / factor, lng / factor];
  }
  path.length = pointIndex;

  return path;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

export function getDistanceBetweenTwoPoints(
  cord1: Coordinate,
  cord2: Coordinate
) {
  if (cord1.lat === cord2.lat && cord1.lng === cord2.lng) {
    return 0;
  }

  const radlat1 = (Math.PI * cord1.lat) / 180;
  const radlat2 = (Math.PI * cord2.lat) / 180;

  const theta = cord1.lng - cord2.lng;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; // convert miles to km

  return dist;
}
