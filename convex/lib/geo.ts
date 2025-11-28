/**
 * Filter items by radius from a center point
 */
export function filterByRadius<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  centerLat: number,
  centerLng: number,
  radiusMiles: number
): T[] {
  return items.filter((item) => {
    if (!item.latitude || !item.longitude) return false;
    const distance = calculateDistance(
      centerLat,
      centerLng,
      item.latitude,
      item.longitude
    );
    return distance <= radiusMiles;
  });
}

/**
 * Calculate distance between two points in miles using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
