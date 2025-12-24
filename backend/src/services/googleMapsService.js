const axios = require("axios");
const config = require("../config/config");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place";

/**
 * Search for cities using Google Places Autocomplete API
 * @param {string} query - Search query (city name)
 * @param {number} limit - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of city predictions
 */
const searchCitiesFromGoogle = async (query) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await axios.get(
      `${PLACES_API_BASE_URL}/autocomplete/json`,
      {
        params: {
          input: query,
          types: "(cities)",
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      const errorMessage = response.data.error_message || response.data.status;
      console.error(`[Google Maps Service] API Error: ${response.data.status}`);
      console.error(`[Google Maps Service] Error details: ${errorMessage}`);

      if (response.data.status === "REQUEST_DENIED") {
        console.error(
          "[Google Maps Service] SOLUTION: Enable the following APIs in Google Cloud Console:"
        );
        console.error("[Google Maps Service] 1. Places API (New)");
        console.error("[Google Maps Service] 2. Geocoding API");
        console.error("[Google Maps Service] 3. Time Zone API");
        console.error(
          "[Google Maps Service] Visit: https://console.cloud.google.com/google/maps-apis"
        );
      }

      throw new Error(
        `Google Places API error: ${response.data.status} - ${errorMessage}`
      );
    }

    const predictions = response.data.predictions || [];

    console.log(JSON.stringify(predictions, null, 2));

    // Return limited results
    return predictions.map((prediction) => ({
      google_maps_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: prediction.structured_formatting,
    }));
  } catch (error) {
    console.error(
      "[Google Maps Service] Error searching cities:",
      error.message
    );
    throw error;
  }
};

/**
 * Get detailed place information from Google Places API
 * @param {string} placeId - Google Maps Place ID
 * @returns {Promise<Object>} Place details
 */
const getPlaceDetails = async (placeId) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "address_components",
          "geometry",
          "types",
          "utc_offset",
        ].join(","),
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    // Extract city and country information from address components
    const addressComponents = place.address_components || [];

    let cityName = null;
    let stateName = null;
    let countryName = null;
    let countryCode = null;

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        cityName = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        stateName = component.long_name;
      } else if (component.types.includes("country")) {
        countryName = component.long_name;
        countryCode = component.short_name;
      }
    }

    // If no locality, try administrative_area_level_2 or administrative_area_level_1
    if (!cityName) {
      for (const component of addressComponents) {
        if (component.types.includes("administrative_area_level_2")) {
          cityName = component.long_name;
          break;
        }
      }
    }

    if (!cityName) {
      for (const component of addressComponents) {
        if (component.types.includes("administrative_area_level_1")) {
          cityName = component.long_name;
          break;
        }
      }
    }

    return {
      google_maps_id: place.place_id,
      name: cityName || place.name,
      formatted_address: place.formatted_address,
      country_name: countryName,
      country_code: countryCode,
      state: stateName,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      timezone_offset: place.utc_offset,
      types: place.types || [],
    };
  } catch (error) {
    console.error(
      "[Google Maps Service] Error getting place details:",
      error.message
    );
    throw error;
  }
};

/**
 * Get geocoding information for a location
 * @param {string} address - Address or place name
 * @returns {Promise<Object>} Geocoding result
 */
const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }

    return response.data.results[0];
  } catch (error) {
    console.error(
      "[Google Maps Service] Error geocoding address:",
      error.message
    );
    throw error;
  }
};

/**
 * Get timezone information for coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Timezone information
 */
