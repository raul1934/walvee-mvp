const {
  Trip,
  User,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getTrips = async (req, res) => {
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
          attributes: ["id", "full_name", "preferred_name", "photo_url", "email"],
        },
        {
          model: TripTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: TripPlace,
          as: "places",
          attributes: ["name", "address", "rating", "price_level", "types", "description"],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          attributes: ["id", "day_number", "title"],
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              attributes: ["time", "name", "location", "description", "activity_order"],
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
    const formattedTrips = trips.map((trip) => formatTripResponse(trip));

    const pagination = buildPaginationMeta(pageNum, limitNum, count);

    res.json(buildSuccessResponse(formattedTrips, pagination));
  } catch (error) {
    console.error("Get trips error:", error);
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch trips"));
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "full_name", "preferred_name", "photo_url", "email", "bio"],
        },
        {
          model: TripTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: TripPlace,
          as: "places",
          attributes: ["name", "address", "rating", "price_level", "types", "description"],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          attributes: ["id", "day_number", "title"],
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              attributes: ["time", "name", "location", "description", "activity_order"],
            },
          ],
          order: [["day_number", "ASC"]],
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

    res.json(buildSuccessResponse(formatTripResponse(trip)));
  } catch (error) {
    console.error("Get trip error:", error);
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch trip"));
  }
};

const createTrip = async (req, res) => {
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
      await TripTag.bulkCreate(
        tags.map((tag) => ({ trip_id: trip.id, tag }))
      );
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

    // Update user metrics
    await user.increment("metrics_trips");

    // Fetch the complete trip with associations
    const completeTripData = await Trip.findByPk(trip.id, {
      include: [
        { model: User, as: "author" },
        { model: TripTag, as: "tags" },
        { model: TripPlace, as: "places" },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
      ],
    });

    res.status(201).json(buildSuccessResponse(formatTripResponse(completeTripData)));
  } catch (error) {
    console.error("Create trip error:", error);
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to create trip"));
  }
};

const updateTrip = async (req, res) => {
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
      await TripPlace.bulkCreate(places.map((place) => ({ trip_id: id, ...place })));
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
        { model: TripPlace, as: "places" },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
      ],
    });

    res.json(buildSuccessResponse(formatTripResponse(updatedTrip)));
  } catch (error) {
    console.error("Update trip error:", error);
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to update trip"));
  }
};

const deleteTrip = async (req, res) => {
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

    // Update user metrics
    const user = await User.findByPk(userId);
    if (user.metrics_trips > 0) {
      await user.decrement("metrics_trips");
    }

    res.json(buildSuccessResponse({ message: "Trip deleted successfully" }));
  } catch (error) {
    console.error("Delete trip error:", error);
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to delete trip"));
  }
};

// Helper function to format trip response
function formatTripResponse(trip) {
  const tripData = trip.toJSON();

  return {
    id: tripData.id,
    title: tripData.title,
    destination: tripData.destination,
    description: tripData.description,
    duration: tripData.duration,
    budget: tripData.budget,
    transportation: tripData.transportation,
    accommodation: tripData.accommodation,
    bestTimeToVisit: tripData.best_time_to_visit,
    difficultyLevel: tripData.difficulty_level,
    tripType: tripData.trip_type,
    coverImage: tripData.cover_image,
    destinationLat: tripData.destination_lat,
    destinationLng: tripData.destination_lng,
    isPublic: tripData.is_public,
    isFeatured: tripData.is_featured,
    likesCount: tripData.likes_count,
    viewsCount: tripData.views_count,
    createdAt: tripData.created_at,
    updatedAt: tripData.updated_at,
    author: tripData.author
      ? {
          id: tripData.author.id,
          name: tripData.author.full_name,
          preferredName: tripData.author.preferred_name,
          photo: tripData.author.photo_url,
          email: tripData.author.email,
          bio: tripData.author.bio,
        }
      : null,
    tags: tripData.tags ? tripData.tags.map((t) => t.tag) : [],
    places: tripData.places || [],
    itinerary: tripData.itineraryDays
      ? tripData.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          activities: day.activities || [],
        }))
      : [],
  };
}

const getTripLikes = async (req, res) => {
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
    console.error("Error fetching trip likes:", error);
    res.status(500).json(buildErrorResponse("Failed to fetch trip likes"));
  }
};

const getTripReviews = async (req, res) => {
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
    console.error("Error fetching trip reviews:", error);
    res.status(500).json(buildErrorResponse("Failed to fetch trip reviews"));
  }
};

const getTripDerivations = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    // Trip derivations will need their own Sequelize model, for now return empty array
    const derivations = [];
    const total = 0;
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(derivations, pagination));
  } catch (error) {
    console.error("Error fetching trip derivations:", error);
    res
      .status(500)
      .json(buildErrorResponse("Failed to fetch trip derivations"));
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
};
