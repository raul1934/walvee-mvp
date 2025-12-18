const { TripLike, Trip, User } = require("../models/sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count: total, rows: likes } = await TripLike.findAndCountAll({
      where: { liker_id: userId },
      include: [
        {
          model: Trip,
          attributes: ["id", "title", "cover_image", "destination"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(likes, pagination));
  } catch (error) {
    next(error);
  }
};

const likeTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.body;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    const existingLike = await TripLike.findOne({
      where: { trip_id: tripId, liker_id: userId },
    });

    if (existingLike) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "Trip already liked"));
    }

    const like = await TripLike.create({
      trip_id: tripId,
      liker_id: userId,
    });

    // Update trip likes count
    await trip.increment("likes_count");

    // Update trip author's likes received metric
    const author = await User.findByPk(trip.author_id);
    if (author) {
      await author.increment("metrics_likes_received");
    }

    res.status(201).json(buildSuccessResponse(like));
  } catch (error) {
    next(error);
  }
};

const unlikeTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const like = await TripLike.findByPk(id);

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

    const trip = await Trip.findByPk(like.trip_id);

    await like.destroy();

    // Update trip likes count
    if (trip && trip.likes_count > 0) {
      await trip.decrement("likes_count");
    }

    // Update trip author's likes received metric
    if (trip) {
      const author = await User.findByPk(trip.author_id);
      if (author && author.metrics_likes_received > 0) {
        await author.decrement("metrics_likes_received");
      }
    }

    res.json(buildSuccessResponse({ message: "Trip unliked successfully" }));
  } catch (error) {
    next(error);
  }
};

const checkLikeStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const like = await TripLike.findOne({
      where: { trip_id: tripId, liker_id: userId },
    });

    res.json(
      buildSuccessResponse({
        liked: !!like,
        likeId: like ? like.id : null,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserFavorites,
  likeTrip,
  unlikeTrip,
  checkLikeStatus,
};
