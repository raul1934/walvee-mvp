const {
  User,
  Trip,
  Follow,
  City,
  Country,
  CityPhoto,
  Place,
  PlacePhoto,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
  TripImage,
} = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const { addUserContext } = require("../utils/userContext");
const {
  INCLUDE_AUTHOR_FULL,
  INCLUDE_TRIP_CITIES,
  INCLUDE_PLACE_FULL,
} = require("./includes");

const getUsers = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy = "created_at",
      order = "desc",
      search = "",
    } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { preferred_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count: total, rows: users } = await User.findAndCountAll({
      where,
      offset,
      limit: limitNum,
      order: [[sortBy, order.toUpperCase()]],
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(users, pagination));
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Add dynamic counts
    const followers_count = await Follow.count({
      where: { followee_id: id },
    });

    const following_count = await Follow.count({
      where: { follower_id: id },
    });

    const trips_count = await Trip.count({
      where: { author_id: id, is_draft: false },
    });

    const userObj = user.toJSON();

    // Include nested city object when available for frontend convenience
    if (userObj.city_id) {
      const city = await City.findByPk(userObj.city_id, {
        include: [
          { model: require("../models/sequelize").Country, as: "country" },
        ],
      });

      if (city) {
        userObj.city = {
          id: city.id,
          name: city.name,
          country: city.country ? city.country.name : null,
        };
        // Keep legacy fields for backward compatibility
        userObj.city_name = city.name;
        userObj.country = city.country ? city.country.name : userObj.country;
      }
    }
    userObj.followers_count = followers_count;
    userObj.following_count = following_count;
    userObj.trips_count = trips_count;

    res.json(buildSuccessResponse(userObj));
  } catch (error) {
    next(error);
  }
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Validate city_id if provided to avoid integer/UUID mismatch errors
    if (Object.prototype.hasOwnProperty.call(updateData, "city_id")) {
      if (!updateData.city_id) {
        // Allow clearing the city
        updateData.city_id = null;
      } else {
        const city = await City.findByPk(updateData.city_id);
        if (!city) {
          return res
            .status(400)
            .json(buildErrorResponse("INVALID_CITY_ID", "City not found"));
        }
        // city exists; ensure we store the canonical id (UUID)
        updateData.city_id = city.id;
      }
    }

    await user.update(updateData);

    res.json(buildSuccessResponse(user));
  } catch (error) {
    next(error);
  }
};

