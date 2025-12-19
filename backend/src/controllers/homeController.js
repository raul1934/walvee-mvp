const { Trip, User, City, Country, CityPhoto } = require("../models/sequelize");
const { Op } = require("sequelize");
const { sequelize } = require("../database/sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

// Helper function to build full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath; // Already a full URL
  }
  const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

/**
 * Get random trips for home page
 * Returns trips in random order
 */
const getHomeTrips = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Fetch trips with random order using database-level random
    const trips = await Trip.findAll({
      order: sequelize.random(),
      limit: parseInt(limit),
      attributes: [
        "id",
        "title",
        "description",
        "destination",
        "duration",
        "budget",
        "is_public",
        "cover_image",
        "likes_count",
        "views_count",
        "created_at",
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });

    // Format response
    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      duration: trip.duration,
      budget: trip.budget,
      tags: trip.tags,
      is_public: trip.is_public,
      cover_image: getFullImageUrl(trip.cover_image),
      image_url: getFullImageUrl(trip.cover_image),
      images: trip.cover_image ? [getFullImageUrl(trip.cover_image)] : [],
      likes: trip.likes_count || 0,
      views: trip.views_count || 0,
      steals: trip.steals_count || 0,
      created_at: trip.created_at,
      author_name:
        trip.author?.preferred_name || trip.author?.full_name || "Unknown User",
      author_photo: getFullImageUrl(trip.author?.photo_url),
      author_id: trip.author?.id,
    }));

    return res.json(
      buildSuccessResponse(formattedTrips, "Trips fetched successfully")
    );
  } catch (error) {
    console.error("[Home Controller] Error fetching trips:", error);
    return res
      .status(500)
      .json(buildErrorResponse("SERVER_ERROR", "Failed to fetch trips"));
  }
};

/**
 * Get popular cities for home page carousel
 * Returns cities with trip counts and photos
 */
const getHomeCities = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // Get cities with photos (simplified query)
    const cities = await City.findAll({
      attributes: [
        "id",
        "name",
        "state",
        "google_maps_id",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM trips
            WHERE trips.destination_city_id = City.id
          )`),
          "trip_count",
        ],
      ],
      include: [
        {
          model: Country,
          as: "country",
          attributes: ["id", "name", "code"],
        },
        {
          model: CityPhoto,
          as: "photos",
          attributes: ["url_small", "url_medium", "url_large"],
          limit: 1,
          order: [["photo_order", "ASC"]],
          required: true, // Only cities with photos
        },
      ],
      order: [[sequelize.literal("trip_count"), "DESC"]],
      limit: parseInt(limit),
    });

    // Format response to match frontend expectations
    const formattedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      country_name: city.country?.name || "Unknown",
      country_code: city.country?.code,
      google_maps_id: city.google_maps_id,
      trip_count: parseInt(city.dataValues.trip_count || 0),
      photo: getFullImageUrl(city.photos?.[0]?.url_medium),
      city_image: getFullImageUrl(city.photos?.[0]?.url_medium),
      photo_small: getFullImageUrl(city.photos?.[0]?.url_small),
      photo_large: getFullImageUrl(city.photos?.[0]?.url_large),
    }));

    return res.json(
      buildSuccessResponse(formattedCities, "Cities fetched successfully")
    );
  } catch (error) {
    console.error("[Home Controller] Error fetching cities:", error);
    return res
      .status(500)
      .json(buildErrorResponse("SERVER_ERROR", "Failed to fetch cities"));
  }
};

/**
 * Get featured travelers for home page
 * Returns users with most trips and followers
 */
const getHomeTravelers = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // Get users with most trips
    const travelers = await User.findAll({
      attributes: [
        "id",
        "email",
        "full_name",
        "preferred_name",
        "photo_url",
        "city_id",
        "metrics_trips",
        "metrics_followers",
        "metrics_following",
      ],
      where: {
        metrics_trips: { [Op.gt]: 0 },
      },
      order: [
        ["metrics_trips", "DESC"],
        ["metrics_followers", "DESC"],
      ],
      limit: parseInt(limit),
    });

    // Format response
    const formattedTravelers = travelers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.preferred_name || user.full_name,
      full_name: user.full_name,
      preferred_name: user.preferred_name,
      photo_url: getFullImageUrl(user.photo_url),
      picture: getFullImageUrl(user.photo_url),
      city_id: user.city_id,
      metrics_my_trips: user.metrics_trips || 0,
      metrics_followers: user.metrics_followers || 0,
      metrics_following: user.metrics_following || 0,
    }));

    return res.json(
      buildSuccessResponse(formattedTravelers, "Travelers fetched successfully")
    );
  } catch (error) {
    console.error("[Home Controller] Error fetching travelers:", error);
    return res
      .status(500)
      .json(buildErrorResponse("SERVER_ERROR", "Failed to fetch travelers"));
  }
};

module.exports = {
  getHomeTrips,
  getHomeCities,
  getHomeTravelers,
};
