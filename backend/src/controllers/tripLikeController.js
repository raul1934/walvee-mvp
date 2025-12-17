const TripLikeModel = require("../models/TripLike");
const TripModel = require("../models/Trip");
const UserModel = require("../models/User");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const likes = await TripLikeModel.findByLiker(userId, offset, limitNum);
    const total = await TripLikeModel.countByLiker(userId);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(likes, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch favorites")
      );
  }
};

const likeTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.body;

    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    const existingLike = await TripLikeModel.findByTripAndLiker(tripId, userId);

    if (existingLike) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "Trip already liked"));
    }

    const like = await TripLikeModel.create(tripId, userId);

    // Update trip likes count
    await TripModel.incrementLikes(tripId);

    // Update trip author's likes received metric
    const author = await UserModel.findById(trip.created_by);
    if (author) {
      await UserModel.updateMetrics(author.id, {
        likesReceived: author.metrics_likes_received + 1,
      });
    }

    res.status(201).json(buildSuccessResponse(like));
  } catch (error) {
    res
      .status(500)
      .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to like trip"));
  }
};

const unlikeTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const like = await TripLikeModel.findById(id);

    if (!like) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Like not found"));
    }

    if (like.liker_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to unlike this trip"
          )
        );
    }

    const trip = await TripModel.findById(like.trip_id);

    await TripLikeModel.delete(id);

    // Update trip likes count
    await TripModel.decrementLikes(like.trip_id);

    // Update trip author's likes received metric
    if (trip) {
      const author = await UserModel.findById(trip.created_by);
      if (author) {
        await UserModel.updateMetrics(author.id, {
          likesReceived: Math.max(0, author.metrics_likes_received - 1),
        });
      }
    }

    res.json(buildSuccessResponse({ message: "Trip unliked successfully" }));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to unlike trip")
      );
  }
};

const checkLikeStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const like = await TripLikeModel.findByTripAndLiker(tripId, userId);

    res.json(
      buildSuccessResponse({
        liked: !!like,
        likeId: like ? like.id : null,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to check like status"
        )
      );
  }
};

module.exports = {
  getUserFavorites,
  likeTrip,
  unlikeTrip,
  checkLikeStatus,
};
