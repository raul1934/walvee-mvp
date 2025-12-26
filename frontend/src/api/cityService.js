import { apiClient, endpoints } from "./apiClient";

/**
 * @typedef {Object} CitySearchResult
 * @property {string} id - City UUID
 * @property {string} name - City name
 * @property {string} country_id - Country UUID
 * @property {Object} country - Country details
 * @property {string} country.id - Country UUID
 * @property {string} country.name - Country name
 * @property {string} country.code - Country code (e.g., "US")
 * @property {number} [latitude] - City latitude
 * @property {number} [longitude] - City longitude
 */

/**
 * City Service
 * Handles city lookup and search operations
 */
export const City = {
  /**
   * Search for cities by name
   * @param {string} query - City name to search (partial match supported)
   * @param {Object} [options] - Optional search parameters
   * @param {string} [options.country] - Country name to filter by
   * @param {string} [options.country_id] - Country UUID to filter by
   * @param {number} [options.limit] - Maximum number of results (default: 10)
   * @returns {Promise<CitySearchResult[]>} Array of matching cities
   */
  async search(query, options = {}) {
    const response = await apiClient.get(endpoints.cities.search, {
      query,
      ...options,
    });
    return response.data;
  },

  /**
   * Get a city by its UUID
   * @param {string} id - City UUID
   * @returns {Promise<CitySearchResult>} City details
   */
  async get(id) {
    const response = await apiClient.get(endpoints.cities.getById(id));
    return response.data;
  },

  /**
   * Search for a city by name and return its UUID
   * This is a convenience method for cases where you need to convert
   * a city name (e.g., from user input or CitiesModal) to a UUID
   * for API calls that require city_id.
   *
   * @param {string} cityName - City name to search (exact or partial match)
   * @param {string} [countryName] - Optional country name for disambiguation
   * @returns {Promise<{id: string, name: string, country: string}|null>} City object with UUID, or null if not found
   * @example
   * // Basic usage
   * const city = await City.getCityByName("Miami");
   * // { id: "a1b2c3d4-...", name: "Miami", country: "United States" }
   *
   * // With country disambiguation
   * const city = await City.getCityByName("Paris", "France");
   * // { id: "e5f6g7h8-...", name: "Paris", country: "France" }
   */
  async getCityByName(cityName, countryName = null) {
    if (!cityName || typeof cityName !== "string") {
      throw new Error("City name is required and must be a string");
    }

    const searchOptions = {};
    if (countryName) {
      searchOptions.country = countryName;
    }

    const results = await this.search(cityName, {
      ...searchOptions,
      limit: 10,
    });

    if (!results || results.length === 0) {
      return null;
    }

    // If country is specified, find exact match
    if (countryName) {
      const exactMatch = results.find(
        (city) =>
          city.name.toLowerCase() === cityName.toLowerCase() &&
          city.country?.name.toLowerCase() === countryName.toLowerCase()
      );
      if (exactMatch) {
        return {
          id: exactMatch.id,
          name: exactMatch.name,
          country: exactMatch.country?.name || null,
        };
      }
    }

    // Find exact city name match (case-insensitive)
    const exactCityMatch = results.find(
      (city) => city.name.toLowerCase() === cityName.toLowerCase()
    );

    if (exactCityMatch) {
      return {
        id: exactCityMatch.id,
        name: exactCityMatch.name,
        country: exactCityMatch.country?.name || null,
      };
    }

    // Return first result as fallback
    const firstResult = results[0];
    return {
      id: firstResult.id,
      name: firstResult.name,
      country: firstResult.country?.name || null,
    };
  },

  /**
   * Get trips for a specific city
   * @param {string} cityId - City UUID
   * @param {Object} [options] - Query parameters (pagination, filters, etc.)
   * @returns {Promise<Object>} Trips response with data and pagination
   */
  async getTrips(cityId, options = {}) {
    const response = await apiClient.get(
      endpoints.cities.getTrips(cityId),
      options
    );
    return response;
  },

  /**
   * Get local users (residents) of a specific city
   * @param {string} cityId - City UUID
   * @param {Object} [options] - Query parameters
   * @returns {Promise<Object>} Users response
   */
  async getLocals(cityId, options = {}) {
    const response = await apiClient.get(
      endpoints.cities.getLocals(cityId),
      options
    );
    return response;
  },

  /**
   * Get cities by country
   * @param {string} countryId - Country UUID
   * @param {Object} [options] - Query parameters
   * @returns {Promise<CitySearchResult[]>} Cities in the country
   */
  async getByCountry(countryId, options = {}) {
    const response = await apiClient.get(endpoints.cities.byCountry, {
      country_id: countryId,
      ...options,
    });
    return response.data;
  },

  /**
   * Get suggested cities for a country
   * @param {string} countryId - Country UUID
   * @returns {Promise<CitySearchResult[]>} Suggested cities
   */
  async getSuggestedByCountry(countryId) {
    const response = await apiClient.get(
      endpoints.cities.suggestedByCountry(countryId)
    );
    return response.data;
  },
};

export default City;
