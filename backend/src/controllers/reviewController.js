const { Review, Trip, User } = require("../models/sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getReviews = async (req, res, next) => {
  try {
    const { tripId, placeId, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const where = {};
    if (tripId) where.trip_id = tripId;
    if (placeId) where.place_id = placeId;

    const { count: total, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    res.json(buildSuccessResponse(review));
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const { tripId, placeId, rating, comment } = req.body;

    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return res
          .status(404)
          .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
      }
    }

    const review = await Review.create({
      trip_id: tripId,
      place_id: placeId,
      reviewer_id: reviewerId,
      rating,
      comment,
    });

    res.status(201).json(buildSuccessResponse(review));
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    if (review.reviewer_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to update this review"
          )
        );
    }

    await review.update(req.body);

    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });

    res.json(buildSuccessResponse(updatedReview));
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    if (review.reviewer_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this review"
          )
        );
    }

    await review.destroy();

    res.json(buildSuccessResponse({ message: "Review deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
