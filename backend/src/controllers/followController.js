const FollowModel = require("../models/Follow");
const UserModel = require("../models/User");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const followers = await FollowModel.findFollowers(userId, offset, limitNum);
    const total = await FollowModel.countFollowers(userId);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(followers, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch followers")
      );
  }
};

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const following = await FollowModel.findFollowing(userId, offset, limitNum);
    const total = await FollowModel.countFollowing(userId);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(following, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch following")
      );
  }
};

const followUser = async (req, res) => {
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

    const followee = await UserModel.findById(followeeId);

    if (!followee) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    const existingFollow = await FollowModel.findByFollowerAndFollowee(
      followerId,
      followeeId
    );

    if (existingFollow) {
      return res
        .status(400)
        .json(
          buildErrorResponse("VALIDATION_ERROR", "Already following this user")
        );
    }

    const follow = await FollowModel.create(
      followerId,
      followeeId,
      followee.email
    );

    // Update metrics
    const follower = await UserModel.findById(followerId);
    await UserModel.updateMetrics(followerId, {
      following: follower.metrics_following + 1,
    });
    await UserModel.updateMetrics(followeeId, {
      followers: followee.metrics_followers + 1,
    });

    res.status(201).json(buildSuccessResponse(follow));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to follow user")
      );
  }
};

const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;

    const follow = await FollowModel.findById(id);

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

    await FollowModel.delete(id);

    // Update metrics
    const follower = await UserModel.findById(followerId);
    const followee = await UserModel.findById(follow.followee_id);

    if (follower) {
      await UserModel.updateMetrics(followerId, {
        following: Math.max(0, follower.metrics_following - 1),
      });
    }

    if (followee) {
      await UserModel.updateMetrics(follow.followee_id, {
        followers: Math.max(0, followee.metrics_followers - 1),
      });
    }

    res.json(buildSuccessResponse({ message: "User unfollowed successfully" }));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to unfollow user")
      );
  }
};

const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const follow = await FollowModel.findByFollowerAndFollowee(
      followerId,
      userId
    );

    res.json(
      buildSuccessResponse({
        following: !!follow,
        followId: follow ? follow.id : null,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to check follow status"
        )
      );
  }
};

module.exports = {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  checkFollowStatus,
};
