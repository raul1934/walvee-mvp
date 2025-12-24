/**
 * InspirePromptService
 * Centralizes all prompt building logic for the Inspire feature
 * Handles language detection, filter formatting, and AI prompt construction
 */

class InspirePromptService {
  /**
   * Detect language from user text
   * Ported from frontend (InspirePrompt.jsx lines 1106-1110)
   * @param {string} text - User input text
   * @returns {string} - "pt" or "en"
   */
  detectLanguage(text) {
    const portuguesePatterns =
      /\b(roteiro|viagem|praia|mergulho|hotel|cidade|país|dia|semana|mês|ano|quero|gostaria|preciso|ajuda|brasil|portugal)\b/i;
    return portuguesePatterns.test(text) ? "pt" : "en";
  }

  /**
   * Build filter context string
   * Ported from frontend (InspirePrompt.jsx lines 1083-1098)
   * @param {Object} filters - {interests, budget, pace, companions, season}
   * @returns {string} - Formatted filter context
   */
  buildFilterContext(filters) {
    if (!filters) return "";

    let filterContext = "";
    if (filters.interests && filters.interests.length > 0) {
      filterContext += `\nInterests: ${filters.interests.join(", ")}`;
    }
    if (filters.budget) {
      filterContext += `\nBudget: ${filters.budget}`;
    }
    if (filters.pace) {
      filterContext += `\nTravel pace: ${filters.pace}`;
    }
    if (filters.companions) {
      filterContext += `\nTraveling with: ${filters.companions}`;
    }
    if (filters.season) {
      filterContext += `\nPreferred season: ${filters.season}`;
    }

    return filterContext;
  }

  /**
   * Build conversation history string
   * Ported from frontend (InspirePrompt.jsx lines 1101-1103)
   * @param {Array} history - [{role, content}]
   * @returns {string} - Formatted conversation history
   */
  buildConversationHistory(history) {
    if (!history || history.length === 0) return "";

    return history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");
  }

  /**
   * Build recommendations prompt
   * Ported from frontend (InspirePrompt.jsx lines 1114-1177)
   * @param {string} userQuery - Raw user input
   * @param {Object} filters - User filters
   * @param {Array} conversationHistory - Message history
   * @param {string} cityContext - Active city name (optional)
   * @param {string} language - "pt" or "en"
   * @returns {string} - Complete prompt for Gemini
   */
  buildRecommendationsPrompt(
    userQuery,
    filters,
    conversationHistory,
    cityContext,
    language
  ) {
    const filterContext = this.buildFilterContext(filters);
    const conversationStr = this.buildConversationHistory(conversationHistory);

    let systemPrompt = `You are a travel planning assistant for Walvee, helping users create personalized trip itineraries.

IMPORTANT: Always check grammar and spelling in your responses. Ensure all text is grammatically correct in ${
      language === "pt" ? "Portuguese" : "English"
    }.`;

    // Add city context restriction if provided
    if (cityContext) {
      systemPrompt += `\n\nCURRENT CITY CONTEXT: The user is currently planning their trip to ${cityContext}. Focus recommendations ONLY on places, activities, and experiences IN ${cityContext}. Do NOT suggest other cities.`;
    }

    const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationStr}

USER FILTERS:${filterContext || " None specified yet"}

CURRENT USER MESSAGE: "${userQuery}"

INSTRUCTIONS:
1. **Check grammar and spelling** in all your responses
2. **Always provide recommendations** - ${
      cityContext
        ? "places, beaches, activities, or businesses IN " + cityContext
        : "cities, places, activities, or businesses"
    }
3. **Return structured data** with a conversational message AND recommendations
4. ${
      cityContext
        ? "**IMPORTANT: Only recommend places WITHIN " + cityContext + "**"
        : "**City Detection**: Identify if user mentioned a specific city"
    }
5. ${
      !cityContext
        ? "**If NO city mentioned AND no active city**: Suggest 3-4 destination cities"
        : ""
    }
6. **CRITICAL: For EVERY recommendation/place, you MUST include the google_place_id field**
   - This is the Google Place ID that uniquely identifies the location
   - Example: "ChIJN1t_tDeuEmsRUsoyG83frY4" (valid Place ID format)
   - Use your knowledge of real, verifiable locations with valid Google Place IDs
   - If you cannot find a valid Google Place ID for a recommendation, do not include that recommendation

**Response Format:**
{
  "message": "Warm, friendly response (2-3 sentences, use 1-2 emojis). ENSURE PERFECT GRAMMAR.",
  "recommendations": [
    {
      "name": "${
        cityContext ? "Place/Activity/Business Name" : "Place/City Name"
      }",
      "type": "${
        cityContext
          ? '"place" | "activity" | "business"'
          : '"city" | "place" | "activity" | "business" | "cidade" | "lugar" | "atividade" | "negócio"'
      }",
      "description": "Brief description",
      "city": "${cityContext || "City name (if applicable)"}",
      "country": "Country",
      "why": "Why it matches",
      "google_place_id": "REQUIRED - Google Place ID for this location"
    }
  ]
}

