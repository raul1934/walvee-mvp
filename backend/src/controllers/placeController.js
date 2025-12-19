const {
  Place,
  PlacePhoto,
  City,
  Country,
  Trip,
  TripPlace,
  Review,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");
const {
  searchPlace,
  getPlaceDetailsWithPhotos,
  searchCitiesFromGoogle,
  getPlaceDetails,
  getTimezone,
} = require("../services/googleMapsService");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Helper function to find or create a city from Google Maps place data
 */
async function findOrCreateCityFromPlace(placeDetails) {
  if (!placeDetails.city_name) {
    return null;
  }

  try {
    // First, try to find the city by name
    let city = await City.findOne({
      where: { name: placeDetails.city_name },
      include: [{ model: Country, as: "country" }],
    });

    if (city) {
      console.log(
        `[Place City Lookup] Found existing city: ${city.name}, ID: ${city.id}`
      );
      return city.id;
    }

    // If city doesn't exist and we have enough info, create it
    if (placeDetails.latitude && placeDetails.longitude) {
      console.log(
        `[Place City Lookup] City not found, attempting to create: ${placeDetails.city_name}`
      );

      // Search for the city to get its google_maps_id
      const cityResults = await searchCitiesFromGoogle(
        placeDetails.city_name,
        1
      );

      if (cityResults && cityResults.length > 0) {
        const cityGoogleData = await getPlaceDetails(
          cityResults[0].google_maps_id
        );

        // Find or create country
        let country = null;
        if (cityGoogleData.country_code) {
          country = await Country.findOne({
            where: { code: cityGoogleData.country_code },
          });

          if (!country && cityGoogleData.country_name) {
            country = await Country.create({
              code: cityGoogleData.country_code,
              name: cityGoogleData.country_name,
            });
            console.log(
              `[Place City Lookup] Created new country: ${country.name}`
            );
          }
        }

        // Get timezone if we have coordinates
        let timezone = null;
        if (cityGoogleData.latitude && cityGoogleData.longitude) {
          try {
            const timezoneData = await getTimezone(
              cityGoogleData.latitude,
              cityGoogleData.longitude
            );
            timezone = timezoneData.timezone_id;
          } catch (error) {
            console.error(
              "[Place City Lookup] Error fetching timezone:",
              error.message
            );
          }
        }

        // Create the city
        city = await City.create({
          name: cityGoogleData.name,
          google_maps_id: cityResults[0].google_maps_id,
          country_id: country?.id,
          state: cityGoogleData.state,
          latitude: cityGoogleData.latitude,
          longitude: cityGoogleData.longitude,
          timezone,
        });

        console.log(
          `[Place City Lookup] Created new city: ${city.name}, ID: ${city.id}`
        );
        return city.id;
      }
    }

    return null;
  } catch (error) {
    console.error(
      "[Place City Lookup] Error finding/creating city:",
      error.message
    );
    return null;
  }
}

/**
 * Search for a place and cache it in database
 * Logic:
 * 1. Search in database first by name
 * 2. If found with photos, return cached data
 * 3. If not found, fetch from Google Maps API
 * 4. Save place and photos to database
 * 5. Return complete place data
 */
const searchPlaces = async (req, res, next) => {
  try {
    const { query, city_id, destination } = req.query;

    if (!query) {
      return res
        .status(400)
        .json(
          buildErrorResponse("INVALID_INPUT", "Query parameter is required")
        );
    }

    console.log(
      `[Place Search] Searching for: "${query}" in destination: "${destination}"`
    );

    // STEP 1: Search existing place in database
    const whereClause = {
      name: { [Op.like]: `%${query}%` },
    };

    if (city_id) {
      whereClause.city_id = city_id;
    }

    let existingPlace = await Place.findOne({
      where: whereClause,
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          separate: true,
          order: [["photo_order", "ASC"]],
        },
      ],
    });

    // STEP 2: If found with photos, return cached data
    if (
      existingPlace &&
      existingPlace.photos &&
      existingPlace.photos.length > 0
    ) {
      console.log(
        `[Place Search] Found cached place: ${existingPlace.name} with ${existingPlace.photos.length} photos`
      );
      return res.json(buildSuccessResponse(existingPlace));
    }

    // STEP 3: Fetch from Google Maps API
    console.log(`[Place Search] Not in cache, fetching from Google Maps API`);

    const googleResult = await searchPlace(query, destination);

    if (!googleResult) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Place not found"));
    }

    // STEP 4: Get detailed place information with photos
    const placeDetails = await getPlaceDetailsWithPhotos(googleResult.place_id);

    console.log(
      `[Place Search] Fetched place details: ${placeDetails.name} with ${placeDetails.photos.length} photos`
    );

    // Find or create city if we have city information
    let resolvedCityId = city_id;
    if (!resolvedCityId && placeDetails.city_name) {
      resolvedCityId = await findOrCreateCityFromPlace(placeDetails);
    }

    // STEP 5: Save place to database
    let newPlace;
    try {
      newPlace = await Place.create({
        google_place_id: placeDetails.place_id,
        name: placeDetails.name,
        address: placeDetails.formatted_address,
        city_id: resolvedCityId,
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
        rating: placeDetails.rating,
        user_ratings_total: placeDetails.user_ratings_total,
        price_level: placeDetails.price_level,
        types: placeDetails.types,
        phone_number: placeDetails.phone_number,
        website: placeDetails.website,
        opening_hours: placeDetails.opening_hours,
      });

      console.log(
        `[Place Search] Saved new place to database: ${newPlace.name}`
      );
    } catch (error) {
      // If duplicate, fetch existing
      if (error.name === "SequelizeUniqueConstraintError") {
        console.log(
          `[Place Search] Place already exists, fetching from database`
        );
        newPlace = await Place.findOne({
          where: { google_place_id: placeDetails.place_id },
        });
      } else {
        throw error;
      }
    }

    // STEP 6: Save photos (limit to 10 to save space)
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photoPromises = placeDetails.photos.slice(0, 10).map((photo, idx) =>
        PlacePhoto.create({
          place_id: newPlace.id,
          google_photo_reference: photo.photo_reference,
          url_small: photo.url_small,
          url_medium: photo.url_medium,
          url_large: photo.url_large,
          width: photo.width,
          height: photo.height,
          attribution: photo.html_attributions?.[0] || null,
          photo_order: idx,
        }).catch((err) => {
          // Ignore duplicates
          if (err.name !== "SequelizeUniqueConstraintError") {
            console.error(`[Place Search] Error saving photo:`, err);
          }
          return null;
        })
      );

      await Promise.all(photoPromises);
      console.log(`[Place Search] Saved ${placeDetails.photos.length} photos`);
    }

    // STEP 7: Return complete data with photos
    const completePlace = await Place.findByPk(newPlace.id, {
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          separate: true,
          order: [["photo_order", "ASC"]],
        },
      ],
    });

    return res.json(buildSuccessResponse(completePlace));
  } catch (error) {
    console.error("[Place Search] Error:", error);
    next(error);
  }
};

