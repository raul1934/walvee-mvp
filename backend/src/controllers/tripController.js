const {
  Trip,
  User,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
  TripSteal,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
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
              ],
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
        { model: TripPlace, as: "places" },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
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

    // Update user metrics
    const user = await User.findByPk(userId);
    if (user.metrics_trips > 0) {
      await user.decrement("metrics_trips");
    }

    res.json(buildSuccessResponse({ message: "Trip deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

// Helper function to format trip response
async function formatTripResponse(trip) {
  const tripData = trip.toJSON();

  // Count steals from trip_steals table
  const stealsCount = await TripSteal.count({
    where: { original_trip_id: tripData.id },
  });

  return {
    id: tripData.id,
    title: tripData.title,
    destination: tripData.destination,
    description: tripData.description,
    duration: tripData.duration,
    budget: tripData.budget,
    transportation: tripData.transportation,
    accommodation: tripData.accommodation,
    best_time_to_visit: tripData.best_time_to_visit,
    difficulty_level: tripData.difficulty_level,
    trip_type: tripData.trip_type,
    cover_image: tripData.cover_image,
    destination_lat: tripData.destination_lat,
    destination_lng: tripData.destination_lng,
    is_public: tripData.is_public,
    is_featured: tripData.is_featured,
    likes: tripData.likes_count,
    views: tripData.views_count,
    steals: stealsCount,
    created_at: tripData.created_at,
    updated_at: tripData.updated_at,
    created_by: tripData.author?.id || null,
    author_name:
      tripData.author?.preferred_name || tripData.author?.full_name || null,
    author_photo: tripData.author?.photo_url || null,
    author_email: tripData.author?.email || null,
    author_bio: tripData.author?.bio || null,
    tags: tripData.tags ? tripData.tags.map((t) => t.tag) : [],
    itinerary: tripData.itineraryDays
      ? tripData.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          places: tripData.places
            ? tripData.places.map((p) => ({
                name: p.name,
                address: p.address,
                rating: p.rating ? parseFloat(p.rating) : null,
                price_level: p.price_level,
                types: p.types,
                description: p.description,
              }))
            : [],
          activities: day.activities
            ? day.activities.map((a) => ({
                time: a.time,
                name: a.name,
                location: a.location,
                description: a.description,
                activity_order: a.activity_order,
              }))
            : [],
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
      stolen_by_name:
        steal.newUser?.preferred_name || steal.newUser?.full_name,
      stolen_by_photo: steal.newUser?.photo_url,
      created_at: steal.created_at,
    }));

    const pagination = buildPaginationMeta(pageNum, limitNum, count);
    res.json(buildSuccessResponse(formattedSteals, pagination));
  } catch (error) {
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
};
