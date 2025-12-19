const { City, Country, CityReview } = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const {
  searchCitiesFromGoogle,
  getPlaceDetails,
  getTimezone,
} = require("../services/googleMapsService");

/**
 * Search cities with auto-population from Google Maps API
 * Logic:
 * 1. Search in our database first (limit 5)
 * 2. If we have 5 or more results, return them
 * 3. If less than 5, fetch from Google Maps API
 * 4. Save new cities to database
 * 5. Query database again and return all results
 */
const searchCities = async (req, res, next) => {
  try {
    const { query, google_maps_id } = req.query;

    if (!query && !google_maps_id) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Query or google_maps_id is required"
          )
        );
    }

    // If google_maps_id is provided, search by it first
    if (google_maps_id) {
      const existingCity = await City.findOne({
        where: { google_maps_id },
        include: [{ model: Country, as: "country" }],
      });

      if (existingCity) {
        return res.json(buildSuccessResponse([existingCity]));
      }
    }

    // STEP 1: Search existing cities in our database by name
    let existingCities = [];
    if (query) {
      existingCities = await City.findAll({
        where: {
          name: { [Op.like]: `%${query}%` },
        },
        include: [{ model: Country, as: "country" }],
        limit: 5,
        order: [["name", "ASC"]],
      });
    }

    // STEP 2: If we have 5 or more results, return them immediately
    if (existingCities.length >= 5) {
      console.log(
        `[City Search] Found ${existingCities.length} cities in database, returning them`
      );
      return res.json(buildSuccessResponse(existingCities));
    }

    // STEP 3: We have less than 5 results, fetch from Google Maps API
    console.log(
      `[City Search] Only ${existingCities.length} cities in database, fetching from Google Maps`
    );

    try {
      // Fetch city predictions from Google Maps
      const googleCities = await searchCitiesFromGoogle(query, 5);

      console.log(
        `[City Search] Found ${googleCities.length} cities from Google Maps`
      );

      // STEP 4: Save new cities to database (only those not already in our DB)
      const savedCities = [];
      for (const googleCity of googleCities) {
        try {
          // Check if this city already exists by google_maps_id
          const exists = await City.findOne({
            where: { google_maps_id: googleCity.google_maps_id },
          });

          if (!exists) {
            // Get detailed place information
            const placeDetails = await getPlaceDetails(
              googleCity.google_maps_id
            );

            // Get or create country
            let country;
            if (placeDetails.country_code) {
              [country] = await Country.findOrCreate({
                where: { code: placeDetails.country_code.toUpperCase() },
                defaults: {
                  name:
                    placeDetails.country_name ||
                    placeDetails.country_code.toUpperCase(),
                  code: placeDetails.country_code.toUpperCase(),
                },
              });
            }

            // Get timezone if we have coordinates
            let timezone = null;
            if (placeDetails.latitude && placeDetails.longitude) {
              try {
                const tzInfo = await getTimezone(
                  placeDetails.latitude,
                  placeDetails.longitude
                );
                timezone = tzInfo.timezone_id;
              } catch (tzError) {
                console.warn(
                  `[City Search] Could not fetch timezone for ${placeDetails.name}:`,
                  tzError.message
                );
              }
            }

            // Create city entry
            const newCity = await City.create({
              name: placeDetails.name,
              country_id: country?.id,
              google_maps_id: placeDetails.google_maps_id,
              state: placeDetails.state,
              latitude: placeDetails.latitude,
              longitude: placeDetails.longitude,
              timezone,
            });

            savedCities.push(newCity);
            console.log(
              `[City Search] Saved new city: ${newCity.name}, ${country?.name}`
            );
          }
        } catch (saveError) {
          console.error(
            `[City Search] Error saving city ${googleCity.description}:`,
            saveError.message
          );
          // Continue with next city even if one fails
        }
      }

      console.log(
        `[City Search] Saved ${savedCities.length} new cities to database`
      );
    } catch (googleError) {
      console.error(
        "[City Search] Error fetching from Google Maps:",
        googleError.message
      );
      // If Google Maps fails, we'll just return what we have from database
      // Don't return error to user, fall through to step 5
    }

    // STEP 5: Query database again to get all matching cities
    const finalCities = await City.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
      include: [{ model: Country, as: "country" }],
      limit: 10,
      order: [["name", "ASC"]],
    });

    console.log(
      `[City Search] Returning ${finalCities.length} total cities after Google Maps fetch`
    );
    return res.json(buildSuccessResponse(finalCities));
  } catch (error) {
    next(error);
  }
};

/**
 * Get or create a city from Google Maps data
 * This is used when we need to ensure a city exists in our database
 * Can accept either manual data or just a google_maps_id to fetch from API
 */
