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

export const Inspire = {
  invoke: invokeInspire,
};
