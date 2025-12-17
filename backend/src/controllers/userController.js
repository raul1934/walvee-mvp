const UserModel = require("../models/User");
const TripModel = require("../models/Trip");
const FollowModel = require("../models/Follow");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getUsers = async (req, res) => {
  try {
    const {
      page,
      limit,
      sortBy = "created_at",
      order = "desc",
      search = "",
    } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const users = await UserModel.findAll({
      offset,
      limit: limitNum,
      sortBy,
      order,
      search,
    });

    const total = await UserModel.count(search);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(users, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch users")
      );
  }
};

const getUserById = async (req, res) => {
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
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch user")
      );
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await UserModel.update(userId, updateData);

    res.json(buildSuccessResponse(user));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to update user")
      );
  }
};

const getUserTrips = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const trips = await TripModel.findAll({
      offset,
      limit: limitNum,
      createdBy: id,
    });

    const total = await TripModel.count({ createdBy: id });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(trips, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to fetch user trips"
        )
      );
  }
};

const getUserStats = async (req, res) => {
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
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to fetch user stats"
        )
      );
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateCurrentUser,
  getUserTrips,
  getUserStats,
};