const getUserTrips = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy = "created_at", order = "desc" } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count: total, rows: trips } = await Trip.findAndCountAll({
      where: { author_id: id },
      offset,
      limit: limitNum,
      order: [[sortBy, order.toUpperCase()]],
      include: [
        INCLUDE_AUTHOR_FULL,
        INCLUDE_TRIP_CITIES,
        {
          model: TripTag,
          as: "tags",
          attributes: ["id", "tag"],
        },
        {
          model: TripPlace,
          as: "places",
          separate: true,
          include: [INCLUDE_PLACE_FULL],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          separate: true,
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [INCLUDE_PLACE_FULL],
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
              attributes: ["id", "url"],
            },
            {
              model: CityPhoto,
              as: "cityPhoto",
              attributes: ["id", "url"],
            },
          ],
          order: [["image_order", "ASC"]],
        },
      ],
    });

    // Add user context (currentUserLiked, currentUserFollowing)
    const tripsWithContext = await addUserContext(trips, req.user?.id, {
      includeLikes: true,
      includeFollows: true,
    });

    // Format trips to include trip_images with full structure
    const formattedTrips = tripsWithContext.map((trip) => {
      const tripData = trip.toJSON ? trip.toJSON() : trip;

      // Calculate duration_days from itinerary
      const durationDays = tripData.itineraryDays ? tripData.itineraryDays.length : 0;
      tripData.duration_days = durationDays;

      // Transform itineraryDays to itinerary for consistency with homeController
      if (tripData.itineraryDays) {
        tripData.itinerary = tripData.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          description: day.description,
          places: day.activities
            ? day.activities
                .filter((a) => a.place)
                .map((a) => ({
                  name: a.place.name,
                  address: a.place.address,
                  rating: a.place.rating ? parseFloat(a.place.rating) : null,
                  price_level: a.place.price_level,
                  types: a.place.types || [],
                  description: a.description || "",
                  photo: a.place.photos?.[0]?.url || null,
                }))
            : [],
        }));
        delete tripData.itineraryDays;
      }

      // Transform images array to trip_images with full structure
      if (tripData.images && Array.isArray(tripData.images)) {
        tripData.trip_images = tripData.images
          .map((img) => ({
            id: img.id,
            place_photo_id: img.place_photo_id,
            city_photo_id: img.city_photo_id,
            image_order: img.image_order,
            placePhoto: img.placePhoto ? { url: img.placePhoto.url } : null,
            cityPhoto: img.cityPhoto ? { url: img.cityPhoto.url } : null,
          }))
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0));

        // Remove old images field
        delete tripData.images;
      }

      return tripData;
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(formattedTrips, pagination));
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Calculate stats dynamically
    const followers_count = await Follow.count({
      where: { followee_id: id },
    });

    const following_count = await Follow.count({
      where: { follower_id: id },
    });

    const trips_count = await Trip.count({
      where: { author_id: id, is_draft: false },
    });

    const likesReceived = await TripLike.count({
      include: [
        {
          model: Trip,
          as: "trip",
          where: { author_id: id, is_draft: false },
          required: true,
        },
      ],
    });

    const stats = {
      followers: followers_count,
      following: following_count,
      trips: trips_count,
      likesReceived: likesReceived,
    };

    res.json(buildSuccessResponse(stats));
  } catch (error) {
    next(error);
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      city_id,
      preferred_name,
      bio,
      instagram_username,
      birth_date,
      gender,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Verify city exists if provided
    if (city_id) {
      const city = await City.findByPk(city_id);
      if (!city) {
        return res
          .status(404)
          .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
      }
    }

    // Require birth_date and gender during onboarding
    if (!birth_date || !gender) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "VALIDATION_ERROR",
            "birth_date and gender are required"
          )
        );
    }

    // Validate birth_date - expect YYYY-MM-DD and minimum age 13
    if (birth_date) {
      const dob = new Date(birth_date);
      if (isNaN(dob.getTime())) {
        return res
          .status(400)
          .json(
            buildErrorResponse("VALIDATION_ERROR", "Invalid birth_date format")
          );
      }
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 13) {
        return res
          .status(400)
          .json(
            buildErrorResponse(
              "VALIDATION_ERROR",
              "User must be at least 13 years old"
            )
          );
      }
    }

    // Validate gender (if provided)
    const allowedGenders = [
      "male",
      "female",
      "non-binary",
      "other",
      "prefer-not-to-say",
    ];
    if (gender !== undefined && gender !== null && gender !== "") {
      if (!allowedGenders.includes(gender)) {
        return res
          .status(400)
          .json(buildErrorResponse("VALIDATION_ERROR", "Invalid gender value"));
      }
    }

    // Update user with onboarding data
    const updates = {
      city_id,
      preferred_name: preferred_name || user.preferred_name,
      bio: bio || user.bio,
      instagram_username: instagram_username || user.instagram_username,
      onboarding_completed: true,
    };

    if (birth_date) updates.birth_date = birth_date;
    if (gender) updates.gender = gender;

    await user.update(updates);

    // Fetch updated user with city data
    const updatedUser = await User.findByPk(userId, {
      include: [
        {
          model: City,
          as: "city",
          include: [
            { model: require("../models/sequelize").Country, as: "country" },
          ],
        },
      ],
    });

    res.json(buildSuccessResponse(updatedUser));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateCurrentUser,
  getUserTrips,
  getUserStats,
  completeOnboarding,
};
