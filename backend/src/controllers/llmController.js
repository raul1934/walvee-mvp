const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildSuccessResponse, buildErrorResponse } = require("../utils/helpers");

/**
 * Supported Gemini Models (as of December 2025)
 *
 * Recommended Production Models:
 * - gemini-2.5-flash (stable, fast, 1M token context, 65k output)
 * - gemini-2.5-pro (stable, most capable, 1M token context, 65k output)
 * - gemini-2.0-flash-001 (stable, fast, 1M token context, 8k output)
 * - gemini-flash-latest (always latest Flash version)
 * - gemini-pro-latest (always latest Pro version)
 *
 * Other Available Models:
 * - gemini-2.5-flash-lite (lightweight version)
 * - gemini-2.0-flash-lite-001 (lightweight 2.0)
 * - gemini-3-pro-preview (preview of next generation)
 * - gemini-3-flash-preview (preview of next generation)
 * - gemma-3-1b-it, gemma-3-4b-it, gemma-3-12b-it, gemma-3-27b-it (open models)
 *
 * Specialized Models:
 * - gemini-2.5-flash-preview-tts (text-to-speech)
 * - gemini-2.5-pro-preview-tts (text-to-speech)
 * - gemini-2.5-flash-image-preview (image generation)
 * - deep-research-pro-preview-12-2025 (deep research)
 *
 * Note: Use listModels API to get the latest available models
 */

/**
 * Initialize Gemini AI
 */
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured. LLM functionality will not work.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * @route   POST /llm/chat
 * @desc    Send a chat message to Gemini LLM and get a response
 * @access  Private
 */
exports.chat = async (req, res) => {
  try {
    const { prompt, model = "gemini-2.5-flash", response_json_schema } = req.body;

    if (!prompt) {
      return res.status(400).json(
        buildErrorResponse("VALIDATION_ERROR", "Prompt is required")
      );
    }

    const genAI = initGemini();
    if (!genAI) {
      return res.status(500).json(
        buildErrorResponse(
          "SERVICE_UNAVAILABLE",
          "LLM service not configured. Please add GEMINI_API_KEY to environment variables."
        )
      );
    }

    // Initialize the model
    const modelConfig = {
      model: model,
    };

    // Add JSON schema if provided
    if (response_json_schema) {
      modelConfig.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: response_json_schema,
      };
    }

    const geminiModel = genAI.getGenerativeModel(modelConfig);

    // Generate content
    const result = await geminiModel.generateContent(prompt);
    const response_data = result.response;
    const text = response_data.text();

    // Parse JSON response if schema was provided
    let responseData = text;
    if (response_json_schema) {
      try {
        responseData = JSON.parse(text);
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        // Return as text if JSON parsing fails
      }
    }

    return res.json(
      buildSuccessResponse({
        response: responseData,
        model: model,
      })
    );
  } catch (error) {
    console.error("LLM chat error:", error);
    return res.status(500).json(
      buildErrorResponse("LLM_ERROR", error.message || "Failed to process LLM request")
    );
  }
};
