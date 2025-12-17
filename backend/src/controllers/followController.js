const { Follow, User } = require("../models/sequelize");
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
      include: [{ model: User, as: "follower", attributes: ["id", "full_name", "preferred_name", "photo_url"] }],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });

    const followers = follows.map(f => f.follower);
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
      include: [{ model: User, as: "followee", attributes: ["id", "full_name", "preferred_name", "photo_url"] }],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });

    const following = follows.map(f => f.followee);
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
      followee_email: followee.email,
    });

    // Update metrics
    const follower = await User.findByPk(followerId);
    await follower.increment("metrics_following");
    await followee.increment("metrics_followers");

    res.status(201).json(buildSuccessResponse(follow));
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;

    const follow = await Follow.findByPk(id);

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

    if (follow.follower_id !== followerId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to unfollow"
          )
        );
    }

    await follow.destroy();

    // Update metrics
    const follower = await User.findByPk(followerId);
    const followee = await User.findByPk(follow.followee_id);

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

const checkFollowStatus = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const follow = await Follow.findOne({
      where: { follower_id: followerId, followee_id: userId },
    });

    res.json(
      buildSuccessResponse({
        following: !!follow,
        followId: follow ? follow.id : null,
      })
    );
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
};