Provide 9-15 recommendations. Respond in ${
      language === "pt" ? "Portuguese" : "English"
    }.`;

    return fullPrompt;
  }

  /**
   * Build organize itinerary prompt
   * Ported from frontend (InspirePrompt.jsx line 875)
   * @param {string} userQuery - Optional custom instructions
   * @param {string} cityName - City name
   * @param {Array} places - Array of place objects
   * @param {number} days - Number of days
   * @param {string} language - "pt" or "en"
   * @returns {string} - Complete prompt for Gemini
   */
  buildOrganizeItineraryPrompt(userQuery, cityName, places, days, language) {
    const placesList = places
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.name}${p.address ? ` - ${p.address}` : ""}${
            p.rating ? ` (rating: ${p.rating})` : ""
          }`
      )
      .join("\n");

    const customInstructions = userQuery
      ? `\n\nADDITIONAL INSTRUCTIONS: ${userQuery}`
      : "";

    const prompt = `You are an expert travel planner. Create a ${days}-day itinerary for ${cityName} based on these places:

${placesList}${customInstructions}

Return JSON with a top-level key "itinerary" which is an array of days. Each day should be an object with:
- day (number)
- title (short, descriptive title for the day)
- description (1-2 sentences about the day's theme)
- places: array of objects with:
  - name (place name)
  - estimated_duration (e.g., "2h" or "30m")
  - notes (brief activity notes or tips)
  - google_place_id (REQUIRED - Google Place ID for this place)

CRITICAL: For EVERY place in the itinerary, you MUST include the google_place_id field.
- Use your knowledge of real places and their valid Google Place IDs
- Example: "ChIJN1t_tDeuEmsRUsoyG83frY4"
- If you cannot find a valid Google Place ID for a place, do not include that place in the itinerary

Keep durations short and realistic. Respond in ${
      language === "pt" ? "Portuguese" : "English"
    }.`;

    return prompt;
  }

  /**
   * Get recommendations JSON schema with google_maps_id
   * @returns {Object} - JSON schema for Gemini
   */
  getRecommendationsSchema() {
    return {
      type: "object",
      properties: {
        message: {
          type: "string",
          description:
            "Warm, friendly response (2-3 sentences, 1-2 emojis). ENSURE PERFECT GRAMMAR.",
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of place/city/activity",
              },
              type: {
                type: "string",
                enum: [
                  "city",
                  "place",
                  "activity",
                  "business",
                  "cidade",
                  "lugar",
                  "atividade",
                  "negócio",
                ],
                description: "Type of recommendation",
              },
              description: {
                type: "string",
                description: "Brief description of the recommendation",
              },
              city: {
                type: "string",
                description: "City name where this recommendation is located",
              },
              country: {
                type: "string",
                description: "Country name",
              },
              why: {
                type: "string",
                description: "Why this matches the user's preferences",
              },
              google_place_id: {
                type: "string",
                description:
                  "Google Place ID for this location. CRITICAL: Always provide this for accurate place identification. Matches database schema.",
              },
            },
            required: [
              "name",
              "type",
              "description",
              "city",
              "country",
              "why",
              "google_place_id",
            ],
          },
        },
      },
      required: ["message", "recommendations"],
    };
  }

  /**
   * Get organize itinerary JSON schema with google_maps_id
   * @returns {Object} - JSON schema for Gemini
   */
  getOrganizeItinerarySchema() {
    return {
      type: "object",
      properties: {
        itinerary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: {
                type: "number",
                description: "Day number (1, 2, 3, ...)",
              },
              title: {
                type: "string",
                description: "Short title for the day",
              },
              description: {
                type: "string",
                description: "1-2 sentence description of the day's theme",
              },
              places: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Place name",
                    },
                    estimated_duration: {
                      type: "string",
                      description: "Duration (e.g., '2h', '30m')",
                    },
                    notes: {
                      type: "string",
                      description: "Activity notes or tips",
                    },
                    google_place_id: {
                      type: "string",
                      description:
                        "Google Place ID. CRITICAL: Always provide this for accurate location data. Matches database schema.",
                    },
                  },
                  required: [
                    "name",
                    "estimated_duration",
                    "notes",
                    "google_place_id",
                  ],
                },
              },
            },
            required: ["day", "title", "description", "places"],
          },
        },
      },
      required: ["itinerary"],
    };
  }

  /**
   * Validate and enrich Google Place IDs and City IDs
   * Strategy: Check database first, then validate new places with Google Maps API
   * Missing or invalid IDs are replaced with "MANUAL_ENTRY_REQUIRED"
   *
   * @param {Array} recommendations - Array of recommendations with google_place_id
   * @param {Object} Place - Place model for database queries
   * @param {Object} googleMapsService - Google Maps API service instance
   * @param {Object} City - City model for database queries (optional)
   * @param {Object} Country - Country model for database queries (optional)
   * @returns {Promise<Array>} - Recommendations with validated/fixed Place IDs and City IDs
   */
  async validateAndEnrichPlaceIds(
    recommendations,
    Place,
    googleMapsService,
    City = null,
    Country = null
  ) {
    const validationResults = {
      total: recommendations.length,
      existingInDb: 0,
      newFromGoogleMaps: 0,
      invalid: 0,
      missing: 0,
    };

    // Process all validations in parallel for performance
    const validationPromises = recommendations.map(async (rec) => {
      // Check if Place ID is missing
      if (!rec.google_place_id || rec.google_place_id.trim() === "") {
        rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
        validationResults.missing++;
        console.warn(`[PlaceID] Missing for: ${rec.name}`);
        return rec;
      }

      // STEP 1: Check database first (fast lookup)
      try {
        const existingPlace = await Place.findOne({
          where: { google_place_id: rec.google_place_id },
        });

        if (existingPlace) {
          // Place already in database - use existing data
          validationResults.existingInDb++;
          console.log(
            `[PlaceID] Found in DB: ${rec.name} (${rec.google_place_id})`
          );

          // Optionally enrich recommendation with database data
          rec.enriched = {
            id: existingPlace.id,
            name: existingPlace.name,
            address: existingPlace.address,
            rating: existingPlace.rating,
            price_level: existingPlace.price_level,
            latitude: existingPlace.latitude,
            longitude: existingPlace.longitude,
            types: existingPlace.types,
            photos: existingPlace.photos,
          };
          return rec;
        }
      } catch (dbError) {
        console.error(
          `[PlaceID] DB lookup failed for: ${rec.name}`,
          dbError.message
        );
      }

      // STEP 1B: Not found by Place ID - Try database text search by name + city
      if (!rec.google_place_id || rec.google_place_id === "MANUAL_ENTRY_REQUIRED") {
        // Skip DB text search if Place ID is already invalid
      } else {
        try {
          console.log(
            `[PlaceID] Place ID not in DB, trying text search: "${rec.name}" in "${rec.city}"`
          );

          const { Op } = require("sequelize");
          const dbSearchResult = await Place.findOne({
            where: {
              name: {
                [Op.iLike]: `%${rec.name}%`, // Case-insensitive LIKE search
              },
            },
          });

          if (dbSearchResult) {
            validationResults.existingInDb++;
            console.log(
              `[PlaceID] Found in DB via text search: ${rec.name} → ${dbSearchResult.name} (${dbSearchResult.google_place_id})`
            );

            // Update recommendation with database Place ID
            rec.google_place_id = dbSearchResult.google_place_id;

            // Enrich recommendation with database data
            rec.enriched = {
              id: dbSearchResult.id,
              name: dbSearchResult.name,
              address: dbSearchResult.address,
              rating: dbSearchResult.rating,
              price_level: dbSearchResult.price_level,
              latitude: dbSearchResult.latitude,
              longitude: dbSearchResult.longitude,
              types: dbSearchResult.types,
              photos: dbSearchResult.photos,
            };

            // Add database UUID as place_id
            rec.place_id = dbSearchResult.id;

            return rec; // Skip Google Maps API entirely
          } else {
            console.log(
              `[PlaceID] Not found in DB via text search: ${rec.name}`
            );
          }
        } catch (dbTextSearchError) {
          console.error(
            `[PlaceID] DB text search failed for: ${rec.name}`,
            dbTextSearchError.message
          );
          // Continue to Google Maps API validation
        }
      }

      // STEP 2: Not in database - validate with Google Maps API
      try {
        const placeDetails =
          await googleMapsService.getPlaceDetailsWithPhotos(rec.google_place_id);

        if (!placeDetails || !placeDetails.place_id) {
          // Invalid Place ID
          console.warn(
            `[PlaceID] Invalid Google Place ID: ${rec.name} (${rec.google_place_id})`
          );
          rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
          validationResults.invalid++;
          return rec;
        }

        // STEP 3: Valid Place ID - Add to database
        const newPlace = await Place.create({
          google_place_id: placeDetails.place_id,
          name: placeDetails.name,
          address:
            placeDetails.formatted_address || placeDetails.vicinity || null,
          latitude: placeDetails.geometry?.location?.lat || null,
          longitude: placeDetails.geometry?.location?.lng || null,
          rating: placeDetails.rating || null,
          price_level: placeDetails.price_level || null,
          types: placeDetails.types || [],
          photos: placeDetails.photos || [],
        });

        validationResults.newFromGoogleMaps++;
        console.log(
          `[PlaceID] Added to DB: ${rec.name} (${rec.google_place_id})`
        );

        // Enrich recommendation with new place data
        rec.enriched = {
          id: newPlace.id,
          name: newPlace.name,
          address: newPlace.address,
          rating: newPlace.rating,
          price_level: newPlace.price_level,
          latitude: newPlace.latitude,
          longitude: newPlace.longitude,
          types: newPlace.types,
          photos: newPlace.photos,
        };
      } catch (error) {
        // STEP 2B: Place ID validation failed - Try text search fallback
        console.warn(
          `[PlaceID] Place ID validation failed for: ${rec.name} (${rec.google_place_id})`,
          error.message
        );
        console.log(
          `[PlaceID] Attempting text search fallback: "${rec.name}" in "${rec.city}"`
        );

        try {
          // Fallback: Search by name and city
          const searchResult = await googleMapsService.searchPlace(
            rec.name,
            rec.city
          );

          if (!searchResult || !searchResult.place_id) {
            // Text search also failed
            console.warn(
              `[PlaceID] Text search failed: ${rec.name} in ${rec.city} - No results found`
            );
            rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
            validationResults.invalid++;
            return rec;
          }

          // Text search succeeded - get full details with validated Place ID
          console.log(
            `[PlaceID] Text search found: ${searchResult.name} (${searchResult.place_id})`
          );

          const placeDetails = await googleMapsService.getPlaceDetailsWithPhotos(
            searchResult.place_id
          );

          if (!placeDetails || !placeDetails.place_id) {
            console.warn(
              `[PlaceID] Text search result validation failed: ${rec.name}`
            );
            rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
            validationResults.invalid++;
            return rec;
          }

          // STEP 3: Valid Place ID from text search - Add to database
          const newPlace = await Place.create({
            google_place_id: placeDetails.place_id,
            name: placeDetails.name,
            address:
              placeDetails.formatted_address || placeDetails.vicinity || null,
            latitude: placeDetails.geometry?.location?.lat || null,
            longitude: placeDetails.geometry?.location?.lng || null,
            rating: placeDetails.rating || null,
            price_level: placeDetails.price_level || null,
            types: placeDetails.types || [],
            photos: placeDetails.photos || [],
          });

          validationResults.newFromGoogleMaps++;
          console.log(
            `[PlaceID] Added to DB via text search: ${rec.name} → ${placeDetails.name} (${placeDetails.place_id})`
          );

          // Update recommendation with validated Place ID
          rec.google_place_id = placeDetails.place_id;

          // Enrich recommendation with new place data
          rec.enriched = {
            id: newPlace.id,
            name: newPlace.name,
            address: newPlace.address,
            rating: newPlace.rating,
            price_level: newPlace.price_level,
            latitude: newPlace.latitude,
            longitude: newPlace.longitude,
            types: newPlace.types,
            photos: newPlace.photos,
          };
        } catch (textSearchError) {
          // Text search also failed
          console.error(
            `[PlaceID] Text search fallback failed: ${rec.name}`,
            textSearchError.message
          );
          rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
          validationResults.invalid++;
        }
      }

      // Add database UUID as place_id in main response
      if (rec.enriched && rec.enriched.id) {
        rec.place_id = rec.enriched.id; // Database UUID
      }

      return rec;
    });

    const validatedRecommendations = await Promise.all(validationPromises);

    // Enrich with city_id if City and Country models are provided
    if (City && Country) {
      await this.enrichWithCityIds(validatedRecommendations, City, Country);
    }

    // Log summary
    console.log("[PlaceID] Validation Summary:", validationResults);

    return validatedRecommendations;
  }

  /**
   * Enrich recommendations with city_id from database
   * Creates city records if they don't exist
   *
   * @param {Array} recommendations - Array of recommendations
   * @param {Object} City - City model
   * @param {Object} Country - Country model
   * @returns {Promise<void>}
   */
  async enrichWithCityIds(recommendations, City, Country) {
    const cityEnrichmentPromises = recommendations.map(async (rec) => {
      if (!rec.city || !rec.country) {
        console.warn(
          `[CityID] Missing city or country for: ${rec.name}, skipping city enrichment`
        );
        return;
      }

      try {
        // Step 1: Find or create country
        let country = await Country.findOne({
          where: { name: rec.country },
        });

        if (!country) {
          country = await Country.create({
            name: rec.country,
          });
          console.log(`[CityID] Created country: ${rec.country}`);
        }

        // Step 2: Find or create city
        let city = await City.findOne({
          where: {
            name: rec.city,
            country_id: country.id,
          },
        });

        if (!city) {
          city = await City.create({
            name: rec.city,
            country_id: country.id,
            google_maps_id: rec.google_place_id || null, // Use google_place_id if available
          });
          console.log(
            `[CityID] Created city: ${rec.city}, ${rec.country} (${city.id})`
          );
        }

        // Step 3: Add city_id to recommendation
        rec.city_id = city.id;
        console.log(
          `[CityID] Enriched ${rec.name} with city_id: ${city.id}`
        );
      } catch (error) {
        console.error(
          `[CityID] Failed to enrich city for ${rec.name}:`,
          error.message
        );
      }
    });

    await Promise.all(cityEnrichmentPromises);
  }
}

module.exports = InspirePromptService;
