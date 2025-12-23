const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

// Initialize Gemini client (duplicate of llmController init to avoid cross-file coupling)
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY not configured. LLM functionality will not work."
    );
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * @route   POST /inspire/call
 * @desc    Handle inspiration prompts (wrapper around LLM chat with recommend defaults)
 * @access  Private
 */
exports.call = async (req, res) => {
  try {
    const {
      prompt,
      model = "gemini-2.5-flash",
      response_json_schema,
      temperature,
      max_output_tokens,
    } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "Prompt is required"));
    }

    const genAI = initGemini();
    if (!genAI) {
      return res
        .status(500)
        .json(
          buildErrorResponse(
            "SERVICE_UNAVAILABLE",
            "LLM service not configured. Please add GEMINI_API_KEY to environment variables."
          )
        );
    }

    // Prepare model configuration - expose a small set of tunables
    const modelConfig = {
      model,
    };

    const generationConfig = {};
    if (temperature != null)
      generationConfig.temperature = parseFloat(temperature);
    if (max_output_tokens != null)
      generationConfig.maxOutputTokens = parseInt(max_output_tokens);

    if (response_json_schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = response_json_schema;
    }

    if (Object.keys(generationConfig).length > 0) {
      modelConfig.generationConfig = generationConfig;
    }

    const geminiModel = genAI.getGenerativeModel(modelConfig);

    const result = await geminiModel.generateContent(prompt);
    const response_data = result.response;
    const text = response_data.text();

    let parsedResponse = text;
    if (response_json_schema) {
      try {
        parsedResponse = JSON.parse(text);
      } catch (err) {
        // keep text if parsing fails
        console.warn(
          "[inspirePrompt] Failed to parse JSON response:",
          err.message || err
        );
      }
    }

    return res.json(buildSuccessResponse({ response: parsedResponse, model }));
  } catch (error) {
    console.error("[inspirePrompt] Error:", error);
    return res
      .status(500)
      .json(
        buildErrorResponse(
          "LLM_ERROR",
          error.message || "Failed to run inspire prompt"
        )
      );
  }
};
