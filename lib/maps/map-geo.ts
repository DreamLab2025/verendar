/** Khoảng cách lớn nhất từ tâm tới 4 góc viewport (km), clamp theo API map search (1–200). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function radiusKmFromViewportCorners(
  centerLat: number,
  centerLng: number,
  ne: { lat: number; lng: number },
  sw: { lat: number; lng: number },
): number {
  const nw = { lat: ne.lat, lng: sw.lng };
  const se = { lat: sw.lat, lng: ne.lng };
  const d = (lat: number, lng: number) => haversineKm(centerLat, centerLng, lat, lng);
  const maxKm = Math.max(d(ne.lat, ne.lng), d(sw.lat, sw.lng), d(nw.lat, nw.lng), d(se.lat, se.lng));
  return Math.min(200, Math.max(1, Math.ceil(maxKm)));
}
