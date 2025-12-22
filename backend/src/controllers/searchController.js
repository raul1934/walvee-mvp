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
      const totalCitiesCount = await City.count({
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

              // Save city photos (limit to 10)
              if (cityDetails.photos && cityDetails.photos.length > 0) {
                const photosToSave = cityDetails.photos
                  .slice(0, 10)
                  .map((photo, index) => ({
                    city_id: newCity.id,
                    google_photo_reference: photo.photo_reference,
                    url_small: photo.url_small,
                    url_medium: photo.url_medium,
                    url_large: photo.url_large,
                    width: photo.width,
                    height: photo.height,
                    attribution: photo.html_attributions?.join("; "),
                    photo_order: index,
                  }));

                await CityPhoto.bulkCreate(photosToSave, {
                  ignoreDuplicates: true,
                });
              }
            }
          }

          // Re-query cities after saving
          cities = await City.findAll(citiesQuery);
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

    // Apply city context filter
    if (cityNameOnly) {
      tripWhere.destination = { [Op.like]: `%${cityNameOnly}%` };
    }

    const trips = await Trip.findAll({
      where: tripWhere,
      include: [
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

    const totalTripsCount = await Trip.count({ where: tripWhere });

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

    const totalPlacesCount = await Place.count({ where: placeWhere });

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
            });

            // Save place photos (limit to 10)
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              const photosToSave = placeDetails.photos
                .slice(0, 10)
                .map((photo, index) => ({
                  place_id: newPlace.id,
                  google_photo_reference: photo.photo_reference,
                  url_small: photo.url_small,
                  url_medium: photo.url_medium,
                  url_large: photo.url_large,
                  width: photo.width,
                  height: photo.height,
                  attribution: photo.html_attributions?.join("; "),
                  photo_order: index,
                }));

              await PlacePhoto.bulkCreate(photosToSave, {
                ignoreDuplicates: true,
              });
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
