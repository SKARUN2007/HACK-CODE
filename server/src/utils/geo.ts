/**
 * Server-side Geographical Utilities & Distance Calculations.
 * Uses the Haversine formula to compute great-circle distance between coordinates.
 */

/**
 * Calculates Haversine distance between two sets of GPS coordinates in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

export type LocationTrustStatus =
  | 'NEAR_PROJECT'
  | 'LOCATION_REVIEW'
  | 'LOCATION_MISMATCH'
  | 'LOCATION_NOT_PROVIDED';

/**
 * Maps geographical distance in meters to a location trust signal status.
 * Configurable threshold rules:
 * - 0 - 250m: NEAR_PROJECT
 * - 250m - 1000m: LOCATION_REVIEW
 * - >1000m: LOCATION_MISMATCH
 * - Null/Missing: LOCATION_NOT_PROVIDED
 */
export function determineLocationStatus(distanceInMeters: number | null): LocationTrustStatus {
  if (distanceInMeters === null || isNaN(distanceInMeters)) {
    return 'LOCATION_NOT_PROVIDED';
  }

  if (distanceInMeters <= 250) {
    return 'NEAR_PROJECT';
  }

  if (distanceInMeters <= 1000) {
    return 'LOCATION_REVIEW';
  }

  return 'LOCATION_MISMATCH';
}
