const {
  Trip,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripSteal,
  User,
  TripImage,
  PlacePhoto,
  CityPhoto,
} = require("../models/sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getDerivations = async (req, res, next) => {
  try {
    const { originalTripId, creatorId, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const where = {};
    if (originalTripId) where.original_trip_id = originalTripId;
    if (creatorId) where.new_user_id = creatorId;

    const { count: total, rows: derivations } = await TripSteal.findAndCountAll(
      {
        where,
        include: [
          {
            model: Trip,
            as: "originalTrip",
            attributes: ["id", "title"],
            include: [
              {
                model: TripImage,
                as: "images",
                attributes: ["id", "place_photo_id", "city_photo_id", "is_cover"],
                include: [
                  {
                    model: PlacePhoto,
                    as: "placePhoto",
                    attributes: ["url_small", "url_medium", "url_large"],
                  },
                  {
                    model: CityPhoto,
                    as: "cityPhoto",
                    attributes: ["url_small", "url_medium", "url_large"],
                  },
                ],
                where: { is_cover: true },
                required: false,
                limit: 1,
              },
            ],
          },
          {
            model: Trip,
            as: "newTrip",
            attributes: ["id", "title"],
            include: [
              {
                model: TripImage,
                as: "images",
                attributes: ["id", "place_photo_id", "city_photo_id", "is_cover"],
                include: [
                  {
                    model: PlacePhoto,
                    as: "placePhoto",
                    attributes: ["url_small", "url_medium", "url_large"],
                  },
                  {
                    model: CityPhoto,
                    as: "cityPhoto",
                    attributes: ["url_small", "url_medium", "url_large"],
                  },
                ],
                where: { is_cover: true },
                required: false,
                limit: 1,
              },
            ],
          },
          {
            model: User,
            as: "originalUser",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
          {
            model: User,
            as: "newUser",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
        ],
        offset,
        limit: limitNum,
        order: [["created_at", "DESC"]],
      }
    );

    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(derivations, pagination));
  } catch (error) {
    next(error);
  }
};

const createDerivation = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { originalTripId } = req.body;

    const originalTrip = await Trip.findByPk(originalTripId);

    if (!originalTrip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("RESOURCE_NOT_FOUND", "Original trip not found")
        );
    }

    if (originalTrip.author_id === creatorId) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "VALIDATION_ERROR",
            "You cannot steal your own trip"
          )
        );
    }

    // Fetch the original trip with all relationships using Sequelize
    const originalTripFull = await Trip.findByPk(originalTripId, {
      include: [
        { model: TripTag, as: "tags" },
        { model: TripPlace, as: "places" },
        {
          model: require("../models/sequelize").City,
          as: "cities",
          through: { attributes: ["city_order"], timestamps: false },
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
        {
          model: TripImage,
          as: "images",
          attributes: ["place_photo_id", "city_photo_id", "is_cover", "image_order"],
        },
      ],
    });

    if (!originalTripFull) {
      return res
        .status(404)
        .json(
          buildErrorResponse("RESOURCE_NOT_FOUND", "Original trip not found")
        );
    }

    // Clone the trip for the new user
    const clonedTrip = await Trip.create({
      title: `${originalTripFull.title} (Copy)`,
      description: originalTripFull.description,
      duration: originalTripFull.duration,
      budget: originalTripFull.budget,
      transportation: originalTripFull.transportation,
      accommodation: originalTripFull.accommodation,
      best_time_to_visit: originalTripFull.best_time_to_visit,
      difficulty_level: originalTripFull.difficulty_level,
      trip_type: originalTripFull.trip_type,
      destination_lat: originalTripFull.destination_lat,
      destination_lng: originalTripFull.destination_lng,
      is_public: false, // New trip is private by default
      author_id: creatorId,
    });

    const clonedTripId = clonedTrip.id;

    // Clone explicit cities if present
    if (originalTripFull.cities && originalTripFull.cities.length > 0) {
      for (let i = 0; i < originalTripFull.cities.length; i++) {
        const c = originalTripFull.cities[i];
        await Trip.sequelize.query(
          "INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at) VALUES (?, ?, ?, ?, NOW())",
          { replacements: [require("uuid").v4(), clonedTripId, c.id, i] }
        );
      }
      // No `destination_city_id` update needed; use `trip_cities` as source of truth
    }

    // Clone tags
    if (originalTripFull.tags && originalTripFull.tags.length > 0) {
      await TripTag.bulkCreate(
        originalTripFull.tags.map((tag) => ({
          trip_id: clonedTripId,
          tag: tag.tag,
        }))
      );
    }

    // Clone places
    if (originalTripFull.places && originalTripFull.places.length > 0) {
      await TripPlace.bulkCreate(
        originalTripFull.places.map((place) => ({
          trip_id: clonedTripId,
          name: place.name,
          address: place.address,
          rating: place.rating,
          price_level: place.price_level,
          types: place.types,
          description: place.description,
        }))
      );
    }

    // Clone itinerary with activities
    if (
      originalTripFull.itineraryDays &&
      originalTripFull.itineraryDays.length > 0
    ) {
      for (const day of originalTripFull.itineraryDays) {
        const clonedDay = await TripItineraryDay.create({
          trip_id: clonedTripId,
          day_number: day.day_number,
          title: day.title,
        });

        if (day.activities && day.activities.length > 0) {
          await TripItineraryActivity.bulkCreate(
            day.activities.map((activity) => ({
              itinerary_day_id: clonedDay.id,
              time: activity.time,
              name: activity.name,
              location: activity.location,
              description: activity.description,
              activity_order: activity.activity_order,
            }))
          );
        }
      }
    }

    // Clone trip images
    if (originalTripFull.images && originalTripFull.images.length > 0) {
      await TripImage.bulkCreate(
        originalTripFull.images.map((img) => ({
          trip_id: clonedTripId,
          place_photo_id: img.place_photo_id,
          city_photo_id: img.city_photo_id,
          is_cover: img.is_cover,
          image_order: img.image_order,
        }))
      );
    }

    // Create trip steal record
    const tripSteal = await TripSteal.create({
      original_trip_id: originalTripId,
      new_trip_id: clonedTripId,
      original_user_id: originalTrip.author_id,
      new_user_id: creatorId,
    });

    res.status(201).json(
      buildSuccessResponse({
        steal: {
          id: tripSteal.id,
          original_trip_id: tripSteal.original_trip_id,
          new_trip_id: tripSteal.new_trip_id,
        },
        clonedTrip: {
          id: clonedTripId,
          title: clonedTrip.title,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

const deleteDerivation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const derivation = await TripSteal.findByPk(id);

    if (!derivation) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Derivation not found"));
    }

    if (derivation.new_user_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this derivation"
          )
        );
    }

    await derivation.destroy();

    res.json(
      buildSuccessResponse({ message: "Derivation deleted successfully" })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDerivations,
  createDerivation,
  deleteDerivation,
};
