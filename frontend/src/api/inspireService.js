import { apiClient, endpoints } from "./apiClient";

/**
 * Invoke the Inspire endpoint (wraps LLM chat with Inspire-specific defaults)
 * @param {Object} options - { prompt, response_json_schema, temperature, max_output_tokens }
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
    const response = await apiClient.post(endpoints.inspire.modifyTrip, {
      trip_id: tripId,
      user_query: query,
      conversation_history: history,
    });
    return response.data;
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

export const Inspire = {
  invoke: invokeInspire,
  modifyTrip,
  applyChanges,
};
