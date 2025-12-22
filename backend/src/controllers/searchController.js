const {
  City,
  Country,
  Place,
  PlacePhoto,
  CityPhoto,
  User,
  Trip,
  Follow,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");
const {
  searchCitiesFromGoogle,
  getCityDetailsWithPhotos,
  getPlaceDetailsWithPhotos,
  searchPlace,
  getTimezone,
} = require("../services/googleMapsService");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

const IMAGE_DIR =
  process.env.IMAGE_DIR || path.join(__dirname, "..", "..", "images");

/**
 * Download image from URL and save locally
 */
async function downloadImage(url, outputPath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!url || url.trim() === "" || url === "null") {
        return { success: false, reason: "Invalid URL" };
      }

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, response.data);
      await fs.chmod(outputPath, 0o644);

      return { success: true, size: response.data.length };
    } catch (error) {
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { success: false, reason: error.message, url: url };
      }
    }
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  const urlExt = path.extname(url).split("?")[0].toLowerCase();
  if (urlExt && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(urlExt)) {
    return urlExt;
  }
  return ".jpg";
}

/**
 * Resize image to multiple sizes
 */
async function resizeImage(inputPath, baseOutputPath, sizes) {
  const results = {};

  try {
    for (const size of sizes) {
      const outputPath = `${baseOutputPath}_${size.name}.jpg`;

      await sharp(inputPath)
        .resize(size.maxWidth, null, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      await fs.chmod(outputPath, 0o644);
      results[size.name] = outputPath;
    }

    return { success: true, paths: results };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Global search overlay endpoint
 * Returns limited results (5 items each) but provides total counts for all categories
 * Auto-populates cities and places from Google Maps if not enough results
 *
 * Query Parameters:
 * - query: Search term (required)
 * - cityContext: Optional city filter
 * - limit: Results per category (default: 5)
 */
const searchOverlay = async (req, res, next) => {
  try {
    const { query, cityContext, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Query must be at least 2 characters"
          )
        );
    }

    const searchTerm = query.trim();
    const resultLimit = parseInt(limit) || 5;

    // Normalize search query for case-insensitive matching
    const normalizedQuery = searchTerm.toLowerCase();

    // Parse city context
    const normalizedCityContext = cityContext
      ? cityContext.toLowerCase()
      : null;
    const cityNameOnly = normalizedCityContext
      ? normalizedCityContext.split(",")[0].trim()
      : null;

    // Initialize response structure
    const response = {
      query: searchTerm,
      results: {
        cities: [],
        trips: [],
        places: [],
        travelers: [],
      },
      counts: {
        cities: 0,
        trips: 0,
        places: 0,
        travelers: 0,
        total: 0,
      },
    };

    // Check if user is authenticated
    const isAuthenticated = req.user && req.user.id;

    // ===== SEARCH CITIES =====
    if (!cityContext) {
      // Search cities in database
      const citiesQuery = {
        where: {
          name: { [Op.like]: `%${searchTerm}%` },
        },
        include: [
          {
            model: Country,
            as: "country",
            attributes: ["id", "name", "code"],
          },
          {
            model: CityPhoto,
            as: "photos",
            limit: 1,
            order: [["photo_order", "ASC"]],
            required: false,
          },
        ],
        limit: resultLimit,
        order: [["name", "ASC"]],
      };

      let cities = await City.findAll(citiesQuery);
      // Include trip count from trip_cities
      const { sequelize } = require("../database/sequelize");
      cities = await City.findAll({
        ...citiesQuery,
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*) FROM trip_cities tc WHERE tc.city_id = City.id
              )`),
              "trip_count",
            ],
          ],
        },
      });

      let totalCitiesCount = await City.count({
        where: { name: { [Op.like]: `%${searchTerm}%` } },
      });

      // Auto-populate cities from Google Maps if less than limit
      if (cities.length < resultLimit) {
        try {
          const googleCities = await searchCitiesFromGoogle(
            searchTerm,
            resultLimit
          );

          for (const googleCity of googleCities) {
            // Check if city already exists
            const existingCity = await City.findOne({
              where: { google_maps_id: googleCity.google_maps_id },
            });

            if (!existingCity) {
              // Fetch city details with photos
              const cityDetails = await getCityDetailsWithPhotos(
                googleCity.google_maps_id
              );

              // Get or create country
              let country;
              if (cityDetails.country_code) {
                [country] = await Country.findOrCreate({
                  where: { code: cityDetails.country_code },
                  defaults: {
                    name: cityDetails.country_name,
                    code: cityDetails.country_code,
                    google_maps_id: null,
                  },
                });
              }

              // Get timezone
              let timezone = cityDetails.timezone_offset;
              if (cityDetails.latitude && cityDetails.longitude) {
                try {
                  const tzData = await getTimezone(
                    cityDetails.latitude,
                    cityDetails.longitude
                  );
                  timezone = tzData.timezone_id;
                } catch (tzError) {
                  console.warn(
                    "[Search Overlay] Could not fetch timezone:",
                    tzError.message
                  );
                }
              }

              // Create city
              const newCity = await City.create({
                name: cityDetails.name,
                country_id: country?.id,
                google_maps_id: cityDetails.google_maps_id,
                state: cityDetails.state,
                latitude: cityDetails.latitude,
                longitude: cityDetails.longitude,
                timezone: timezone,
              });

              // Download and save city photos (limit to 10)
              if (cityDetails.photos && cityDetails.photos.length > 0) {
                const cityDir = path.join(
                  IMAGE_DIR,
                  "cities",
                  newCity.id.toString()
                );
                const photoPromises = cityDetails.photos
                  .slice(0, 10)
                  .map(async (photo, index) => {
                    // Construct Google Maps photo URL (large size)
                    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

                    // Download large image once
                    const tempPath = path.join(cityDir, `${index}_temp.jpg`);
                    const largeResult = await downloadImage(photoUrl, tempPath);

                    if (!largeResult.success) {
                      return null;
                    }

                    // Resize to create all sizes
                    const sizes = [
                      { name: "small", maxWidth: 400 },
                      { name: "medium", maxWidth: 800 },
                      { name: "large", maxWidth: 1600 },
                    ];

                    const basePath = path.join(cityDir, `${index}`);
                    const resizeResult = await resizeImage(
                      tempPath,
                      basePath,
                      sizes
                    );

                    // Clean up temp file
                    try {
                      await fs.unlink(tempPath);
                    } catch (err) {
                      // Ignore cleanup errors
                    }

                    if (!resizeResult.success) {
                      return null;
                    }

                    return {
                      city_id: newCity.id,
                      google_photo_reference: photo.photo_reference,
                      url_small: `/images/cities/${newCity.id}/${index}_small.jpg`,
                      url_medium: `/images/cities/${newCity.id}/${index}_medium.jpg`,
                      url_large: `/images/cities/${newCity.id}/${index}_large.jpg`,
                      width: photo.width,
                      height: photo.height,
                      attribution: photo.html_attributions?.join("; "),
                      photo_order: index,
                    };
                  });

                const photosToSave = await Promise.all(photoPromises);
                const validPhotos = photosToSave.filter((p) => p !== null);

                if (validPhotos.length > 0) {
                  await CityPhoto.bulkCreate(validPhotos, {
                    ignoreDuplicates: true,
                  });
                }
              }
            }
          }

          // Re-query cities after saving
          cities = await City.findAll(citiesQuery);
          // Update count after adding new cities from Google Maps
          totalCitiesCount = await City.count({
            where: { name: { [Op.like]: `%${searchTerm}%` } },
          });
        } catch (error) {
          console.error(
            "[Search Overlay] Error auto-populating cities:",
            error.message
          );
        }
      }

      // Format cities response
      response.results.cities = cities.map((city) => ({
        id: city.id,
        name: city.name,
        country: city.country?.name,
        countryId: city.country?.id,
        countryCode: city.country?.code,
        state: city.state,
        // Ensure image URL is absolute by prefixing backend URL when needed
        image: getFullImageUrl(city.photos?.[0]?.url_medium),
        google_maps_id: city.google_maps_id,
        tripsCount: parseInt(city.dataValues.trip_count || 0),
      }));
      response.counts.cities = totalCitiesCount;
    }

    // ===== SEARCH TRIPS =====

    const tripWhere = {
      [Op.or]: [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { destination: { [Op.like]: `%${searchTerm}%` } },
      ],
      is_public: true,
    };

    // Apply city context filter using trip_cities -> city association when possible
    let tripInclude = [];
    if (cityNameOnly) {
      // Find matching cities by name
      const matchingCities = await City.findAll({
        where: { name: { [Op.like]: `%${cityNameOnly}%` } },
        attributes: ["id"],
      });
      const cityIds = matchingCities.map((c) => c.id);

      if (cityIds.length > 0) {
        tripInclude.push({
          model: City,
          as: "cities",
          where: { id: cityIds },
          attributes: [],
        });
      } else {
        // Fallback to legacy destination string filter
        tripWhere.destination = { [Op.like]: `%${cityNameOnly}%` };
      }
    }

    const trips = await Trip.findAll({
      where: tripWhere,
      include: [
        ...tripInclude,
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "email",
            "full_name",
            "preferred_name",
            "photo_url",
          ],
        },
      ],
      distinct: true,
      limit: resultLimit,
      order: [["likes_count", "DESC"]],
      attributes: [
        "id",
        "title",
        "destination",
        "description",
        "cover_image",
        "duration",
        "likes_count",
        "views_count",
      ],
    });

    const totalTripsCount = await Trip.count({
      where: tripWhere,
      include: tripInclude,
      distinct: true,
    });

    response.results.trips = trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      description: trip.description,
      image: trip.cover_image,
      duration: trip.duration,
      likes: trip.likes_count,
      views: trip.views_count,
      author: {
        id: trip.author?.id,
        name: trip.author?.preferred_name || trip.author?.full_name,
        photo: trip.author?.photo_url,
      },
    }));
    response.counts.trips = totalTripsCount;

    // ===== SEARCH PLACES =====

    const placeWhere = {
      name: { [Op.like]: `%${searchTerm}%` },
      visible: true,
    };

    // Apply city context filter
    if (cityContext) {
      // Find city by name
      const contextCity = await City.findOne({
        where: { name: { [Op.like]: `%${cityNameOnly}%` } },
      });

      if (contextCity) {
        placeWhere.city_id = contextCity.id;
      }
    }

    let places = await Place.findAll({
      where: placeWhere,
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          limit: 1,
          order: [["photo_order", "ASC"]],
          required: false,
        },
        {
          model: City,
          as: "city",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      limit: resultLimit,
      order: [["rating", "DESC"]],
    });

    let totalPlacesCount = await Place.count({ where: placeWhere });

    // Auto-populate places from Google Maps if less than limit
    if (places.length < resultLimit) {
      try {
        const searchQuery = cityContext
          ? `${searchTerm}, ${cityContext}`
          : searchTerm;
        const googlePlace = await searchPlace(searchQuery);

        if (googlePlace && googlePlace.place_id) {
          // Check if place already exists
          const existingPlace = await Place.findOne({
            where: { google_place_id: googlePlace.place_id },
          });

          if (!existingPlace) {
            // Fetch detailed place info with photos
            const placeDetails = await getPlaceDetailsWithPhotos(
              googlePlace.place_id
            );

            // Find or create city for this place
            let placeCity = null;
            if (placeDetails.city_name) {
              placeCity = await City.findOne({
                where: { name: placeDetails.city_name },
              });
            }

            // Check if this place is actually a city (locality + political)
            const isCity =
              placeDetails.types?.includes("locality") &&
              placeDetails.types?.includes("political");

            // Create place
            const newPlace = await Place.create({
              google_place_id: placeDetails.place_id,
              name: placeDetails.name,
              address: placeDetails.formatted_address,
              city_id: placeCity?.id,
              latitude: placeDetails.latitude,
              longitude: placeDetails.longitude,
              rating: placeDetails.rating,
              user_ratings_total: placeDetails.user_ratings_total,
              price_level: placeDetails.price_level,
              types: placeDetails.types,
              phone_number: placeDetails.phone_number,
              website: placeDetails.website,
              opening_hours: placeDetails.opening_hours,
              visible: !isCity, // Hide if it's a city
            });

            // Download and save place photos (limit to 10)
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              const placeDir = path.join(
                IMAGE_DIR,
                "places",
                newPlace.id.toString()
              );
              const photoPromises = placeDetails.photos
                .slice(0, 10)
                .map(async (photo, index) => {
                  // Construct Google Maps photo URL (large size)
                  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

                  // Download large image once
                  const tempPath = path.join(placeDir, `${index}_temp.jpg`);
                  const largeResult = await downloadImage(photoUrl, tempPath);

                  if (!largeResult.success) {
                    return null;
                  }

                  // Resize to create all sizes
                  const sizes = [
                    { name: "small", maxWidth: 400 },
                    { name: "medium", maxWidth: 800 },
                    { name: "large", maxWidth: 1600 },
                  ];

                  const basePath = path.join(placeDir, `${index}`);
                  const resizeResult = await resizeImage(
                    tempPath,
                    basePath,
                    sizes
                  );

                  // Clean up temp file
                  try {
                    await fs.unlink(tempPath);
                  } catch (err) {
                    // Ignore cleanup errors
                  }

                  if (!resizeResult.success) {
                    return null;
                  }

                  return {
                    place_id: newPlace.id,
                    google_photo_reference: photo.photo_reference,
                    url_small: `/images/places/${newPlace.id}/${index}_small.jpg`,
                    url_medium: `/images/places/${newPlace.id}/${index}_medium.jpg`,
                    url_large: `/images/places/${newPlace.id}/${index}_large.jpg`,
                    width: photo.width,
                    height: photo.height,
                    attribution: photo.html_attributions?.join("; "),
                    photo_order: index,
                  };
                });

              const photosToSave = await Promise.all(photoPromises);
              const validPhotos = photosToSave.filter((p) => p !== null);

              if (validPhotos.length > 0) {
                await PlacePhoto.bulkCreate(validPhotos, {
                  ignoreDuplicates: true,
                });
              }
            }
          }
        }

        // Re-query places after saving
        places = await Place.findAll({
          where: placeWhere,
          include: [
            {
              model: PlacePhoto,
              as: "photos",
              limit: 1,
              order: [["photo_order", "ASC"]],
              required: false,
            },
            {
              model: City,
              as: "city",
              attributes: ["id", "name"],
              required: false,
            },
          ],
          limit: resultLimit,
          order: [["rating", "DESC"]],
        });
        // Update count after adding new places from Google Maps
        totalPlacesCount = await Place.count({ where: placeWhere });
      } catch (error) {
        console.error(
          "[Search Overlay] Error auto-populating places:",
          error.message
        );
      }
    }

    response.results.places = places.map((place) => ({
      id: place.id,
      place_id: place.google_place_id,
      name: place.name,
      address: place.address,
      city: place.city?.name,
      rating: place.rating,
      price_level: place.price_level,
      types: place.types,
      image: place.photos?.[0]?.url_medium || null,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
    response.counts.places = totalPlacesCount;

    const userWhere = {
      [Op.or]: [
        { full_name: { [Op.like]: `%${searchTerm}%` } },
        { preferred_name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
      ],
    };

    if (cityContext) {
      const contextCity = await City.findOne({
        where: { name: { [Op.like]: `%${cityNameOnly}%` } },
      });
      if (contextCity) userWhere.city_id = contextCity.id;
    }

    const travelers = await User.findAll({
      where: userWhere,
      attributes: [
        "id",
        "email",
        "full_name",
        "preferred_name",
        "photo_url",
        "city_id",
        "instagram_username",
      ],
      include: [
        {
          model: City,
          as: "cityData",
          attributes: ["name", "country_id"],
          required: false,
          include: [
            {
              model: Country,
              as: "country",
              attributes: ["name"],
              required: false,
            },
          ],
        },
      ],
      limit: resultLimit,
    });

    const totalTravelersCount = await User.count({ where: userWhere });

    // Calculate dynamic counts for each user
    const travelersWithCounts = await Promise.all(
      travelers.map(async (user) => {
        const trips_count = await Trip.count({ where: { author_id: user.id } });

        const followers_count = await Follow.count({
          where: { followee_id: user.id },
        });

        const instagram = user.instagram_username || null;

        return {
          id: user.id,
          // Public fields only - do not expose private data
          name: user.preferred_name || user.full_name || user.email,
          photo: getFullImageUrl(user.photo_url),
          city: user.cityData?.name || null,
          country: user.cityData?.country?.name || null,
          instagram_username: instagram,
          instagram_display: instagram
            ? `@${instagram}`
            : "No instagram account",
          instagram_url: instagram
            ? `https://instagram.com/${instagram}`
            : null,
          trips: trips_count,
          followers: followers_count,
        };
      })
    );

    // Sort by trips then followers
    travelersWithCounts.sort((a, b) => {
      if (b.trips !== a.trips) return b.trips - a.trips;
      return b.followers - a.followers;
    });

    response.results.travelers = travelersWithCounts;
    response.counts.travelers = totalTravelersCount;

    // Calculate total count
    response.counts.total =
      response.counts.cities +
      response.counts.trips +
      response.counts.places +
      response.counts.travelers;

    res.json(buildSuccessResponse(response));
  } catch (error) {
    console.error("[Search Overlay] Error:", error);
    next(error);
  }
};

module.exports = {
  searchOverlay,
};
