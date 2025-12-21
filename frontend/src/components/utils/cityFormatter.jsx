/**
 * Extract city name without country from location string
 * Examples:
 * "São Paulo, Brazil" -> "São Paulo"
 * "New York, United States" -> "New York"
 */
export function getCityNameOnly(location) {
  if (!location) return "";

  // Split by comma and take first part (city name)
  const parts = location.split(",");
  return parts[0]?.trim() || location;
}
/**
 * Get the primary destination name from a trip object.
 * Supports both legacy string `trip.destination` and new nested object `{ id, name }`.
 */
export function getTripDestinationName(trip) {
  if (!trip) return "";
  if (trip.destination && typeof trip.destination === "object") {
    return getCityNameOnly(trip.destination.name);
  }
  if (typeof trip.destination === "string") {
    return getCityNameOnly(trip.destination);
  }
  return "";
}

/**
 * Get formatted cities display from trip data
 * Returns array of objects: { id?, name }
 */
export function getTripCities(trip) {
  if (!trip) return [];

  const result = [];

  // Primary destination (new nested object) - keep full "City, Country" name
  if (trip.destination && typeof trip.destination === "object") {
    result.push({ id: trip.destination.id, name: trip.destination.name });
  } else if (typeof trip.destination === "string") {
    result.push({ name: trip.destination });
  }

  // Append any additional cities discovered by backend (trip.cities)
  if (Array.isArray(trip.cities) && trip.cities.length > 0) {
    trip.cities.forEach((c) => {
      if (c && c.name) {
        // avoid duplicating the primary city entry
        const primaryName = result[0]?.name?.toLowerCase();
        if (c.name.toLowerCase() !== primaryName) {
          // keep full name (including country) so UI can display "City, Country"
          result.push({ id: c.id, name: c.name });
        }
      }
    });
  }

  // Fallback: if no cities found, fallback to locations array (legacy)
  if (
    result.length === 0 &&
    Array.isArray(trip.locations) &&
    trip.locations.length > 0
  ) {
    trip.locations.forEach((loc) => {
      if (typeof loc === "string") {
        // keep original string (likely "City, Country")
        result.push({ name: loc });
      } else if (loc && loc.name) {
        result.push({ id: loc.id, name: loc.name });
      }
    });
  }

  if (result.length === 0) {
    return [{ name: "Unknown destination" }];
  }

  return result;
}
