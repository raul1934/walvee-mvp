const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const {
  Trip,
  City,
  Country,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  Place,
  User,
} = require("../models/sequelize");
const tripModificationService = require("../services/tripModificationService");

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
 *          If trip_id is provided, this becomes a trip modification flow
 * @access  Private
 */
exports.call = async (req, res) => {
  try {
    const {
      prompt,
      trip_id,
      conversation_history = [],
      schema_type, // "organize_trip" | "recommendations" | undefined for plain text
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

    // If trip_id is provided, use trip modification flow
    if (trip_id) {
      const userId = req.user.id;

      // 1. Fetch trip with all associations
      const trip = await Trip.findOne({
        where: { id: trip_id, author_id: userId },
        include: [
          {
            model: City,
            as: "cities",
            include: [{ model: Country, as: "country" }],
          },
          {
            model: TripPlace,
            as: "places",
            include: [{ model: Place, as: "place" }],
          },
          {
            model: TripItineraryDay,
            as: "itineraryDays",
            include: [
              {
                model: TripItineraryActivity,
                as: "activities",
              },
            ],
          },
        ],
      });

      if (!trip) {
        return res
          .status(404)
          .json(
            buildErrorResponse(
              "NOT_FOUND",
              "Trip not found or you do not have permission"
            )
          );
      }

      // 2. Build trip context for AI
      const tripContext = {
        id: trip.id,
        title: trip.title,
        cities: trip.cities.map((c) => ({
          id: c.id,
          name: c.name,
          country: c.country?.name || null,
        })),
        places: trip.places.map((p) => ({
          name: p.name,
          address: p.address,
          city: p.place?.city?.name || null,
        })),
        itinerary: trip.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          activities: day.activities.map((a) => ({
            name: a.name,
            time: a.time,
            location: a.location,
          })),
        })),
      };

      // 3. Build system prompt for trip modification
      const systemPrompt = buildTripModificationPrompt(
        tripContext,
        prompt,
        conversation_history
      );

      // 4. Call Gemini with trip modification JSON schema
      const responseSchema = getTripModificationSchema();

      const modelConfig = {
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
        },
      };

      const geminiModel = genAI.getGenerativeModel(modelConfig);
      const result = await geminiModel.generateContent(systemPrompt);
      const responseData = result.response;
      const text = responseData.text();

      let parsedResponse = JSON.parse(text);

      return res.json(buildSuccessResponse(parsedResponse));
    }

    // Normal inspire flow - determine schema based on schema_type
    const modelConfig = {
      model: "gemini-2.5-flash",
    };

    // Add JSON schema if schema_type is provided
    if (schema_type) {
      const schema = getSchemaByType(schema_type);
      if (schema) {
        modelConfig.generationConfig = {
          responseMimeType: "application/json",
          responseSchema: schema,
        };
      }
    }

    const geminiModel = genAI.getGenerativeModel(modelConfig);
    const result = await geminiModel.generateContent(prompt);
    const response_data = result.response;
    const text = response_data.text();

    // Parse JSON if schema was used
    let parsedResponse = text;
    if (schema_type) {
      try {
        parsedResponse = JSON.parse(text);
      } catch (err) {
        console.warn(
          "[inspirePrompt] Failed to parse JSON response:",
          err.message || err
        );
      }
    }

    return res.json(buildSuccessResponse({ response: parsedResponse }));
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

/**
 * @route   POST /inspire/modify-trip
 * @desc    Analyze user query and propose trip modifications
 * @access  Private
 */
exports.modifyTrip = async (req, res) => {
  try {
    const { trip_id, user_query, conversation_history = [] } = req.body;
    const userId = req.user.id;

    if (!trip_id) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "trip_id is required"));
    }

    if (!user_query) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "user_query is required"));
    }

    // 1. Fetch trip with all associations
    const trip = await Trip.findOne({
      where: { id: trip_id, author_id: userId },
      include: [
        {
          model: City,
          as: "cities",
          include: [{ model: Country, as: "country" }],
        },
        {
          model: TripPlace,
          as: "places",
          include: [{ model: Place, as: "place" }],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
            },
          ],
        },
      ],
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse(
            "NOT_FOUND",
            "Trip not found or you do not have permission"
          )
        );
    }

    // 2. Build trip context for AI
    const tripContext = {
      id: trip.id,
      title: trip.title,
      cities: trip.cities.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country?.name || null,
      })),
      places: trip.places.map((p) => ({
        name: p.name,
        address: p.address,
        city: p.place?.city?.name || null,
      })),
      itinerary: trip.itineraryDays.map((day) => ({
        day: day.day_number,
        title: day.title,
        activities: day.activities.map((a) => ({
          name: a.name,
          time: a.time,
          location: a.location,
        })),
      })),
    };

    // 3. Build system prompt
    const systemPrompt = buildTripModificationPrompt(
      tripContext,
      user_query,
      conversation_history
    );

    // 4. Call Gemini with JSON schema
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

    const responseSchema = getTripModificationSchema();

    const modelConfig = {
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    };

    const geminiModel = genAI.getGenerativeModel(modelConfig);
    const result = await geminiModel.generateContent(systemPrompt);
    const responseData = result.response;
    const text = responseData.text();

    let parsedResponse = JSON.parse(text);

    return res.json(buildSuccessResponse(parsedResponse));
  } catch (error) {
    console.error("[inspirePrompt] modifyTrip error:", error);
    return res
      .status(500)
      .json(
        buildErrorResponse(
          "LLM_ERROR",
          error.message || "Failed to analyze trip modifications"
        )
      );
  }
};

/**
 * @route   POST /inspire/apply-changes
 * @desc    Apply approved changes to a trip
 * @access  Private
 */
