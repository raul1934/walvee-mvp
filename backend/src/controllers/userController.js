const { User, Trip, Follow, City } = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

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

    res.json(buildSuccessResponse(user));
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
    await user.update(updateData);

    res.json(buildSuccessResponse(user));
  } catch (error) {
    next(error);
  }
};

const getUserTrips = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count: total, rows: trips } = await Trip.findAndCountAll({
      where: { author_id: id },
      offset,
      limit: limitNum,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(trips, pagination));
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

    const stats = {
      followers: user.metrics_followers || 0,
      following: user.metrics_following || 0,
      trips: user.metrics_trips || 0,
      likesReceived: user.metrics_likes_received || 0,
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
          as: "cityData",
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
