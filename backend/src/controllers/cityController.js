const {
  City,
  Country,
  CityReview,
  Trip,
  CityPhoto,
  TripImage,
  PlacePhoto,
  User,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  Place,
  Follow,
} = require("../models/sequelize");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../database/sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  paginate,
  buildPaginationMeta,
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
        include: [
          { model: Country, as: "country" },
          {
            model: CityPhoto,
            as: "photos",
            required: false,
            limit: 1,
            order: [["photo_order", "ASC"]],
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM trip_cities tc
                WHERE tc.city_id = City.id
              )`),
              "tripsCount",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM places p
                WHERE p.city_id = City.id
              )`),
              "placesCount",
            ],
          ],
        },
        limit: 5,
        order: [["name", "ASC"]],
      });
    }

    // STEP 2: If we have 5 or more results, format and return them immediately
    if (existingCities.length >= 5) {
      const formattedCities = existingCities.map((city) => ({
        id: city.id,
        name: city.name,
        state: city.state,
        country: city.country,
        google_maps_id: city.google_maps_id,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
        created_at: city.created_at,
        updated_at: city.updated_at,
        tripsCount: parseInt(city.dataValues.tripsCount) || 0,
        placesCount: parseInt(city.dataValues.placesCount) || 0,
        image:
          city.photos && city.photos.length > 0
            ? city.photos[0].url || city.photos[0].url
            : null,
      }));
      return res.json(buildSuccessResponse(formattedCities));
    }

    // STEP 3: We have less than 5 results, fetch from Google Maps API

    try {
      // Fetch city predictions from Google Maps
      const googleCities = await searchCitiesFromGoogle(query);

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
          }
        } catch (saveError) {
          console.error(
            `[City Search] Error saving city ${googleCity.description}:`,
            saveError.message
          );
          // Continue with next city even if one fails
        }
      }
    } catch (googleError) {
      console.error(
        "[City Search] Error fetching from Google Maps:",
        googleError.message
      );
      // If Google Maps fails, we'll just return what we have from database
      // Don't return error to user, fall through to step 5
    }

    // STEP 5: Query database again to get all matching cities with counts
    const finalCities = await City.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
      include: [
        { model: Country, as: "country" },
        {
          model: CityPhoto,
          as: "photos",
          attributes: ["id", "url"],
          required: false,
          limit: 1,
          order: [["photo_order", "ASC"]],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM trip_cities tc
              WHERE tc.city_id = City.id
            )`),
            "tripsCount",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM places p
              WHERE p.city_id = City.id
            )`),
            "placesCount",
          ],
        ],
      },
      limit: 10,
      order: [["name", "ASC"]],
    });

    // Format cities to include counts in the response
    const formattedCities = finalCities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      country: city.country,
      google_maps_id: city.google_maps_id,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      created_at: city.created_at,
      updated_at: city.updated_at,
      tripsCount: parseInt(city.dataValues.tripsCount) || 0,
      placesCount: parseInt(city.dataValues.placesCount) || 0,
      image:
        city.photos && city.photos.length > 0
          ? city.photos[0].url || city.photos[0].url
          : null,
    }));

    return res.json(buildSuccessResponse(formattedCities));
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

    // Add trip_count from trip_cities (exclude draft trips)
    const [[{ trip_count }]] = await City.sequelize.query(
      `SELECT COUNT(*) AS trip_count
       FROM trip_cities tc
       JOIN trips t ON tc.trip_id = t.id
       WHERE tc.city_id = ? AND t.is_draft = false`,
      { replacements: [id] }
    );

    const formatted = {
      id: city.id,
      name: city.name,
      state: city.state,
      country: city.country,
      google_maps_id: city.google_maps_id,
      trip_count: parseInt(trip_count || 0),
    };

    res.json(buildSuccessResponse(formatted));
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
      attributes: {
        include: [
          [
            require("../database/sequelize").sequelize.literal(`(
                SELECT COUNT(*)
                FROM trip_cities tc
                JOIN trips t ON tc.trip_id = t.id
                WHERE tc.city_id = City.id AND t.is_draft = false
              )`),
            "trip_count",
          ],
        ],
      },
      order: [["name", "ASC"]],
    });

    // Map trip_count into tripsCount to keep frontend compatibility
    const formatted = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      country: city.country,
      trip_count: parseInt(city.dataValues.trip_count || 0),
    }));

    res.json(buildSuccessResponse(formatted));
  } catch (error) {
    next(error);
  }
};

