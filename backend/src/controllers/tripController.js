const {
  Trip,
  User,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
  TripSteal,
  TripReview,
  Place,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");

const getTrips = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy = "created_at",
      order = "desc",
      destination,
      createdBy,
      isPublic,
      minLikes,
      search,
    } = req.query;

    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const where = {};

    if (destination) {
      where.destination = { [Op.like]: `%${destination}%` };
    }

    if (createdBy) {
      where.author_id = createdBy;
    }

    if (isPublic !== undefined && isPublic !== "") {
      where.is_public = isPublic === "true" || isPublic === true;
    }

    if (minLikes) {
      where.likes_count = { [Op.gte]: parseInt(minLikes) };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { destination: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
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
              as: "placeDetails",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
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
                  as: "placeDetails",
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
                  ],
                },
              ],
              order: [["activity_order", "ASC"]],
            },
          ],
          order: [["day_number", "ASC"]],
        },
      ],
      offset,
      limit: limitNum,
      order: [[sortBy, order.toUpperCase()]],
      distinct: true,
    });

    // Format the response
    const formattedTrips = await Promise.all(
      trips.map((trip) => formatTripResponse(trip))
    );

    const pagination = buildPaginationMeta(pageNum, limitNum, count);

    res.json(buildSuccessResponse(formattedTrips, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
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
            "bio",
          ],
        },
        {
          model: require("../models/sequelize").City,
          as: "destinationCity",
          attributes: ["id", "name"],
          include: [
            {
              model: require("../models/sequelize").CityPhoto,
              as: "photos",
              attributes: ["url_small", "url_medium", "url_large"],
              limit: 3,
            },
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
              as: "placeDetails",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
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
                  as: "placeDetails",
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
                  ],
                  include: [
                    {
                      model: require("../models/sequelize").PlacePhoto,
                      as: "photos",
                      attributes: ["url_small", "url_medium", "url_large"],
                      limit: 3,
                    },
                  ],
                },
              ],
            },
          ],
          order: [["day_number", "ASC"]],
        },
        {
          model: require("../models/sequelize").TripComment,
          as: "comments",
          include: [
            {
              model: require("../models/sequelize").User,
              as: "commenter",
              attributes: ["id", "preferred_name", "full_name", "photo_url"],
            },
          ],
          limit: 10,
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    // Increment views
    await trip.increment("views_count");

    // formatTripResponse is async — await its result before sending
    const formatted = await formatTripResponse(trip);
    res.json(buildSuccessResponse(formatted));
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tags, places, itinerary, ...tripData } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Create trip
    const trip = await Trip.create({
      ...tripData,
      author_id: userId,
    });

    // Create tags
    if (tags && tags.length > 0) {
      await TripTag.bulkCreate(tags.map((tag) => ({ trip_id: trip.id, tag })));
    }

    // Create places
    if (places && places.length > 0) {
      await TripPlace.bulkCreate(
        places.map((place) => ({ trip_id: trip.id, ...place }))
      );
    }

    // Create itinerary
    if (itinerary && itinerary.length > 0) {
      for (const day of itinerary) {
        const itineraryDay = await TripItineraryDay.create({
          trip_id: trip.id,
          day_number: day.day,
          title: day.title,
        });

        if (day.activities && day.activities.length > 0) {
          await TripItineraryActivity.bulkCreate(
            day.activities.map((activity, index) => ({
              itinerary_day_id: itineraryDay.id,
              ...activity,
              activity_order: index,
            }))
          );
        }
      }
    }

    // Fetch the complete trip with associations
    const completeTripData = await Trip.findByPk(trip.id, {
      include: [
        { model: User, as: "author" },
        { model: TripTag, as: "tags" },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "placeDetails",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [
                {
                  model: Place,
                  as: "placeDetails",
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
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res
      .status(201)
      .json(buildSuccessResponse(await formatTripResponse(completeTripData)));
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { tags, places, itinerary, ...tripData } = req.body;

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to update this trip"
          )
        );
    }

    // Update trip
    await trip.update(tripData);

    // Update tags
    if (tags) {
      await TripTag.destroy({ where: { trip_id: id } });
      await TripTag.bulkCreate(tags.map((tag) => ({ trip_id: id, tag })));
    }

    // Update places
    if (places) {
      await TripPlace.destroy({ where: { trip_id: id } });
      await TripPlace.bulkCreate(
        places.map((place) => ({ trip_id: id, ...place }))
      );
    }

    // Update itinerary
    if (itinerary) {
      await TripItineraryDay.destroy({ where: { trip_id: id } });

      for (const day of itinerary) {
        const itineraryDay = await TripItineraryDay.create({
          trip_id: id,
          day_number: day.day,
          title: day.title,
        });

        if (day.activities && day.activities.length > 0) {
          await TripItineraryActivity.bulkCreate(
            day.activities.map((activity, index) => ({
              itinerary_day_id: itineraryDay.id,
              ...activity,
              activity_order: index,
            }))
          );
        }
      }
    }

    // Fetch updated trip
    const updatedTrip = await Trip.findByPk(id, {
      include: [
        { model: User, as: "author" },
        { model: TripTag, as: "tags" },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "placeDetails",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [
                {
                  model: Place,
                  as: "placeDetails",
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
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res.json(buildSuccessResponse(await formatTripResponse(updatedTrip)));
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this trip"
          )
        );
    }

    await trip.destroy();

    res.json(buildSuccessResponse({ message: "Trip deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

// Helper function to format trip response
async function formatTripResponse(trip) {
  const tripData = trip.toJSON();

  // Count steals from trip_steals table
  const derivationsCount = await TripSteal.count({
    where: { original_trip_id: tripData.id },
  });

  // Collect all images: cover + city photos + place photos
  const images = [];

  // Add cover image first
  if (tripData.cover_image) {
    images.push(getFullImageUrl(tripData.cover_image));
  }

  // Add city photos
  if (tripData.destinationCity?.photos) {
    tripData.destinationCity.photos.forEach((photo) => {
      if (photo.url_medium) {
        images.push(getFullImageUrl(photo.url_medium));
      }
    });
  }

  // Add place photos from itinerary days and activities
  if (tripData.itineraryDays) {
    const addedPlaceIds = new Set();
    tripData.itineraryDays.forEach((day) => {
      if (day.activities) {
        day.activities.forEach((activity) => {
          if (
            activity.placeDetails?.photos &&
            !addedPlaceIds.has(activity.placeDetails.id)
          ) {
            addedPlaceIds.add(activity.placeDetails.id);
            activity.placeDetails.photos.forEach((photo) => {
              if (photo.url_medium) {
                images.push(getFullImageUrl(photo.url_medium));
              }
            });
          }
        });
      }
    });
  }

  const durationDays = tripData.itineraryDays
    ? tripData.itineraryDays.length
    : 0;

  // Extract cities with IDs
  const { City, Country } = require("../models/sequelize");
  const { Op } = require("sequelize");
  const cityMap = new Map();

  // Add main destination city
  const destination = tripData.destination || "";
  const destCityName = destination.split(",")[0].trim();
  if (destCityName) {
    cityMap.set(destCityName.toLowerCase(), { name: destination, id: null });
  }

  // Add cities from itinerary activities
  if (tripData.itineraryDays) {
    tripData.itineraryDays.forEach((day) => {
      if (day.activities) {
        day.activities.forEach((activity) => {
          const location =
            activity.location || activity.placeDetails?.address || "";
          const parts = location.split(",");
          if (parts.length > 0) {
            const cityName = parts[0].trim();
            if (cityName) {
              cityMap.set(cityName.toLowerCase(), {
                name: location,
                id: null,
              });
            }
          }
        });
      }
    });
  }

  // Look up city IDs from database
  const cityNames = Array.from(cityMap.keys());
  if (cityNames.length > 0) {
    const cities = await City.findAll({
      where: {
        name: {
          [Op.in]: cityNames.map(
            (name) => name.charAt(0).toUpperCase() + name.slice(1)
          ),
        },
      },
      attributes: ["id", "name"],
      include: [
        {
          model: Country,
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

  const citiesWithIds = Array.from(cityMap.values());

  return {
    id: tripData.id,
    title: tripData.title,
    destination: tripData.destination,
    description: tripData.description,
    duration: tripData.duration,
    duration_days: durationDays,
    budget: tripData.budget,
    transportation: tripData.transportation,
    accommodation: tripData.accommodation,
    best_time_to_visit: tripData.best_time_to_visit,
    difficulty_level: tripData.difficulty_level,
    trip_type: tripData.trip_type,
    images: images,
    destination_lat: tripData.destination_lat,
    destination_lng: tripData.destination_lng,
    is_public: tripData.is_public,
    is_featured: tripData.is_featured,
    likes: tripData.likes_count,
    views: tripData.views_count,
    steals: derivationsCount,
    created_at: tripData.created_at,
    updated_at: tripData.updated_at,
    created_by: tripData.author?.id || null,
    author_name:
      tripData.author?.preferred_name || tripData.author?.full_name || null,
    author_photo: getFullImageUrl(tripData.author?.photo_url) || null,
    author_email: tripData.author?.email || null,
    author_bio: tripData.author?.bio || null,
    tags: tripData.tags ? tripData.tags.map((t) => t.tag) : [],
    locations: citiesWithIds.map((c) => c.name),
    cities: citiesWithIds,
    itinerary: tripData.itineraryDays
      ? tripData.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          places: day.activities
            ? day.activities
                .filter((a) => a.placeDetails)
                .map((a) => ({
                  name: a.placeDetails.name,
                  address: a.placeDetails.address,
                  rating: a.placeDetails.rating
                    ? parseFloat(a.placeDetails.rating)
                    : null,
                  price_level: a.placeDetails.price_level,
                  types: [],
                  description: a.description || "",
                  photo: a.placeDetails.photos?.[0]
                    ? getFullImageUrl(a.placeDetails.photos[0].url_medium)
                    : null,
                }))
            : [],
          activities: day.activities
            ? day.activities.map((a) => ({
                time: a.time,
                name: a.name,
                latitude: a.latitude,
                longitude: a.longitude,
                location: a.location,
                description: a.description,
                activity_order: a.activity_order,
                place_id: a.place_id,
                placeDetails: a.placeDetails
                  ? {
                      id: a.placeDetails.id,
                      google_place_id: a.placeDetails.google_place_id,
                      name: a.placeDetails.name,
                      address: a.placeDetails.address,
                      latitude: a.placeDetails.latitude,
                      longitude: a.placeDetails.longitude,
                      rating: a.placeDetails.rating
                        ? parseFloat(a.placeDetails.rating)
                        : null,
                      user_ratings_total: a.placeDetails.user_ratings_total,
                      price_level: a.placeDetails.price_level,
                    }
                  : null,
              }))
            : [],
        }))
      : [],
    comments: tripData.comments
      ? tripData.comments.map((c) => ({
          id: c.id,
          comment: c.comment,
          created_at: c.created_at,
          commenter: c.commenter
            ? {
                id: c.commenter.id,
                name: c.commenter.preferred_name || c.commenter.full_name,
                photo: c.commenter.photo_url,
              }
            : null,
        }))
      : [],
  };
}

const getTripLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count, rows: likes } = await TripLike.findAndCountAll({
      where: { trip_id: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "displayName", "avatar"],
        },
      ],
      limit: limitNum,
      offset,
      order: [["created_at", "DESC"]],
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, count);
    res.json(buildSuccessResponse(likes, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    // Reviews will need their own Sequelize model, for now return empty array
    const reviews = [];
    const total = 0;
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripDerivations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count, rows: steals } = await TripSteal.findAndCountAll({
      where: { original_trip_id: id },
      include: [
        {
          model: Trip,
          as: "newTrip",
          attributes: ["id", "title", "cover_image"],
        },
        {
          model: User,
          as: "newUser",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      limit: limitNum,
      offset,
      order: [["created_at", "DESC"]],
    });

    const formattedSteals = steals.map((steal) => ({
      id: steal.id,
      original_trip_id: steal.original_trip_id,
      new_trip_id: steal.new_trip_id,
      new_trip_title: steal.newTrip?.title,
      new_trip_cover: steal.newTrip?.cover_image,
      stolen_by: steal.newUser?.id,
      stolen_by_name: steal.newUser?.preferred_name || steal.newUser?.full_name,
      stolen_by_photo: steal.newUser?.photo_url,
      created_at: steal.created_at,
    }));

    const pagination = buildPaginationMeta(pageNum, limitNum, count);
    res.json(buildSuccessResponse(formattedSteals, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI review for a trip (returns first AI review if exists)
 * GET /v1/trips/:tripId/reviews/ai
 */
const getTripAiReview = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "tripId is required"));
    }

    // Find the AI review for this trip
    const aiReview = await TripReview.findOne({
      where: {
        trip_id: tripId,
        is_ai_generated: true,
      },
      attributes: ["id", "trip_id", "rating", "comment", "created_at"],
    });

    if (!aiReview) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "No AI review found for this trip")
        );
    }

    return res.json(
      buildSuccessResponse(
        {
          id: aiReview.id,
          trip_id: aiReview.trip_id,
          rating: aiReview.rating,
          text: aiReview.comment,
          created_at: aiReview.created_at,
        },
        "AI review retrieved successfully"
      )
    );
  } catch (error) {
    console.error("[Get Trip AI Review] Error:", error);
    next(error);
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripLikes,
  getTripReviews,
  getTripDerivations,
  getTripAiReview,
};
