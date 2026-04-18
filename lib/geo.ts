export type LatLng = { lat: number; lng: number };

export const MARKET_CENTER: LatLng = {
  lat: Number(process.env.NEXT_PUBLIC_MARKET_LAT ?? 13.6489),
  lng: Number(process.env.NEXT_PUBLIC_MARKET_LNG ?? 100.4938),
};

const EARTH_R_M = 6_371_000;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h =
    s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * EARTH_R_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(m: number): string {
  if (!Number.isFinite(m)) return "—";
  if (m < 950) return `${Math.round(m)} ม.`;
  return `${(m / 1000).toFixed(1)} กม.`;
}

export function withinRadius(a: LatLng, b: LatLng, radiusMeters: number): boolean {
  return haversineMeters(a, b) <= radiusMeters;
}

export function boundsForPoints(points: LatLng[]): [LatLng, LatLng] | null {
  if (points.length === 0) return null;
  let minLat = points[0].lat,
    maxLat = points[0].lat,
    minLng = points[0].lng,
    maxLng = points[0].lng;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  return [
    { lat: minLat, lng: minLng },
    { lat: maxLat, lng: maxLng },
  ];
}