const getTimezone = async (latitude, longitude) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/timezone/json",
      {
        params: {
          location: `${latitude},${longitude}`,
          timestamp,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Timezone API error: ${response.data.status}`);
    }

    return {
      timezone_id: response.data.timeZoneId,
      timezone_name: response.data.timeZoneName,
      offset: response.data.rawOffset + response.data.dstOffset,
    };
  } catch (error) {
    console.error(
      "[Google Maps Service] Error getting timezone:",
      error.message
    );
    throw error;
  }
};

/**
 * Search for places using Google Places Text Search API
 * @param {string} query - Search query (place name)
 * @param {string} destination - Optional destination/location bias
 * @returns {Promise<Object|null>} First matching place or null
 */
const searchPlace = async (query, destination = null) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const params = {
      query: destination ? `${query}, ${destination}` : query,
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(`${PLACES_API_BASE_URL}/textsearch/json`, {
      params,
    });

    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      console.error(
        `[Google Maps Service] Place search error: ${response.data.status}`
      );
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const results = response.data.results || [];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(
      "[Google Maps Service] Error searching place:",
      error.message
    );
    throw error;
  }
};

/**
 * Search for places (text search) and return multiple results
 * @param {string} query
 * @param {string|null} destination
 * @param {string|null} type
 * @param {number} limit
 */
const searchPlacesText = async (
  query,
  destination = null,
  type = null,
  limit = 10
) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const params = {
      query: destination ? `${query}, ${destination}` : query,
      key: GOOGLE_MAPS_API_KEY,
      // types is optional and sometimes ignored by Text Search, but include as a hint
    };
    if (type) params.type = type;

    const response = await axios.get(`${PLACES_API_BASE_URL}/textsearch/json`, {
      params,
    });

    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      console.error(
        `[Google Maps Service] Text search error: ${response.data.status}`
      );
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const results = response.data.results || [];
    // Limit results
    return results.slice(0, limit);
  } catch (error) {
    console.error(
      "[Google Maps Service] Error searching places text:",
      error.message
    );
    throw error;
  }
};



/**
 * Get detailed place information including photos
 * @param {string} placeId - Google Maps Place ID
 * @returns {Promise<Object>} Complete place details with photos
 */
const getPlaceDetailsWithPhotos = async (placeId) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "address_components",
          "geometry",
          "rating",
          "user_ratings_total",
          "price_level",
          "types",
          "formatted_phone_number",
          "website",
          "opening_hours",
          "photos",
        ].join(","),
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    // Extract city from address components
    const addressComponents = place.address_components || [];
    let cityName = null;

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        cityName = component.long_name;
        break;
      }
    }

    // Build photo objects with just the reference and metadata
    const photos = (place.photos || []).map((photo) => ({
      photo_reference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
      html_attributions: photo.html_attributions,
    }));

    return {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      city_name: cityName,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      types: place.types || [],
      phone_number: place.formatted_phone_number,
      website: place.website,
      opening_hours: place.opening_hours?.weekday_text || null,
      photos,
    };
  } catch (error) {
    console.error(
      "[Google Maps Service] Error getting place details with photos:",
      error.message
    );
    throw error;
  }
};

/**
 * Get city details including photos from Google Places API
 * @param {string} placeId - Google Maps Place ID for the city
 * @returns {Promise<Object>} City details with photos
 */
const getCityDetailsWithPhotos = async (placeId) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "address_components",
          "geometry",
          "types",
          "utc_offset",
          "photos",
        ].join(","),
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    // Extract city and country information from address components
    const addressComponents = place.address_components || [];
    let cityName = null;
    let stateName = null;
    let countryName = null;
    let countryCode = null;

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        cityName = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        stateName = component.long_name;
      } else if (component.types.includes("country")) {
        countryName = component.long_name;
        countryCode = component.short_name;
      }
    }

    // If no locality, try administrative_area_level_2 or administrative_area_level_1
    if (!cityName) {
      for (const component of addressComponents) {
        if (component.types.includes("administrative_area_level_2")) {
          cityName = component.long_name;
          break;
        }
      }
    }

    if (!cityName) {
      for (const component of addressComponents) {
        if (component.types.includes("administrative_area_level_1")) {
          cityName = component.long_name;
          break;
        }
      }
    }

    // Build photo objects with just the reference and metadata
    const photos = (place.photos || []).map((photo) => ({
      photo_reference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
      html_attributions: photo.html_attributions,
    }));

    return {
      google_maps_id: place.place_id,
      name: cityName || place.name,
      formatted_address: place.formatted_address,
      country_name: countryName,
      country_code: countryCode,
      state: stateName,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      timezone_offset: place.utc_offset,
      types: place.types || [],
      photos,
    };
  } catch (error) {
    console.error(
      "[Google Maps Service] Error getting city details with photos:",
      error.message
    );
    throw error;
  }
};

/**
 * Get photo URL from Google Places API
 * @param {string} photoReference - Photo reference from place details
 * @param {number} maxWidth - Maximum width of the photo
 * @returns {string} Photo URL
 */
const getPhotoUrl = (photoReference, maxWidth = 800) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
};

module.exports = {
  searchCitiesFromGoogle,
  getPlaceDetails,
  geocodeAddress,
  getTimezone,
  searchPlace,
  getPlaceDetailsWithPhotos,
  getCityDetailsWithPhotos,
  getPhotoUrl,
};
