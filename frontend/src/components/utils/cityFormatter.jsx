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
  // Prefer the new cities array
  if (Array.isArray(trip.cities) && trip.cities.length > 0) {
    return getCityNameOnly(trip.cities[0].name);
  }
  // Legacy fallback
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
  // Primary: prefer trip.cities list
  if (Array.isArray(trip.cities) && trip.cities.length > 0) {
    trip.cities.forEach((c) => {
      if (c && c.name) result.push({ id: c.id, name: c.name });
    });
  }

  // Legacy fallback: use `destination` string/object
  if (result.length === 0) {
    if (trip.destination && typeof trip.destination === "object") {
      result.push({ id: trip.destination.id, name: trip.destination.name });
    } else if (typeof trip.destination === "string") {
      result.push({ name: trip.destination });
    }
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

/**
 * Safely format a city name which may be a string or an object.
 * Examples:
 * - "Tokyo" -> "Tokyo"
 * - { name: "Tokyo" } -> "Tokyo"
 * - { en: "Tokyo", local: "東京" } -> "Tokyo" (prefers common keys)
 */
export function formatCityName(name) {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (typeof name === "object") {
    return (
      name.name || name.en || name.local || name.default || JSON.stringify(name)
    );
  }
  return String(name);
}