/**
 * Get enriched places for a trip
 * Returns all trip places with cached Google Maps data
 */
const getTripPlacesEnriched = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(
      `[Trip Places Enriched] Fetching enriched places for trip: ${id}`
    );

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "placeDetails",
              include: [
                {
                  model: PlacePhoto,
                  as: "photos",
                  separate: true,
                  order: [["photo_order", "ASC"]],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Trip not found"));
    }

    // For trip places without cached data, fetch from Google
    const enrichedPlaces = [];

    for (const tripPlace of trip.places) {
      if (tripPlace.placeDetails?.photos?.length > 0) {
        // Already enriched with photos
        enrichedPlaces.push(tripPlace);
      } else if (tripPlace.name) {
        // Need to fetch and cache
        try {
          console.log(
            `[Trip Places Enriched] Enriching place: ${tripPlace.name}`
          );

          const googleResult = await searchPlace(
            tripPlace.name,
            trip.destination
          );

          if (googleResult) {
            const placeDetails = await getPlaceDetailsWithPhotos(
              googleResult.place_id
            );

            // Save to database
            let place = await Place.findOne({
              where: { google_place_id: placeDetails.place_id },
            });

            if (!place) {
              // Find or create city
              const cityId = await findOrCreateCityFromPlace(placeDetails);

              place = await Place.create({
                google_place_id: placeDetails.place_id,
                name: placeDetails.name,
                address: placeDetails.formatted_address,
                city_id: cityId,
                latitude: placeDetails.latitude,
                longitude: placeDetails.longitude,
                rating: placeDetails.rating,
                user_ratings_total: placeDetails.user_ratings_total,
                price_level: placeDetails.price_level,
                types: placeDetails.types,
                phone_number: placeDetails.phone_number,
                website: placeDetails.website,
                opening_hours: placeDetails.opening_hours,
              });

              // Save photos
              if (placeDetails.photos && placeDetails.photos.length > 0) {
                await Promise.all(
                  placeDetails.photos.slice(0, 10).map((photo, idx) =>
                    PlacePhoto.create({
                      place_id: place.id,
                      google_photo_reference: photo.photo_reference,
                      url_small: photo.url_small,
                      url_medium: photo.url_medium,
                      url_large: photo.url_large,
                      width: photo.width,
                      height: photo.height,
                      attribution: photo.html_attributions?.[0] || null,
                      photo_order: idx,
                    }).catch(() => null)
                  )
                );
              }
            }

            // Update trip_place to link to cached place
            if (tripPlace.place_id !== place.id) {
              await tripPlace.update({ place_id: place.id });
            }

            // Fetch complete place with photos
            const completePlace = await Place.findByPk(place.id, {
              include: [
                {
                  model: PlacePhoto,
                  as: "photos",
                  separate: true,
                  order: [["photo_order", "ASC"]],
                },
              ],
            });

            tripPlace.placeDetails = completePlace;
          }
        } catch (error) {
          console.error(
            `[Trip Places Enriched] Error enriching place ${tripPlace.name}:`,
            error.message
          );
        }

        enrichedPlaces.push(tripPlace);
      } else {
        enrichedPlaces.push(tripPlace);
      }
    }

    console.log(
      `[Trip Places Enriched] Enriched ${enrichedPlaces.length} places`
    );

    return res.json(buildSuccessResponse(enrichedPlaces));
  } catch (error) {
    console.error("[Trip Places Enriched] Error:", error);
    next(error);
  }
};

