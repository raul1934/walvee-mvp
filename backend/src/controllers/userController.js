const { User, Trip, Follow } = require("../models/sequelize");
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
    const user = await UserModel.findById(id);

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
        { model: User, as: "author", attributes: ["id", "full_name", "preferred_name", "photo_url"] },
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
    const user = await UserModel.findById(id);

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

module.exports = {
  getUsers,
  getUserById,
  updateCurrentUser,
  getUserTrips,
  getUserStats,
};