/**
 * Get trips for a specific city
 * GET /cities/:id/trips
 */
const getCityTrips = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = "likes_count",
      order = "desc",
    } = req.query;

    // Verify city exists
    const city = await City.findByPk(id, {
      include: [{ model: Country, as: "country" }],
    });

    if (!city) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
    }

    const cityName = city.name;
    const countryName = city.country?.name || "";
    const fullCityName = `${cityName}, ${countryName}`.toLowerCase().trim();
    const cityNameOnly = cityName.toLowerCase().trim();

    const {
      page: pageNum,
      limit: limitNum,
      offset,
    } = paginate(page, limit, 100);

    // Get all public trips (we'll filter by city in memory for now)
    // TODO: Optimize with database query when destination_city_id is properly populated
    const { count: totalCount, rows: allTrips } = await Trip.findAndCountAll({
      where: {
        is_public: true,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "full_name",
            "preferred_name",
            "photo_url",
            "email",
          ],
        },
        {
          model: TripTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: TripPlace,
          as: "places",
          attributes: [
            "name",
            "address",
            "rating",
            "price_level",
            "types",
            "description",
          ],
          include: [
            {
              model: Place,
              as: "place",
              attributes: ["id", "latitude", "longitude", "google_place_id"],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          attributes: ["id", "day_number", "title"],
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              attributes: [
                "time",
                "name",
                "location",
                "description",
                "activity_order",
                "place_id",
              ],
              include: [
                {
                  model: Place,
                  as: "place",
                  attributes: [
                    "id",
                    "latitude",
                    "longitude",
                    "rating",
                    "user_ratings_total",
                    "google_place_id",
                    "name",
                    "address",
                    "price_level",
                    "types",
                  ],
                  include: [
                    {
                      model: PlacePhoto,
                      as: "photos",
                      attributes: ["url", "photo_order"],
                      order: [["photo_order", "ASC"]],
                    },
                  ],
                },
              ],
              order: [["activity_order", "ASC"]],
            },
          ],
          order: [["day_number", "ASC"]],
        },
        {
          model: require("../models/sequelize").City,
          as: "cities",
          attributes: ["id", "name"],
          include: [
            {
              model: require("../models/sequelize").Country,
              as: "country",
              attributes: ["name"],
            },
          ],
          through: { attributes: ["city_order"], timestamps: false },
          required: false,
        },
        {
          model: TripImage,
          as: "images",
          attributes: ["id", "place_photo_id", "city_photo_id", "image_order"],
          include: [
            {
              model: PlacePhoto,
              as: "placePhoto",
              attributes: ["url"],
            },
            {
              model: CityPhoto,
              as: "cityPhoto",
              attributes: ["url"],
            },
          ],
          required: false,
          order: [["image_order", "ASC"]],
        },
      ],
      // If sorting by likes_count, use a derived subquery
      order:
        sortBy === "likes_count"
          ? [
              [
                require("../database/sequelize").sequelize.literal(
                  `(SELECT COUNT(*) FROM trip_likes tl WHERE tl.trip_id = Trip.id)`
                ),
                order.toUpperCase(),
              ],
            ]
          : [[sortBy, order.toUpperCase()]],
      attributes: {
        include: [
          [
            require("../database/sequelize").sequelize.literal(
              `(SELECT COUNT(*) FROM trip_likes tl WHERE tl.trip_id = Trip.id)`
            ),
            "likes_count",
          ],
        ],
      },
    });

    // Filter trips by associated cities (preferred) and by place addresses as fallback
    const filteredTrips = allTrips.filter((trip) => {
      if (trip.cities && trip.cities.length > 0) {
        const cityNames = trip.cities.map((c) =>
          (c.name || "").toLowerCase().split(",")[0].trim()
        );
        if (
          cityNames.includes(cityNameOnly) ||
          cityNames.some((n) => n === fullCityName)
        )
          return true;
      }

      // Check if any places in the trip are in this city
      if (trip.places && trip.places.length > 0) {
        return trip.places.some((place) => {
          const placeAddress = place.address?.toLowerCase().trim() || "";
          return placeAddress.includes(cityNameOnly);
        });
      }

      return false;
    });

    // Apply pagination to filtered results
    const paginatedTrips = filteredTrips.slice(offset, offset + limitNum);

    // Helper function to extract cities with IDs from trip data
    const extractCitiesWithIds = async (trip) => {
      // If trip includes explicit cities relation, use it
      if (trip.cities && trip.cities.length > 0) {
        return trip.cities.map((c) => ({
          id: c.id,
          name: `${c.name}${
            c.country?.name ? `, ${c.country.name}` : ""
          }`.trim(),
        }));
      }

      // Fallback: derive from places and itinerary addresses
      const cityMap = new Map();

      if (trip.places && trip.places.length > 0) {
        for (const place of trip.places) {
          const parts = (place.address || "").split(",");
          const placeCityName = parts[0]?.trim();
          if (placeCityName) {
            cityMap.set(placeCityName.toLowerCase(), {
              name: place.address,
              id: null,
            });
          }
        }
      }

      // Try to match city names to city records
      const cityNames = Array.from(cityMap.keys());
      if (cityNames.length > 0) {
        const cities = await City.findAll({
          where: {
            name: {
              [require("sequelize").Op.in]: cityNames.map(
                (name) => name.charAt(0).toUpperCase() + name.slice(1)
              ),
            },
          },
          attributes: ["id", "name"],
          include: [
            {
              model: require("../models/sequelize").Country,
              as: "country",
              attributes: ["name"],
            },
          ],
        });

        cities.forEach((cityObj) => {
          const key = cityObj.name.toLowerCase();
          if (cityMap.has(key)) {
            const existing = cityMap.get(key);
            const fullName = `${cityObj.name}, ${cityObj.country?.name || ""}`;
            cityMap.set(key, { name: fullName, id: cityObj.id });
          }
        });
      }

      return Array.from(cityMap.values());
    };

    // Format response with city IDs
    const formattedTrips = await Promise.all(
      paginatedTrips.map(async (trip) => {
        const cities = await extractCitiesWithIds(trip);

        // Extract cover image from trip_images (first image)
        let coverImageUrl = null;
        if (trip.images && trip.images.length > 0) {
          const coverImage = trip.images[0]; // First image is the cover
          if (coverImage.placePhoto?.url) {
            coverImageUrl = coverImage.placePhoto.url;
          } else if (coverImage.cityPhoto?.url) {
            coverImageUrl = coverImage.cityPhoto.url;
          }
        }

        // Format trip_images array
        const tripImages = trip.images
          ? trip.images
              .map((img) => ({
                id: img.id,
                place_photo_id: img.place_photo_id,
                city_photo_id: img.city_photo_id,
                image_order: img.image_order,
                placePhoto: img.placePhoto ? { url: img.placePhoto.url } : null,
                cityPhoto: img.cityPhoto ? { url: img.cityPhoto.url } : null,
              }))
              .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          : [];

        return {
          id: trip.id,
          title: trip.title,
          description: trip.description,
          duration: trip.duration,
          budget: trip.budget,
          transportation: trip.transportation,
          accommodation: trip.accommodation,
          best_time_to_visit: trip.best_time_to_visit,
          difficulty_level: trip.difficulty_level,
          trip_type: trip.trip_type,
          cover_image: coverImageUrl,
          trip_images: tripImages,
          author_id: trip.author_id,
          destination_lat: trip.destination_lat,
          destination_lng: trip.destination_lng,
          is_public: trip.is_public,
          is_featured: trip.is_featured,
          likes_count: trip.likes_count,
          views_count: trip.views_count,
          created_at: trip.created_at,
          updated_at: trip.updated_at,
          author: trip.author
            ? {
                id: trip.author.id,
                full_name: trip.author.full_name,
                preferred_name: trip.author.preferred_name,
                photo_url: trip.author.photo_url,
                email: trip.author.email,
              }
            : null,
          tags: trip.tags?.map((t) => t.tag) || [],
          // Return raw cities array; the frontend will derive readable names
          cities: cities,
          places: trip.places || [],
          itinerary: trip.itineraryDays
            ? trip.itineraryDays.map((day) => ({
                day: day.day_number,
                title: day.title,
                places: day.activities
                  ? day.activities
                      .filter((a) => a.place)
                      .map((a) => ({
                        id: a.place.id,
                        place_id: a.place.google_place_id,
                        name: a.place.name,
                        address: a.place.address,
                        rating: a.place.rating
                          ? parseFloat(a.place.rating)
                          : null,
                        price_level: a.place.price_level,
                        types: a.place.types || [],
                        description: a.description || "",
                        photo: a.place.photos?.[0]?.url || null,
                        photos: a.place.photos
                          ? a.place.photos.map((p) => ({
                              url: p.url,
                            }))
                          : [],
                      }))
                  : [],
              }))
            : [],
        };
      })
    );

    const pagination = buildPaginationMeta(
      pageNum,
      limitNum,
      filteredTrips.length
    );

    res.json(buildSuccessResponse(formattedTrips, pagination));
  } catch (error) {
    console.error("[Get City Trips] Error:", error);
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
  } catch (error) {}
};