/**
 * Get place by ID
 */
const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await Place.findByPk(id, {
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          separate: true,
          order: [["photo_order", "ASC"]],
        },
        {
          model: City,
          as: "city",
        },
      ],
    });

    if (!place) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Place not found"));
    }

    // Format photos with full URLs
    const formattedPlace = {
      ...place.toJSON(),
      photos:
        place.photos?.map((photo) => ({
          ...photo.toJSON(),
          url_small: getFullImageUrl(photo.url_small),
          url_medium: getFullImageUrl(photo.url_medium),
          url_large: getFullImageUrl(photo.url_large),
        })) || [],
    };

    return res.json(buildSuccessResponse(formattedPlace));
  } catch (error) {
    console.error("[Get Place] Error:", error);
    next(error);
  }
};

/**
 * Helper to initialize Gemini AI
 */
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Places] GEMINI_API_KEY not configured");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Helper to generate AI review text using Gemini
 */
const generateAiReviewText = async (place) => {
  try {
    const genAI = initGemini();
    if (!genAI) {
      throw new Error("LLM service not configured");
    }

    const prompt = `Create a helpful, editorial-style summary and practical guide for this destination:

**Place:** ${place.name}
**Location:** ${place.formatted_address || ""}
**Type:** ${place.types?.[0] || "attraction"}
**Rating:** ${place.rating ? `${place.rating}/5` : "N/A"}

**Your role:** Provide a curated overview and practical insights that complement other reviews.

**Requirements:**

1. **Structure:** Write 3-4 short, scannable paragraphs (max 4 lines each)

2. **Content sections:**
   - **Overview:** What makes this place special and who it's perfect for
   - **Atmosphere & Experience:** Vibe, ambiance, what to expect
   - **Practical Tips:** Best times to visit, how to get there, what to bring
   - **Insider Info:** Local tips, things first-timers should know

3. **Sources:**
   - If using external info, cite at the end:
   
Sources:
- [Source Name](full_url)
- [Another Source](full_url)

4. **Rating:** Provide a realistic 4-5 star rating based on the place's actual reputation

**Tone:** Helpful travel curator sharing expert insights — informative, warm, trustworthy.`;

    const modelConfig = {
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            text: { type: "string" },
          },
          required: ["rating", "text"],
        },
      },
    };

    const geminiModel = genAI.getGenerativeModel(modelConfig);
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("[Generate AI Review] Error:", error.message);
    throw error;
  }
};

/**
 * Get AI review for a place
 * Returns saved AI review if exists, otherwise generates and saves a new one
 */
const getAiReview = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "placeId is required"));
    }

    // Find the AI review for this place
    let aiReview = await Review.findOne({
      where: {
        place_id: placeId,
        is_ai_generated: true,
      },
      attributes: ["id", "place_id", "ai_rating", "ai_text", "created_at"],
    });

    // If found, return it
    if (aiReview) {
      console.log(
        `[Get AI Review] Found existing AI review for place: ${placeId}`
      );
      return res.json(
        buildSuccessResponse(
          {
            id: aiReview.id,
            place_id: aiReview.place_id,
            rating: aiReview.ai_rating,
            text: aiReview.ai_text,
            created_at: aiReview.created_at,
          },
          "AI review retrieved successfully"
        )
      );
    }

    // If not found, generate new one
    console.log(
      `[Get AI Review] No existing AI review found, generating new one for place: ${placeId}`
    );

    // Get place details
    const place = await Place.findByPk(placeId);
    if (!place) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Place not found"));
    }

    // Generate AI review
    const aiGeneratedReview = await generateAiReviewText(place.toJSON());

    if (
      !aiGeneratedReview ||
      !aiGeneratedReview.rating ||
      !aiGeneratedReview.text
    ) {
      throw new Error("Failed to generate AI review");
    }

    // Save the generated review
    aiReview = await Review.create({
      place_id: placeId,
      ai_rating: aiGeneratedReview.rating,
      ai_text: aiGeneratedReview.text,
      is_ai_generated: true,
    });

    console.log(
      `[Get AI Review] Created and saved new AI review for place: ${placeId}`
    );

    return res.json(
      buildSuccessResponse(
        {
          id: aiReview.id,
          place_id: aiReview.place_id,
          rating: aiReview.ai_rating,
          text: aiReview.ai_text,
          created_at: aiReview.created_at,
        },
        "AI review generated and saved successfully"
      )
    );
  } catch (error) {
    console.error("[Get AI Review] Error:", error);
    next(error);
  }
};

module.exports = {
  searchPlaces,
  getTripPlacesEnriched,
  getPlaceById,
  getAiReview,
};
