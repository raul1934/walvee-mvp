/**
 * LLM Service - Backend integration for Google Gemini AI
 */

import { apiClient, endpoints } from "./apiClient";

/**
 * Invoke an LLM with a prompt
 * @param {Object} options - LLM invocation options
 * @param {string} options.prompt - The prompt to send to the LLM
 * @returns {Promise<any>} - LLM response
 */
export async function invokeLLM(options) {
  try {
    // Forward all options to the API so callers can pass response_json_schema, temperature, etc.
    const response = await apiClient.post(endpoints.llm.chat, options);

    // Return the response data
    return response.data.response;
  } catch (error) {
    console.error("[LLM Service] Error:", error);
    throw error;
  }
}

// Legacy API compatibility - matches base44 integrations API
export const Core = {
  InvokeLLM: invokeLLM,
};
