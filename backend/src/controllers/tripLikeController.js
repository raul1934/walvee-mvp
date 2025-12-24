const {
  TripLike,
  Trip,
  User,
  TripImage,
  PlacePhoto,
  CityPhoto,
  sequelize,
} = require("../models/sequelize");
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
          attributes: ["id", "title"],
          include: [
            {
              model: TripImage,
              as: "images",
              attributes: [
                "id",
                "place_photo_id",
                "city_photo_id",
                "is_cover",
                "image_order",
              ],
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
              order: [["image_order", "ASC"]],
              limit: 1,
            },
          ],
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
      // Idempotent: if already liked, return existing like as success (200)
      return res.json(buildSuccessResponse(existingLike, "Already liked"));
    }

    try {
      // Create like and increment likes_count in a transaction to avoid
      // partially applied changes in race conditions.
      const like = await sequelize.transaction(async (t) => {
        const created = await TripLike.create(
          {
            trip_id: tripId,
            liker_id: userId,
          },
          { transaction: t }
        );

        // Note: likes_count column is being removed in favor of a derived count
        // from the trip_likes table. We do NOT update trips.likes_count here.

        return created;
      });

      res.status(201).json(buildSuccessResponse(like));
    } catch (error) {
      // Handle unique constraint / duplicate entry errors caused by races.
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        (error.original && error.original.code === "ER_DUP_ENTRY")
      ) {
        const existing = await TripLike.findOne({
          where: { trip_id: tripId, liker_id: userId },
        });

        // Return existing like as idempotent success
        return res.json(buildSuccessResponse(existing, "Already liked"));
      }

      throw error;
    }
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
      // Idempotent: if the like does not exist, treat as success (already unliked)
      return res.json(
        buildSuccessResponse({ message: "Trip already unliked" })
      );
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
    // Note: likes_count is now derived from trip_likes; no decrement necessary.

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
