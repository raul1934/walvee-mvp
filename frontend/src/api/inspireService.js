import { apiClient, endpoints } from "./apiClient";

/**
 * Invoke the Inspire endpoint (wraps LLM chat with Inspire-specific defaults)
 * @param {Object} options - { prompt, trip_id (optional), conversation_history (optional) }
 */
export async function invokeInspire(options) {
  try {
    const response = await apiClient.post(endpoints.inspire.call, options);
    return response.data.response;
  } catch (error) {
    console.error("[InspireService] Error:", error);
    throw error;
  }
}

/**
 * Modify a trip using AI - analyze user query and propose changes
 * @param {string} tripId - Trip ID
 * @param {string} query - User query
 * @param {Array} history - Conversation history
 * @returns {Promise<Object>} AI response with proposed changes or clarification questions
 */
export async function modifyTrip(tripId, query, history = []) {
  try {
    const response = await apiClient.post(endpoints.inspire.call, {
      prompt: query,
      trip_id: tripId,
      conversation_history: history,
    });
    return response.data.data;
  } catch (error) {
    console.error("[InspireService] modifyTrip error:", error);
    throw error;
  }
}

/**
 * Apply approved changes to a trip
 * @param {string} tripId - Trip ID
 * @param {Array} changes - Array of changes with approval status
 * @returns {Promise<Object>} Updated trip data and results
 */
export async function applyChanges(tripId, changes) {
  try {
    const response = await apiClient.post(endpoints.inspire.applyChanges, {
      trip_id: tripId,
      changes,
    });
    return response.data;
  } catch (error) {
    console.error("[InspireService] applyChanges error:", error);
    throw error;
  }
}

/**
 * Get AI recommendations for places/cities
 * @param {Object} options - { user_query, conversation_history, filters, city_context }
 * @returns {Promise<Object>} AI recommendations response
 */
export async function getRecommendations(options) {
  try {
    const response = await apiClient.post(
      endpoints.inspire.recommendations,
      options
    );
    return response.data; // Extract data from success response
  } catch (error) {
    console.error("[InspireService] getRecommendations error:", error);
    throw error;
  }
}

/**
 * Organize itinerary from places
 * @param {Object} options - { user_query, city_name, places, days }
 * @returns {Promise<Object>} Organized itinerary response
 */
export async function organizeItinerary(options) {
  try {
    const response = await apiClient.post(endpoints.inspire.organize, options);
    return response.data; // Extract data from success response
  } catch (error) {
    console.error("[InspireService] organizeItinerary error:", error);
    throw error;
  }
}

export const Inspire = {
  invoke: invokeInspire, // Keep for backward compatibility (deprecated)
  getRecommendations, // NEW
  organizeItinerary, // NEW
  modifyTrip,
  applyChanges,
};