const getOrCreateCity = async (req, res, next) => {
  try {
    const {
      name,
      country_code,
      country_name,
      google_maps_id,
      state,
      latitude,
      longitude,
      timezone,
    } = req.body;

    if (!google_maps_id && !name) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Either google_maps_id or city name is required"
          )
        );
    }

    // First, check if city already exists by google_maps_id
    if (google_maps_id) {
      const existingCity = await City.findOne({
        where: { google_maps_id },
        include: [{ model: Country, as: "country" }],
      });

      if (existingCity) {
        return res.json(buildSuccessResponse(existingCity));
      }
    }

    // If google_maps_id is provided but city doesn't exist, fetch from Google Maps
    let placeData = {
      name,
      country_code,
      country_name,
      google_maps_id,
      state,
      latitude,
      longitude,
      timezone,
    };

    if (google_maps_id && (!name || !country_code)) {
      try {
        console.log(
          `[Get or Create City] Fetching place details from Google Maps for ${google_maps_id}`
        );
        const placeDetails = await getPlaceDetails(google_maps_id);

        // Merge with provided data (provided data takes precedence)
        placeData = {
          name: name || placeDetails.name,
          country_code: country_code || placeDetails.country_code,
          country_name: country_name || placeDetails.country_name,
          google_maps_id: google_maps_id,
          state: state || placeDetails.state,
          latitude: latitude || placeDetails.latitude,
          longitude: longitude || placeDetails.longitude,
          timezone: timezone,
        };

        // Get timezone if we have coordinates and timezone not provided
        if (!timezone && placeData.latitude && placeData.longitude) {
          try {
            const tzInfo = await getTimezone(
              placeData.latitude,
              placeData.longitude
            );
            placeData.timezone = tzInfo.timezone_id;
          } catch (tzError) {
            console.warn(
              `[Get or Create City] Could not fetch timezone:`,
              tzError.message
            );
          }
        }
      } catch (googleError) {
        console.error(
          `[Get or Create City] Error fetching from Google Maps:`,
          googleError.message
        );
        return res
          .status(400)
          .json(
            buildErrorResponse(
              "GOOGLE_MAPS_ERROR",
              "Could not fetch place details from Google Maps"
            )
          );
      }
    }

    if (!placeData.name || !placeData.country_code) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "City name and country information are required"
          )
        );
    }

    // Find or create the country first
    let country;
    if (placeData.country_code) {
      [country] = await Country.findOrCreate({
        where: { code: placeData.country_code.toUpperCase() },
        defaults: {
          name: placeData.country_name || placeData.country_code.toUpperCase(),
          code: placeData.country_code.toUpperCase(),
        },
      });
    } else {
      [country] = await Country.findOrCreate({
        where: { name: placeData.country_name },
        defaults: {
          name: placeData.country_name,
          code: placeData.country_name.substring(0, 2).toUpperCase(),
        },
      });
    }

    // Check if city already exists with same name and country
    const existingCity = await City.findOne({
      where: {
        name: placeData.name,
        country_id: country.id,
      },
      include: [{ model: Country, as: "country" }],
    });

    if (existingCity) {
      // Update google_maps_id if it wasn't set before
      if (placeData.google_maps_id && !existingCity.google_maps_id) {
        await existingCity.update({ google_maps_id: placeData.google_maps_id });
      }
      console.log(
        `[Get or Create City] City already exists: ${existingCity.name}`
      );
      return res.json(buildSuccessResponse(existingCity));
    }

    // Create new city
    const newCity = await City.create({
      name: placeData.name,
      country_id: country.id,
      google_maps_id: placeData.google_maps_id,
      state: placeData.state,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      timezone: placeData.timezone,
    });

    // Fetch with country data
    const cityWithCountry = await City.findByPk(newCity.id, {
      include: [{ model: Country, as: "country" }],
    });

    console.log(
      `[Get or Create City] Created new city: ${cityWithCountry.name}, ${country.name}`
    );
    res.status(201).json(buildSuccessResponse(cityWithCountry));
  } catch (error) {
    next(error);
  }
};

/**
 * Get city by ID
 */
const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id, {
      include: [{ model: Country, as: "country" }],
    });

    if (!city) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
    }

    res.json(buildSuccessResponse(city));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all cities for a country
 */
const getCitiesByCountry = async (req, res, next) => {
  try {
    const { country_id, country_code } = req.query;

    if (!country_id && !country_code) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "country_id or country_code is required"
          )
        );
    }

    let country;
    if (country_code) {
      country = await Country.findOne({
        where: { code: country_code.toUpperCase() },
      });
    } else {
      country = await Country.findByPk(country_id);
    }

    if (!country) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Country not found"));
    }

    const cities = await City.findAll({
      where: { country_id: country.id },
      include: [{ model: Country, as: "country" }],
      order: [["name", "ASC"]],
    });

    res.json(buildSuccessResponse(cities));
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI review for a city (returns first AI review if exists)
 * GET /v1/cities/:cityId/reviews/ai
 */
const getCityAiReview = async (req, res, next) => {
  try {
    const { cityId } = req.params;

    if (!cityId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "cityId is required"));
    }

    // Find the AI review for this city
    const aiReview = await CityReview.findOne({
      where: {
        city_id: cityId,
        is_ai_generated: true,
      },
      attributes: ["id", "city_id", "rating", "comment", "created_at"],
    });

    if (!aiReview) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "No AI review found for this city")
        );
    }

    console.log(`[Get City AI Review] Found AI review for city: ${cityId}`);

    return res.json(
      buildSuccessResponse(
        {
          id: aiReview.id,
          city_id: aiReview.city_id,
          rating: aiReview.rating,
          text: aiReview.comment,
          created_at: aiReview.created_at,
        },
        "AI review retrieved successfully"
      )
    );
  } catch (error) {
    console.error("[Get City AI Review] Error:", error);
    next(error);
  }
};

module.exports = {
  searchCities,
  getOrCreateCity,
  getCityById,
  getCitiesByCountry,
  getCityAiReview,
};
