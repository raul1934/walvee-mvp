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

/**
 * Create draft trip
 * @param {Object} options - Optional options (title, etc.)
 * @returns {Promise<Object>} Created draft trip
 */
export async function createDraftTrip(options = {}) {
  try {
    const response = await apiClient.post(endpoints.trips.createDraft, options);
    // Return the API payload (response.data contains { trip })
    // Fallback to the whole response if data is missing for robustness in different environments
    return response.data ?? response;
  } catch (error) {
    console.error("[InspireService] createDraftTrip error:", error);
    throw error;
  }
}

/**
 * Get current draft trip for user
 * @returns {Promise<Object>} Current draft trip or null
 */
export async function getCurrentDraftTrip() {
  try {
    const response = await apiClient.get(endpoints.trips.getCurrentDraft);
    // Return the API payload (response.data contains { trip })
    // Fallback to the whole response if data is missing for robustness in different environments
    return response.data ?? response;
  } catch (error) {
    console.error("[InspireService] getCurrentDraftTrip error:", error);
    throw error;
  }
}

/**
 * Finalize draft trip (publish)
 * @param {string} tripId - Trip ID
 * @param {Object} data - Trip data (title, description, is_public)
 * @returns {Promise<Object>} Published trip
 */
export async function finalizeTrip(tripId, data) {
  try {
    const response = await apiClient.request(endpoints.trips.finalize(tripId), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  } catch (error) {
    console.error("[InspireService] finalizeTrip error:", error);
    throw error;
  }
}

/**
 * Load messages for trip
 * @param {string} tripId - Trip ID
 * @param {string|null} cityContext - Optional city context filter
 * @returns {Promise<Array>} Array of messages
 */
export async function loadMessages(tripId, cityContext = null) {
  try {
    const url = endpoints.chatMessages.getByTrip(tripId);
    const params = cityContext !== null ? { city_context: cityContext } : {};
    const response = await apiClient.get(url, params);
    const messages = response.data?.messages || [];

    // Normalize server messages to camelCase keys to match client expectations
    // e.g., `city_context` -> `cityContext`
    const normalized = messages.map((m) => ({
      ...m,
      cityContext: m.cityContext || m.city_context || null,
      timestamp: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
    }));

    return normalized;
  } catch (error) {
    console.error("[InspireService] loadMessages error:", error);
    throw error;
  }
}

export const Inspire = {
  invoke: invokeInspire, // Keep for backward compatibility (deprecated)
  getRecommendations, // NEW
  organizeItinerary, // NEW
  modifyTrip,
  applyChanges,
  createDraftTrip,
  getCurrentDraftTrip,
  finalizeTrip,
  loadMessages,
};
