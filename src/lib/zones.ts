export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const SANTA_CRUZ_ZONES: Zone[] = [
  { id: "centro", name: "Centro / Equipetrol", lat: -17.7833, lng: -63.1821 },
  { id: "plan3000", name: "Plan 3000", lat: -17.8108, lng: -63.1567 },
  { id: "warnes", name: "Warnes", lat: -17.5167, lng: -63.1667 },
  { id: "doblevia", name: "Doble Vía La Guardia", lat: -17.85, lng: -63.22 },
  { id: "el_trompillo", name: "El Trompillo", lat: -17.8011, lng: -63.1406 },
  { id: "montero", name: "Montero", lat: -17.3369, lng: -63.2506 },
  { id: "la_guardia", name: "La Guardia", lat: -17.8933, lng: -63.3267 },
  { id: "virgen_canton", name: "Virgen de Cotoca", lat: -17.7544, lng: -63.0956 },
  { id: "urubo", name: "Urubó", lat: -17.7589, lng: -63.2689 },
  { id: "7mo_anillo", name: "7mo Anillo", lat: -17.795, lng: -63.17 },
];

export function getZoneCoords(zoneName: string): { lat: number; lng: number } {
  const normalized = zoneName.toLowerCase();
  const found = SANTA_CRUZ_ZONES.find(
    (z) =>
      z.name.toLowerCase().includes(normalized) ||
      normalized.includes(z.id.replace("_", " "))
  );
  return found
    ? { lat: found.lat, lng: found.lng }
    : { lat: -17.7833, lng: -63.1821 };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getListingCoords(listing: {
  zone: string;
  lat?: number;
  lng?: number;
}): { lat: number; lng: number } {
  if (listing.lat != null && listing.lng != null) {
    return { lat: listing.lat, lng: listing.lng };
  }
  return getZoneCoords(listing.zone);
}

export function distanceBetweenZones(zoneA: string, zoneB: string): number {
  const a = getZoneCoords(zoneA);
  const b = getZoneCoords(zoneB);
  return Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng) * 10) / 10;
}

export function distanceBetweenListings(
  from: { zone: string; lat?: number; lng?: number },
  to: { zone: string; lat?: number; lng?: number }
): number {
  const a = getListingCoords(from);
  const b = getListingCoords(to);
  return Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng) * 10) / 10;
}