exports.applyChanges = async (req, res) => {
  try {
    const { trip_id, changes } = req.body;
    const userId = req.user.id;

    if (!trip_id) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "trip_id is required"));
    }

    if (!changes || !Array.isArray(changes)) {
      return res
        .status(400)
        .json(
          buildErrorResponse("VALIDATION_ERROR", "changes must be an array")
        );
    }

    // Apply changes using the modification service
    const results = await tripModificationService.applyChanges(
      trip_id,
      userId,
      changes
    );

    // Fetch updated trip
    const updatedTrip = await Trip.findOne({
      where: { id: trip_id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
        {
          model: City,
          as: "cities",
          include: [{ model: Country, as: "country" }],
        },
        {
          model: TripPlace,
          as: "places",
          include: [{ model: Place, as: "place" }],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [{ model: Place, as: "place" }],
            },
          ],
        },
      ],
    });

    return res.json(
      buildSuccessResponse({
        trip: updatedTrip,
        applied_changes: results.applied,
        failed_changes: results.failed,
      })
    );
  } catch (error) {
    console.error("[inspirePrompt] applyChanges error:", error);
    return res
      .status(500)
      .json(
        buildErrorResponse(
          "APPLICATION_ERROR",
          error.message || "Failed to apply changes to trip"
        )
      );
  }
};

/**
 * Build system prompt for trip modification
 */
function buildTripModificationPrompt(tripContext, userQuery, conversationHistory) {
  const tripContextStr = JSON.stringify(tripContext, null, 2);
  const conversationStr = conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  let additionalContext = "";
  if (tripContext.cities.length === 0) {
    additionalContext =
      "\n\nNOTE: This trip currently has no cities. Focus on ADD_CITY and ADD_PLACE operations to help the user build their trip from scratch.";
  }

  return `You are Walvee's expert trip modification assistant. You help users modify their existing trips by proposing specific changes.

CURRENT TRIP CONTEXT:
${tripContextStr}

CONVERSATION HISTORY:
${conversationStr}

USER REQUEST: "${userQuery}"

YOUR CAPABILITIES:
You can propose the following operations:
1. ADD_CITY - Add a new destination city to the trip
2. REMOVE_CITY - Remove an existing city (this will cascade to remove places/itinerary for that city)
3. ADD_PLACE - Add a specific place/activity to a city in the trip
4. REMOVE_PLACE - Remove a place from the trip
5. ADD_ITINERARY - Create or replace itinerary for a city

CRITICAL RULES:
1. ACCURACY: Only propose changes that make sense given the trip context
2. VALIDATION: Before removing a city or place, check it exists in the trip
3. SPECIFICITY: Always include Google Place IDs when adding places (use your knowledge of real places)
4. CLARIFICATION: If the user's request is ambiguous, ask clarifying questions with OPTIONS
5. BATCH: Return ALL changes as separate operations (don't group them)
6. REASONING: Include a "reason" for each change to explain why

WHEN TO ASK CLARIFICATION:
- City name is ambiguous (e.g., "Paris" could be France or Texas)
- User says "add a museum" without specifying which one
- Budget/preference is unclear
- Multiple interpretations exist

RESPONSE FORMAT:
If changes are ready, use response_type: "changes"
If clarification needed, use response_type: "clarification" with specific OPTIONS

EXAMPLES OF GOOD CLARIFICATION:
❌ BAD: "What kind of museum?" (no options)
✅ GOOD: "Which museum in Barcelona?" with options: [
  { "option_id": "opt1", "label": "Picasso Museum", "value": "Picasso Museum" },
  { "option_id": "opt2", "label": "MACBA", "value": "MACBA" },
  { "option_id": "opt3", "label": "CosmoCaixa", "value": "CosmoCaixa" }
]

❌ BAD: "Tell me more about your preferences" (too vague)
✅ GOOD: "What's your budget for accommodations?" with options: [
  { "option_id": "opt1", "label": "Budget ($)", "value": "budget" },
  { "option_id": "opt2", "label": "Mid-range ($$)", "value": "mid" },
  { "option_id": "opt3", "label": "Luxury ($$$)", "value": "luxury" }
]

Remember: Users appreciate specific, actionable suggestions with clear reasoning.${additionalContext}`;
}

/**
 * Get JSON schema for trip modification response
 */
function getTripModificationSchema() {
  return {
    type: "object",
    properties: {
      response_type: {
        type: "string",
        enum: ["changes", "clarification"],
      },
      message: {
        type: "string",
        description: "Friendly explanation of what you're proposing or asking",
      },
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: [
                "ADD_CITY",
                "REMOVE_CITY",
                "ADD_PLACE",
                "REMOVE_PLACE",
                "ADD_ITINERARY",
              ],
            },
            operation_id: { type: "string" },
            data: { type: "object" },
            reason: { type: "string" },
          },
          required: ["operation", "operation_id", "data"],
        },
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question_id: { type: "string" },
            question_text: { type: "string" },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  option_id: { type: "string" },
                  label: { type: "string" },
                  value: { type: "string" },
                },
                required: ["option_id", "label", "value"],
              },
            },
            allow_freeform: { type: "boolean" },
          },
          required: ["question_id", "question_text", "options"],
        },
      },
    },
    required: ["response_type", "message"],
  };
}

/**
 * Get JSON schema by type for normal inspire flows
 */
function getSchemaByType(schemaType) {
  switch (schemaType) {
    case "organize_trip":
      return {
        type: "object",
        properties: {
          itinerary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                places: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      estimated_duration: { type: "string" },
                      notes: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      };

    case "recommendations":
      return {
        type: "object",
        properties: {
          message: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
                city: { type: "string" },
                country: { type: "string" },
                why: { type: "string" },
              },
            },
          },
        },
      };

    default:
      return null;
  }
}
