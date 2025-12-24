const {
  Place,
  PlacePhoto,
  City,
  Country,
  Trip,
  TripPlace,
  PlaceReview,
  User,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
  generateUUID,
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
      return city.id;
    }

    // If city doesn't exist and we have enough info, create it
    if (placeDetails.latitude && placeDetails.longitude) {
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
    const { query, city_id, destination, city, type, limit } = req.query;

    if (!query) {
      return res
        .status(400)
        .json(
          buildErrorResponse("INVALID_INPUT", "Query parameter is required")
        );
    }

    // If caller passed a city name (param `city`) but not city_id, attempt to resolve it
    let resolvedCityId = city_id;
    let destinationBias = destination || city;
    if (!resolvedCityId && city) {
      try {
        const foundCity = await City.findOne({ where: { name: city } });
        if (foundCity) {
          resolvedCityId = foundCity.id;
        }
      } catch (err) {
        console.error("[Place Search] Error resolving city name:", err.message);
      }
    }

    // STEP 1: Search existing place in database (return multiple results)
    const whereClause = {
      name: { [Op.like]: `%${query}%` },
      visible: true,
    };

    if (resolvedCityId) {
      whereClause.city_id = resolvedCityId;
    }

    const maxResults = Math.min(parseInt(limit || 10, 10), 50);

    const dbResults = await Place.findAll({
      where: whereClause,
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          separate: true,
          order: [["photo_order", "ASC"]],
        },
      ],
      limit: maxResults,
    });

    // If type filter provided, filter results that include the type
    let filteredDbResults = dbResults;
    if (type) {
      filteredDbResults = dbResults.filter((p) => {
        if (!p.types) return false;
        try {
          return Array.isArray(p.types)
            ? p.types.includes(type)
            : JSON.stringify(p.types)
                .toLowerCase()
                .includes(type.toLowerCase());
        } catch (e) {
          return false;
        }
      });
    }

    if (filteredDbResults && filteredDbResults.length > 0) {
      console.log(
        `[Place Search] Returning ${
          filteredDbResults.length
        } cached DB results for query="${query}" type=${type || ""} city=${
          city || ""
        }`
      );
      return res.json(buildSuccessResponse(filteredDbResults));
    }

    // STEP 2: Fallback - search Google Places Text Search for multiple results
    const googleResults = await searchPlacesText(
      query,
      destinationBias,
      type,
      maxResults
    );

    if (!googleResults || googleResults.length === 0) {
      console.log(
        `[Place Search] No Google results for query="${query}" type=${
          type || ""
        } city=${city || ""}`
      );
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Place not found"));
    }

    // Convert Google results into a lightweight response shape
    const results = googleResults.map((r) => ({
      id: null,
      google_place_id: r.place_id,
      name: r.name,
      address: r.formatted_address || r.vicinity || "",
      types: r.types || [],
      rating: r.rating || null,
      user_ratings_total: r.user_ratings_total || null,
      photos: [],
    }));

    console.log(
      `[Place Search] Returning ${
        results.length
      } Google results for query="${query}" type=${type || ""} city=${
        city || ""
      }`
    );

    return res.json(buildSuccessResponse(results));

    // STEP 4: Get detailed place information with photos
    const placeDetails = await getPlaceDetailsWithPhotos(googleResult.place_id);

    // Find or create city if we have city information
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
    } catch (error) {
      // If duplicate, fetch existing
      if (error.name === "SequelizeUniqueConstraintError") {
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

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: TripPlace,
          as: "places",
          separate: true,
          order: [["display_order", "ASC"]],
          include: [
            {
              model: Place,
              as: "place",
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
      if (tripPlace.place?.photos?.length > 0) {
        // Already enriched with photos
        enrichedPlaces.push(tripPlace);
      } else if (tripPlace.name) {
        // Need to fetch and cache
        try {
          const googleResult = await searchPlace(
            tripPlace.name,
            (trip.cities && trip.cities[0]?.name) || trip.destination
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

              try {
                // Ensure trip_cities row exists for this trip and place's city
                const placeCityId = place.city_id;
                if (placeCityId) {
                  // Insert with city_order = tripPlace.display_order or keep the min
                  await Trip.sequelize.query(
                    `INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at)
                     VALUES (?, ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE city_order = LEAST(city_order, VALUES(city_order))`,
                    {
                      replacements: [
                        generateUUID(),
                        tripPlace.trip_id,
                        placeCityId,
                        tripPlace.display_order || 0,
                      ],
                    }
                  );
                }
              } catch (err) {
                console.error(
                  "[Trip Cities Upsert] Error ensuring trip_cities row:",
                  err.message
                );
              }
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

            tripPlace.place = completePlace;
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
 * Get reviews for a place (AI review first, then user reviews ordered by date)
 * GET /v1/places/:placeId/reviews
 * Returns AI review first (generates if doesn't exist), then all user reviews
 */
const getPlaceReviews = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "placeId is required"));
    }

    // Find the AI review for this place
    let aiReview = await PlaceReview.findOne({
      where: {
        place_id: placeId,
        is_ai_generated: true,
      },
      attributes: [
        "id",
        "place_id",
        "rating",
        "comment",
        "price_opinion",
        "created_at",
      ],
    });

    // If AI review not found, generate new one
    if (!aiReview) {
      // Get place details
      const place = await Place.findByPk(placeId);
      if (place) {
        try {
          // Generate AI review
          const aiGeneratedReview = await generateAiReviewText(place.toJSON());

          if (
            aiGeneratedReview &&
            aiGeneratedReview.rating &&
            aiGeneratedReview.text
          ) {
            // Save the generated review with AI system user
            const systemUserId = "00000000-0000-0000-0000-000000000000";
            aiReview = await PlaceReview.create({
              place_id: placeId,
              reviewer_id: systemUserId,
              created_by: "ai-system",
              rating: aiGeneratedReview.rating,
              comment: aiGeneratedReview.text,
              is_ai_generated: true,
            });
          }
        } catch (genError) {
          console.error(
            "[Get Place Reviews] Error generating AI review:",
            genError
          );
          // Continue without AI review
        }
      }
    }

    // Get all user reviews ordered by created_at DESC
    const userReviews = await PlaceReview.findAll({
      where: {
        place_id: placeId,
        is_ai_generated: false,
      },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Build response with AI review first, then user reviews
    const allReviews = [];

    if (aiReview) {
      allReviews.push({
        id: aiReview.id,
        place_id: aiReview.place_id,
        rating: aiReview.rating,
        comment: aiReview.comment,
        price_opinion: aiReview.price_opinion,
        is_ai_generated: true,
        created_by: "ai-system",
        created_at: aiReview.created_at,
      });
    }

    // Add user reviews
    allReviews.push(
      ...userReviews.map((review) => ({
        id: review.id,
        place_id: review.place_id,
        reviewer_id: review.reviewer_id,
        created_by: review.created_by,
        rating: review.rating,
        comment: review.comment,
        price_opinion: review.price_opinion,
        is_ai_generated: false,
        created_at: review.created_at,
        reviewer: review.reviewer,
      }))
    );

    return res.json(
      buildSuccessResponse(allReviews, `Retrieved ${allReviews.length} reviews`)
    );
  } catch (error) {
    console.error("[Get Place Reviews] Error:", error);
    next(error);
  }
};

module.exports = {
  searchPlaces,
  getTripPlacesEnriched,
  getPlaceById,
  getPlaceReviews,
};