/**
 * Get suggested cities for a country
 * Returns popular cities from the database for the given country
 * Cities are ordered by trip count (descending) and limited to top 5
 */
const getSuggestedCitiesByCountry = async (req, res, next) => {
  try {
    const { countryId } = req.params;

    if (!countryId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "Country ID is required"));
    }

    // Get the country record by ID
    const countryRecord = await Country.findByPk(countryId);

    if (!countryRecord) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Country not found"));
    }

    // Get cities from database, ordered by trip count (descending)
    const cities = await City.findAll({
      where: { country_id: countryRecord.id },
      include: [
        { model: Country, as: "country" },
        {
          model: CityPhoto,
          as: "photos",
          attributes: ["id", "url"],
          required: false,
          limit: 1,
          order: [["photo_order", "ASC"]],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM trip_cities tc
              JOIN trips t ON tc.trip_id = t.id
              WHERE tc.city_id = City.id AND t.is_draft = false
            )`),
            "trip_count",
          ],
        ],
      },
      order: [
        [sequelize.literal("trip_count"), "DESC"],
        ["name", "ASC"],
      ],
      limit: 5,
    });

    // Format the response
    const suggestedCities = cities.map((city) => ({
      id: city.id,
      name: `${city.name}, ${countryRecord.name}`,
      tripsCount: parseInt(city.dataValues.trip_count) || 0,
      image:
        city.photos && city.photos.length > 0
          ? city.photos[0].url || city.photos[0].url
          : null,
    }));

    res.json(buildSuccessResponse(suggestedCities));
  } catch (error) {
    next(error);
  }
};

/**
 * Get locals (users) who live in a specific city
 * GET /v1/cities/:id/locals
 */
const getCityLocals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = "trips_count",
      order = "desc",
    } = req.query;

    // Verify city exists
    const city = await City.findByPk(id, {
      include: [{ model: Country, as: "country" }],
    });

    if (!city) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
    }

    const cityName = city.name;
    const countryName = city.country?.name || "";
    const fullCityName = `${cityName}, ${countryName}`;

    const {
      page: pageNum,
      limit: limitNum,
      offset,
    } = paginate(page, limit, 100);

    // Get users who have this city_id
    const { count: total, rows: users } = await User.findAndCountAll({
      where: {
        city_id: id,
      },
      include: [
        {
          model: City,
          as: "city",
          attributes: ["id", "name"],
          include: [
            {
              model: Country,
              as: "country",
              attributes: ["name"],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "email",
        "full_name",
        "preferred_name",
        "photo_url",
        "bio",
      ],
      offset,
      limit: limitNum,
    });

    // Add dynamic counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const [trips_count, followers_count, following_count] =
          await Promise.all([
            Trip.count({ where: { author_id: user.id } }),
            Follow.count({ where: { followee_id: user.id } }),
            Follow.count({ where: { follower_id: user.id } }),
          ]);

        const cityName = user.city
          ? `${user.city.name}, ${user.city.country?.name || ""}`
          : null;

        return {
          id: user.id,
          email: user.email,
          name: user.preferred_name || user.full_name || user.email,
          photo: user.photo_url,
          city: cityName,
          bio: user.bio,
          trips_count,
          followers_count,
          following_count,
        };
      })
    );

    // Sort by the requested field
    const sortedUsers = usersWithCounts.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return order === "desc" ? bValue - aValue : aValue - bValue;
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(sortedUsers, pagination));
  } catch (error) {
    console.error("[Get City Locals] Error:", error);
    next(error);
  }
};

module.exports = {
  searchCities,
  getOrCreateCity,
  getCityById,
  getCitiesByCountry,
  getSuggestedCitiesByCountry,
  getCityAiReview,
  getCityTrips,
  getCityLocals,
};
