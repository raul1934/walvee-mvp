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
 * Returns the first city name from trip.cities array.
 */
export function getTripDestinationName(trip) {
  if (!trip?.cities || !Array.isArray(trip.cities) || trip.cities.length === 0) {
    return "";
  }
  return getCityNameOnly(trip.cities[0].name);
}

/**
 * Get formatted cities display from trip data
 * Returns array of objects: { id, name, country }
 */
export function getTripCities(trip) {
  if (!trip?.cities || !Array.isArray(trip.cities)) {
    return [];
  }

  return trip.cities.map(city => ({
    id: city.id,
    name: city.name,
    country: city.country?.name || ""
  }));
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
