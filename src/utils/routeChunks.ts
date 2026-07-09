// Google Directions API allows at most 25 intermediate waypoints per request,
// meaning 27 total points (origin + 25 waypoints + destination).
const MAX_WAYPOINTS_PER_CHUNK = 27;

/**
 * Splits a flat array of LatLngLiteral into overlapping chunks that respect
 * the Google Directions API limit of 25 intermediate waypoints (27 total).
 *
 * Each chunk shares its last point with the next chunk's first point so that
 * route segments connect seamlessly when rendered as multiple DirectionsRenderers.
 *
 * The raw waypoints array should always be stored as-is (flat) in the database.
 * Chunking is an API rendering detail only.
 */
export function splitWaypointsIntoChunks(
  waypoints: google.maps.LatLngLiteral[]
): google.maps.LatLngLiteral[][] {
  if (waypoints.length <= MAX_WAYPOINTS_PER_CHUNK) return [waypoints];

  const chunks: google.maps.LatLngLiteral[][] = [];
  let start = 0;

  while (start < waypoints.length - 1) {
    const end = Math.min(
      start + MAX_WAYPOINTS_PER_CHUNK - 1,
      waypoints.length - 1
    );
    chunks.push(waypoints.slice(start, end + 1));
    start = end;
  }

  return chunks;
}

export function getWaypointLabel(index: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < 26) return alphabet[index];

  const firstLetter = Math.floor(index / 26) - 1;
  const secondLetter = index % 26;
  return alphabet[firstLetter] + alphabet[secondLetter];
}

export function mergePolylines(
  responses: (google.maps.DirectionsResult | null)[]
): string {
  return responses
    .filter(Boolean)
    .map((res) => res!.routes[0]?.overview_polyline ?? "")
    .join("");
}
