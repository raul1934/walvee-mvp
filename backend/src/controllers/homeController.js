const {
  Trip,
  User,
  City,
  Country,
  CityPhoto,
  Place,
  PlacePhoto,
  TripItineraryDay,
  TripItineraryActivity,
  TripImage,
  Follow,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const { sequelize } = require("../database/sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");
const { addUserContext } = require("../utils/userContext");
const { INCLUDE_CITY_WITH_COUNTRY } = require("./includes");

/**
 * Get random trips for home page
 * Returns trips in random order
 */
const getHomeTrips = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Fetch trips with random order using database-level random
    let trips;
    try {
      trips = await Trip.findAll({
        where: { is_draft: false },
        limit: parseInt(limit),
        attributes: [
          "id",
          "title",
          "description",
          "duration",
          "budget",
          "is_public",
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM trip_likes tl WHERE tl.trip_id = Trip.id
            )`),
            "likes_count",
          ],
          "views_count",
          "created_at",
        ],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
          {
            model: require("../models/sequelize").City,
            as: "cities",
            attributes: ["id", "name"],
            include: [
              { model: Country, as: "country", attributes: ["id", "name"] },
              {
                model: CityPhoto,
                as: "photos",
                attributes: ["url"],
                limit: 3,
              },
            ],
            through: { attributes: ["city_order"], timestamps: false },
            required: false,
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
                  "place_id",
                  "time",
                  "name",
                  "location",
                  "description",
                  "activity_order",
                ],
                include: [
                  {
                    model: Place,
                    as: "place",
                    attributes: [
                      "id",
                      "name",
                      "address",
                      "rating",
                      "price_level",
                      "city_id",
                    ],
                    include: [
                      {
                        model: PlacePhoto,
                        as: "photos",
                        attributes: ["url"],
                        limit: 3,
                      },
                      INCLUDE_CITY_WITH_COUNTRY,
                    ],
                  },
                ],
              },
            ],
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
          },
        ],
        order: [
          sequelize.literal('RAND()'),
          [{ model: TripItineraryDay, as: "itineraryDays" }, "day_number", "ASC"],
          [{ model: TripItineraryDay, as: "itineraryDays" }, { model: TripItineraryActivity, as: "activities" }, "activity_order", "ASC"],
          [{ model: TripImage, as: "images" }, "image_order", "ASC"],
        ],
      });
    } catch (err) {
      // Fallback: if the derived likes_count subquery fails for some DB setups,
      // fetch trips without the subquery and merge counts with a grouped query.
      console.warn(
        "[Home Controller] Derived likes_count query failed, falling back:",
        err.message || err
      );

      trips = await Trip.findAll({
        where: { is_draft: false },
        limit: parseInt(limit),
        attributes: [
          "id",
          "title",
          "description",
          "duration",
          "budget",
          "is_public",
          "views_count",
          "created_at",
        ],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
          {
            model: require("../models/sequelize").City,
            as: "cities",
            attributes: ["id", "name"],
            include: [
              { model: Country, as: "country", attributes: ["id", "name"] },
              {
                model: CityPhoto,
                as: "photos",
                attributes: ["url"],
                limit: 3,
              },
            ],
            through: { attributes: ["city_order"], timestamps: false },
            required: false,
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
                  "place_id",
                  "time",
                  "name",
                  "location",
                  "description",
                  "activity_order",
                ],
                include: [
                  {
                    model: Place,
                    as: "place",
                    attributes: [
                      "id",
                      "name",
                      "address",
                      "rating",
                      "price_level",
                      "city_id",
                    ],
                    include: [
                      {
                        model: PlacePhoto,
                        as: "photos",
                        attributes: ["url"],
                        limit: 3,
                      },
                      INCLUDE_CITY_WITH_COUNTRY,
                    ],
                  },
                ],
              },
            ],
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
          },
        ],
        order: [
          sequelize.literal('RAND()'),
          [{ model: TripItineraryDay, as: "itineraryDays" }, "day_number", "ASC"],
          [{ model: TripItineraryDay, as: "itineraryDays" }, { model: TripItineraryActivity, as: "activities" }, "activity_order", "ASC"],
          [{ model: TripImage, as: "images" }, "image_order", "ASC"],
        ],
      });

      // Get counts grouped by trip_id
      const tripIds = trips.map((t) => t.id);
      const counts = tripIds.length
        ? (
            await sequelize.query(
              `SELECT trip_id, COUNT(*) as c FROM trip_likes WHERE trip_id IN (${tripIds
                .map(() => "?")
                .join(",")}) GROUP BY trip_id`,
              { replacements: tripIds }
            )
          )[0]
        : [];

      const countsMap = counts.reduce((acc, row) => {
        acc[row.trip_id] = row.c;
        return acc;
      }, {});

      // attach likes_count into each trip instance's dataValues for compatibility
      trips.forEach((t) => {
        t.dataValues.likes_count = countsMap[t.id] || 0;
      });
    }

    // Add user context (likes/follows)
    const userId = req.user?.id;
    const tripsWithContext = await addUserContext(trips, userId, {
      includeLikes: true,
      includeFollows: true,
    });

    // Map and format trips for frontend
    const formattedTrips = tripsWithContext.map((trip) => {
      // Format trip_images with full structure and sort by image_order
      const tripImages = trip.images
        ? trip.images
            .map((img) => ({
              id: img.id,
              place_photo_id: img.place_photo_id,
              city_photo_id: img.city_photo_id,
              image_order: img.image_order,
              placePhoto: img.placePhoto
                ? {
                    url: img.placePhoto.url,
                  }
                : null,
              cityPhoto: img.cityPhoto
                ? {
                    url: img.cityPhoto.url,
                  }
                : null,
            }))
            .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
        : [];

      // Calculate duration_days from itinerary
      const durationDays = trip.itineraryDays ? trip.itineraryDays.length : 0;

      // Build nested destination object (prefer first city in cities relation)
      let destinationObj = null;
      if (trip.cities && trip.cities.length > 0) {
        const c = trip.cities[0];
        destinationObj = {
          id: c.id,
          name: `${c.name}${c.country?.name ? `, ${c.country.name}` : ""}`,
          photo: c.photos?.[0]?.url || null,
        };
      } else if (trip.destination) {
        destinationObj = { name: trip.destination };
      }

      return {
        id: trip.id,
        title: trip.title,
        // Legacy destination string removed here — frontend should use `cities` if available
        description: trip.description,
        duration: trip.duration,
        duration_days: durationDays,
        budget: trip.budget,
        is_public: trip.is_public,
        // Preserve the raw `cities` association (frontend will map/display)
        cities: trip.cities || [],
        trip_images: tripImages,
        likes: trip.likes_count || 0,
        views: trip.views_count || 0,
        created_at: trip.created_at,
        currentUserLiked: trip.currentUserLiked || false,
        currentUserFollowing: trip.currentUserFollowing || false,
        author: trip.author
          ? {
              id: trip.author.id,
              full_name: trip.author.full_name,
              preferred_name: trip.author.preferred_name,
              photo_url: getFullImageUrl(trip.author.photo_url),
            }
          : null,
        itinerary: trip.itineraryDays
          ? trip.itineraryDays.map((day) => ({
              day: day.day_number,
              title: day.title,
              places: day.activities
                ? day.activities
                    .filter((a) => a.place)
                    .map((a) => ({
                      name: a.place.name,
                      address: a.place.address,
                      rating: a.place.rating
                        ? parseFloat(a.place.rating)
                        : null,
                      price_level: a.place.price_level,
                      types: [],
                      description: a.description || "",
                      photo: a.place.photos?.[0]?.url || null,
                    }))
                : [],
              activities: day.activities
                ? day.activities.map((a) => ({
                    time: a.time,
                    name: a.name,
                    location: a.location,
                    description: a.description,
                    activity_order: a.activity_order,
                    place_id: a.place_id,
                    place: a.place
                      ? {
                          id: a.place.id,
                          name: a.place.name,
                          address: a.place.address,
                          rating: a.place.rating
                            ? parseFloat(a.place.rating)
                            : null,
                          price_level: a.place.price_level,
                          city: a.place.city
                            ? {
                                id: a.place.city.id,
                                name: a.place.city.name,
                                country: a.place.city.country
                                  ? {
                                      id: a.place.city.country.id,
                                      name: a.place.city.country.name,
                                    }
                                  : null,
                              }
                            : null,
                        }
                      : null,
                  }))
                : [],
            }))
          : [],
      };
    });

    return res.json(
      buildSuccessResponse(formattedTrips, "Trips fetched successfully")
    );
  } catch (error) {
    console.error(
      "[Home Controller] Error fetching trips:",
      error.stack || error.message || error
    );
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
            FROM trip_cities tc
            JOIN trips t ON tc.trip_id = t.id
            WHERE tc.city_id = City.id AND t.is_draft = false
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
          attributes: ["url"],
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
      country: {
        id: city.country?.id,
        name: city.country?.name || "Unknown",
        code: city.country?.code,
      },
      country_name: city.country?.name || "Unknown",
      country_code: city.country?.code,
      google_maps_id: city.google_maps_id,
      trip_count: parseInt(city.dataValues.trip_count || 0),
      photo: city.photos?.[0]?.url || null,
      city_image: city.photos?.[0]?.url || null,
      photo_small: city.photos?.[0]?.url || null,
      photo_large: city.photos?.[0]?.url || null,
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

    // Get all users
    const users = await User.findAll({
      attributes: [
        "id",
        "email",
        "full_name",
        "preferred_name",
        "photo_url",
        "city_id",
      ],
      limit: parseInt(limit) * 3, // Get more to filter and sort
    });

    // Calculate dynamic counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const trips_count = await Trip.count({
          where: { author_id: user.id },
        });

        const followers_count = await Follow.count({
          where: { followee_id: user.id },
        });

        const following_count = await Follow.count({
          where: { follower_id: user.id },
        });

        return {
          user,
          trips_count,
          followers_count,
          following_count,
        };
      })
    );

    // Filter users with at least one trip and sort
    const travelers = usersWithCounts
      .filter((u) => u.trips_count > 0)
      .sort((a, b) => {
        if (b.trips_count !== a.trips_count)
          return b.trips_count - a.trips_count;
        return b.followers_count - a.followers_count;
      })
      .slice(0, parseInt(limit));

    // Format response
    const formattedTravelers = travelers.map(
      ({ user, trips_count, followers_count, following_count }) => ({
        id: user.id,
        email: user.email,
        name: user.preferred_name || user.full_name,
        full_name: user.full_name,
        preferred_name: user.preferred_name,
        photo_url: getFullImageUrl(user.photo_url),
        picture: getFullImageUrl(user.photo_url),
        city_id: user.city_id,
        trips_count,
        followers_count,
        following_count,
      })
    );

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
