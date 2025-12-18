const { Follow, User } = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count: total, rows: follows } = await Follow.findAndCountAll({
      where: { followee_id: userId },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });

    const followers = follows.map((f) => f.follower);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(followers, pagination));
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count: total, rows: follows } = await Follow.findAndCountAll({
      where: { follower_id: userId },
      include: [
        {
          model: User,
          as: "followee",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });

    const following = follows.map((f) => f.followee);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(following, pagination));
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { followeeId } = req.body;

    if (followerId === followeeId) {
      return res
        .status(400)
        .json(
          buildErrorResponse("VALIDATION_ERROR", "You cannot follow yourself")
        );
    }

    const followee = await User.findByPk(followeeId);

    if (!followee) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    const existingFollow = await Follow.findOne({
      where: { follower_id: followerId, followee_id: followeeId },
    });

    if (existingFollow) {
      return res
        .status(400)
        .json(
          buildErrorResponse("VALIDATION_ERROR", "Already following this user")
        );
    }

    const follow = await Follow.create({
      follower_id: followerId,
      followee_id: followeeId,
    });

    // Update metrics
    const follower = await User.findByPk(followerId);
    // keep metrics for backward compatibility, but rely on counts from user_follow
    await follower.increment("metrics_following");
    await followee.increment("metrics_followers");

    res.status(201).json(buildSuccessResponse(follow));
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    // Unfollow by specifying the target user id in the URL: DELETE /follows/:userId
    const followerId = req.user.id;
    const { userId } = req.params;

    const follow = await Follow.findOne({
      where: { follower_id: followerId, followee_id: userId },
    });

    if (!follow) {
      return res
        .status(404)
        .json(
          buildErrorResponse(
            "RESOURCE_NOT_FOUND",
            "Follow relationship not found"
          )
        );
    }

    await follow.destroy();

    // Update metrics (best effort)
    const follower = await User.findByPk(followerId);
    const followee = await User.findByPk(userId);

    if (follower && follower.metrics_following > 0) {
      await follower.decrement("metrics_following");
    }

    if (followee && followee.metrics_followers > 0) {
      await followee.decrement("metrics_followers");
    }

    res.json(buildSuccessResponse({ message: "User unfollowed successfully" }));
  } catch (error) {
    next(error);
  }
};

const listUserFollows = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const follows = await Follow.findAll({
      where: {
        [Op.or]: [{ follower_id: userId }, { followee_id: userId }],
      },
      attributes: [
        "id",
        "follower_id",
        "followee_id",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(buildSuccessResponse(follows));
  } catch (error) {
    next(error);
  }
};

const deleteFollowRecord = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    const follow = await Follow.findByPk(id);

    if (!follow) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Follow not found"));
    }

    // Only allow deletion if current user is either follower or followee
    if (
      follow.follower_id !== currentUserId &&
      follow.followee_id !== currentUserId
    ) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "Not allowed to delete this follow record"
          )
        );
    }

    // Capture ids for KPI adjustments
    const follower = await User.findByPk(follow.follower_id);
    const followee = await User.findByPk(follow.followee_id);

    await follow.destroy();

    // Adjust metrics (best effort)
    if (follower && follower.metrics_following > 0) {
      await follower.decrement("metrics_following");
    }

    if (followee && followee.metrics_followers > 0) {
      await followee.decrement("metrics_followers");
    }

    res.json(buildSuccessResponse({ id, deleted: true }));
  } catch (error) {
    next(error);
  }
};

const checkFollowStatus = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    // userId in route refers to the user being checked (followee)
    const follow = await Follow.findOne({
      where: { follower_id: followerId, followee_id: userId },
    });

    res.json(buildSuccessResponse({ following: !!follow }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  checkFollowStatus,
  listUserFollows,
  deleteFollowRecord,
};
